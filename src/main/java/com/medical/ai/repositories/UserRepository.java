package com.medical.ai.repositories;

import com.medical.ai.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository για τον πίνακα 'users'.
 *
 * Το Spring Data JPA υλοποιεί ΑΥΤΟΜΑΤΑ όλες τις βασικές λειτουργίες
 * CRUD (Create, Read, Update, Delete) — δεν χρειάζεται να γράψουμε υλοποίηση!
 *
 * Εμείς προσθέτουμε ΜΟΝΟ μεθόδους που χρειαζόμαστε επιπλέον, όπως:
 * - findByUsername: για τη σύνδεση (login)
 * - findByRole: για να βρούμε χρήστες που περιμένουν έγκριση
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Βρίσκει έναν χρήστη από το username του.
     * Το Spring Data JPA καταλαβαίνει από το όνομα της μεθόδου
     * ότι θέλουμε: SELECT * FROM users WHERE username = ?
     */
    Optional<User> findByUsername(String username);

    /**
     * Βρίσκει όλους τους χρήστες με συγκεκριμένο ρόλο.
     * Π.χ. findByRole("Pending_Admin") επιστρέφει όσους περιμένουν έγκριση.
     */
    List<User> findByRole(String role);
}
