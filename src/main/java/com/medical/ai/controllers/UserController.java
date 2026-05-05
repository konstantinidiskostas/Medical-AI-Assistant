package com.medical.ai.controllers;

import com.medical.ai.entities.User;
import com.medical.ai.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Endpoint για την εγγραφή νέου γιατρού.
     * POST /api/users/register
     */
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        // Καλούμε το Service για να αποθηκεύσει τον χρήστη
        return userService.registerUser(user);
    }

    /**
     * Endpoint για το Login.
     * POST /api/users/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        // Find the user by username using the service
        Optional<User> existingUser = userService.findByUsername(loginRequest.getUsername());

        // If user exists, verify password
        if (existingUser.isPresent()) {
            User user = existingUser.get();

            if (user.getPassword().equals(loginRequest.getPassword())) {
                // RETURN THE USER OBJECT instead of a String
                // This allows the Frontend to read the 'id' field
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(401).body("Invalid password");
            }
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }
}