"use strict";
// 2. Tipamos o estoque como um array de Produtos
let estoque = [];
// Tipamos os elementos do DOM
const b_login = document.querySelector("#b-login");
const user = document.querySelector("#user");
if (user) {
    user.innerText = sessionStorage.getItem("userName") || "Name";
}
// Tipamos os parâmetros da função e o retorno como Promise<Response>
async function requestBack(caminho, metodo, dados) {
    const opcoes = {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
        },
    };
    if (dados && metodo.toUpperCase() !== "GET") {
        opcoes.body = JSON.stringify(dados);
    }
    const resposta = await fetch("http://localhost:8080/" + caminho, opcoes);
    return resposta;
}
// --- LÓGICA DE LOGIN ---
if (b_login) {
    const loginForm = document.querySelector("form");
    // Tipamos o evento como Event
    const tentarLogin = async (e) => {
        e.preventDefault();
        const emailEl = document.querySelector("#email-login");
        const senhaEl = document.querySelector("#senhaLogin");
        if (emailEl && senhaEl) {
            const loginData = {
                email: emailEl.value,
                password: senhaEl.value,
                nome: null,
            };
            try {
                const resposta = await requestBack("users/login", "POST", loginData);
                if (resposta.ok) {
                    const dadosDoUsuario = await resposta.json();
                    const nomeReal = dadosDoUsuario.nome;
                    sessionStorage.setItem("userName", nomeReal);
                    window.location.href = "index.html";
                }
                else if (resposta.status === 401) {
                    alert("Email ou senha incorretos. Tente novamente!");
                }
                else {
                    alert("Erro inesperado no servidor.");
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
// --- LÓGICA DO DASHBOARD E PRODUTOS ---
document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== "undefined")
        lucide.createIcons();
    renderProductList(estoque);
    const btnAddOrder = document.getElementById("btn-add-order");
    if (btnAddOrder) {
        btnAddOrder.addEventListener("click", () => {
            const nomeEl = document.getElementById("prod-nome");
            const qtyEl = document.getElementById("prod-qty");
            if (!nomeEl || !qtyEl || !nomeEl.value)
                return;
            const nome = nomeEl.value;
            const qty = qtyEl.value;
            const list = document.getElementById("order-items-list");
            if (!list)
                return;
            const li = document.createElement("li");
            li.style.cssText = "display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f1f5f9; align-items:center";
            li.innerHTML = `
                <div><span style="font-size:14px; font-weight:600">${nome}</span></div>
                <div style="display:flex; align-items:center; gap:12px">
                    <span style="background:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:700">${qty} un</span>
                    <button style="border:none; background:none; color:#ef4444; cursor:pointer" onclick="this.parentElement?.parentElement?.remove()"><i data-lucide="trash-2" style="width:16px"></i></button>
                </div>
            `;
            list.appendChild(li);
            if (typeof lucide !== "undefined")
                lucide.createIcons();
        });
    }
});
// Parâmetro pageId tipado como string
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
}
// Recebe o array tipado
function renderProductList(itens) {
    const container = document.getElementById("global-product-list");
    if (!container)
        return;
    container.innerHTML = "";
    itens.forEach((item) => {
        const div = document.createElement("div");
        div.className = "product-list-item";
        div.innerHTML = `
            <span style="font-weight:700; color:var(--text-muted)">${item.idProduto}</span>
            <span style="font-weight:600">${item.nome}</span>
            <span style="color:var(--text-muted)">${item.unidade}</span>
            <div style="text-align:right">
                <button style="border:none; background:none; cursor:pointer; color:var(--text-muted); margin-right:8px"><i data-lucide="edit" style="width:16px"></i></button>
                <button style="border:none; background:none; cursor:pointer; color:#ef4444" onclick="deleteProduct('${item.id}')"><i data-lucide="trash-2" style="width:16px"></i></button>
            </div>
        `;
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
    if (modal)
        modal.style.display = "none";
}
// Parâmetro tipado
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
            console.log(dadosBack);
            // Atualiza a variável (lembre-se que tem que ser "let estoque" lá no topo)
            estoque = dadosBack.map((itemDoJava) => {
                return {
                    id: String(itemDoJava.id),
                    idProduto: String(itemDoJava.idProduto), // Transforma número em texto, caso o Java mande número
                    nome: String(itemDoJava.name),
                    unidade: String(itemDoJava.undMedida)
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
const attProdutos = document.getElementById("nav-produtos");
if (attProdutos) {
    attProdutos.addEventListener("click", async function () {
        atualizarProdutos();
    });
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
            };
            // Quando for ligar o backend novamente, descomente aqui:
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
