package service;

import entity.Notification;
import entity.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import miscellaneous.ServiceException;
import org.jboss.logging.Logger;
import persistence.NotificationRepository;
import persistence.UserRepository;

import java.util.List;

@ApplicationScoped
public class NotificationService {

    @Inject
    NotificationRepository notificationRepository;

    @Inject
    UserRepository userRepository;

    private static final Logger LOG = Logger.getLogger(ListingService.class.getName());

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public void createNotification(Notification notification) throws ServiceException {
        LOG.debug("createNotification");
        try {
            notificationRepository.persist(notification);
        } catch (IllegalArgumentException e) {
            LOG.error("Error in createTag: " + e.getMessage());
            throw new ServiceException("Error while creating tag");
        }
    }

    @Transactional
    public List<Notification> getAllNotificationsForUserWithId(Long id) {
        User user = this.userRepository.findById(id);
        return entityManager.createQuery(
                        "SELECT n FROM Notification n " +
                                "WHERE :userId MEMBER OF n.connectedUsers", Notification.class)
                .setParameter("userId", user)
                .getResultList();
    }

    @Transactional
    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }
    @Transactional
    public void deleteUserFromNotification(Long userId, Long notificationId) throws ServiceException {
        User user = this.userRepository.findById(userId);
        if (user == null){
            LOG.error("Error in removeUserFromNotification: User with this id does not exist");
            throw new ServiceException("User with this id does not exist");
        }

        Notification notification = this.notificationRepository.findById(notificationId);
        if (notification == null){
            LOG.error("Error in removeUserFromNotification: Notification with this id does not exist");
            throw new ServiceException("Notification with this id does not exist");
        }

        if (notification.getConnectedUsers().contains(user)){
            // delete Notification if no user is associated with it
            if (notification.getConnectedUsers().size() - 1 == 0){
                this.notificationRepository.delete(notification);
            }else{
                notification.getConnectedUsers().remove(user);
                this.notificationRepository.persist(notification);
            }
        }else{
            LOG.error("Error in removeUserFromNotification: Notification does not contain given user");
            throw new ServiceException("Notification does not contain given user");
        }
    }

}
