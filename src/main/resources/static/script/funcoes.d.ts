export interface Produto {
    id: string | number;
    idProduto: string | number;
    nome: string;
    unidade: string;
    quantidade: number;
}
export interface LoginData {
    email: string;
    password: string;
}
export interface ProdutosRegistrados {
    id: string | number;
    idProduto: string | number;
    name: string;
    undMedida: string;
}
export declare let estoque: Produto[];
export declare function setEstoque(novoEstoque: Produto[]): void;
export declare let produtoEmEspera: Produto | null;
export declare function setProdutoEmEspera(prod: Produto | null): void;
export declare let carrinhoDePedidos: Produto[];
export declare function setCarrinhoDePedidos(novoCarrinho: Produto[]): void;
export declare let filialNome: string;
export declare function setFilialNome(nome: string): void;
export declare let consultaGlobal: any;
export declare function setConsultaGlobal(consulta: any): void;
export declare function requestBack(caminho: string, metodo: string, dados: unknown): Promise<Response>;
export declare function ligarLoading(mensagem?: string): void;
export declare function desligarLoading(): void;
export declare function showPage(pageId: string): void;
export declare function avisoDePermissao(): void;
export declare function pegarNome(elemento: HTMLElement): string;
//# sourceMappingURL=funcoes.d.ts.map