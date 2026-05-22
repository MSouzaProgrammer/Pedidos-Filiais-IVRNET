package com.ivr.pedidosfiliais.dto.response;

import com.ivr.pedidosfiliais.entities.Pedido;

public record ProdutoPedidoResponse(Long id ,Long idProduto, Pedido pedido, String name, String undMedida, Long quant, Long quantEnviada) {

}
