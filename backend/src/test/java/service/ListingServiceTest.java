package service;

import entity.Listing;
import entity.Tag;
import enums.Qualification;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.ServiceException;
import org.junit.jupiter.api.Test;
import miscellaneous.ValidationException;
import persistence.DatabaseContainerMock;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@QuarkusTest
@QuarkusTestResource(DatabaseContainerMock.class)
class ListingServiceTest {

    @Inject
    ListingService listingService;

    @Inject
    TagService tagService;


    @Test
    void validateListingWithInvalidTitleShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle(null);
        listing.setDetails("Listing details");
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

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    void validateListingWithInvalidTitleLengthShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle("This is a very long title that exceeds the maximum allowed length of 255 characters. "
                + "This is done intentionally to trigger a ValidationException.");
        listing.setDetails("Listing details");
        listing.setRequirement(Qualification.Bachelors);

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

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    void validateListingWithInvalidDetailsShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle("Listing title");
        listing.setDetails(null);
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

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    void validateListingWithInvalidRequirementShouldThrowValidationException() {
        Listing listing = new Listing();
        listing.setTitle("Listing title");
        listing.setDetails("Listing details");
        listing.setRequirement(null);
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

        assertThrows(ValidationException.class, () -> listingService.createListing(listing));
    }

    @Test
    void validateListingWithValidDataShouldNotThrowException() throws ValidationException, ServiceException {
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
        listing.setRequirement(Qualification.Bachelors);
        listing.setCreatedAt(Date.from(java.time.Instant.now()));

        List<Tag> tags = new ArrayList<>();
        tags.add(tag1);
        tags.add(tag2);
        listing.setTags(tags);

        Listing retListing = listingService.createListing(listing);
        assertEquals(listing, retListing);
    }
}
