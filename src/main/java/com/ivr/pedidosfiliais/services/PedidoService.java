package com.ivr.pedidosfiliais.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ivr.pedidosfiliais.dto.request.PedidoRequest;
import com.ivr.pedidosfiliais.dto.request.ProdutoPedidoRequest;
import com.ivr.pedidosfiliais.entities.Pedido;
import com.ivr.pedidosfiliais.entities.ProdutoPedido;
import com.ivr.pedidosfiliais.enums.Filiais;
import com.ivr.pedidosfiliais.enums.Status;
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
    public Boolean save(PedidoRequest pedidoRequest) {
        if (pedidoRequest != null) {
            // 1. Instancia a Entidade de banco real
            Pedido pedido = new Pedido();

            // Transfere os dados básicos usando os métodos nativos do record
            pedido.setFilial(pedidoRequest.filial());
            pedido.setObservacao(pedidoRequest.observacao());
            pedido.setUsuario(pedidoRequest.usuario()); // ou pedidoRequest.usuario(), conforme declarou no record

            // Mantém a regra de negócio segura forçando o status como PENDENTE
            pedido.setStatus(Status.PENDENTE);

            // Inicializa a lista de produtos para evitar NullPointerException
            pedido.setLProdutos(new ArrayList<>());

            // CORREÇÃO CRUCIAL: Percorre a lista do DTO e converte para Entidades de Banco
            if (pedidoRequest.lProdutos() != null) { // Altere para .lProduto() se manteve esse nome no record
                for (ProdutoPedidoRequest itemDTO : pedidoRequest.lProdutos()) {

                    // Cria o objeto real que o banco de dados entende
                    ProdutoPedido itemBanco = new ProdutoPedido();
                    itemBanco.setIdProduto(itemDTO.idProduto());
                    itemBanco.setPedido(pedido);
                    itemBanco.setName(itemDTO.name());
                    itemBanco.setUndMedida(itemDTO.undMedida());
                    itemBanco.setQuant(itemDTO.quant());

                    // Adiciona o item já preenchido à lista do pedido
                    pedido.addProduto(itemBanco);
                }
            }

            // Grava o pedido e os produtos no banco de dados
            Pedido pedidoSalvo = pedidosRepository.save(pedido);

            // 2. Sua lógica perfeita de contagem por filial
            long totalPedidosFilial = pedidosRepository.countByFilial(pedidoSalvo.getFilial());

            // 3. Se passou do limite de 8, deleta o mais antigo dela
            if (totalPedidosFilial > 8) {
                List<Pedido> pedidosDaFilial = pedidosRepository
                        .findByFilialOrderByDataCriacaoAsc(pedidoSalvo.getFilial());

                if (!pedidosDaFilial.isEmpty()) {
                    Pedido maisAntigo = pedidosDaFilial.get(0);
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
