package controller;

import entity.Notification;
import entity.Tag;
import io.quarkus.security.UnauthorizedException;
import jakarta.inject.Inject;
import miscellaneous.ServiceException;
import org.eclipse.microprofile.graphql.*;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;
import service.NotificationService;

import java.util.List;

@GraphQLApi
public class NotificationController {

    @Inject
    JsonWebToken jwt;
    @Inject
    NotificationService notificationService;

    private static final Logger LOG = Logger.getLogger(TagController.class.getName());

    @Query("getAllNotificationsForUserWithId")
    @Description("Fetches a list of all notifications for a user in the database")
    public List<Notification> getAllNotificationsForUserWithId(Long id) throws GraphQLException {
        LOG.info("getAllNotificationsForUserWithId");
        // check if sender is allowed
        if (!id.equals(Long.parseLong(jwt.getClaim("userid").toString())) && !jwt.getGroups().contains("Administrator")){
            throw new UnauthorizedException();
        }
        return notificationService.getAllNotificationsForUserWithId(id);
    }

    @Mutation
    @Description("Removes the given user from the given Notification and deletes it, if there are not associated users left")
    public void deleteUserFromNotification(Long userId, Long notificationId) throws GraphQLException{
        LOG.info("deleteUserFromNotification");
        // check if sender is allowed
        if (!userId.equals(Long.parseLong(jwt.getClaim("userid").toString())) && !jwt.getGroups().contains("Administrator")){
            throw new UnauthorizedException();
        }
        try{
            this.notificationService.deleteUserFromNotification(userId, notificationId);
        }catch (ServiceException e) {
            LOG.error("Error in deleteUserFromNotification: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

}
