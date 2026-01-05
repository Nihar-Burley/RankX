package com.application.authservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
@Slf4j
@Service
public class OtpService {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String generateAndSaveOtp(String mobile) {

        String otp = String.valueOf(
                ThreadLocalRandom.current().nextInt(100000, 999999)
        );

        log.info("generateAndSaveOtp method generated otp ---> "+otp);
        redisTemplate.opsForValue()
                .set(
                        "otp:" + mobile,
                        passwordEncoder.encode(otp),
                        5, TimeUnit.MINUTES
                );

        // TODO: send OTP via SMS
        return otp;
    }

    public boolean verifyOtp(String mobile, String inputOtp) {

        String savedHashedOtp =
                redisTemplate.opsForValue().get("otp:" + mobile);

        if (savedHashedOtp == null) {
            return false; // expired or not generated
        }

        boolean matched =
                passwordEncoder.matches(inputOtp, savedHashedOtp);

        if (matched) {
            redisTemplate.delete("otp:" + mobile);
        }

        return matched;
    }
}
