package com.tikal.api.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "password_reset_otp")
public class PasswordResetOtp {

    @Id
    private Integer userId;

    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    @Column(name = "expiration_date", nullable = false)
    private LocalDateTime expirationDate;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expirationDate);
    }
}