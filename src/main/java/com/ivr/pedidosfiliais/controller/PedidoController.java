package com.ivr.pedidosfiliais.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ivr.pedidosfiliais.entities.Pedido;
import com.ivr.pedidosfiliais.services.PedidoService;

@RestController
@RequestMapping("/pedido")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<String> save(@RequestBody Pedido pedido){
        Boolean saved = pedidoService.save(pedido);
        if(saved){
            return ResponseEntity.ok("Registrado");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Produto Invalido");
    }

    @GetMapping("/{filial}")
    public List<Pedido> findByIdFilial(@PathVariable Long filial){
        return pedidoService.findByIdFilial(filial);
    }

    @GetMapping("/pedidoId/{id}")
    public Optional<Pedido> findByIdProdutos(@PathVariable Long id){
        return pedidoService.findByIdProdutos(id);
    }
}
