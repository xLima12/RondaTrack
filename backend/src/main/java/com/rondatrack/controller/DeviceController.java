package com.rondatrack.controller;

import com.rondatrack.model.Device;
import com.rondatrack.security.JwtUtil;
import com.rondatrack.service.DeviceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceService deviceService;
    private final JwtUtil jwtUtil;

    public DeviceController(DeviceService deviceService, JwtUtil jwtUtil) {
        this.deviceService = deviceService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<Device> register(@RequestHeader("Authorization") String token, @RequestBody Device device) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        Device newDevice = deviceService.createDevice(device.getCode(), device.getName(), email);
        return ResponseEntity.ok(newDevice);
    }

    @GetMapping
    public ResponseEntity<List<Device>> listAll(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        boolean isAdmin = jwtUtil.extractRoles(token.replace("Bearer ", "")).contains("ADMIN");
        List<Device> devices = deviceService.listAll(email, isAdmin);
        return ResponseEntity.ok(devices);
    }

}
