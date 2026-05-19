package com.ivr.pedidosfiliais.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {
    //Só um teste de acesso
    @GetMapping
    public String test(){
        return "Testando segurança";
    }
}
