package com.medical.ai.controllers;

import com.medical.ai.services.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for handling AI-powered medical queries.
 * This controller acts as the bridge between the Frontend and the AI Service (Gemini).
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173") // Allow requests from React development server
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    /**
     * Handles POST requests for AI-assisted diagnosis.
     * 1. Consults the Gemini AI model with the provided symptoms.
     * 2. Returns the AI response to the frontend for doctor review.
     * NOTE: This endpoint no longer persists the case directly to the database.
     * * @param request The data transfer object containing the symptom query.
     * @return The AI-generated diagnosis wrapped in an AiResponse object.
     */
    @PostMapping("/query")
    public AiResponse askAi(@RequestBody AiRequest request) {

        // Call the AI Service with optional conversation history for context
        String actualAiResponse = geminiService.getAiDiagnosis(request.getQuery(), request.getConversation());

        // Wrap and return the response so the frontend can display it for review
        AiResponse response = new AiResponse();
        response.setDiagnosis(actualAiResponse);

        return response;
    }
}

/**
 * Data Transfer Object (DTO) for incoming AI requests.
 * Ensures strict data typing for JSON communication between Frontend and Backend.
 */
class AiRequest {
    private String query;
    private Long caseId;
    private String conversation; // JSON array of previous Q&A pairs

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public Long getCaseId() { return caseId; }
    public void setCaseId(Long caseId) { this.caseId = caseId; }

    public String getConversation() { return conversation; }
    public void setConversation(String conversation) { this.conversation = conversation; }
}

/**
 * Data Transfer Object (DTO) for outgoing AI responses.
 * Used to send the generated diagnosis back to the frontend cleanly.
 */
class AiResponse {
    private String diagnosis;

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
}