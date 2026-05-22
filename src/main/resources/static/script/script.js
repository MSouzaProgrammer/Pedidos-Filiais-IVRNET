"use strict";
// 2. Tipamos o estoque como um array de Produtos
let estoque = [];
let produtoEmEspera = null;
let carrinhoDePedidos = [];
let filial;
let usuario;
//FUNÇÃO PARA BUSCAR COISAS DO BACK
async function requestBack(caminho, metodo, dados) {
    ligarLoading();
    // 1. Cria a base das opções da requisição
    const opcoes = {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        }
    };
    // 2. Busca o token no sessionStorage
    const token = sessionStorage.getItem("token");
    // 3. Se o token existir, adiciona no cabeçalho de forma segura para o TS
    if (token) {
        opcoes.headers = {
            ...opcoes.headers,
            "Authorization": `Bearer ${token}`
        };
    }
    // 4. Adiciona o corpo da requisição se não for um GET
    if (dados && metodo.toUpperCase() !== "GET") {
        opcoes.body = JSON.stringify(dados);
    }
    // 5. Faz o fetch final
    const resposta = await fetch("http://localhost:8080/" + caminho, opcoes);
    desligarLoading();
    return resposta;
}
//#endregion
//FUNÇÃO PARA TROCA DE PAGINAS;
function showPage(pageId) {
    document.querySelectorAll(".page-content").forEach((p) => p.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    const pageTarget = document.getElementById(pageId + "-page");
    const navTarget = document.getElementById("nav-" + pageId);
    if (pageTarget)
        pageTarget.classList.add("active");
    if (navTarget)
        navTarget.classList.add("active");
    const titles = {
        dash: "Dashboard",
        "novo-pedido": "Novo Pedido",
        produtos: "Produtos",
    };
    const titleEl = document.getElementById("page-title");
    if (titleEl)
        titleEl.innerText = titles[pageId] || "Página";
    carregarProdutos();
    atualizarProdutos();
}
//#region LOGIN
const b_login = document.querySelector("#b-login");
const user = document.querySelector("#user");
// --- LÓGICA DE LOGIN ---
if (b_login) {
    const loginForm = document.querySelector("form");
    const tentarLogin = async (e) => {
        e.preventDefault();
        const emailEl = document.querySelector("#email-login");
        const senhaEl = document.querySelector("#senhaLogin");
        if (emailEl && senhaEl) {
            const loginData = {
                email: emailEl.value,
                password: senhaEl.value
            };
            try {
                const resposta = await requestBack("auth/login", "POST", loginData);
                if (resposta.ok) {
                    const dadosDoUsuario = await resposta.json();
                    sessionStorage.setItem("token", dadosDoUsuario.token);
                    sessionStorage.setItem("userName", dadosDoUsuario.name);
                    sessionStorage.setItem("userAccess", dadosDoUsuario.access);
                    window.location.href = "index.html";
                }
                else if (resposta.status === 401) {
                    alert("Email ou senha incorretos. Tente novamente!");
                }
                else {
                    alert("Email ou senha incorreto!");
                }
            }
            catch (erro) {
                console.error("Erro de conexão:", erro);
                alert("Não foi possível conectar ao servidor. Verifique se o Spring Boot está rodando.");
            }
        }
    };
    if (loginForm) {
        loginForm.addEventListener("submit", tentarLogin);
    }
    else if (b_login) {
        b_login.addEventListener("click", tentarLogin);
    }
}
if (user) {
    const nomeGuardado = sessionStorage.getItem("userName");
    const tokenGuardado = sessionStorage.getItem("token");
    if (!tokenGuardado) {
        window.location.href = "login.html";
    }
    else {
        user.innerText = nomeGuardado || "Name";
    }
}
function pegarIniciais(nomeCompleto) {
    const conectivos = ["de", "da", "do", "dos", "das", "e"];
    return nomeCompleto
        .trim()
        .split(/\s+/)
        .filter(palavra => !conectivos.includes(palavra.toLowerCase()))
        .map(palavra => palavra.charAt(0).toUpperCase())
        .join('');
}
const avatarLogo = document.getElementById("avatarLogo");
if (avatarLogo) {
    const nomeUsuario = sessionStorage.getItem("userName") || 'Usuário';
    const iniciais = pegarIniciais(nomeUsuario);
    const avatarContainer = document.getElementById("avatarLogo");
    avatarContainer.textContent = iniciais;
    if (!sessionStorage.getItem("userAccess")) {
        window.location.href = "login.html";
    }
}
//#endregion
function avisoDePermissao() {
    alert("Você não tem permissão de administrador");
}
//#region Funçoes para {PRODUTOS}
function renderProductList(itens) {
    const container = document.getElementById("global-product-list");
    if (!container)
        return;
    container.innerHTML = "";
    itens.forEach((item) => {
        const div = document.createElement("div");
        div.className = "product-list-item";
        if (sessionStorage.getItem("userAccess") === 'ADM') {
            div.innerHTML = `
            <span style="font-weight:700; color:var(--text-muted)">${item.idProduto}</span>
            <span style="font-weight:600">${item.nome}</span>
            <span style="color:var(--text-muted)">${item.unidade}</span>
            <div style="text-align:right">
                <button id="editardbtn"  style="border:none; background:none; cursor:pointer; color:var(--text-muted); margin-right:8px" onclick="editarItem('${item.id}')"><i data-lucide="edit" style="width:16px"></i></button>
                <button id="apagarbtn" style="border:none; background:none; cursor:pointer; color:#ef4444"  onclick="deleteProduct('${item.id}')"><i data-lucide="trash-2" style="width:16px"></i></button>
            </div>
        `;
        }
        else {
            div.innerHTML = `
            <span style="font-weight:700; color:var(--text-muted)">${item.idProduto}</span>
            <span style="font-weight:600">${item.nome}</span>
            <span style="color:var(--text-muted)">${item.unidade}</span>
            <div style="text-align:right;">
                <button id="editardbtn"  style="border:none; background:none; cursor:pointer; color:var(--text-muted); margin-right:8px" onclick="avisoDePermissao()"><i data-lucide="edit" style="width:16px"></i></button>
                <button id="apagarbtn" style="border:none; background:none; cursor:pointer; color:#ef4444"  onclick="avisoDePermissao()"><i data-lucide="trash-2" style="width:16px"></i></button>
            </div>
        `;
        }
        container.appendChild(div);
    });
    if (typeof lucide !== "undefined")
        lucide.createIcons();
}
function filterProducts() {
    const searchEl = document.getElementById("search-product");
    if (!searchEl)
        return;
    const term = searchEl.value.toLowerCase();
    const filtered = estoque.filter((p) => p.nome.toLowerCase().includes(term) || String(p.id).toLowerCase().includes(term));
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
async function carregarProdutos() {
    try {
        const resposta = await requestBack("produto", "GET", null);
        if (resposta.status === 302) {
            const dadosBack = await resposta.json();
            // Atualiza a variável (lembre-se que tem que ser "let estoque" lá no topo)
            estoque = dadosBack.map((itemDoJava) => {
                return {
                    id: String(itemDoJava.id),
                    idProduto: String(itemDoJava.idProduto), // Transforma número em texto, caso o Java mande número
                    nome: String(itemDoJava.name),
                    unidade: String(itemDoJava.undMedida),
                    quantidade: Number()
                };
            });
            renderProductList(estoque);
        }
        else {
            console.error("Deu ruim no back-end. Status:", resposta.status);
        }
    }
    catch (err) {
        console.error("Erro ao buscar produtos no backend:", err);
    }
}
// Exposto no objeto Window (TypeScript exige isso se você chama a função pelo HTML via onclick)
window.deleteProduct = async function (idDoBanco) {
    // 1. Confirmação pro usuário não apagar sem querer (opcional, mas recomendado)
    const querMesmoApagar = confirm("Tem certeza que deseja apagar este produto?");
    if (!querMesmoApagar)
        return;
    try {
        // 2. Faz a chamada pro Java. 
        // Note que colocamos o ID direto na URL: "produto/15" e usamos "DELETE"
        const resposta = await requestBack("produto/" + idDoBanco, "DELETE", null);
        if (resposta.ok) {
            // 3. Se o Java confirmou que apagou, a gente tira ele da nossa lista local
            estoque = estoque.filter((p) => String(p.id) !== String(idDoBanco));
            // 4. Atualiza a tela
            renderProductList(estoque);
        }
        else {
            console.error("Erro ao apagar. Status:", resposta.status);
            alert("Não foi possível apagar o produto no banco de dados.");
        }
    }
    catch (erro) {
        console.error("Erro de conexão ao deletar:", erro);
        alert("Erro de conexão com o servidor.");
    }
};
async function atualizarProdutos() {
    try {
        const resposta = await requestBack("produto", "GET", null);
        if (resposta.ok) {
            const dadosBack = await resposta.json();
            // Atualiza a variável (lembre-se que tem que ser "let estoque" lá no topo)
            estoque = dadosBack.map((itemDoJava) => {
                return {
                    id: String(itemDoJava.id),
                    idProduto: String(itemDoJava.idProduto), // Transforma número em texto, caso o Java mande número
                    nome: String(itemDoJava.name),
                    unidade: String(itemDoJava.undMedida),
                    quantidade: Number()
                };
            });
            renderProductList(estoque);
        }
        else {
            console.error("Deu ruim no back-end. Status:", resposta.status);
        }
    }
    catch (err) {
        console.error("Erro ao buscar produtos no backend:", err);
    }
}
const bAtualizar = document.getElementById("atualizar"); // Corrigido para ButtonElement
if (bAtualizar) {
    bAtualizar.addEventListener("click", async function () {
        atualizarProdutos();
    });
}
const btnNovoProduto = document.getElementById("btn-salvar");
if (btnNovoProduto) {
    btnNovoProduto.addEventListener("click", async function () {
        const nomeP = document.getElementById("new-prod-name");
        const idP = document.getElementById("new-prod-id");
        const unitP = document.getElementById("new-prod-unit");
        if (nomeP && idP && nomeP.value.trim() !== "" && idP.value.trim() !== "") {
            const produto = {
                id: idP.value,
                idProduto: idP.value,
                nome: nomeP.value,
                unidade: unitP ? unitP.value : "",
                quantidade: 0
            };
            try {
                const resposta = await requestBack("produto", "POST", {
                    idProduto: produto.idProduto,
                    name: produto.nome,
                    undMedida: produto.unidade
                });
                console.log(resposta);
            }
            catch (err) {
                console.error("Erro ao enviar produto para o backend:", err);
            }
            estoque.push(produto);
            renderProductList(estoque);
            closeModal();
            nomeP.value = "";
            idP.value = "";
            if (unitP)
                unitP.value = "";
        }
        else {
            alert("Por favor, preencha pelo menos o Nome e o ID do produto.");
        }
    });
}
//#endregion
//#region {NOVO PEDIDO}
const btAdd = document.getElementById("btn-add-order");
const inputProduto = document.getElementById("prod-nome");
const listaSugestoes = document.getElementById("sugestoes-produtos");
const quantValor = document.getElementById("prod-qty");
function configurarDropdownProdutos() {
    if (!inputProduto || !listaSugestoes || !quantValor)
        return;
    // Dispara toda vez que o usuário digita algo no campo de busca
    inputProduto.addEventListener("input", function () {
        const valorDigitado = this.value.toLowerCase();
        listaSugestoes.innerHTML = ""; // Limpa os resultados anteriores
        if (!valorDigitado) {
            listaSugestoes.style.display = "none";
            return;
        }
        // Filtra o array global 'estoque' que veio do seu Java
        const produtosFiltrados = estoque.filter((p) => p.nome.toLowerCase().includes(valorDigitado));
        if (produtosFiltrados.length > 0) {
            produtosFiltrados.forEach((produto) => {
                const li = document.createElement("li");
                li.textContent = produto.nome;
                // Quando o usuário clicar no produto da lista
                li.addEventListener("click", function () {
                    inputProduto.value = produto.nome;
                    produtoEmEspera = produto;
                    listaSugestoes.style.display = "none";
                    quantValor.disabled = false;
                    btAdd.style.backgroundColor = '#041033';
                    btAdd.disabled = false;
                });
                listaSugestoes.appendChild(li);
            });
            listaSugestoes.style.display = "block"; // Mostra a lista
        }
        else {
            listaSugestoes.style.display = "none"; // Esconde se não achar nada
        }
    });
    // Fecha a lista se o usuário clicar em qualquer outro lugar da tela
    document.addEventListener("click", function (evento) {
        if (evento.target !== inputProduto && evento.target !== listaSugestoes) {
            listaSugestoes.style.display = "none";
        }
    });
}
if (!inputProduto || !listaSugestoes || !quantValor) { }
else {
    if (quantValor.value == "") {
        btAdd.disabled = true;
        btAdd.style.backgroundColor = 'red';
        quantValor.disabled = true;
    }
}
// --- LÓGICA DO DASHBOARD E PRODUTOS ---
const list = document.getElementById("order-items-list");
document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== "undefined")
        lucide.createIcons();
    configurarDropdownProdutos();
    carregarProdutos();
    const btnAddOrder = document.getElementById("btn-add-order");
    if (btnAddOrder) {
        btnAddOrder.addEventListener("click", () => {
            //#region LATERAL
            const nomeEl = document.getElementById("prod-nome");
            const qtyEl = document.getElementById("prod-qty");
            if (!nomeEl || !qtyEl || !nomeEl.value)
                return;
            const nome = nomeEl.value;
            const qty = qtyEl.value;
            if (!list)
                return;
            const li = document.createElement("li");
            li.style.cssText = "display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f1f5f9; align-items:center";
            li.innerHTML = `
                <div><span style="font-size:14px; font-weight:600">${nome}</span></div>
                <div style="display:flex; align-items:center; gap:12px">
                    <span style="background:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:700">${qty} un</span>
                    <buttonstyle="border:none; background:none; color:#ef4444; cursor:pointer" onclick="this.parentElement?.parentElement?.remove(); apagar('${nome}')" id="bDeletar"><i data-lucide="trash-2" style="width:16px"></i></button>
                </div>
            `;
            list.appendChild(li);
            if (typeof lucide !== "undefined")
                lucide.createIcons();
            //#endregion
            if (!produtoEmEspera) {
                alert("Por favor, pesquise e selecione um produto da lista primeiro!");
                return;
            }
            const inputProduto = document.getElementById("prod-nome");
            const quantValor = document.getElementById("prod-qty");
            if (quantValor && inputProduto) {
                const itemFinalCarrinho = {
                    id: produtoEmEspera.id,
                    idProduto: produtoEmEspera.idProduto,
                    nome: produtoEmEspera.nome,
                    unidade: produtoEmEspera.unidade,
                    quantidade: quantValor.valueAsNumber
                };
                carrinhoDePedidos.push(itemFinalCarrinho);
            }
            nomeEl.value = "";
            qtyEl.value = "1";
            btAdd.disabled = true;
            btAdd.style.backgroundColor = 'red';
            qtyEl.disabled = true;
        });
    }
});
function apagar(idParaRemover) {
    const container = document.getElementById("global-product-list");
    carrinhoDePedidos = carrinhoDePedidos.filter(produto => String(produto.nome) !== String(idParaRemover));
}
const btnFinalizar = document.getElementById("btn-finalizar");
if (btnFinalizar) {
    btnFinalizar.addEventListener("click", async () => {
        if (carrinhoDePedidos.length !== 0) {
            const filialSelecionada = document.getElementById("select-filial");
            const nomeUsuario = sessionStorage.getItem("userName") || "Name";
            const listaProdutos = carrinhoDePedidos.map(item => {
                return {
                    idProduto: item.idProduto,
                    name: item.nome,
                    undMedida: item.unidade,
                    quant: item.quantidade
                };
            });
            const dadosPedido = {
                filial: filialSelecionada.value.toUpperCase().replace("FILIAL ", "").trim(),
                lProdutos: listaProdutos,
                usuario: nomeUsuario
            };
            const resposta = await requestBack("pedido", "POST", dadosPedido);
            location.reload();
        }
    });
}
//#endregion
//#region DASHBOARD 
const caixaFiliais = document.querySelectorAll('.navFiliais');
caixaFiliais.forEach((botao) => {
    botao.addEventListener('click', () => {
        caixaFiliais.forEach(b => b.classList.remove('ativa'));
        botao.classList.add('ativa');
        const textoFilial = botao.querySelector('i')?.textContent;
        const nomeFilialH2 = document.getElementById("textoNomeFilial");
        nomeFilialH2.textContent = 'Pedidos ' + textoFilial;
    });
});
async function produtosLista(numero) {
    const sectionPedidos = document.getElementById('sectionPedidos');
    sectionPedidos.innerHTML = '';
    try {
        const resposta = (await requestBack("pedido/" + numero, "GET", null));
        if (resposta && resposta.status === 302) {
            const dadosPedidos = await resposta.json();
            console.log(dadosPedidos);
            dadosPedidos.forEach((element) => {
                const idPedido = element.id;
                const usuarioPedido = element.usuario;
                const statusPedido = element.status;
                console.log(element);
                const dataFormatada = new Date(element.data).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                let bordaStatus = "";
                let fundoStatus = "";
                let letraStatus = "";
                switch (statusPedido) {
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
                    default:
                        bordaStatus = "black";
                        fundoStatus = "black";
                        letraStatus = "black";
                        break;
                }
                if (sectionPedidos) {
                    sectionPedidos.innerHTML += `<div class="pedidoInformacoes" id="listaItensPedidoFilial" onclick="consultarLista(${idPedido})">
                                    <i id="idPedido" class="idPedidoTela">${idPedido}</i>
                                    <i id="usuarioPedido" class="usuarioPedidoTela">${usuarioPedido}</i>
                                    <i id="statusPedido" class="statusPedidoTela" style="border: 2px solid ${bordaStatus}; border-radius: 10px; background-color: ${fundoStatus}; color: ${letraStatus};"">${statusPedido}</i>
                                    <i id="dataPedido" class="dataPedidoTela">${dataFormatada}</i>
                                </div>`;
                }
            });
        }
        else {
            // 3. CHECAGEM: "Deu ruim" (Erro de API, ex: 404 não encontrado, 401 não autorizado)
            console.error("Erro na API:", resposta.status);
            sectionPedidos.innerHTML = `<div style="color: orange;">Ops! Não encontramos pedidos para esta filial (Erro ${resposta.status}).</div>`;
        }
    }
    catch (error) {
        console.error(error);
        return;
    }
}
let consulta = null;
async function consultarLista(id) {
    try {
        const resposta = await requestBack("pedido/pedidoId/" + id, "GET", null);
        if (resposta && resposta.status === 302) {
            const dadosPedido = await resposta.json();
            // AQUI ESTÁ O SEGREDO: Salva na global para outras funções usarem
            consulta = dadosPedido;
            mostrarLista();
        }
    }
    catch (error) {
        console.error("Erro na consulta:", error);
    }
}
function mostrarLista() {
    const overlayPedido = document.getElementById("overlayPedido");
    const conteudoLista = document.getElementById("intensPedidoLista");
    if (conteudoLista && overlayPedido) {
        conteudoLista.classList.add('ativo');
        overlayPedido.classList.add('ativo');
    }
    const dataText = document.getElementById("dataText");
    const dataFormatada = new Date(consulta.dataCriacao).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    if (dataText) {
        dataText.textContent = dataFormatada;
    }
    const tituloLista = document.getElementById("tituloLista");
    if (tituloLista) {
        const lista = document.getElementById("table-container-pro");
        const filial = consulta.filial;
        const idPedido = consulta.id;
        tituloLista.textContent = "#" + idPedido + " Pedido Filial " + filialNome;
        if (lista) {
            lista.innerHTML = `<div class="table-row-pro header-pro">
                        <span>Item #</span>
                        <span>Nome do Produto</span>
                        <span>Unidade</span>
                        <span>Qtd. Pedida</span>
                        <span>Qtd. para Envio</span>
                        <span></span>
                    </div>`;
            consulta.lProdutos.forEach((element) => {
                const idProduto = element.idProduto;
                const nome = element.name;
                const undMedida = element.undMedida;
                const quantidade = element.quant;
                const quantEnviada = element.quantEnviada;
                let blockElement = true;
                if (sessionStorage.getItem("userAccess") === 'ADM') {
                    blockElement = false;
                }
                lista.innerHTML += `<div class="table-row-pro">
                        <span class="text-muted">${idProduto}</span>
                        <span>${nome}</span>
                        <span class="text-muted">${undMedida}</span>
                        <span>${quantidade}</span>
                        <span><input type="number" class="input-qtd-pro" data-id-produto="${element.id}" value="${quantEnviada}" ${blockElement ? 'readonly' : ''}></span>
                        <span><button class="btn-icon-danger"><i data-lucide="trash-2"
                                  style="width:18px; position: fixed; right: 32%;"></i></button></span>
                    </div>`;
            });
            const tObservacoes = document.getElementById("tObservacoes");
            if (tObservacoes) {
                tObservacoes.value = consulta.observacao ?? "Obervação";
            }
            const operadorPedido = document.getElementById("operadorPedido");
            if (operadorPedido) {
                operadorPedido.value = consulta.usuario ?? "Usuário não identificado";
            }
        }
        const numberCircle = document.getElementById("numberCircle");
        const tam = consulta.lProdutos.length;
        if (numberCircle) {
            numberCircle.textContent = String(tam);
        }
    }
}
async function salvarAlteracao() {
    const statusNovo = document.getElementById("nStatus");
    const tObservacoes = document.getElementById("tObservacoes");
    const pedidoAtt = { ...consulta };
    pedidoAtt.status = statusNovo.value;
    pedidoAtt.observacao = tObservacoes.value;
    const inputs = document.querySelectorAll('.input-qtd-pro');
    inputs.forEach(input => {
        const idItem = Number(input.getAttribute('data-id-produto'));
        const novaQtd = Number(input.value);
        const produtoEncontrado = pedidoAtt.lProdutos.find((p) => p.id === idItem);
        if (produtoEncontrado) {
            produtoEncontrado.quantEnviada = novaQtd;
        }
    });
    const envio = await requestBack("pedido/" + pedidoAtt.id, "PUT", pedidoAtt);
}
function fecharAba() {
    const overlayPedido = document.getElementById("overlayPedido");
    overlayPedido.classList.remove('ativo');
    const conteudoLista = document.getElementById("intensPedidoLista");
    conteudoLista.classList.remove('ativo');
}
function editarItem(idDoBanco) {
    const modal = document.getElementById("modal-produto-edit");
    if (modal)
        modal.style.display = "flex";
    const btnEditProduto = document.getElementById("btn-salvar-edit");
    if (btnEditProduto) {
        btnEditProduto.addEventListener("click", async function () {
            const nomeP = document.getElementById("edit-prod-name");
            const idP = document.getElementById("edit-prod-id");
            const unitP = document.getElementById("edit-prod-unit");
            if (nomeP && idP && nomeP.value.trim() !== "" && idP.value.trim() !== "") {
                const produto = {
                    id: idP.value,
                    idProduto: idP.value,
                    nome: nomeP.value,
                    unidade: unitP ? unitP.value : "",
                    quantidade: 0
                };
                try {
                    const resposta = await requestBack("produto/update", "PUT", {
                        id: idDoBanco,
                        idProduto: produto.idProduto,
                        name: produto.nome,
                        undMedida: produto.unidade
                    });
                }
                catch (err) {
                    console.error("Erro ao enviar produto para o backend:", err);
                }
                closeModal();
                nomeP.value = "";
                idP.value = "";
                if (unitP)
                    unitP.value = "";
            }
            else {
                alert("Por favor, preencha pelo menos o Nome e o ID do produto.");
            }
        });
    }
}
if (sessionStorage.getItem("userAccess") === "ADM") {
    const btnAddProduto = document.getElementById("btnAddProduto");
    const nStatus = document.getElementById("nStatus");
    const tObservacoes = document.getElementById("tObservacoes");
    const btnFooterSave = document.getElementById("btnFooterSave");
    btnAddProduto.disabled = false;
    nStatus.disabled = false;
    tObservacoes.disabled = false;
}
else {
    const btnAddProduto = document.getElementById("btnAddProduto");
    const nStatus = document.getElementById("nStatus");
    const tObservacoes = document.getElementById("tObservacoes");
    const btnFooterSave = document.getElementById("btnFooterSave");
    btnAddProduto.disabled = true;
    nStatus.disabled = true;
    tObservacoes.disabled = true;
    btnFooterSave.onclick = fecharAba;
}
//#endregion
let filialNome = "";
function pegarNome(elemento) {
    const iElement = elemento.querySelector('i');
    if (iElement) {
        filialNome = iElement.innerText;
    }
    return filialNome;
}
function gerarImpressaoPicking(consulta) {
    const iframe = document.getElementById('iframeImpressao');
    if (!iframe)
        return;
    const doc = iframe.contentWindow?.document;
    if (!doc)
        return;
    // Gerando as linhas da tabela
    const linhasProdutos = consulta.lProdutos.map(p => `
        <tr>
            <td>${p.idProduto}</td>
            <td style="text-align: left;">${p.name}</td>
            <td>${p.undMedida || 'UN'}</td>
            <td><strong>${p.quant}</strong></td>
            <td class="col-manual"></td>
            <td>${filialNome || '-'}</td>
        </tr>
    `).join('');
    const htmlFinal = `
        <html>
        <head>
            <style>
              body {padding: 10; border: 1px solid #000; border-radius: 5px ;font-family: Arial, sans-serif; color: #000; background-color: #fff; margin: 0;}
              
              /* Cabeçalho compacto e sem cores */
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px; }
              .logo { height: 50px; filter: grayscale(100%) contrast(1.5); }
              .header-text { text-align: right; }
              .header-text h1 { margin: 0; font-size: 16px; }
              .header-text p { margin: 0; font-size: 11px; font-weight: bold; }

              /* Tabelas com bordas pretas nítidas e arredondadas */
              .info-table, .products-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 10px; border: 1.5px solid #000; border-radius: 8px; overflow: hidden; }
              
              .info-table td { border: 0.5px solid #000; padding: 6px 10px; font-size: 12px; }
              .label { font-weight: bold; background-color: #eee; width: 15%; } /* O leve cinza aqui ajuda a separar, mas é opcional */

              /* Box de observação mais justo */
              .obs-box { border: 1.5px solid #000; border-radius: 8px; padding: 8px 12px; margin-bottom: 15px; font-size: 12px; min-height: 30px; }
              .obs-box strong { font-size: 10px; text-transform: uppercase; display: block; }

              /* Tabela de produtos com aproveitamento de espaço */
              .products-table th { background-color: #414141; color: #fff; padding: 2px; font-size: 10px; text-transform: uppercase; }
              .products-table td { border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 6px; text-align: center; font-size: 12px; }
              .products-table tr:last-child td { border-bottom: none; }
              .products-table td:last-child { border-right: none; }

              /* Coluna manual para caneta - Borda mais grossa para destacar */
              .col-manual { width: 70px; border: 1px solid #000 !important; background-color: #fff; }

              /* Rodapé compacto */
              .footer { display: flex; gap: 10px; width: 100%; margin-top: 20px; }
              .footer-box { flex: 1; border: 1.5px solid #000; border-radius: 8px; padding: 10px; height: 60px; font-size: 10px; }
              .linha-assinatura { border-top: 1px solid #000; margin-top: 35px; text-align: center; width: 80%; margin-left: 10%; }

              @media print {
                  @page { size: portrait; margin: 0.8cm; }
                  body { -webkit-print-color-adjust: exact; }
              }
          </style>
        </head>
        <body>
            <div class="header">
                <img src="img/logoIVRNET.png" class="logo">
                <div class="header-text">
                    <h1>IVRNET PROVEDOR DE INTERNET</h1>
                    <p style="margin:0; font-weight:bold;">Lista de Separação de Pedido</p>
                </div>
            </div>

            <table class="info-table">
                <tr>
                    <td class="label">PEDIDO ID:</td><td>#${consulta.id}</td>
                    <td class="label">DATA:</td><td>${new Date(consulta.dataCriacao).toLocaleDateString()}</td>
                </tr>
                <tr>
                    <td class="label">FILIAL:</td><td>${filialNome}</td>
                    <td class="label">SOLICITANTE:</td><td>${consulta.usuario || '________________'}</td>
                </tr>
            </table>

            <div class="obs-box">
                <strong>OBSERVAÇÕES:</strong><br>
                ${consulta.observacao || 'Nenhuma observação informada.'}
            </div>

            <table class="products-table">
                <thead>
                    <tr>
                        <th>ID PRODUTO</th>
                        <th style="text-align: left;">NOME DO PRODUTO</th>
                        <th>UNID.</th>
                        <th>QTD. SOLIC.</th>
                        <th>QTD. ENV. (Manual)</th>
                        <th>FILIAL</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhasProdutos}
                </tbody>
            </table>

            <div class="footer">
                <div class="footer-box" style="border-right: none;">SEPARADO POR:<br><br>_________________________________</div>
                <div class="footer-box">CONFERIDO POR:<br><br>_________________________________</div>
            </div>
        </body>
        </html>
    `;
    doc.open();
    doc.write(htmlFinal);
    doc.close();
    // Aguarda carregar e dispara a impressão
    setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
    }, 300);
}
function ligarLoading(mensagem = "Carregando dados...") {
    const overlay = document.getElementById("loading-global");
    if (overlay) {
        const texto = overlay.querySelector("span");
        if (texto)
            texto.textContent = mensagem; // Permite mudar a mensagem (ex: "Salvando pedido...")
        overlay.classList.add("ativo");
    }
}
function desligarLoading() {
    const overlay = document.getElementById("loading-global");
    if (overlay) {
        overlay.classList.remove("ativo");
    }
}
//#endregion
