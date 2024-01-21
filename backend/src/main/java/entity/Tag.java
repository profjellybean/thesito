package entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.KeywordField;

import java.util.Collection;

@Entity
@Getter
@Setter
@Table(name = "tags")
@Indexed
public class Tag extends PanacheEntity {
    private long layer;
    @KeywordField()
    private String title_en;
    @KeywordField()
    private String title_de;
    @ManyToMany(mappedBy = "tags", cascade = CascadeType.REMOVE)
    private Collection<Listing> listings;
}
