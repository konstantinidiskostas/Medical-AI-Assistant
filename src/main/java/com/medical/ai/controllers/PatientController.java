package com.medical.ai.controllers;

import com.medical.ai.entities.Patient;
import com.medical.ai.repositories.PatientRepository;
import com.medical.ai.services.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing Patient-related operations.
 * Provides endpoints for creating, retrieving, and managing patients.
 */
@RestController
@RequestMapping("/api/patients") // The base URL for all patient operations
public class PatientController {

    @Autowired // This connects the Controller with our Repository (the "Storekeeper")
    private PatientService patientService;

    /**
     * Retrieves a list of all patients registered in the system.
     * @return a list of Patient entities.
     */
   // @GetMapping
   // public List<Patient> getAllPatients() {
   //     return patientService.findAll();
    //}

    /**
     * Creates and saves a new patient to the database.
     * @param patient the patient data sent in the request body.
     * @return the saved Patient entity.
     */
   /* @PostMapping
    public Patient createPatient(@RequestBody Patient patient) {
        return patientService.save(patient);
    }*/

    /**
     * Retrieves a specific patient by their ID.
     * @param id the unique identifier of the patient.
     * @return the Patient entity if found.
     */
    /*@GetMapping("/{id}")
    public Patient getPatientById(@PathVariable Long id) {
        return patientService.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
    }*/
}