package com.ivr.pedidosfiliais.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ivr.pedidosfiliais.entities.ProdutoPedido;
import com.ivr.pedidosfiliais.interfaces.RegistroBrutoRelatorio;

public interface ProdutoPedidoRepository  extends JpaRepository<ProdutoPedido, Long>{
    List<ProdutoPedido> findByPedidoId(Long id);
    @Query(value = """
        SELECT 
            pp.pedido_id as pedidoId,
            pp.name as name,
            pp.und_medida as undMedida,
            p.filial as filial,
            pp.quant_enviada as quantEnviada
        FROM produto_pedido pp
        JOIN tb_pedidos p ON pp.pedido_id = p.id
        WHERE p.data_criacao BETWEEN :dataInicio AND :dataFim
        """, nativeQuery = true)
    List<RegistroBrutoRelatorio> buscarDadosBrutosRelatorioPorData(
        @Param("dataInicio") LocalDate dataInicio, 
        @Param("dataFim") LocalDate dataFim
    );
}
