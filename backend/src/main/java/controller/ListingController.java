package controller;

import entity.Listing;
import enums.Qualification;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.logging.Log;
import io.quarkus.panache.common.Page;
import io.quarkus.runtime.StartupEvent;
import io.quarkus.security.UnauthorizedException;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.persistence.NoResultException;
import jakarta.transaction.Transactional;
import miscellaneous.GraphQLSearchResult;
import miscellaneous.ServiceException;
import miscellaneous.ValidationException;
import org.eclipse.microprofile.graphql.*;
import org.hibernate.search.engine.search.predicate.SearchPredicate;
import org.hibernate.search.engine.search.predicate.dsl.PredicateFinalStep;
import org.hibernate.search.engine.search.predicate.dsl.SearchPredicateFactory;
import org.hibernate.search.engine.search.query.SearchResult;
import org.hibernate.search.engine.search.sort.SearchSort;
import org.hibernate.search.mapper.orm.scope.SearchScope;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.jboss.logging.Logger;
import service.ListingService;
import org.eclipse.microprofile.jwt.JsonWebToken;

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

    @Transactional
    void onStart(@Observes StartupEvent ev) throws InterruptedException {
        LOG.info("The application is starting...");
        // only reindex if we imported some content
        if (Listing.count() > 0) {
            searchSession.massIndexer()
                    .startAndWait();
        }
    }

    @Query("getAllListings")
    @RolesAllowed({"ListingConsumer", "ListingProvider", "Administrator"})
    @Description("Fetches a list of all listings from the database")
    public List<Listing> getAllListings() {
        LOG.info("getAllListings");
        return listingService.getAllListings();
    }

    @Query("getAllListingsFromUserWithId")
    @RolesAllowed({"ListingConsumer", "ListingProvider", "Administrator"})
    @Description("Fetches a list of all listings from the a specific User from the dataabase")
    public List<Listing> getAllListingsFromUserWithId(Long id) throws GraphQLException{
        LOG.info("getAllListingsFromUserWithId");
        // check if sender is allowed
        if (!id.equals(Long.parseLong(jwt.getClaim("userid").toString())) && !jwt.getGroups().contains("Administrator")){
            throw new GraphQLException("Not allowed");
        }

        return listingService.getAllListingsFromUserWithId(id);
    }

    @Mutation
    @RolesAllowed({"ListingProvider", "Administrator"})
    @Description("Creates a listing in the database")
    public Listing createListing(Listing listing) throws GraphQLException {
        LOG.info("createListing");
        try {
            return listingService.createListing(listing);
        } catch (ValidationException | ServiceException e) {
            LOG.error("Error in createListing: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }
    @Mutation("applyToListing")
    @RolesAllowed({"ListingConsumer", "Administrator"})
    public void applyToListing(Long listingId, Long userId, String applicationText) throws GraphQLException {
        LOG.info("applyToListing");
        try {
            listingService.applyForThesis(listingId, userId, applicationText);
        } catch (ServiceException | ValidationException e) {
            LOG.error("Error in applyToListing: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    @Query("advancedSearch")
    @RolesAllowed({"ListingConsumer","ListingProvider", "Administrator"})
    @Transactional
    public GraphQLSearchResult advancedSearch(Optional<String> textPattern, Optional<String> startDate, Optional<String> endDate,
                                              Optional<Qualification> qualification, Optional<String> university,
                                              Optional<String> company,
                                              Set<Long> tagIds,
                                              Optional<Long> owner_id,
                                              Optional<Integer> offset, Optional<Integer> limit) throws ParseException {
        LOG.info("advancedSearch");
        SearchPredicateFactory predicateFactory = searchSession.scope(Listing.class).predicate();
        PredicateFinalStep fullTextPredicate = textPattern.isPresent() ?
                predicateFactory.simpleQueryString().fields("title", "details").matching(textPattern.get()) :
                predicateFactory.matchAll();

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

        PredicateFinalStep activePredication = predicateFactory.match().field("active").matching(true);
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
        SearchSort sort = scope.sort().field("createdAt").desc().toSort();

        SearchResult<Listing> query = searchSession.search(scope)
                .where(combinedPredicate)
                .sort(sort)
                .fetch(offset.orElse(0), limit.orElse(100));

        GraphQLSearchResult searchResult = new GraphQLSearchResult();
        searchResult.setListings(query.hits());
        searchResult.setTotalHitCount(query.total().hitCount());
        return searchResult;
    }

    @Query("getTrendingListings")
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Fetches a list of trending listings from the database")
    public GraphQLSearchResult getTrendingListings(Optional<String> university, Optional<String> company,
                                                   Optional<Integer> pageIndex, Optional<Integer> pageSize) {

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



    @Mutation
    @RolesAllowed({"ListingProvider", "Administrator"})
    @Description("Updates a listing in the database")
    public Listing updateListing(Listing listing) throws GraphQLException {
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

    @Mutation
    @RolesAllowed({"ListingProvider", "Administrator"})
    @Description("Deletes a listing and associated entities in cascade")
    public void deleteListingById(long id) throws GraphQLException {
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

    @Query("getAllListingUniversities")
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Fetches a list of all universities that listings are assigned to")
    public List<String> getAllListingUniversities(Optional<String> query) {
        LOG.info("getAllListingUniversities");
        if (query.isPresent()) {
            return listingService.getAllUniversities(query.get());
        } else {
            return listingService.getAllUniversities();
        }
    }

    @Query("getAllListingCompanies")
    @RolesAllowed({"ListingProvider", "ListingConsumer", "Administrator"})
    @Description("Fetches a list of all companies that listings are assigned to")
    public List<String> getAllListingCompanies(Optional<String> query) {
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
