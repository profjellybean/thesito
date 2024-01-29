package service;

import entity.Listing;
import entity.Notification;
import entity.Tag;
import entity.User;
import enums.NotificationType;
import enums.Qualification;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Parameters;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import miscellaneous.ListingValidator;
import miscellaneous.ServiceException;
import miscellaneous.ValidationException;
import org.jboss.logging.Logger;
import persistence.ListingRepository;
import io.quarkus.panache.common.Page;
import persistence.UserRepository;

import java.time.LocalDate;
import java.util.*;

@ApplicationScoped
public class ListingService {

    @Inject
    ListingRepository listingRepository;
    @Inject
    ListingValidator listingValidator;
    @Inject
    UserService userService;
    @Inject
    MailService mailService;
    @Inject
    NotificationService notificationService;
    @Inject
    TagService tagService;
    @Inject
    UserRepository userRepository;

    private static final Logger LOG = Logger.getLogger(ListingService.class.getName());

    @Transactional
    public List<Listing> getAllListings() {
        LOG.debug("getAllListings");
        return listingRepository.listAll();
    }

    @Transactional
    public List<Listing> getAllListingsFromUserWithId(long id) {
        LOG.debug("getAllListingsFromUserWithId: " + id);
        User user = this.userRepository.findById(id);
        return this.listingRepository.find("owner", user).list();
    }

    @Transactional
    public Listing getListingById(long id) throws ServiceException {
        LOG.debug("getListingById: " + id);
        try {
            return listingRepository.findById(id);
        } catch (IllegalStateException e) {
            LOG.error("Error in getListingById: " + e.getMessage());
            throw new ServiceException("Listing does not exist");
        }
    }

    @Transactional
    public List<Listing> getAllListingsPaginated(int offset, int limit) {
        LOG.debug("getAllListingsPaginated");
        Page page = Page.of(offset / limit, limit);
        return listingRepository.findAll().page(page).list();
    }

    @Transactional
    public Listing createListing(Listing listing) throws ValidationException, ServiceException {
        LOG.debug("createListing");
        listing.setCreatedAt(new Date());
        listingValidator.validateListing(listing);
        listingRepository.persist(listing);

        // create Notifications for interested users
        Notification notification = new Notification();
        notification.setNotificationType(NotificationType.InterestedTopic);
        notification.setConnectedListing(this.getListingById(listing.getId()));
        notification.setCreatedAt(new Date());

        // get all relevant Subtags
        Set<Tag> relevantTags = new HashSet<>();
        if (listing.getTags() != null) {
            for (Tag tag : listing.getTags()) {
                relevantTags.addAll(this.tagService.getAllSubtags(tag.id));
            }
        }

        // add all relevant users to notification
        Set<User> relevantUsers = new HashSet<>(this.userService.getAllUsersByTags(relevantTags.stream().toList()));

        // remove listing owner (if present)
        User owner = this.userService.getUserById(listing.getOwner().getId());
        relevantUsers.remove(owner);

        notification.setConnectedUsers(relevantUsers);
        this.notificationService.createNotification(notification);

        // send mail if settings apply
        String subject = "New matching listing created";
        String text = "A new listing, matching at least one of your interests, has been created!<br>"
                + "Title: " + listing.getTitle()
                + "<br>You can find it <a href=\"http://localhost:4200/listing/" + listing.getId() + "\">here</a>.";
        for (User user : relevantUsers) {
            if (user.getReceiveEmails()) {
                mailService.sendEmail(user.getEmail(), subject, text, null);
                LOG.info("Mail sent to " + user.getEmail());
            }
        }
        return listing;
    }

    public void applyForThesis(Long listingId, Long userId, String applicationText) throws ServiceException, ValidationException {
        LOG.debug("applyForThesis");
        listingValidator.validateApplication(applicationText);
        Listing listing = listingRepository.findById(listingId);
        if (listing == null) {
            LOG.error("Error in applyForThesis: Listing does not exist");
            throw new ServiceException("Listing does not exist");
        }
        User applicationUser = userService.getUserById(userId);
        if (applicationUser == null) {
            LOG.error("Error in applyForThesis: User does not exist");
            throw new ServiceException("User does not exist");
        }
        User listingAuthor = listing.getOwner();

        String subject = "New application for your listing";
        String text = "A new application has been made for your listing: " + listing.getTitle()
                + " from " + applicationUser.getName() + " (" + applicationUser.getEmail() + ") "
                + "\n\n" + applicationText;

        Notification notification = new Notification();
        notification.setNotificationType(NotificationType.Application);
        notification.setConnectedListing(this.getListingById(listingId));
        notification.setCreatedAt(new Date());
        notification.addConnectedUser(listingAuthor);
        this.notificationService.createNotification(notification);
        mailService.sendEmail(listingAuthor.getEmail(), subject, text, applicationUser.getEmail());
    }

