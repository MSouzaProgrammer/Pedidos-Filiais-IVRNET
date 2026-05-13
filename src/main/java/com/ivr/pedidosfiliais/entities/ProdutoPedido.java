package com.ivr.pedidosfiliais.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
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
    @JsonBackReference
    private Pedido pedido;
    
    private String name;
    private String undMedida;
    private Long quant;
    private Long quantEnviada;
}
