package entity;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name= "topic_tags")
public class TopicTag {
    @Id
    private Long id;

    private String name;

    @ManyToOne
    @Nullable private TopicTag parent;
}
