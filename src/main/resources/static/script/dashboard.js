import { requestBack, consultaGlobal, filialNome, setFilialNome } from './funcoes.js';
export function iniciarDashboard() {
    const caixaFiliais = document.querySelectorAll('.navFiliais');
    caixaFiliais.forEach((botao) => {
        botao.addEventListener('click', () => {
            caixaFiliais.forEach(b => b.classList.remove('ativa'));
            botao.classList.add('ativa');
            const textoFilial = botao.querySelector('i')?.textContent || "";
            setFilialNome(textoFilial);
            const nomeFilialH2 = document.getElementById("textoNomeFilial");
            if (nomeFilialH2)
                nomeFilialH2.textContent = 'Pedidos ' + textoFilial;
        });
    });
    const btnFooterSave = document.getElementById("btnFooterSave");
    if (btnFooterSave) {
        btnFooterSave.onclick = salvarAlteracao;
    }
}
export async function produtosLista(numero) {
    const sectionPedidos = document.getElementById('sectionPedidos');
    if (!sectionPedidos)
        return;
    sectionPedidos.innerHTML = '';
    try {
        const resposta = await requestBack("pedido/" + numero, "GET", null);
        if (resposta && resposta.status === 302) {
            const dadosPedidos = await resposta.json();
            dadosPedidos.forEach((element) => {
                const dataFormatada = new Date(element.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                let bordaStatus = "black", fundoStatus = "black", letraStatus = "black";
                switch (element.status) {
                    case "PENDENTE":
                        bordaStatus = "var(--pendendeteBorda)";
                        fundoStatus = "var(--pendenteFundo)";
                        letraStatus = "var(--pendenteLetra)";
                        break;
                    case "SEPARADO":
                        bordaStatus = "var(--separadoBorda)";
                        fundoStatus = "var(--separadoFundo)";
                        letraStatus = "var(--separadoLetra)";
                        break;
                    case "ENVIADO":
                        bordaStatus = "var(--enviadoBorda)";
                        fundoStatus = "var(--enviadoFundo)";
                        letraStatus = "var(--enviadoLetra)";
                        break;
                }
                sectionPedidos.innerHTML += `
            <div class="pedidoInformacoes" id="listaItensPedidoFilial" onclick="consultarLista(${element.id})">
                <i class="idPedidoTela">${element.id}</i>
                <i class="usuarioPedidoTela">${element.usuario}</i>
                <i class="statusPedidoTela" style="border: 2px solid ${bordaStatus}; border-radius: 10px; background-color: ${fundoStatus}; color: ${letraStatus};">${element.status}</i>
                <i class="dataPedidoTela">${dataFormatada}</i>
            </div>`;
            });
        }
        else {
            sectionPedidos.innerHTML = `<div style="color: orange;">Ops! Não encontramos pedidos.</div>`;
        }
    }
    catch (error) {
        console.error(error);
    }
}
export function mostrarLista() {
    const overlayPedido = document.getElementById("overlayPedido");
    const conteudoLista = document.getElementById("intensPedidoLista");
    if (conteudoLista && overlayPedido) {
        conteudoLista.classList.add('ativo');
        overlayPedido.classList.add('ativo');
    }
    const dataText = document.getElementById("dataText");
    console.log(consultaGlobal);
    if (dataText)
        dataText.textContent = new Date(consultaGlobal.data).toLocaleString('pt-BR');
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
            consultaGlobal.lProdutos.forEach((element) => {
                lista.innerHTML += `
          <div class="table-row-pro">
              <span class="text-muted">${element.idProduto}</span><span>${element.name}</span><span class="text-muted">${element.undMedida}</span><span>${element.quant}</span>
              <span><input type="number" class="input-qtd-pro" data-id-produto="${element.id}" value="${element.quantEnviada}" ${blockElement ? 'readonly' : ''}></span>
              <span><button class="btn-icon-danger"><i data-lucide="trash-2" style="width:18px;"></i></button></span>
          </div>`;
            });
            const numberCircle = document.getElementById("numberCircle");
            if (numberCircle) {
                numberCircle.innerText = consultaGlobal.lProdutos.length;
            }
            const tObservacoes = document.getElementById("tObservacoes");
            if (tObservacoes)
                tObservacoes.value = consultaGlobal.observacao ?? "Observação";
            const operadorPedido = document.getElementById("operadorPedido");
            if (operadorPedido)
                operadorPedido.value = consultaGlobal.usuario ?? "Usuário não identificado";
        }
    }
}
export async function salvarAlteracao() {
    const statusNovo = document.getElementById("nStatus");
    const tObservacoes = document.getElementById("tObservacoes");
    if (!consultaGlobal || !consultaGlobal.id) {
        console.error("ERRO GRAVE: O consultaGlobal está vazio ou sem ID!");
        alert("Erro interno: Nenhum pedido selecionado.");
        return;
    }
    const pedidoAtt = structuredClone(consultaGlobal);
    pedidoAtt.status = statusNovo.value;
    pedidoAtt.observacao = tObservacoes.value;
    const inputs = document.querySelectorAll('.input-qtd-pro');
    inputs.forEach(input => {
        const idItem = Number(input.getAttribute('data-id-produto'));
        const novaQtd = Number(input.value);
        const produtoEncontrado = pedidoAtt.lProdutos.find((p) => Number(p.id) === idItem);
        if (produtoEncontrado) {
            produtoEncontrado.quantEnviada = novaQtd;
        }
        else {
            console.warn(`Aviso: Produto ID ${idItem} estava no HTML mas não na lista lProdutos!`);
        }
        fecharAba();
    });
    try {
        const url = "pedido/" + pedidoAtt.id;
        const resposta = await requestBack(url, "PUT", pedidoAtt);
        if (resposta && (resposta.ok || resposta.status === 200 || resposta.status === 204)) {
        }
        else {
            alert("O Java recusou a atualização! Status: " + resposta.status);
        }
    }
    catch (error) {
        console.error("PASSO 8: Ocorreu um erro na requisição:", error);
    }
}
export function fecharAba() {
    document.getElementById("overlayPedido")?.classList.remove('ativo');
    document.getElementById("intensPedidoLista")?.classList.remove('ativo');
}
export function gerarImpressaoPicking(consulta) {
    // Mantém a sua string HTML gigantesca aqui sem precisar alterar!
    // Coloque exatamente o mesmo código de impressão que você já tinha.
}
