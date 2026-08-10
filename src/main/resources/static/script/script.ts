import { showPage, avisoDePermissao, requestBack, estoque, setEstoque, carrinhoDePedidos, setCarrinhoDePedidos, setConsultaGlobal, pegarNome, consultaGlobal } from './funcoes.js'; // Adicionado 'consultaGlobal' no import
import { carregarProdutos, renderProductList, filterProducts, openModal, closeModal } from './produtos.js';
import { configurarDropdownProdutos, iniciarNovoPedido } from './novoPedido.js';
import { iniciarDashboard, produtosLista, salvarAlteracao, mostrarLista, fecharAba } from './dashboard.js';
import { exibirRelatorio, excel} from './relatorio.js';
declare const lucide: any;
declare const XLSX: any;


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
  exibirRelatorio();
  excel();
  // 2. Trava campos para não-administradores na tela de dashboard
  // 2. Trava campos para não-administradores na tela de dashboard
  if (sessionStorage.getItem("userAccess") === "ADM") {
    (document.getElementById("btnAddProduto") as HTMLButtonElement).disabled = false;
    (document.getElementById("nStatus") as HTMLSelectElement).disabled = false;
    (document.getElementById("tObservacoes") as HTMLTextAreaElement).disabled = false;
    (document.getElementById("edit-prod-nome") as HTMLInputElement).disabled = false; // ✨ LIBERADO PARA ADM
  } else {
    (document.getElementById("btnAddProduto") as HTMLButtonElement).disabled = true;
    (document.getElementById("nStatus") as HTMLSelectElement).disabled = true;
    (document.getElementById("tObservacoes") as HTMLTextAreaElement).disabled = true;
    
    // ✨ NOVO: Bloqueia a barra de pesquisa para usuários comuns
    const barraAdd = document.getElementById("edit-prod-nome") as HTMLInputElement;
    if (barraAdd) {
        barraAdd.disabled = true;
        barraAdd.placeholder = "🔒 Bloqueado (Apenas ADM)";
        barraAdd.style.cursor = "not-allowed";
        barraAdd.style.opacity = "0.6"; // Dá uma apagadinha para mostrar que está inativo
    }
  }
});

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

(window as any).consultarLista = async function (id: number, status: String) {
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
  avatarLogo.textContent = pegarIniciais(nomeUsuario);
  if (!sessionStorage.getItem("userAccess")) window.location.href = "login.html";
}

