package com.rondatrack.service;

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

    public Device createDevice(String code, String name, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        Device device = new Device();
        device.setCode(code);
        device.setName(name);
        device.setUser(user);
        return deviceRepository.save(device);
    }

    public List<Device> listAll(String email, boolean isAdmin) {
        if(isAdmin) return deviceRepository.findAll();
        User user = userRepository.findByEmail(email).orElseThrow();
        return deviceRepository.findAll().stream()
                .filter(d -> d.getUser().getId().equals(user.getId()))
                .toList();
    }

    public Optional<Device> findByCode(String code) {
        return deviceRepository.findByCode(code);
    }

}
