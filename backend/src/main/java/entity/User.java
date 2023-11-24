package entity;


import enums.UserType;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.annotations.Type;

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
}
