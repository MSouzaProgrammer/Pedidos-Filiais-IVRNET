import { showPage, avisoDePermissao, requestBack, estoque, setEstoque, carrinhoDePedidos, setCarrinhoDePedidos, setConsultaGlobal, pegarNome } from './funcoes.js';
import { carregarProdutos, renderProductList, filterProducts, openModal, closeModal } from './produtos.js';
import { configurarDropdownProdutos, iniciarNovoPedido } from './novoPedido.js';
import { iniciarDashboard, produtosLista, salvarAlteracao, mostrarLista, fecharAba } from './dashboard.js';
document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== "undefined")
        lucide.createIcons();
    // 1. Inicializa dependências visuais e comportamentos
    carregarProdutos();
    configurarDropdownProdutos();
    iniciarNovoPedido();
    iniciarDashboard();
    // 2. Trava campos para não-administradores na tela de dashboard
    if (sessionStorage.getItem("userAccess") === "ADM") {
        document.getElementById("btnAddProduto").disabled = false;
        document.getElementById("nStatus").disabled = false;
        document.getElementById("tObservacoes").disabled = false;
    }
    else {
        document.getElementById("btnAddProduto").disabled = true;
        document.getElementById("nStatus").disabled = true;
        document.getElementById("tObservacoes").disabled = true;
    }
});
// --- AMARRANDO AO WINDOW PARA O HTML ENCONTRAR OS ONCLICK ---
window.showPage = showPage;
window.avisoDePermissao = avisoDePermissao;
window.filterProducts = filterProducts;
window.openModal = openModal;
window.closeModal = closeModal;
window.produtosLista = produtosLista;
window.salvarAlteracao = salvarAlteracao;
window.pegarNome = pegarNome;
window.fecharAba = fecharAba;
window.apagarCarrinho = function (idParaRemover) {
    setCarrinhoDePedidos(carrinhoDePedidos.filter(produto => String(produto.nome) !== String(idParaRemover)));
};
window.deleteProduct = async function (idDoBanco) {
    const querMesmoApagar = confirm("Tem certeza que deseja apagar este produto?");
    if (!querMesmoApagar)
        return;
    try {
        const resposta = await requestBack("produto/" + idDoBanco, "DELETE", null);
        if (resposta.ok) {
            setEstoque(estoque.filter((p) => String(p.id) !== String(idDoBanco)));
            renderProductList(estoque);
        }
        else {
            alert("Não foi possível apagar.");
        }
    }
    catch (erro) {
        alert("Erro de conexão.");
    }
};
window.consultarLista = async function (id) {
    try {
        const resposta = await requestBack("pedido/pedidoId/" + id, "GET", null);
        if (resposta && (resposta.status === 302 || resposta.ok)) {
            const dadosPedido = await resposta.json();
            setConsultaGlobal(dadosPedido);
            mostrarLista();
        }
    }
    catch (error) {
        console.error("Erro:", error);
    }
};
window.editarItem = function (idDoBanco) {
    const modal = document.getElementById("modal-produto-edit");
    if (modal)
        modal.style.display = "flex";
    const btnEditProduto = document.getElementById("btn-salvar-edit");
    if (btnEditProduto) {
        btnEditProduto.onclick = async function () {
            const nomeP = document.getElementById("edit-prod-name");
            const idP = document.getElementById("edit-prod-id");
            const unitP = document.getElementById("edit-prod-unit");
            if (nomeP && idP && nomeP.value.trim() !== "" && idP.value.trim() !== "") {
                await requestBack("produto/update", "PUT", {
                    id: idDoBanco, idProduto: idP.value, name: nomeP.value, undMedida: unitP ? unitP.value : ""
                });
                closeModal();
                nomeP.value = "";
                idP.value = "";
                if (unitP)
                    unitP.value = "";
                carregarProdutos(); // Atualiza a tela
            }
        };
    }
};
const nameUser = document.getElementById("user");
if (nameUser) {
    nameUser.innerText = sessionStorage.getItem("userName") || "Usuário";
}
