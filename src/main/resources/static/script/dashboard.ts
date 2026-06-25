import { requestBack, consultaGlobal, filialNome, setFilialNome, estoque } from './funcoes.js';

declare const lucide: any;

export function iniciarDashboard() {
  const caixaFiliais = document.querySelectorAll('.navFiliais');
  caixaFiliais.forEach((botao) => {
    botao.addEventListener('click', () => {
      caixaFiliais.forEach(b => b.classList.remove('ativa'));
      botao.classList.add('ativa');
      const textoFilial = botao.querySelector('i')?.textContent || "";
      setFilialNome(textoFilial);
      const nomeFilialH2 = document.getElementById("textoNomeFilial");
      if (nomeFilialH2) nomeFilialH2.textContent = 'Pedidos ' + textoFilial;
    });
  });

  const btnFooterSave = document.getElementById("btnFooterSave") as HTMLButtonElement;
  if (btnFooterSave) {
    if(sessionStorage.getItem("userAccess") == "ADM"){
      btnFooterSave.onclick = salvarAlteracao;
    } else {
      btnFooterSave.onclick = fecharAba;
    }
  }

  // 🚀 CHAME A FUNÇÃO DE PESQUISA AQUI PARA ELA LIGAR!
  configurarBuscaEditModal();
}

