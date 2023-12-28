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

    public List<Notification> getAllNotificationsForUserWithId(Long id) {

        User user = this.userRepository.findById(id);

        return entityManager.createQuery(
                        "SELECT n FROM Notification n " +
                                "WHERE :userId MEMBER OF n.connectedUsers", Notification.class)
                .setParameter("userId", user)
                .getResultList();
    }
}
