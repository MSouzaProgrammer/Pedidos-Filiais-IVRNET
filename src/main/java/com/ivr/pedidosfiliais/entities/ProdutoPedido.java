package com.ivr.pedidosfiliais.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
//@Embeddable
public class ProdutoPedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long idProduto;

    @ManyToOne
    private Pedido pedido;
    
    @OneToOne
    private Produto produto;
    private String name;
    private String undMedida;

    public ProdutoPedido(Long id, Pedido pedido, Produto produto) {
        this.id = id;
        this.idProduto = produto.getIdProduto();
        this.pedido = pedido;
        this.name =produto.getName();
        this.undMedida = produto.getUndMedida();
    }
}
