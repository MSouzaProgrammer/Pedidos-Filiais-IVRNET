CREATE TABLE produto_pedido (
    id BIGINT NOT NULL AUTO_INCREMENT,
    id_produto BIGINT NULL,
    pedido_id BIGINT NULL,
    name VARCHAR(255) NULL,
    und_medida VARCHAR(255) NULL,
    quant BIGINT NULL,
    quant_enviada BIGINT NULL,
    PRIMARY KEY (id),
    CONSTRAINT FK_produto_pedido_pedido FOREIGN KEY (pedido_id) REFERENCES tb_pedidos (id) ON DELETE CASCADE
) ENGINE=InnoDB;