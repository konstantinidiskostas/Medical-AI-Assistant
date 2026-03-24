package com.medical.ai.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "patients") // Mapping the class to the 'patients' table in MySQL
public class Patient {

    @Id // This is our Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment (1, 2, 3...) handled by MySQL
    private Long patientId;

    @Column(nullable = false) // Full name is mandatory (NOT NULL)
    private String fullName;

    @Column(unique = true, nullable = false) // AMKA must be unique and is required
    private String amka;

    private int age; // Optional field, defaults to 0 if not set

    private String gender; // Optional field for patient's gender

    // Relationship: One patient can have many appointments
    // Cascade ALL means if we delete the patient, their appointments are deleted too
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<MedicalCase> medicalCases;

    // Standard default constructor for JPA
    public Patient() {}

    // Constructor to easily create a new patient with basic info
    public Patient(String fullName, String amka, int age, String gender) {
        this.fullName = fullName;
        this.amka = amka;
        this.age = age;
        this.gender = gender;

    }

    // Getters and Setters

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAmka() {
        return amka;
    }

    public void setAmka(String amka) {
        this.amka = amka;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public List<MedicalCase> getMedicalCases() {
        return medicalCases;
    }

    public void setMedicalCases(List<MedicalCase> medicalCases) {
        this.medicalCases = medicalCases;
    }
    // Helper method to add a single medical case
    public void addMedicalCase(MedicalCase medicalCase) {
        this.medicalCases.add(medicalCase);
        medicalCase.setPatient(this); // This links the case back to this specific patient
    }
}