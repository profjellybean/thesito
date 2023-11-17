package persistence;

import entity.Listing;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ListingRepository implements PanacheRepository<Listing> {
}
