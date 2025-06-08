package com.rondatrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DeviceResponse {

    private Long id;
    private String code;
    private String name;
    private String email;

}
