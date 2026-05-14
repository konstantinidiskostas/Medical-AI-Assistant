package com.medical.ai.services;

import com.medical.ai.dtos.RegisterRequest;
import com.medical.ai.dtos.UserResponse;
import com.medical.ai.entities.User;
import com.medical.ai.repositories.UserRepository;
import com.medical.ai.security.RoleConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Υπηρεσία διαχείρισης χρηστών.
 * Χειρίζεται εγγραφή, σύνδεση, έγκριση και διαγραφή χρηστών.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Εγγράφει έναν νέο χρήστη στο σύστημα.
     *
     * ΔΙΟΡΘΩΣΗ: Χρησιμοποιούμε RegisterRequest DTO αντί για User entity,
     * ώστε να ελέγχουμε ΑΚΡΙΒΩΣ ποια πεδία επιτρέπουμε.
     * Επιπλέον, αν κάποιος προσπαθήσει να εγγραφεί ως Admin,
     * τον βάζουμε αυτόματα σε κατάσταση "Pending_Admin" — πρέπει να εγκριθεί
     * από άλλον Admin πριν μπορέσει να συνδεθεί.
     *
     * @param request Τα στοιχεία εγγραφής από το frontend
     * @return Το UserResponse (χωρίς κωδικό!)
     */
    @Transactional
    public UserResponse registerUser(RegisterRequest request) {
        // Δημιουργούμε ένα νέο User με τα απολύτως απαραίτητα πεδία
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());

        // Αν ο χρήστης δήλωσε "Admin", τον βάζουμε σε αναμονή έγκρισης
        if (RoleConstants.ADMIN.equalsIgnoreCase(request.getRole())) {
            user.setRole(RoleConstants.PENDING_ADMIN);
            user.setEnabled(false);
        } else {
            // Αλλιώς, τον κάνουμε απλό γιατρό
            user.setRole(RoleConstants.DOCTOR);
            user.setEnabled(true);
        }

        // Αποθηκεύουμε και επιστρέφουμε τα στοιχεία (χωρίς τον κωδικό)
        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    /**
     * Βρίσκει χρήστη με βάση το username.
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Επιστρέφει όλους τους χρήστες.
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Επιστρέφει όλους τους χρήστες που περιμένουν έγκριση (Pending_Admin).
     */
    public List<User> getPendingUsers() {
        return userRepository.findByRole(RoleConstants.PENDING_ADMIN);
    }

    /**
     * Εγκρίνει έναν χρήστη: τον κάνει από "Pending_Admin" σε "Admin".
     */
    @Transactional
    public User approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε χρήστης με id: " + id));
        user.setRole(RoleConstants.ADMIN);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    /**
     * Διαγράφει έναν χρήστη.
     */
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * Ενημερώνει τα στοιχεία ενός χρήστη.
     *
     * ΔΙΟΡΘΩΣΗ: ΑΦΑΙΡΈΘΗΚΕ η δυνατότητα αλλαγής ρόλου!
     * Πριν, οποιοσδήποτε authenticated χρήστης μπορούσε να αλλάξει τον ρόλο
     * οποιουδήποτε (π.χ. να γίνει Admin). Τώρα ο ρόλος ΜΕΝΕΙ ως έχει.
     */
    public User updateUser(Long id, User updated) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε χρήστης με id: " + id));

        if (updated.getFirstName() != null) user.setFirstName(updated.getFirstName());
        if (updated.getLastName() != null) user.setLastName(updated.getLastName());
        if (updated.getEmail() != null) user.setEmail(updated.getEmail());
        if (updated.getUsername() != null && !updated.getUsername().equals(user.getUsername())) {
            if (userRepository.findByUsername(updated.getUsername()).isPresent()) {
                throw new RuntimeException("Το username '" + updated.getUsername() + "' χρησιμοποιείται ήδη.");
            }
            user.setUsername(updated.getUsername());
        }
        // ΣΗΜΕΙΩΣΗ: Ο ρόλος ΔΕΝ αλλάζει μέσω αυτού του endpoint!
        // Η έγκριση γίνεται μόνο μέσω του approveUser().

        return userRepository.save(user);
    }

    /**
     * Βοηθητική μέθοδος: μετατρέπει ένα User entity σε UserResponse
     * (χωρίς τον κωδικό) για ασφαλή αποστολή στο frontend.
     */
    public static UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
