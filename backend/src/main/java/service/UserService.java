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
import io.smallrye.jwt.build.Jwt;
import org.eclipse.microprofile.jwt.Claims;

import java.util.Arrays;
import java.util.HashSet;

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
  public User registerUser(User user) throws ValidationException, ServiceException {
    userValidator.validateUser(user);
    if (userRepository.find("email", user.getEmail()).count() > 0) {
      throw new ServiceException("User with this email already exists");
    }
    Hash hashedPassword = Password.hash(user.getPassword()).addRandomSalt().withScrypt();
    user.setPassword(hashedPassword.getResult());
    userRepository.persist(user);

    // TODO fix issue with user type
    //System.out.println(user.getUserType());
    //System.out.println(user.getEmail());
    //User user1 = userRepository.find("email", user.getEmail()).firstResult();
    //System.out.println(user1.getUserType());
    return user;
  }

  // TODO currently the most basic login
  public String loginUser(String mail, String password) throws ServiceException {
    User user = userRepository.find("email", mail).firstResult();
    if (user == null) {
      // TODO write test
      throw new ServiceException("Bad credentials");
    }
    if (!Password.check(password, user.getPassword()).withScrypt()) {
      // TODO write test
      throw new ServiceException("Bad credentials");
    }
    //System.out.println(user.getUserType());
    return generateJWT(user);
  }

  private String generateJWT(User user) {
    //System.out.println(user.getEmail());
    String token = Jwt.issuer("https://thesito.org")
        .upn(user.id.toString())
        // TODO
        .groups(new HashSet<>(Arrays.asList("ListingProvider", "ListingConsumer", "Administrator")))
        .claim(Claims.birthdate.name(), "2001-07-13")
        .sign();
    return token;
  }

  @Transactional
  public User getUserById(Long id) throws ServiceException {
    User foundUser = userRepository.findById(id);
    if ( foundUser == null){
      throw new ServiceException("User with this id does not exist");
    }
    return foundUser;
  }

  @Transactional
  public User updateUser(User user) throws ServiceException, ValidationException {
    userValidator.validateUpdate(user);
    User existingUser = userRepository.findById(user.id);
    // TODO: ensure logged user can only change own profile data

    existingUser.setName(user.getName());
    existingUser.setEmail(user.getEmail());

    // If the password is provided, update it
    if (user.getPassword() != null && !user.getPassword().isEmpty()) {
      Hash hashedPassword = Password.hash(user.getPassword()).addRandomSalt().withScrypt();
      existingUser.setPassword(hashedPassword.getResult());
    }

    userRepository.persist(existingUser);

    return existingUser;

  }

}
