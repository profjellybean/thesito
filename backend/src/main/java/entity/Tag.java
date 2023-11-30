package entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;

@Entity
@Getter
@Setter
@Table(name = "tags")
public class Tag extends PanacheEntity {
    private long layer;
    @FullTextField(analyzer = "english")
    private String title_en;
    @FullTextField(analyzer = "german")
    private String title_de;
}
