package service;

import entity.Tag;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import persistence.TagRepository;

import java.util.List;

@ApplicationScoped
public class TagService {
    @Inject
    TagRepository tagRepository;

    public List<Tag> getAllTags() {
        return tagRepository.listAll();
    }
}
