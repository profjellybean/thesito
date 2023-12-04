package service;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import io.quarkus.mailer.reactive.ReactiveMailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.extern.java.Log;

import java.util.Collections;

@ApplicationScoped
public class MailService {
    @Inject
    ReactiveMailer mailer;


    public void sendEmail(String recipient, String subject, String body, String cc) {
        mailer.send(Mail.withText(recipient, subject, body).setCc(Collections.singletonList(cc))).onItemOrFailure().invoke(() -> {
            System.out.println("Mail sent"); //TODO logger?
        }).await().atMost(java.time.Duration.ofSeconds(10));
    }
}
