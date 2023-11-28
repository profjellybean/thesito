package service;

import entity.Listing;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.ListingValidator;
import miscellaneous.ServiceException;
import miscellaneous.ValidationException;
import persistence.ListingRepository;

import java.util.Date;
import java.util.List;

@ApplicationScoped
public class ListingService {

    @Inject
    ListingRepository listingRepository;
    @Inject
    ListingValidator listingValidator;

    @Transactional
    public List<Listing> getAllListings() {
        return listingRepository.listAll();
    }

    @Transactional
    public Listing createListing(Listing listing) throws ValidationException, ServiceException {
        listing.setCreatedAt(new Date());
        listingValidator.validateListing(listing);
        listingRepository.persist(listing);
        return listing;
    }

}
