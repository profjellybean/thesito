package controller;

import entity.Tag;
import jakarta.inject.Inject;
import miscellaneous.ServiceException;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.GraphQLException;
import org.eclipse.microprofile.graphql.Query;
import org.jboss.logging.Logger;
import service.TagService;

import java.util.List;

@GraphQLApi
public class TagController {
    @Inject
    TagService tagService;

    private static final Logger LOG = Logger.getLogger(TagController.class.getName());

    /**
     * Gets all tags from the database.
     * @return a list of all tags
     * @throws GraphQLException if an error occurs
     */
    @Query("getAllTags")
    @Description("Fetches a list of all tags from the database")
    public List<Tag> getAllTags() throws GraphQLException {
        LOG.info("getAllTags");
        try {
            return tagService.getAllTags();
        } catch (ServiceException e) {
            LOG.error("Error in getAllTags: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    /**
     * Get all tags of layers 1 and 2 from the database.
     * @return a list of all tags from layers 1 and 2
     * @throws GraphQLException if an error occurs
     */
    @Query("getAllTagsShallow")
    @Description("Fetches a list of all tags from layer 1 and 2 from the database")
    public List<Tag> getAllTagsShallow() throws GraphQLException {
        LOG.info("getAllTagsShallow");
        try {
            return tagService.getAllTagsShallow();
        } catch (ServiceException e) {
            LOG.error("Error in getAllTagsShallow: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

    /**
     * Gets a list of currently trending tags. These are the tags for which the most listings have been created in the
     * last 30 days, sorted by the number of listings.
     * @return a list of currently trending tags
     * @throws GraphQLException if an error occurs
     */
    @Query("getTrendingTags")
    @Description("Fetches a sorted list of tags for which the most listings have been created in the last 30 days")
    public List<Tag> getTrendingTags() throws GraphQLException {
        LOG.info("getTrendingTags");
        try {
            return tagService.getTrendingTags();
        } catch (ServiceException e) {
            LOG.error("Error in getTrendingTags: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }

}
