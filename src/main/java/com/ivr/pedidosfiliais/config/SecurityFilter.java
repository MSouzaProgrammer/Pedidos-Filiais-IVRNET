package com.ivr.pedidosfiliais.config;

import java.io.IOException;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ivr.pedidosfiliais.dto.JWTUserData;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter{
    private final TokenConfig tokenConfig;

    public SecurityFilter(TokenConfig tokenConfig) {
        this.tokenConfig = tokenConfig;
    }

    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException{
        String authorizedHeader = request.getHeader("Authorization");

        if(authorizedHeader != null && !authorizedHeader.isEmpty() && authorizedHeader.startsWith("Bearer ")){
            String token = authorizedHeader.substring("Bearer ".length());
            Optional<JWTUserData> optUSer = tokenConfig.validateToken(token);
            if(optUSer.isPresent()){
                JWTUserData userData = optUSer.get();
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userData, null, null);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
            }
            filterChain.doFilter(request, response);
        }
        else{
             filterChain.doFilter(request, response);
        }
    }

    @SuppressWarnings("unused")
    private UsernamePasswordAuthenticationToken UsernamePasswordAuthenticationToken(JWTUserData userData, Object object,
            Object object2) {
        throw new UnsupportedOperationException("Unimplemented method 'UsernamePasswordAuthenticationToken'");
    }
}
