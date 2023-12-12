package miscellaneous;

import entity.Listing;
import entity.Tag;

import entity.User;
import enums.Qualification;
import enums.UserType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.json.*;
import service.TagService;
import service.UserService;

import java.io.IOException;
import java.io.StringReader;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@ApplicationScoped
public class ListingValidator {
    private static final String ROR_API_URL = "https://api.ror.org/organizations";

    private List<String> universitiesCache = new ArrayList<>();

    @Inject
    TagService tagService;
    @Inject
    UserService userService;

    private void validateTitle(String title) throws ValidationException {
        if (title == null || title.isBlank()) {
            throw new ValidationException("Title cannot be null or empty");
        }
        if (title.length() > 255) {
            throw new ValidationException("Title cannot be longer than 255 characters");
        }
    }


    public void validateUniversityAndCompany(String university, String company) throws ValidationException {
        if ((university == null || university.isBlank()) && (company == null || company.isBlank())) {
            throw new ValidationException("Company and University cannot be both null or empty");
        }

        if (university != null && !university.isBlank()) {
            if (company != null && !company.isBlank()) {
                throw new ValidationException("Either Company or University must be set but not both");
            }

            // Load universities from ROR API
            universitiesCache = fetchUniversities(university);

            // Check if the provided university is in the cached list
            if (!universitiesCache.contains(university)) {
                throw new ValidationException("Invalid university name");
            }
        } else if (company.length() > 255) {
            throw new ValidationException("Company cannot be longer than 255 characters");
        }
    }


    private List<String> fetchUniversities(String university) throws ValidationException {
        HttpResponse<String> response = sendHttpRequestToRorApi(university);

        if (response.statusCode() == 200) {
            String responseBody = response.body();
            return parseUniversitiesFromJson(responseBody);
        } else {
            throw new ValidationException("Received non-OK status code from ROR API: " + response.statusCode());
        }
    }

    private HttpResponse<String> sendHttpRequestToRorApi(String query) throws ValidationException {
        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            HttpClient httpClient = HttpClient.newBuilder().build();

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(ROR_API_URL + "?query=" + encodedQuery))
                    .GET()
                    .build();

            return httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        } catch (IOException e) {
            // Handle I/O exception
            throw new ValidationException("Error sending HTTP request");
        } catch (InterruptedException e) {
            // Restore the interrupted status and throw the exception
            Thread.currentThread().interrupt();
            throw new ValidationException("Thread interrupted while sending HTTP request");
        }
    }


    private List<String> parseUniversitiesFromJson(String json) throws ValidationException {
        List<String> universities = new ArrayList<>();

        try (JsonReader jsonReader = Json.createReader(new StringReader(json))) {
            JsonObject jsonObject = jsonReader.readObject();

            // Check if "items" is present in the JSON
            if (jsonObject.containsKey("items")) {
                JsonArray itemsArray = jsonObject.getJsonArray("items");

                for (JsonValue item : itemsArray) {
                    JsonObject universityObject = (JsonObject) item;
                    // Check if "name" is present in each university object
                    if (universityObject.containsKey("name")) {
                        String universityName = universityObject.getString("name");
                        universities.add(universityName);
                    } else {
                        throw new ValidationException("University object is missing 'name' property");
                    }
                }
            } else {
                throw new ValidationException("JSON is missing 'items' property");
            }
        } catch (Exception e) {
            throw new ValidationException("Error parsing JSON");
        }

        return universities;
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

    public void validateOwnerId(User user) throws ValidationException {
        if (user == null) {
            throw new ValidationException("OwnerId cannot be null");
        }
        try{
            user = this.userService.getUserById(user.getId());
            if (!user.getUserType().equals(UserType.ListingProvider)){
                throw new ValidationException("User with ID ownerId is not a ListingProvider");
            }
        }catch (ServiceException e){
            throw new ValidationException("User with ID ownerId does not exist");
        }

    }

    public void validateActive(Boolean active) throws ValidationException {
        if (active == null) {
            throw new ValidationException("Active Boolean cannot be null");
        }
    }

    public void validateListing(Listing listing) throws ValidationException {
        validateTitle(listing.getTitle());
        validateDetails(listing.getDetails());
        validateRequirement(listing.getRequirement());
        validateTags(listing.getTags());
        validateUniversityAndCompany(listing.getUniversity(), listing.getCompany());
        validateOwnerId(listing.getOwner());
        validateActive(listing.getActive());
    }

    public void validateApplication(String applicationText) throws ValidationException {
        if (applicationText == null || applicationText.isBlank()) {
            throw new ValidationException("Application text cannot be null or empty");
        }
    }
}
