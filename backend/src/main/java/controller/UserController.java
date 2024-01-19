package controller;

import entity.Listing;
import entity.Tag;
import entity.User;
import io.smallrye.jwt.auth.principal.JWTParser;
import io.smallrye.jwt.auth.principal.ParseException;
import jakarta.inject.Inject;
import miscellaneous.ServiceException;
import miscellaneous.Session;
import miscellaneous.ValidationException;
import org.eclipse.microprofile.graphql.*;
import org.jboss.logging.Logger;
import service.UserService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.annotation.security.PermitAll;

import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@GraphQLApi
public class UserController {
    @Inject
    JsonWebToken jwt;
    @Inject
    UserService userService;

    private static final Logger LOG = Logger.getLogger(UserController.class.getName());

    // Example Requests for each Role:
    @Query("security")
    @PermitAll
    public String hello() {
        return "Sensitive data for " + jwt.getName();
    }

    @RolesAllowed("ListingConsumer")
    @Query("getAllUsersListingConsumer")
    public List<User> getAllUsers1() {
        return userService.getAllUsers();
    }

    @RolesAllowed("ListingProvider")
    @Query("getAllUsersListingProvider")
    public List<User> getAllUsers2() {
        return userService.getAllUsers();
    }

    @RolesAllowed("Administrator")
    @Query("getAllUsersAdministrator")
    public List<User> getAllUsers3() {
        return userService.getAllUsers();
    }
    // --------

    @Query("getAllUsers")
    @Description("Fetches a list of all users from the database")
    public List<User> getAllUsers() {
        LOG.info("getAllUsers");
        return userService.getAllUsers();
    }

    @Mutation
    @Description("Registers a user in the database")
    public User registerUser(User user) throws GraphQLException {
        LOG.info("registerUser");
        try {
            return userService.registerUser(user);
        } catch (ValidationException | ServiceException e) {
            LOG.error("Error in registerUser: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    @Query("getUserById")
    @Description("Fetches the user corresponding to the given ID from the database")
    public User getUserById(Long id) throws GraphQLException {
        LOG.info("getUserById");
        try {
            return userService.getUserById(id);
        } catch (ServiceException e) {
            LOG.error("Error in getUserById: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    @Query("getFavouritesByUserId")
    @Description("Fetches the favorite listings of the user corresponding to the given ID from the database")
    public Collection<Listing> getFavouritesByUserId(Long userId) throws GraphQLException {
        LOG.info("getFavouritesById");
        try {
            return userService.getFavouritesByUserId(userId);
        } catch (ServiceException e) {
            LOG.error("Error in getFavouritesById: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    // return
    //    acceess token (15 min) and
    //    refresh token (valid for 3 days, can be used once)
    @Mutation
    @Description("Get access and refresh token by using username and password")
    public Session getSession(String email, String password) throws GraphQLException {
        LOG.info("getSession");
        try {
            return userService.getSession(email, password);
        } catch (ServiceException e) {
            LOG.error("Error in getSession: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    // when a refresh token is used to get an access token
    // the claim number of that refresh token is saved in a DB for (3 days)
    // -> refresh token can only be used once
    @Mutation
    @Description("Get new access and refresh token by using the one-time use refresh token")
    public Session refreshSession(String token) throws GraphQLException {
        LOG.info("refreshSession");
        try {
            return userService.refreshSession(token);
        } catch (ServiceException e) {
            LOG.error("Error in refreshSession: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    @Mutation
    @Description("Updates a user in the database")
    public User updateUser(User user) throws GraphQLException {
        LOG.info("updateUser");
        try {
            return userService.updateUser(user);
        } catch (ValidationException | ServiceException e) {
            LOG.error("Error in updateUser: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    @Mutation
    @Description("Change user password")
    public User changePassword(String oldPassword, String newPassword, Long userId) throws GraphQLException {
        LOG.info("changePassword");
        try {
            return userService.changePassword(oldPassword, newPassword, userId);
        } catch (ValidationException | ServiceException e) {
            LOG.error("Error in changePassword: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    /*@Query
    @Description("Get all users that contain the given tag")
    public List<User> getAllUsersByTag(Tag tag) throws GraphQLException {
        LOG.info("getAllUsersByTags");
        try {
            List<Tag> tags = new ArrayList<Tag>();
            tags.add(tag);
            return userService.getAllUsersByTags(tags);
        } catch (ServiceException e) {
            LOG.error("Error in getSession: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }
     */
    @Mutation
    @Description("Toggle favourite listing")
    public boolean toggleFavouriteListing(Long userId, Long listingId) throws GraphQLException {
        LOG.info("toggleFavouriteListing");
        try {
            return userService.toggleFavourite(userId, listingId);
        } catch (ServiceException e) {
            LOG.error("Error in toggleFavouriteListing: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    @Mutation
    @Description("Makes antother user admin")
    public User makeAdmin(Long userId, User user) throws GraphQLException {
        LOG.info("makeAdmin");
        try {
            return userService.makeAdmin(userId, user);
        } catch (ServiceException e) {
            LOG.error("Error in makeAdmin: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }
}
