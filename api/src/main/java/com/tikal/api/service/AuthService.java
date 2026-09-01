package com.tikal.api.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.tikal.api.config.JwtService;
import com.tikal.api.exception.*;
import com.tikal.api.model.dto.auth.*;
import com.tikal.api.model.entity.PasswordResetOtp;
import com.tikal.api.model.entity.RefreshToken;
import com.tikal.api.model.entity.User;
import com.tikal.api.model.entity.enumerated.SubscriptionPlan;
import com.tikal.api.repository.PasswordResetOtpRepository;
import com.tikal.api.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.tikal.api.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.UUID;

/**
 * User register and user login
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final UserOnboardingService userOnboardingService;

    @Value("${google.client.id}")
    private String googleClientId;

    @Transactional
    public TokenResponse register (RegisterRequest request) {
        boolean existsByEmail = userRepository.existsByEmail(request.getEmail());
        boolean existsByName = userRepository.existsByName(request.getName());
        if (existsByName && existsByEmail) {
            throw new ConflictException(
                    "El correo electrónico '" + request.getEmail() + "' y el nombre de usuario '"
                            + request.getName() + "' ya están en uso.", "3. Data conflict");
        }
        if (existsByEmail) {
            throw new ConflictException(
                    "El email '" + request.getEmail() + "' ya existe en la plataforma", "2. Data conflict");
        }
        if (existsByName) {
            throw new ConflictException(
                    "El usuario con el nombre '" + request.getName()
                            + "' ya existe en la plataforma", "1 Data conflict");
        }

        SubscriptionPlan plan;
        try {
            plan = SubscriptionPlan.valueOf(request.getSubscriptionPlan().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BadRequestException("El plan '" + request.getSubscriptionPlan()
                    + "' no es valido. Los valores permitidos son: "
                    + Arrays.toString(SubscriptionPlan.values()));
        }
        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .subscriptionPlan(plan)
                .tikalTutorialCompleted(false)
                .avatarUrl("https://api.dicebear.com/10.x/glyphs/svg?glyphColor=3B7A57,2F6C4B,26563D,204533,1B392A,0E2018,2AB7CA,228498,226B7C,245866,224A57,11303B&seed=" + request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        saveUserToken(user, refreshToken);
        userOnboardingService.readyNewAccount(user, request.getLanguage(), request.getTimeZone());
        return new TokenResponse(jwtToken, refreshToken);
    }

    public TokenResponse login(LoginRequest request){
        User user = userRepository.findByEmailOrName(request.getIdentifier(), request.getIdentifier())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se ha encontrado ningún usuario con esas credenciales"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        request.getPassword()
                )
        );

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        saveUserToken(user, refreshToken);
        return TokenResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    public TokenResponse refreshToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid token format or missing header");
        }

        final String refreshTokenString = authHeader.substring(7);
        final String userEmail = jwtService.extractUsername(refreshTokenString);

        if (userEmail == null) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se ha encontrado ningún usuario con esas credenciales"));

        RefreshToken tokenInDb = tokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found in our records"));

        if (!jwtService.isTokenValid(refreshTokenString, user.getEmail())) {
            throw new UnauthorizedException("The refresh token signature is invalid");
        }

        var newAccessToken = jwtService.generateToken(user);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenString)
                .build();
    }

    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token is required to close session");
        }

        var storedToken = tokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("The token does not exist or has already been deleted"));

        tokenRepository.delete(storedToken);
    }

    @Transactional
    public void logoutAll(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token is required to close all sessions");
        }

        var storedToken = tokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("The token does not exist or has already been deleted"));

        User user = storedToken.getUser();

        tokenRepository.deleteByUser(user);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        var userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            return;
        }

        User user = userOptional.get();

        String otpCode = generateSecureOtp();
        PasswordResetOtp otpEntity = otpRepository.findById(user.getId())
                .orElse(new PasswordResetOtp());

        otpEntity.setUser(user);
        otpEntity.setOtpCode(otpCode);
        otpEntity.setExpirationDate(LocalDateTime.now().plusMinutes(8));

        otpRepository.save(otpEntity);

        emailService.sendPasswordResetOtp(user.getEmail(), otpCode);
    }

    public void verifyOtp(VerifyOtpRequest request) {
        PasswordResetOtp otpEntity = validateAndGetOtp(request.getEmail(), request.getOtpCode());
    }

    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetOtp otpEntity = validateAndGetOtp(request.getEmail(), request.getOtpCode());

        User user = otpEntity.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenRepository.deleteByUser(user);

        otpRepository.delete(otpEntity);
    }

    public TokenResponse loginWithGoogle(String idTokenString, String language, String timeZone) {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new UnauthorizedException("El token de Google no es válido, ha expirado o está manipulado.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setName(name);
                newUser.setEmail(email);
                newUser.setSubscriptionPlan(SubscriptionPlan.GRATUITO);
                newUser.setAvatarUrl(pictureUrl);

                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

                User savedUser = userRepository.save(newUser);

                userOnboardingService.readyNewAccount(savedUser, language, timeZone);

                return savedUser;
            });

            String accessToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            saveUserToken(user, refreshToken);

            return new TokenResponse(accessToken, refreshToken);
        } catch (Exception e) {
            throw new UnauthorizedException("Error en la autenticación con Google");
        }
    }

    // ==========================================
    // AUXILIARY METHODS
    // ==========================================
    private void saveUserToken(User user, String jwtToken) {
        var token = RefreshToken.builder()
                .user(user)
                .token(jwtToken)
                .build();
        tokenRepository.save(token);
    }

    private PasswordResetOtp validateAndGetOtp(String email, String otpCode) {
        PasswordResetOtp otpEntity = otpRepository.findByUserEmail(email)
                .orElseThrow(() -> new BadRequestException("No se ha solicitado ningún cambio de contraseña para este email."));

        if (!otpEntity.getOtpCode().equals(otpCode)) {
            throw new BadRequestException("El código introducido es incorrecto.");
        }

        if (otpEntity.isExpired()) {
            otpRepository.delete(otpEntity);
            throw new BadRequestException("El código ha caducado. Por favor, solicita uno nuevo.");
        }

        return otpEntity;
    }

    private String generateSecureOtp() {
        SecureRandom secureRandom = new SecureRandom();
        int otp = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(otp);
    }
}
