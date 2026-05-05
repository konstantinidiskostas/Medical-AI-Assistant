package com.medical.ai.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Utility class for generating and validating JSON Web Tokens (JWT).
 * This class handles the encryption and decryption of the authentication tokens.
 */
@Component
public class JwtUtil {

    // Generates a secure secret key for signing the tokens (HMAC-SHA256)
    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // Token expiration time: Set to 24 hours (in milliseconds)
    private static final long EXPIRATION_TIME = 86400000;

    /**
     * Generates a new JWT token for an authenticated user.
     * @param username The username of the logged-in doctor.
     * @return A signed JWT string.
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
     * Extracts the username from a given JWT token.
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
     * Validates if the token is properly signed and has not expired.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(SECRET_KEY).build().parseClaimsJws(token);
            return true; // Token is valid
        } catch (Exception e) {
            return false; // Token is invalid or expired
        }
    }
}