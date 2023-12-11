package service;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import io.quarkus.mailer.reactive.ReactiveMailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.extern.java.Log;
import org.jboss.logging.Logger;

import java.util.Collections;

@ApplicationScoped
public class MailService {
    @Inject
    ReactiveMailer mailer;

    private static final Logger LOG = Logger.getLogger(MailService.class.getName());
    public void sendEmail(String recipient, String subject, String body, String cc) {
        LOG.debug("sendEmail");
        mailer.send(Mail.withText(recipient, subject, body).setCc(Collections.singletonList(cc))).onItemOrFailure().invoke(() -> {
            System.out.println("Mail sent"); //TODO logger?
        }).await().atMost(java.time.Duration.ofSeconds(2));
    }
}
