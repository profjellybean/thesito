package service;

import com.password4j.Hash;
import com.password4j.Password;
import entity.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.ServiceException;
import miscellaneous.UserValidator;
import miscellaneous.ValidationException;
import persistence.UserRepository;

import java.util.List;

@ApplicationScoped
public class UserService {
    @Inject
    UserRepository userRepository;

    UserValidator userValidator = new UserValidator();

    @Transactional
    public List<User> getAllUsers() {
        return userRepository.listAll();
    }

    @Transactional
    public User getUserById(String id) throws ServiceException {
        User foundUser = userRepository.find("id", id).firstResult();
        if ( foundUser == null){
            throw new ServiceException("User with this id does not exist");
        }
        //foundUser.setPassword(null);
        return foundUser;
    }

    @Transactional
    public User registerUser(User user) throws ValidationException, ServiceException {
        userValidator.validateUser(user);
        if(userRepository.find("email", user.getEmail()).count() > 0) {
            throw new ServiceException("User with this email already exists");
        }
        Hash hashedPassword = Password.hash(user.getPassword()).addRandomSalt().withScrypt();
        user.setPassword(hashedPassword.getResult());
        userRepository.persist(user);
        return user;
    }
}
