package com.ivr.pedidosfiliais.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ivr.pedidosfiliais.config.TokenConfig;
import com.ivr.pedidosfiliais.dto.request.LoginRequest;
import com.ivr.pedidosfiliais.dto.request.RegisterRequest;
import com.ivr.pedidosfiliais.dto.response.LoginResponse;
import com.ivr.pedidosfiliais.dto.response.RegisterUserResponse;
import com.ivr.pedidosfiliais.entities.User;
import com.ivr.pedidosfiliais.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenConfig tokenConfig;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest){
        UsernamePasswordAuthenticationToken userAndPass = new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password());
        Authentication authentication = authenticationManager.authenticate(userAndPass);

        User user = (User) authentication.getPrincipal();
        String token = tokenConfig.generateToken(user);
        return ResponseEntity.ok(new LoginResponse(token, user.getName(), user.getAccess()));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterUserResponse> register(@Valid @RequestBody RegisterRequest request){
        User newUser = new User();
        newUser.setPassword(passwordEncoder.encode(request.password()));
        newUser.setEmail(request.email());
        newUser.setName(request.name());
        newUser.setAccess(request.access());
        userRepository.save(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(new RegisterUserResponse(newUser.getName(), newUser.getEmail(), newUser.getAccess()));
    }
}
