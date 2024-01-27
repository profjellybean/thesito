package controller;

import entity.Listing;
import entity.User;
import io.quarkus.logging.Log;
import io.quarkus.security.UnauthorizedException;
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

import java.util.Collection;
import java.util.List;

@GraphQLApi
public class UserController {
    @Inject
    JsonWebToken jwt;
    @Inject
    UserService userService;

    private static final Logger LOG = Logger.getLogger(UserController.class.getName());

    @Query("getAllUsers")
    @RolesAllowed({"Administrator"})
    @Description("Fetches a list of all users from the database")
    public List<User> getAllUsers() {
        LOG.info("getAllUsers");
        return userService.getAllUsers();
    }

    @Mutation
    @PermitAll
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
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Fetches the user corresponding to the given ID from the database")
    public User getUserById(Long id) throws GraphQLException {
        LOG.info("getUserById");
        // check if sender is allowed
        if (!id.equals(Long.parseLong(jwt.getClaim("userid").toString())) && !jwt.getGroups().contains("Administrator")){
            throw new UnauthorizedException();
        }
        try {
            return userService.getUserById(id);
        } catch (ServiceException e) {
            LOG.error("Error in getUserById: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }


    @Query("getUsernameByUserId")
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Returns the name of a user")
    public String getUsernameByUserId(Long id) throws GraphQLException {
        LOG.info("getUsernameByUserId");
        try {
            return userService.getUserById(id).getName();
        } catch (ServiceException e) {
            LOG.error("Error in getUserNameByUserId: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    @Query("getFavouritesByUserId")
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Fetches the favorite listings of the user corresponding to the given ID from the database")
    public Collection<Listing> getFavouritesByUserId(Long userId) throws GraphQLException {
        LOG.info("getFavouritesById");
        // check if sender is allowed
        if (!userId.equals(Long.parseLong(jwt.getClaim("userid").toString())) && !jwt.getGroups().contains("Administrator")){
            throw new UnauthorizedException();
        }
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
    @PermitAll
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
    @PermitAll
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
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Updates a user in the database")
    public User updateUser(User user) throws GraphQLException {
        LOG.info("updateUser");
        // check if sender is allowed to do that
        if (!user.getId().equals(Long.parseLong(jwt.getClaim("userid").toString())) && !jwt.getGroups().contains("Administrator")){
            throw new UnauthorizedException();
        }
        try {
            return userService.updateUser(user);
        } catch (ValidationException | ServiceException e) {
            LOG.error("Error in updateUser: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    @Mutation
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Change user password")
    public User changePassword(String oldPassword, String newPassword, Long userId) throws GraphQLException {
        LOG.info("changePassword");
        // check if sender is allowed to do that
        if (!userId.equals(Long.parseLong(jwt.getClaim("userid").toString())) && !jwt.getGroups().contains("Administrator")) {
            throw new UnauthorizedException();
        }
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
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Toggle favourite listing")
    public boolean toggleFavouriteListing(Long userId, Long listingId) throws GraphQLException {
        // check if sender is allowed
        if (!userId.equals(Long.parseLong(jwt.getClaim("userid").toString())) && !jwt.getGroups().contains("Administrator")) {
            throw new UnauthorizedException();
        }
        LOG.info("toggleFavouriteListing");
        try {
            return userService.toggleFavourite(userId, listingId);
        } catch (ServiceException e) {
            LOG.error("Error in toggleFavouriteListing: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    @Mutation
    @RolesAllowed({"Administrator"})
    @Description("Makes another user admin")
    public boolean makeAdmin(Long userId, Long userIdCurrent) throws GraphQLException {
        LOG.info("makeAdmin");
        try {
            return userService.makeAdmin(userId, userIdCurrent);
        } catch (ServiceException e) {
            LOG.error("Error in makeAdmin: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }
}
