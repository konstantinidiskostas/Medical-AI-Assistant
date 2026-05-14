package com.medical.ai.repositories;

import com.medical.ai.entities.Patient;
import com.medical.ai.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository για τον πίνακα 'patients'.
 *
 * Το Spring Data JPA παρέχει αυτόματα όλες τις βασικές CRUD λειτουργίες.
 * Εδώ ορίζουμε επιπλέον μεθόδους αναζήτησης:
 * - findByAmka: για έλεγχο μοναδικότητας ΑΜΚΑ
 * - findByDoctor: για προβολή ασθενών συγκεκριμένου γιατρού
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    /**
     * Βρίσκει ασθενή με βάση το ΑΜΚΑ.
     * Επιστρέφει Optional για ασφαλή έλεγχο (αντί για null που προκαλεί σφάλματα).
     */
    Optional<Patient> findByAmka(String amka);

    /**
     * Βρίσκει όλους τους ασθενείς ενός συγκεκριμένου γιατρού.
     * Χρησιμοποιείται στη σελίδα του γιατρού για να δει ΜΟΝΟ τους δικούς του ασθενείς.
     */
    List<Patient> findByDoctor(User doctor);
}
