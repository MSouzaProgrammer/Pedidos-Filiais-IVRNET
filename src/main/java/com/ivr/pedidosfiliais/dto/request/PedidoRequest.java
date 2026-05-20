package com.ivr.pedidosfiliais.dto.request;

import java.util.List;

import com.ivr.pedidosfiliais.enums.Filiais;
import com.ivr.pedidosfiliais.enums.Status;

public record PedidoRequest(Status status, Filiais filial, String observacao, String usuario ,List<ProdutoPedidoRequest> lProdutos) {
}
