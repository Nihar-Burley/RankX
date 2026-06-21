package com.application.authservice.service;

import com.application.authservice.dto.request.LoginRequest;
import com.application.authservice.dto.request.OtpRequest;
import com.application.authservice.dto.request.RegisterRequest;
import com.application.authservice.dto.response.ApiResponse;
import com.application.authservice.entity.AuthUsers;
import com.application.authservice.repository.AuthUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthMicroserviceQaTest {

    @Mock
    private AuthUserRepository repo;

    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder encoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private OtpService otpService;

    @InjectMocks
    private AuthService authService;

    @Captor
    private ArgumentCaptor<AuthUsers> userCaptor;

    @ParameterizedTest(name = "register should persist disabled user and trigger otp for profile {0}")
    @MethodSource("registrationProfiles")
    void registerShouldPersistDisabledUserAndTriggerOtp(String username, String mobile, String password) {
        RegisterRequest request = registerRequest(username, mobile, password);
        when(repo.findByUsername(username)).thenReturn(Optional.empty());
        when(repo.findByMobile(mobile)).thenReturn(Optional.empty());
        when(encoder.encode(password)).thenReturn("encoded-" + password);
        when(repo.save(any(AuthUsers.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApiResponse response = authService.register(request);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).contains("Registration successful");
        verify(repo).save(userCaptor.capture());
        AuthUsers savedUser = userCaptor.getValue();
        assertThat(savedUser.getUsername()).isEqualTo(username);
        assertThat(savedUser.getMobile()).isEqualTo(mobile);
        assertThat(savedUser.getPassword()).isEqualTo("encoded-" + password);
        assertThat(savedUser.getRole()).isEqualTo("ROLE_USER");
        assertThat(savedUser.isEnabled()).isFalse();
        verify(otpService).generateAndSaveOtp(mobile);
    }

    @ParameterizedTest(name = "register should reject duplicate username {0}")
    @MethodSource("registrationProfiles")
    void registerShouldRejectDuplicateUsername(String username, String mobile, String password) {
        RegisterRequest request = registerRequest(username, mobile, password);
        when(repo.findByUsername(username)).thenReturn(Optional.of(AuthUsers.builder().username(username).build()));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Username is already registered");

        verify(repo, never()).save(any(AuthUsers.class));
        verify(otpService, never()).generateAndSaveOtp(mobile);
    }

    @ParameterizedTest(name = "register should reject duplicate mobile {1}")
    @MethodSource("registrationProfiles")
    void registerShouldRejectDuplicateMobile(String username, String mobile, String password) {
        RegisterRequest request = registerRequest(username, mobile, password);
        when(repo.findByUsername(username)).thenReturn(Optional.empty());
        when(repo.findByMobile(mobile)).thenReturn(Optional.of(AuthUsers.builder().mobile(mobile).build()));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Mobile number is already registered");

        verify(repo, never()).save(any(AuthUsers.class));
        verify(otpService, never()).generateAndSaveOtp(mobile);
    }

    @ParameterizedTest(name = "verify otp should enable user for mobile {0}")
    @MethodSource("otpProfiles")
    void verifyOtpShouldEnableMatchingUser(String mobile, String otp) {
        AuthUsers user = AuthUsers.builder()
                .id(UUID.randomUUID())
                .username("user-" + mobile.substring(mobile.length() - 4))
                .mobile(mobile)
                .password("encoded")
                .role("ROLE_USER")
                .enabled(false)
                .build();
        when(otpService.verifyOtp(mobile, otp)).thenReturn(true);
        when(repo.findByMobile(mobile)).thenReturn(Optional.of(user));
        when(repo.save(any(AuthUsers.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ApiResponse response = authService.verifyOtp(otpRequest(mobile, otp));

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getMessage()).contains("successfully verified");
        assertThat(user.isEnabled()).isTrue();
        verify(repo).save(user);
    }

    @ParameterizedTest(name = "verify otp should reject invalid otp {1}")
    @MethodSource("otpProfiles")
    void verifyOtpShouldRejectInvalidOtp(String mobile, String otp) {
        when(otpService.verifyOtp(mobile, otp)).thenReturn(false);

        assertThatThrownBy(() -> authService.verifyOtp(otpRequest(mobile, otp)))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid OTP");

        verify(repo, never()).findByMobile(any());
    }

    @ParameterizedTest(name = "login should return jwt for enabled user {0}")
    @MethodSource("loginProfiles")
    void loginShouldReturnTokenForEnabledUser(String username, String rawPassword, String encodedPassword, String token) {
        AuthUsers user = enabledUser(username, encodedPassword);
        when(repo.findByUsername(username)).thenReturn(Optional.of(user));
        when(encoder.matches(rawPassword, encodedPassword)).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn(token);

        String actualToken = authService.login(loginRequest(username, rawPassword));

        assertThat(actualToken).isEqualTo(token);
        verify(jwtService).generateToken(user);
    }

    @ParameterizedTest(name = "login should reject disabled account {0}")
    @ValueSource(strings = {"alpha-user", "beta-user", "gamma-user"})
    void loginShouldRejectDisabledUsers(String username) {
        AuthUsers user = AuthUsers.builder()
                .id(UUID.randomUUID())
                .username(username)
                .password("encoded")
                .mobile("9000000000")
                .role("ROLE_USER")
                .enabled(false)
                .build();
        when(repo.findByUsername(username)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(loginRequest(username, "raw-pass")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("OTP not verified");

        verify(jwtService, never()).generateToken(any(AuthUsers.class));
    }

    @ParameterizedTest(name = "login should reject invalid password for {0}")
    @MethodSource("loginProfiles")
    void loginShouldRejectInvalidPassword(String username, String rawPassword, String encodedPassword, String token) {
        AuthUsers user = enabledUser(username, encodedPassword);
        when(repo.findByUsername(username)).thenReturn(Optional.of(user));
        when(encoder.matches(rawPassword, encodedPassword)).thenReturn(false);

        assertThatThrownBy(() -> authService.login(loginRequest(username, rawPassword)))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid credentials");

        verify(jwtService, never()).generateToken(any(AuthUsers.class));
    }

    @Test
    void loginShouldRejectUnknownUser() {
        when(repo.findByUsername("ghost-user")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest("ghost-user", "secret")))
                .isInstanceOf(NoSuchElementException.class);
    }

    private static Stream<Arguments> registrationProfiles() {
        return Stream.of(
                arguments("alpha-user", "9000000001", "Secret@123"),
                arguments("beta-user", "9000000002", "Secret@234"),
                arguments("gamma-user", "9000000003", "Secret@345"),
                arguments("delta-user", "9000000004", "Secret@456"),
                arguments("epsilon-user", "9000000005", "Secret@567")
        );
    }

    private static Stream<Arguments> otpProfiles() {
        return Stream.of(
                arguments("9000000101", "123456"),
                arguments("9000000102", "234567"),
                arguments("9000000103", "345678"),
                arguments("9000000104", "456789"),
                arguments("9000000105", "567890")
        );
    }

    private static Stream<Arguments> loginProfiles() {
        return Stream.of(
                arguments("alpha-user", "Secret@123", "encoded-1", "jwt-alpha"),
                arguments("beta-user", "Secret@234", "encoded-2", "jwt-beta"),
                arguments("gamma-user", "Secret@345", "encoded-3", "jwt-gamma"),
                arguments("delta-user", "Secret@456", "encoded-4", "jwt-delta"),
                arguments("epsilon-user", "Secret@567", "encoded-5", "jwt-epsilon")
        );
    }

    private RegisterRequest registerRequest(String username, String mobile, String password) {
        RegisterRequest request = new RegisterRequest();
        request.setUsername(username);
        request.setMobile(mobile);
        request.setPassword(password);
        return request;
    }

    private OtpRequest otpRequest(String mobile, String otp) {
        OtpRequest request = new OtpRequest();
        request.setMobile(mobile);
        request.setOtp(otp);
        return request;
    }

    private LoginRequest loginRequest(String username, String password) {
        LoginRequest request = new LoginRequest();
        request.setUsername(username);
        request.setPassword(password);
        return request;
    }

    private AuthUsers enabledUser(String username, String encodedPassword) {
        return AuthUsers.builder()
                .id(UUID.randomUUID())
                .username(username)
                .password(encodedPassword)
                .mobile("9999999999")
                .role("ROLE_USER")
                .enabled(true)
                .build();
    }
}
