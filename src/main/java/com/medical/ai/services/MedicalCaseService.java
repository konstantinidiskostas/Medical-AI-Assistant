package com.medical.ai.services;

import com.medical.ai.entities.MedicalCase;
import com.medical.ai.entities.Patient;
import com.medical.ai.repositories.MedicalCaseRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    public Optional<MedicalCase> findById(Long id) {
        return medicalCaseRepository.findById(id);
    }

    /**
     * Προσθέτει ένα νέο ζεύγος ερώτησης-απάντησης στο ιστορικό συνομιλίας (conversation)
     * ενός υπάρχοντος ιατρικού περιστατικού.
     * @param caseId Το ID του περιστατικού.
     * @param symptoms Η νέα ερώτηση/συμπτώματα.
     * @param diagnosis Η απάντηση του AI.
     * @param type Ο τύπος ερώτησης.
     * @param tags Ετικέτες (προαιρετικά, comma-separated).
     * @return Το ενημερωμένο MedicalCase.
     */
    public MedicalCase appendConversation(Long caseId, String symptoms, String diagnosis, String type, String tags) {
        MedicalCase medicalCase = medicalCaseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found with id: " + caseId));

        // Parse existing conversation or create new array
        JSONArray conversation;
        if (medicalCase.getConversation() != null && !medicalCase.getConversation().isEmpty()) {
            conversation = new JSONArray(medicalCase.getConversation());
        } else {
            conversation = new JSONArray();
        }

        // Add new entry
        JSONObject entry = new JSONObject();
        entry.put("question", symptoms);
        entry.put("answer", diagnosis);
        entry.put("type", type);
        conversation.put(entry);

        // Update fields for backward compatibility (show latest Q&A in list preview)
        medicalCase.setSymptoms(symptoms);
        medicalCase.setDiagnosis(diagnosis);
        medicalCase.setType(type);
        medicalCase.setConversation(conversation.toString());

        // Update tags if provided
        if (tags != null && !tags.isEmpty()) {
            medicalCase.setTags(tags);
        }

        return medicalCaseRepository.save(medicalCase);
    }

    public MedicalCase updateTags(Long id, String tags) {
        MedicalCase medicalCase = medicalCaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found with id: " + id));
        medicalCase.setTags(tags);
        return medicalCaseRepository.save(medicalCase);
    }

}