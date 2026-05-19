package com.ivr.pedidosfiliais.dto;

import lombok.Builder;

@Builder
public record JWTUserData(Long userId, String email) {

}
