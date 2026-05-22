package com.ivr.pedidosfiliais.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ivr.pedidosfiliais.dto.request.ProdutoRequest;
import com.ivr.pedidosfiliais.dto.response.ProdutoResponse;
import com.ivr.pedidosfiliais.entities.Produto;
import com.ivr.pedidosfiliais.services.ProdutoService;

import lombok.extern.slf4j.Slf4j; // Import do Lombok adicionado

@Slf4j // Anotação do Lombok ativada!
@RestController
@RequestMapping("/produto")
@CrossOrigin(origins = "*")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @PostMapping
    public ResponseEntity<String> save(@RequestBody ProdutoRequest produtoRequest){
        log.info("Requisição POST recebida em /produto para cadastrar o produto: '{}'", produtoRequest.name());

        Boolean saved = produtoService.save(produtoRequest);
        if(saved){
            log.info("Produto '{}' registrado com sucesso no banco de dados.", produtoRequest.name());
            return ResponseEntity.ok("Registrado");
        }
        
        log.warn("Falha ao registrar produto: Dados inválidos enviados no payload.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Produto Invalido");
    }

    @GetMapping
    public ResponseEntity<?> findAll(){
        log.info("Requisição GET recebida em /produto para listar todos os produtos.");

        List<ProdutoResponse> lProdutoResponses = new ArrayList<>();
        List<Produto> produtos = produtoService.findAll();
        
        for(Produto produto : produtos){
            ProdutoResponse pResponse = new ProdutoResponse(produto.getId(), produto.getIdProduto(), produto.getName(), produto.getUndMedida());
            lProdutoResponses.add(pResponse);
        }
        
        if(!lProdutoResponses.isEmpty()){
            log.info("Listagem concluída. Total de produtos retornados: {}.", lProdutoResponses.size());
            return ResponseEntity.status(HttpStatus.FOUND).body(lProdutoResponses);
        }
        log.warn("Nenhum produto foi localizado no catálogo do banco de dados.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Produtos não encontrados");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteById(@PathVariable Long id){
        log.info("Requisição DELETE recebida em /produto/{} para remover produto.", id);

        Boolean deleted = produtoService.delete(id);
        if(deleted){
            log.info("Produto ID: {} deletado com sucesso do sistema.", id);
            return ResponseEntity.ok("Deleted");
        }
        
        log.warn("Falha ao deletar: Produto ID: {} não existe para exclusão.", id);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pedido não encontrado!");
    }

    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody ProdutoRequest produto){
        log.info("Requisição PUT recebida em /produto/update para atualizar dados do produto ID: {}.", produto.id());

        Boolean nProduto = produtoService.update(produto);
        if(nProduto){
            log.info("Produto ID: {} alterado e salvo com sucesso.", produto.id());
            return ResponseEntity.ok("Produto Atualizado!");
        }
        log.warn("Aviso de atualização: O produto ID: {} não foi modificado.", produto.id());
        return ResponseEntity.status(HttpStatus.NOT_MODIFIED).body("Produto não alterado");
    }
}