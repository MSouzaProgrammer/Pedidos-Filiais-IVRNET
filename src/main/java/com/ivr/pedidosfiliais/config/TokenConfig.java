package com.ivr.pedidosfiliais.config;

import java.time.Instant;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.ivr.pedidosfiliais.dto.JWTUserData;
import com.ivr.pedidosfiliais.entities.User;

@Component
public class TokenConfig {
    private String secret = "azulejo";

    public String generateToken(User user) {
        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.create()
                .withClaim("UserId", user.getId()) // Mantido "UserId" com U maiúsculo
                .withSubject(user.getEmail())
                .withExpiresAt(Instant.now().plusSeconds(86400))
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    public Optional<JWTUserData> validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            DecodedJWT decode = JWT.require(algorithm).build().verify(token);

            // Trocado o .builder() pelo construtor padrão do Record
            // Corrigido de "userId" para "UserId" para bater com o generateToken
            JWTUserData userData = new JWTUserData(
                    decode.getClaim("UserId").asLong(),
                    decode.getSubject());

            return Optional.of(userData);

        } catch (JWTVerificationException ex) {
            return Optional.empty();
        }
    }
}