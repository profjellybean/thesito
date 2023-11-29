package service;

import com.password4j.Hash;
import com.password4j.Password;
import entity.RefreshToken;
import entity.User;
import io.smallrye.jwt.auth.principal.JWTParser;
import io.smallrye.jwt.auth.principal.ParseException;
import miscellaneous.Session;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.ServiceException;
import miscellaneous.UserValidator;
import miscellaneous.ValidationException;
import org.eclipse.microprofile.jwt.JsonWebToken;
import persistence.RefreshTokenRepository;
import persistence.UserRepository;

import java.util.*;

import io.smallrye.jwt.build.Jwt;

@ApplicationScoped
public class UserService {
  @Inject
  UserRepository userRepository;

  @Inject
  JWTParser parser;

  @Inject
  RefreshTokenRepository refreshTokenRepository;

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
    return user;
  }

  @Transactional
  public Session getSession(String mail, String password) throws ServiceException {
    User user = userRepository.find("email", mail).firstResult();
    if (user == null) {
      throw new ServiceException("Bad credentials");
    }
    if (!Password.check(password, user.getPassword()).withScrypt()) {
      throw new ServiceException("Bad credentials");
    }
    Session session = new Session();
    session.setAccessToken(generateAccessToken(user));
    session.setRefreshToken(generateRefreshToken(user));
    return session;
  }

  @Transactional
  public Session refreshSession(String token) throws  ServiceException{
    try{
      JsonWebToken refresh_token = parser.parse(token);
      String uuid = refresh_token.getClaim("uuid");
      Long userid = Long.parseLong(refresh_token.getClaim("userid"));
      RefreshToken refreshToken = refreshTokenRepository.find("userid", userid).firstResult();
      if (refreshToken == null){
        throw  new ServiceException("Refresh Token Wrong");
      }
      if (!refreshToken.getUuid().equals(uuid)){
        throw  new ServiceException("Refresh Token Wrong");
      }
      User user = userRepository.findById(userid);
      if (user == null) {
        throw new ServiceException("Bad credentials");
      }
      Session session = new Session();
      session.setAccessToken(generateAccessToken(user));
      session.setRefreshToken(generateRefreshToken(user));
      return session;
    } catch (ParseException e){
      throw  new ServiceException("Refresh Token Wrong");
    }
  }

  private String generateAccessToken(User user) {
    String token = Jwt.issuer("https://thesito.org")
        .upn(user.id.toString())
        .groups(new HashSet<>(Arrays.asList(user.getUserType().name())))
        .expiresIn(900)
            .claim("usage", "access_token")
            .claim("userid", user.id.toString())
        .sign();
    return token;
  }

  private String generateRefreshToken(User user) {

    // delete all current refresh token UUID in postgres
    refreshTokenRepository.deleteByUserId(user.id);
    // generate new refresh token and store UUID in DB
    String uuid = UUID.randomUUID().toString();
    String token = Jwt.issuer("https://thesito.org")
        .upn(user.id.toString())
        .groups(new HashSet<>(Arrays.asList(user.getUserType().name())))
        .expiresIn(259200)
            .claim("usage", "refresh_token")
            .claim("uuid", uuid)
            .claim("userid", user.id.toString())
        .sign();

    RefreshToken refresh_token = new RefreshToken();
    refresh_token.setUserid(user.id);
    refresh_token.setUuid(uuid);
    refreshTokenRepository.persist(refresh_token);
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
    existingUser.setUserTags(user.getUserTags());
    existingUser.setQualification(user.getQualification());
    // If the password is provided, update it
    if (user.getPassword() != null && !user.getPassword().isEmpty()) {
      Hash hashedPassword = Password.hash(user.getPassword()).addRandomSalt().withScrypt();
      existingUser.setPassword(hashedPassword.getResult());
    }
    userRepository.persist(existingUser);
    return existingUser;
  }
}
