package controller;

import entity.Listing;
import entity.User;
import io.quarkus.security.UnauthorizedException;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import miscellaneous.ServiceException;
import miscellaneous.Session;
import miscellaneous.ValidationException;
import org.eclipse.microprofile.graphql.*;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;
import service.UserService;

import java.util.Collection;
import java.util.List;

@GraphQLApi
public class UserController {
    @Inject
    JsonWebToken jwt;
    @Inject
    UserService userService;

    private static final Logger LOG = Logger.getLogger(UserController.class.getName());

    /**
     * Gets all users from the database.
     * @return a list of all users
     */
    @Query("getAllUsers")
    @RolesAllowed({"Administrator"})
    @Description("Fetches a list of all users from the database")
    public List<User> getAllUsers() {
        LOG.info("getAllUsers");
        return userService.getAllUsers();
    }

    /**
     * Registers the given user.
     * @param user the user to be registered
     * @return the registered user with the generated id
     * @throws GraphQLException if an error occurs
     */
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

    /**
     * Gets a user by their id.
     * @param id the id of the user
     * @return the user
     * @throws GraphQLException if an error occurs
     */
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

    /**
     * Gets the full name of the user with the given id.
     * @param id the id of the user
     * @return the user's full name
     * @throws GraphQLException if the user does not exist
     */
    @Query("getUsernameByUserId")
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Returns the full name of the user with the given id")
    public String getUsernameByUserId(Long id) throws GraphQLException {
        LOG.info("getUsernameByUserId");
        try {
            return userService.getUserById(id).getName();
        } catch (ServiceException e) {
            LOG.error("Error in getUserNameByUserId: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    /**
     * Get the favourite listings of a user.
     * @param userId the id of the user
     * @return a list of the user's favourite listings
     * @throws GraphQLException if the user does not exist
     */
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

    /**
     * Gets an access and refresh token by using username and password.
     * The returned access token is valid for 15 minutes, the refresh token is valid for 3 days and can be used once.
     * @param email the email of the user
     * @param password the password of the user
     * @return the session containing the access token and refresh token
     * @throws GraphQLException if an error occurs
     */
    @Mutation
    @PermitAll
    @Description("Get access and refresh token by using username (email) and password")
    public Session getSession(String email, String password) throws GraphQLException {
        LOG.info("getSession");
        try {
            return userService.getSession(email, password);
        } catch (ServiceException e) {
            LOG.error("Error in getSession: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    /**
     * Gets a new access and refresh token by using the one-time use refresh token.
     * When a refresh token is used to get an access token, the claim number of that refresh token is stored in the
     * database for 3 days. The refresh token can only be used once.
     * @param token the one-time use refresh token
     * @return the session containing the new access token and refresh token
     * @throws GraphQLException if an error occurs
     */
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

    /**
     * Updates a user in the database.
     * @param user the user to be updated
     * @return the updated user
     * @throws GraphQLException if an error occurs
     */
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

    /**
     * Changes the password of a user.
     * @param oldPassword the old password
     * @param newPassword the new password
     * @param userId the id of the user
     * @return the updated user
     * @throws GraphQLException if the old password is incorrect or the user does not exist
     */
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

    /**
     * Toggles the favourite status of a listing for a user,
     * i.e. adds or removes the listing from the user's favourites.
     * @param userId the id of the user
     * @param listingId the id of the listing
     * @return true if the operation was successful
     * @throws GraphQLException if an error occurs
     */
    @Mutation
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Toggle favourite listing, i.e. add or remove a listing from a user's favourites")
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

    /**
     * Gives the given user admin status.
     * @param userId the id of the user to be made admin
     * @param userIdCurrent the id of the user who wants to make the other user admin
     * @return true if the user was successfully made admin
     * @throws GraphQLException if an error occurs
     */
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

    /**
     * Deletes a user from the database.
     * @param userId the id of the user to be deleted
     * @throws GraphQLException if an error occurs
     */
    @Mutation
    @Description("Delete a user from the database")
    public void deleteUserById(Long userId) throws GraphQLException {
        LOG.info("deleteUserById");
        try {
            userService.deleteUserById(userId);
        } catch (ServiceException e) {
            LOG.error("Error in deleteUserById: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }
}
