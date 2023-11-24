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

import java.util.List;

@GraphQLApi
public class UserController {
    @Inject
    UserService userService;

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
}
