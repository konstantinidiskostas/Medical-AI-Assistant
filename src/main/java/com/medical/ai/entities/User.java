package com.medical.ai.entities;


import jakarta.persistence.*;

/**
 * @Entity: Δηλώνει ότι αυτή η κλάση είναι ένα μοντέλο δεδομένων
 * που θα αντιστοιχιστεί σε έναν πίνακα της βάσης δεδομένων.
 * @Table: Ορίζει το όνομα του πίνακα στη βάση (εδώ 'users').
 */
@Entity
@Table(name = "users")
public class User {

    /**
     * @Id: Δηλώνει ότι αυτό το πεδίο είναι το Πρωτεύον Κλειδί (Primary Key).
     * @GeneratedValue: Λέει στη βάση να δίνει αυτόματα νούμερο (1, 2, 3...)
     * σε κάθε νέο χρήστη (Auto-increment).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * @Column: Ορίζει ιδιότητες για τη στήλη.
     * nullable = false: Δεν επιτρέπεται να είναι κενό.
     * unique = true: Δεν επιτρέπεται δεύτερος χρήστης με το ίδιο username.
     */
    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private Boolean enabled = true;

    public User() {}

    /**
     * Constructor με παραμέτρους
     */
    public User(String username, String password, String firstName, String lastName, String email, String role) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
    }

    // --- Getters και Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }


    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}