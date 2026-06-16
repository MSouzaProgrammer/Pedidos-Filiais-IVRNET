package com.ivr.pedidosfiliais.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ivr.pedidosfiliais.dto.request.PedidoRequest;
import com.ivr.pedidosfiliais.dto.response.PedidoResponse;
import com.ivr.pedidosfiliais.entities.Pedido;
import com.ivr.pedidosfiliais.services.PedidoService;

import lombok.extern.slf4j.Slf4j; // Import do Lombok adicionado

@Slf4j // Anotação do Lombok ativada!
@RestController
@RequestMapping("/pedido")
public class PedidoController {


    private final PedidoService pedidoService;
    
    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<String> save(@RequestBody PedidoRequest pedido) {
        log.info("Requisição POST recebida em /pedido para criar um novo pedido.");

        Boolean saved = pedidoService.save(pedido);
        if (saved) {
            log.info("Pedido processado e salvo com sucesso pelo Service.");
            return ResponseEntity.status(HttpStatus.CREATED).build();
        }
        
        log.warn("Falha ao salvar pedido: Requisição recusada pelo Service (Dados inválidos).");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Produto Invalido");
    }

    @GetMapping("/{filial}")
    public ResponseEntity<?> findByIdFilial(@PathVariable Long filial) {
        log.info("Requisição GET recebida em /pedido/{} para buscar pedidos da filial.", filial);

        List<PedidoResponse> lPedidos = pedidoService.findByIdFilial(filial);
        if (lPedidos != null) {
            log.info("Busca concluída. Encontrado(s) {} pedido(s) para a filial {}.", lPedidos.size(), filial);
            return ResponseEntity.status(HttpStatus.FOUND).body(lPedidos);
        }
        log.warn("Nenhum pedido foi encontrado no banco de dados para a filial ID: {}.", filial);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nenhum pedido encontrado para esta filial");
    }

    @GetMapping("/pedidoId/{id}")
    public ResponseEntity<?> findByIdProdutos(@PathVariable Long id) {
        log.info("Requisição GET recebida em /pedido/pedidoId/{} para buscar detalhes do pedido.", id);

        Optional<PedidoResponse> pedidoResponse = pedidoService.findByIdProdutos(id);
        if (pedidoResponse.isPresent()) {
            log.info("Pedido ID: {} encontrado com sucesso.", id);
            return ResponseEntity.status(HttpStatus.FOUND).body(pedidoResponse);
        }
        
        log.warn("Busca por pedido específico falhou: O ID {} não existe no banco de dados.", id);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nenhum produto foi encontrado!");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> atualizarPedido(@PathVariable Long id, @RequestBody Pedido nPedido) {
        log.info("Requisição PUT recebida em /pedido/{} para atualizar os dados do pedido.", id);

        nPedido.setId(id);
        Boolean att = pedidoService.attPedido(nPedido);
        if (att) {
            log.info("Pedido ID: {} atualizado com sucesso no banco de dados.", id);
            return ResponseEntity.ok("Pedido updated com sucesso!");
        }
        log.warn("Não foi possível atualizar: Pedido ID: {} não foi localizado para alteração.", id);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pedido não encontrado.");
    }
}