package entity;

import enums.NotificationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.search.mapper.pojo.automaticindexing.ReindexOnUpdate;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.GenericField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexingDependency;

import java.util.Collections;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @GenericField
    private Long id;
    @IndexedEmbedded(includePaths = "id")
    @IndexingDependency(reindexOnUpdate = ReindexOnUpdate.SHALLOW)
    // does not reindex when listing_id is changed!
    @ManyToOne(fetch = FetchType.EAGER)
    private Listing connectedListing;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_notifications",
            joinColumns = @JoinColumn(name = "notification_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> connectedUsers = new HashSet<User>();

    @Enumerated(EnumType.STRING)
    @ColumnTransformer(write = "?::notification_type")
    private NotificationType notificationType;


    public void addConnectedUser(User user){
        this.connectedUsers.add(user);
    }

    @Override
    public String toString() {
        return "Notification{" +
                "id=" + id +
                ", connectedListing=" + connectedListing +
                ", connectedUsers=" + connectedUsers +
                ", notificationType=" + notificationType +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Notification that = (Notification) o;
        return Objects.equals(getId(), that.getId()) && Objects.equals(getConnectedListing(), that.getConnectedListing()) && Objects.equals(getConnectedUsers(), that.getConnectedUsers()) && getNotificationType() == that.getNotificationType();
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getConnectedListing(), getConnectedUsers(), getNotificationType());
    }
}
