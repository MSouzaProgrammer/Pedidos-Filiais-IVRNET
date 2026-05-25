import { showPage, avisoDePermissao, requestBack, estoque, setEstoque, carrinhoDePedidos, setCarrinhoDePedidos, setConsultaGlobal, pegarNome, consultaGlobal } from './funcoes.js'; // Adicionado 'consultaGlobal' no import
import { carregarProdutos, renderProductList, filterProducts, openModal, closeModal } from './produtos.js';
import { configurarDropdownProdutos, iniciarNovoPedido } from './novoPedido.js';
import { iniciarDashboard, produtosLista, salvarAlteracao, mostrarLista, fecharAba } from './dashboard.js';
declare const lucide: any;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") lucide.createIcons();

  // CORRIGIDO: Ativa o botão usando a variável de estado correta (consultaGlobal)
  document.getElementById("btnImprimirPedido")?.addEventListener("click", () => {
    if (consultaGlobal) {
      (window as any).gerarImpressaoPicking(consultaGlobal);
    } else {
      alert("Nenhum pedido selecionado para impressão.");
    }
  });

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

function mostrarConfirmCustomizado(titulo: string, mensagem: string): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.getElementById("custom-confirm");
    const txtTitulo = document.getElementById("confirm-title");
    const txtMensagem = document.getElementById("confirm-message");
    const btnCancelar = document.getElementById("confirm-btn-cancel");
    const btnSucesso = document.getElementById("confirm-btn-success");

    if (!overlay || !txtTitulo || !txtMensagem || !btnCancelar || !btnSucesso) {
      resolve(false);
      return;
    }

    // Injeta os textos customizados dinamicamente
    txtTitulo.textContent = titulo;
    txtMensagem.textContent = mensagem;

    // Exibe o modal na tela
    overlay.classList.add("ativo");
    if (typeof lucide !== "undefined") lucide.createIcons();

    // Função interna para fechar a tela e devolver a resposta
    const fecharEEnviarResposta = (resposta: boolean) => {
      overlay.classList.remove("ativo");
      // Remove os cliques antigos para não acumular em cliques futuros
      btnCancelar.onclick = null;
      btnSucesso.onclick = null;
      resolve(resposta);
    };

    // Atribui os eventos de clique temporários nos botões do Modal
    btnCancelar.onclick = () => fecharEEnviarResposta(false);
    btnSucesso.onclick = () => fecharEEnviarResposta(true);
  });
}

