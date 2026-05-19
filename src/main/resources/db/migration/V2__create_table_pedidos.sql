CREATE TABLE tb_pedidos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    status TINYINT NULL,
    filial TINYINT NULL,
    data_criacao DATETIME(6) NULL,
    observacao VARCHAR(255) NULL,
    nome_usuario VARCHAR(255) NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;