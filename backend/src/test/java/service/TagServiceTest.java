package service;

import entity.Tag;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import miscellaneous.ServiceException;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import persistence.DatabaseContainerMock;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@QuarkusTest
@QuarkusTestResource(DatabaseContainerMock.class)
public class TagServiceTest {
    @Inject
    TagService tagService;

    @BeforeEach
    @Transactional
    void setup() throws ServiceException {
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

        Tag tag3 = new Tag();
        tag3.setLayer(3L);
        tag3.setTitle_en("Tag 3");
        tag3.setTitle_de("Tag 3");
        tagService.createTag(tag3);

        Tag tag4 = new Tag();
        tag4.setLayer(4L);
        tag4.setTitle_en("Tag 4");
        tag4.setTitle_de("Tag 4");
        tagService.createTag(tag4);
    }

    @Test
    @Transactional
    void fetchingAllTagsShouldReturnAllTags() throws ServiceException {
        List<Tag> tags = tagService.getAllTags();
        assertEquals(4, tags.size());
        assertEquals("Tag 1", tags.get(0).getTitle_en());
        assertEquals("Tag 2", tags.get(1).getTitle_en());
        assertEquals("Tag 3", tags.get(2).getTitle_en());
        assertEquals("Tag 4", tags.get(3).getTitle_en());
    }

    @Test
    @Transactional
    void fetchingAllTagsShallowShouldReturnLayerOneTwoTags() throws ServiceException {
        List<Tag> tags = tagService.getAllTagsShallow();
        assertEquals(2, tags.size());
        assertEquals("Tag 1", tags.get(0).getTitle_en());
        assertEquals("Tag 2", tags.get(1).getTitle_en());
    }
}
