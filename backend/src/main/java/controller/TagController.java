package controller;

import entity.Tag;
import jakarta.inject.Inject;
import miscellaneous.ServiceException;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.GraphQLException;
import org.eclipse.microprofile.graphql.Query;
import service.TagService;

import java.util.List;

@GraphQLApi
public class TagController {
    @Inject
    TagService tagService;

    @Query("getAllTags")
    @Description("Fetches a list of all tags from the database")
    public List<Tag> getAllTags() throws GraphQLException {
        try {
            return tagService.getAllTags();
        } catch (ServiceException e) {
            throw new GraphQLException(e.getMessage());
        }
    }

    @Query("getAllTagsShallow")
    @Description("Fetches a list of all tags from layer 1 and 2 from the database")
    public List<Tag> getAllTagsShallow() throws GraphQLException {
        try {
            return tagService.getAllTagsShallow();
        } catch (ServiceException e) {
            throw new GraphQLException(e.getMessage());
        }
    }

}
