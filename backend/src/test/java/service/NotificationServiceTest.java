package service;

import entity.Listing;
import entity.Notification;
import entity.User;
import enums.Qualification;
import enums.UserType;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.ServiceException;
import miscellaneous.ValidationException;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import persistence.DatabaseContainerMock;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@QuarkusTestResource(value = DatabaseContainerMock.class, restrictToAnnotatedClass = true)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class NotificationServiceTest {


    @Inject
    ListingService listingService;

    @Inject
    UserService userService;

    @Inject
    NotificationService notificationService;

    private User consumer;
    private User provider;
    private User provider2;
    private User provider3;

    private Listing listing;

    @BeforeAll
    void setup() throws ServiceException, ValidationException {
        User user = new User();
        user.setName("Conny Consumer");
        user.setEmail("consumer@ase.at");
        user.setPassword("123456789Test");
        user.setUserType(UserType.ListingConsumer);
        this.consumer = userService.registerUser(user);

        user = new User();
        user.setName("Peter Provider");
        user.setEmail("provider@ase.at");
        user.setPassword("123456789Test");
        user.setUserType(UserType.ListingProvider);
        this.provider = userService.registerUser(user);

        user = new User();
        user.setName("Paul Provider");
        user.setEmail("provider2@ase.at");
        user.setPassword("123456789Test");
        user.setUserType(UserType.ListingProvider);
        this.provider2 = userService.registerUser(user);

        user = new User();
        user.setName("Prince Provider");
        user.setEmail("provider3@ase.at");
        user.setPassword("123456789Test");
        user.setUserType(UserType.ListingProvider);
        this.provider3 = userService.registerUser(user);

        this.listing = new Listing();
        this.listing.setTitle("Title");
        this.listing.setDetails("Listing details");
        this.listing.setRequirement(Qualification.Bachelors);
        this.listing.setUniversity("University of Vienna");
        this.listing.setCreatedAt(Date.from(java.time.Instant.now()));
        this.listing.setActive(true);
        this.listing.setOwner(provider);
        this.listing = this.listingService.createListing(this.listing);
    }

    @Test
    void applyForListingShouldCreateNotificationForListingOwner() {
        assertDoesNotThrow(() -> {
            int before = this.notificationService.getAllNotificationsForUserWithId(this.provider.getId()).size();
            this.listingService.applyForThesis(this.listing.getId(), this.consumer.getId(), "TEST");
            List<Notification> notifications = this.notificationService.getAllNotificationsForUserWithId(this.provider.getId());
            assertEquals(before + 1, notifications.size());
        });
    }

    @Test
    void applyForListingShouldNotCreateNotificationForListingConsumer() {
        assertDoesNotThrow(() -> {
            this.listingService.applyForThesis(this.listing.getId(), this.consumer.getId(), "TEST");
            List<Notification> notifications = this.notificationService.getAllNotificationsForUserWithId(this.consumer.getId());
            assertEquals(0, notifications.size());
        });
    }

    @Test
    void deleteUserFromNotificationWithNonexistentNotificationShouldThrowServiceException() {
        assertThrows(ServiceException.class, () -> this.notificationService.deleteUserFromNotification(21l, 12l));
    }

    @Test
    void deleteUserFromNotificationWithNonexistentUserShouldThrowServiceException() {
        assertDoesNotThrow(() -> {
            this.listingService.applyForThesis(this.listing.getId(), this.consumer.getId(), "TEST");
            List<Notification> notifications = this.notificationService.getAllNotificationsForUserWithId(this.provider.getId());
            assertEquals(1, notifications.size());
            assertThrows(ServiceException.class, () -> this.notificationService.deleteUserFromNotification(21l, notifications.get(0).getId()));
        });
    }

    @Test
    void deleteUserFromNotificationWithValidUserAndNotificationShouldDeleteNotification() {
        assertDoesNotThrow(() -> {
            int before = this.notificationService.getAllNotificationsForUserWithId(this.provider.getId()).size();
            this.listingService.applyForThesis(this.listing.getId(), this.consumer.getId(), "TEST");
            List<Notification> notifications = this.notificationService.getAllNotificationsForUserWithId(this.provider.getId());
            assertEquals(before + 1, notifications.size());
            this.notificationService.deleteUserFromNotification(this.provider.getId(), notifications.get(0).getId());
            notifications = this.notificationService.getAllNotificationsForUserWithId(this.provider.getId());
            assertEquals(before, notifications.size());
        });
    }
}
