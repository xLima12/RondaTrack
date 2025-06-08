package com.rondatrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class LocationLogResponse {

    private Long id;
    private String deviceCode;
    private double latitude;
    private double longitude;
    private LocalDateTime dateTime;

}
