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
    List<User> findByName(String name);

    /* --- Obtain user from the id --- */
    Optional<User> findById(Integer id);
}