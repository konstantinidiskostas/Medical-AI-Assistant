package com.medical.ai.entities;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity class representing a Patient in the system.
 * This class maps to the 'patients' table in the MySQL database
 * and maintains a Many-to-One relationship with the User (Doctor).
 */
@Entity
@Table(name = "patients")
public class Patient {

    /**
     * Unique identifier for each patient.
     * Generated automatically by the database (Auto-increment).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patientId;

    /**
     * Patient's full name. Mandatory field.
     */
    @Column(nullable = false)
    private String fullName;

    /**
     * Social Security Number (AMKA). Unique identifier for identification.
     */
    @Column(unique = true, nullable = false)
    private String amka;

    /**
     * Patient's age in years.
     */
    private int age;

    /**
     * Patient's gender.
     */
    private String gender;

    /**
     * Patient's contact telephone number.
     */
    private String telephone;

    /**
     * Relationship mapping: Each patient belongs to one specific Doctor (User).
     * This ensures data privacy and organization per doctor.
     */
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private User doctor;

    /**
     * Relationship mapping: One patient can have multiple medical cases.
     * CascadeType.ALL ensures that deleting a patient deletes their cases.
     */
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<MedicalCase> medicalCases = new ArrayList<>();

    /**
     * Default constructor required by JPA/Hibernate.
     */
    public Patient() {}

    /**
     * Constructor to initialize a patient with all necessary information.
     */
    public Patient(String fullName, String amka, int age, String gender, String telephone, User doctor) {
        this.fullName = fullName;
        this.amka = amka;
        this.age = age;
        this.gender = gender;
        this.telephone = telephone;
        this.doctor = doctor;
    }

    // --- Getters and Setters ---

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getAmka() { return amka; }
    public void setAmka(String amka) { this.amka = amka; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public User getDoctor() { return doctor; }
    public void setDoctor(User doctor) { this.doctor = doctor; }

    public List<MedicalCase> getMedicalCases() { return medicalCases; }
    public void setMedicalCases(List<MedicalCase> medicalCases) { this.medicalCases = medicalCases; }

    /**
     * Helper method to maintain the bidirectional relationship for medical cases.
     */
    public void addMedicalCase(MedicalCase medicalCase) {
        this.medicalCases.add(medicalCase);
        medicalCase.setPatient(this);
    }
}