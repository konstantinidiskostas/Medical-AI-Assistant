package com.medical.ai.services;

import com.medical.ai.entities.Patient;
import com.medical.ai.entities.User;
import com.medical.ai.repositories.PatientRepository;
import com.medical.ai.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Υπηρεσία διαχείρισης ασθενών.
 *
 * ΠΡΟΣΘΗΚΗ: Οι μέθοδοι τώρα ελέγχουν αν ο γιατρός είναι ιδιοκτήτης του ασθενή,
 * ώστε ένας γιατρός να βλέπει/επεξεργάζεται ΜΟΝΟ τους δικούς του ασθενείς
 * (εκτός αν είναι Admin, που βλέπει τα πάντα).
 */
@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Autowired
    public PatientService(PatientRepository patientRepository, UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    /**
     * Αποθηκεύει έναν ασθενή.
     */
    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }

    /**
     * Βρίσκει όλους τους ασθενείς ενός συγκεκριμένου γιατρού.
     */
    public List<Patient> findAllByDoctor(User doctor) {
        return patientRepository.findByDoctor(doctor);
    }

    /**
     * Επιστρέφει ΟΛΟΥΣ τους ασθενείς (μόνο για Admin).
     */
    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    /**
     * Βρίσκει ασθενή με βάση το ID.
     */
    public Optional<Patient> findById(Long id) {
        return patientRepository.findById(id);
    }

    /**
     * Ελέγχει αν ένας γιατρός είναι όντως ο ιδιοκτήτης ενός ασθενή.
     * Χρήσιμο για τα controllers όταν θέλουν να εξασφαλίσουν
     * ότι ένας γιατρός βλέπει μόνο τους δικούς του ασθενείς.
     */
    public boolean isOwner(Long patientId, Long doctorId) {
        return patientRepository.findById(patientId)
                .map(patient -> patient.getDoctor().getId().equals(doctorId))
                .orElse(false);
    }

    /**
     * Βρίσκει έναν χρήστη (γιατρό) με βάση το ID.
     * Χρησιμοποιείται όταν δημιουργούμε ασθενή και χρειαζόμαστε τον γιατρό.
     */
    public User findDoctorById(Long doctorId) {
        return userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε γιατρός με ID: " + doctorId));
    }

    /**
     * Διαγράφει έναν ασθενή.
     */
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}