(window as any).gerarImpressaoPicking = function (consulta: any) {
  const iframe = document.getElementById('iframeImpressao') as HTMLIFrameElement;
  if (!iframe) return;

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // Mapeia as linhas dos produtos exatamente como estava no seu código original
// Mapeia as linhas dos produtos com zebramento e alinhamento correto
// Mapeia as linhas dos produtos com visual moderno e zebra
// Mapeia as linhas dos produtos com visual moderno e zebra perfeito
  // Mapeia as linhas dos produtos limpas
  const linhasProdutos = consulta.lProdutos.map((p: any, index: number) => `
        <tr class="${index % 2 === 0 ? 'linha-par' : 'linha-impar'}">
            <td class="col-id">#${p.idProduto}</td>
            <td class="col-nome"><strong>${p.name}</strong></td>
            <td class="col-unid"><span class="badge-unid">${p.undMedida || 'UN'}</span></td>
            <td class="col-qtd"><strong>${p.quant}</strong></td>
            <td class="col-manual"></td>
            <td class="col-filial">${consulta.filial || '-'}</td>
        </tr>`).join('');

  // HTML e CSS de impressão A4 com todas as colunas padronizadas
  const htmlFinal = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
              @page { size: A4 portrait; margin: 8mm 10mm; }
              
              * { box-sizing: border-box; }
              
              body { 
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; 
                  color: #0f172a; 
                  background-color: #fff; 
                  margin: 0; 
                  padding: 10px;
                  font-size: 11px;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
              }

              /* TOPO DA FOLHA */
              .header { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center; 
                  border-bottom: 2px solid #2563eb; 
                  padding-bottom: 12px; 
                  margin-bottom: 14px; 
              }
              .brand-container {
                  display: flex;
                  align-items: center;
                  gap: 12px;
              }
              .logo { height: 42px; object-fit: contain; }
              
              .header-title h1 { 
                  margin: 0; 
                  font-size: 16px; 
                  color: #0f172a; 
                  font-weight: 800; 
                  letter-spacing: -0.3px;
              }
              .header-title p { 
                  margin: 2px 0 0 0; 
                  font-size: 10px; 
                  font-weight: 700; 
                  color: #2563eb; 
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
              }

              .doc-badge {
                  background-color: #eff6ff;
                  border: 1px solid #bfdbfe;
                  color: #1e40af;
                  padding: 6px 12px;
                  border-radius: 6px;
                  text-align: right;
              }
              .doc-badge .id-num {
                  font-size: 14px;
                  font-weight: 800;
                  display: block;
              }
              .doc-badge .date-num {
                  font-size: 9px;
                  color: #3b82f6;
                  font-weight: 600;
              }

              /* PAINEL DE DADOS DO PEDIDO */
              .info-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 10px;
                  margin-bottom: 12px;
              }
              .info-card {
                  border: 1px solid #e2e8f0;
                  border-radius: 6px;
                  padding: 8px 12px;
                  background-color: #f8fafc;
                  display: flex;
                  justify-content: space-between;
              }
              .info-card span.title {
                  font-size: 9px;
                  font-weight: 700;
                  color: #64748b;
                  text-transform: uppercase;
              }
              .info-card span.val {
                  font-size: 11px;
                  font-weight: 700;
                  color: #0f172a;
              }

              /* OBSERVAÇÃO */
              .obs-box { 
                  border: 1px dashed #cbd5e1; 
                  border-radius: 6px; 
                  padding: 8px 12px; 
                  margin-bottom: 14px; 
                  font-size: 11px; 
                  background-color: #fff;
              }
              .obs-box strong { 
                  font-size: 9px; 
                  color: #475569;
                  text-transform: uppercase; 
                  display: block; 
                  margin-bottom: 3px;
              }

              /* TABELA COM COLUNAS PADRONIZADAS E IGUAIS */
              .products-table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-bottom: 12px; 
                  border: 1px solid #cbd5e1;
              }
              .products-table th { 
                  background-color: #0f172a; 
                  color: #ffffff; 
                  padding: 8px 6px; 
                  font-size: 9px; 
                  text-transform: uppercase; 
                  letter-spacing: 0.5px;
                  border: 1px solid #0f172a;
              }
              .products-table td { 
                  border: 1px solid #e2e8f0; 
                  padding: 6px 8px; 
                  font-size: 11px; 
                  vertical-align: middle;
              }

              /* ZEBREAMENTO IGUAL EM TODAS AS COLUNAS */
              .linha-par td { background-color: #ffffff; }
              .linha-impar td { background-color: #f8fafc; }

              /* ALINHAMENTO E PADRÃO DE COLUNAS */
              .col-id { width: 65px; text-align: center; font-weight: 700; color: #475569; }
              .col-nome { text-align: left; }
              .col-unid { width: 60px; text-align: center; }
              
              .badge-unid {
                  background: #e2e8f0;
                  color: #334155;
                  font-size: 9px;
                  font-weight: 700;
                  padding: 2px 5px;
                  border-radius: 3px;
              }

              .col-qtd { width: 75px; text-align: center; font-size: 12px; color: #1e40af; }
              
              /* COLUNA MANUAL TOTALMENTE INTEGRADA À TABELA */
              .col-manual { 
                  width: 110px; 
                  text-align: center;
              }
              .guia-caneta {
                  border-bottom: 1px dashed #94a3b8;
                  width: 80%;
                  height: 12px;
                  margin: 0 auto;
              }

              .col-filial { width: 100px; text-align: center; color: #64748b; font-weight: 600; font-size: 10px; }

              /* RESUMO E ASSINATURAS */
              .table-summary {
                  display: flex;
                  justify-content: flex-end;
                  margin-bottom: 15px;
                  font-size: 10px;
                  font-weight: 700;
                  color: #475569;
              }
              .summary-badge {
                  background: #f1f5f9;
                  padding: 4px 10px;
                  border-radius: 4px;
                  border: 1px solid #cbd5e1;
              }

              .footer { 
                  display: flex; 
                  gap: 15px; 
                  width: 100%; 
                  margin-top: 15px; 
                  page-break-inside: avoid;
              }
              .footer-box { 
                  flex: 1; 
                  border: 1px solid #cbd5e1; 
                  border-radius: 6px; 
                  padding: 10px 12px; 
                  height: 60px; 
                  font-size: 9px; 
                  font-weight: 700;
                  color: #475569;
                  background-color: #fafafa;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
              }
              .linha-assinatura {
                  border-bottom: 1px solid #475569;
                  width: 100%;
              }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="brand-container">
                    <img src="img/logo.png" class="logo"> 
                    <div class="header-title">
                        <h1>IVRNET PROVEDOR</h1>
                        <p>Separação de Pedido de Estoque</p>
                    </div>
                </div>
                <div class="doc-badge">
                    <span class="id-num">PEDIDO #${consulta.id}</span>
                    <span class="date-num">${new Date(consulta.data).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <span class="title">Filial Destino</span>
                    <span class="val">Filial ${consulta.filial}</span>
                </div>
                <div class="info-card">
                    <span class="title">Solicitante</span>
                    <span class="val">${consulta.usuario || 'Não informado'}</span>
                </div>
            </div>

            <div class="obs-box">
                <strong>Observações Gerais do Pedido:</strong>
                ${consulta.observacao || 'Nenhuma observação cadastrada para este pedido.'}
            </div>

            <table class="products-table">
                <thead>
                    <tr>
                        <th style="width: 65px;">CÓDIGO</th>
                        <th style="text-align: left;">DESCRIÇÃO DO PRODUTO</th>
                        <th style="width: 60px;">UNID.</th>
                        <th style="width: 75px;">QTD. SOLIC.</th>
                        <th style="width: 110px;">QTD. ENV. (MANUAL)</th>
                        <th style="width: 100px;">DESTINO</th>
                    </tr>
                </thead>
                <tbody>${linhasProdutos}</tbody>
            </table>

            <div class="table-summary">
                <span class="summary-badge">TOTAL DE ITENS NO PEDIDO: ${consulta.lProdutos.length}</span>
            </div>

            <div class="footer">
                <div class="footer-box">
                    <span>RESPONSÁVEL PELA SEPARAÇÃO (ALMOXARIFADO)</span>
                    <div class="linha-assinatura"></div>
                </div>
                <div class="footer-box">
                    <span>CONFERIDO / RECEBIDO POR</span>
                    <div class="linha-assinatura"></div>
                </div>
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