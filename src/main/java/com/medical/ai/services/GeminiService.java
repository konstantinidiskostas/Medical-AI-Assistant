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
        // --- PROMPT ENGINEERING ΣΤΟ BACKEND ---
        String engineeredPrompt = "";

        // Ο 'Αυστηρός' Ρόλος και οι Απαγορεύσεις (Negative Prompts)
        String baseRole = "Δράσε αυστηρά ως επαγγελματίας ιατρικός αναλυτής AI. Απάντησε αποκλειστικά στα Ελληνικά. "
                + "ΑΥΣΤΗΡΟΣ ΚΑΝΟΝΑΣ: ΜΗΝ χρησιμοποιείς ΠΟΤΕ χαιρετισμούς, προλόγους, επιλόγους ή φιλοφρονήσεις (π.χ. 'Αγαπητέ συνάδελφε', 'Χαίρετε', 'Βεβαίως', 'Ελπίζω να βοήθησα'). "
                + "Ξεκίνα κατευθείαν με την ιατρική ανάλυση. Το ύφος σου πρέπει να είναι απόλυτα κλινικό, αντικειμενικό και επιστημονικό. ";

        if (incomingQuery.startsWith("Ανάλυση Συμπτωμάτων:")) {
            String actualQuery = incomingQuery.replace("Ανάλυση Συμπτωμάτων:", "").trim();
            engineeredPrompt = baseRole + "Αναφερόμενα συμπτώματα ασθενούς: '" + actualQuery + "'. "
                    + "Δώσε την ανάλυση αυστηρά με την εξής δομή: "
                    + "1) **Πιθανή Διάγνωση:** (σύντομα) "
                    + "2) **Confidence Score:** (κλίμακα 1-10 και 1 γραμμή αιτιολόγηση) "
                    + "3) **Προτεινόμενες Ενέργειες/Εξετάσεις:** (σε μορφή λίστας).";

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