(window as any).deleteProduct = async function (idDoBanco: string) {
  // Troca do confirm nativo antigo para o seu novo Modal Customizado e Moderno
  const querMesmoApagar = await mostrarConfirmCustomizado(
    "Excluir Produto?",
    "Esta ação não poderá ser desfeita. Tem certeza que deseja apagar este produto?",
  );

  if (!querMesmoApagar) return; // Se o usuário clicar em Cancelar, para a execução aqui

  try {
    const resposta = await requestBack("produto/" + idDoBanco, "DELETE", null);
    if (resposta.ok) {
      setEstoque(estoque.filter((p) => String(p.id) !== String(idDoBanco)));
      renderProductList(estoque);
    } else {
      alert("Não foi possível apagar.");
    }
  } catch (erro) {
    alert("Erro de conexão.");
  }
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

(window as any).editarItem = function (idDoBanco: Number) {
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
if (nameUser) {
  nameUser.innerText = sessionStorage.getItem("userName") || "Usuário";
}

function pegarIniciais(nomeCompleto: string): string {
  const conectivos = ["de", "da", "do", "dos", "das", "e"];
  return nomeCompleto.trim().split(/\s+/).filter(p => !conectivos.includes(p.toLowerCase())).map(p => p.charAt(0).toUpperCase()).join('');
}

const avatarLogo = document.getElementById("avatarLogo") as HTMLDivElement;
if (avatarLogo) {
  const nomeUsuario = sessionStorage.getItem("userName") || 'Usuário';
  console.log(pegarIniciais(nomeUsuario));
  console.log(nomeUsuario);
  avatarLogo.textContent = pegarIniciais(nomeUsuario);
  if (!sessionStorage.getItem("userAccess")) window.location.href = "login.html";
}

(window as any).gerarImpressaoPicking = function (consulta: any) {
  const iframe = document.getElementById('iframeImpressao') as HTMLIFrameElement;
  if (!iframe) return;

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // Mapeia as linhas dos produtos exatamente como estava no seu código original
  const linhasProdutos = consulta.lProdutos.map((p: any) => `
        <tr>
            <td>${p.idProduto}</td>
            <td style="text-align: left;">${p.name}</td>
            <td>${p.undMedida || 'UN'}</td>
            <td><strong>${p.quant}</strong></td>
            <td class="col-manual"></td>
            <td>${consulta.filial || '-'}</td>
        </tr>`).join('');

  // O seu HTML de impressão original, agora com a marca nova do seu portfólio
  const htmlFinal = `
        <html>
        <head>
            <style>
              body {padding: 10; border: 1px solid #000; border-radius: 5px; font-family: Arial, sans-serif; color: #000; background-color: #fff; margin: 0;}
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px; }
              .logo { height: 50px; }
              .header-text { text-align: right; }
              .header-text h1 { margin: 0; font-size: 16px; }
              .header-text p { margin: 0; font-size: 11px; font-weight: bold; }
              .info-table, .products-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 10px; border: 1.5px solid #000; border-radius: 8px; overflow: hidden; }
              .info-table td { border: 0.5px solid #000; padding: 6px 10px; font-size: 12px; }
              .label { font-weight: bold; background-color: #eee; width: 15%; }
              .obs-box { border: 1.5px solid #000; border-radius: 8px; padding: 8px 12px; margin-bottom: 15px; font-size: 12px; min-height: 30px; }
              .obs-box strong { font-size: 10px; text-transform: uppercase; display: block; }
              .products-table th { background-color: #414141; color: #fff; padding: 2px; font-size: 10px; text-transform: uppercase; }
              .products-table td { border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 6px; text-align: center; font-size: 12px; }
              .products-table tr:last-child td { border-bottom: none; }
              .products-table td:last-child { border-right: none; }
              .col-manual { width: 70px; border: 1px solid #000 !important; background-color: #fff; }
              .footer { display: flex; gap: 10px; width: 100%; margin-top: 20px; }
              .footer-box { flex: 1; border: 1.5px solid #000; border-radius: 8px; padding: 10px; height: 60px; font-size: 10px; }
              @media print {
                  @page { size: portrait; margin: 0.8cm; }
                  body { -webkit-print-color-adjust: exact; }
              }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="img/logo.png" class="logo"> 
                <div class="header-text">
                    <h1>IVRNET Pedidos</h1>
                    <p style="margin:0; font-weight:bold;">Lista de Separação de Pedido</p>
                </div>
            </div>
            <table class="info-table">
                <tr>
                    <td class="label">PEDIDO ID:</td><td>#${consulta.id}</td>
                    <td class="label">DATA:</td><td>${new Date(consulta.data).toLocaleDateString()}</td>
                </tr>
                <tr>
                    <td class="label">FILIAL:</td><td>Filial ${consulta.filial}</td>
                    <td class="label">SOLICITANTE:</td><td>${consulta.usuario || '________________'}</td>
                </tr>
            </table>
            <div class="obs-box"><strong>OBSERVAÇÕES:</strong><br>${consulta.observacao || 'Nenhuma observação informada.'}</div>
            <table class="products-table">
                <thead>
                    <tr>
                        <th>ID PRODUTO</th><th style="text-align: left;">NOME DO PRODUTO</th><th>UNID.</th><th>QTD. SOLIC.</th><th>QTD. ENV. (Manual)</th><th>FILIAL</th>
                    </tr>
                </thead>
                <tbody>${linhasProdutos}</tbody>
            </table>
            <div class="footer">
                <div class="footer-box">SEPARADO POR:<br><br>_________________________________</div>
                <div class="footer-box">CONFERIDO POR:<br><br>_________________________________</div>
            </div>
        </body>
        </html>`;

  doc.open();
  doc.write(htmlFinal);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }, 300);
};