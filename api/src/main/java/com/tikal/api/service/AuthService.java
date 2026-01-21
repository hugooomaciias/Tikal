package com.tikal.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tikal.api.repository.UserRepository;

/**
 * Login del usuario
 * Registro del usuario
 */
@Service
public class AuthService {
    @Autowired
    private UserRepository userRepo;
}
