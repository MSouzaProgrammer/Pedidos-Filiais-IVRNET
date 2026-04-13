package com.ivr.pedidosfiliais.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ivr.pedidosfiliais.entities.Pedido;
import com.ivr.pedidosfiliais.entities.User;
import com.ivr.pedidosfiliais.repository.UserRepository;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    private User findByUser(Long id){
        return userRepository.findById(id).orElse(null);
    }

    //#region CRUD
    public Boolean save(User user){
        if(user != null){
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public Boolean delete(Long id){
        if(userRepository.existsById(id)){
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public User findById(Long id){
        return findById(id);
    }

    public List<User> findAll(){
        return userRepository.findAll();
    }
    //#endregion

    public List<Pedido> getAllList(Long id){
        User user = findByUser(id);
        return user.getPedidos();
    }

    public Boolean addPedido(Pedido pedido, Long id){
        User user = findByUser(id);
        user.addList(pedido);
        return true;
    }
}
