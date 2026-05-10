package com.medical.ai.services;

import com.medical.ai.entities.MedicalCase;
import com.medical.ai.entities.Patient;
import com.medical.ai.repositories.MedicalCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Η κλάση MedicalCaseService λειτουργεί ως το Service Layer
 * για τη διαχείριση των ιατρικών περιστατικών. Αναλαμβάνει την αποθήκευση,
 * ανάκτηση και μελλοντική επεξεργασία των περιστατικών μέσω Τεχνητής Νοημοσύνης.
 */
@Service
public class MedicalCaseService {

    /**
     * Το repository που είναι υπεύθυνο για την επικοινωνία
     * με τον πίνακα 'medical_cases' της βάσης δεδομένων.
     */
    private final MedicalCaseRepository medicalCaseRepository;

    /**
     * Dependency Injection: Το Spring παρέχει
     * αυτόματα το στιγμιότυπο του MedicalCaseRepository κατά την αρχικοποίηση της κλάσης.
     */
    @Autowired
    public MedicalCaseService(MedicalCaseRepository medicalCaseRepository) {
        this.medicalCaseRepository = medicalCaseRepository;
    }

    /**
     * Δημιουργεί ένα νέο ιατρικό περιστατικό και το αποθηκεύει στη βάση δεδομένων.
     * @param medicalCase Το αντικείμενο του περιστατικού.
     * @return Το αποθηκευμένο περιστατικό με το παραγόμενο αναγνωριστικό (ID) του.
     */
    public MedicalCase createMedicalCase(MedicalCase medicalCase) {
        return medicalCaseRepository.save(medicalCase);
    }
    /**
     * Διαγράφει ένα ιατρικό περιστατικό από τη βάση δεδομένων βάσει του αναγνωριστικού του.
     * @param id Το αναγνωριστικό (ID) του περιστατικού προς διαγραφή.
     */
    public void deleteCase(Long id) {
        medicalCaseRepository.deleteById(id);
    }

    /**
     * Ανακτά το πλήρες ιατρικό ιστορικό ενός συγκεκριμένου ασθενούς.
     * @param patient Το αντικείμενο του ασθενούς του οποίου το ιστορικό αναζητείται.
     * @return Μία λίστα με όλα τα ιατρικά περιστατικά του ασθενούς, ταξινομημένα κατά φθίνουσα ημερομηνία.
     */
    public List<MedicalCase> getMedicalHistory(Patient patient) {
        return medicalCaseRepository.findByPatientOrderByDateDesc(patient);
    }
    /**
     * Επιστρέφει το σύνολο των ιατρικών περιστατικών που υπάρχουν στο σύστημα.
     * @return Λίστα με όλα τα καταχωρημένα αντικείμενα MedicalCase.
     */
    public List<MedicalCase> getAllCases() {
        return medicalCaseRepository.findAll();
    }


}