package com.application.userservice.controller;

import com.application.userservice.dto.UserCreateRequest;
import com.application.userservice.dto.UserResponse;
import com.application.userservice.dto.ValidateCredentialsRequest;
import com.application.userservice.dto.ValidateCredentialsResponse;
import com.application.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserService userService;

    //Admin Public SignUp
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody UserCreateRequest userCreateRequest)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userCreateRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id)
    {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    //Admin only
    @GetMapping()
    public ResponseEntity<List<UserResponse>> getAllUsers()
    {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@RequestBody UserCreateRequest changeRequest,@PathVariable Long id)
    {
        return ResponseEntity.ok(userService.updateUserById(changeRequest,id));
    }

    //Admin only
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id)
    {
        userService.deleteUserById(id);
        // Returns 204 No Content
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/validate")
    public ResponseEntity<ValidateCredentialsResponse> validateUser(@RequestBody ValidateCredentialsRequest validateCredentialsRequest)
    {
        return ResponseEntity.ok(userService.validateUser(validateCredentialsRequest));
    }

   /*
   @PostMapping("/change-password")
    public ResponseEntity<UserResponse> changePassword(@RequestBody UserCreateRequest userCreateRequest)
    {
        return ResponseEntity.ok(userService.createUser(userCreateRequest));
    }
    */
}
