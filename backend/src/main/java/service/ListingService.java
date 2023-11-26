package service;

import com.password4j.Hash;
import com.password4j.Password;
import entity.Listing;
import entity.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.ListingValidator;
import miscellaneous.ServiceException;
import miscellaneous.ValidationException;
import persistence.ListingRepository;

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
        listingValidator.validateListing(listing);
        listingRepository.persist(listing);
        return listing;
    }

}
