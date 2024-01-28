package entity;


import enums.Qualification;
import enums.UserType;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.GenericField;

import java.util.Collection;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "users")
public class User extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @GenericField
    private Long id;
    private String name;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::qualification_type")
    @Column(name = "qualification_type", columnDefinition = "qualification_type")
    private Qualification qualification;
    @ElementCollection(targetClass = UserType.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_types", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "user_type")
    private Set<UserType> userType;
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_tags",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Collection<Tag> userTags;
    private Boolean receiveEmails = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "favourites",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "listing_id"))
    private Collection<Listing> favourites;

    @ManyToMany(mappedBy = "connectedUsers", cascade = CascadeType.REMOVE)
    private Collection<Notification> notifications;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.REMOVE)
    private Collection<Listing> owner;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(getName(), user.getName()) && Objects.equals(getEmail(), user.getEmail()) && Objects.equals(getPassword(), user.getPassword()) && getQualification() == user.getQualification() && user.getUserType().equals(((User) o).getUserType()) && Objects.equals(getUserTags(), user.getUserTags());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getName(), getEmail(), getPassword(), getQualification(), getUserType(), getUserTags());
    }

    public void addUserType(UserType userType){
        Set<UserType> userTypeSet = new HashSet<>(this.getUserType());
        userTypeSet.add(userType);
        this.setUserType(userTypeSet);
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
