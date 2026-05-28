package com.ivr.pedidosfiliais.config;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ivr.pedidosfiliais.dto.JWTUserData;
import com.ivr.pedidosfiliais.entities.User;
import com.ivr.pedidosfiliais.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter {
    
    private final TokenConfig tokenConfig;
    private final UserRepository userRepository;

    // Construtor injetando o TokenConfig e o UserRepository
    public SecurityFilter(TokenConfig tokenConfig, UserRepository userRepository) {
        this.tokenConfig = tokenConfig;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authorizedHeader = request.getHeader("Authorization");

        if (authorizedHeader != null && !authorizedHeader.isEmpty() && authorizedHeader.startsWith("Bearer ")) {
            String token = authorizedHeader.substring("Bearer ".length());
            Optional<JWTUserData> optUser = tokenConfig.validateToken(token);
            
            if (optUser.isPresent()) {
                JWTUserData userData = optUser.get();
                
                // 1. Vai no banco de dados e busca o usuário usando o e-mail salvo no token (userData.email())
                var userDetails = userRepository.findByEmail(userData.email());
                
                if (userDetails.isPresent()) {
                    // 2. Converte para a sua entidade User e pega o acesso real dele
                    User user = (User) userDetails.get();
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getAccess());
                    
                    // 3. Coloca a autoridade validada na sessão
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userData, 
                            null, 
                            Collections.singletonList(authority)
                    );
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        
        filterChain.doFilter(request, response);
    }
}