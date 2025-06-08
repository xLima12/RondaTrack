package com.rondatrack.service;

import com.rondatrack.dto.LocationLogRequest;
import com.rondatrack.dto.LocationLogResponse;
import com.rondatrack.model.Device;
import com.rondatrack.model.LocationLog;
import com.rondatrack.model.User;
import com.rondatrack.repository.DeviceRepository;
import com.rondatrack.repository.LocationLogRepository;
import com.rondatrack.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LocationLogService {

    private final LocationLogRepository locationLogRepository;
    private final DeviceRepository deviceRepository;

    public LocationLogService(LocationLogRepository locationLogRepository, DeviceRepository deviceRepository) {
        this.locationLogRepository = locationLogRepository;
        this.deviceRepository = deviceRepository;
    }

    public void save(LocationLogRequest request) {
        Device device = deviceRepository.findByCode(request.getDeviceCode())
                .orElseThrow(() -> new RuntimeException("Device não encontrado"));

        LocationLog log = new LocationLog();
        log.setDevice(device);
        log.setLatitude(request.getLatitude());
        log.setLongitude(request.getLongitude());
        log.setDateTime(LocalDateTime.now());

        locationLogRepository.save(log);
    }

    public List<LocationLogResponse> listByDeviceCode(String code) {
        Device device = deviceRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Device não encontrado"));

        return locationLogRepository.findAllByDevice(device).stream()
                .map(log -> new LocationLogResponse(
                        log.getId(),
                        device.getCode(),
                        log.getLatitude(),
                        log.getLongitude(),
                        log.getDateTime()
                ))
                .toList();
    }

}
