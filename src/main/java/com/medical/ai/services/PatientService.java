package com.medical.ai.services;

import com.medical.ai.entities.Patient;
import com.medical.ai.entities.User;
import com.medical.ai.repositories.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Το @Service χαρακτηρίζει αυτή την κλάση ως συστατικό στο "Επίπεδο Υπηρεσιών" (Service Layer).
 * Εδώ βρίσκεται η επιχειρηματική λογική της εφαρμογής. Λειτουργεί ως γέφυρα ανάμεσα στα
 * API Controllers που μιλάνε με το React και τα Data Repositories που μιλάνε με τη βάση δεδομένων.
 */
@Service
public class PatientService {

    /**
     * Dependency: Το service χρειάζεται το repository για να μπορεί να μιλήσει στη βάση δεδομένων.
     * Χρησιμοποιούμε 'final' για να εξασφαλίσουμε ότι η αναφορά σε αυτό το repository δεν θα αλλάξει ποτέ.
     */
    private final PatientRepository patientRepository;

    /**
     * Το @Autowired λέει στο Spring να βρει αυτόματα το αντικείμενο PatientRepository
     * και να το κάνει inject μέσα σε αυτό το service.
     **/
    @Autowired
    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    /**
     * Αποθηκεύει έναν νέο ασθενή ή ενημερώνει έναν υπάρχοντα στη βάση δεδομένων.
     * Χρησιμοποιεί την έτοιμη μέθοδο save() που μας παρέχει το Spring Data JPA.
     * @param patient Το αντικείμενο του ασθενή προς αποθήκευση.
     * @return Τον αποθηκευμένο ασθενή (μαζί με το ID που του έδωσε αυτόματα η MySQL).
     */
    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    /**
     * Ψάχνει για έναν ασθενή χρησιμοποιώντας τον μοναδικό αριθμό ΑΜΚΑ.
     * Επιστρέφουμε Optional για να χειριστούμε περιπτώσεις όπου το ΑΜΚΑ μπορεί να μην υπάρχει
     * στα αρχεία μας, χωρίς να κρασάρει η εφαρμογή με την επιστροφή null (NullPointerException).
     * @param amka Ο 11-ψήφιος αριθμός κοινωνικής ασφάλισης.
     * @return Ένα Optional που περιέχει τον ασθενή, αν βρεθεί.
     */
    public Optional<Patient> findByAmka(String amka) {
        return patientRepository.findByAmka(amka);
    }
    /**
     * Βρίσκει όλους τους ασθενείς που ανήκουν σε έναν συγκεκριμένο γιατρό.
     * @param doctor Το αντικείμενο του γιατρού.
     * @return Λίστα με τους ασθενείς του.
     */
    public List<Patient> findAllByDoctor(User doctor) {
        return patientRepository.findByDoctor(doctor);
    }
    /**
     * Επιστρέφει όλους τους ασθενείς ανεξαιρέτως από τη βάση δεδομένων.
     * Χρήσιμο για τον ρόλο του Admin.
     * @return Λίστα με όλους τους ασθενείς.
     */
    public List<Patient> findAll() {
        return patientRepository.findAll();
    }
    /**
     * Βρίσκει έναν ασθενή με βάση το μοναδικό του ID.
     * @param id Το ID του ασθενή (πρωτεύον κλειδί).
     * @return Ένα Optional που περιέχει τον ασθενή, αν βρεθεί.
     */
    public Optional<Patient> findById(Long id) {
        return patientRepository.findById(id);
    }
    /**
     * Διαγράφει έναν ασθενή από τη βάση δεδομένων με βάση το ID του.
     * Σημείωση: Λόγω του CascadeType.ALL στην κλάση Patient, διαγράφοντας έναν ασθενή
     * θα διαγραφούν αυτόματα και όλα τα συνδεδεμένα ιατρικά του περιστατικά (ιστορικό).
     * @param id Το ID του ασθενή προς διαγραφή.
     */
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}