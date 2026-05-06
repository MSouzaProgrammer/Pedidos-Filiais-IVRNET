package com.ivr.pedidosfiliais.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ivr.pedidosfiliais.entities.Pedido;
import com.ivr.pedidosfiliais.enums.Filiais;

@Repository
public interface PedidosRepository extends JpaRepository<Pedido, Long>{
    Optional<Pedido> findByFilial(Filiais filial);
}
