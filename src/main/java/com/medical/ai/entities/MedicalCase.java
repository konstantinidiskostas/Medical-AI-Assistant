package com.medical.ai.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing a Medical Case.
 * Maps strictly to the provided class diagram.
 */
@Entity
@Table(name = "medical_cases")
public class MedicalCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Corresponds to caseId

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    private LocalDateTime date;

    // Many-to-One relationship with Patient
    @ManyToOne
    @JoinColumn(name = "patient_id")
    @JsonIgnore // Prevents infinite JSON recursion
    private Patient patient;

    // Many-to-One relationship with User (Doctor)
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    @JsonIgnore // Prevents infinite JSON recursion
    private User doctor;

    public MedicalCase() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getTreatment() { return treatment; }
    public void setTreatment(String treatment) { this.treatment = treatment; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public User getDoctor() { return doctor; }
    public void setDoctor(User doctor) { this.doctor = doctor; }
}