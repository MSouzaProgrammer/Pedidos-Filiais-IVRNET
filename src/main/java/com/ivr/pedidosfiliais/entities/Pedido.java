package com.ivr.pedidosfiliais.entities;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import org.h2.store.Data;

import com.ivr.pedidosfiliais.enums.Filiais;
import com.ivr.pedidosfiliais.enums.Status;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Status status;
    private Filiais filial;

    @Column(updatable = false)
    private LocalDateTime dataCriacao;

    @PrePersist
    protected void onCreate(){
        this.dataCriacao = LocalDateTime.now();
    }

    @JoinColumn(name = "nome_usuario")
    private String usuario;


    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProdutoPedido> lProdutos;

    public void addProduto(ProdutoPedido produto){
        lProdutos.add(produto);
    }
}
