package com.ivr.pedidosfiliais.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ivr.pedidosfiliais.entities.ProdutoPedido;

public interface ProdutoPedidoRepository  extends JpaRepository<ProdutoPedido, Long>{
}
