package com.application.authservice.dto.request;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class OtpRequest {

    @NotBlank
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid mobile number"
    )
    private String mobile;

    @NotBlank
    @Pattern(
            regexp = "\\d{6}",
            message = "OTP must be 6 digits"
    )
    private String otp;
}
