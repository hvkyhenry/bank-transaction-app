package com.bankapp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAccountRequest {

    @NotBlank(message = "accountHolderName is required")
    private String accountHolderName;

    @NotBlank(message = "nationalId is required")
    private String nationalId;

    @NotBlank(message = "phoneNumber is required")
    private String phoneNumber;
}
