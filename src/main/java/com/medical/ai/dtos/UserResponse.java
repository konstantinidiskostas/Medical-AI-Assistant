package com.medical.ai.dtos;

/**
 * DTO για την αποστολή δεδομένων χρήστη στο frontend.
 *
 * ΓΙΑΤΙ ΔΕΝ ΣΤΕΛΝΟΥΜΕ ΤΟ USER ENTITY ΑΠΕΥΘΕΙΑΣ:
 * Το User entity περιέχει τον κωδικοποιημένο κωδικό (password hash).
 * Ακόμα κι αν είναι hashed, ΔΕΝ πρέπει να φεύγει από το backend
 * για λόγους ασφαλείας (βλ. OWASP).
 *
 * Αυτό το DTO περιέχει ΜΟΝΟ όσα χρειάζεται το frontend:
 * - id: για αναγνώριση του χρήστη
 * - username: για εμφάνιση
 * - firstName, lastName: για εμφάνιση
 * - email: για επικοινωνία
 * - role: για ελέγχους πρόσβασης (π.χ. "Admin")
 */
public class UserResponse {

    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String role;

    // Κατασκευαστής: παίρνει ένα User entity και κρατάει ΜΟΝΟ τα πεδία που χρειαζόμαστε
    public UserResponse(Long id, String username, String firstName, String lastName, String email, String role) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
    }

    // --- Getters (απαραίτητα για τη μετατροπή σε JSON) ---

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}
