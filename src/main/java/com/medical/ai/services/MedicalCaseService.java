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
 * Υπηρεσία διαχείρισης ιατρικών περιστατικών.
 * Αναλαμβάνει αποθήκευση, ανάκτηση και διαγραφή περιστατικών.
 */
@Service
public class MedicalCaseService {

    private final MedicalCaseRepository medicalCaseRepository;

    @Autowired
    public MedicalCaseService(MedicalCaseRepository medicalCaseRepository) {
        this.medicalCaseRepository = medicalCaseRepository;
    }

    /**
     * Δημιουργεί και αποθηκεύει ένα νέο ιατρικό περιστατικό.
     */
    public MedicalCase createMedicalCase(MedicalCase medicalCase) {
        return medicalCaseRepository.save(medicalCase);
    }

    /**
     * Διαγράφει ένα περιστατικό.
     */
    public void deleteCase(Long id) {
        medicalCaseRepository.deleteById(id);
    }

    /**
     * Επιστρέφει το ιατρικό ιστορικό ενός ασθενή, ταξινομημένο κατά ημερομηνία.
     */
    public List<MedicalCase> getMedicalHistory(Patient patient) {
        return medicalCaseRepository.findByPatientOrderByDateDesc(patient);
    }

    /**
     * Επιστρέφει ΟΛΑ τα περιστατικά (για Admin).
     */
    public List<MedicalCase> getAllCases() {
        return medicalCaseRepository.findAll();
    }

    /**
     * Βρίσκει ένα περιστατικό με βάση το ID.
     */
    public Optional<MedicalCase> findById(Long id) {
        return medicalCaseRepository.findById(id);
    }

    /**
     * Προσθέτει ένα νέο Q&A στο ιστορικό συνομιλίας ενός υπάρχοντος περιστατικού.
     *
     * ΔΙΟΡΘΩΣΗ: ΔΕΝ αλλάζουμε πλέον τα symptoms/diagnosis στην αρχική εγγραφή!
     * Πριν: medicalCase.setSymptoms(symptoms) — αντικαθιστούσε τα ΑΡΧΙΚΑ συμπτώματα
     * με τα τελευταία, χάνοντας την αρχική διάγνωση.
     * Τώρα: Κρατάμε τα αρχικά symptoms/diagnosis και προσθέτουμε μόνο στο conversation.
     */
    public MedicalCase appendConversation(Long caseId, String symptoms, String diagnosis, String type, String tags) {
        MedicalCase medicalCase = medicalCaseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε περιστατικό με id: " + caseId));

        // Δημιουργούμε ή ανακτούμε το υπάρχον conversation array
        JSONArray conversation;
        if (medicalCase.getConversation() != null && !medicalCase.getConversation().isEmpty()) {
            conversation = new JSONArray(medicalCase.getConversation());
        } else {
            conversation = new JSONArray();
            // Αν είναι η πρώτη φορά, αποθηκεύουμε και τα ΑΡΧΙΚΑ στοιχεία στο conversation
            JSONObject firstEntry = new JSONObject();
            firstEntry.put("question", medicalCase.getSymptoms());
            firstEntry.put("answer", medicalCase.getDiagnosis());
            firstEntry.put("type", medicalCase.getType());
            conversation.put(firstEntry);
        }

        // Προσθέτουμε το νέο Q&A
        JSONObject entry = new JSONObject();
        entry.put("question", symptoms);
        entry.put("answer", diagnosis);
        entry.put("type", type);
        conversation.put(entry);

        // Αποθηκεύουμε το ενημερωμένο conversation
        medicalCase.setConversation(conversation.toString());

        // ΔΕΝ αλλάζουμε τα αρχικά symptoms/diagnosis — μένουν ως είχαν!

        // Ενημέρωση tags αν δόθηκαν
        if (tags != null && !tags.isEmpty()) {
            medicalCase.setTags(tags);
        }

        return medicalCaseRepository.save(medicalCase);
    }

    /**
     * Ενημερώνει μόνο τα tags ενός περιστατικού.
     */
    public MedicalCase updateTags(Long id, String tags) {
        MedicalCase medicalCase = medicalCaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε περιστατικό με id: " + id));
        medicalCase.setTags(tags);
        return medicalCaseRepository.save(medicalCase);
    }
}
