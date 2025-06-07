package com.rondatrack.service;

import com.rondatrack.model.Tag;

import java.util.List;
import java.util.Optional;

public interface TagService {
    Tag registerTag(Tag tag);
    List<Tag> listTags();
    Optional<Tag> findById(Long id);
}

