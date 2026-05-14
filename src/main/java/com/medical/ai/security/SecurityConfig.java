package com.medical.ai.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

/**
 * Κεντρική ρύθμιση ασφαλείας της εφαρμογής.
 *
 * ΔΙΟΡΘΩΣΗ: Προσθέσαμε ελέγχους ρόλων (role-based authorization).
 * Τώρα ΜΟΝΟ οι χρήστες με τον κατάλληλο ρόλο μπορούν να έχουν πρόσβαση
 * σε ευαίσθητα endpoints (π.χ. έγκριση Admin, διαγραφή χρηστών).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Απενεργοποιούμε CSRF (χρησιμοποιούμε JWT tokens, όχι sessions)
                .csrf(csrf -> csrf.disable())

                // 2. Ρύθμιση CORS — επιτρέπουμε μόνο το React frontend μας
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of("http://localhost:5173"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
                    return config;
                }))

                // 3. Κανόνες εξουσιοδότησης (ΠΟΙΟΣ έχει πρόσβαση σε ΤΙ)
                .authorizeHttpRequests(auth -> auth
                        // Δημόσια endpoints (χωρίς authentication)
                        .requestMatchers("/api/users/login", "/api/users/register").permitAll()

                        // Admin-only endpoints (μόνο χρήστες με ρόλο "Admin")
                        .requestMatchers(HttpMethod.GET, "/api/users", "/api/users/pending").hasRole(RoleConstants.ADMIN)
                        .requestMatchers(HttpMethod.PUT, "/api/users/approve/**").hasRole(RoleConstants.ADMIN)
                        .requestMatchers(HttpMethod.PUT, "/api/users/{id}").hasRole(RoleConstants.ADMIN)
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole(RoleConstants.ADMIN)

                        // Admin-only: πρόσβαση σε ΟΛΟΥΣ τους ασθενείς και ΟΛΑ τα περιστατικά
                        .requestMatchers(HttpMethod.GET, "/api/patients").hasAnyRole(RoleConstants.ADMIN, RoleConstants.DOCTOR)
                        .requestMatchers(HttpMethod.GET, "/api/medical-cases").hasRole(RoleConstants.ADMIN)

                        // Όλα τα υπόλοιπα endpoints απαιτούν απλό authentication (οποιοσδήποτε ρόλος)
                        .anyRequest().authenticated()
                )

                // 4. Stateless sessions (δεν κρατάμε session στον server — όλη η πληροφορία στο JWT)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // 5. Προσθέτουμε το JWT φίλτρο ΠΡΙΝ το κανονικό φίλτρο του Spring Security
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
