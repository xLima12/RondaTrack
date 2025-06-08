package com.rondatrack.service.impl;

import com.rondatrack.dto.AuthResponse;
import com.rondatrack.dto.LoginRequest;
import com.rondatrack.dto.RegisterRequest;
import com.rondatrack.model.User;
import com.rondatrack.repository.UserRepository;
import com.rondatrack.security.JwtUtil;
import com.rondatrack.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse register(RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return new AuthResponse(jwtUtil.generateToken(user.getEmail()));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário ou senha incorreto"));
        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Usuário ou senha incorreto");
        }
        return new AuthResponse(jwtUtil.generateToken(user.getEmail()));
    }
}
