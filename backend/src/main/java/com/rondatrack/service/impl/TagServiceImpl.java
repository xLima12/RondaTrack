package com.rondatrack.service.impl;

import com.rondatrack.model.Tag;
import com.rondatrack.repository.TagRepository;
import com.rondatrack.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TagServiceImpl implements TagService {

    @Autowired
    private TagRepository tagRepository;

    @Override
    public Tag registerTag(Tag tag) {
        return tagRepository.save(tag);
    }

    @Override
    public List<Tag> listTags() {
        return tagRepository.findAll();
    }

    @Override
    public Optional<Tag> findById(Long id) {
        return tagRepository.findById(id);
    }

}
