package controller;

import entity.Listing;
import jakarta.inject.Inject;
import miscellaneous.ServiceException;
import miscellaneous.ValidationException;
import org.eclipse.microprofile.graphql.*;
import service.ListingService;

import java.util.List;

@GraphQLApi
public class ListingController {
    @Inject
    ListingService listingService;

    @Query("getAllListings")
    @Description("Fetches a list of all listings from the database")
    public List<Listing> getAllListings() {
        return listingService.getAllListings();
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
}
