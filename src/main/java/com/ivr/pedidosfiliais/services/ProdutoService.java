package com.ivr.pedidosfiliais.services;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.ivr.pedidosfiliais.dto.request.ProdutoRequest;
import com.ivr.pedidosfiliais.dto.response.ProdutoResponse;
import com.ivr.pedidosfiliais.entities.Produto;
import com.ivr.pedidosfiliais.repository.ProdutoRepository;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final IxcProdutoService ixcProdutoService;

    public ProdutoService(
            ProdutoRepository produtoRepository,
            IxcProdutoService ixcProdutoService
    ) {
        this.produtoRepository = produtoRepository;
        this.ixcProdutoService = ixcProdutoService;
    }

    public Boolean save(ProdutoRequest produtorRequest) {

        if (produtorRequest != null) {

            Produto produto = new Produto();

            produto.setIdProduto(
                    produtorRequest.idProduto()
            );

            produto.setName(
                    produtorRequest.name()
            );

            produto.setUndMedida(
                    produtorRequest.undMedida()
            );

            produtoRepository.save(produto);

            return true;
        }

        return false;
    }

    public Boolean update(ProdutoRequest produtorRequest) {

        if (produtorRequest == null ||
                produtorRequest.id() == null) {

            return false;
        }

        return produtoRepository
                .findById(produtorRequest.id())
                .map(prodAntigo -> {

                    prodAntigo.setIdProduto(
                            produtorRequest.idProduto()
                    );

                    prodAntigo.setName(
                            produtorRequest.name()
                    );

                    prodAntigo.setUndMedida(
                            produtorRequest.undMedida()
                    );

                    produtoRepository.save(prodAntigo);

                    return true;

                })
                .orElse(false);
    }

    public Boolean delete(long id) {

        if (produtoRepository.existsById(id)) {

            produtoRepository.deleteById(id);

            return true;
        }

        return false;
    }

    public Produto findById(Long id) {

        if (produtoRepository.existsById(id)) {

            return produtoRepository
                    .findById(id)
                    .orElse(null);
        }

        return null;
    }

    public List<Produto> findAllEntity() {

        return produtoRepository.findAll();
    }

    public Boolean existeProduto(Long id) {

        return produtoRepository.existsByIdProduto(id);
    }

    public List<ProdutoResponse> findAll() {

        List<Produto> produtos =
                produtoRepository.findAll();

        /*
         * ANTES:
         *
         * produto 1 -> chama IXC
         * produto 2 -> chama IXC
         * produto 3 -> chama IXC
         * ...
         *
         * AGORA:
         *
         * UMA chamada ao IXC
         * ↓
         * Map<idProduto, saldo>
         */
        Map<Long, Long> estoqueMatriz =
                ixcProdutoService.buscarEstoquesMatriz();

        return produtos.stream()
                .map(produto -> {

                    Long estoque =
                            estoqueMatriz.getOrDefault(
                                    produto.getIdProduto(),
                                    0L
                            );

                    return new ProdutoResponse(
                            produto.getId(),
                            produto.getIdProduto(),
                            produto.getName(),
                            produto.getUndMedida(),
                            estoque
                    );

                })
                .toList();
    }
}