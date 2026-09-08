package com.ivr.pedidosfiliais.dto.response;

import java.util.List;

public record ProdutosIXCResponse(
        String page,
        String total,
        List<ProdutoIXCDTO> registros
) {
}
