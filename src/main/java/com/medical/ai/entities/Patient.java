package com.medical.ai.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Η κλάση (Entity) που αντιπροσωπεύει τον Ασθενή στο σύστημά μας.
 * Με τη βοήθεια του JPA, αυτή η κλάση μεταφράζεται αυτόματα σε έναν πίνακα με όνομα 'patients'
 * μέσα στη βάση δεδομένων MySQL. Επίσης, διαχειρίζεται το ποιος γιατρός παρακολουθεί τον ασθενή
 * και ποιο είναι το ιατρικό του ιστορικό.
 */
@Entity
@Table(name = "patients")
public class Patient {

    /**
     * @Id: Δηλώνει ότι αυτό είναι το Πρωτεύον Κλειδί (Primary Key) του πίνακα.
     * @GeneratedValue: Λέει στη βάση (MySQL) να βάζει το ID αυτόματα, ξεκινώντας από το 1 και πηγαίνοντας 2, 3, κ.ο.κ. (Auto-Increment).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long patientId;

    /**
     * @Column(nullable = false): Δηλώνει ότι αυτή η στήλη (όνομα) ΔΕΝ μπορεί να μείνει κενή (Not Null).
     */
    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    /**
     * unique = true: Σημαίνει ότι δεν μπορούν να υπάρξουν 2 ασθενείς με το ίδιο ΑΜΚΑ.
     * nullable = false: Το ΑΜΚΑ είναι υποχρεωτικό.
     */
    @Column(unique = true, nullable = false)
    private String amka;

    /**
     * Η ηλικία του ασθενή
     */
    private int age;

    /**
     * Το φύλο του ασθενή
     */
    private String gender;

    /**
     * Το τηλέφωνο του ασθενή
     */
    private String telephone;

    /**
     * ΣΧΕΣΗ ΠΟΛΛΑ-ΠΡΟΣ-ΕΝΑ (Many-To-One):
     * Πολλοί ασθενείς μπορούν να ανήκουν σε Έναν γιατρό.
     * Το @JoinColumn φτιάχνει μια στήλη 'doctor_id' (Ξένο Κλειδί / Foreign Key) στη βάση,
     * ώστε να ξέρουμε ποιος User (Γιατρός) είναι υπεύθυνος.
     */
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    @JsonIgnore
    private User doctor;

    /**
     * ΣΧΕΣΗ ΕΝΑ-ΠΡΟΣ-ΠΟΛΛΑ (One-To-Many):
     * Ένας ασθενής μπορεί να έχει Πολλά ιατρικά περιστατικά.
     * Το 'mappedBy = "patient"' λέει: "Τη σχέση αυτή την ελέγχει η μεταβλητή 'patient' που υπάρχει στην κλάση MedicalCase".
     * Το 'cascade = CascadeType.ALL' σημαίνει: Αν διαγράψω αυτόν τον ασθενή, διέγραψε αυτόματα και όλο του το ιστορικό.
     */
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<MedicalCase> medicalCases = new ArrayList<>();

    /**
     * Default constructor απαραίτητος για το JPA/Hibernate.
     */
    public Patient() {}

    /**
     * Constructor με παραμέτρους.
     */
    public Patient(String firstName,String lastName, String amka, int age, String gender, String telephone, User doctor) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.amka = amka;
        this.age = age;
        this.gender = gender;
        this.telephone = telephone;
        this.doctor = doctor;
    }

    // --- Getters and Setters ---

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