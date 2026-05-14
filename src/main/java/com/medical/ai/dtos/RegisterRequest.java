package com.medical.ai.dtos;

/**
 * Data Transfer Object (DTO) για την εγγραφή νέου χρήστη.
 *
 * ΓΙΑΤΙ DTO ΑΝΤΙ ΝΑ ΣΤΕΛΝΟΥΜΕ ΤΟ USER ENTITY:
 * Το User entity έχει πεδία που ΔΕΝ πρέπει να στέλνει ο χρήστης (π.χ. enabled, id).
 * Αν δεχόμαστε το User entity κατευθείαν, κάποιος κακόβουλος θα μπορούσε να στείλει:
 *   { "username": "xxx", "password": "yyy", "role": "Admin", "enabled": true }
 * και να αποκτήσει άμεσα πρόσβαση ως Admin.
 *
 * Το DTO ορίζει ΑΚΡΙΒΩΣ τι πεδία επιτρέπουμε να σταλούν — τίποτα παραπάνω!
 */
public class RegisterRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String username;
    private String password;
    private String role;

    // --- Getters (το Spring χρειάζεται getters για να διαβάσει τα δεδομένα) ---

    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getRole() { return role; }

    // --- Setters ---

    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setEmail(String email) { this.email = email; }
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(String role) { this.role = role; }
}
