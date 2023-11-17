package entity;

import enums.Qualification;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Collection;

@Entity
@Getter
@Setter
@Table(name = "listings")
public class Listing {
    @Id
    private Long id;

    private String title;

    private String details;

    @Enumerated(EnumType.STRING)
    private Qualification requirement;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "listing_topic_tags",
            joinColumns = @JoinColumn(name = "listing_id"),
            inverseJoinColumns = @JoinColumn(name = "topic_tag_id"))
    private Collection<TopicTag> topicTags;
}
