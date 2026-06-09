package com.ivr.pedidosfiliais.interfaces;

public interface RegistroBrutoRelatorio {
    Long getPedidoId();
    String getName();
    String getUndMedida();
    Integer getFilial();
    Integer getQuantEnviada();
    Integer getStatus();
}