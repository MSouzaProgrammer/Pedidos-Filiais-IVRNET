package com.ivr.pedidosfiliais.dto.response;

import com.ivr.pedidosfiliais.enums.Access;

public record RegisterUserResponse(String name, String email, Access access) {
}
