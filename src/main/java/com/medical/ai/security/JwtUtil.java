package com.medical.ai.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Βοηθητική κλάση για τη δημιουργία και επικύρωση JWT tokens.
 *
 * ΔΙΟΡΘΩΣΗ: Το μυστικό κλειδί ΔΕΝ παράγεται πλέον τυχαία σε κάθε εκκίνηση.
 * Αντίθετα, διαβάζεται από το application.properties (jwt.secret).
 *
 * Πλεονεκτήματα:
 * 1. Τα tokens παραμένουν έγκυρα μετά από restart του server
 * 2. Πολλαπλά instances του server μπορούν να μοιράζονται το ίδιο κλειδί
 * 3. Μπορούμε να αλλάξουμε το κλειδί χωρίς να ξαναγράψουμε κώδικα
 */
@Component
public class JwtUtil {

    /** Μυστικό κλειδί για υπογραφή JWT — διαβάζεται από application.properties */
    private final SecretKey SECRET_KEY;

    /** Token λήγει μετά από 24 ώρες */
    private static final long EXPIRATION_TIME = 86400000;

    /**
     * Κατασκευαστής: παίρνει το μυστικό κλειδί από το application.properties.
     * @param secret Το κλειδί σε μορφή string (πρέπει να είναι ≥ 32 χαρακτήρες)
     */
    public JwtUtil(@Value("${jwt.secret}") String secret) {
        // Μετατρέπουμε το string σε SecretKey που καταλαβαίνει η βιβλιοθήκη jjwt
        this.SECRET_KEY = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Δημιουργεί ένα νέο JWT token για έναν χρήστη.
     * @param username Το όνομα χρήστη
     * @return Το υπογεγραμμένο JWT token
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    /**
     * Εξάγει το username από ένα JWT token.
     */
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Ελέγχει αν ένα JWT token είναι έγκυρο (σωστή υπογραφή + μη ληγμένο).
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(SECRET_KEY).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
