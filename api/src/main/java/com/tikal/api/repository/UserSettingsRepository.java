package com.tikal.api.repository;

import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.User_Settings;

@Repository
public interface UserSettingsRepository extends JpaRepository<User_Settings, Integer> {
    /* --- Obtain the user Settings --- */
    Optional<User_Settings> findById(Integer id);
}
