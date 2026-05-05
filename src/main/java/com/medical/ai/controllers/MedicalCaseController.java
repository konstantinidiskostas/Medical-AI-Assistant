package com.medical.ai.controllers;

import com.medical.ai.entities.MedicalCase;
import com.medical.ai.entities.Patient;
import com.medical.ai.services.MedicalCaseService;
import com.medical.ai.services.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller for managing Medical Cases (patient visits and diagnoses).
 * Handles the retrieval of patient history and the creation of new medical records.
 */
@RestController
@RequestMapping("/api/medical-cases")
@CrossOrigin(origins = "http://localhost:5173") // Crucial: Allows the React frontend to communicate with these endpoints
public class MedicalCaseController {

    private final MedicalCaseService medicalCaseService;
    private final PatientService patientService;

    @Autowired
    public MedicalCaseController(MedicalCaseService medicalCaseService, PatientService patientService) {
        this.medicalCaseService = medicalCaseService;
        this.patientService = patientService;
    }

    /**
     * Endpoint to create a standard medical case directly from an entity object.
     * POST /api/medical-cases
     */
    @PostMapping
    public MedicalCase createMedicalCase(@RequestBody MedicalCase medicalCase) {
        if (medicalCase.getDate() == null) {
            medicalCase.setDate(LocalDateTime.now());
        }
        return medicalCaseService.createMedicalCase(medicalCase);
    }

    /**
     * Saves a NEW medical case to the database AFTER the doctor approves the AI diagnosis.
     * This endpoint bridges the AI evaluation phase with the permanent patient history.
     * POST /api/medical-cases/save
     * * @param request The Data Transfer Object containing patient ID, symptoms, and the approved diagnosis.
     * @return The newly saved MedicalCase entity.
     */
    @PostMapping("/save")
    public MedicalCase saveApprovedCase(@RequestBody CaseRequest request) {
        // 1. Fetch the patient from the database securely using the provided ID
        Patient patient = patientService.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + request.getPatientId()));

        // 2. Initialize a new Medical Case entity and populate it with the verified data
        MedicalCase newCase = new MedicalCase();
        newCase.setPatient(patient);
        newCase.setSymptoms(request.getSymptoms());
        newCase.setDiagnosis(request.getDiagnosis());
        newCase.setDate(LocalDateTime.now()); // Record the exact time of approval

        // 3. Persist the record to the database via the Service layer
        return medicalCaseService.createMedicalCase(newCase);
    }

    /**
     * Retrieves the full medical history for a specific patient.
     * GET /api/medical-cases/patient/{patientId}
     * * @param patientId The unique identifier of the patient.
     * @return A list of all historical medical cases associated with the patient.
     */
    @GetMapping("/patient/{patientId}")
    public List<MedicalCase> getHistory(@PathVariable Long patientId) {
        // Find the patient using the PatientService
        Patient patient = patientService.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        // Return the history list sorted by date (handled in the Service/Repository layer)
        return medicalCaseService.getMedicalHistory(patient);
    }
}

/**
 * Data Transfer Object (DTO) for saving an approved AI case.
 * It maps the JSON payload sent from the React frontend to strict Java fields,
 * ensuring security and decoupling the API request from the internal database entity.
 */
class CaseRequest {
    private Long patientId;
    private String symptoms;
    private String diagnosis;

    // Getters and Setters required by Jackson for JSON deserialization
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
}