package com.medical.ai.services;

import com.medical.ai.entities.User;
import com.medical.ai.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Το UserService χειρίζεται όλες τις λειτουργίες που σχετίζονται με τους Χρήστες του Συστήματος (Γιατρούς).
 * Διαχειρίζεται την εγγραφή των χρηστών και τους ελέγχους σύνδεσης (authentication).
 */
@Service
public class UserService {

    // Εξάρτηση: Χρειαζόμαστε το UserRepository για να έχουμε πρόσβαση στα δεδομένα των χρηστών στη βάση.
    private final UserRepository userRepository;

    /**
     * Dependency Injection
     * Το Spring Boot βρίσκει αυτόματα το UserRepository και το
     * δίνει έτοιμο προς χρήση μέσα από αυτόν τον κατασκευαστή.
     */
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    @Autowired
    private PasswordEncoder passwordEncoder; // Εισαγωγή του εργαλείου κρυπτογράφησης
    /**
     * Εγγράφει έναν νέο χρήστη στο σύστημα.
     * Εδώ κρυπτογραφούμε (hash) τον κωδικό πρόσβασης πριν την αποθήκευση για λόγους ασφαλείας.
     * @param user Το αντικείμενο του χρήστη με το username και τον κωδικό του.
     * @return Τον αποθηκευμένο χρήστη.
     */
    public User registerUser(User user) {
        // Κρυπτογράφηση του κωδικού πριν την αποθήκευση στη βάση δεδομένων
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Ψάχνει για έναν χρήστη με βάση το username του.
     * Αυτό είναι απολύτως απαραίτητο για τη διαδικασία Σύνδεσης (Login).
     * @param username Το username που πληκτρολογήθηκε κατά το login.
     * @return Ένα Optional που περιέχει τον χρήστη, αν αυτός υπάρχει στη βάση.
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public User updateUser(Long id, User updated) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        if (updated.getFirstName() != null) user.setFirstName(updated.getFirstName());
        if (updated.getLastName() != null) user.setLastName(updated.getLastName());
        if (updated.getEmail() != null) user.setEmail(updated.getEmail());
        if (updated.getUsername() != null && !updated.getUsername().equals(user.getUsername())) {
            if (userRepository.findByUsername(updated.getUsername()).isPresent()) {
                throw new RuntimeException("Το username '" + updated.getUsername() + "' χρησιμοποιείται ήδη.");
            }
            user.setUsername(updated.getUsername());
        }
        if (updated.getRole() != null) user.setRole(updated.getRole());
        return userRepository.save(user);
    }
}