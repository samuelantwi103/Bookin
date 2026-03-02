package com.book.in.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.book.in.model.User;
import com.book.in.repository.UserRepository;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok((Object) user))
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid email address")));
    }
}
