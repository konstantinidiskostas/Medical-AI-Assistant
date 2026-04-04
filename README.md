# Medical AI Assistant 🩺🤖

A modern medical history management system and diagnosis support tool powered by Artificial Intelligence. This project is my undergraduate thesis.

## 📋 Description
The application allows healthcare professionals to manage patient profiles, record medical cases, and receive AI-generated diagnostic support based on clinical data.

## 🏗️ Architecture (Backend)
The project follows the standard **3-Tier Architecture** of Spring Boot:
* **Entities:** Database schema definitions (User, Patient, MedicalCase).
* **Repositories:** Data Access Layer for MySQL communication (Spring Data JPA).
* **Services (Planned):** Business logic and AI integration layer.
* **Controllers:** REST Endpoints for frontend connectivity.

## 🛠️ Technology Stack
* **Java 25** (OpenJDK)
* **Spring Boot 3.2.4**
* **Spring Data JPA** (Hibernate)
* **MySQL Database**
* **Maven** (Dependency Management)

## 🚀 Development Roadmap
1. [x] Database Schema Design (ER Diagram)
2. [x] Implementation of Entities (User, Patient, MedicalCase)
3. [ ] Repository & Controller Layer Development
4. [ ] Spring Security Integration (JWT Authentication)
5. [ ] AI Diagnosis Support Integration
6. [ ] Frontend Development (Web UI)

## ⚙️ Setup & Execution
To run this application locally:
1. Clone the repository.
2. Configure your database settings in `src/main/resources/application.properties`.
3. Run the application using Maven:
   ```bash
   mvn spring-boot:run