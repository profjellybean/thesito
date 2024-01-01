package controller;

import entity.Notification;
import entity.Tag;
import jakarta.inject.Inject;
import miscellaneous.ServiceException;
import org.eclipse.microprofile.graphql.*;
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

    @Mutation
    @Description("Removes the given user from the given Notification and deletes it, if there are not associated users left")
    public void deleteUserFromNotification(Long userId, Long notificationId) throws GraphQLException{
        LOG.info("deleteUserFromNotification");
        try{
            this.notificationService.deleteUserFromNotification(userId, notificationId);
        }catch (ServiceException e) {
            LOG.error("Error in deleteUserFromNotification: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

}
