package com.ivr.pedidosfiliais.dto.request;

import jakarta.validation.constraints.NotEmpty;

public record LoginRequest(@NotEmpty(message = "Email obbrigatório") String email,
                           @NotEmpty(message = "Senha obrigatória") String password){
}
