package com.medical.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController

public class MedicalAIApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedicalAIApplication.class, args);
    }

    @GetMapping("/test")
    public String test() {
        return "Το Medical AI Project ξεκίνησε επιτυχώς χωρίς βάση δεδομένων!";
    }
}