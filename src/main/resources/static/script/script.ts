import { showPage, avisoDePermissao, requestBack, estoque, setEstoque, carrinhoDePedidos, setCarrinhoDePedidos, setConsultaGlobal, pegarNome } from './funcoes.js';
import { carregarProdutos, renderProductList, filterProducts, openModal, closeModal } from './produtos.js';
import { configurarDropdownProdutos, iniciarNovoPedido } from './novoPedido.js';
import { iniciarDashboard, produtosLista, salvarAlteracao, mostrarLista, fecharAba } from './dashboard.js';
declare const lucide: any;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") lucide.createIcons();
  
  // 1. Inicializa dependências visuais e comportamentos
  carregarProdutos();
  configurarDropdownProdutos();
  iniciarNovoPedido();
  iniciarDashboard();

  // 2. Trava campos para não-administradores na tela de dashboard
  if (sessionStorage.getItem("userAccess") === "ADM") {
    (document.getElementById("btnAddProduto") as HTMLButtonElement).disabled = false;
    (document.getElementById("nStatus") as HTMLSelectElement).disabled = false;
    (document.getElementById("tObservacoes") as HTMLTextAreaElement).disabled = false;
  } else {
    (document.getElementById("btnAddProduto") as HTMLButtonElement).disabled = true;
    (document.getElementById("nStatus") as HTMLSelectElement).disabled = true;
    (document.getElementById("tObservacoes") as HTMLTextAreaElement).disabled = true;
  }
});

// --- AMARRANDO AO WINDOW PARA O HTML ENCONTRAR OS ONCLICK ---
(window as any).showPage = showPage;
(window as any).avisoDePermissao = avisoDePermissao;
(window as any).filterProducts = filterProducts;
(window as any).openModal = openModal;
(window as any).closeModal = closeModal;
(window as any).produtosLista = produtosLista;
(window as any).salvarAlteracao = salvarAlteracao;
(window as any).pegarNome = pegarNome;
(window as any).fecharAba = fecharAba;
(window as any).apagarCarrinho = function (idParaRemover: string) {
    setCarrinhoDePedidos(carrinhoDePedidos.filter(produto => String(produto.nome) !== String(idParaRemover)));
};

(window as any).deleteProduct = async function (idDoBanco: string) {
  const querMesmoApagar = confirm("Tem certeza que deseja apagar este produto?");
  if (!querMesmoApagar) return;
  try {
    const resposta = await requestBack("produto/" + idDoBanco, "DELETE", null);
    if (resposta.ok) {
      setEstoque(estoque.filter((p) => String(p.id) !== String(idDoBanco)));
      renderProductList(estoque);
    } else { alert("Não foi possível apagar."); }
  } catch (erro) { alert("Erro de conexão."); }
};

(window as any).consultarLista = async function (id: number) {
    try {
      const resposta = await requestBack("pedido/pedidoId/" + id, "GET", null);
      if (resposta && (resposta.status === 302 || resposta.ok)) {
        const dadosPedido = await resposta.json();
        setConsultaGlobal(dadosPedido);
        mostrarLista();
      }
    } catch (error) { console.error("Erro:", error); }
};

(window as any).editarItem = function(idDoBanco: Number) {
  const modal = document.getElementById("modal-produto-edit");
  if (modal) modal.style.display = "flex";

  const btnEditProduto = document.getElementById("btn-salvar-edit") as HTMLButtonElement;
  if (btnEditProduto) {
    btnEditProduto.onclick = async function () {
      const nomeP = document.getElementById("edit-prod-name") as HTMLInputElement;
      const idP = document.getElementById("edit-prod-id") as HTMLInputElement;
      const unitP = document.getElementById("edit-prod-unit") as HTMLInputElement;

      if (nomeP && idP && nomeP.value.trim() !== "" && idP.value.trim() !== "") {
        await requestBack("produto/update", "PUT", {
          id: idDoBanco, idProduto: idP.value, name: nomeP.value, undMedida: unitP ? unitP.value : ""
        });
        closeModal();
        nomeP.value = ""; idP.value = ""; if (unitP) unitP.value = "";
        carregarProdutos(); // Atualiza a tela
      }
    };
  }
};

const nameUser = document.getElementById("user") as HTMLHeadingElement | null;
if(nameUser){
  nameUser.innerText = sessionStorage.getItem("userName") || "Usuário";
}