package service;

import io.quarkus.mailer.Mail;
import io.quarkus.mailer.reactive.ReactiveMailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
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
            if (cc != null){
                mailer.send(Mail.withHtml(recipient, subject, body).setCc(Collections.singletonList(cc))).onItemOrFailure().invoke(() -> {
                    LOG.debug("Mail sent to Listing owner");
                }).await().atMost(java.time.Duration.ofSeconds(2));
            }else{
                mailer.send(Mail.withHtml(recipient, subject, body)).onItemOrFailure().invoke(() -> {
                    LOG.debug("Mail sent to User without CC");
                }).await().atMost(java.time.Duration.ofSeconds(2));
            }
        }catch (Exception e){
            LOG.debug("Mailer got Exception: " + e);
        }
    }

}
