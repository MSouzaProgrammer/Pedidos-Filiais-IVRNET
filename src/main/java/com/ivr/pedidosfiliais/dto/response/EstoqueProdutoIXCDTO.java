package com.ivr.pedidosfiliais.dto.response;

public record EstoqueProdutoIXCDTO(
        String id,
        String produto_descricao,
        String id_produto,
        String id_filial,
        String id_almox,
        String almox_ativo,
        String saldo,
        String almox_descricao,
        String produto_unidade,
        String produto_controla_estoque,
        String produto_pcomissao,
        String produto_preco_base,
        String produto_id_class_fiscal,
        String produto_tipo,
        String produto_ativo
) {
}