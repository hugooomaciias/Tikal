package com.tikal.api.repository;

import com.tikal.api.model.entity.PasswordResetOtp;
import com.tikal.api.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Integer> {

    // Spring Boot crea la consulta SQL automáticamente solo con leer el nombre del método
    Optional<PasswordResetOtp> findByUserEmail(String email);

    // Método para limpiar códigos antiguos cuando el usuario pide uno nuevo
    void deleteByUser(User user);
}