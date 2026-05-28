package com.ivr.pedidosfiliais;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class PedidosfiliaisApplication {

	@PostConstruct
	public void init(){
		TimeZone.setDefault(TimeZone.getTimeZone("America/Campo_Grande"));
	}
	public static void main(String[] args) {
		SpringApplication.run(PedidosfiliaisApplication.class, args);
	}
}