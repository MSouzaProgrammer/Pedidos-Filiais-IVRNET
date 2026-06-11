"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurarDropdownProdutos = configurarDropdownProdutos;
exports.iniciarNovoPedido = iniciarNovoPedido;
const funcoes_js_1 = require("./funcoes.js");
const btAdd = document.getElementById("btn-add-order");
const inputProduto = document.getElementById("prod-nome");
const listaSugestoes = document.getElementById("sugestoes-produtos");
const quantValor = document.getElementById("prod-qty");
function configurarDropdownProdutos() {
    if (!inputProduto || !listaSugestoes || !quantValor)
        return;
    inputProduto.addEventListener("input", function () {
        const valorDigitado = this.value.toLowerCase();
        listaSugestoes.innerHTML = "";
        if (!valorDigitado) {
            listaSugestoes.style.display = "none";
            return;
        }
        const produtosFiltrados = funcoes_js_1.estoque.filter((p) => p.nome.toLowerCase().includes(valorDigitado));
        if (produtosFiltrados.length > 0) {
            produtosFiltrados.forEach((produto) => {
                const li = document.createElement("li");
                li.textContent = produto.nome;
                li.addEventListener("click", function () {
                    inputProduto.value = produto.nome;
                    (0, funcoes_js_1.setProdutoEmEspera)(produto);
                    listaSugestoes.style.display = "none";
                    quantValor.disabled = false;
                    btAdd.style.backgroundColor = '#041033';
                    btAdd.disabled = false;
                    inputProduto.disabled = true;
                });
                listaSugestoes.appendChild(li);
            });
            listaSugestoes.style.display = "block";
        }
        else {
            listaSugestoes.style.display = "none";
        }
    });
    document.addEventListener("click", function (evento) {
        if (evento.target !== inputProduto && evento.target !== listaSugestoes) {
            listaSugestoes.style.display = "none";
        }
    });
}
// Configuração inicial dos botões do carrinho
function iniciarNovoPedido() {
    if (quantValor && quantValor.value === "") {
        btAdd.disabled = true;
        btAdd.style.backgroundColor = 'red';
        quantValor.disabled = true;
    }
    const list = document.getElementById("order-items-list");
    if (btAdd && list) {
        btAdd.addEventListener("click", () => {
            if (!inputProduto || !quantValor || !inputProduto.value)
                return;
            const nome = inputProduto.value;
            const qty = quantValor.value;
            if (!funcoes_js_1.produtoEmEspera) {
                alert("Selecione um produto da lista!");
                return;
            }
            const li = document.createElement("li");
            li.style.cssText = "display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f1f5f9; align-items:center";
            li.innerHTML = `
          <div><span style="font-size:14px; font-weight:600">${nome}</span></div>
          <div style="display:flex; align-items:center; gap:12px">
              <span style="background:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:700">${qty} un</span>
              <button style="border:none; background:none; color:#ef4444; cursor:pointer" onclick="this.parentElement?.parentElement?.remove(); apagarCarrinho('${nome}')"><i data-lucide="trash-2" style="width:16px"></i></button>
          </div>
      `;
            list.appendChild(li);
            if (typeof lucide !== "undefined")
                lucide.createIcons();
            const itemFinalCarrinho = {
                id: funcoes_js_1.produtoEmEspera.id,
                idProduto: funcoes_js_1.produtoEmEspera.idProduto,
                nome: funcoes_js_1.produtoEmEspera.nome,
                unidade: funcoes_js_1.produtoEmEspera.unidade,
                quantidade: quantValor.valueAsNumber
            };
            funcoes_js_1.carrinhoDePedidos.push(itemFinalCarrinho);
            inputProduto.value = "";
            quantValor.value = "1";
            btAdd.disabled = true;
            btAdd.style.backgroundColor = 'red';
            quantValor.disabled = true;
            inputProduto.disabled = false;
        });
    }
    const btnFinalizar = document.getElementById("btn-finalizar");
    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", async () => {
            if (funcoes_js_1.carrinhoDePedidos.length !== 0) {
                const filialSelecionada = document.getElementById("select-filial");
                const nomeUsuario = sessionStorage.getItem("userName") || "Name";
                const listaProdutos = funcoes_js_1.carrinhoDePedidos.map(item => ({
                    idProduto: item.idProduto, name: item.nome, undMedida: item.unidade, quant: item.quantidade
                }));
                const dadosPedido = {
                    filial: filialSelecionada.value.toUpperCase().replace("FILIAL ", "").trim(),
                    lProdutos: listaProdutos,
                    usuario: nomeUsuario
                };
                await (0, funcoes_js_1.requestBack)("pedido", "POST", dadosPedido);
                location.reload();
            }
        });
    }
}
//# sourceMappingURL=novoPedido.js.map