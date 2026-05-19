package com.ivr.pedidosfiliais.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ivr.pedidosfiliais.entities.Pedido;
import com.ivr.pedidosfiliais.entities.ProdutoPedido;
import com.ivr.pedidosfiliais.enums.Filiais;
import com.ivr.pedidosfiliais.repository.PedidosRepository;
import com.ivr.pedidosfiliais.repository.ProdutoPedidoRepository;

@Service
public class PedidoService {

    @Autowired
    private PedidosRepository pedidosRepository;
    @Autowired
    private ProdutoPedidoRepository produtoPedidoRepository;

    private Pedido pedido;

    // #region CRUD
    public Boolean save(Pedido pedido) {
        if (pedido != null) {
            // Vincula os produtos ao pedido para preencher a FK no banco
            if (pedido.getLProdutos() != null) {
                for (ProdutoPedido item : pedido.getLProdutos()) {
                    item.setPedido(pedido);
                }
            }

            // 1. Salva o pedido atual
            Pedido pedidoSalvo = pedidosRepository.save(pedido);

            // 2. Conta quantos pedidos essa filial específica tem agora no banco
            long totalPedidosFilial = pedidosRepository.countByFilial(pedidoSalvo.getFilial());

            // 3. Se passou do limite de 8, deleta o mais antigo dela
            if (totalPedidosFilial > 8) {
                // Busca os pedidos daquela filial ordenados do mais antigo para o mais novo
                List<Pedido> pedidosDaFilial = pedidosRepository
                        .findByFilialOrderByDataCriacaoAsc(pedidoSalvo.getFilial());

                if (!pedidosDaFilial.isEmpty()) {
                    // O primeiro da lista [0] é o mais antigo devido à ordenação ASC
                    Pedido maisAntigo = pedidosDaFilial.get(0);

                    // Deleta o mais antigo (e o CASCADE apaga os itens dele automaticamente no
                    // MySQL)
                    pedidosRepository.delete(maisAntigo);
                }
            }
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

    public List<ProdutoPedido> findByIdPedido(Long id) {
        try {
            return produtoPedidoRepository.findByPedidoId(id);
        } catch (ArrayIndexOutOfBoundsException e) {
            return new ArrayList<>();
        }
    }

    public Optional<Pedido> findByIdProdutos(Long pedido) {
        return pedidosRepository.findById(pedido);
    }

    @Transactional
    public Boolean attPedido(Pedido nPedido) {
        if (nPedido == null || nPedido.getId() == null) {
            return false;
        }

        // REMOVA a busca no banco aqui.
        // Use a lista que veio no parâmetro da função!
        List<ProdutoPedido> listaVindaDoFront = nPedido.getLProdutos();

        return pedidosRepository.findById(nPedido.getId()).map(pedidoExistente -> {
            pedidoExistente.setStatus(nPedido.getStatus());
            pedidoExistente.setObservacao(nPedido.getObservacao());

            if (listaVindaDoFront != null) {
                for (ProdutoPedido eProduto : pedidoExistente.getLProdutos()) {
                    for (ProdutoPedido produtoFront : listaVindaDoFront) {
                        // Agora você compara o item do banco com o item que veio do Front
                        if (produtoFront.getIdProduto().equals(eProduto.getIdProduto())) {
                            eProduto.setQuantEnviada(produtoFront.getQuantEnviada());
                            break;
                        }
                    }
                }
            }
            pedidosRepository.save(pedidoExistente);
            return true;
        }).orElse(false);
    }

    // #endregion
}
