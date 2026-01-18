package com.tikal.api.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

@Repository
public interface UserSettingsRepository extends JpaRepository<User_Settings, Integer> {
    /* --- Obtain the user Settings --- */
    Optional<User_Settings> findById(Integer id);
}
