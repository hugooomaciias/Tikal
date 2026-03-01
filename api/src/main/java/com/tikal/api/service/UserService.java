package com.tikal.api.service;

import com.tikal.api.exception.NotFoundUserException;
import com.tikal.api.model.dto.UserDTO;
import com.tikal.api.model.entity.User;
import com.tikal.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    /**
     * Retrieve the user making the current request based on their JWT token.
     */
    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("There is no authenticated user in the context.");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email).orElseThrow(NotFoundUserException::new);
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
            throw new NotFoundUserException();
        }
        var user = optUser.get();
        return getUserDTO(user);
    }

    public UserDTO getUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .currentRank(user.getCurrentRank().getId())
                .subscriptionPlan(user.getSubscriptionPlan())
                .rangeTitle(user.getCurrentRank().getAwardedTitle())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
