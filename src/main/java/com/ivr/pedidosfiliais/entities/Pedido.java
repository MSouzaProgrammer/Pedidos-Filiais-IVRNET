package com.ivr.pedidosfiliais.entities;

import java.util.List;

import com.ivr.pedidosfiliais.enums.Filiais;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "tb_pedidos")
public class Pedido {
    @Id
    private Long id;

    private Filiais filial;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Produto> lProdutos;

    public void setUser(User user){
        this.user = user;
    }

    public void addProduto(Produto produto){
        lProdutos.add(produto);
    }
}
