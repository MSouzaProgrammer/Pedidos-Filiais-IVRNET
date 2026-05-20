package com.ivr.pedidosfiliais.dto.request;

import com.ivr.pedidosfiliais.entities.Pedido;

public record ProdutoPedidoRequest(Long idProduto, Pedido pedido, String name, String undMedida, Long quant, Long quantEnviada) {

}
