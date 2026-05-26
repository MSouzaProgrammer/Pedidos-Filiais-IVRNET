package com.ivr.pedidosfiliais.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import lombok.extern.slf4j.Slf4j; // Import do Lombok adicionado

@Slf4j // Anotação do Lombok ativada!
@Controller
public class HomeController {

    @GetMapping("/")
    public String index(){
        log.info("Acesso à URL raiz (/) recebido. Redirecionando usuário para /login.html");
        
        return "forward:/login.html";
    }
}