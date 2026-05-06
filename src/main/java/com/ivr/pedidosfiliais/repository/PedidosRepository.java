package com.ivr.pedidosfiliais.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ivr.pedidosfiliais.entities.Pedido;

@Repository
public interface PedidosRepository extends JpaRepository<Pedido, Long>{
    Optional<Pedido> findByFilial(Long filial);
}
