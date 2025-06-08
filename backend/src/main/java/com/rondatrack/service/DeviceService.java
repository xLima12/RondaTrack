package com.rondatrack.service;

import com.rondatrack.dto.DeviceRequest;
import com.rondatrack.dto.DeviceResponse;
import com.rondatrack.model.Device;
import com.rondatrack.model.User;
import com.rondatrack.repository.DeviceRepository;
import com.rondatrack.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;

    public DeviceService(DeviceRepository deviceRepository, UserRepository userRepository) {
        this.deviceRepository = deviceRepository;
        this.userRepository = userRepository;
    }

    public void create(DeviceRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Device device = new Device();
        device.setCode(request.getCode());
        device.setName(request.getName());
        device.setUser(user);

        deviceRepository.save(device);
    }

    public List<DeviceResponse> listAll() {
        return deviceRepository.findAll().stream()
                .map(d -> new DeviceResponse(d.getId(), d.getCode(), d.getName(), d.getUser().getEmail()))
                .toList();
    }

}
