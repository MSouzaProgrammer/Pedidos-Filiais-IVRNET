package com.ivr.pedidosfiliais.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.Filter;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final SecurityFilter securityFilter;

    public SecurityConfig(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    // Faz o seguinte, por linha
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        return http
                .csrf(csrf -> csrf.disable()) // desativa a proteção secundária contra csrf
                .cors(Customizer.withDefaults()) // Puxa automaticamente o Bean do CorsConfigurationSource abaixo
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Diz que sistema nunca vai lembrar do usuário, sempre vai perguntar
                .authorizeHttpRequests(authorize  -> authorize
                    .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll() // Se der algum erro o usuário vai ver
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // LIBERA O NAVEGADOR PARA TESTAR A CONEXÃO (CORS PREFLIGHT)
                    .requestMatchers(HttpMethod.POST, "/auth/login").permitAll() // Todo mundo pode usar e mandar coisas pelo login
                    .requestMatchers(HttpMethod.POST, "/auth/register").permitAll() // Todo mundo pode se registrar
                    .anyRequest().authenticated()) // Qualquer outra coisa ele tem que ser um usuário autenticado
                .addFilterBefore((Filter) securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build(); // Bota tudo pra funcionar
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception{
        return authenticationConfiguration.getAuthenticationManager();
    }

    // Essa é a função que criptografa tudo
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    // A MÁGICA ACONTECE AQUI: Configuração global de CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permite o seu frontend (Live Server, Vite, etc) acessar o backend
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); 
        // Permite os métodos que você usa no fetch
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); 
        // Permite o envio do Token (Authorization)
        configuration.setAllowedHeaders(Arrays.asList("*")); 
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}