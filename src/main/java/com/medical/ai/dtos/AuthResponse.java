package com.medical.ai.dtos;

/**
 * DTO για την απάντηση επιτυχούς σύνδεσης (login).
 *
 * Περιέχει ΜΟΝΟ:
 * - token: το JWT για αυθεντικοποίηση
 * - user: τα βασικά στοιχεία του χρήστη (ΧΩΡΙΣ τον κωδικό!)
 *
 * ΔΕΝ περιλαμβάνουμε το User entity εδώ (για να μην εκτεθεί ο κωδικός).
 * Αντίθετα, χρησιμοποιούμε το UserResponse που έχει μόνο ασφαλή πεδία.
 */
public class AuthResponse {

    private String token;
    private UserResponse user;

    public AuthResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }
}
