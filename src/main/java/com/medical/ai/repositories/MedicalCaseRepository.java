package com.medical.ai.repositories;

import com.medical.ai.entities.MedicalCase;
import com.medical.ai.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository για τον πίνακα 'medical_cases' (ιατρικά περιστατικά).
 *
 * Το Spring Data JPA παρέχει αυτόματα όλες τις βασικές CRUD λειτουργίες.
 * Εδώ ορίζουμε την αναζήτηση περιστατικών ανά ασθενή,
 * ταξινομημένων κατά ημερομηνία (πιο πρόσφατο πρώτο).
 */
@Repository
public interface MedicalCaseRepository extends JpaRepository<MedicalCase, Long> {

    /**
     * Βρίσκει όλα τα περιστατικά ενός ασθενή, ταξινομημένα από το πιο πρόσφατο
     * στο πιο παλιό. Χρήσιμο για την προβολή ιστορικού.
     */
    List<MedicalCase> findByPatientOrderByDateDesc(Patient patient);
}
