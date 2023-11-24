package service;

import entity.User;
import enums.UserType;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.ServiceException;
import miscellaneous.ValidationException;
import org.junit.jupiter.api.Test;
import persistence.DatabaseContainerMock;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
@QuarkusTest
@QuarkusTestResource(DatabaseContainerMock.class)
class UserServiceTest {
    @Inject
    UserService userService;

    @Test
    void insertUserWithInvalidMailShouldThrowValidationException() {
        User user = new User();
        user.setName("Test");
        user.setEmail("test");
        user.setPassword("123456789Test");
        user.setUserType(UserType.ListingConsumer);
        assertThrows(ValidationException.class, () -> userService.registerUser(user));
    }

    @Test
    void insertUserWithInvalidPasswordShouldThrowValidationException() {
        User user = new User();
        user.setName("Test");
        user.setEmail("test@test.com");
        user.setPassword("123");
        user.setUserType(UserType.ListingConsumer);
        assertThrows(ValidationException.class, () -> userService.registerUser(user));
    }

    @Test
    void insertUserWithInvalidUserTypeShouldThrowValidationException() {
        User user = new User();
        user.setName("Test");
        user.setEmail("test1@test.com");
        user.setPassword("123456789Test");
        user.setUserType(null);
        assertThrows(ValidationException.class, () -> userService.registerUser(user));
    }

    @Test
    @Transactional
    void insertUserWithValidDataShouldReturnUser() throws ValidationException, ServiceException {
        User user = new User();
        user.setName("Test");
        user.setEmail("test2@test.com");
        user.setPassword("123456789Test");
        user.setUserType(UserType.ListingConsumer);
        User retUser = userService.registerUser(user);
        assertEquals(user, retUser);
    }

    @Test
    @Transactional
    void insertUserWithDuplicateEmailShouldThrowServiceException() throws ValidationException, ServiceException {
        User user = new User();
        user.setName("Test");
        user.setEmail("test3@test.com");
        user.setPassword("123456789Test");
        user.setUserType(UserType.ListingConsumer);
        userService.registerUser(user);
        User user1 = new User();
        user1.setName("Test");
        user1.setEmail("test3@test.com");
        user1.setPassword("123456789Test");
        user1.setUserType(UserType.ListingConsumer);
        assertThrows(ServiceException.class, () -> userService.registerUser(user1));
    }
}
