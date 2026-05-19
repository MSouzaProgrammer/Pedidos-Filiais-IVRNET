package com.ivr.pedidosfiliais.dto.request;

import com.ivr.pedidosfiliais.enums.Access;

import jakarta.validation.constraints.NotEmpty;

public record RegisterRequest(@NotEmpty(message = "Nome obrigatório!") String name,
                              @NotEmpty(message = "Email obrigatório!") String email,
                              @NotEmpty(message = "Senha obrigatório!") String password,
                                                                        Access access){
}
