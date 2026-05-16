package com.ivr.pedidosfiliais.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ivr.pedidosfiliais.entities.Produto;
import com.ivr.pedidosfiliais.repository.ProdutoRepository;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    // #region CRUD
    public Boolean save(Produto produto) {
        if (produto != null) {
            produtoRepository.save(produto);
            return true;
        }
        return false;
    }

    public Boolean update(Produto produto) {
        if (produto == null || produto.getId() == null) {
            return false;
        }
        Optional<Produto> prodOptional = produtoRepository.findById(produto.getId());
        if (prodOptional.isPresent()) {
            Produto produtoE = prodOptional.get();
            produtoE.setIdProduto(produto.getIdProduto());
            produtoE.setName(produto.getName());
            produtoE.setUndMedida(produto.getUndMedida());

            produtoRepository.save(produtoE);
            return true;
        }
        return false;
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
    // #endregion
}
