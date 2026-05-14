package com.medical.ai.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Η κλάση (Entity) που αντιπροσωπεύει ένα Ιατρικό Περιστατικό (Medical Case).
 * Μεταφράζεται αυτόματα στον πίνακα 'medical_cases' στη βάση δεδομένων MySQL.
 * Εδώ αποθηκεύονται τα συμπτώματα, η διάγνωση του AI και το πότε έγινε η εξέταση.
 */
@Entity
@Table(name = "medical_cases")
public class MedicalCase {
    /**
     * Το Πρωτεύον Κλειδί (Primary Key) του περιστατικού.
     * Το Auto-Increment αναλαμβάνει να δίνει αύξοντα αριθμό (1, 2, 3...) αυτόματα.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Corresponds to caseId
    /**
     * Η περιγραφή των συμπτωμάτων ή της ερώτησης που έκανε ο γιατρός.
     * Χρησιμοποιούμε columnDefinition = "TEXT" γιατί το προεπιλεγμένο VARCHAR
     * χωράει μόνο 255 χαρακτήρες, ενώ μια περιγραφή μπορεί να είναι μεγαλύτερη.
     */
    @Column(columnDefinition = "TEXT")
    private String symptoms;
    // Ο τύπος της ερώτησης (π.χ. "Ανάλυση Συμπτωμάτων", "Γενική Ερώτηση")
    private String type;
    // Η απάντηση/διάγνωση που έδωσε το AI.
    private String diagnosis;
    // Ιστορικό πολλαπλών ερωτήσεων-απαντήσεων σε μορφή JSON array.
    @Column(columnDefinition = "TEXT")
    private String conversation;
    // Ετικέτες (tags) για κατηγοριοποίηση, π.χ. "Διάγνωση,Θεραπεία"
    private String tags;
    // Η ακριβής ημερομηνία και ώρα που αποθηκεύτηκε το περιστατικό.
    private LocalDateTime date;

    /**
     * ΣΧΕΣΗ ΠΟΛΛΑ-ΠΡΟΣ-ΕΝΑ: Πολλά περιστατικά ανήκουν σε Έναν Ασθενή.
     * Το @JoinColumn φτιάχνει τη στήλη 'patient_id' (Ξένο Κλειδί) στη MySQL.
     * Το @JsonIgnore λέει στο Spring Boot "Όταν στέλνεις αυτό το
     * περιστατικό στο React, ΜΗΝ συμπεριλάβεις τα στοιχεία του ασθενή, για να μην κολλήσουμε σε άπειρη λούπα!"
     */
    @ManyToOne
    @JoinColumn(name = "patient_id")
    @JsonIgnoreProperties("medicalCases")
    private Patient patient;

    /**
     * ΣΧΕΣΗ ΠΟΛΛΑ-ΠΡΟΣ-ΕΝΑ: Πολλά περιστατικά δημιουργούνται από Έναν Γιατρό.
     * Ομοίως με παραπάνω, φτιάχνει στήλη 'doctor_id' και αγνοείται στο JSON output.
     */
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    @JsonIgnore // Prevents infinite JSON recursion
    private User doctor;
    /**
     * Υποχρεωτικός κενός κατασκευαστής για το JPA/Hibernate.
     */
    public MedicalCase() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public User getDoctor() { return doctor; }
    public void setDoctor(User doctor) { this.doctor = doctor; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getConversation() { return conversation; }
    public void setConversation(String conversation) { this.conversation = conversation; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}