package com.medical.ai.entities;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "medical_cases")
public class MedicalCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient; // Η αντίστροφη σύνδεση με τον Patient

    private LocalDate createdAt;

    // Ορίζουμε ως τεχτ αλλιώς θα παίρνει 255 χαρακτήρες
    @Column(columnDefinition = "TEXT")
    private String symptoms;

    private String type;

    @Column(columnDefinition = "TEXT")


    public void setPatient(Patient patient) {
    }
}