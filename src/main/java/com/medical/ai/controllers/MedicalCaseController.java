package com.medical.ai.controllers;

import com.medical.ai.entities.MedicalCase;
import com.medical.ai.entities.Patient;
import com.medical.ai.entities.User;
import com.medical.ai.services.MedicalCaseService;
import com.medical.ai.services.PatientService;
import com.medical.ai.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST Controller για διαχείριση ιατρικών περιστατικών.
 *
 * ΔΙΟΡΘΩΣΗ: Το doctor_id τώρα ορίζεται σωστά όταν δημιουργείται ένα περιστατικό!
 * Πριν: ο γιατρός ΔΕΝ αποθηκευόταν (doctor_id = NULL στη βάση).
 * Τώρα: Παίρνουμε τον γιατρό από το Authentication του Spring Security.
 */
@RestController
@RequestMapping("/api/medical-cases")
@CrossOrigin(origins = "http://localhost:5173")
public class MedicalCaseController {

    private final MedicalCaseService medicalCaseService;
    private final PatientService patientService;
    private final UserService userService;

    @Autowired
    public MedicalCaseController(MedicalCaseService medicalCaseService, PatientService patientService, UserService userService) {
        this.medicalCaseService = medicalCaseService;
        this.patientService = patientService;
        this.userService = userService;
    }

    /**
     * Δημιουργεί ένα νέο περιστατικό.
     */
    @PostMapping
    public MedicalCase createMedicalCase(@RequestBody MedicalCase medicalCase) {
        if (medicalCase.getDate() == null) {
            medicalCase.setDate(LocalDateTime.now());
        }
        return medicalCaseService.createMedicalCase(medicalCase);
    }

    /**
     * Αποθηκεύει ένα νέο περιστατικό ΑΦΟΤΟΥ ο γιατρός εγκρίνει τη διάγνωση του AI.
     *
     * ΔΙΟΡΘΩΣΗ: Τώρα ορίζεται το doctor_id από τον συνδεδεμένο χρήστη!
     * Πριν: ο γιατρός δεν οριζόταν ποτέ (doctor_id = NULL στη βάση).
     *
     * @param request Τα δεδομένα του περιστατικού
     * @param authentication Ο authenticated χρήστης (το Spring το γεμίζει αυτόματα)
     * @return Το αποθηκευμένο περιστατικό
     */
    @PostMapping("/save")
    public MedicalCase saveApprovedCase(@RequestBody CaseRequest request, Authentication authentication) {
        // 1. Βρίσκουμε τον ασθενή
        Patient patient = patientService.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε ασθενής με id: " + request.getPatientId()));

        // 2. Βρίσκουμε τον γιατρό από τον authenticated χρήστη
        String username = authentication.getName();
        User doctor = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε χρήστης: " + username));

        // 3. Δημιουργούμε το νέο περιστατικό με ΟΛΑ τα πεδία (συμπεριλαμβανομένου του γιατρού!)
        MedicalCase newCase = new MedicalCase();
        newCase.setPatient(patient);
        newCase.setDoctor(doctor); // ΔΙΟΡΘΩΣΗ: Αυτό έλειπε!
        newCase.setSymptoms(request.getSymptoms());
        newCase.setDiagnosis(request.getDiagnosis());
        newCase.setType(request.getType());
        newCase.setConversation(request.getConversation());
        newCase.setTags(request.getTags());
        newCase.setDate(LocalDateTime.now());

        return medicalCaseService.createMedicalCase(newCase);
    }

    /**
     * Προσθέτει νέο Q&A σε υπάρχον περιστατικό.
     */
    @PostMapping("/{id}/conversation")
    public MedicalCase appendConversation(@PathVariable Long id, @RequestBody ConversationEntry entry) {
        return medicalCaseService.appendConversation(id, entry.getSymptoms(), entry.getDiagnosis(), entry.getType(), entry.getTags());
    }

    /**
     * Ενημερώνει tags ενός περιστατικού.
     */
    @PutMapping("/{id}/tags")
    public MedicalCase updateTags(@PathVariable Long id, @RequestBody TagsRequest request) {
        return medicalCaseService.updateTags(id, request.getTags());
    }

    /**
     * Επιστρέφει το ιστορικό ενός ασθενή.
     */
    @GetMapping("/patient/{patientId}")
    public List<MedicalCase> getHistory(@PathVariable Long patientId) {
        Patient patient = patientService.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε ασθενής με id: " + patientId));
        return medicalCaseService.getMedicalHistory(patient);
    }

    /**
     * Επιστρέφει ΟΛΑ τα περιστατικά (μόνο για Admin).
     */
    @GetMapping
    public ResponseEntity<List<MedicalCase>> getAllCases() {
        try {
            return ResponseEntity.ok(medicalCaseService.getAllCases());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Διαγράφει ένα περιστατικό.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedicalCase(@PathVariable Long id) {
        try {
            medicalCaseService.deleteCase(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Σφάλμα κατά τη διαγραφή.");
        }
    }
}

// --- DTOs ---

class CaseRequest {
    private Long patientId;
    private String symptoms;
    private String diagnosis;
    private String type;
    private String conversation;
    private String tags;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getConversation() { return conversation; }
    public void setConversation(String conversation) { this.conversation = conversation; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}

class ConversationEntry {
    private String symptoms;
    private String diagnosis;
    private String type;
    private String tags;

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}

class TagsRequest {
    private String tags;

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}
