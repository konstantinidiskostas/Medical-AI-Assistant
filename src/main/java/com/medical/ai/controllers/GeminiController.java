package com.medical.ai.controllers;

import com.medical.ai.services.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller για AI ιατρικά ερωτήματα.
 * Αποτελεί τη γέφυρα μεταξύ Frontend και AI Service (Gemini).
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173") // Επιτρέπει κλήσεις από το React development server
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    /**
     * Δέχεται POST αιτήματα για AI διάγνωση.
     * 1. Ερωτά το μοντέλο Gemini AI με τα συμπτώματα
     * 2. Επιστρέφει την AI απόκριση στο frontend για έλεγχο
     *
     * @param request Το DTO που περιέχει το ερώτημα
     * @return Η AI διάγνωση σε ένα AiResponse αντικείμενο
     */
    @PostMapping("/query")
    public AiResponse askAi(@RequestBody AiRequest request) {

        // Κλήση AI Service με προαιρετικό ιστορικό συνομιλίας
        String actualAiResponse = geminiService.getAiDiagnosis(request.getQuery(), request.getConversation());

        // Τυλίγουμε την απόκριση για εμφάνιση στο frontend
        AiResponse response = new AiResponse();
        response.setDiagnosis(actualAiResponse);

        return response;
    }
}

/**
 * DTO για εισερχόμενα AI ερωτήματα.
 * Εξασφαλίζει αυστηρούς τύπους δεδομένων για JSON επικοινωνία.
 */
class AiRequest {
    private String query;
    private Long caseId;
    private String conversation; // Πίνακας JSON με προηγούμενα Q&A ζεύγη

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public Long getCaseId() { return caseId; }
    public void setCaseId(Long caseId) { this.caseId = caseId; }

    public String getConversation() { return conversation; }
    public void setConversation(String conversation) { this.conversation = conversation; }
}

/**
 * DTO για εξερχόμενες AI αποκρίσεις.
 * Στέλνει την παραγόμενη διάγνωση στο frontend.
 */
class AiResponse {
    private String diagnosis;

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
}
