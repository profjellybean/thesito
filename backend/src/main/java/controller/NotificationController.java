package controller;

import entity.Notification;
import entity.Tag;
import jakarta.inject.Inject;
import miscellaneous.ServiceException;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.GraphQLException;
import org.eclipse.microprofile.graphql.Query;
import org.jboss.logging.Logger;
import service.NotificationService;

import java.util.List;

@GraphQLApi
public class NotificationController {

    @Inject
    NotificationService notificationService;

    private static final Logger LOG = Logger.getLogger(TagController.class.getName());

    @Query("getAllNotificationsForUserWithId")
    @Description("Fetches a list of all notifications for a user in the database")
    public List<Notification> getAllNotificationsForUserWithId(Long id) throws GraphQLException {
        LOG.info("getAllNotificationsForUserWithId");
        return notificationService.getAllNotificationsForUserWithId(id);
    }
}
