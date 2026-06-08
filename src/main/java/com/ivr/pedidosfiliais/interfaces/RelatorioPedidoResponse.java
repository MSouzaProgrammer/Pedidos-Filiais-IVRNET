package com.ivr.pedidosfiliais.interfaces;

import java.util.Map;

public record RelatorioPedidoResponse(
    String nomeProduto, 
    Integer quantidadeTotal, 
    Map<String, Integer> distribuicaoFiliais
){}
