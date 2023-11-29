package service;

import entity.Listing;
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

import java.util.Date;
import java.util.List;
import java.util.Optional;

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

    public List<Listing> find(Optional<Integer> pageOffset, Optional<Integer> pageLimit, Optional<String> title, Optional<String> details, Optional<Qualification> qualificationType, Optional<Date> startDate, Optional<Date> endDate){


        var query = new StringBuilder("1 = 1"); // This is always true, used as a starting point

        Parameters params = new Parameters();

        title.ifPresent(t -> {
            query.append(" and title like :title");
            params.and("title", "%" + t + "%"); // The '%' wildcard allows partial matching
        });

        details.ifPresent(d -> {
            query.append(" and details = :details");
            params.and("details", d);
        });


        qualificationType.ifPresent(qt -> {
            query.append(" and CAST(requirement AS text) = :requirement");
            params.and("requirement", Qualification.Masters.name());
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
       return listingRepository.find(query.toString(), params).list();
    }

}
