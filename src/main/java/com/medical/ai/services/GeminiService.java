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

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public String getAiDiagnosis(String incomingQuery) {
        RestTemplate restTemplate = new RestTemplate();
        String requestUrl = apiUrl + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // --- PROMPT ENGINEERING ΣΤΟ BACKEND ---
        String engineeredPrompt = "";
        String baseRole = "Δράσε ως ένας κορυφαίος ιατρός και σύμβουλος υγείας AI. Απάντησε στα Ελληνικά στον γιατρό που χειρίζεται το εργαλείο. ";

        if (incomingQuery.startsWith("Ανάλυση Συμπτωμάτων:")) {
            String actualQuery = incomingQuery.replace("Ανάλυση Συμπτωμάτων:", "").trim();
            engineeredPrompt = baseRole + "Ο ασθενής αναφέρει τα εξής συμπτώματα: '" + actualQuery + "'. "
                    + "Δώσε μια δομημένη απάντηση που να περιλαμβάνει: 1) Πιθανή Διάγνωση, 2) Αιτιολόγηση (Confidence Score), 3) Προτεινόμενες ενέργειες/εξετάσεις. "
                    + "Χρησιμοποίησε έντονα γράμματα (**κείμενο**) για τις επικεφαλίδες.";

        } else if (incomingQuery.startsWith("Επεξήγηση Εξετάσεων:")) {
            String actualQuery = incomingQuery.replace("Επεξήγηση Εξετάσεων:", "").trim();
            engineeredPrompt = baseRole + "Εξήγησε τα παρακάτω αποτελέσματα εξετάσεων με απλά και κατανοητά λόγια για τον γιατρό: '" + actualQuery + "'. "
                    + "Δώσε έμφαση σε τυχόν τιμές εκτός φυσιολογικών ορίων.";

        } else if (incomingQuery.startsWith("Συμβουλές Πρόληψης:")) {
            String actualQuery = incomingQuery.replace("Συμβουλές Πρόληψης:", "").trim();
            engineeredPrompt = baseRole + "Με βάση το παρακάτω ερώτημα: '" + actualQuery + "', "
                    + "δώσε εξατομικευμένες συμβουλές πρόληψης και υγιεινής ζωής σε μορφή λίστας.";

        } else {
            // Αν είναι "Γενική Ερώτηση" ή οτιδήποτε άλλο
            String actualQuery = incomingQuery.replace("Γενική Ερώτηση:", "").trim();
            engineeredPrompt = baseRole + "Απάντησε με σαφήνεια και επαγγελματισμό στην εξής ιατρική ερώτηση: '" + actualQuery + "'.";
        }

        // Φτιάχνουμε το JSON που περιμένει η Google
        JSONObject part = new JSONObject();
        part.put("text", engineeredPrompt);

        JSONArray partsArray = new JSONArray();
        partsArray.put(part);

        JSONObject content = new JSONObject();
        content.put("parts", partsArray);

        JSONArray contentsArray = new JSONArray();
        contentsArray.put(content);

        JSONObject requestBodyJson = new JSONObject();
        requestBodyJson.put("contents", contentsArray);

        HttpEntity<String> request = new HttpEntity<>(requestBodyJson.toString(), headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, request, String.class);
            String rawJson = response.getBody();

            JSONObject jsonObject = new JSONObject(rawJson);
            return jsonObject.getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text");

        } catch (Exception e) {
            return "Σφάλμα AI: Προέκυψε πρόβλημα με την ανάλυση (" + e.getMessage() + "). Δοκιμάστε ξανά σε λίγο.";
        }
    }
}