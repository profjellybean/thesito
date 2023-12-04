package service;

import entity.Listing;
import entity.User;
import enums.Qualification;
import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.ListingValidator;
import miscellaneous.ServiceException;
import miscellaneous.ValidationException;
import persistence.ListingRepository;
import io.quarkus.panache.common.Page;
import persistence.UserRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ListingService {

    @Inject
    ListingRepository listingRepository;
    @Inject
    ListingValidator listingValidator;

    @Inject
    UserRepository userRepository;

    @Transactional
    public List<Listing> getAllListings() {
        return listingRepository.listAll();
    }

    @Transactional
    public List<Listing> getAllListingsFromUserWithId(long id){
        User user = this.userRepository.findById(id);
        return this.listingRepository.find("owner", user).list();
    }

    @Transactional
    public List<Listing> getAllListingsPaginated(int offset, int limit) {
        Page page = Page.of(offset / limit, limit);
        return listingRepository.findAll().page(page).list();
    }

    @Transactional
    public Listing createListing(Listing listing) throws ValidationException, ServiceException {
        listing.setCreatedAt(new Date());
        listingValidator.validateListing(listing);
        listingRepository.persist(listing);
        return listing;
    }

    public List<Listing> find(Optional<Integer> pageOffset, Optional<Integer> pageLimit, Optional<String> title, Optional<String> details, Optional<Qualification> qualificationType, Optional<Date> startDate, Optional<Date> endDate, Optional<Boolean> active){
        var query = new StringBuilder("1 = 1"); // This is always true, used as a starting point

        Parameters params = new Parameters();

        title.ifPresent(t -> {
            query.append(" and title like :title");
            params.and("title", "%" + t + "%"); // The '%' wildcard allows partial matching
        });

        details.ifPresent(d -> {
            query.append(" and details like :details");
            params.and("details", "%" + d + "%"); // The '%' wildcard allows partial matching
        });


        qualificationType.ifPresent(qt -> {
            query.append(" and CAST(requirement AS text) = :requirement");
            params.and("requirement", qt.name());
        });

        if (startDate.isPresent() && endDate.isPresent()){
           query.append(" and createdAt BETWEEN :startDate AND :endDate");
           params.and("startDate", startDate.get())
                   .and("endDate", endDate.get());
       };
        if (pageOffset.isPresent() && pageLimit.isPresent()){
            Page page = Page.of(pageOffset.get() / pageLimit.get(), pageLimit.get());
            return listingRepository.find(query.toString(), params).page(page).list();
        }

        if (active.isPresent()){
            query.append(" and active = :active");
            params.and("active", active.get());
        }

       return listingRepository.find(query.toString(), params).list();
    }

    @Transactional
    public Listing updateListing(Listing listing) throws ServiceException, ValidationException {
        listingValidator.validateListing(listing);
        Listing existingListing = listingRepository.findById(listing.getId());

        existingListing.setActive(listing.getActive());
        existingListing.setOwner(listing.getOwner());
        existingListing.setTitle(listing.getTitle());
        existingListing.setDetails(listing.getDetails());
        existingListing.setRequirement(listing.getRequirement());
        existingListing.setUniversity(listing.getUniversity());
        existingListing.setCompany(listing.getCompany());

        listingRepository.persist(existingListing);
        return existingListing;
    }

}
