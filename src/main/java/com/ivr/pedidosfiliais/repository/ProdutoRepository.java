package com.ivr.pedidosfiliais.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ivr.pedidosfiliais.entities.Produto;



public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    boolean existsByIdProduto(Long idProduto);
}
