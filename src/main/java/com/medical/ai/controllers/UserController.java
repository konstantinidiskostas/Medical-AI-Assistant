package com.medical.ai.controllers;

import com.medical.ai.dtos.AuthResponse;
import com.medical.ai.entities.User;
import com.medical.ai.security.JwtUtil;
import com.medical.ai.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for handling user registration and authentication processes.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Registers a new user in the system.
     * The service layer handles password encryption.
     *
     * @param user The user details for registration.
     * @return The registered user entity.
     */
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    /**
     * Authenticates the user credentials and generates a JWT token upon success.
     *
     * @param loginRequest The credentials (username and password) provided by the user.
     * @return A ResponseEntity containing the AuthResponse (JWT token + user object)
     * or a 401 Unauthorized status if authentication fails.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        try {
            // 1. Authenticate the user credentials using Spring Security's AuthenticationManager
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            // 2. Fetch the user details from database after successful authentication
            User user = userService.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 3. Generate a JWT Token for the authenticated session
            String token = jwtUtil.generateToken(user.getUsername());

            // 4. Return the Token and User object wrapped in an AuthResponse DTO
            return ResponseEntity.ok(new AuthResponse(token, user));

        } catch (Exception e) {
            // Return 401 Unauthorized if authentication fails
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updated = userService.updateUser(id, user);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Σφάλμα κατά τη διαγραφή χρήστη.");
        }
    }
}