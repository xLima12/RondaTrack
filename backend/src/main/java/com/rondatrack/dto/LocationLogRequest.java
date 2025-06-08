package com.rondatrack.dto;

import lombok.Data;

@Data
public class LocationLogRequest {

    private String deviceCode;
    private double latitude;
    private double longitude;

}
