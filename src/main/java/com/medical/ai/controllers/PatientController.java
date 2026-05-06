package com.medical.ai.controllers;

import com.medical.ai.dtos.PatientRequest;
import com.medical.ai.entities.Patient;
import com.medical.ai.entities.User;
import com.medical.ai.repositories.UserRepository;
import com.medical.ai.services.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing Patient-related operations.
 * Handles HTTP requests for creating, retrieving, updating, and deleting patients.
 */
@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173") // Allows React to communicate with this API
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private UserRepository userRepository; // Needed to fetch the Doctor object for the relationship

    /**
     * Creates and saves a new patient, linked to a specific doctor.
     * @param request The DTO containing patient details and the doctorId.
     * @return The saved Patient entity.
     */
    @PostMapping
    public Patient createPatient(@RequestBody PatientRequest request) {
        // 1. Fetch the doctor (User) from the database using the ID provided in the request
        User doctor = userRepository.findById(request.doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + request.doctorId));

        // 2. Map DTO data to a new Patient entity
        Patient patient = new Patient(
                request.firstName,
                request.lastName,
                request.amka,
                request.age,
                request.gender,
                request.telephone,
                doctor
        );

        // 3. Save the patient using the service
        return patientService.savePatient(patient);
    }

    /**
     * Retrieves all patients.
     * In the future, we can filter this to show only patients of the logged-in doctor.
     */
    @GetMapping
    public List<Patient> getAllPatients() {
        return patientService.findAll(); // Note: Ensure findAll exists in your Service
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Patient> getPatientsByDoctor(@PathVariable Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return patientService.findAllByDoctor(doctor);
    }

    /**
     * Retrieves a specific patient by ID, including their medical cases.
     * @param id The ID of the patient.
     * @return The Patient entity with their medical history.
     */
    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable Long id) {
        return patientService.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
    }

    /**
     * NEW: Updates an existing patient's details.
     * PUT /api/patients/{id}
     */
    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable Long id, @RequestBody PatientRequest request) {
        // 1. Find existing patient
        Patient existingPatient = patientService.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));

        // 2. Update their fields
        existingPatient.setFirstName(request.firstName);
        existingPatient.setLastName(request.lastName);
        existingPatient.setAmka(request.amka);
        existingPatient.setAge(request.age);
        existingPatient.setGender(request.gender);
        existingPatient.setTelephone(request.telephone);

        // 3. Save and return updated patient
        return patientService.savePatient(existingPatient);
    }

    /**
     * NEW: Deletes a patient by ID.
     * DELETE /api/patients/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        // Verify patient exists before deleting
        patientService.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));

        patientService.deletePatient(id);

        return ResponseEntity.ok().body("Patient deleted successfully");
    }
}