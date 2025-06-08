package com.rondatrack.service;

import com.rondatrack.dto.AuthResponse;
import com.rondatrack.dto.LoginRequest;
import com.rondatrack.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
