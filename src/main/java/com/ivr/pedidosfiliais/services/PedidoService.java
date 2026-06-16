package com.ivr.pedidosfiliais.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ivr.pedidosfiliais.dto.request.PedidoRequest;
import com.ivr.pedidosfiliais.dto.request.ProdutoPedidoRequest;
import com.ivr.pedidosfiliais.dto.response.PedidoResponse;
import com.ivr.pedidosfiliais.dto.response.ProdutoPedidoResponse;
import com.ivr.pedidosfiliais.entities.Pedido;
import com.ivr.pedidosfiliais.entities.ProdutoPedido;
import com.ivr.pedidosfiliais.enums.Filiais;
import com.ivr.pedidosfiliais.enums.Status;
import com.ivr.pedidosfiliais.repository.PedidosRepository;
import com.ivr.pedidosfiliais.repository.ProdutoPedidoRepository;

@Service
public class PedidoService {

    
    private final PedidosRepository pedidosRepository;
    private final ProdutoPedidoRepository produtoPedidoRepository;
    private Pedido pedido;
    

    public PedidoService(PedidosRepository pedidosRepository, ProdutoPedidoRepository produtoPedidoRepository) {
        this.pedidosRepository = pedidosRepository;
        this.produtoPedidoRepository = produtoPedidoRepository;
    }

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

            // 3. Se passou do limite de 15, deleta o mais antigo dela
            if (totalPedidosFilial > 20) {
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

    public List<PedidoResponse> findByIdFilial(Long filial) {
        try {

            // Converte o ID para o Enum de forma mais segura
            Filiais filialEnum = Filiais.values()[filial.intValue()];
            List<Pedido> listaPedidos = pedidosRepository.findTop7ByFilialOrderByIdDesc(filialEnum);
            List<PedidoResponse> pedidoResponseList = new ArrayList<>();

            for (Pedido pedido : listaPedidos) {
                List<ProdutoPedidoResponse> listaProdutos = new ArrayList<>();
                if (pedido.getLProdutos() != null) {
                    
                    for (ProdutoPedido item : pedido.getLProdutos()) {
                        ProdutoPedidoResponse pResponse = new ProdutoPedidoResponse(item.getId(), item.getIdProduto(),
                                item.getPedido(), item.getName(), item.getUndMedida(), item.getQuant(),
                                item.getQuantEnviada());
                        listaProdutos.add(pResponse);
                    }
                }

                PedidoResponse pedidoResponse = new PedidoResponse(pedido.getId(), pedido.getStatus(), filialEnum,
                pedido.getObservacao(), pedido.getUsuario(), listaProdutos, pedido.getDataCriacao());
                pedidoResponseList.add(pedidoResponse);
            }
            return pedidoResponseList;
        } catch (ArrayIndexOutOfBoundsException e) {
            return new ArrayList<>(); // Retorna lista vazia se o ID da filial não existir no Enum
        }
    }

    public List<ProdutoPedidoResponse> findByIdProdutoPedido(Long id) {
        try {
            List<ProdutoPedido> listaProdutoPedidos = produtoPedidoRepository.findByPedidoId(id);
            List<ProdutoPedidoResponse> lPedidoResponses = new ArrayList<>();

            for(ProdutoPedido produtoPedido : listaProdutoPedidos){
                ProdutoPedidoResponse produtoPedidoResponse = new ProdutoPedidoResponse(produtoPedido.getId(), produtoPedido.getIdProduto(), produtoPedido.getPedido(), produtoPedido.getName(), produtoPedido.getUndMedida(), produtoPedido.getQuant(), produtoPedido.getQuantEnviada());
                lPedidoResponses.add(produtoPedidoResponse);
            }
            return lPedidoResponses;
        } catch (ArrayIndexOutOfBoundsException e) {
            return new ArrayList<>();
        }
    }

    public Optional<PedidoResponse> findByIdProdutos(Long pedido) {
        Optional<Pedido> ped = pedidosRepository.findById(pedido);
        if(ped.isPresent()){
            List<ProdutoPedidoResponse> lPedidoResponses = new ArrayList<>();
            Pedido realPedido = ped.get();
            for(ProdutoPedido produtoPedido : realPedido.getLProdutos()){
                ProdutoPedidoResponse produtoPedidoResponse = new ProdutoPedidoResponse(produtoPedido.getId(), produtoPedido.getIdProduto(), produtoPedido.getPedido(), produtoPedido.getName(), produtoPedido.getUndMedida(), produtoPedido.getQuant(), produtoPedido.getQuantEnviada());
                lPedidoResponses.add(produtoPedidoResponse);
            }
            PedidoResponse pedidoResponse = new PedidoResponse(realPedido.getId(), realPedido.getStatus(), realPedido.getFilial(), realPedido.getObservacao(), realPedido.getUsuario(), lPedidoResponses, realPedido.getDataCriacao());
            return Optional.ofNullable(pedidoResponse);
        }
        return Optional.empty();
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
                // 🚀 1. DELEÇÃO FORÇADA: Acha quem não está mais na lista e apaga do banco
                List<ProdutoPedido> paraRemover = new ArrayList<>();
                for (ProdutoPedido eProduto : pedidoExistente.getLProdutos()) {
                    boolean aindaExiste = listaVindaDoFront.stream()
                            .anyMatch(p -> p.getIdProduto().equals(eProduto.getIdProduto()));
                    if (!aindaExiste) {
                        paraRemover.add(eProduto);
                    }
                }
                pedidoExistente.getLProdutos().removeAll(paraRemover);
                produtoPedidoRepository.deleteAll(paraRemover); // 🔪 Apaga de verdade!

                // 🚀 2. ATUALIZAÇÃO E INSERÇÃO
                for (ProdutoPedido produtoFront : listaVindaDoFront) {
                    Optional<ProdutoPedido> existente = pedidoExistente.getLProdutos().stream()
                            .filter(p -> p.getIdProduto().equals(produtoFront.getIdProduto()))
                            .findFirst();

                    if (existente.isPresent()) {
                        existente.get().setQuant(produtoFront.getQuant()); // Atualiza Qtd Pedida se mudar
                        existente.get().setQuantEnviada(produtoFront.getQuantEnviada()); // Atualiza Qtd Enviada
                    } else {
                        // 🌟 É NOVO! Adiciona no pedido
                        produtoFront.setPedido(pedidoExistente);
                        pedidoExistente.addProduto(produtoFront);
                    }
                }
            } else {
                produtoPedidoRepository.deleteAll(pedidoExistente.getLProdutos());
                pedidoExistente.getLProdutos().clear();
            }

            pedidosRepository.save(pedidoExistente);
            return true;
        }).orElse(false);
    }
    // #endregion
}
