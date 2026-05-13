package com.ivr.pedidosfiliais.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ivr.pedidosfiliais.entities.Pedido;
import com.ivr.pedidosfiliais.entities.ProdutoPedido;
import com.ivr.pedidosfiliais.enums.Filiais;
import com.ivr.pedidosfiliais.repository.PedidosRepository;
import com.ivr.pedidosfiliais.repository.ProdutoPedidoRepository;

@Service
public class PedidoService {

    @Autowired
    private PedidosRepository pedidosRepository;
    private ProdutoPedidoRepository produtoPedidoRepository;

    private Pedido pedido;

    // #region CRUD
    public Boolean save(Pedido pedido) {
        if (pedido != null) {
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

    public Boolean delete(Long id) {
        if (pedidosRepository.existsById(id)) {
            pedidosRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Boolean addProduto(ProdutoPedido produto) {
        if (produto != null) {
            pedido.addProduto(produto);
            return true;
        }
        return false;
    }

    public List<Pedido> findByIdFilial(Long filial) {
        try {
            // Converte o ID para o Enum de forma mais segura
            Filiais filialEnum = Filiais.values()[filial.intValue()];
            return pedidosRepository.findTop7ByFilialOrderByIdDesc(filialEnum);
        } catch (ArrayIndexOutOfBoundsException e) {
            return new ArrayList<>(); // Retorna lista vazia se o ID da filial não existir no Enum
        }
    }

    public Optional<Pedido> findByIdProdutos(Long pedido) {
        return pedidosRepository.findById(pedido);
    }

    public Boolean attPedido(Pedido nPedido) {
    if (nPedido == null || nPedido.getId() == null) {
        return false;
    }
    ProdutoPedido produtoPedido;
    return pedidosRepository.findById(nPedido.getId()).map(pedidoExistente -> {
        pedidoExistente.setStatus(nPedido.getStatus());
        pedidoExistente.setObservacao(nPedido.getObservacao());
        
        
        for(ProdutoPedido produto: lista){
            if(produto.getId() == ){

            }
        }
        
        pedidosRepository.save(pedidoExistente);
        return true;
    }).orElse(false);
}

    // #endregion
}
