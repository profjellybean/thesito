package controller;

import entity.Listing;
import enums.Qualification;
import io.smallrye.graphql.api.Scalar;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.constraints.Null;
import miscellaneous.ServiceException;
import miscellaneous.ValidationException;
import org.eclipse.microprofile.graphql.*;
import service.ListingService;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@GraphQLApi
public class ListingController {
    @Inject
    ListingService listingService;

    @Query("getAllListings")
    @Description("Fetches a list of all listings from the database")
    public List<Listing> getAllListings() {
        return listingService.getAllListings();
    }

    // uses Pagination
    @Query("getAllListingsPaginated")
    @Description("Fetches a list of all listings from the database")
    public List<Listing> getAllListingsPaginated(int offset, int limit) {
        return listingService.getAllListingsPaginated(offset, limit);
    }

    @Query("getTotalListingsCount")
    @Description("Fetches a list of all listings from the database")
    public Integer getTotalListingsCount() {
        return listingService.getAllListings().size();
    }

    @Mutation
    @Description("Creates a listing in the database")
    public Listing createListing(Listing listing) throws GraphQLException {
        try {
            return listingService.createListing(listing);
        } catch (ValidationException | ServiceException e) {
            throw new GraphQLException(e.getMessage());
        }
    }
//    @RolesAllowed("ListingConsumer") TODO: change permissions sooner or later
    @Query("simpleSearch")
    @PermitAll
    public List<Listing> simpleSearch(String title, String details, Qualification qualificationType, Date startDate, Date endDate, Optional<Integer> offset, Optional<Integer> limit) {
        Optional<String> optionalTitle = Optional.ofNullable(title);
        Optional<String> optionalDetails = Optional.ofNullable(details);
        Optional<Qualification> optionalQualificationType = Optional.ofNullable(qualificationType);
        Optional<Date> optionalStartDate = Optional.ofNullable(startDate);
        Optional<Date> optionalEndDate = Optional.ofNullable(endDate);
        return listingService.find(offset, limit, optionalTitle, optionalDetails, optionalQualificationType, optionalStartDate, optionalEndDate);
    }

    @Query("simpleSearchCount")
    @PermitAll
    public Integer simpleSearchCount(String title, String details, Qualification qualificationType, Date startDate, Date endDate) {
        // TODO make shorter
        Optional<String> optionalTitle = Optional.ofNullable(title);
        Optional<String> optionalDetails = Optional.ofNullable(details);
        Optional<Qualification> optionalQualificationType = Optional.ofNullable(qualificationType);
        Optional<Date> optionalStartDate = Optional.ofNullable(startDate);
        Optional<Date> optionalEndDate = Optional.ofNullable(endDate);
        return listingService.find(Optional.empty(), Optional.empty(), optionalTitle, optionalDetails, optionalQualificationType, optionalStartDate, optionalEndDate).size();
    }


}
