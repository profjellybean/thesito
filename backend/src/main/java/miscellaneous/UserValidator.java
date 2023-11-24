package miscellaneous;

import entity.User;
import enums.UserType;

public class UserValidator {
    private void validateEmail(String email) throws ValidationException {
        if (email == null || email.isBlank()) {
            throw new ValidationException("Email cannot be null or empty");
        }
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new ValidationException("Invalid email");
        }
    }

    /**
     * Password must contain at least eight characters, at least one letter and one number.
     */
    private void validatePassword(String password) throws ValidationException {
        if (password == null || password.isBlank()) {
            throw new ValidationException("Password cannot be null or empty");
        }
        if (!password.matches("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$")) {
            throw new ValidationException("Invalid password. Password must contain at least eight characters, at least one letter and one number");
        }
    }

    private void validateName(String name) throws ValidationException {
        if (name == null || name.isBlank()) {
            throw new ValidationException("Name cannot be null or empty");
        }
        if (!name.matches("^[A-Za-z]+$")) {
            throw new ValidationException("Invalid name. Name must contain only letters");
        }
    }

    private void validateUserType(UserType userType) throws ValidationException {
        if (userType == null) {
            throw new ValidationException("User type cannot be null or empty");
        }
        if (userType != UserType.ListingConsumer && userType != UserType.ListingProvider && userType != UserType.Administrator) {
            throw new ValidationException("Invalid user type");
        }
    }

    public void validateUser(User user) throws ValidationException {
        validateEmail(user.getEmail());
        validatePassword(user.getPassword());
        validateName(user.getName());
        validateUserType(user.getUserType());
    }
}
