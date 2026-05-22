package com.ivr.pedidosfiliais.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.ivr.pedidosfiliais.enums.Filiais;
import com.ivr.pedidosfiliais.enums.Status;

public record PedidoResponse(Long id ,Status status, Filiais filial, String observacao, String usuario , List<ProdutoPedidoResponse> lProdutos, LocalDateTime data) {

}
