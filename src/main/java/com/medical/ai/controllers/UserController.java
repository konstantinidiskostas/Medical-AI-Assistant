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
    public ResponseEntity<String> loginUser(@RequestBody User loginRequest) {
        // 1. Ψάχνουμε αν υπάρχει ο χρήστης με βάση το username
        Optional<User> existingUser = userService.findByUsername(loginRequest.getUsername());

        // 2. Αν ο χρήστης βρεθεί, ελέγχουμε τον κωδικό
        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // ΠΡΟΣΟΧΗ: Σε κανονικές συνθήκες οι κωδικοί κρυπτογραφούνται (π.χ. BCrypt).
            // Για τώρα, κάνουμε έναν απλό έλεγχο ταύτισης του κειμένου.
            if (user.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.ok("Login successful for user: " + user.getUsername());
            } else {
                return ResponseEntity.status(401).body("Invalid password"); // 401 = Unauthorized
            }
        } else {
            return ResponseEntity.status(404).body("User not found"); // 404 = Not Found
        }
    }
}