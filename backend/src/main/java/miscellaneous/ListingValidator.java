package miscellaneous;

import entity.Listing;
import entity.Tag;
import enums.Qualification;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import service.TagService;

import java.util.Collection;
@ApplicationScoped
public class ListingValidator {

    @Inject
    TagService tagService;

    private void validateTitle(String title) throws ValidationException {
        if (title == null || title.isBlank()) {
            throw new ValidationException("Title cannot be null or empty");
        }
        if (title.length() > 255) {
            throw new ValidationException("Title cannot be longer than 255 characters");
        }
    }

    private void validateDetails(String details) throws ValidationException {
        if (details == null || details.isBlank()) {
            throw new ValidationException("Details cannot be null or empty");
        }
    }

    private void validateRequirement(Qualification requirement) throws ValidationException {
        if (requirement == null) {
            throw new ValidationException("Qualification requirement cannot be null");
        }
        if (requirement != Qualification.None && requirement != Qualification.Bachelors && requirement != Qualification.Masters && requirement != Qualification.PhD) {
            throw new ValidationException("Invalid qualification type");
        }
    }

    public void validateTags(Collection<Tag> topicTags) throws ValidationException {
        if (topicTags != null && !topicTags.isEmpty()) {
            for (Tag tag : topicTags) {
                if (tag == null) {
                    throw new ValidationException("Tag ID cannot be null");
                }

                // Check if the tag with the given ID exists
                try {
                    tagService.getTagById(String.valueOf(tag.id));
                } catch (ServiceException e) {
                    throw new ValidationException("Tag ID does not exist");
                }
            }
        }
    }

    public void validateListing(Listing listing) throws ValidationException {

        validateTitle(listing.getTitle());
        validateDetails(listing.getDetails());
        validateRequirement(listing.getRequirement());
        validateTags(listing.getTopicTags());
    }
}
