package com.ivr.pedidosfiliais.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ivr.pedidosfiliais.entities.Produto;
import com.ivr.pedidosfiliais.repository.ProdutoRepository;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    //#region CRUD
    public Boolean save(Produto produto){
        if(produto != null){
            produtoRepository.save(produto);
            return true;
        }
        return false;
    }

    public Boolean delete(long id){
        if(produtoRepository.existsById(id)){
            produtoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Produto findById(Long id){
        if(produtoRepository.existsById(id)){
            return produtoRepository.findById(id).orElse(null);
        }
        return null;
    }

    public List<Produto> findAll(){
        return produtoRepository.findAll();
    }
    //#endregion
}
