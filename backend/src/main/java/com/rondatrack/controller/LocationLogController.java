package com.rondatrack.controller;

import com.rondatrack.dto.LocationLogRequest;
import com.rondatrack.dto.LocationLogResponse;
import com.rondatrack.service.LocationLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/location-logs")
public class LocationLogController {

    private final LocationLogService service;

    public LocationLogController(LocationLogService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody LocationLogRequest request) {
        service.save(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{deviceCode}")
    public ResponseEntity<List<LocationLogResponse>> getByDevice(@PathVariable String deviceCode) {
        return ResponseEntity.ok(service.listByDeviceCode(deviceCode));
    }

}
