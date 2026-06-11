"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultaGlobal = exports.filialNome = exports.carrinhoDePedidos = exports.produtoEmEspera = exports.estoque = void 0;
exports.setEstoque = setEstoque;
exports.setProdutoEmEspera = setProdutoEmEspera;
exports.setCarrinhoDePedidos = setCarrinhoDePedidos;
exports.setFilialNome = setFilialNome;
exports.setConsultaGlobal = setConsultaGlobal;
exports.requestBack = requestBack;
exports.ligarLoading = ligarLoading;
exports.desligarLoading = desligarLoading;
exports.showPage = showPage;
exports.avisoDePermissao = avisoDePermissao;
exports.pegarNome = pegarNome;
// --- VARIÁVEIS GLOBAIS (ESTADO) ---
exports.estoque = [];
function setEstoque(novoEstoque) { exports.estoque = novoEstoque; }
exports.produtoEmEspera = null;
function setProdutoEmEspera(prod) { exports.produtoEmEspera = prod; }
exports.carrinhoDePedidos = [];
function setCarrinhoDePedidos(novoCarrinho) { exports.carrinhoDePedidos = novoCarrinho; }
exports.filialNome = "";
function setFilialNome(nome) { exports.filialNome = nome; }
exports.consultaGlobal = null;
function setConsultaGlobal(consulta) { exports.consultaGlobal = consulta; }
// --- FUNÇÕES UTILITÁRIAS ---
async function requestBack(caminho, metodo, dados) {
    ligarLoading();
    const opcoes = {
        method: metodo,
        headers: { "Content-Type": "application/json" }
    };
    const token = sessionStorage.getItem("token");
    if (token) {
        opcoes.headers = { ...opcoes.headers, "Authorization": `Bearer ${token}` };
    }
    if (dados && metodo.toUpperCase() !== "GET") {
        opcoes.body = JSON.stringify(dados);
    }
    // Descobre onde o front-end está rodando
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    // Define a URL do Back-end baseado nisso
    const API_BASE_URL = isLocalhost
        ? "http://localhost:8080/" // Sem a barra no final para não duplicar
        : "https://pedidos-filiais-ivrnet.onrender.com/"; // Seu link do Render
    // CORRIGIDO AQUI EMBAIXO:
    const resposta = await fetch(API_BASE_URL + caminho, opcoes);
    desligarLoading();
    return resposta;
}
function ligarLoading(mensagem = "Carregando dados...") {
    const overlay = document.getElementById("loading-global");
    if (overlay) {
        const texto = overlay.querySelector("span");
        if (texto)
            texto.textContent = mensagem;
        overlay.classList.add("ativo");
    }
}
function desligarLoading() {
    const overlay = document.getElementById("loading-global");
    if (overlay)
        overlay.classList.remove("ativo");
}
function showPage(pageId) {
    document.querySelectorAll(".page-content").forEach((p) => p.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    const pageTarget = document.getElementById(pageId + "-page");
    const navTarget = document.getElementById("nav-" + pageId);
    if (pageTarget)
        pageTarget.classList.add("active");
    if (navTarget)
        navTarget.classList.add("active");
    const titles = { dash: "Dashboard", "novo-pedido": "Novo Pedido", produtos: "Produtos" };
    const titleEl = document.getElementById("page-title");
    if (titleEl)
        titleEl.innerText = titles[pageId] || "Página";
}
function avisoDePermissao() {
    alert("Você não tem permissão de administrador");
}
function pegarNome(elemento) {
    const iElement = elemento.querySelector('i');
    if (iElement) {
        setFilialNome(iElement.innerText);
    }
    return exports.filialNome;
}
//# sourceMappingURL=funcoes.js.map