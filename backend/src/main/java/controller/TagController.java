package controller;

import entity.Tag;
import io.vertx.core.cli.annotations.Hidden;
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

    /*@Query("getAllSubtags")
    @Description("Fetches a list of all tags starting with the given prefix")
    public List<Tag> getAllSubtags(Long tag_id) throws GraphQLException {
        LOG.info("getAllSubtags");
        try {
            return tagService.getAllSubtags(tag_id);
        } catch (ServiceException e) {
            LOG.error("Error in getAllSubtags: " + e.getMessage());
            throw new GraphQLException(e.getMessage());
        }
    }
     */

    @Query("getTrendingTags")
    @Description("Fetches a sorted list of currently trending tags from the database")
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
