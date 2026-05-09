package com.medical.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RestController;


/**
 * Η κύρια κλάση της εφαρμογής.
 * Από εδώ ξεκινάει όλη η διαδικασία φόρτωσης του Spring Boot.
 *
 *
 * @SpringBootApplication
 * Επιτελεί τρεις βασικές λειτουργίες:
 * 1. Ενεργοποιεί το Auto-Configuration (ρυθμίζει αυτόματα τη βάση, τον server κλπ).
 * 2. Ενεργοποιεί το Component Scanning, δηλαδή λέει στο Spring να "σαρώσει" όλο το
 * project για να βρει και να συνδέσει αυτόματα Controllers, Services και Entities.
 * 3. Επιτρέπει στην κλάση να λειτουργήσει ως πηγή ρυθμίσεων (Configuration).
 *
 * @RestController
 * Δηλώνει ότι η κλάση λειτουργεί ως Web API Endpoint (σταθμός υποδοχής αιτημάτων).
 * Συνδυάζει τα @Controller και @ResponseBody, λέγοντας στην Java ότι κάθε μέθοδος
 * επιστρέφει απευθείας δεδομένα στο Frontend (React) και όχι
 * απλές σελίδες HTML. Είναι απαραίτητο για τη σύνδεση της διεπαφής με το Backend.
 */
@SpringBootApplication
@RestController
public class MedicalAIApplication {

    public static void main(String[] args) {
        // Εκκίνηση της εφαρμογής και του ενσωματωμένου Tomcat
        SpringApplication.run(MedicalAIApplication.class, args);
    }
}