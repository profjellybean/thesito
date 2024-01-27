package miscellaneous;

import entity.Tag;
import entity.User;
import enums.Qualification;
import enums.UserType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import service.TagService;

import java.util.Collection;
import java.util.Set;

public class UserValidator {


    private void validateEmail(String email) throws ValidationException {
        if (email == null || email.isBlank()) {
            throw new ValidationException("Email cannot be null or empty");
        }
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new ValidationException("Invalid email");
        }
        if (email.length() > 255) {
            throw new ValidationException("Email cannot be longer than 255 characters");
        }
    }

    /**
     * Password must contain at least eight characters, at least one letter and one number.
     */
    private void validatePassword(String password) throws ValidationException {
        if (password == null || password.isBlank()) {
            throw new ValidationException("Password cannot be null or empty");
        }
        if (!password.matches("^(?=.*[A-Za-z])(?=.*\\d)[\\s\\S]{8,}$")) {
            throw new ValidationException("Invalid password. Password must contain at least eight characters, at least one letter and one number");
        }
        if (password.length() > 255) {
            throw new ValidationException("Password cannot be longer than 255 characters");
        }
    }

    private void validateName(String name) throws ValidationException {
        if (name == null || name.isBlank()) {
            throw new ValidationException("Name cannot be null or empty");
        }
        if(name.matches(".*\\d.*")) {
            throw new ValidationException("Name cannot contain numbers");
        }
        if (name.length() > 255) {
            throw new ValidationException("Name cannot be longer than 255 characters");
        }
    }

    private void validateUserTypes(Set<UserType> userType) throws ValidationException {
        if (userType == null || userType.isEmpty()) {
            throw new ValidationException("User type cannot be null or empty");
        }
        if (!userType.contains(UserType.ListingConsumer) && !userType.contains(UserType.ListingProvider) && !userType.contains(UserType.Administrator)) {
            throw new ValidationException("Invalid user type");
        }
    }

    private void validateQualification(Qualification qualification) throws ValidationException {
        if (qualification == null) {
            throw new ValidationException("Qualification cannot be null or empty");
        }
        if (qualification != Qualification.None && qualification != Qualification.Bachelors && qualification != Qualification.Masters && qualification != Qualification.PhD) {
            throw new ValidationException("Invalid qualification");
        }
    }

    public void validateUser(User user) throws ValidationException {
        validateEmail(user.getEmail());
        validatePassword(user.getPassword());
        validateName(user.getName());
        validateUserTypes(user.getUserType());
    }


    public void validateUpdate(User user) throws ValidationException {
        validateEmail(user.getEmail());
        validateName(user.getName());
        validateUserTypes(user.getUserType());
        validateQualification(user.getQualification());
    }

    public void validatePasswordChange(String oldPassword, String newPassword) throws ValidationException {
        validatePassword(oldPassword);
        validatePassword(newPassword);
    }
}
