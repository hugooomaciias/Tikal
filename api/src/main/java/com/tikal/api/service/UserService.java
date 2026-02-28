package com.tikal.api.service;

import com.tikal.api.exception.NotFoundUserException;
import com.tikal.api.model.dto.UserDTO;
import com.tikal.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserDTO getUser(Integer userId){
        var optUser = userRepository.findById(userId);
        if (optUser.isEmpty()){
            throw new NotFoundUserException();
        }
        var user = optUser.get();
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
