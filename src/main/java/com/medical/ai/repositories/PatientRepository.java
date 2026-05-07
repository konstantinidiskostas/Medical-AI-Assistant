package com.medical.ai.repositories;

import com.medical.ai.entities.Patient;
import com.medical.ai.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * By extending JpaRepository, Spring Data JPA automatically provides
 * standard CRUD (Create, Read, Update, Delete) operations.
 * - Patient: The domain type the repository manages.
 * - Long: The type of the id of the entity the repository manages.
 * No boilerplate code is needed for basic database interactions.
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    /**
     * Finds a patient by their unique AMKA number.
     * Spring Data JPA automatically generates the SQL query:
     * SELECT * FROM patients WHERE amka = ?
     ** OPTIONAL EXPLANATION:
     * We use Optional<Patient> instead of a plain Patient object to prevent
     * NullPointerExceptions. If no patient is found with the given AMKA,
     * the Optional container will be "empty" rather than returning null,
     * forcing the developer to safely check for existence before accessing data.
     */
    Optional<Patient> findByAmka(String amka);
    List<Patient> findByDoctor(User doctor);
}
