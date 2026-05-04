package com.medical.ai.controllers;

import com.medical.ai.entities.MedicalCase;
import com.medical.ai.entities.Patient;
import com.medical.ai.services.MedicalCaseService;
import com.medical.ai.services.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-cases")
public class MedicalCaseController {

    private final MedicalCaseService medicalCaseService;
    private final PatientService patientService;

    @Autowired
    public MedicalCaseController(MedicalCaseService medicalCaseService, PatientService patientService) {
        this.medicalCaseService = medicalCaseService;
        this.patientService = patientService;
    }

    /**
     * Endpoint to create a new medical case (visit).
     * POST /api/medical-cases
     */
    @PostMapping
    public MedicalCase createMedicalCase(@RequestBody MedicalCase medicalCase) {
        return medicalCaseService.createMedicalCase(medicalCase);
    }

    /**
     * Endpoint to retrieve the medical history of a specific patient.
     * GET /api/medical-cases/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    public List<MedicalCase> getHistory(@PathVariable Long patientId) {
        // 1. Find the patient first using the PatientService
        Patient patient = patientService.getPatientById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

        // 2. Return the history from the MedicalCaseService
        return medicalCaseService.getMedicalHistory(patient);
    }
}