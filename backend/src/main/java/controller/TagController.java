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
    public List<Tag> getAllTags() {
        return tagService.getAllTags();
    }

    @Query("getTagById")
    @Description("Fetches the tag corresponding to the given ID from the database")
    public Tag getTagById(String id) throws GraphQLException {
        try{
            return tagService.getTagById(id);
        }catch (ServiceException e){
            throw new GraphQLException(e.getMessage());
        }
    }
}
