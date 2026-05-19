CREATE TABLE tb_produto (
    id BIGINT NOT NULL AUTO_INCREMENT,
    id_produto BIGINT NULL,
    name VARCHAR(255) NULL,
    und_medida VARCHAR(255) NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;