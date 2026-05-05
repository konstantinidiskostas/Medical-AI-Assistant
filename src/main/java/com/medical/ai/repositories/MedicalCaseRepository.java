package com.medical.ai.repositories;

import com.medical.ai.entities.MedicalCase;
import com.medical.ai.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * By extending JpaRepository, Spring Data JPA automatically provides
 * standard CRUD (Create, Read, Update, Delete) operations.
 * - MedicalCase: The domain type the repository manages.
 * - Long: The type of the id of the entity.
 * No boilerplate code is needed for basic database interactions.
 */
@Repository
public interface MedicalCaseRepository extends JpaRepository<MedicalCase, Long> {
    /**
     * Retrieves all medical cases associated with a specific patient.
     * We order them by creation date descending so the most recent visits appear first.
     */
    List<MedicalCase> findByPatientOrderByDateDesc(Patient patient);
}
