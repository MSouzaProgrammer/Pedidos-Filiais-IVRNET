package com.ivr.pedidosfiliais.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ivr.pedidosfiliais.entities.Pedido;
import com.ivr.pedidosfiliais.entities.Produto;
import com.ivr.pedidosfiliais.repository.PedidosRepository;

@Service
public class PedidoService {

    @Autowired
    private PedidosRepository pedidosRepository;

    private Pedido pedido;

    //#region CRUD
    public Boolean save(Pedido pedido){
        if(pedido !=  null){
            pedidosRepository.save(pedido);
            return true;
        }
        return false;
    }

    public Boolean delete(Long id){
        if(pedidosRepository.existsById(id)){
            pedidosRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Boolean addProduto(Produto produto){
        if(produto != null){
            pedido.addProduto(produto);
            return true;
        }
        return false;
    }
    //#endregion
}
