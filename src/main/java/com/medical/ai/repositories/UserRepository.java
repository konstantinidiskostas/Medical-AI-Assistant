package com.medical.ai.repositories;

import com.medical.ai.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * By extending JpaRepository, Spring Data JPA automatically provides
 * standard CRUD (Create, Read, Update, Delete) operations.
 * - User: The domain type the repository manages (the Doctor/User).
 * - Long: The type of the id of the entity.
 * No boilerplate code is needed for basic database interactions.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Finds a user by their username.
     * Used during authentication to verify credentials.
     */
    Optional<User> findByUsername(String username);
}
