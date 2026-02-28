package com.tikal.api.repository;

import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.UserSettings;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Integer> {
}
