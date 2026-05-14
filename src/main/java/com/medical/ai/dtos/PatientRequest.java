package com.medical.ai.dtos;

/**
 * DTO για αιτήματα δημιουργίας/ενημέρωσης ασθενή.
 *
 * ΔΙΟΡΘΩΣΗ: Τα πεδία έγιναν private (ήταν public, που σπάει την encapsulation).
 * Τώρα έχουμε getters/setters όπως σε όλα τα σωστά DTOs.
 */
public class PatientRequest {

    private String firstName;
    private String lastName;
    private String amka;
    private int age;
    private String gender;
    private String telephone;
    private Long doctorId;

    // --- Getters ---

    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getAmka() { return amka; }
    public int getAge() { return age; }
    public String getGender() { return gender; }
    public String getTelephone() { return telephone; }
    public Long getDoctorId() { return doctorId; }

    // --- Setters ---

    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setAmka(String amka) { this.amka = amka; }
    public void setAge(int age) { this.age = age; }
    public void setGender(String gender) { this.gender = gender; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
}
