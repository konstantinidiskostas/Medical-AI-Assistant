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
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;
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
    public User(String username, String password, String firstName, String lastName, String email, String role) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
    }

    // --- Getters και Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    // Νέα Getters/Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}