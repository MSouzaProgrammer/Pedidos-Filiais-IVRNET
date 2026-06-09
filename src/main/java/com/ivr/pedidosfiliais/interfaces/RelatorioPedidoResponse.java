package com.ivr.pedidosfiliais.interfaces;

import java.util.Map;

public record RelatorioPedidoResponse(
    String nomeProduto, 
    String undMedida,
    Integer quantidadeTotal,
    Map<String, Integer> distribuicaoFiliais
){}
