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
 * Service class responsible for handling integration with the Google Gemini AI API.
 * It manages the construction of HTTP requests, payload formatting, and error handling
 * for AI-assisted medical diagnoses.
 */
@Service
public class GeminiService {

    /**
     * The API key for authenticating with Google services.
     * Injected securely from application.properties (resolved via environment variables).
     */
    @Value("${gemini.api.key}")
    private String apiKey;

    /**
     * The endpoint URL for the Gemini API model.
     * Injected from application.properties.
     */
    @Value("${gemini.api.url}")
    private String apiUrl;

    /**
     * Sends patient symptoms to the AI model to retrieve a preliminary diagnosis.
     * * @param symptoms A string describing the symptoms reported by the patient.
     * @return The AI's response payload as a raw JSON string, or an error message if the API call fails.
     */
    public String getAiDiagnosis(String symptoms) {
        RestTemplate restTemplate = new RestTemplate();

        // Append the authentication key as a query parameter to the base URL
        String requestUrl = apiUrl + "?key=" + apiKey;

        // Configure HTTP headers to indicate a JSON payload
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Define the prompt instructing the AI on its persona and objective
        String prompt = "You are an experienced medical doctor. The patient reports the following symptoms: "
                + symptoms +
                ". Based on this information, provide a concise preliminary diagnosis and a confidence score.";

        // Construct the expected JSON payload structure using the org.json library.
        // Required API structure: { "contents": [ { "parts": [ { "text": "prompt" } ] } ] }
        JSONObject part = new JSONObject();
        part.put("text", prompt);

        JSONArray partsArray = new JSONArray();
        partsArray.put(part);

        JSONObject content = new JSONObject();
        content.put("parts", partsArray);

        JSONArray contentsArray = new JSONArray();
        contentsArray.put(content);

        JSONObject requestBodyJson = new JSONObject();
        requestBodyJson.put("contents", contentsArray);

        // Encapsulate the JSON payload and headers into an HttpEntity instance
        HttpEntity<String> request = new HttpEntity<>(requestBodyJson.toString(), headers);

        try {
            // Execute the synchronous POST request to the external API
            ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, request, String.class);

            // Return the response body provided by the generative AI model
            return response.getBody();
        } catch (Exception e) {
            // Log and return a graceful error message in case of network or API failures
            return "AI Service Error - Failed to fetch diagnosis: " + e.getMessage();
        }
    }
}