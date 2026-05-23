package com.ivr.pedidosfiliais.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ivr.pedidosfiliais.dto.request.ProdutoRequest;
import com.ivr.pedidosfiliais.entities.Produto;
import com.ivr.pedidosfiliais.repository.ProdutoRepository;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    // #region CRUD
    public Boolean save(ProdutoRequest produtorRequest) {
        if (produtorRequest != null) {
            Produto produto = new Produto();
            produto.setIdProduto(produtorRequest.idProduto());
            produto.setName(produtorRequest.name());
            produto.setUndMedida(produtorRequest.undMedida());
            produtoRepository.save(produto);
            return true;
        }
        return false;
    }

    public Boolean update(ProdutoRequest produtorRequest) {
        if (produtorRequest == null || produtorRequest.id() == null) {
            return false;
        }

        return produtoRepository.findById(produtorRequest.id()).map(prodAntigo ->{
            prodAntigo.setIdProduto(produtorRequest.idProduto());
            prodAntigo.setName(produtorRequest.name());
            prodAntigo.setUndMedida(produtorRequest.undMedida());

            produtoRepository.save(prodAntigo);
            return true;
        }).orElse(false);
        
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
            return produtoRepository.findById(id).orElse(null);
        }
        return null;
    }

    public List<Produto> findAll() {
        return produtoRepository.findAll();
    }

    public Boolean existeProduto(Long id){
        return produtoRepository.existsByIdProduto(id);
    }
    // #endregion
}
