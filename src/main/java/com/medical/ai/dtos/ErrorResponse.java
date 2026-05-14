package com.medical.ai.dtos;

import java.time.LocalDateTime;

/**
 * Τυποποιημένο DTO για την αποστολή μηνυμάτων σφάλματος στο frontend.
 *
 * Αντί να στέλνουμε ένα απλό string ή ένα RuntimeException.getMessage(),
 * χρησιμοποιούμε αυτή την κλάση ώστε όλα τα σφάλματα να έχουν
 * ΟΜΟΙΟΜΟΡΦΗ δομή JSON:
 *
 *   { "error": "Τίτλος σφάλματος",
 *     "message": "Αναλυτική περιγραφή",
 *     "timestamp": "2025-01-15T10:30:00" }
 *
 * Αυτό κάνει τη διαχείριση σφαλμάτων πιο εύκολη στο frontend.
 */
public class ErrorResponse {

    private String error;
    private String message;
    private LocalDateTime timestamp;

    public ErrorResponse(String error, String message) {
        this.error = error;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    // --- Getters ---

    public String getError() { return error; }
    public String getMessage() { return message; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
