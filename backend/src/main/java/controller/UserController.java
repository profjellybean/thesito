package controller;

import entity.User;
import io.smallrye.jwt.auth.principal.JWTParser;
import io.smallrye.jwt.auth.principal.ParseException;
import jakarta.inject.Inject;
import miscellaneous.ServiceException;
import miscellaneous.Session;
import miscellaneous.ValidationException;
import org.eclipse.microprofile.graphql.*;
import service.UserService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.annotation.security.PermitAll;

import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

@GraphQLApi
public class UserController {
  @Inject
  JsonWebToken jwt;

  @Inject
  UserService userService;

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
    return userService.getAllUsers();
  }

  @Mutation
  @Description("Registers a user in the database")
  public User registerUser(User user) throws GraphQLException {
    try {
      return userService.registerUser(user);
    } catch (ValidationException | ServiceException e) {
      throw new GraphQLException(e.getMessage());
    }
  }

  @Query("getUserById")
  @Description("Fetches the user corresponding to the given ID from the database")
  public User getUserById(Long id) throws GraphQLException {
      try{
          return userService.getUserById(id);
      }catch (ServiceException e){
          throw new GraphQLException(e.getMessage());
      }
  }

  // return
  //    acceess token (15 min) and 
  //    refresh token (valid for 3 days, can be used once)
  @Mutation
  @Description("Get access and refresh token by using username and password")
  public Session getSession(String email, String password) throws GraphQLException {
    try {
      return userService.getSession(email, password);
    } catch (ServiceException e) {
      throw new GraphQLException(e.getMessage());
    }
  }

  // when a refresh token is used to get an access token 
  // the claim number of that refresh token is saved in a DB for (3 days)
  // -> refresh token can only be used once
  @Mutation
  @Description("Get new access and refresh token by using the one-time use refresh token")
  public Session refreshSession(String token) throws GraphQLException {
    try {
      return userService.refreshSession(token);
    } catch (ServiceException e) {
      throw new GraphQLException(e.getMessage());
    }
  }

  @Mutation
  @Description("Updates a user in the database")
  public User updateUser(User user) throws GraphQLException {
    try {
      return userService.updateUser(user);
    } catch (ValidationException | ServiceException e) {
      throw new GraphQLException(e.getMessage());
    }
  }

  @Mutation
  @Description("Change user password")
  public User changePassword(String oldPassword, String newPassword, Long userId) throws GraphQLException {
    try {
      return userService.changePassword(oldPassword, newPassword, userId);
    } catch (ValidationException | ServiceException e) {
      throw new GraphQLException(e.getMessage());
    }
  }

}
