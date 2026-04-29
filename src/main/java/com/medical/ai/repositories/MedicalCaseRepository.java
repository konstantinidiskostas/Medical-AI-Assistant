package com.medical.ai.repositories;

import com.medical.ai.entities.MedicalCase;
import com.medical.ai.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalCaseRepository extends JpaRepository<MedicalCase, Long> {
    /**
     * Retrieves all medical cases associated with a specific patient.
     * We order them by creation date descending so the most recent visits appear first.
     */
    List<MedicalCase> findByPatientOrderByCreatedAtDesc(Patient patient);
}
