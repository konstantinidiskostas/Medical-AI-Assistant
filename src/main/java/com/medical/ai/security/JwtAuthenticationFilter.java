package com.medical.ai.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Φίλτρο που παρεμβάλλεται σε ΚΑΘΕ HTTP αίτημα και ελέγχει αν υπάρχει
 * έγκυρο JWT token στην επικεφαλίδα "Authorization".
 *
 * Αν το token είναι έγκυρο, φορτώνει τον χρήστη και τον βάζει στο Spring Security Context
 * (ώστε να είναι "συνδεδεμένος" για τα επόμενα βήματα).
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    /**
     * Logger για καταγραφή σφαλμάτων (αντί για System.out.println).
     */
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // Ελέγχουμε αν υπάρχει header "Authorization: Bearer <token>"
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);

            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                // ΔΙΟΡΘΩΣΗ: Χρησιμοποιούμε logger αντί για System.out.println
                logger.warn("Άκυρο ή ληγμένο JWT token: {}", e.getMessage());
            }
        }

        // Αν βρήκαμε username και δεν υπάρχει ήδη authentication στο context
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwt)) {
                // Δημιουργούμε το authentication token και το βάζουμε στο context
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Συνεχίζουμε την αλυσίδα φίλτρων
        chain.doFilter(request, response);
    }
}
