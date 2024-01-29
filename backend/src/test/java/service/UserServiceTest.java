package service;

import com.password4j.Password;
import entity.Listing;
import entity.RefreshToken;
import entity.User;
import enums.Qualification;
import enums.UserType;
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
import org.junit.jupiter.api.TestInstance;
import persistence.DatabaseContainerMock;
import persistence.RefreshTokenRepository;
import persistence.UserRepository;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

import java.security.KeyPairGenerator;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.NoSuchAlgorithmException;

@QuarkusTest
@QuarkusTestResource(value = DatabaseContainerMock.class, restrictToAnnotatedClass = true)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class UserServiceTest {
    @Inject
    UserService userService;

    @Inject
    UserRepository userRepository;

    @Inject
    RefreshTokenRepository refreshTokenRepository;

    @Inject
    ListingService listingService;

    @Test
    void insertUserWithInvalidMailShouldThrowValidationException() {
        User user = new User();
        user.setName("Test");
        user.setEmail("test");
        user.setPassword("123456789Test");
        user.setUserType(Set.of(UserType.ListingConsumer));
        assertThrows(ValidationException.class, () -> userService.registerUser(user));
    }

    @Test
    void insertUserWithInvalidPasswordShouldThrowValidationException() {
        User user = new User();
        user.setName("Test");
        user.setEmail("test@test.com");
        user.setPassword("123");
        user.setUserType(Set.of(UserType.ListingConsumer));
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
    void insertUserWithValidDataShouldReturnUser() throws ValidationException, ServiceException {
        User user = new User();
        user.setName("Test");
        user.setEmail("test2@test.com");
        user.setPassword("123456789Test");
        user.setUserType(Set.of(UserType.ListingConsumer));
        User retUser = userService.registerUser(user);
        assertEquals(user, retUser);
    }

    @Test
    void insertUserWithDuplicateEmailShouldThrowServiceException() throws ValidationException, ServiceException {
        User user = new User();
        user.setName("Test");
        user.setEmail("test3@test.com");
        user.setPassword("123456789Test");
        user.setUserType(Set.of(UserType.ListingConsumer));
        userService.registerUser(user);
        User user1 = new User();
        user1.setName("Test");
        user1.setEmail("test3@test.com");
        user1.setPassword("123456789Test");
        user1.setUserType(Set.of(UserType.ListingConsumer));
        assertThrows(ServiceException.class, () -> userService.registerUser(user1));
    }

    @Test
    void getUserByValidIdShouldReturnUser() throws ServiceException, ValidationException {
        User user = new User();
        user.setName("Test");
        user.setEmail("test5@test.com");
        user.setPassword("123456789Test");
        user.setUserType(Set.of(UserType.ListingConsumer));
        User insertedUser = userService.registerUser(user);
        // Retrieve the user by ID and assert equality
        userService.getUserById(insertedUser.getId());
        User retrievedUser = userService.getUserById(insertedUser.getId());
        insertedUser.setUserTags(retrievedUser.getUserTags());


        assertEquals(insertedUser, retrievedUser);

        userService.deleteUserById(user.getId());
    }

    @Test
    void getUserByInvalidIdShouldThrowServiceException() throws ServiceException, ValidationException {
        assertThrows(ServiceException.class, () -> userService.getUserById(-999999L));
    }

    @Test
    void insertUserAndLogin() throws ValidationException, ServiceException {
        String password = "123456789Test";
        User user = new User();
        user.setName("Test");
        user.setEmail("test6@test.com");
        user.setPassword(password);
        user.setUserType(Set.of(UserType.ListingConsumer));
        userService.registerUser(user);
        userService.getSession(user.getEmail(), password);
    }
    @Test
    void deleteUserByIdShouldSucceed() throws ServiceException, ValidationException {
        // Create a user
        User user = new User();
        user.setName("John Doe");
        user.setEmail("john.doe@example.com");
        user.setPassword("123456789Test");
        user.setQualification(Qualification.Bachelors);
        user.setUserType(Set.of(UserType.ListingConsumer));
        userService.registerUser(user);

        // Delete the user by ID
        Long userId = user.getId();
        assertDoesNotThrow(() -> userService.deleteUserById(userId));

        // Verify that the user no longer exists
        assertThrows(ServiceException.class, () -> userService.getUserById(userId));
    }

    @Test
    void deleteExistingUserWithFavoritesShouldSucceed() throws ServiceException, ValidationException {

        User user = new User();
        user.setName("John Doe");
        user.setEmail("john.doe156@example.com");
        user.setPassword("123456789Test");
        user.setQualification(Qualification.Bachelors);
        user.setUserType(Set.of(UserType.ListingProvider));
        userService.registerUser(user);
        // Create a listing
        Listing listing = new Listing();
        listing.setTitle("Sample Listing");
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        listing.setUniversity("University of Vienna");
        listing.setActive(true);
        listing.setOwner(user);
        listingService.createListing(listing);



        // Add the listing to the user's favorites
        userService.toggleFavourite(user.getId(), listing.getId());

        // Verify that the user has the listing as a favorite
        assertNotNull(userService.getUserById(user.getId()).getFavourites());
        Long listingId = listing.getId();

        // Attempt to delete the user
        assertDoesNotThrow(() -> userService.deleteUserById(user.getId()));

        assertThrows(ServiceException.class, () -> userService.getUserById(user.getId()));

        assertNull(listingService.getListingById(listingId), "Listing should be removed from user's favorites");
    }

    @Test
    void deleteUserByNonExistingIdShouldThrowError() {
        assertThrows(ServiceException.class, () -> userService.deleteUserById(-123456L));
    }
    @Test
    void deleteListingOwnerUserShouldSucceed() throws ServiceException, ValidationException {
        // Create a user who is also a listing owner
        User user = new User();
        user.setName("Listing Owner");
        user.setEmail("owner@example.com");
        user.setPassword("123456789Test");
        user.setQualification(Qualification.Bachelors);
        user.setUserType(Set.of(UserType.ListingProvider));
        userService.registerUser(user);

        // Create a listing with the user as the owner
        Listing listing = new Listing();
        listing.setTitle("Test Listing");
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        listing.setUniversity("University of Vienna");
        listing.setActive(true);
        listing.setOwner(user);
        listingService.createListing(listing);

        // Attempt to delete the user (listing owner)
        assertDoesNotThrow(() -> userService.deleteUserById(user.getId()));

        // Verify that the user is deleted
        assertThrows(ServiceException.class, () -> userService.getUserById(user.getId()));
        assertNull(listingService.getListingById(listing.getId()));

    }


    @Test
    void updateExistingUser() throws ValidationException, ServiceException {
        User user = new User();
        user.setName("Created User");
        user.setEmail("test7@create.com");
        user.setPassword("1234Test");
        user.setQualification(Qualification.Bachelors);
        user.setUserType(Set.of(UserType.ListingConsumer));

        User createdUser = userService.registerUser(user);

        assertEquals(user.getName(), createdUser.getName());
        assertEquals(user.getEmail(), createdUser.getEmail());
        assertEquals(user.getQualification(), createdUser.getQualification());
        assertEquals(user.getUserType(), createdUser.getUserType());

        createdUser.setName("Updated User");
        createdUser.setEmail("test8@update.com");
        createdUser.setQualification(Qualification.Masters);
        User updatedUser = userService.updateUser(createdUser);

        assertEquals("test8@update.com", updatedUser.getEmail());
        assertEquals("Updated User", updatedUser.getName());
        assertEquals(Qualification.Masters, updatedUser.getQualification());
    }

    @Test
    void loginAndRefreshSession() throws ServiceException, ValidationException {
        String password = "123456789Test";
        User user = new User();
        user.setName("Test");
        user.setEmail("test9@test.com");
        user.setPassword(password);
        user.setUserType(Set.of(UserType.ListingConsumer));
        userService.registerUser(user);
        Session session = userService.getSession(user.getEmail(), password);
        RefreshToken refreshToken_old = refreshTokenRepository.find("userid", user.getId()).firstResult();
        Long count = refreshTokenRepository.find("userid", user.getId()).count();
        userService.refreshSession(session.refreshToken);
        RefreshToken refreshToken_new = refreshTokenRepository.find("userid", user.getId()).firstResult();
        // old refresh token uuid does not match the new one
        assertNotEquals(refreshToken_new, refreshToken_old);
        // refresh tokens are single-use
        assertEquals(count, 1);
    }

    @Test
    void unauthorizedAccessTest1() throws ValidationException, ServiceException {
        String password = "123456789Test";
        User user = new User();
        user.setName("Test");
        user.setEmail("test10@test.com");
        user.setPassword(password);
        user.setUserType(Set.of(UserType.ListingConsumer));
        userService.registerUser(user);
        Session session = userService.getSession(user.getEmail(), password);
        RefreshToken refreshToken = refreshTokenRepository.find("userid", user.getId()).firstResult();
        String expired_refresh_token = Jwt.issuer("https://thesito.org")
                .upn(user.getId().toString())
                .groups(new HashSet<>(Collections.singletonList(user.getUserType().toString())))
                .expiresAt(1695881286)
                .claim("usage", "refresh_token")
                .claim("uuid", refreshToken.getUuid())
                .claim("userid", user.getId().toString())
                .sign();
        assertThrows(ServiceException.class, () -> userService.refreshSession(expired_refresh_token));
    }

    @Test
    void unauthorizedAccessTest2() throws ValidationException, ServiceException, NoSuchAlgorithmException {
        String password = "123456789Test";
        User user = new User();
        user.setName("Test");
        user.setEmail("test11@test.com");
        user.setPassword(password);
        user.setUserType(Set.of(UserType.ListingConsumer));
        userService.registerUser(user);
        Session session = userService.getSession(user.getEmail(), password);
        RefreshToken refreshToken = refreshTokenRepository.find("userid", user.getId()).firstResult();
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        KeyPair pair = keyGen.generateKeyPair();
        PrivateKey privateKey = pair.getPrivate();
        String wrong_signature_refresh_token = Jwt.issuer("https://thesito.org")
                .upn(user.getId().toString())
                .groups(new HashSet<>(Collections.singletonList(user.getUserType().toString())))
                .expiresIn(900)
                .claim("usage", "refresh_token")
                .claim("uuid", refreshToken.getUuid())
                .claim("userid", user.getId().toString())
                .sign(privateKey);
        assertThrows(ServiceException.class, () -> userService.refreshSession(wrong_signature_refresh_token));
    }

    @Test
    void changePasswordWithInvalidNewPassword() throws ValidationException, ServiceException {
        User user = new User();
        user.setName("Test");
        user.setEmail("test12@test.com");
        user.setPassword("123456789Test");
        user.setUserType(Set.of(UserType.ListingConsumer));
        userService.registerUser(user);

        User createdUser = userRepository.find("email","test12@test.com" ).firstResult();

        String newPassword = "abcd"; // Invalid password with only 4 letters
        assertThrows(ValidationException.class, () -> userService.changePassword(user.getPassword(), newPassword, createdUser.getId()));

        // verify that the password remains unchanged
        User userAfterChange = userRepository.findById(createdUser.getId());
        assertTrue(Password.check("123456789Test", userAfterChange.getPassword()).withScrypt());
    }

    @Test
    void changePasswordWithWrongOldPassword() throws ValidationException, ServiceException {
        // Step 1: Create a user with correct data
        User user = new User();
        user.setName("Test");
        user.setEmail("test13@test.com");
        user.setPassword("123456789Test");
        user.setUserType(Set.of(UserType.ListingConsumer));
        userService.registerUser(user);

        User createdUser = userRepository.find("email","test13@test.com" ).firstResult();

        // Step 2: Attempt to change the password with a wrong old password
        String wrongOldPassword = "wrongOldPassword";
        String newPassword = "newValidPassword123";
        assertThrows(ValidationException.class, () -> userService.changePassword(wrongOldPassword, newPassword, createdUser.getId()));

        // Optionally, you can also verify that the password remains unchanged
        User userAfterChange = userService.getUserById(createdUser.getId());
        assertTrue(Password.check("123456789Test", userAfterChange.getPassword()).withScrypt());
    }


    @Test
    void graphQLAuthenticationTests() throws ValidationException, ServiceException {
        String password = "123456789Test";
        User consumer = new User();
        consumer.setName("Consumer");
        consumer.setEmail("conumer1@test.com");
        consumer.setPassword(password);
        consumer.setUserType(Set.of(UserType.ListingConsumer));
        userService.registerUser(consumer);
        Session consumer_session = userService.getSession(consumer.getEmail(), password);
        String consumer_jwt = consumer_session.accessToken;

        User provider = new User();
        provider.setName("Provider");
        provider.setEmail("provider1@test.com");
        provider.setPassword(password);
        provider.setUserType(Set.of(UserType.ListingProvider));
        userService.registerUser(provider);
        Session provider_session = userService.getSession(provider.getEmail(), password);
        String provider_jwt = provider_session.accessToken;

        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin1@test.com");
        admin.setPassword(password);
        admin.setUserType(Set.of(UserType.Administrator));
        userService.registerUser(admin);
        Session admin_session = userService.getSession(admin.getEmail(), password);
        String admin_jwt = admin_session.accessToken;


        String query = "{\"query\":\"query Consumer {\n  getAllListings {\n    id\n  }\n}\",\"operationName\":\"Consumer\"}";
        RestAssured.given().when().header("Authorization", "Bearer " + consumer_jwt).body(query).post("/graphql").then()
                .assertThat()
                .statusCode(200).log();

        query = "{\"query\":\"query Consumer {\n  getAllListings {\n    id\n  }\n}\",\"operationName\":\"Consumer\"}";
        RestAssured.given().when().header("Authorization", "Bearer " + provider_jwt).body(query).post("/graphql").then()
                .assertThat()
                .statusCode(200).log();

        query = "{\"query\":\"query Consumer {\n  getAllListings {\n    id\n  }\n}\",\"operationName\":\"Consumer\"}";
        RestAssured.given().when().header("Authorization", "Bearer " + admin_jwt).body(query).post("/graphql").then()
                .assertThat()
                .statusCode(200).log();

    }

    @Test
    @Transactional
    void favoriteTest() throws ValidationException, ServiceException {
        User user = new User();
        user.setName("Test");
        user.setEmail("test14@test.com");
        user.setPassword("123456789Test");
        user.setUserType(Set.of(UserType.ListingConsumer));
        user.setFavourites(new ArrayList<>());
        userService.registerUser(user);

        User provider = new User();
        provider.setName("Peter Provider");
        provider.setEmail("provider@ase.at");
        provider.setPassword("123456789Test");
        provider.setUserType(Set.of(UserType.ListingProvider));
        userService.registerUser(provider);

        Listing listing = new Listing();
        listing.setTitle("Title");
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        listing.setUniversity("University of Vienna");
        listing.setCreatedAt(Date.from(java.time.Instant.now()));
        listing.setActive(true);
        listing.setOwner(provider);
        listingService.createListing(listing);

        userService.toggleFavourite(user.getId(), listing.getId());

        assertTrue(user.getFavourites().contains(listing));

        userService.toggleFavourite(user.getId(), listing.getId());

        assertFalse(user.getFavourites().contains(listing));
    }

    @Test
    @Transactional
    void makeUserAdminTest() throws ValidationException, ServiceException {
        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin15@test.com");
        admin.setPassword("123456789Test");
        admin.setUserType(Set.of(UserType.Administrator));
        userService.registerUser(admin);
        User user = new User();
        user.setName("Test");
        user.setEmail("test16@mail.com");
        user.setPassword("123456789Test");
        user.setUserType(Set.of(UserType.ListingConsumer));
        userService.registerUser(user);

        userService.makeAdmin(user.getId(), admin.getId());


        assertTrue(userService.getUserById(user.getId()).getUserType().contains(UserType.Administrator));
    }

    @Test
    @Transactional
    void makeAdminUserAdminTest() throws ValidationException, ServiceException {
        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin17@test.com");
        admin.setPassword("123456789Test");
        admin.setUserType(Set.of(UserType.Administrator));
        userService.registerUser(admin);

        assertThrows(ServiceException.class, () -> userService.makeAdmin(admin.getId(), admin.getId()));
    }

    @Test
    @Transactional
    void makeAdminWithNormalUserTestShouldThrowServiceException() throws ValidationException, ServiceException {
        User user = new User();
        user.setName("Test");
        user.setEmail("user18@test.com");
        user.setPassword("123456789Test");
        user.setUserType(Set.of(UserType.ListingConsumer));
        userService.registerUser(user);

        assertThrows(ServiceException.class, () -> userService.makeAdmin(user.getId(), user.getId()));
    }
}
