package com.rondatrack.controller;

import com.rondatrack.model.Tag;
import com.rondatrack.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    @PostMapping
    public ResponseEntity<Tag> register(@RequestBody Tag tag) {
        return ResponseEntity.ok(tagService.registerTag(tag));
    }

    @GetMapping
    public ResponseEntity<List<Tag>> list() {
        return ResponseEntity.ok(tagService.listTags());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tag> findById(@PathVariable Long id) {
        return tagService.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}

