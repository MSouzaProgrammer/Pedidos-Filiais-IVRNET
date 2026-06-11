"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderProductList = renderProductList;
exports.carregarProdutos = carregarProdutos;
exports.filterProducts = filterProducts;
exports.openModal = openModal;
exports.closeModal = closeModal;
const funcoes_js_1 = require("./funcoes.js");
function renderProductList(itens) {
    const container = document.getElementById("global-product-list");
    if (!container)
        return;
    container.innerHTML = "";
    itens.forEach((item) => {
        const div = document.createElement("div");
        div.className = "product-list-item";
        const isAdmin = sessionStorage.getItem("userAccess") === 'ADM';
        div.innerHTML = `
        <span style="font-weight:700; color:var(--text-muted)">${item.idProduto}</span>
        <span style="font-weight:600">${item.nome}</span>
        <span style="color:var(--text-muted)">${item.unidade}</span>
        <div style="text-align:right">
            <button style="border:none; background:none; cursor:pointer; color:var(--text-muted); margin-right:8px" onclick="${isAdmin ? `editarItem('${item.id}')` : 'avisoDePermissao()'}"><i data-lucide="edit" style="width:16px"></i></button>
            <button style="border:none; background:none; cursor:pointer; color:#ef4444" onclick="${isAdmin ? `deleteProduct('${item.id}')` : 'avisoDePermissao()'}"><i data-lucide="trash-2" style="width:16px"></i></button>
        </div>
    `;
        container.appendChild(div);
    });
    if (typeof lucide !== "undefined")
        lucide.createIcons();
}
async function carregarProdutos() {
    try {
        const resposta = await (0, funcoes_js_1.requestBack)("produto", "GET", null);
        if (resposta.status === 302 || resposta.ok) {
            const dadosBack = await resposta.json();
            (0, funcoes_js_1.setEstoque)(dadosBack.map((itemDoJava) => ({
                id: String(itemDoJava.id),
                idProduto: String(itemDoJava.idProduto),
                nome: String(itemDoJava.name),
                unidade: String(itemDoJava.undMedida),
                quantidade: 0
            })));
            renderProductList(funcoes_js_1.estoque);
        }
    }
    catch (err) {
        console.error("Erro ao buscar produtos:", err);
    }
}
function filterProducts() {
    const searchEl = document.getElementById("search-product");
    if (!searchEl)
        return;
    const term = searchEl.value.toLowerCase();
    const filtered = funcoes_js_1.estoque.filter(p => p.nome.toLowerCase().includes(term) || String(p.id).toLowerCase().includes(term));
    renderProductList(filtered);
}
function openModal() {
    const modal = document.getElementById("modal-produto");
    if (modal)
        modal.style.display = "flex";
}
function closeModal() {
    const modal = document.getElementById("modal-produto");
    const modalEdit = document.getElementById("modal-produto-edit");
    if (modal)
        modal.style.display = "none";
    if (modalEdit)
        modalEdit.style.display = "none";
}
// Lógica dos botões da tela
const bAtualizar = document.getElementById("atualizar");
if (bAtualizar) {
    bAtualizar.addEventListener("click", carregarProdutos);
}
const btnNovoProduto = document.getElementById("btn-salvar");
if (btnNovoProduto) {
    btnNovoProduto.addEventListener("click", async function () {
        const nomeP = document.getElementById("new-prod-name");
        const idP = document.getElementById("new-prod-id");
        const unitP = document.getElementById("new-prod-unit");
        if (nomeP && idP && nomeP.value.trim() !== "" && idP.value.trim() !== "") {
            const produto = {
                id: idP.value, idProduto: idP.value, nome: nomeP.value, unidade: unitP ? unitP.value : "", quantidade: 0
            };
            try {
                const resposta = await (0, funcoes_js_1.requestBack)("produto/idP/" + idP.value, "GET", null);
                if (resposta.status !== 409) {
                    await (0, funcoes_js_1.requestBack)("produto", "POST", { idProduto: produto.idProduto, name: produto.nome, undMedida: produto.unidade });
                    funcoes_js_1.estoque.push(produto);
                    renderProductList(funcoes_js_1.estoque);
                    closeModal();
                    nomeP.value = "";
                    idP.value = "";
                    if (unitP)
                        unitP.value = "";
                }
                else {
                    alert("Atenção, produto com o ID [" + idP.value + "] Ja está registrado");
                }
            }
            catch (err) {
                console.error("Erro ao salvar:", err);
            }
        }
        else {
            alert("Preencha Nome e ID.");
        }
    });
}
//# sourceMappingURL=produtos.js.map