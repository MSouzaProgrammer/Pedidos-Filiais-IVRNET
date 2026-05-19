package com.ivr.pedidosfiliais.services;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ivr.pedidosfiliais.repository.UserRepository;

@Service
public class AuthConfig implements UserDetailsService{

    private final UserRepository userRepository;
    public AuthConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        //Ele vai procurar o usuário pelo email, se nao achar ele vai devolver que nao achou o usuário
        return userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException(username));
    }
    
}
