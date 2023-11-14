package controller;

import entity.User;
import jakarta.inject.Inject;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;
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
}
