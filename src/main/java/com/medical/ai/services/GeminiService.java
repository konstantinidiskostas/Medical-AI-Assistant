package com.medical.ai.services;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


/**
 * Η κλάση GeminiService αναλαμβάνει την επικοινωνία με το εξωτερικό API του Google Gemini.
 * Υλοποιεί τη δημιουργία του HTTP αιτήματος, την ενσωμάτωση κανόνων μορφοποίησης (Prompt Engineering)
 * και την αποκωδικοποίηση της JSON απάντησης του LLM.
 */
@Service
public class GeminiService {
    /**
     * Εισαγωγή του API κλειδιού από το application.properties το οποίο αποθηκεύεται στις
     * environment variables.
     */
    @Value("${gemini.api.key}")
    private String apiKey;
    /**
     * Εισαγωγή του URL του τελικού σημείου (endpoint) του API από το αρχείο ρυθμίσεων.
     */
    @Value("${gemini.api.url}")
    private String apiUrl;
    /**
     * Αποστέλλει το ερώτημα του χρήστη στο AI και επιστρέφει την παραγόμενη απάντηση.
     * @param incomingQuery Το αρχικό κείμενο ερωτήματος που παρέχεται από το χρήστη.
     * @return Την τελική απάντηση του μοντέλου σε μορφή JSON (ως String) ή μήνυμα σφάλματος.
     */
    public String getAiDiagnosis(String incomingQuery) {
        RestTemplate restTemplate = new RestTemplate();
        String requestUrl = apiUrl + "?key=" + apiKey;
        // Διαμόρφωση των HTTP Headers του αιτήματος
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Αρχικοποίηση του κύριου JSON αντικειμένου για το σώμα του αιτήματος
        JSONObject requestBodyJson = new JSONObject();

        // Διαμόρφωση του generationConfig ώστε το μοντέλο να επιστρέφει αυστηρά JSON δεδομένα
        JSONObject generationConfig = new JSONObject();
        generationConfig.put("response_mime_type", "application/json");


        requestBodyJson.put("generationConfig", generationConfig);
        String engineeredPrompt = "";
        // Προσθήκη στις ρυθμίσεις του JSON για να αναγκάσουμε το output να είναι JSON

        generationConfig.put("response_mime_type", "application/json");

        requestBodyJson.put("generationConfig", generationConfig);
        // Ορισμός του βασικού ρόλου και των αυστηρών οδηγιών μορφοποίησης
        String baseRole = "Είσαι ένας εξειδικευμένος ιατρικός βοηθός AI. "
                + "Απάντησε ΑΠΟΚΛΕΙΣΤΙΚΑ σε μορφή JSON. Μην συμπεριλάβεις κανένα άλλο κείμενο πριν ή μετά το JSON, ούτε markdown αστεράκια. "
                + "Το πεδίο 'confidence' πρέπει να είναι ΑΥΣΤΗΡΑ ένας αριθμός από το 1 έως το 10 (όπου 10 είναι η απόλυτη βεβαιότητα). "
                + "Το JSON πρέπει να έχει ακριβώς αυτή τη δομή: "
                + "{\"diagnosis\": \"...\", \"confidence\": \"...\", \"analysis\": \"...\", \"recommendations\": [], \"red_flags\": []}. ";

        // Ανάλυση Συμπτωμάτων
        if (incomingQuery.startsWith("Ανάλυση Συμπτωμάτων:")) {
            String actualQuery = incomingQuery.replace("Ανάλυση Συμπτωμάτων:", "").trim();
            engineeredPrompt = baseRole + "Ανάλυσε τα εξής συμπτώματα: '" + actualQuery + "'. "
                    + "Στο πεδίο recommendations βάλε μια λίστα από ιατρικές εξετάσεις. "
                    + "Στο πεδίο red_flags βάλε κρίσιμα σημεία προσοχής.";


        } else if (incomingQuery.startsWith("Επεξήγηση Εξετάσεων:")) {
            String actualQuery = incomingQuery.replace("Επεξήγηση Εξετάσεων:", "").trim();
            engineeredPrompt = baseRole + "Αποτελέσματα εξετάσεων: '" + actualQuery + "'. "
                    + "Εξήγησε τα αποτελέσματα κλινικά. Χρησιμοποίησε **έντονα γράμματα** για τιμές εκτός φυσιολογικών ορίων και περιέγραψε σύντομα την κλινική τους σημασία.";

        } else if (incomingQuery.startsWith("Συμβουλές Πρόληψης:")) {
            String actualQuery = incomingQuery.replace("Συμβουλές Πρόληψης:", "").trim();
            engineeredPrompt = baseRole + "Ερώτημα πρόληψης: '" + actualQuery + "'. "
                    + "Παράθεσε ιατρικές κατευθυντήριες οδηγίες (guidelines) σε αυστηρή μορφή λίστας με bullets (π.χ. * Οδηγία 1).";

        } else {
            // Γενική Ερώτηση
            String actualQuery = incomingQuery.replace("Γενική Ερώτηση:", "").trim();
            engineeredPrompt = baseRole + "Ιατρικό ερώτημα: '" + actualQuery + "'. Δώσε μια άμεση, τεκμηριωμένη και κλινική απάντηση χωρίς περιττολογίες.";
        }

        // Κατασκευή της δομής του JSON payload που απαιτεί το Gemini API
        JSONObject part = new JSONObject();
        part.put("text", engineeredPrompt);

        JSONArray partsArray = new JSONArray();
        partsArray.put(part);

        JSONObject content = new JSONObject();
        content.put("parts", partsArray);

        JSONArray contentsArray = new JSONArray();
        contentsArray.put(content);

        requestBodyJson = new JSONObject();
        // Προσθήκη του πίνακα contents στο κύριο σώμα του αιτήματος
        requestBodyJson.put("contents", contentsArray);
        // Δημιουργία του τελικού HTTP Entity που περιέχει το JSON σώμα και τα Headers
        HttpEntity<String> request = new HttpEntity<>(requestBodyJson.toString(), headers);

        try {
            // Εκτέλεση του συγχρονισμένου POST HTTP αιτήματος
            ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, request, String.class);
            String rawJson = response.getBody();
            // Ανάλυση (parsing) της απάντησης για την εξαγωγή του παραγόμενου κειμένου
            JSONObject jsonObject = new JSONObject(rawJson);
            return jsonObject.getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text");

        } catch (Exception e) {
            // Διαχείριση εξαιρέσεων δικτύου ή σφαλμάτων αποκωδικοποίησης (parsing errors)
            return "Σφάλμα AI: Προέκυψε πρόβλημα με την ανάλυση (" + e.getMessage() + "). Δοκιμάστε ξανά σε λίγο.";
        }
    }
}