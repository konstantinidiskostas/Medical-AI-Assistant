package com.medical.ai.exception;

import com.medical.ai.dtos.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * Παγκόσμιος χειριστής εξαιρέσεων (Global Exception Handler).
 *
 * Αντί να έχουμε try-catch σε κάθε controller με διαφορετική μορφή σφάλματος,
 * το @ControllerAdvice επιτρέπει σε ΜΙΑ κλάση να χειρίζεται ΟΛΑ τα σφάλματα
 * της εφαρμογής και να επιστρέφει ΠΑΝΤΑ την ίδια δομή JSON.
 *
 * Π.χ. αν ένα Service πετάξει RuntimeException, εδώ το πιάνουμε και
 * επιστρέφουμε ένα όμορφο ErrorResponse.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Πιάνει RuntimeException — τη συνηθισμένη εξαίρεση στις υπηρεσίες μας.
     * Επιστρέφει HTTP 400 (Bad Request) με περιγραφή του σφάλματος.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        ErrorResponse error = new ErrorResponse("Σφάλμα επεξεργασίας", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Πιάνει ΟΛΕΣ τις άλλες εξαιρέσεις (π.χ. NullPointerException).
     * Επιστρέφει HTTP 500 (Internal Server Error).
     * Σε production, καλό θα ήταν να μην στέλνουμε το stack trace στον χρήστη,
     * αλλά να το λογκάρουμε σε αρχείο.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse error = new ErrorResponse("Εσωτερικό σφάλμα", "Προέκυψε ένα απρόβλεπτο σφάλμα. Παρακαλώ δοκιμάστε ξανά.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
