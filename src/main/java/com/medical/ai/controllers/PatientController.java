package com.medical.ai.controllers;

import com.medical.ai.dtos.PatientRequest;
import com.medical.ai.entities.Patient;
import com.medical.ai.entities.User;
import com.medical.ai.security.RoleConstants;
import com.medical.ai.services.PatientService;
import com.medical.ai.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller για διαχείριση ασθενών.
 *
 * ΚΑΘΕ endpoint παίρνει το Authentication από το Spring Security context
 * και εξάγει τον συνδεδεμένο χρήστη. Έτσι:
 *   - Ένας γιατρός βλέπει/επεξεργάζεται ΜΟΝΟ τους δικούς του ασθενείς
 *   - Ο Admin βλέπει/επεξεργάζεται τα πάντα
 *   - ΔΕΝ εμπιστευόμαστε το doctorId που στέλνει το frontend
 */
@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private UserService userService;

    /**
     * Βοηθητική — βρίσκει τον πλήρη User από το Authentication.
     */
    private User getCurrentUser(Authentication auth) {
        return userService.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε ο συνδεδεμένος χρήστης"));
    }

    /**
     * Δημιουργεί νέο ασθενή.
     * Ο γιατρός προκύπτει από το Authentication — αγνοούμε το doctorId του request.
     */
    @PostMapping
    public Patient createPatient(@RequestBody PatientRequest request, Authentication authentication) {
        User doctor = getCurrentUser(authentication);
        Patient patient = new Patient(
                request.getFirstName(),
                request.getLastName(),
                request.getAmka(),
                request.getAge(),
                request.getGender(),
                request.getTelephone(),
                doctor
        );
        return patientService.savePatient(patient);
    }

    /**
     * Επιστρέφει ασθενείς.
     * Admin → όλους. Γιατρός → μόνο τους δικούς του.
     */
    @GetMapping
    public List<Patient> getAllPatients(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        if (RoleConstants.ADMIN.equals(currentUser.getRole())) {
            return patientService.findAll();
        }
        return patientService.findAllByDoctor(currentUser);
    }

    /**
     * Επιστρέφει ασθενείς ενός συγκεκριμένου γιατρού.
     * Admin → οποιουδήποτε γιατρού. Γιατρός → μόνο τους δικούς του.
     */
    @GetMapping("/doctor/{doctorId}")
    public List<Patient> getPatientsByDoctor(@PathVariable Long doctorId, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        if (RoleConstants.ADMIN.equals(currentUser.getRole())) {
            User doctor = patientService.findDoctorById(doctorId);
            return patientService.findAllByDoctor(doctor);
        }
        if (!currentUser.getId().equals(doctorId)) {
            throw new RuntimeException("Δεν έχετε πρόσβαση σε ασθενείς άλλου γιατρού");
        }
        return patientService.findAllByDoctor(currentUser);
    }

    /**
     * Επιστρέφει έναν συγκεκριμένο ασθενή.
     * Admin → οποιονδήποτε. Γιατρός → μόνο αν είναι δικός του.
     */
    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable Long id, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Patient patient = patientService.findById(id)
                .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε ασθενής με id: " + id));
        if (RoleConstants.ADMIN.equals(currentUser.getRole())) {
            return patient;
        }
        if (!patient.getDoctor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Δεν έχετε πρόσβαση σε αυτόν τον ασθενή");
        }
        return patient;
    }

    /**
     * Ενημερώνει τα στοιχεία ενός ασθενή.
     * Το doctorId του request αγνοείται — ο γιατρός ΔΕΝ αλλάζει.
     */
    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable Long id, @RequestBody PatientRequest request,
                                  Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Patient existingPatient = patientService.findById(id)
                .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε ασθενής με id: " + id));

        if (!RoleConstants.ADMIN.equals(currentUser.getRole()) &&
            !existingPatient.getDoctor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Δεν έχετε δικαίωμα επεξεργασίας αυτού του ασθενή");
        }

        existingPatient.setFirstName(request.getFirstName());
        existingPatient.setLastName(request.getLastName());
        existingPatient.setAmka(request.getAmka());
        existingPatient.setAge(request.getAge());
        existingPatient.setGender(request.getGender());
        existingPatient.setTelephone(request.getTelephone());

        return patientService.savePatient(existingPatient);
    }

    /**
     * Διαγράφει έναν ασθενή.
     * Admin → οποιονδήποτε. Γιατρός → μόνο δικό του.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Long id, Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Patient patient = patientService.findById(id)
                .orElseThrow(() -> new RuntimeException("Δεν βρέθηκε ασθενής με id: " + id));

        if (!RoleConstants.ADMIN.equals(currentUser.getRole()) &&
            !patient.getDoctor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Δεν έχετε δικαίωμα διαγραφής αυτού του ασθενή");
        }

        patientService.deletePatient(id);
        return ResponseEntity.ok().build();
    }
}
