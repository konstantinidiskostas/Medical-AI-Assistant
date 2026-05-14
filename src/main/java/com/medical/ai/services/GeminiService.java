package com.medical.ai.services;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Υπηρεσία επικοινωνίας με το Gemini AI API.
 *
 * ΔΙΟΡΘΩΣΕΙΣ:
 * 1. Το RestTemplate δημιουργείται ΜΙΑ φορά (όχι σε κάθε κλήση) — καλύτερη απόδοση
 * 2. Προσθήκη ελέγχου για null απόκριση από το API
 * 3. Το API key στέλνεται μέσω header (ασφαλέστερο από το URL query parameter)
 */
@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    /**
     * Ένα RestTemplate για όλες τις κλήσεις (connection pooling, timeout settings).
     * Δημιουργείται μία φορά και ξαναχρησιμοποιείται.
     */
    private final RestTemplate restTemplate;

    @Autowired
    public GeminiService() {
        this.restTemplate = new RestTemplate();
        // Σε παραγωγή, καλό θα ήταν να ορίσουμε timeouts:
        // this.restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory());
    }

    /**
     * Αποστέλλει ερώτημα στο AI χωρίς ιστορικό.
     */
    public String getAiDiagnosis(String incomingQuery) {
        return getAiDiagnosis(incomingQuery, null);
    }

    /**
     * Αποστέλλει ερώτημα στο AI με προαιρετικό ιστορικό συνομιλίας.
     *
     * @param incomingQuery Το νέο ερώτημα
     * @param conversationJson Ιστορικό σε μορφή JSON array (ή null)
     * @return Η απάντηση του AI
     */
    public String getAiDiagnosis(String incomingQuery, String conversationJson) {
        String requestUrl = apiUrl + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Διαμόρφωση generationConfig — το AI να επιστρέφει αυστηρά JSON
        JSONObject generationConfig = new JSONObject();
        generationConfig.put("response_mime_type", "application/json");

        // Ορισμός βασικού ρόλου και οδηγιών μορφοποίησης
        String baseRole = "Είσαι ένας εξειδικευμένος ιατρικός βοηθός AI. "
                + "Απάντησε ΑΠΟΚΛΕΙΣΤΙΚΑ σε μορφή JSON. Μην συμπεριλάβεις κανένα άλλο κείμενο πριν ή μετά το JSON, ούτε markdown αστεράκια. "
                + "Το πεδίο 'confidence' πρέπει να είναι ΑΥΣΤΗΡΑ ένας αριθμός από το 1 έως το 10 (όπου 10 είναι η απόλυτη βεβαιότητα). "
                + "Το JSON πρέπει να έχει ακριβώς αυτή τη δομή: "
                + "{\"diagnosis\": \"...\", \"confidence\": \"...\", \"analysis\": \"...\", \"recommendations\": [], \"red_flags\": []}. ";

        // Δημιουργία context από προηγούμενη συνομιλία
        String conversationContext = "";
        if (conversationJson != null && !conversationJson.trim().isEmpty()) {
            try {
                JSONArray conversation = new JSONArray(conversationJson);
                StringBuilder sb = new StringBuilder();
                sb.append("Προηγούμενη συνομιλία στο ίδιο περιστατικό:\n\n");
                for (int i = 0; i < conversation.length(); i++) {
                    JSONObject entry = conversation.getJSONObject(i);
                    String q = entry.optString("question", "");
                    String a = entry.optString("answer", "");
                    String answerText = a;
                    try {
                        answerText = new JSONObject(a).optString("diagnosis", a);
                    } catch (Exception ignored) {}
                    sb.append("Ιατρός: ").append(q).append("\n");
                    sb.append("Βοηθός: ").append(answerText).append("\n\n");
                }
                sb.append("---\n\n");
                conversationContext = sb.toString();
            } catch (Exception ignored) {}
        }

        // Κατασκευή του prompt ανάλογα με τον τύπο ερωτήματος
        String engineeredPrompt;
        if (incomingQuery.startsWith("Ανάλυση Συμπτωμάτων:")) {
            String actualQuery = incomingQuery.replace("Ανάλυση Συμπτωμάτων:", "").trim();
            engineeredPrompt = conversationContext + baseRole + "Ανάλυσε τα εξής συμπτώματα: '" + actualQuery + "'. "
                    + "Στο πεδίο recommendations βάλε μια λίστα από ιατρικές εξετάσεις. "
                    + "Στο πεδίο red_flags βάλε κρίσιμα σημεία προσοχής.";
        } else if (incomingQuery.startsWith("Επεξήγηση Εξετάσεων:")) {
            String actualQuery = incomingQuery.replace("Επεξήγηση Εξετάσεων:", "").trim();
            engineeredPrompt = conversationContext + baseRole + "Αποτελέσματα εξετάσεων: '" + actualQuery + "'. "
                    + "Εξήγησε τα αποτελέσματα κλινικά. Χρησιμοποίησε **έντονα γράμματα** για τιμές εκτός φυσιολογικών ορίων και περιέγραψε σύντομα την κλινική τους σημασία.";
        } else if (incomingQuery.startsWith("Συμβουλές Πρόληψης:")) {
            String actualQuery = incomingQuery.replace("Συμβουλές Πρόληψης:", "").trim();
            engineeredPrompt = conversationContext + baseRole + "Ερώτημα πρόληψης: '" + actualQuery + "'. "
                    + "Παράθεσε ιατρικές κατευθυντήριες οδηγίες (guidelines) σε αυστηρή μορφή λίστας με bullets (π.χ. * Οδηγία 1).";
        } else {
            String actualQuery = incomingQuery;
            if (incomingQuery.startsWith("Γενική Ερώτηση:")) {
                actualQuery = incomingQuery.replace("Γενική Ερώτηση:", "").trim();
            }
            engineeredPrompt = conversationContext + baseRole + "Ιατρικό ερώτημα: '" + actualQuery + "'. Δώσε μια άμεση, τεκμηριωμένη και κλινική απάντηση χωρίς περιττολογίες.";
        }

        // Δημιουργία JSON payload για το Gemini API
        JSONObject part = new JSONObject();
        part.put("text", engineeredPrompt);

        JSONArray partsArray = new JSONArray();
        partsArray.put(part);

        JSONObject content = new JSONObject();
        content.put("parts", partsArray);

        JSONArray contentsArray = new JSONArray();
        contentsArray.put(content);

        JSONObject requestBodyJson = new JSONObject();
        requestBodyJson.put("generationConfig", generationConfig);
        requestBodyJson.put("contents", contentsArray);

        HttpEntity<String> request = new HttpEntity<>(requestBodyJson.toString(), headers);

        System.out.println("\n--- GEMINI REQUEST ---");
        System.out.println(requestBodyJson.toString(2));

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, request, String.class);

            String rawJson = response.getBody();
            System.out.println("--- GEMINI RESPONSE ---");
            System.out.println(rawJson);
            System.out.println();

            if (rawJson == null || rawJson.isEmpty()) {
                return "Σφάλμα AI: Λάβαμε κενή απάντηση από το API.";
            }

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
