package service;

import com.password4j.Hash;
import com.password4j.Password;
import entity.Listing;
import entity.RefreshToken;
import entity.Tag;
import entity.User;
import io.smallrye.jwt.auth.principal.JWTParser;
import io.smallrye.jwt.auth.principal.ParseException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import miscellaneous.Session;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.ServiceException;
import miscellaneous.UserValidator;
import miscellaneous.ValidationException;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;
import org.jetbrains.annotations.TestOnly;
import persistence.ListingRepository;
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

    @PersistenceContext
    EntityManager entityManager;
    @Inject
    ListingRepository listingRepository;

    private static final Logger LOG = Logger.getLogger(UserService.class.getName());


    UserValidator userValidator = new UserValidator();

    @Transactional
    public List<User> getAllUsers() {
        LOG.debug("getAllUsers");
        return userRepository.listAll();
    }

    @Transactional
    public User registerUser(User user) throws ValidationException, ServiceException {
        LOG.debug("registerUser");
        userValidator.validateUser(user);
        if (userRepository.find("email", user.getEmail()).count() > 0) {
            LOG.error("Error in registerUser: User with this email already exists");
            throw new ServiceException("User with this email already exists");
        }
        Hash hashedPassword = Password.hash(user.getPassword()).addRandomSalt().withScrypt();
        user.setPassword(hashedPassword.getResult());
        userRepository.persist(user);
        return user;
    }

    @Transactional
    public Session getSession(String mail, String password) throws ServiceException {
        LOG.debug("getSession");
        User user = userRepository.find("email", mail).firstResult();
        if (user == null) {
            LOG.error("Error in getSession: User with this email does not exist");
            throw new ServiceException("Bad credentials");
        }
        if (!Password.check(password, user.getPassword()).withScrypt()) {
            LOG.error("Error in getSession: Bad credentials");
            throw new ServiceException("Bad credentials");
        }
        Session session = new Session();
        session.setAccessToken(generateAccessToken(user));
        session.setRefreshToken(generateRefreshToken(user));
        return session;
    }

    @Transactional
    public Session refreshSession(String token) throws ServiceException {
        LOG.debug("refreshSession");
        try {
            JsonWebToken refresh_token = parser.parse(token);
            String uuid = refresh_token.getClaim("uuid");
            Long userid = Long.parseLong(refresh_token.getClaim("userid"));
            RefreshToken refreshToken = refreshTokenRepository.find("userid", userid).firstResult();
            if (refreshToken == null) {
                LOG.error("Error in refreshSession: Refresh Token Wrong");
                throw new ServiceException("Refresh Token Wrong");
            }
            if (!refreshToken.getUuid().equals(uuid)) {
                LOG.error("Error in refreshSession: Refresh Token Wrong");
                throw new ServiceException("Refresh Token Wrong");
            }
            User user = userRepository.findById(userid);
            if (user == null) {
                LOG.error("Error in refreshSession: Bad credentials");
                throw new ServiceException("Bad credentials");
            }
            Session session = new Session();
            session.setAccessToken(generateAccessToken(user));
            session.setRefreshToken(generateRefreshToken(user));
            return session;
        } catch (ParseException e) {
            LOG.error("Error in refreshSession: Refresh Token Wrong");
            throw new ServiceException("Refresh Token Wrong");
        }
    }

    private String generateAccessToken(User user) {
        LOG.debug("generateAccessToken");
        return Jwt.issuer("https://thesito.org")
                .upn(user.getId().toString())
                .groups(new HashSet<>(Arrays.asList(user.getUserType().name())))
                .expiresIn(900)
                .claim("usage", "access_token")
                .claim("userid", user.getId().toString())
                .claim("userType", user.getUserType())
                .sign();
    }

    private String generateRefreshToken(User user) {
        LOG.debug("generateRefreshToken");
        // delete all current refresh token UUID in postgres
        refreshTokenRepository.deleteByUserId(user.getId());
        // generate new refresh token and store UUID in DB
        String uuid = UUID.randomUUID().toString();
        String token = Jwt.issuer("https://thesito.org")
                .upn(user.getId().toString())
                .groups(new HashSet<>(Arrays.asList(user.getUserType().name())))
                .expiresIn(259200)
                .claim("usage", "refresh_token")
                .claim("uuid", uuid)
                .claim("userid", user.getId().toString())
                .sign();

        RefreshToken refresh_token = new RefreshToken();
        refresh_token.setUserid(user.getId());
        refresh_token.setUuid(uuid);
        refreshTokenRepository.persist(refresh_token);
        return token;
    }

    @Transactional
    public User getUserById(long id) throws ServiceException {
        LOG.debug("getUserById");
        User foundUser = userRepository.findById(id);
        if (foundUser == null) {
            LOG.error("Error in getUserById: User with this id does not exist");
            throw new ServiceException("User with this id does not exist");
        }
        return foundUser;
    }

    @Transactional
    public User updateUser(User user) throws ServiceException, ValidationException {
        LOG.debug("updateUser");
        userValidator.validateUpdate(user);
        User existingUser = userRepository.findById(user.getId());
        User potentialUserWithSameEmail = userRepository.find("email", user.getEmail()).firstResult();
        if (potentialUserWithSameEmail!=null && !potentialUserWithSameEmail.getEmail().equals(existingUser.getEmail())){
            throw new ServiceException("User with this email already exists.");
        }

        existingUser.setName(user.getName());
        existingUser.setEmail(user.getEmail());
        existingUser.setUserTags(user.getUserTags());
        existingUser.setQualification(user.getQualification());
        existingUser.setReceiveEmails(user.getReceiveEmails());

        userRepository.persist(existingUser);
        return existingUser;
    }

    @Transactional
    public User changePassword(String oldPassword, String newPassword, Long userId) throws ValidationException, ServiceException {
        LOG.debug("changePassword");
        userValidator.validatePasswordChange(oldPassword, newPassword);

        User dbUser = userRepository.findById(userId);
        if (dbUser == null) {
            LOG.error("Error in changePassword: User doesn't exist");
            throw new ServiceException("User doesn't exist");
        }

        if (!Password.check(oldPassword, dbUser.getPassword()).withScrypt()) {
            LOG.error("Error in changePassword: Bad credentials");
            throw new ServiceException("Bad credentials");
        }

        Hash hashedPassword = Password.hash(newPassword).addRandomSalt().withScrypt();
        dbUser.setPassword(hashedPassword.getResult());

        userRepository.persist(dbUser);
        return dbUser;
    }

    @Transactional
    public List<User> getAllUsersByTags(List<Tag> tags) throws ServiceException {
        LOG.debug("getAllUsersByTags");
        try {
            return entityManager.createQuery("SELECT DISTINCT u FROM User u JOIN u.userTags t WHERE t IN :userTags", User.class)
                    .setParameter("userTags", tags)
                    .getResultList();
        } catch (NoResultException e) {
            LOG.error("Error in getUsersByTags: " + e.getMessage());
            throw new ServiceException("Error while fetching users");
        }
    }

    @Transactional
    public Collection<Listing> getFavouritesByUserId(Long userId) throws ServiceException {
        LOG.debug("getFavouritesByUserId");

        User user = userRepository.findById(userId);
        if (user == null) {
            LOG.error("Error in getFavouritesByUserId: User doesn't exist");
            throw new ServiceException("User doesn't exist");
        }

        return user.getFavourites();
    }
    @Transactional
    public boolean toggleFavourite(Long userId, Long listingId) throws ServiceException {
        LOG.debug("toggleFavourite");
        User user = userRepository.findById(userId);
        Listing listing = listingRepository.findById(listingId);
        if (user == null) {
            LOG.error("Error in toggleFavourite: User doesn't exist");
            throw new ServiceException("User doesn't exist");
        }
        if (listing == null) {
            LOG.error("Error in toggleFavourite: Listing doesn't exist");
            throw new ServiceException("Listing doesn't exist");
        }
        if (user.getFavourites().contains(listing)) {
            user.getFavourites().remove(listing);
        } else {
            user.getFavourites().add(listing);
        }
        userRepository.persist(user);
        return true;

    }

    @TestOnly
    @Transactional
    public void deleteUser(User user) {
        userRepository.delete(user);
    }
}
