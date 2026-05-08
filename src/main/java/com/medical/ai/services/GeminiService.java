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

        // 1. Δημιουργούμε ΠΡΩΤΑ το αντικείμενο
        JSONObject requestBodyJson = new JSONObject();

        // 2. Φτιάχνουμε το config για το JSON output
        JSONObject generationConfig = new JSONObject();
        generationConfig.put("response_mime_type", "application/json");

        // 3. Το βάζουμε στο body
        requestBodyJson.put("generationConfig", generationConfig);
        String engineeredPrompt = "";
        // Προσθήκη στις ρυθμίσεις του JSON για να αναγκάσουμε το output να είναι JSON

        generationConfig.put("response_mime_type", "application/json");

        requestBodyJson.put("generationConfig", generationConfig);
        // Ο 'Αυστηρός' Ρόλος και οι Απαγορεύσεις (Negative Prompts)
        // 1. Το νέο Base Role που επιβάλλει JSON
        String baseRole = "Είσαι ένας εξειδικευμένος ιατρικός βοηθός AI. "
                + "Απάντησε ΑΠΟΚΛΕΙΣΤΙΚΑ σε μορφή JSON. Μην συμπεριλάβεις κανένα άλλο κείμενο πριν ή μετά το JSON, ούτε markdown αστεράκια. "
                + "Το πεδίο 'confidence' πρέπει να είναι ΑΥΣΤΗΡΑ ένας αριθμός από το 1 έως το 10 (όπου 10 είναι η απόλυτη βεβαιότητα). "
                + "Το JSON πρέπει να έχει ακριβώς αυτή τη δομή: "
                + "{\"diagnosis\": \"...\", \"confidence\": \"...\", \"analysis\": \"...\", \"recommendations\": [], \"red_flags\": []}. ";

// 2. Εστίαση στην Ανάλυση Συμπτωμάτων (που είναι το κύριο case σου)
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

        // Φτιάχνουμε το JSON που περιμένει η Google
        JSONObject part = new JSONObject();
        part.put("text", engineeredPrompt);

        JSONArray partsArray = new JSONArray();
        partsArray.put(part);

        JSONObject content = new JSONObject();
        content.put("parts", partsArray);

        JSONArray contentsArray = new JSONArray();
        contentsArray.put(content);

        requestBodyJson = new JSONObject();
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