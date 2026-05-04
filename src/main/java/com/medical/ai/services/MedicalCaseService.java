package com.medical.ai.services;

import com.medical.ai.entities.MedicalCase;
import com.medical.ai.entities.Patient;
import com.medical.ai.repositories.MedicalCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * The MedicalCaseService acts as the manager for all clinical visits.
 * It handles saving, retrieving, and (soon) processing medical cases via AI.
 */
@Service
public class MedicalCaseService {

    // Dependency: We need the repository to communicate with the database table 'medical_cases'.
    private final MedicalCaseRepository medicalCaseRepository;

    /**
     * Dependency Injection: Spring automatically provides the instance of
     * MedicalCaseRepository when the application starts.
     */
    @Autowired
    public MedicalCaseService(MedicalCaseRepository medicalCaseRepository) {
        this.medicalCaseRepository = medicalCaseRepository;
    }

    /**
     * Creates a new medical case (visit) and saves it to the database.
     * @param medicalCase The case object containing symptoms and patient data.
     * @return The saved MedicalCase entity with its generated ID.
     */
    public MedicalCase createMedicalCase(MedicalCase medicalCase) {
        // Here we could add logic like: "Validate that symptoms are not empty"
        return medicalCaseRepository.save(medicalCase);
    }

    /**
     * Retrieves the full medical history for a specific patient.
     * Useful for the doctor to see previous visits.
     * @param patient The patient whose history we want to load.
     * @return A list of all medical cases for that patient, sorted by date (newest first).
     */
    public List<MedicalCase> getMedicalHistory(Patient patient) {
        return medicalCaseRepository.findByPatientOrderByCreatedAtDesc(patient);
    }

    /**
     * TODO: This will be the "bridge" to the AI.
     * In the future, this method will take the medicalCase, call an external
     * AI API (like Gemini), and then update the MedicalCase with the
     * generated Diagnosis and Confidence Score.
     */
    public void processCaseWithAi(MedicalCase medicalCase) {
        // 1. Prepare the prompt for the AI using the medicalCase.getSymptoms()
        // 2. Call the AI API (Gemini/OpenAI)
        // 3. Update the medicalCase object with the result (aiResponseContent, aiConfidenceScore)
        // 4. Save the updated object: medicalCaseRepository.save(medicalCase)
    }
}