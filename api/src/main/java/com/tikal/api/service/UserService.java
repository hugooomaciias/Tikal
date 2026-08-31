package com.tikal.api.service;

import com.tikal.api.config.CustomUserDetails;
import com.tikal.api.exception.ConflictException;
import com.tikal.api.exception.ResourceNotFoundException;
import com.tikal.api.exception.UnauthorizedException;
import com.tikal.api.model.dto.user.UpdateProfileRequest;
import com.tikal.api.model.dto.user.UserDTO;
import com.tikal.api.model.entity.RankList;
import com.tikal.api.model.entity.User;
import com.tikal.api.repository.RankListRepository;
import com.tikal.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final ImageUploadService imageUploadService;
    private final RankListRepository rankListRepository;

    /**
     * Retrieve the user making the current request based on their JWT token.
     */
    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("No authenticated user");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getUser();
        }

        throw new UnauthorizedException("Invalid principal type");
    }

    /**
     * Save a user with the next rank
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public User upgradeUserRank (User user) {
        Optional<RankList> newRankOpt = rankListRepository.findById(user.getCurrentRank().getId() + 1);

        newRankOpt.ifPresent(user::setCurrentRank);

        return userRepository.save(user);
    }

    /**
     * Convenient method for quickly retrieving only the ID
     */
    public Integer getAuthenticatedUserID() {
        return getAuthenticatedUser().getId();
    }

    public UserDTO getUser(Integer userId){
        var optUser = userRepository.findById(userId);
        if (optUser.isEmpty()){
            throw new ResourceNotFoundException("No se ha encontrado ningún usuario con esas credenciales");
        }
        var user = optUser.get();
        return getUserDTO(user);
    }

    public User getUserById(Integer userId){
        return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("user", userId));
    }

    /**
     * Updates the user's profile fields (name, email, avatarUrl).
     * Validates uniqueness of name and email (excluding the current user).
     */
    @Transactional
    public UserDTO updateProfile(Integer userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate and update name
        if (request.getName() != null && !request.getName().equals(user.getName())) {
            // Check if the new name is already taken by another user
            if (userRepository.existsByNameAndIdNot(request.getName(), userId)) {
                throw new ConflictException(
                        "Username '" + request.getName() + "' is already taken by another user",
                        "1. Data conflict"
                );
            }
            user.setName(request.getName());
        }

        // Validate and update email
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmailAndIdNot(request.getEmail(), userId)) {
                throw new ConflictException(
                        "Email '" + request.getEmail() + "' is already registered by another user",
                        "2. Data conflict"
                );
            }
            user.setEmail(request.getEmail());
        }

        if (request.getTikalTutorialCompleted() != null) user.setTikalTutorialCompleted(request.getTikalTutorialCompleted());

        User updatedUser = userRepository.save(user);
        return getUserDTO(updatedUser);
    }

    @Transactional
    public UserDTO updateAvatar(Integer userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (file != null) {
            String imageUrl = imageUploadService.uploadImage(file);
            user.setAvatarUrl(imageUrl);
        } else {
            user.setAvatarUrl("https://api.dicebear.com/10.x/glyphs/svg?glyphColor=3B7A57,2F6C4B,26563D,204533,1B392A,0E2018,2AB7CA,228498,226B7C,245866,224A57,11303B&seed=" + user.getName());
        }

        User updatedUser = userRepository.save(user);
        return getUserDTO(updatedUser);
    }

    public UserDTO getUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .currentRank(user.getCurrentRank().getId())
                .subscriptionPlan(user.getSubscriptionPlan())
                .tikalTutorialCompleted(user.getTikalTutorialCompleted())
                .rangeTitle(user.getCurrentRank().getAwardedTitle())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
