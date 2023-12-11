package service;

import entity.Listing;
import entity.Tag;
import entity.User;
import enums.Qualification;
import enums.UserType;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.ServiceException;
import org.junit.Before;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import miscellaneous.ValidationException;
import org.junit.jupiter.api.TestInstance;
import persistence.DatabaseContainerMock;

import javax.swing.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@QuarkusTestResource(DatabaseContainerMock.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ListingServiceTest {

    @Inject
    ListingService listingService;

    @Inject
    TagService tagService;

    @Inject
    UserService userService;

    private User consumer;
    private User provider;
    private User provider2;
    private User provider3;

    @BeforeAll
    @Transactional
    void setup() throws ServiceException, ValidationException {
        User user = new User();
        user.setName("Conny Consumer");
        user.setEmail("consumer@ase.at");
        user.setPassword("123456789Test");
        user.setUserType(UserType.ListingConsumer);
        this.consumer = userService.registerUser(user);

        user = new User();
        user.setName("Peter Provider");
        user.setEmail("provider@ase.at");
        user.setPassword("123456789Test");
        user.setUserType(UserType.ListingProvider);
        this.provider = userService.registerUser(user);

        user = new User();
        user.setName("Paul Provider");
        user.setEmail("provider2@ase.at");
        user.setPassword("123456789Test");
        user.setUserType(UserType.ListingProvider);
        this.provider2 = userService.registerUser(user);

        user = new User();
        user.setName("Prince Provider");
        user.setEmail("provider3@ase.at");
        user.setPassword("123456789Test");
        user.setUserType(UserType.ListingProvider);
        this.provider3 = userService.registerUser(user);
    }

    @Test
    @Transactional
    void createListingWithUnknownUserShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle(null);
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        listing.setUniversity("University of Vienna");
        List<Tag> tags = new ArrayList<>();
        Tag tag1 = new Tag();
        tag1.setLayer(1L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");
        Tag tag2 = new Tag();
        tag1.setLayer(2L);
        tag1.setTitle_en("Tag 2");
        tag1.setTitle_de("Tag 2");
        tags.add(tag1);
        tags.add(tag2);
        listing.setTags(tags);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));
        listing.setActive(true);
        listing.setOwner(new User());

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    @Transactional
    void createListingWithKnownUserAsListingConsumerShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle(null);
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        listing.setUniversity("University of Vienna");
        List<Tag> tags = new ArrayList<>();
        Tag tag1 = new Tag();
        tag1.setLayer(1L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");
        Tag tag2 = new Tag();
        tag1.setLayer(2L);
        tag1.setTitle_en("Tag 2");
        tag1.setTitle_de("Tag 2");
        tags.add(tag1);
        tags.add(tag2);
        listing.setTags(tags);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));
        listing.setActive(true);
        listing.setOwner(consumer);

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    @Transactional
    void createListingWithKnownUserAsListingProviderShouldNotThorExceptionAndReturnValidListing() {
        Listing listing = new Listing();
        listing.setTitle("Title");
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        listing.setUniversity("University of Vienna");
        listing.setCreatedAt(Date.from(java.time.Instant.now()));
        listing.setActive(true);
        listing.setOwner(provider);

        assertDoesNotThrow(() -> {
            Listing retListing;
            retListing = listingService.createListing(listing);
            assertEquals(listing, retListing);
        });
    }

    @Test
    @Transactional
    void getAllListingsFromUserWithIdWithValidIdShouldReturnListOfListings() {
        Listing listing = new Listing();
        listing.setTitle("Title");
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        listing.setUniversity("University of Vienna");
        listing.setCreatedAt(Date.from(java.time.Instant.now()));
        listing.setActive(true);
        listing.setOwner(provider3);




        Listing listing2 = new Listing();
        listing2.setTitle("Titlee");
        listing2.setDetails("Listing details");
        listing2.setRequirement(Qualification.Bachelors);
        listing2.setUniversity("University of Vienna");
        listing2.setCreatedAt(Date.from(java.time.Instant.now()));
        listing2.setActive(true);
        listing2.setOwner(provider3);

        Listing listing3 = new Listing();
        listing3.setTitle("Titleee");
        listing3.setDetails("Listing details");
        listing3.setRequirement(Qualification.Bachelors);
        listing3.setUniversity("University of Vienna");
        listing3.setCreatedAt(Date.from(java.time.Instant.now()));
        listing3.setActive(true);
        listing3.setOwner(provider2);

        assertDoesNotThrow(() -> {
            listingService.createListing(listing);
            listingService.createListing(listing2);
            listingService.createListing(listing3);

            List<Listing> list1 =this.listingService.getAllListingsFromUserWithId(provider3.id);
            List<Listing> list2 =this.listingService.getAllListingsFromUserWithId(provider2.id);

            System.out.println(list1);
            System.out.println(list2);

            assertEquals(2, list1.size());
            assertEquals(1, list2.size());
        });
    }


    @Test
    void validateListingWithInvalidTitleShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle(null);
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        listing.setUniversity("University of Vienna");
        List<Tag> tags = new ArrayList<>();
        Tag tag1 = new Tag();
        tag1.setLayer(1L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");
        Tag tag2 = new Tag();
        tag1.setLayer(2L);
        tag1.setTitle_en("Tag 2");
        tag1.setTitle_de("Tag 2");
        tags.add(tag1);
        tags.add(tag2);
        listing.setTags(tags);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    void validateListingWithInvalidTitleLengthShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle("This is a very long title that exceeds the maximum allowed length of 255 characters. "
                + "This is done intentionally to trigger a ValidationException.");
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        listing.setUniversity("University of Vienna");
        List<Tag> tags = new ArrayList<>();
        Tag tag1 = new Tag();
        tag1.setLayer(1L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");

        Tag tag2 = new Tag();
        tag2.setLayer(2L);
        tag2.setTitle_en("Tag 2");
        tag2.setTitle_de("Tag 2");

        tags.add(tag1);
        tags.add(tag2);
        listing.setTags(tags);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    void validateListingWithInvalidDetailsShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle("Listing title");
        listing.setDetails(null);
        listing.setUniversity("University of Vienna");
        listing.setRequirement(Qualification.Bachelors);
        List<Tag> tags = new ArrayList<>();
        Tag tag1 = new Tag();
        tag1.setLayer(1L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");


        Tag tag2 = new Tag();
        tag1.setLayer(2L);
        tag1.setTitle_en("Tag 2");
        tag1.setTitle_de("Tag 2");
        tags.add(tag1);
        tags.add(tag2);
        listing.setTags(tags);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    void validateListingWithInvalidRequirementShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle("Listing title");
        listing.setDetails("Listing details");
        listing.setRequirement(null);
        listing.setUniversity("University of Vienna");
        List<Tag> tags = new ArrayList<>();
        Tag tag1 = new Tag();
        tag1.setLayer(1L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");

        Tag tag2 = new Tag();
        tag2.setLayer(2L);
        tag2.setTitle_en("Tag 2");
        tag2.setTitle_de("Tag 2");
        tags.add(tag1);
        tags.add(tag2);
        listing.setTags(tags);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    void validateListingWithInvalidTagShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle("Listing title");
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);

        List<Tag> tags = new ArrayList<>();
        Tag tag1 = new Tag();
        tag1.setLayer(100L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");
        tags.add(tag1);
        listing.setTags(tags);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    void validateListingWithNullUniversityAndNullCompanyShouldThrowValidationException() throws ServiceException {
        Listing listing = new Listing();
        listing.setTitle("Listing title");
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        List<Tag> tags = new ArrayList<>();
        Tag tag1 = new Tag();
        tag1.setLayer(100L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");
        tags.add(tag1);
        listing.setTags(tags);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));
        listing.setUniversity(null);
        listing.setCompany(null);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    void validateListingWithInvalidCompanyLengthShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle("Listing title");
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        listing.setUniversity(null);
        listing.setCompany("This is a very long company that exceeds the maximum allowed length of 255 characters. \"\n" +
                "                + \"This is done intentionally to trigger a ValidationException.");
        List<Tag> tags = new ArrayList<>();
        Tag tag1 = new Tag();
        tag1.setLayer(1L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");

        Tag tag2 = new Tag();
        tag2.setLayer(2L);
        tag2.setTitle_en("Tag 2");
        tag2.setTitle_de("Tag 2");

        tags.add(tag1);
        tags.add(tag2);
        listing.setTags(tags);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    void validateListingWithNonNullUniversityAndNonNullCompanyShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle("Listing title");
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        List<Tag> tags = new ArrayList<>();
        Tag tag1 = new Tag();
        tag1.setLayer(100L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");
        tags.add(tag1);
        listing.setTags(tags);
        listing.setUniversity("University of Vienna");
        listing.setCreatedAt(Date.from(java.time.Instant.now()));
        listing.setCompany("Company");

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    void validateListingWithNotExistingUniversityShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle("Listing title");
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);
        List<Tag> tags = new ArrayList<>();
        Tag tag1 = new Tag();
        tag1.setLayer(100L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");
        tags.add(tag1);
        listing.setTags(tags);
        listing.setUniversity("ASD University");
        listing.setCreatedAt(Date.from(java.time.Instant.now()));

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }


    @Test
    void validateListingWithValidDataAndUniversityShouldNotThrowException() throws ValidationException, ServiceException {
        // Create the Tags
        Tag tag1 = new Tag();
        tag1.setLayer(1L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");
        tagService.createTag(tag1);

        Tag tag2 = new Tag();
        tag2.setLayer(2L);
        tag2.setTitle_en("Tag 2");
        tag2.setTitle_de("Tag 2");
        tagService.createTag(tag2);

        Listing listing = new Listing();
        listing.setTitle("Listing title");
        listing.setDetails("Listing details");
        listing.setUniversity("University of Graz");
        listing.setCompany(null);
        listing.setActive(true);
        listing.setOwner(provider);
        listing.setRequirement(Qualification.Bachelors);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));

        List<Tag> tags = new ArrayList<>();
        tags.add(tag1);
        tags.add(tag2);
        listing.setTags(tags);

        Listing retListing = listingService.createListing(listing);
        assertEquals(listing, retListing);
    }

    @Test
    void validateUpdateListingWithValidDataAndUniversityShouldNotThrowException() throws ValidationException, ServiceException {
        // Create the Tags
        Tag tag1 = new Tag();
        tag1.setLayer(1L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");
        tagService.createTag(tag1);

        Tag tag2 = new Tag();
        tag2.setLayer(2L);
        tag2.setTitle_en("Tag 2");
        tag2.setTitle_de("Tag 2");
        tagService.createTag(tag2);

        // Create a listing to update
        Listing originalListing = new Listing();
        originalListing.setTitle("Original Listing title");
        originalListing.setDetails("Original Listing details");
        originalListing.setUniversity("University of Vienna");
        originalListing.setCompany(null);
        originalListing.setActive(true);
        originalListing.setOwner(provider);
        originalListing.setRequirement(Qualification.Bachelors);
        originalListing.setCreatedAt(Date.from(java.time.Instant.now()));

        List<Tag> originalTags = new ArrayList<>();
        originalTags.add(tag1);
        originalTags.add(tag2);
        originalListing.setTags(originalTags);

        Listing createdListing = listingService.createListing(originalListing);

        // Update the listing
        Listing updatedListing = new Listing();
        updatedListing.setId(createdListing.getId());
        updatedListing.setTitle("Updated Listing title");
        updatedListing.setDetails("Updated Listing details");
        updatedListing.setUniversity("Medical University of Vienna");
        updatedListing.setCompany(null);
        updatedListing.setActive(true);
        updatedListing.setOwner(provider);
        updatedListing.setRequirement(Qualification.Masters);

        List<Tag> updatedTags = new ArrayList<>();
        updatedTags.add(tag1);
        updatedTags.add(tag2);
        updatedListing.setTags(updatedTags);

        Listing retListing = listingService.updateListing(updatedListing);

        // Check that the updated listing matches the expected values
        assertEquals(updatedListing.getTitle(), retListing.getTitle());
        assertEquals(updatedListing.getDetails(), retListing.getDetails());
        assertEquals(updatedListing.getUniversity(), retListing.getUniversity());
        assertEquals(updatedListing.getCompany(), retListing.getCompany());
        assertEquals(updatedListing.getActive(), retListing.getActive());
        assertEquals(updatedListing.getOwner(), retListing.getOwner());
        assertEquals(updatedListing.getRequirement(), retListing.getRequirement());
        assertEquals(updatedTags, retListing.getTags());
    }

    @Test
    void validateUpdateListingWithUniversityAndCompanySetShouldThrowException() throws ValidationException, ServiceException {
        // Create the Tags
        Tag tag1 = new Tag();
        tag1.setLayer(1L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");
        tagService.createTag(tag1);

        Tag tag2 = new Tag();
        tag2.setLayer(2L);
        tag2.setTitle_en("Tag 2");
        tag2.setTitle_de("Tag 2");
        tagService.createTag(tag2);

        // Create a listing to update
        Listing originalListing = new Listing();
        originalListing.setTitle("Original Listing title");
        originalListing.setDetails("Original Listing details");
        originalListing.setUniversity("University of Vienna");
        originalListing.setCompany(null);
        originalListing.setActive(true);
        originalListing.setOwner(provider);
        originalListing.setRequirement(Qualification.Bachelors);
        originalListing.setCreatedAt(Date.from(java.time.Instant.now()));

        List<Tag> originalTags = new ArrayList<>();
        originalTags.add(tag1);
        originalTags.add(tag2);
        originalListing.setTags(originalTags);

        Listing createdListing = listingService.createListing(originalListing);

        // Update the listing
        Listing updatedListing = new Listing();
        updatedListing.setId(createdListing.getId());
        updatedListing.setTitle("Updated Listing title");
        updatedListing.setDetails("Updated Listing details");
        updatedListing.setUniversity("Medical University of Vienna");
        updatedListing.setCompany("Company 1");
        updatedListing.setActive(true);
        updatedListing.setRequirement(Qualification.Masters);

        List<Tag> updatedTags = new ArrayList<>();
        updatedTags.add(tag1);
        updatedTags.add(tag2);
        updatedListing.setTags(updatedTags);

        assertThrows(ValidationException.class, () -> listingService.updateListing(updatedListing));
    }



    @Test
    void validateListingWithValidDataAndCompanyShouldNotThrowException() throws ValidationException, ServiceException {
        // Create the Tags
        Tag tag1 = new Tag();
        tag1.setLayer(1L);
        tag1.setTitle_en("Tag 1");
        tag1.setTitle_de("Tag 1");
        tagService.createTag(tag1);

        Tag tag2 = new Tag();
        tag2.setLayer(2L);
        tag2.setTitle_en("Tag 2");
        tag2.setTitle_de("Tag 2");
        tagService.createTag(tag2);

        Listing listing = new Listing();
        listing.setTitle("Listing title");
        listing.setDetails("Listing details");
        listing.setCompany("Vienna Company ");
        listing.setActive(true);
        listing.setOwner(provider);
        listing.setRequirement(Qualification.Masters);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));

        List<Tag> tags = new ArrayList<>();
        tags.add(tag1);
        tags.add(tag2);
        listing.setTags(tags);

        Listing retListing = listingService.createListing(listing);
        assertEquals(listing, retListing);
    }
}
