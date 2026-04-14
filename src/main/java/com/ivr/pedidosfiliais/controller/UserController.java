package com.ivr.pedidosfiliais.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.ivr.pedidosfiliais.entities.User;
import com.ivr.pedidosfiliais.services.UserService;


@Controller
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<String> save(@RequestBody User user){
        Boolean saved = userService.save(user);
        if(saved){
            return ResponseEntity.ok("Registrado");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Corpo de usuário inválido");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData){
        User usuarioLogado = userService.validarLogin(loginData.getEmail(), loginData.getPassword());

        if(usuarioLogado != null){
            Map<String, Object> resposta = new HashMap<>();
            resposta.put("nome", usuarioLogado.getName());
            resposta.put("email", usuarioLogado.getEmail());

            return ResponseEntity.ok(resposta);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou senha invalido!");
    }
}