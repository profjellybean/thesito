package controller;

import entity.Listing;
import jakarta.inject.Inject;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;
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
}
