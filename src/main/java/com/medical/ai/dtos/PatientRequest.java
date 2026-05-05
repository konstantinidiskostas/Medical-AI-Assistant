package com.medical.ai.dtos;

/**
 * Data Transfer Object (DTO) for Patient creation requests.
 * * WHY WE USE THIS:
 * Instead of exposing our Database Entity directly to the API, we use this class
 * as a 'contract'. It defines exactly what the frontend must send to create a patient.
 * It shields our database structure from the frontend and adds a layer of security.
 */
public class PatientRequest {

    // The name of the patient as entered by the doctor
    public String fullName;

    // The patient's Social Security Number (AMKA), used as a unique identifier
    public String amka;

    // Patient's age (numeric value)
    public int age;

    // Gender information (e.g., Male, Female, Other)
    public String gender;

    // Contact telephone number for the patient
    public String telephone;

    // The ID of the doctor who is currently logged in.
    // We send this from the frontend so the backend knows which Doctor
    // is the "owner" of this new Patient record.
    public Long doctorId;
}