package service;

import entity.Tag;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import miscellaneous.ServiceException;
import org.jboss.logging.Logger;
import org.jetbrains.annotations.TestOnly;
import persistence.TagRepository;

import java.util.*;

@ApplicationScoped
public class TagService {
    @Inject
    TagRepository tagRepository;

    @PersistenceContext
    EntityManager entityManager;

    private static final Logger LOG = Logger.getLogger(TagService.class.getName());

    public List<Tag> getAllTags() throws ServiceException {
        LOG.debug("getAllTags");
        try {
            List<Tag> allTags = tagRepository.listAll();
            List<Tag> retTags = new LinkedList<>();
            Set<String> tagName = new HashSet<>();
            for (Tag tag : allTags) {
                if (tagName.add(tag.getTitle_en())){
                    retTags.add(tag);
                }
            }
            return retTags;
        } catch (NoResultException e) {
            LOG.error("Error in getAllTags: " + e.getMessage());
            throw new ServiceException("Error while fetching tags");
        }
    }

    public Tag getTagById(String tagId) throws ServiceException {
        LOG.debug("getTagById");
        try {
            Tag foundTag = tagRepository.find("id", tagId).firstResult();
            if (foundTag == null) {
                LOG.error("Error in getTagById: Tag with this id does not exist");
                throw new ServiceException("Tag with this id does not exist");
            }
            return foundTag;
        } catch (IllegalArgumentException | EntityNotFoundException e) {
            LOG.error("Error in getTagById: " + e.getMessage());
            throw new ServiceException("Error while fetching tag by id");
        }
    }

    @Transactional
    @TestOnly
    public void createTag(Tag tag) throws ServiceException {
        LOG.debug("createTag");
        try {
            tagRepository.persist(tag);
        } catch (IllegalArgumentException e) {
            LOG.error("Error in createTag: " + e.getMessage());
            throw new ServiceException("Error while creating tag");
        }
    }

    @Transactional
    public List<Tag> getAllTagsShallow() throws ServiceException {
        LOG.debug("getAllTagsShallow");
        try {
            return tagRepository.find("layer < 3").list();
        } catch (NoResultException e) {
            LOG.error("Error in getAllTagsShallow: " + e.getMessage());
            throw new ServiceException("Error while fetching tags");
        }
    }

    @Transactional
    public List<Tag> getAllSubtags(Long prefix) throws ServiceException {
        LOG.debug("getAllSubtags");
        try {
            String prefixString = String.valueOf(prefix);
            return entityManager.createQuery("SELECT t FROM Tag t WHERE CAST(t.id AS string) LIKE :prefix",
                            Tag.class)
                    .setParameter("prefix", prefixString + "%")
                    .getResultList();
        }catch (NoResultException e){
            LOG.error("Error in getAllSubtags: " + e.getMessage());
            throw new ServiceException("Error while fetching tags");
        }
    }

}
