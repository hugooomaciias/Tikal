package com.tikal.api.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    /* --- Obtain user from the email --- */
    Optional<User> findByEmail(String email);
    
    /* --- To know if the user with a determined email is created yet --- */
    boolean existsByEmail(String email);

    /* --- Obtain user from the name --- */
    Optional<User> findByName(String name);

    /* --- To know if the user with a determined name is created yet --- */
    boolean existsByName(String name);

    /* --- Obtain a user which has the same email or the same name --- */
    Optional<User> findByEmailOrName(String email, String name);
}