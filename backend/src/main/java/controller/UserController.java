package controller;

import entity.User;
import io.netty.handler.codec.http.HttpResponseStatus;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.WebApplicationException;
import miscellaneous.ServiceException;
import miscellaneous.ValidationException;
import org.eclipse.microprofile.graphql.*;
import service.UserService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.Produces;
import jakarta.annotation.security.PermitAll;

import org.eclipse.microprofile.jwt.JsonWebToken;
import jakarta.ws.rs.InternalServerErrorException;

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

  @Mutation
  @Description("Login a user")
  public String loginUser(String email, String password) throws GraphQLException {
    try {
      return userService.loginUser(email, password);
    } catch (ServiceException e) {
      throw new GraphQLException(e.getMessage());
    }
  }

  @Mutation
  @Description("Updates a user in the database")
  public User updateUser(User user) throws GraphQLException {
    System.out.println("User is: " + user);
    try {
      return userService.updateUser(user);
    } catch (ValidationException | ServiceException e) {
      throw new GraphQLException(e.getMessage());
    }
  }

}
