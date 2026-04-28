package com.ivr.pedidosfiliais.entities;

import java.util.List;

import com.ivr.pedidosfiliais.enums.Filiais;
import com.ivr.pedidosfiliais.enums.Status;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tb_pedidos")
public class Pedido {
    @Id
    private Long id;

    private Status Status;
    private Filiais filial;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProdutoPedido> lProdutos;

    public void setUser(User user){
        this.user = user;
    }

    public void addProduto(ProdutoPedido produto){
        lProdutos.add(produto);
    }
}
