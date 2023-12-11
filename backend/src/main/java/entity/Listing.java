package entity;

import enums.Qualification;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.search.engine.backend.types.ObjectStructure;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.GenericField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.IndexedEmbedded;

import java.util.Collection;
import java.util.Date;

@Entity
@Getter
@Setter
@Table(name = "listings")
@Indexed
public class Listing extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @FullTextField(analyzer = "english") // TODO english and german
    private String title;
    @FullTextField(analyzer = "english") // TODO english and german
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

    @GenericField
    @Column(name = "created_at")
    private Date createdAt;

    private String university;
    private String company;
    private Boolean active;
    @ManyToOne(fetch = FetchType.EAGER)
    private User owner;

    @Override
    public String toString() {
        return "Listing{" +
                "title='" + title + '\'' +
                ", details='" + details + '\'' +
                ", requirement=" + requirement +
                ", tags=" + tags +
                ", createdAt=" + createdAt +
                ", university='" + university + '\'' +
                ", company='" + company + '\'' +
                '}';
    }
}