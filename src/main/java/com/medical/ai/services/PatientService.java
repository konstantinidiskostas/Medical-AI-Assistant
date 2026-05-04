package com.medical.ai.services;

import com.medical.ai.entities.Patient;
import com.medical.ai.repositories.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * The @Service annotation marks this class as a "Service Layer" component.
 * This is where the business logic lives. It acts as a bridge between the
 * API Controllers and the Data Repositories.
 */
@Service
public class PatientService {

    /**
     * Dependency: The service needs the repository to talk to the database.
     * We use 'final' to ensure the repository reference never changes.
     */
    private final PatientRepository patientRepository;

    /**
     * Autowired tells Spring to automatically find the PatientRepository
     * bean and "inject" it into this service. This is called Dependency Injection.
     * We use Constructor Injection because it is the most secure and testable way.
     */
    @Autowired
    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    /**
     * Saves a new patient or updates an existing one in the database.
     * It uses the repository's built-in save() method.
     * @param patient The patient entity to be stored.
     * @return The saved patient (including its generated ID).
     */
    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    /**
     * Searches for a patient using their unique AMKA number.
     * We return an Optional to handle cases where the AMKA might not exist
     * in our records without crashing the application with a null value.
     * @param amka The 11-digit social security number.
     * @return An Optional containing the patient if found.
     */
    public Optional<Patient> findByAmka(String amka) {
        return patientRepository.findByAmka(amka);
    }
}