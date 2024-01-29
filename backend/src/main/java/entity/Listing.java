package entity;

import enums.Qualification;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.eclipse.microprofile.graphql.Description;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.search.engine.backend.types.ObjectStructure;
import org.hibernate.search.engine.backend.types.Sortable;
import org.hibernate.search.mapper.pojo.automaticindexing.ReindexOnUpdate;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.*;

import java.util.Collection;
import java.util.Date;
import java.util.Objects;

@Description("A thesis listing on the platform.")
@Entity
@Getter
@Setter
@Table(name = "listings")
@Indexed
public class Listing extends PanacheEntityBase {
    @Description("The listing's unique identifier.")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Description("The listing's title, limited to 1,000 characters.")
    @FullTextField(analyzer = "english") // TODO english and german
    @Column(length = 1000)
    private String title;

    @Description("The listing's details, limited to 10,000 characters.")
    @FullTextField(analyzer = "english") // TODO english and german
    @Column(length = 10000)
    private String details;

    @GenericField
    @Enumerated(EnumType.STRING)
    @Column(name = "qualification_type", columnDefinition = "qualification_type")
    @ColumnTransformer(write = "?::qualification_type")
    private Qualification requirement;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "listing_tags",
            joinColumns = @JoinColumn(name = "listing_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @IndexedEmbedded(structure = ObjectStructure.NESTED, includeEmbeddedObjectId = true)
    private Collection<Tag> tags;

    @Description("The notifications associated with this listing.")
    @OneToMany(mappedBy = "connectedListing", cascade = CascadeType.REMOVE)
    private Collection<Notification> notifications;

    @ManyToMany(mappedBy = "favourites", fetch = FetchType.EAGER)
    private Collection<User> favourites;

    @GenericField(sortable = Sortable.YES)
    @Column(name = "created_at")
    private Date createdAt;

    @KeywordField
    private String university;

    @KeywordField
    private String company;

    @Description("If the listing is active, allowing users to see and apply to it.")
    @GenericField
    private Boolean active;
    @IndexedEmbedded(includePaths = "id")
    @IndexingDependency(reindexOnUpdate = ReindexOnUpdate.SHALLOW)
    // does not reindex when user_id is changed!
    @ManyToOne(fetch = FetchType.EAGER)
    private User owner;

    @Override
    public String toString() {
        return "Listing{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", details='" + details + '\'' +
                ", requirement=" + requirement +
                ", tags=" + tags +
                ", createdAt=" + createdAt +
                ", university='" + university + '\'' +
                ", company='" + company + '\'' +
                ", active=" + active +
                ", owner=" + owner +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Listing listing = (Listing) o;
        return Objects.equals(getId(), listing.getId()) && Objects.equals(getTitle(), listing.getTitle()) && Objects.equals(getDetails(), listing.getDetails()) && getRequirement() == listing.getRequirement() && Objects.equals(getTags(), listing.getTags()) && Objects.equals(getCreatedAt(), listing.getCreatedAt()) && Objects.equals(getUniversity(), listing.getUniversity()) && Objects.equals(getCompany(), listing.getCompany()) && Objects.equals(getActive(), listing.getActive()) && Objects.equals(getOwner(), listing.getOwner());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getTitle(), getDetails(), getRequirement(), getTags(), getCreatedAt(), getUniversity(), getCompany(), getActive(), getOwner());
    }
}
