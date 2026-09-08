package com.ivr.pedidosfiliais.dto.response;

import java.util.List;

public record EstoqueProdutosIXCResponse(
        String page,
        String total,
        List<EstoqueProdutoIXCDTO> registros
) {
}