package com.tikal.api.repository;

import com.tikal.api.model.entity.RefreshToken;
import com.tikal.api.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<RefreshToken, Integer> {
    /* --- Get tokens from the user with this id --- */
    List<RefreshToken> findByUserId(Integer UserId);

    /* --- Get the refresh token by its token string --- */
    Optional<RefreshToken> findByToken(String jwt);

    /* --- Delete all tokens for a specific user --- */
    void deleteByUser(User user);
}
