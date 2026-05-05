package com.medical.ai.services;

import com.medical.ai.entities.User;
import com.medical.ai.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * The UserService handles all operations related to the System Users (Doctors).
 * It manages user registration and authentication checks.
 */
@Service
public class UserService {

    // Dependency: We need the UserRepository to access user data in the database.
    private final UserRepository userRepository;

    /**
     * Dependency Injection: Spring injects the UserRepository into this service.
     */
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Registers a new user (doctor) in the system.
     * In a real-world scenario, we would hash the password before saving here.
     * @param user The user object with username and password.
     * @return The saved user.
     */
    @Autowired
    private PasswordEncoder passwordEncoder; // Inject the encoder

    public User registerUser(User user) {
        // Encode the password before saving to database
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Searches for a user by their username.
     * This is essential for the Login process.
     * @param username The username entered during login.
     * @return An Optional containing the user if they exist.
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}