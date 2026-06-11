package com.ivr.pedidosfiliais.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ivr.pedidosfiliais.entities.Pedido;
import com.ivr.pedidosfiliais.enums.Filiais;

public interface PedidosRepository extends JpaRepository<Pedido, Long>{
    List<Pedido> findTop7ByFilialOrderByIdDesc(Filiais filial);

    long countByFilial(Filiais filial);
    List<Pedido> findByFilialOrderByDataCriacaoAsc(Filiais filial);
}