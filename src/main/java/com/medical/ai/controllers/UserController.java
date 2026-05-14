package com.medical.ai.controllers;

import com.medical.ai.dtos.AuthResponse;
import com.medical.ai.dtos.RegisterRequest;
import com.medical.ai.dtos.UserResponse;
import com.medical.ai.entities.User;
import com.medical.ai.security.JwtUtil;
import com.medical.ai.security.RoleConstants;
import com.medical.ai.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller για εγγραφή, σύνδεση και διαχείριση χρηστών.
 *
 * ΔΙΟΡΘΩΣΕΙΣ ΑΣΦΑΛΕΙΑΣ:
 * 1. Register: χρησιμοποιεί RegisterRequest DTO (όχι User entity)
 * 2. Login: επιστρέφει UserResponse (χωρίς τον κωδικό!)
 * 3. Όλα τα admin endpoints προστατεύονται από το SecurityConfig με hasRole()
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Εγγραφή νέου χρήστη.
     * Χρησιμοποιούμε RegisterRequest DTO για να ελέγξουμε ΑΚΡΙΒΩΣ τι αποδεχόμαστε.
     *
     * @param request Τα στοιχεία εγγραφής (όχι ολόκληρο το User entity!)
     * @return Το UserResponse (χωρίς τον κωδικό)
     */
    @PostMapping("/register")
    public UserResponse registerUser(@RequestBody RegisterRequest request) {
        return userService.registerUser(request);
    }

    /**
     * Σύνδεση χρήστη (login).
     * Επιστρέφει JWT token + βασικά στοιχεία χρήστη (ΧΩΡΙΣ τον κωδικό!).
     *
     * @param loginRequest Τα διαπιστευτήρια (username, password)
     * @return AuthResponse με token και UserResponse
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        try {
            // 1. Αυθεντικοποίηση μέσω Spring Security
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            // 2. Ανάκτηση χρήστη από τη βάση
            User user = userService.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε χρήστης"));

            // 3. Έλεγχος: αν ο λογαριασμός είναι υπό έγκριση, απαγορεύεται η είσοδος
            if (RoleConstants.PENDING_ADMIN.equals(user.getRole())) {
                return ResponseEntity.status(401).body("Ο λογαριασμός δεν έχει εγκριθεί ακόμα.");
            }

            // 4. Δημιουργία JWT token
            String token = jwtUtil.generateToken(user.getUsername());

            // 5. Επιστροφή token + στοιχείων χρήστη (ΧΩΡΙΣ κωδικό!)
            UserResponse userResponse = UserService.toUserResponse(user);
            return ResponseEntity.ok(new AuthResponse(token, userResponse));

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Λάθος username ή κωδικός.");
        }
    }

    /**
     * Προβολή όλων των χρηστών (μόνο για Admin).
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * Προβολή χρηστών που περιμένουν έγκριση (μόνο για Admin).
     */
    @GetMapping("/pending")
    public ResponseEntity<List<User>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    /**
     * Έγκριση νέου Admin (μόνο για Admin).
     */
    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        try {
            User user = userService.approveUser(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Ενημέρωση στοιχείων χρήστη (μόνο για Admin).
     * ΣΗΜΕΙΩΣΗ: Ο ρόλος ΔΕΝ αλλάζει μέσω αυτού του endpoint!
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updated = userService.updateUser(id, user);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Διαγραφή χρήστη (μόνο για Admin).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Σφάλμα κατά τη διαγραφή χρήστη.");
        }
    }
}
