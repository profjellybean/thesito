package entity;

import enums.Qualification;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;


import java.util.Collection;
import java.util.Date;

@Entity
@Getter
@Setter
@Table(name = "listings")
public class Listing extends PanacheEntity {
    private String title;
    private String details;
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "qualification_type")
    @ColumnTransformer(write = "?::qualification_type")
    private Qualification requirement;
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "listing_tags",
            joinColumns = @JoinColumn(name = "listing_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Collection<Tag> tags;

    @Column(name = "created_at")
    private Date createdAt;

    @Override
    public String toString() {
        return "Listing{" +
                "title='" + title + '\'' +
                ", details='" + details + '\'' +
                ", requirement=" + requirement +
                ", topicTags=" + tags +
                ", id=" + id +
                '}';
    }
}
