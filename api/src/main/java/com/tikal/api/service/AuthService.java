package com.tikal.api.service;

import com.tikal.api.config.JwtService;
import com.tikal.api.exception.*;
import com.tikal.api.model.dto.auth.LoginRequest;
import com.tikal.api.model.dto.auth.RegisterRequest;
import com.tikal.api.model.dto.auth.TokenResponse;
import com.tikal.api.model.entity.RefreshToken;
import com.tikal.api.model.entity.User;
import com.tikal.api.model.entity.enumerated.SubscriptionPlan;
import com.tikal.api.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tikal.api.repository.UserRepository;

/**
 * User register and user login
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public TokenResponse register (RegisterRequest request) {
        boolean existsByEmail = userRepository.existsByEmail(request.getEmail());
        boolean existsByName = userRepository.existsByName(request.getName());
        if (existsByName && existsByEmail) {
            throw new EmailAndNameAlreadyExistsException(request.getEmail(), request.getName());
        }
        if (existsByEmail) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }
        if (existsByName) {
            throw new NameAlreadyExistsException(request.getName());
        }

        SubscriptionPlan plan;
        try {
            plan = SubscriptionPlan.valueOf(request.getSubscriptionPlan().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidUserPlanException(request.getSubscriptionPlan());
        }
        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .subscriptionPlan(plan)
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        saveUserToken(user, refreshToken);
        return new TokenResponse(jwtToken, refreshToken);
    }

    private void saveUserToken(User user, String jwtToken) {
        var token = RefreshToken.builder()
                .user(user)
                .token(jwtToken)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    public TokenResponse login(LoginRequest request){
        User user = userRepository.findByEmailOrName(request.getIdentifier(), request.getIdentifier())
                .orElseThrow(NotFoundUserException::new);

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
            throw new IllegalArgumentException("Invalid token format or missing header");
        }

        final String refreshTokenString = authHeader.substring(7);
        final String userEmail = jwtService.extractUsername(refreshTokenString);

        if (userEmail == null) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(NotFoundUserException::new);

        RefreshToken tokenInDb = tokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() -> new InvalidTokenException("Refresh token not found in our records"));

        if (tokenInDb.isRevoked() || tokenInDb.isExpired()) {
            throw new InvalidTokenException("The refresh token has expired or been revoked. Please log in again");
        }

        if (!jwtService.isTokenValid(refreshTokenString, user.getEmail())) {
            throw new InvalidTokenException("The refresh token signature is invalid");
        }

        var newAccessToken = jwtService.generateToken(user);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenString)
                .build();
    }

    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required to close session");
        }

        var storedToken = tokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new InvalidTokenException("The token does not exist or has already been deleted"));
        storedToken.setRevoked(true);
        storedToken.setExpired(true);
        tokenRepository.save(storedToken);
    }
}
