package miscellaneous;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import service.NotificationService;

@ApplicationScoped
public class NotificationValidator {

    @Inject
    NotificationService notificationService;

}
