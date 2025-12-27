package com.application.userservice.service;

import com.application.userservice.dto.UserCreateRequest;
import com.application.userservice.dto.UserResponse;
import com.application.userservice.dto.ValidateCredentialsRequest;
import com.application.userservice.dto.ValidateCredentialsResponse;
import com.application.userservice.entity.User;
import com.application.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserResponse createUser(UserCreateRequest userCreateRequest) {
        User user = convert_UserCreateRequestToUser(userCreateRequest);

        User savedUser = userRepository.save(user);

        return convert_UserToUserResponse(savedUser);
    }


    public UserResponse convert_UserToUserResponse(User user) {
        UserResponse ur = new UserResponse();
        ur.setId(user.getId());
        ur.setName(user.getName());
        ur.setEmail(user.getEmail());
        // Assuming getRole() returns an Enum that needs conversion to String
        if (user.getRole() != null) {
            ur.setRole(user.getRole().toString());
        } else {
            ur.setRole("USER"); // Default role handling
        }
        ur.setEnabled(user.getEnabled());
        return ur;
    }


    public User convert_UserCreateRequestToUser(UserCreateRequest userCreateRequest) {
        User u = new User();
        u.setName(userCreateRequest.getName());
        u.setEmail(userCreateRequest.getEmail());
        u.setPassword(userCreateRequest.getPassword());
        // The role setting logic is complex (often involving Enums), leaving it simplified here.
        // u.setRole(userCreateRequest.getRole());
        return u;
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User with id " + id + " not found"));

        return convert_UserToUserResponse(user);
    }


    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convert_UserToUserResponse)
                .collect(Collectors.toList());
    }


    public UserResponse updateUserById(UserCreateRequest changeRequest, Long id) {
        User userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User with id " + id + " not found for update"));

        userToUpdate.setName(changeRequest.getName());
        userToUpdate.setEmail(changeRequest.getEmail());

        /*
        if (changeRequest.getPassword() != null && !changeRequest.getPassword().isEmpty()) {
            userToUpdate.setPassword(changeRequest.getPassword());
        }
        */

        User updatedUser = userRepository.save(userToUpdate);

        return convert_UserToUserResponse(updatedUser);
    }


    public String deleteUserById(Long id) {
        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User with id " + id + " not found for deletion"));

        userRepository.delete(userToDelete);

        return "User with ID " + id + " deleted successfully.";
    }


    public ValidateCredentialsResponse validateUser(ValidateCredentialsRequest validateCredentialsRequest) {
        // 1. Find the user by email (or username)
        User user = userRepository.findByEmail(validateCredentialsRequest.getEmail()) // Assuming findByEmail exists in your repo
                .orElse(null);

        ValidateCredentialsResponse response = new ValidateCredentialsResponse();

        if (user == null || user.getEnabled() == false) {
            response.setValid(false);
            response.setId(null);
            // NOTE: Never reveal if the email exists but the password was wrong for security reasons
            return response;
        }

        // 2. Validate password
        // NOTE: In production, you MUST use a secure password encoder (like BCrypt)
        boolean isPasswordMatch = user.getPassword().equals(validateCredentialsRequest.getPassword());

        if (isPasswordMatch) {
            response.setValid(true);
            response.setId(user.getId());
        } else {
            response.setValid(false);
            response.setId(null);
        }

        return response;
    }
}