    public List<Listing> find(Optional<Integer> pageOffset, Optional<Integer> pageLimit, Optional<String> title, Optional<String> details, Optional<Qualification> qualificationType, Optional<Date> startDate, Optional<Date> endDate, Optional<Boolean> active) {
        LOG.debug("find");
        var query = new StringBuilder("1 = 1"); // This is always true, used as a starting point

        Parameters params = new Parameters();

        title.ifPresent(t -> {
            query.append(" and title like :title");
            params.and("title", "%" + t + "%"); // The '%' wildcard allows partial matching
        });

        details.ifPresent(d -> {
            query.append(" and details like :details");
            params.and("details", "%" + d + "%"); // The '%' wildcard allows partial matching
        });


        qualificationType.ifPresent(qt -> {
            query.append(" and CAST(requirement AS text) = :requirement");
            params.and("requirement", qt.name());
        });

        if (startDate.isPresent() && endDate.isPresent()) {
            query.append(" and createdAt BETWEEN :startDate AND :endDate");
            params.and("startDate", startDate.get())
                    .and("endDate", endDate.get());
        }
        if (pageOffset.isPresent() && pageLimit.isPresent()) {
            Page page = Page.of(pageOffset.get() / pageLimit.get(), pageLimit.get());
            return listingRepository.find(query.toString(), params).page(page).list();
        }

        if (active.isPresent()) {
            query.append(" and active = :active");
            params.and("active", active.get());
        }

        return listingRepository.find(query.toString(), params).list();
    }

    @Transactional
    public Listing updateListing(Listing listing) throws ServiceException, ValidationException {
        LOG.debug("updateListing");
        listingValidator.validateListing(listing);
        Listing existingListing = listingRepository.findById(listing.getId());

        existingListing.setActive(listing.getActive());
        existingListing.setOwner(listing.getOwner());
        existingListing.setTitle(listing.getTitle());
        existingListing.setDetails(listing.getDetails());
        existingListing.setRequirement(listing.getRequirement());
        existingListing.setUniversity(listing.getUniversity());
        existingListing.setCompany(listing.getCompany());
        listingRepository.persist(existingListing);

        existingListing.setTags(listing.getTags());

        listingRepository.persist(existingListing);
        return existingListing;
    }

    @Transactional
    public PanacheQuery<Listing> getTrendingListingsQuery(Optional<String> university, Optional<String> company) {
        LOG.debug("getTrendingListings");

        StringBuilder query = new StringBuilder("""
                        select l
                        from Notification n
                        join n.connectedListing l
                        where n.notificationType = :notificationType
                        and n.createdAt > :date
                        and l.active = true
                """);

        Parameters params = Parameters.with("notificationType", NotificationType.Application)
                .and("date", java.sql.Date.valueOf(LocalDate.now().minusMonths(1)));

        university.ifPresent(u -> {
            query.append(" and l.university = :university");
            params.and("university", u);
        });

        company.ifPresent(c -> {
            query.append(" and l.company = :company");
            params.and("company", c);
        });

        query.append(" group by l.id order by count(n.id) desc");

        return listingRepository.find(query.toString(), params);
    }

    @Transactional
    public List<String> getAllUniversities() {
        LOG.debug("getAllUniversities");
        return listingRepository
                .find("select distinct l.university from Listing l where l.university is not null")
                .project(ListingUniversityView.class)
                .list().stream()
                .map(luv -> luv.university)
                .toList();
    }

    @Transactional
    public List<String> getAllUniversities(String query) {
        LOG.debug("getAllUniversities");
        return listingRepository
                .find("""
                                select distinct l.university
                                from Listing l
                                where l.university is not null
                                  and lower(l.university) like :query
                                """,
                        Parameters.with("query", "%" + query.toLowerCase() + "%"))
                .project(ListingUniversityView.class)
                .list().stream()
                .map(luv -> luv.university)
                .toList();
    }

    @Transactional
    public List<String> getAllCompanies() {
        LOG.debug("getAllCompanies");
        return listingRepository
                .find("select distinct l.company from Listing l where l.company is not null")
                .project(ListingCompanyView.class)
                .list().stream()
                .map(lcv -> lcv.company)
                .toList();
    }

    @Transactional
    public List<String> getAllCompanies(String query) {
        LOG.debug("getAllCompanies");
        return listingRepository
                .find("""
                                select distinct l.company
                                from Listing l
                                where l.company is not null
                                  and lower(l.company) like :query
                                """,
                        Parameters.with("query", "%" + query.toLowerCase() + "%"))
                .project(ListingCompanyView.class)
                .list().stream()
                .map(lcv -> lcv.company)
                .toList();
    }

    @Transactional
    public void deleteListingById(long id) throws ServiceException {
        LOG.debug("deleteListingById: " + id);
        try {
            Listing listing = listingRepository.findById(id);
            if (listing != null) {
                if (listing.getFavourites() != null) {
                    for (User user : listing.getFavourites()) {
                        user.getFavourites().remove(listing);
                    }
                }
                listingRepository.delete(listing);
            } else {
                throw new ServiceException("Listing not found");
            }
        } catch (EntityNotFoundException | IllegalStateException e) {
            LOG.error("Error in deleteListingById: " + e.getMessage());
            throw new ServiceException("Error deleting listing");
        }
    }

    @RegisterForReflection
    public record ListingUniversityView(String university) {
    }

    @RegisterForReflection
    public record ListingCompanyView(String company) {
    }


}
