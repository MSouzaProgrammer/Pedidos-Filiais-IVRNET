package com.ivr.pedidosfiliais.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import com.ivr.pedidosfiliais.services.ProdutoService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/produto")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping("/idP/{id}")
    public ResponseEntity<?> verificarIdProduto(
            @PathVariable Long id
    ) {

        boolean existe =
                produtoService.existeProduto(id);

        if (existe) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                        "Este ID de produto já está cadastrado."
                    );
        }

        return ResponseEntity
                .noContent()
                .build();
    }

    @PostMapping
    public ResponseEntity<String> save(
            @RequestBody ProdutoRequest produtoRequest
    ) {

        log.info(
                "Requisição POST recebida em /produto para cadastrar o produto: '{}'",
                produtoRequest.name()
        );

        Boolean saved =
                produtoService.save(produtoRequest);

        if (saved) {

            log.info(
                    "Produto '{}' registrado com sucesso.",
                    produtoRequest.name()
            );

            return ResponseEntity.ok("Registrado");
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Produto Invalido");
    }

    @GetMapping
    public ResponseEntity<?> findAll() {

        log.info(
                "Buscando produtos e estoque da Matriz no IXC."
        );

        List<ProdutoResponse> produtos =
                produtoService.findAll();

        if (!produtos.isEmpty()) {

            return ResponseEntity.ok(produtos);
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Produtos não encontrados");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteById(
            @PathVariable Long id
    ) {

        Boolean deleted =
                produtoService.delete(id);

        if (deleted) {

            return ResponseEntity.ok("Deleted");
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Produto não encontrado!");
    }

    @PutMapping("/update")
    public ResponseEntity<String> update(
            @RequestBody ProdutoRequest produto
    ) {

        Boolean atualizado =
                produtoService.update(produto);

        if (atualizado) {

            return ResponseEntity.ok(
                    "Produto Atualizado!"
            );
        }

        return ResponseEntity
                .status(HttpStatus.NOT_MODIFIED)
                .body("Produto não alterado");
    }
}