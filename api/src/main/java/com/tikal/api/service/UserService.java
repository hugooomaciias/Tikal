package com.tikal.api.service;

import com.tikal.api.config.CustomUserDetails;
import com.tikal.api.exception.ResourceNotFoundException;
import com.tikal.api.exception.UnauthorizedException;
import com.tikal.api.model.dto.UserDTO;
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

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
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
