package com.rondatrack.service;

import com.rondatrack.model.Device;
import com.rondatrack.model.LocationLog;
import com.rondatrack.repository.DeviceRepository;
import com.rondatrack.repository.LocationLogRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LocationSimulatorService {

    private final DeviceRepository deviceRepository;
    private final LocationLogRepository locationLogRepository;

    // Mapa para armazenar o índice atual de cada device na sequência
    private final Map<Long, Integer> deviceCurrentIndex = new ConcurrentHashMap<>();

    // Pontos pré-definidos da planta baixa em ordem
    private final List<Point> predefinedPoints = Arrays.asList(
            new Point(20, -27),   // ponto 1 - índice 0
            new Point(-20, -27),  // ponto 2 - índice 1
            new Point(-27, -17),  // ponto 3 - índice 2
            new Point(-27, 18),   // ponto 4 - índice 3
            new Point(-19, 28),   // ponto 5 - índice 4
            new Point(21, 28),    // ponto 6 - índice 5
            new Point(28, 18),    // ponto 7 - índice 6
            new Point(28, -17),   // ponto 8 - índice 7
            new Point(-2, -11),   // ponto 9 - índice 8
            new Point(20, -17),   // ponto 10 - índice 9
            new Point(20, 0),     // ponto 11 - índice 10
            new Point(20, 18),    // ponto 12 - índice 11
            new Point(-2, 18),    // ponto 13 - índice 12
            new Point(-20, 18),   // ponto 14 - índice 13
            new Point(-20, 0),    // ponto 15 - índice 14
            new Point(-20, -17)   // ponto 16 - índice 15
    );

    public LocationSimulatorService(DeviceRepository deviceRepository, LocationLogRepository locationLogRepository) {
        this.deviceRepository = deviceRepository;
        this.locationLogRepository = locationLogRepository;
    }

    @Scheduled(fixedRate = 30000) // A cada 10 segundos
    public void updateLocations() {
        List<Device> devices = deviceRepository.findAll();

        for(Device device : devices) {
            Point newPosition = getNextSequentialPosition(device);

            LocationLog newLog = new LocationLog();
            newLog.setDevice(device);
            newLog.setLatitude(newPosition.getLat());
            newLog.setLongitude(newPosition.getLng());
            newLog.setDateTime(LocalDateTime.now());

            locationLogRepository.save(newLog);
        }
    }

    private Point getNextSequentialPosition(Device device) {
        Long deviceId = device.getId();

        // Verifica se o device já tem um índice definido
        if(!deviceCurrentIndex.containsKey(deviceId)) {
            // Inicializa o índice baseado no ID do device
            if(deviceId % 2 == 0) {
                // Device par: começa do primeiro ponto (índice 0)
                deviceCurrentIndex.put(deviceId, 0);
            } else {
                // Device ímpar: começa do último ponto (índice 15)
                deviceCurrentIndex.put(deviceId, predefinedPoints.size() - 1);
            }
        }

        // Pega a posição atual
        int currentIndex = deviceCurrentIndex.get(deviceId);
        Point currentPosition = predefinedPoints.get(currentIndex);

        // Calcula o próximo índice
        int nextIndex = getNextIndex(deviceId, currentIndex);
        deviceCurrentIndex.put(deviceId, nextIndex);

        return currentPosition;
    }

    private int getNextIndex(Long deviceId, int currentIndex) {
        if(deviceId % 2 == 0) {
            // Device par: sequência crescente (0→1→2→...→15→0)
            return (currentIndex + 1) % predefinedPoints.size();
        } else {
            // Device ímpar: sequência decrescente (15→14→13→...→0→15)
            return currentIndex == 0 ? predefinedPoints.size() - 1 : currentIndex - 1;
        }
    }

    // Método para definir manualmente a posição inicial de um device (opcional)
    public void setDeviceStartPosition(Long deviceId, int startIndex) {
        if(startIndex >= 0 && startIndex < predefinedPoints.size()) {
            deviceCurrentIndex.put(deviceId, startIndex);
        }
    }

    // Método para obter informações do device (para debug/monitoramento)
    public Map<String, Object> getDeviceInfo(Long deviceId) {
        Map<String, Object> info = new HashMap<>();
        Integer currentIndex = deviceCurrentIndex.get(deviceId);

        info.put("deviceId", deviceId);
        info.put("direction", deviceId % 2 == 0 ? "crescente" : "decrescente");
        info.put("currentIndex", currentIndex);

        if(currentIndex != null) {
            Point currentPoint = predefinedPoints.get(currentIndex);
            info.put("currentPosition", Map.of("lat", currentPoint.getLat(), "lng", currentPoint.getLng()));
            info.put("pointNumber", currentIndex + 1);
        }

        return info;
    }

    // Classe interna para representar um ponto
    private static class Point {
        private final double lat;
        private final double lng;

        public Point(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }

        public double getLat() { return lat; }
        public double getLng() { return lng; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Point point = (Point) o;
            return Double.compare(point.lat, lat) == 0 &&
                    Double.compare(point.lng, lng) == 0;
        }

        @Override
        public int hashCode() {
            return Objects.hash(lat, lng);
        }

        @Override
        public String toString() {
            return String.format("Point{lat=%.1f, lng=%.1f}", lat, lng);
        }
    }
}