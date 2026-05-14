package com.medical.ai.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Κλάση που αναπαριστά έναν Ασθενή στο σύστημα.
 * Κάθε ασθενής ανήκει σε έναν γιατρό και μπορεί να έχει πολλά ιατρικά περιστατικά.
 */
@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patientId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String amka;

    private int age;
    private String gender;
    private String telephone;

    /**
     * Σχέση Πολλά-προς-Ένα: Πολλοί ασθενείς ανήκουν σε έναν γιατρό.
     * Το @JsonIgnore κρύβει τον γιατρό από το JSON για να μην εκτεθεί ο κωδικός του.
     */
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    @JsonIgnore
    private User doctor;

    /**
     * Σχέση Ένα-προς-Πολλά: Ένας ασθενής μπορεί να έχει πολλά περιστατικά.
     *
     * ΔΙΟΡΘΩΣΗ: Αλλάξαμε CascadeType από ALL σε {PERSIST, MERGE}.
     * Πριν: CascadeType.ALL — αν διαγράφαμε έναν ασθενή, διαγράφονταν ΟΛΑ τα περιστατικά του
     * (ανεπανόρθωτη απώλεια δεδομένων!).
     * Τώρα: {PERSIST, MERGE} — η διαγραφή του ασθενή ΔΕΝ διαγράφει το ιστορικό του.
     */
    @OneToMany(mappedBy = "patient", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<MedicalCase> medicalCases = new ArrayList<>();

    public Patient() {}

    public Patient(String firstName, String lastName, String amka, int age, String gender, String telephone, User doctor) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.amka = amka;
        this.age = age;
        this.gender = gender;
        this.telephone = telephone;
        this.doctor = doctor;
    }

    // --- Getters και Setters ---

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
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
}
