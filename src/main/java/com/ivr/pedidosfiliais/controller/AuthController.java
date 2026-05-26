package com.ivr.pedidosfiliais.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ivr.pedidosfiliais.config.TokenConfig;
import com.ivr.pedidosfiliais.dto.request.AlterarSenhaRequest;
import com.ivr.pedidosfiliais.dto.request.LoginRequest;
import com.ivr.pedidosfiliais.dto.request.RegisterRequest;
import com.ivr.pedidosfiliais.dto.response.LoginResponse;
import com.ivr.pedidosfiliais.dto.response.RegisterUserResponse;
import com.ivr.pedidosfiliais.entities.User;
import com.ivr.pedidosfiliais.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j; // Import do Lombok adicionado

@Slf4j // Anotação do Lombok ativada!
@RestController
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
        log.info("Tentativa de login recebida para o e-mail: {}", loginRequest.email());

        UsernamePasswordAuthenticationToken userAndPass = new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password());
        Authentication authentication = authenticationManager.authenticate(userAndPass);

        User user = (User) authentication.getPrincipal();
        String token = tokenConfig.generateToken(user);

        log.info("Usuário {} autenticado com sucesso! Nível de acesso: {}", user.getEmail(), user.getAccess());

        return ResponseEntity.ok(new LoginResponse(token, user.getName(), user.getAccess()));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterUserResponse> register(@Valid @RequestBody RegisterRequest request){
        log.info("Solicitação de cadastro recebida para o e-mail: {} com permissão: {}", request.email(), request.access());

        User newUser = new User();
        newUser.setPassword(passwordEncoder.encode(request.password()));
        newUser.setEmail(request.email());
        newUser.setName(request.name());
        newUser.setAccess(request.access());
        userRepository.save(newUser);

        log.info("Novo usuário cadastrado com sucesso! Nome: {}, E-mail: {}", newUser.getName(), newUser.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED).body(new RegisterUserResponse(newUser.getName(), newUser.getEmail(), newUser.getAccess()));
    }

    @PutMapping("/alterar-senha")
    public ResponseEntity<String> alterarSenha(@Valid @RequestBody AlterarSenhaRequest request) {
        log.info("Solicitação para alterar senha do e-mail: {}", request.email());

        // 1. Busca o usuário no banco pelo e-mail
        var userDetails = userRepository.findByEmail(request.email());

        if (userDetails.isPresent()) {
            // 2. Converte para a sua entidade User
            User user = (User) userDetails.get();
            
            // 3. Criptografa a nova senha e salva
            user.setPassword(passwordEncoder.encode(request.novaSenha()));
            userRepository.save(user);

            log.info("Senha alterada com sucesso para o usuário: {}", request.email());
            return ResponseEntity.ok("Senha atualizada com sucesso!");
        }

        log.warn("Falha ao alterar senha: O e-mail {} não existe.", request.email());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado.");
    }
}