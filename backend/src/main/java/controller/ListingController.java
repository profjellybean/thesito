package controller;

import entity.Listing;
import enums.Qualification;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Page;
import io.quarkus.runtime.StartupEvent;
import io.quarkus.security.UnauthorizedException;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.persistence.NoResultException;
import jakarta.transaction.Transactional;
import miscellaneous.GraphQLSearchResult;
import miscellaneous.ServiceException;
import miscellaneous.ValidationException;
import org.eclipse.microprofile.graphql.*;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.hibernate.search.engine.search.predicate.SearchPredicate;
import org.hibernate.search.engine.search.predicate.dsl.PredicateFinalStep;
import org.hibernate.search.engine.search.predicate.dsl.SearchPredicateFactory;
import org.hibernate.search.engine.search.query.SearchResult;
import org.hibernate.search.engine.search.sort.SearchSort;
import org.hibernate.search.mapper.orm.scope.SearchScope;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.jboss.logging.Logger;
import service.ListingService;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@GraphQLApi
public class ListingController {
    @Inject
    ListingService listingService;

    @Inject
    JsonWebToken jwt;

    @Inject
    SearchSession searchSession;

    private static final Logger LOG = Logger.getLogger(ListingController.class);

    /**
     * This method is called on application startup. It will reindex all listings if the database is not empty.
     */
    @Transactional
    void onStart(@Observes StartupEvent ev) throws InterruptedException {
        LOG.info("The application is starting...");
        // only reindex if we imported some content
        if (Listing.count() > 0) {
            searchSession.massIndexer()
                    .startAndWait();
        }
    }

    /**
     * Gets all listings from the database.
     * @return list of all listings
     */
    @Query("getAllListings")
    @RolesAllowed({"ListingConsumer", "ListingProvider", "Administrator"})
    @Description("Fetches a list of all listings from the database")
    public List<Listing> getAllListings() {
        LOG.info("getAllListings");
        return listingService.getAllListings();
    }

    /**
     * Gets all listings from the database that are assigned to a specific user.
     * @param id id of the user
     * @return list of all listings assigned to the user
     */
    @Query("getAllListingsFromUserWithId")
    @RolesAllowed({"ListingConsumer", "ListingProvider", "Administrator"})
    @Description("Fetches a list of all listings from the a specific User from the database")
    public List<Listing> getAllListingsFromUserWithId(
            @Description("The id of the user")
            Long id
    ) throws GraphQLException{
        LOG.info("getAllListingsFromUserWithId");
        // check if sender is allowed
        if (!id.equals(Long.parseLong(jwt.getClaim("userid").toString())) && !jwt.getGroups().contains("Administrator")){
            throw new GraphQLException("Not allowed");
        }

        return listingService.getAllListingsFromUserWithId(id);
    }

