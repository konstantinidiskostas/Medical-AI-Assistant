package com.medical.ai.entities;

import jakarta.persistence.*; // Import all necessary JPA annotations

/**
 * Entity class representing a User in the system.
 * This class is mapped to the 'users' table in the MySQL database.
 */
@Entity
@Table(name = "users")
public class User {

    /**
     * Unique identifier for each user.
     * Generated automatically by the database (Auto-increment).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Username for authentication.
     * Mapped to a column in the 'users' table.
     */
    @Column(nullable = false, unique = true)
    private String username;

    /**
     * Encrypted password for user security.
     */
    @Column(nullable = false)
    private String password;

    /**
     * Optional phone number for contact or multi-factor authentication.
     */
    @Column(length = 20)
    private String phoneNumber;

    /**
     * Default constructor required by JPA/Hibernate.
     */
    public User() {}

    /**
     * Constructor to initialize a user with basic information.
     */
    public User(String username, String password, String phoneNumber) {
        this.username = username;
        this.password = password;
        this.phoneNumber = phoneNumber;
    }

    /**
     * Getters and Setters.
      */
    public Long getId() {

        return id;
    }

    public void setId(Long id) {

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

    public String getPhoneNumber() {

        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {

        this.phoneNumber = phoneNumber;
    }
}