package controller;

import entity.Listing;
import entity.Tag;
import enums.Qualification;
import io.quarkus.runtime.StartupEvent;
import jakarta.annotation.security.PermitAll;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.GraphQLSearchResult;
import miscellaneous.ServiceException;
import miscellaneous.ValidationException;
import org.eclipse.microprofile.graphql.*;
import org.hibernate.graph.Graph;
import org.hibernate.search.engine.search.predicate.SearchPredicate;
import org.hibernate.search.engine.search.predicate.dsl.PredicateFinalStep;
import org.hibernate.search.engine.search.predicate.dsl.SearchPredicateFactory;
import org.hibernate.search.engine.search.query.SearchResult;
import service.ListingService;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.hibernate.search.mapper.orm.session.SearchSession;

@GraphQLApi
public class ListingController {
    @Inject
    ListingService listingService;

    @Transactional
    void onStart(@Observes StartupEvent ev) throws InterruptedException {
        // only reindex if we imported some content
        if (Listing.count() > 0) {
            searchSession.massIndexer()
                    .startAndWait();
        }
    }

    @Inject
    SearchSession searchSession;

    @Query("getAllListings")
    @Description("Fetches a list of all listings from the database")
    public List<Listing> getAllListings() {
        return listingService.getAllListings();
    }

    @Query("getAllListingsFromUserWithId")
    @Description("Fetches a list of all listings from the a specific User from the dataabase")
    public List<Listing> getAllListingsFromUserWithId(long id) {
        return listingService.getAllListingsFromUserWithId(id);
    }

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
    public GraphQLSearchResult simpleSearch(String title, String details, Qualification qualificationType, Date startDate, Date endDate, Optional<Integer> offset, Optional<Integer> limit) {
        Optional<String> optionalTitle = Optional.ofNullable(title);
        Optional<String> optionalDetails = Optional.ofNullable(details);
        Optional<Qualification> optionalQualificationType = Optional.ofNullable(qualificationType);
        Optional<Date> optionalStartDate = Optional.ofNullable(startDate);
        Optional<Date> optionalEndDate = Optional.ofNullable(endDate);
        GraphQLSearchResult searchResult = new GraphQLSearchResult();
        // TODO make just one query
        searchResult.totalHitCount = listingService.find(Optional.empty(), Optional.empty(), optionalTitle, optionalDetails, optionalQualificationType, optionalStartDate, optionalEndDate).size();
        searchResult.listings = listingService.find(offset, limit, optionalTitle, optionalDetails, optionalQualificationType, optionalStartDate, optionalEndDate);
        return searchResult;
    }

    @Query("fullTextSearch")
    @PermitAll
    @Transactional
    public GraphQLSearchResult fulltextSearch(String pattern, Optional<Integer> offset, Optional<Integer> limit) {
        SearchResult<Listing> query = searchSession.search(Listing.class)
                .where(f -> pattern == null || pattern.trim().isEmpty() ?
                        f.matchAll() :
                        f.simpleQueryString()
                                .fields("title")
                                .matching(pattern)
                )
                .fetch(offset.orElse(0), limit.orElse(100));

       GraphQLSearchResult searchResult = new GraphQLSearchResult();
       System.out.println();
       searchResult.setListings(query.hits());
       searchResult.setTotalHitCount(query.total().hitCount());
       return searchResult;
    }

    @Query("advancedSearch")
    @PermitAll
    @Transactional
    public GraphQLSearchResult advancedSearch(Optional<String> textPattern, Optional<String> startDate, Optional<String> endDate,
                                              Optional<Qualification> qualification, Optional<String> university,
                                              Optional<Set<String>> tagNames,
                                              Optional<Integer> offset, Optional<Integer> limit) throws ParseException {

        SearchPredicateFactory predicateFactory = searchSession.scope(Listing.class).predicate();
        PredicateFinalStep fullTextPredicate = textPattern.isPresent() ?
                predicateFactory.simpleQueryString() .fields("title", "details") .matching(textPattern.get()) :
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

        PredicateFinalStep universityPredicate = university.isPresent() ?
                predicateFactory.match().field("university").matching(university.get()) :
                predicateFactory.matchAll();
        PredicateFinalStep requirementPredicate = qualification.isPresent() ?
                predicateFactory.match().field("requirement").matching(qualification.get()) :
                predicateFactory.matchAll();

        // TODO enable tags filtering
        //PredicateFinalStep tagPredicate = tagNames.isPresent() ?
        //        predicateFactory.bool(b -> {
        //            tagNames.get().forEach(tagName ->
        //                    b.must(predicateFactory.match().field("tags.title_en").matching(tagName))
        //            );
        //        }) : predicateFactory.matchAll();

        // Combining all predicates
        SearchPredicate combinedPredicate = predicateFactory.bool()
                .must(fullTextPredicate)
                .filter(endDatePredicate)
                .filter(startDatePredicate)
                .filter(universityPredicate)
                .filter(requirementPredicate)
                .toPredicate();

        SearchResult<Listing> query = searchSession.search(Listing.class)
                .where(combinedPredicate)
                .fetch(offset.orElse(0), limit.orElse(100));

        GraphQLSearchResult searchResult = new GraphQLSearchResult();
        searchResult.setListings(query.hits());
        searchResult.setTotalHitCount(query.total().hitCount());
        return searchResult;
    }



}
