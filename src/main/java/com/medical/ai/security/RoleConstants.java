package com.medical.ai.security;

/**
 * Σταθερές για τους ρόλους χρηστών.
 * Χρησιμοποιούμε σταθερές (constants) αντί για απλά strings (π.χ. "Admin")
 * για να αποφύγουμε τυπογραφικά λάθη και να κάνουμε τον κώδικα πιο συντηρήσιμο.
 * Αν ποτέ αλλάξει το όνομα ενός ρόλου, το αλλάζουμε ΜΟΝΟ εδώ!
 */
public class RoleConstants {

    /** Ρόλος: Απλός Γιατρός — έχει πρόσβαση μόνο στους δικούς του ασθενείς */
    public static final String DOCTOR = "Doctor";

    /** Ρόλος: Διαχειριστής — έχει πρόσβαση σε όλους τους ασθενείς, χρήστες και περιστατικά */
    public static final String ADMIN = "Admin";

    /**
     * Ρόλος: Admin υπό έγκριση.
     * Όταν ένας νέος χρήστης εγγράφεται ως Admin, παίρνει αυτόν τον ρόλο.
     * Μπορεί να κάνει login ΜΟΝΟ όταν ένας υπάρχων Admin τον εγκρίνει
     * και του αλλάξει τον ρόλο σε "Admin".
     */
    public static final String PENDING_ADMIN = "Pending_Admin";

    /** Spring Security θέλει τα roles σε μορφή "ROLE_*" */
    public static final String ROLE_PREFIX = "ROLE_";

    private RoleConstants() {
        // Αποτρέπουμε τη δημιουργία αντικειμένων — είναι κλάση μόνο για σταθερές
    }
}
