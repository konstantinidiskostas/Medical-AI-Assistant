package com.medical.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Η κύρια κλάση εκκίνησης της εφαρμογής Ιατρικού Βοηθού με AI.
 *
 * Το @SpringBootApplication είναι μια συντόμευση που περιλαμβάνει:
 * - @Configuration: δηλώνει ότι η κλάση περιέχει ρυθμίσεις του Spring
 * - @EnableAutoConfiguration: λέει στο Spring να ρυθμίσει αυτόματα ό,τι χρειάζεται
 * - @ComponentScan: ψάχνει για @Component, @Service, @Controller κλπ. σε όλο το project
 *
 * Η εφαρμογή τρέχει σε έναν ενσωματωμένο Apache Tomcat server
 * στην πόρτα 8080 (προεπιλογή του Spring Boot).
 */
@SpringBootApplication
public class MedicalAIApplication {

    public static void main(String[] args) {
        // Εκκίνηση της εφαρμογής — όλα ξεκινάνε από εδώ!
        SpringApplication.run(MedicalAIApplication.class, args);
    }
}
