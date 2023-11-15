package service;

import entity.Listing;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import persistence.ListingRepository;

import java.util.List;

@ApplicationScoped
public class ListingService {

    @Inject
    ListingRepository listingRepository;

    @Transactional
    public List<Listing> getAllListings() {
        return listingRepository.listAll();
    }

}
