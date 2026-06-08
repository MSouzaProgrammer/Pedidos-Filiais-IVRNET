package com.ivr.pedidosfiliais.interfaces;

public interface RegistroBrutoRelatorio {
    Long getPedidoId();
    String getName();
    Integer getFilial();
    Integer getQuantEnviada();
    Integer getStatus();
}