    /**
     * Stores a given listing in the database.
     * @param listing listing to be stored
     * @return the stored listing with its ID
     * @throws GraphQLException if the listing could not be stored
     */
    @Mutation
    @RolesAllowed({"ListingProvider", "Administrator"})
    @Description("Creates a listing in the database")
    public Listing createListing(
            @Description("The listing to be created")
            Listing listing
    ) throws GraphQLException {
        LOG.info("createListing");
        try {
            return listingService.createListing(listing);
        } catch (ValidationException | ServiceException e) {
            LOG.error("Error in createListing: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    /**
     * Applies for a listing, notifying the listing provider.
     * @param listingId id of the listing
     * @param userId id of the user
     * @param applicationText application text
     * @throws GraphQLException if the application could not be made
     */
    @Mutation("applyToListing")
    @RolesAllowed({"ListingConsumer", "Administrator"})
    @Description("Applies for a listing, notifying the listing provider")
    public void applyToListing(
            @Description("The id of the listing")
            Long listingId,
            @Description("The id of the user")
            Long userId,
            @Description("The application text")
            String applicationText
    ) throws GraphQLException {
        LOG.info("applyToListing");
        try {
            listingService.applyForThesis(listingId, userId, applicationText);
        } catch (ServiceException | ValidationException e) {
            LOG.error("Error in applyToListing: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    /**
     * Searches for listings in the database according to the query and filters.
     * @param textPattern search query
     * @param startDate earliest listing creation date
     * @param endDate latest listing creation date
     * @param qualification qualification needed to apply for the listing
     * @param offset offset of the search result
     * @param limit limit of the search result
     * @return search result
     * @throws ParseException if the dates could not be parsed
     */
    @Query("advancedSearch")
    @RolesAllowed({"ListingConsumer","ListingProvider", "Administrator"})
    @Description("Searches for listings in the database according to the query and filters")
    @Transactional
    public GraphQLSearchResult advancedSearch(
            @Description("The search query")
            Optional<String> textPattern,
            @Description("The earliest listing creation date")
            Optional<String> startDate,
            @Description("The latest listing creation date")
            Optional<String> endDate,
            @Description("The qualification needed to apply for the listing")
            Optional<Qualification> qualification,
            @Description("The assigned university to filter by")
            Optional<String> university,
            @Description("The assigned company to filter by")
            Optional<String> company,
            @Description("The assigned tags to filter by")
            Set<Long> tagIds,
            @Description("The id of the owner to filter by")
            Optional<Long> owner_id,
            @Description("The offset of the search result")
            Optional<Integer> offset,
            @Description("The limit of the search result")
            Optional<Integer> limit,
            @Description("If true, also show non-active listings")
            Optional<Boolean> non_active
    ) throws ParseException {
        LOG.info("advancedSearch");

        if (non_active.isPresent()){
            // only possible to see non_active listings if there is a userid filter which equals the JWT user id
            if (owner_id.isEmpty() || !owner_id.get().equals(Long.parseLong(jwt.getClaim("userid").toString()))){
                throw new UnauthorizedException();
            }
        }

        SearchPredicateFactory predicateFactory = searchSession.scope(Listing.class).predicate();
        PredicateFinalStep fullTextPredicate;
        if (textPattern.isPresent()){
            String searchText = textPattern.get();
            PredicateFinalStep phrasePredicate = predicateFactory.phrase().field("title")
                    .matching(searchText).boost(5.0f).analyzer("english"); // Boost factor for exact matches

            PredicateFinalStep simpleQueryPredicate = predicateFactory.simpleQueryString().fields("title", "details").matching(searchText).analyzer("english");

            fullTextPredicate = predicateFactory.bool()
                    .must(phrasePredicate)
                    .must(simpleQueryPredicate);
        } else {
            fullTextPredicate = predicateFactory.matchAll();
        }

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        // Parsing startDate and endDate from String to Date
        Optional<Date> startDateParsed = startDate.isPresent() ? Optional.of(dateFormat.parse(startDate.get())) : Optional.empty();
        Optional<Date> endDateParsed = endDate.isPresent() ? Optional.of(dateFormat.parse(endDate.get())) : Optional.empty();

        PredicateFinalStep startDatePredicate = startDate.isPresent() ?
                predicateFactory.range().field("createdAt").atLeast(startDateParsed.get()) :
                predicateFactory.matchAll();

        PredicateFinalStep endDatePredicate = endDate.isPresent() ?
                predicateFactory.range().field("createdAt").atMost(endDateParsed.get()) :
                predicateFactory.matchAll();

        PredicateFinalStep requirementPredicate = qualification.isPresent() ?
                predicateFactory.match().field("requirement").matching(qualification.get()) :
                predicateFactory.matchAll();

        PredicateFinalStep universityPredicate = university.isPresent() ?
                predicateFactory.match().field("university").matching(university.get()) :
                predicateFactory.matchAll();

        PredicateFinalStep companyPredicate = company.isPresent() ?
                predicateFactory.match().field("company").matching(company.get()) :
                predicateFactory.matchAll();

        PredicateFinalStep ownerPredicate = owner_id.isPresent() ?
                predicateFactory.match().field("owner.id").matching(owner_id.get()) :
                predicateFactory.matchAll();

        // Match any tag (= don't match none of the tags)
        PredicateFinalStep tagPredicate =
                (tagIds != null && !tagIds.isEmpty()) ?
                        predicateFactory.nested("tags").add(
                                nested -> predicateFactory.bool().with(
                                        b -> b.mustNot(
                                                predicateFactory.bool().with(
                                                        b2 -> tagIds.forEach(tagId ->
                                                                b2.mustNot(
                                                                        predicateFactory.match()
                                                                                .field("tags.id")
                                                                                .matching(tagIds.iterator().next())
                                                                ))))
                                )
                        )
                        :
                        predicateFactory.matchAll();

        PredicateFinalStep activePredication = non_active.isPresent() && non_active.get() ?
                predicateFactory.matchAll() :
                predicateFactory.match().field("active").matching(true);
        // Combining all predicates
        SearchPredicate combinedPredicate = predicateFactory.bool()
                .must(fullTextPredicate)
                .filter(activePredication)
                .filter(endDatePredicate)
                .filter(startDatePredicate)
                .filter(requirementPredicate)
                .filter(universityPredicate)
                .filter(companyPredicate)
                .filter(tagPredicate)
                .filter(ownerPredicate)
                .toPredicate();


        final SearchScope<Listing> scope = searchSession.scope(Listing.class);
        SearchResult<Listing> query = null;
        SearchSort sort = scope.sort().field("createdAt").desc().toSort();

        if (textPattern.isPresent()) {
            query = searchSession.search(scope)
                    .where(combinedPredicate)
                    //.sort(sort)
                    .fetch(offset.orElse(0), limit.orElse(100));
        } else {
            query = searchSession.search(scope)
                    .where(combinedPredicate)
                    .sort(sort)
                    .fetch(offset.orElse(0), limit.orElse(100));
        }



        GraphQLSearchResult searchResult = new GraphQLSearchResult();
        searchResult.setListings(query.hits());
        searchResult.setTotalHitCount(query.total().hitCount());
        return searchResult;
    }

    /**
     * Gets a list of trending listings from the database. Trending listings are listings that have the most
     * applications from within the last 30 days.
     * @param university university to filter by if given
     * @param company company to filter by if given
     * @param pageIndex index of the page to fetch
     * @param pageSize size of the page to fetch
     * @return list of trending listings
     */
    @Query("getTrendingListings")
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Fetches a list of trending listings from the database")
    public GraphQLSearchResult getTrendingListings(
            @Description("The university to filter by")
            Optional<String> university,
            @Description("The company to filter by")
            Optional<String> company,
            @Description("The index of the page to fetch")
            Optional<Integer> pageIndex,
            @Description("The size of the page to fetch")
            Optional<Integer> pageSize
    ) {
        LOG.info("getTrendingListings");
        PanacheQuery<Listing> query = listingService.getTrendingListingsQuery(university, company);
        GraphQLSearchResult searchResult = new GraphQLSearchResult();
        searchResult.setListings(query.page(Page.of(pageIndex.orElse(0), pageSize.orElse(100))).list());
        try {
            searchResult.setTotalHitCount(query.count());
        } catch (NoResultException e) {
            // Can't count if there are no results
            searchResult.setTotalHitCount(0);
        }
        return searchResult;
    }

    /**
     * Updates a listing in the database.
     * @param listing listing to be updated
     * @return the updated listing
     * @throws GraphQLException if the listing could not be updated
     */
    @Mutation
    @RolesAllowed({"ListingProvider", "Administrator"})
    @Description("Updates a listing in the database")
    public Listing updateListing(
            @Description("The listing to be updated")
            Listing listing
    ) throws GraphQLException {
        LOG.info("updateListing");
        // check if user (identified with JWT) is allowed to change listing
        if (!is_user_allowed_to_access_listing(jwt,listing.getId()) && !jwt.getGroups().contains("Administrator")){
            throw new UnauthorizedException();
        }
        try {
            //return listingService.getListingById(listing.getId());
            return listingService.updateListing(listing);
        } catch (ServiceException | ValidationException e) {
            LOG.error("Error in updateListing: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    /**
     * Gets a listing from the database by its ID.
     * @param id id of the listing
     * @return the listing
     */
    @Query("getListingById")
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Fetches a listing from the database by its ID")
    public Listing getListingById(long id) throws GraphQLException {
        LOG.info("getListingById");
        try {
            return listingService.getListingById(id);
        } catch (ServiceException e) {
            LOG.error("Error in getListingById: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    /**
     * Deletes a listing from the database by its ID.
     * @param id id of the listing
     * @throws GraphQLException if the listing could not be deleted
     */
    @Mutation
    @RolesAllowed({"ListingProvider", "Administrator"})
    @Description("Deletes a listing and associated entities in cascade")
    public void deleteListingById(
            @Description("The id of the listing")
            long id
    ) throws GraphQLException {
        // check if user (identified with JWT) is allowed to change listing
        if (!is_user_allowed_to_access_listing(jwt, id) && !jwt.getGroups().contains("Administrator")){
            throw new UnauthorizedException();
        }
        LOG.info("deleteListingById");
        try {
            listingService.deleteListingById(id);
        } catch (ServiceException e) {
            LOG.error("Error in deleteListingById: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    /**
     * Gets a list of all university names that listings are assigned to.
     * @param query query to filter the university names by
     * @return list of known university names
     */
    @Query("getAllListingUniversities")
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Fetches a list of all universities that listings are assigned to")
    public List<String> getAllListingUniversities(
            @Description("The query to filter the university names by")
            Optional<String> query
    ) {
        LOG.info("getAllListingUniversities");
        if (query.isPresent()) {
            return listingService.getAllUniversities(query.get());
        } else {
            return listingService.getAllUniversities();
        }
    }

    /**
     * Gets a list of all company names that listings are assigned to.
     * @param query query to filter the company names by
     * @return list of known company names
     */
    @Query("getAllListingCompanies")
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Fetches a list of all companies that listings are assigned to")
    public List<String> getAllListingCompanies(
            @Description("The query to filter the company names by")
            Optional<String> query
    ) {
        LOG.info("getAllListingCompanies");
        if (query.isPresent()) {
            return listingService.getAllCompanies(query.get());
        } else {
            return listingService.getAllCompanies();
        }
    }

    // Checks if user (identified via JWT) is allowed to edit a listing
    // Listing Owner is read from DB and compared with JWT Token userID
    private boolean is_user_allowed_to_access_listing(JsonWebToken jwt, Long listingId) throws GraphQLException {
        try {
            Long userId = Long.parseLong(jwt.getClaim("userid").toString());
            // get owner of listing id in DB
            Long listing_owner_db = listingService.getListingById(listingId).getOwner().getId();
            return listing_owner_db.equals(userId);
        } catch (ServiceException e) {
            throw new GraphQLException(e.getMessage());
        }
    }

}
