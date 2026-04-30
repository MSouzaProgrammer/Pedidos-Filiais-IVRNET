package com.ivr.pedidosfiliais.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ivr.pedidosfiliais.entities.Pedido;
import com.ivr.pedidosfiliais.entities.ProdutoPedido;
import com.ivr.pedidosfiliais.enums.Filiais;
import com.ivr.pedidosfiliais.enums.Status;
import com.ivr.pedidosfiliais.repository.PedidosRepository;

@Service
public class PedidoService {

    @Autowired
    private PedidosRepository pedidosRepository;

    private Pedido pedido;

    //#region CRUD
    public Boolean save(Pedido pedido) {
        if (pedido!= null) {
            if (pedido.getLProdutos() != null) {
            for (ProdutoPedido item : pedido.getLProdutos()) {
                item.setPedido(pedido); // <--- É ISSO AQUI QUE PREENCHE A COLUNA NO BANCO!
            }
        }
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

    public Boolean addProduto(ProdutoPedido produto){
        if(produto != null){
            pedido.addProduto(produto);
            return true;
        }
        return false;
    }

    public Pedido findById(Long id){
        if(pedidosRepository.existsById(id)){
            return pedidosRepository.findById(id).orElse(pedido);
        }
        return null;
    }

    public Boolean novoStatus(Status NovoStatus, Long id){
        if(NovoStatus != null){
            
        }
        return false;
    }

    public Boolean trocarFilial(Long id, Filiais nFilial){
        if(nFilial != null){
            Pedido pedido = findById(id);
            pedido.setFilial(nFilial);
            return true;
        }
        return false;
    }
    //#endregion
}
