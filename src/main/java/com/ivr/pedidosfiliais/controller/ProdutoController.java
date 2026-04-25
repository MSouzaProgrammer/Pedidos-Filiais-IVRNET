package com.ivr.pedidosfiliais.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ivr.pedidosfiliais.entities.Produto;
import com.ivr.pedidosfiliais.services.ProdutoService;

@RestController
@RequestMapping("/produto")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @PostMapping
    public ResponseEntity<String> save(@RequestBody Produto produto){
        System.out.println("NOME RECEBIDO: " + produto.getName() + ", " + produto.getIdProduto());
        Boolean saved = produtoService.save(produto);
        if(saved){
            return ResponseEntity.ok("Registrado");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Produto Invalido");
    }

    @GetMapping
    public List<Produto> findAll(){
        return produtoService.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteById(@PathVariable Long id){
        Boolean deleted = produtoService.delete(id);
        if(deleted){
            return ResponseEntity.ok("Deleted");
        }
        return ResponseEntity.badRequest().build();
    }
}