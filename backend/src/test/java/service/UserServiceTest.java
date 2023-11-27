package service;

import entity.User;
import enums.UserType;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
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

@Test
void getUserByValidIdShouldReturnUser() throws ServiceException, ValidationException {
  User user = new User();
  user.setName("Test");
  user.setEmail("test@test.com");
  user.setPassword("123456789Test");
  user.setUserType(UserType.ListingConsumer);
  User insertedUser = userService.registerUser(user);
  // Retrieve the user by ID and assert equality
  userService.getUserById(insertedUser.id);
  User retrievedUser = userService.getUserById(insertedUser.id);

  assertEquals(insertedUser, retrievedUser);
}

@Test
void getUserByInvalidIdShouldThrowServiceException() throws ServiceException, ValidationException {
  assertThrows(ServiceException.class, () -> userService.getUserById(1L));
}

  @Test
  @Transactional
  void insertUserAndLogin() throws ValidationException, ServiceException {
    String password = "123456789Test";
    User user = new User();
    user.setName("Test");
    user.setEmail("test4@test.com");
    user.setPassword(password);
    user.setUserType(UserType.ListingConsumer);
    userService.registerUser(user);
    userService.loginUser(user.getEmail(), password);
  }


  @Test
  @Transactional
  void updateExistingUser() throws ValidationException, ServiceException {
    User user = new User();
    user.setName("Created User");
    user.setEmail("test@create.com");
    user.setPassword("1234Test");
    user.setUserType(UserType.ListingConsumer);

    User createdUser = userService.registerUser(user);

    assertEquals(user.getName(), createdUser.getName());
    assertEquals(user.getEmail(), createdUser.getEmail());

    createdUser.setName("Updated User");
    createdUser.setEmail("test@update.com");
    createdUser.setUserType(UserType.ListingConsumer);
    createdUser.setPassword("");
    User updatedUser = userService.updateUser(createdUser);

    assertEquals("test@update.com", updatedUser.getEmail());
    assertEquals("Updated User", updatedUser.getName());
  }

  @Test
  @Transactional
  void graphQLAuthenticationTests() throws ValidationException, ServiceException {
    String password = "123456789Test";
    User consumer = new User();
    consumer.setName("Consumer");
    consumer.setEmail("conumer1@test.com");
    consumer.setPassword(password);
    consumer.setUserType(UserType.ListingConsumer);
    userService.registerUser(consumer);
    String consumer_jwt = userService.loginUser(consumer.getEmail(), password);

    User provider = new User();
    provider.setName("Provider");
    provider.setEmail("provider1@test.com");
    provider.setPassword(password);
    provider.setUserType(UserType.ListingProvider);
    userService.registerUser(provider);
    String provider_jwt = userService.loginUser(provider.getEmail(), password);

    User admin = new User();
    admin.setName("Admin");
    admin.setEmail("admin@test.com");
    admin.setPassword(password);
    admin.setUserType(UserType.Administrator);
    userService.registerUser(admin);
    String admin_jwt = userService.loginUser(admin.getEmail(), password);

    String query = "{\"query\":\"query Consumer {\n  getAllUsersListingConsumer {\n    id\n  }\n}\",\"operationName\":\"Consumer\"}";
    RestAssured.given().when().header("Authorization", "Bearer " + consumer_jwt).body(query).post("/graphql").then()
        .assertThat()
        .statusCode(200).log();

    query = "{\"query\":\"query Consumer {\n  getAllUsersListingProvider {\n    id\n  }\n}\",\"operationName\":\"Consumer\"}";
    RestAssured.given().when().header("Authorization", "Bearer " + provider_jwt).body(query).post("/graphql").then()
        .assertThat()
        .statusCode(200).log();

    query = "{\"query\":\"query Consumer {\n  getAllUsersAdministrator {\n    id\n  }\n}\",\"operationName\":\"Consumer\"}";
    RestAssured.given().when().header("Authorization", "Bearer " + admin_jwt).body(query).post("/graphql").then()
        .assertThat()
        .statusCode(200).log();

  }

}
