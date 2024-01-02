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
        try{
            mailer.send(Mail.withText(recipient, subject, body).setCc(Collections.singletonList(cc))).onItemOrFailure().invoke(() -> {
                LOG.debug("Mail sent to Listing owner");
            }).await().atMost(java.time.Duration.ofSeconds(2));
        }catch (Exception e){
            LOG.debug("Mailer got Exception: " + e);
        }
    }
}