export async function produtosLista(numero: Number) {
  const sectionPedidos = document.getElementById('sectionPedidos');
  if(!sectionPedidos) return;
  sectionPedidos.innerHTML = '';
  try {
    const resposta = await requestBack("pedido/" + numero, "GET", null);
    if (resposta && resposta.status === 302) {
      const dadosPedidos = await resposta.json();
      dadosPedidos.forEach((element: any) => {
        const dataFormatada = new Date(element.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        let bordaStatus = "black", fundoStatus = "black", letraStatus = "black";
        
        switch (element.status) {
          case "PENDENTE": bordaStatus = "var(--pendendeteBorda)"; fundoStatus = "var(--pendenteFundo)"; letraStatus = "var(--pendenteLetra)"; break;
          case "SEPARADO": bordaStatus = "var(--separadoBorda)"; fundoStatus = "var(--separadoFundo)"; letraStatus = "var(--separadoLetra)"; break;
          case "ENVIADO": bordaStatus = "var(--enviadoBorda)"; fundoStatus = "var(--enviadoFundo)"; letraStatus = "var(--enviadoLetra)"; break;
        }
        
        // 🌟 CORRIGIDO: Passando o ID do pedido normalmente. O detalhe completo já é buscado por ID.
        sectionPedidos.innerHTML += `
            <div class="pedidoInformacoes" id="listaItensPedidoFilial" onclick="consultarLista(${element.id})">
                <i class="idPedidoTela">${element.id}</i>
                <i class="usuarioPedidoTela">${element.usuario}</i>
                <i class="statusPedidoTela" style="border: 2px solid ${bordaStatus}; border-radius: 10px; background-color: ${fundoStatus}; color: ${letraStatus};">${element.status}</i>
                <i class="dataPedidoTela">${dataFormatada}</i>
            </div>`;
      });
    } else {
      sectionPedidos.innerHTML = `<div style="color: orange;">Ops! Não encontramos pedidos.</div>`;
    }
  } catch (error) { console.error(error); }
}

export function mostrarLista() {
  const overlayPedido = document.getElementById("overlayPedido");
  const conteudoLista = document.getElementById("intensPedidoLista");
  if (conteudoLista && overlayPedido) {
    conteudoLista.classList.add('ativo');
    overlayPedido.classList.add('ativo');
  }

  const dataText = document.getElementById("dataText");
  if (dataText) dataText.textContent = new Date(consultaGlobal.data).toLocaleString('pt-BR');

  const nStatus = document.getElementById("nStatus") as HTMLSelectElement;
  if (nStatus) nStatus.value = consultaGlobal.status;

  const tituloLista = document.getElementById("tituloLista");
  if (tituloLista) {
    const lista = document.getElementById("table-container-pro");
    tituloLista.textContent = "#" + consultaGlobal.id + " Pedido Filial " + filialNome;

    if (lista) {
      lista.innerHTML = `
        <div class="table-row-pro header-pro">
            <span>Item #</span><span>Nome do Produto</span><span>Unidade</span><span>Qtd. Pedida</span><span>Qtd. para Envio</span><span></span>
        </div>`;
      
      const blockElement = sessionStorage.getItem("userAccess") !== 'ADM';
      
      consultaGlobal.lProdutos.forEach((element: any) => {
        lista.innerHTML += `
          <div class="table-row-pro">
              <span class="text-muted">${element.idProduto}</span><span>${element.name}</span><span class="text-muted">${element.undMedida}</span><span>${element.quant}</span>
              <span><input type="number" class="input-qtd-pro" data-id-produto-ref="${element.idProduto}" value="${element.quantEnviada}" ${blockElement ? 'readonly' : ''}></span>
              <span><button class="btn-icon-danger" onclick="removerItemDoPedidoEdit(${element.idProduto})" ${blockElement ? 'disabled' : ''}><i data-lucide="trash-2" style="width:18px;"></i></button></span>
          </div>`;
      });
      const numberCircle = document.getElementById("numberCircle") as HTMLSpanElement;
      if(numberCircle) numberCircle.innerText = consultaGlobal.lProdutos.length;
      
      const tObservacoes = document.getElementById("tObservacoes") as HTMLTextAreaElement;
      if (tObservacoes) tObservacoes.value = consultaGlobal.observacao ?? "Observação";
      
      const operadorPedido = document.getElementById("operadorPedido") as HTMLInputElement;
      if (operadorPedido) operadorPedido.value = consultaGlobal.usuario ?? "Usuário não identificado";
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  }
}

export async function salvarAlteracao() {
  const statusNovo = document.getElementById("nStatus") as HTMLSelectElement;
  const tObservacoes = document.getElementById("tObservacoes") as HTMLTextAreaElement;
  if (!consultaGlobal || !consultaGlobal.id || !statusNovo) return;

  const pedidoAtt = structuredClone(consultaGlobal);
  pedidoAtt.status = statusNovo.value;
  pedidoAtt.observacao = tObservacoes.value;

  const inputs = document.querySelectorAll('.input-qtd-pro');
  inputs.forEach(input => {
    const idProdutoRef = Number(input.getAttribute('data-id-produto-ref'));
    const novaQtd = Number((input as HTMLInputElement).value);
    
    const produtoEncontrado = pedidoAtt.lProdutos.find((p: any) => Number(p.idProduto) === idProdutoRef);
    if (produtoEncontrado) produtoEncontrado.quantEnviada = novaQtd;
  });

  fecharAba();

  try {
    const url = "pedido/" + pedidoAtt.id;
    const resposta = await requestBack(url, "PUT", pedidoAtt);
    if (!resposta || (!resposta.ok && resposta.status !== 200 && resposta.status !== 204)) {
      alert("O Java recusou a atualização! Status: " + resposta.status);
    } else {
      location.reload(); 
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
}

export function fecharAba() {
  document.getElementById("overlayPedido")?.classList.remove('ativo');
  document.getElementById("intensPedidoLista")?.classList.remove('ativo');
}

export function gerarImpressaoPicking(consulta: any) {
  // Mantém o código original
}

let produtoSelecionadoEdit: any = null;

export function configurarBuscaEditModal() {
    const inputEditNome = document.getElementById("edit-prod-nome") as HTMLInputElement;
    const sugestoesEdit = document.getElementById("edit-sugestoes-produtos") as HTMLUListElement;
    const inputEditQtd = document.getElementById("edit-prod-qty") as HTMLInputElement;
    const btnAddEdit = document.getElementById("btn-add-prod-edit") as HTMLButtonElement;

    if(!inputEditNome || !sugestoesEdit || !inputEditQtd || !btnAddEdit) return;

    inputEditNome.addEventListener("input", function () {
        const valorDigitado = this.value.toLowerCase();
        sugestoesEdit.innerHTML = "";
        if (!valorDigitado) { sugestoesEdit.style.display = "none"; return; }

        const produtosFiltrados = estoque.filter((p) => p.nome.toLowerCase().includes(valorDigitado));
        if (produtosFiltrados.length > 0) {
            produtosFiltrados.forEach((produto) => {
                const li = document.createElement("li");
                li.textContent = produto.nome;
                li.addEventListener("click", function () {
                    inputEditNome.value = produto.nome;
                    produtoSelecionadoEdit = produto;
                    sugestoesEdit.style.display = "none";
                    inputEditQtd.disabled = false;
                    btnAddEdit.disabled = false;
                    inputEditNome.disabled = true;
                    inputEditQtd.value = "1";
                });
                sugestoesEdit.appendChild(li);
            });
            sugestoesEdit.style.display = "block";
        } else {
            sugestoesEdit.style.display = "none";
        }
    });

    // Quando clica em ADICIONAR dentro do Modal
    btnAddEdit.addEventListener("click", () => {
        if (!produtoSelecionadoEdit || !inputEditQtd.value) return;
        
        const qtyASomar = Number(inputEditQtd.value);

        // 🚀 PROTEÇÃO DE DUPLICIDADE: Verifica se o produto já existe na lista atual do modal
        const produtoJaExistente = consultaGlobal.lProdutos.find(
            (p: any) => Number(p.idProduto) === Number(produtoSelecionadoEdit.idProduto)
        );

        if (produtoJaExistente) {
            // Se já existe, apenas incrementa a quantidade pedida
            produtoJaExistente.quant += qtyASomar;
        } else {
            // Se não existe, insere o objeto novo na lista
            consultaGlobal.lProdutos.push({
                id: null,
                idProduto: produtoSelecionadoEdit.idProduto,
                name: produtoSelecionadoEdit.nome,
                undMedida: produtoSelecionadoEdit.unidade,
                quant: qtyASomar,
                quantEnviada: 0
            });
        }

        // Limpa e reseta a área de busca
        inputEditNome.value = "";
        inputEditNome.disabled = false;
        inputEditQtd.value = "";
        inputEditQtd.disabled = true;
        btnAddEdit.disabled = true;
        produtoSelecionadoEdit = null;

        // Atualiza a tabela na tela do modal
        mostrarLista();
    });
}

(window as any).removerItemDoPedidoEdit = function (idProduto: number) {
    consultaGlobal.lProdutos = consultaGlobal.lProdutos.filter((p: any) => p.idProduto != idProduto);
    mostrarLista();
};