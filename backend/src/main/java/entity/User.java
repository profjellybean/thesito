package entity;


import enums.Qualification;
import enums.UserType;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;

import java.util.Collection;
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
    @ColumnTransformer(write = "?::qualification_type")
    private Qualification qualification;
    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::user_type")
    private UserType userType;
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_tags",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Collection<Tag> userTags;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(getName(), user.getName()) && Objects.equals(getEmail(), user.getEmail()) && Objects.equals(getPassword(), user.getPassword()) && getQualification() == user.getQualification() && getUserType() == user.getUserType() && Objects.equals(getUserTags(), user.getUserTags());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getName(), getEmail(), getPassword(), getQualification(), getUserType(), getUserTags());
    }

    @Override
    public String toString() {
        return "User{" +
                "name='" + name + '\n' +
                ", email='" + email + '\n' +
                ", password='" + password + '\n' +
                ", qualification=" + qualification +
                ", userType=" + userType +
                ", userTags=" + userTags +
                ", id=" + id +
                '}';
    }
}
