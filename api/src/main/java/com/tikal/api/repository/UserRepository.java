package com.tikal.api.repository;

import com.tikal.api.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    /* --- Obtain user from the email --- */
    Optional<User> findByEmail(String email);
    
    /* --- To know if the user with a determined email is created yet --- */
    boolean existsByEmail(String email);
}