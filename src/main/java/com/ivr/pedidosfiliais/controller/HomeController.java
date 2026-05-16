package com.ivr.pedidosfiliais.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    @CrossOrigin(origins = "*")
    public String index(){
        return "forward:/login.html";
    }
}
