package com.medical.ai.security;

import com.medical.ai.entities.User;
import com.medical.ai.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Υπηρεσία που χρειάζεται το Spring Security για να φορτώσει τα στοιχεία
 * ενός χρήστη από τη βάση δεδομένων κατά τη διάρκεια της σύνδεσης (authentication).
 *
 * ΔΙΟΡΘΩΣΗ: Προσθέσαμε τα GrantedAuthority (ρόλοι) ώστε το Spring Security
 * να μπορεί να ελέγχει ΠΟΙΟΣ έχει πρόσβαση σε ΠΟΙΟ endpoint!
 *
 * Πριν: new ArrayList<>() — ΚΑΝΕΝΑΣ ρόλος, οπότε όλοι είχαν πρόσβαση σε όλα.
 * Τώρα: SimpleGrantedAuthority("ROLE_Doctor") — ο χρήστης έχει τον ρόλο του.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Βρίσκουμε τον χρήστη στη βάση
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Δεν βρέθηκε χρήστης με username: " + username));

        // Δημιουργούμε μία λίστα με τα δικαιώματα (authorities) του χρήστη.
        // Το Spring Security θέλει τα roles στη μορφή "ROLE_ΟΝΟΜΑ".
        // Π.χ. αν ο χρήστης έχει role = "Admin", γίνεται "ROLE_Admin".
        // Αυτό επιτρέπει τη χρήση .hasRole("Admin") στο SecurityConfig.
        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority(RoleConstants.ROLE_PREFIX + user.getRole())
        );

        // Επιστρέφουμε τον χρήστη του Spring Security με τα δικαιώματά του
        // και enabled = true (το enabled το διαχειριζόμαστε εμείς στο login endpoint)
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                true, // enabled — το ελέγχουμε χειροκίνητα στο login
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                authorities // Ο ΡΟΛΟΣ! Αυτό έλειπε και προκαλούσε το κενό ασφαλείας
        );
    }
}
