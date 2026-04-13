package com.ivr.pedidosfiliais.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ivr.pedidosfiliais.entities.Pedido;

@Repository
public interface PedidosRepository extends JpaRepository<Pedido, Long>{
}
