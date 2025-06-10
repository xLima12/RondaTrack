package com.rondatrack.repository;

import com.rondatrack.model.Device;
import com.rondatrack.model.LocationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LocationLogRepository extends JpaRepository<LocationLog, Long> {
    List<LocationLog> findAllByDevice(Device device);
    Optional<LocationLog> findTopByDeviceOrderByDateTimeDesc(Device device);
}
