import { requestBack, estoque, carrinhoDePedidos, setCarrinhoDePedidos, produtoEmEspera, setProdutoEmEspera } from './funcoes.js';
declare const lucide: any;

const btAdd = document.getElementById("btn-add-order") as HTMLButtonElement;
const inputProduto = document.getElementById("prod-nome") as HTMLInputElement | null;
const listaSugestoes = document.getElementById("sugestoes-produtos") as HTMLUListElement | null;
const quantValor = document.getElementById("prod-qty") as HTMLInputElement | null;
const unidProdutoMolde = document.getElementById("prod-med") as HTMLInputElement | null;

export function configurarDropdownProdutos(): void {
  if (!inputProduto || !listaSugestoes || !quantValor || !unidProdutoMolde) return;

  inputProduto.addEventListener("input", function () {
    const valorDigitado = this.value.toLowerCase();
    listaSugestoes.innerHTML = "";
    if (!valorDigitado) { listaSugestoes.style.display = "none"; return; }

    const produtosFiltrados = estoque.filter((p) => p.nome.toLowerCase().includes(valorDigitado));
    if (produtosFiltrados.length > 0) {
      produtosFiltrados.forEach((produto) => {
        const li = document.createElement("li");
        console.log(produto);
        li.textContent = produto.nome;
        li.addEventListener("click", function () {
          
          unidProdutoMolde.value = produto.unidade;
          inputProduto.value = produto.nome;
          setProdutoEmEspera(produto);
          listaSugestoes.style.display = "none";
          quantValor.disabled = false;
          btAdd.style.backgroundColor = '#041033';
          btAdd.disabled = false;
          inputProduto.disabled = true;
        });
        listaSugestoes.appendChild(li);
      });
      listaSugestoes.style.display = "block";
    } else {
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
export function iniciarNovoPedido() {
  if (quantValor && quantValor.value === "") {
    btAdd.disabled = true;
    btAdd.style.backgroundColor = 'red';
    quantValor.disabled = true;
  }

  const list = document.getElementById("order-items-list");
  if (btAdd && list) {
    btAdd.addEventListener("click", () => {
      if (!inputProduto || !quantValor || !inputProduto.value || !unidProdutoMolde) return;
      const nome = inputProduto.value;
      const qty = quantValor.value;
      unidProdutoMolde.value = "";
      if (!produtoEmEspera) {
        alert("Selecione um produto da lista!");
        return;
      }

      const li = document.createElement("li");
      li.style.cssText = "display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f1f5f9; align-items:center";
      li.innerHTML = `
          <div><span style="font-size:14px; font-weight:600">${nome}</span></div>
          <div style="display:flex; align-items:center; gap:12px">
              <span style="background:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:700">${qty} un</span>
              <button style="border:none; background:none; color:#ef4444; cursor:pointer" onclick="this.parentElement?.parentElement?.remove(); apagarCarrinho('${nome.trim().replace(/'/g, "\\'").replace(/"/g, '&quot;')}')"><i data-lucide="trash-2" style="width:16px"></i></button>
          </div>
      `;
      list.appendChild(li);
      if (typeof lucide !== "undefined") lucide.createIcons();

      const itemFinalCarrinho = {
        id: produtoEmEspera.id,
        idProduto: produtoEmEspera.idProduto,
        nome: produtoEmEspera.nome,
        unidade: produtoEmEspera.unidade,
        quantidade: quantValor.valueAsNumber

      };
      carrinhoDePedidos.push(itemFinalCarrinho);

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
      if (carrinhoDePedidos.length !== 0) {
        const filialSelecionada = document.getElementById("select-filial") as HTMLSelectElement;
        const nomeUsuario = sessionStorage.getItem("userName") || "Name";
        const listaProdutos = carrinhoDePedidos.map(item => ({
          idProduto: item.idProduto, name: item.nome, undMedida: item.unidade, quant: item.quantidade
        }));

        const dadosPedido = {
          filial: filialSelecionada.value.toUpperCase().replace("FILIAL ", "").trim(),
          lProdutos: listaProdutos,
          usuario: nomeUsuario
        };
        await requestBack("pedido", "POST", dadosPedido);
        location.reload();
      }
    });
  }
}