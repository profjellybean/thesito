package service;

import entity.Tag;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.NoResultException;
import jakarta.transaction.Transactional;
import miscellaneous.ServiceException;
import persistence.TagRepository;

import java.util.List;

@ApplicationScoped
public class TagService {
    @Inject
    TagRepository tagRepository;

    public List<Tag> getAllTags() {
        return tagRepository.listAll();
    }

    public Tag getTagById(String tagId) throws ServiceException {
        try {
            Tag foundTag = tagRepository.find("id", tagId).firstResult();
            if (foundTag == null) {
                throw new ServiceException("Tag with this id does not exist");
            }
            return foundTag;
        } catch (IllegalArgumentException | EntityNotFoundException e) {
            throw new ServiceException("Error while fetching tag by id");
        }
    }

    @Transactional
    public void createTag(Tag tag) {
        tagRepository.persist(tag);
    }

    @Transactional
    public List<Tag> getAllTagsShallow() throws ServiceException {
        try {
            return tagRepository.find("layer < 3").list();
        } catch (NoResultException e) {
            throw new ServiceException("Error while fetching tags");
        }
    }
}
