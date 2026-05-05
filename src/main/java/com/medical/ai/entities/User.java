package com.medical.ai.entities;

import jakarta.persistence.*;

/**
 * Entity class representing a User in the system.
 * Mapped to the 'users' table in the database with the required fields:
 * userId, username, password, fullName, and role.
 */
@Entity
@Table(name = "users")
public class User {

    /**
     * Unique identifier for each user.
     * Generated automatically by the database.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Username used for system authentication.
     * Must be unique.
     */
    @Column(nullable = false, unique = true)
    private String username;

    /**
     * User's password (should be stored encrypted in a real-world scenario).
     */
    @Column(nullable = false)
    private String password;

    /**
     * The full name of the user.
     */
    @Column(nullable = false)
    private String fullName;

    /**
     * The role of the user in the system (e.g., 'doctor', 'admin', 'researcher').
     */
    @Column(nullable = false)
    private String role;

    /**
     * Default constructor required by JPA.
     */
    public User() {}

    /**
     * Parameterized constructor for easy object creation.
     */
    public User(String username, String password, String fullName, String role) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setUserId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}