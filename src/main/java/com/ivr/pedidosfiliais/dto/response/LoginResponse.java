package com.ivr.pedidosfiliais.dto.response;

import com.ivr.pedidosfiliais.enums.Access;

public record LoginResponse(String token, String name, Access access) {
}
