package service;

import entity.RefreshToken;
import entity.User;
import enums.UserType;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import io.smallrye.jwt.build.Jwt;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.ServiceException;
import miscellaneous.Session;
import miscellaneous.ValidationException;
import org.junit.jupiter.api.Test;
import persistence.DatabaseContainerMock;
import persistence.RefreshTokenRepository;

import java.util.Arrays;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;
import java.security.KeyPairGenerator;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.NoSuchAlgorithmException;

@QuarkusTest
@QuarkusTestResource(DatabaseContainerMock.class)
class UserServiceTest {
  @Inject
  UserService userService;

  @Inject
  RefreshTokenRepository refreshTokenRepository;

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
  assertThrows(ServiceException.class, () -> userService.getUserById(-999999L));
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
    userService.getSession(user.getEmail(), password);
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
    createdUser.setPassword("");
    User updatedUser = userService.updateUser(createdUser);

    assertEquals("test@update.com", updatedUser.getEmail());
    assertEquals("Updated User", updatedUser.getName());
  }

  @Test
  @Transactional
  void loginAndRefreshSession() throws ServiceException, ValidationException{
    String password = "123456789Test";
    User user = new User();
    user.setName("Test");
    user.setEmail("test5@test.com");
    user.setPassword(password);
    user.setUserType(UserType.ListingConsumer);
    userService.registerUser(user);
    Session session = userService.getSession(user.getEmail(), password);
    RefreshToken refreshToken_old = refreshTokenRepository.find("userid", user.id).firstResult();
    Long count = refreshTokenRepository.find("userid", user.id).count();
    userService.refreshSession(session.refreshToken);
    RefreshToken refreshToken_new = refreshTokenRepository.find("userid", user.id).firstResult();
    // old refresh token uuid does not match the new one
    assertFalse(refreshToken_new.equals(refreshToken_old));
    // refresh tokens are single-use
    assertEquals(count,1);
  }

  @Test
  @Transactional
  void unauthorizedAccessTest1() throws ValidationException, ServiceException {
    String password = "123456789Test";
    User user = new User();
    user.setName("Test");
    user.setEmail("test6@test.com");
    user.setPassword(password);
    user.setUserType(UserType.ListingConsumer);
    userService.registerUser(user);
    Session session = userService.getSession(user.getEmail(), password);
    RefreshToken refreshToken= refreshTokenRepository.find("userid", user.id).firstResult();
    String expired_refresh_token = Jwt.issuer("https://thesito.org")
            .upn(user.id.toString())
            .groups(new HashSet<>(Arrays.asList(user.getUserType().name())))
            .expiresAt(1695881286)
            .claim("usage", "refresh_token")
            .claim("uuid", refreshToken.getUuid())
            .claim("userid", user.id.toString())
            .sign();
    assertThrows(ServiceException.class, () -> userService.refreshSession(expired_refresh_token));
  }

  @Test
  @Transactional
  void unauthorizedAccessTest2() throws ValidationException, ServiceException, NoSuchAlgorithmException {
    String password = "123456789Test";
    User user = new User();
    user.setName("Test");
    user.setEmail("test7@test.com");
    user.setPassword(password);
    user.setUserType(UserType.ListingConsumer);
    userService.registerUser(user);
    Session session = userService.getSession(user.getEmail(), password);
    RefreshToken refreshToken= refreshTokenRepository.find("userid", user.id).firstResult();
    KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
    keyGen.initialize(2048);
    KeyPair pair = keyGen.generateKeyPair();
    PrivateKey privateKey = pair.getPrivate();
    String wrong_signature_refresh_token = Jwt.issuer("https://thesito.org")
            .upn(user.id.toString())
            .groups(new HashSet<>(Arrays.asList(user.getUserType().name())))
            .expiresIn(900)
            .claim("usage", "refresh_token")
            .claim("uuid", refreshToken.getUuid())
            .claim("userid", user.id.toString())
            .sign(privateKey);
    assertThrows(ServiceException.class, () -> userService.refreshSession(wrong_signature_refresh_token));
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
    Session consumer_session = userService.getSession(consumer.getEmail(), password);
    String consumer_jwt = consumer_session.accessToken;

    User provider = new User();
    provider.setName("Provider");
    provider.setEmail("provider1@test.com");
    provider.setPassword(password);
    provider.setUserType(UserType.ListingProvider);
    userService.registerUser(provider);
    Session provider_session = userService.getSession(provider.getEmail(), password);
    String provider_jwt = provider_session.accessToken;

    User admin = new User();
    admin.setName("Admin");
    admin.setEmail("admin@test.com");
    admin.setPassword(password);
    admin.setUserType(UserType.Administrator);
    userService.registerUser(admin);
    Session admin_session = userService.getSession(admin.getEmail(), password);
    String admin_jwt = admin_session.accessToken;


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
