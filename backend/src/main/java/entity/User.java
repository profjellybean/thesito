package entity;


import enums.UserType;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;

import java.util.Objects;

@Entity
@Getter
@Setter
@Table(name = "users")
public class User extends PanacheEntity {
    private String name;
    private String email;
    private String password;
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "user_type")
    @ColumnTransformer(read = "user_type::text", write = "?::user_type")
    private UserType userType;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(name, user.name) && Objects.equals(email, user.email) && Objects.equals(password, user.password) && userType == user.userType && Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, email, password, userType);
    }

    @Override
    public String toString() {
        return "User{" +
                "name='" + name + '\n' +
                ", email='" + email + '\n' +
                ", password='" + password + '\n' +
                ", userType=" + userType + '\n' +
                ", id=" + id +
                '}';
    }
}
