// Declara o lucide globalmente para o TS não reclamar se você importar via script/CDN
declare const lucide: any;

// 2. Tipamos o estoque como um array de Produtos
let estoque: Produto[] = [];
let produtoEmEspera: Produto | null = null;
let carrinhoDePedidos: Produto[] = [];
let filial: String;

//FUNÇÃO PARA BUSCAR COISAS DO BACK
async function requestBack(caminho: string, metodo: string, dados: unknown): Promise<Response> {
  const opcoes: RequestInit = {
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

//#region INTERFACES
interface Produto {
  id: string | number;
  idProduto: string | number;
  nome: string;
  unidade: string;
  quantidade: number;
}

interface LoginData {
  email: string;
  password: string;
  nome: string | null;
}

interface ProdutosRegistrados {
  id: string | number;
  idProduto: string | number;         // O código visível do produto
  name: string;              // Nome no Java
  undMedida: string;       // Unidade de medida no Java
}
//#endregion

//FUNÇÃO PARA TROCA DE PAGINAS;
function showPage(pageId: string): void {
  document.querySelectorAll(".page-content").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));

  const pageTarget = document.getElementById(pageId + "-page");
  const navTarget = document.getElementById("nav-" + pageId);

  if (pageTarget) pageTarget.classList.add("active");
  if (navTarget) navTarget.classList.add("active");

  const titles: Record<string, string> = {
    dash: "Dashboard",
    "novo-pedido": "Novo Pedido",
    produtos: "Produtos",
  };

  const titleEl = document.getElementById("page-title") as HTMLElement | null;
  if (titleEl) titleEl.innerText = titles[pageId] || "Página";
  carregarProdutos();
  atualizarProdutos();
}

//#region LOGIN
const b_login = document.querySelector("#b-login") as HTMLButtonElement | null;
const user = document.querySelector("#user") as HTMLElement | null;
if (user) {
  user.innerText = sessionStorage.getItem("userName") || "Name";
}
// --- LÓGICA DE LOGIN ---
if (b_login) {
  const loginForm = document.querySelector("form") as HTMLFormElement | null;

  // Tipamos o evento como Event
  const tentarLogin = async (e: Event) => {
    e.preventDefault();

    const emailEl = document.querySelector("#email-login") as HTMLInputElement | null;
    const senhaEl = document.querySelector("#senhaLogin") as HTMLInputElement | null;

    if (emailEl && senhaEl) {
      const loginData: LoginData = {
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
        } else if (resposta.status === 401) {
          alert("Email ou senha incorretos. Tente novamente!");
        } else {
          alert("Erro inesperado no servidor.");
        }
      } catch (erro) {
        console.error("Erro de conexão:", erro);
        alert("Não foi possível conectar ao servidor. Verifique se o Spring Boot está rodando.");
      }
    }
  };

  if (loginForm) {
    loginForm.addEventListener("submit", tentarLogin);
  } else if (b_login) {
    b_login.addEventListener("click", tentarLogin);
  }
}

//#endregion

//#region Funçoes para {PRODUTOS}
function renderProductList(itens: Produto[]): void {
  const container = document.getElementById("global-product-list") as HTMLElement | null;
  if (!container) return;
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
                <button style="border:none; background:none; cursor:pointer; color:#ef4444"  onclick="deleteProduct('${item.id}')"><i data-lucide="trash-2" style="width:16px"></i></button>
            </div>
        `;
    container.appendChild(div);
  });

  if (typeof lucide !== "undefined") lucide.createIcons();
}

function filterProducts(): void {
  const searchEl = document.getElementById("search-product") as HTMLInputElement | null;
  if (!searchEl) return;

  const term = searchEl.value.toLowerCase();
  const filtered = estoque.filter(
    (p) => p.nome.toLowerCase().includes(term) || String(p.id).toLowerCase().includes(term)
  );
  renderProductList(filtered);
}

function openModal(): void {
  const modal = document.getElementById("modal-produto") as HTMLElement | null;
  if (modal) modal.style.display = "flex";
}

function closeModal(): void {
  const modal = document.getElementById("modal-produto") as HTMLElement | null;
  if (modal) modal.style.display = "none";
}

async function carregarProdutos() {
  try {
    const resposta = await requestBack("produto", "GET", null);

    if (resposta.ok) {
      const dadosBack: ProdutosRegistrados[] = await resposta.json();
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
    } else {
      console.error("Deu ruim no back-end. Status:", resposta.status);
    }
  } catch (err) {
    console.error("Erro ao buscar produtos no backend:", err);
  }

}

// Exposto no objeto Window (TypeScript exige isso se você chama a função pelo HTML via onclick)
(window as any).deleteProduct = async function (idDoBanco: string): Promise<void> {
  // 1. Confirmação pro usuário não apagar sem querer (opcional, mas recomendado)
  const querMesmoApagar = confirm("Tem certeza que deseja apagar este produto?");
  if (!querMesmoApagar) return;

  try {
    // 2. Faz a chamada pro Java. 
    // Note que colocamos o ID direto na URL: "produto/15" e usamos "DELETE"
    const resposta = await requestBack("produto/" + idDoBanco, "DELETE", null);

    if (resposta.ok) {
      // 3. Se o Java confirmou que apagou, a gente tira ele da nossa lista local
      estoque = estoque.filter((p) => String(p.id) !== String(idDoBanco));

      // 4. Atualiza a tela
      renderProductList(estoque);

    } else {
      console.error("Erro ao apagar. Status:", resposta.status);
      alert("Não foi possível apagar o produto no banco de dados.");
    }
  } catch (erro) {
    console.error("Erro de conexão ao deletar:", erro);
    alert("Erro de conexão com o servidor.");
  }
};

async function atualizarProdutos() {
  try {
    const resposta = await requestBack("produto", "GET", null);

    if (resposta.ok) {
      const dadosBack: ProdutosRegistrados[] = await resposta.json();
      console.log(dadosBack);
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

    } else {
      console.error("Deu ruim no back-end. Status:", resposta.status);
    }
  } catch (err) {
    console.error("Erro ao buscar produtos no backend:", err);
  }
}

const bAtualizar = document.getElementById("atualizar") as HTMLButtonElement | null; // Corrigido para ButtonElement
if (bAtualizar) {
  bAtualizar.addEventListener("click", async function () {
    atualizarProdutos();
  });
}

const btnNovoProduto = document.getElementById("btn-salvar") as HTMLButtonElement | null;
if (btnNovoProduto) {
  btnNovoProduto.addEventListener("click", async function () {
    const nomeP = document.getElementById("new-prod-name") as HTMLInputElement | null;
    const idP = document.getElementById("new-prod-id") as HTMLInputElement | null;
    const unitP = document.getElementById("new-prod-unit") as HTMLInputElement | null;

    if (nomeP && idP && nomeP.value.trim() !== "" && idP.value.trim() !== "") {
      const produto: Produto = {
        id: idP.value,
        idProduto: idP.value,
        nome: nomeP.value,
        unidade: unitP ? unitP.value : "",
        quantidade: 0
      };

      // Quando for ligar o backend novamente, descomente aqui:
      try {
        const resposta = await requestBack("produto", "POST", {
          idProduto: produto.idProduto,
          name: produto.nome,
          undMedida: produto.unidade
        });
      } catch (err) {
        console.error("Erro ao enviar produto para o backend:", err);
      }

      estoque.push(produto);
      renderProductList(estoque);
      closeModal();

      nomeP.value = "";
      idP.value = "";
      if (unitP) unitP.value = "";
    } else {
      alert("Por favor, preencha pelo menos o Nome e o ID do produto.");
    }
  });
}

//#endregion

//#region {NOVO PEDIDO}
const btAdd = document.getElementById("btn-add-order") as HTMLButtonElement;

const inputProduto = document.getElementById("prod-nome") as HTMLInputElement | null;
const listaSugestoes = document.getElementById("sugestoes-produtos") as HTMLUListElement | null;
const quantValor = document.getElementById("prod-qty") as HTMLInputElement | null;

function configurarDropdownProdutos(): void {
  if (!inputProduto || !listaSugestoes || !quantValor) return;

  // Dispara toda vez que o usuário digita algo no campo de busca
  inputProduto.addEventListener("input", function () {
    const valorDigitado = this.value.toLowerCase();
    listaSugestoes.innerHTML = ""; // Limpa os resultados anteriores

    if (!valorDigitado) {
      listaSugestoes.style.display = "none";
      return;
    }

    // Filtra o array global 'estoque' que veio do seu Java
    const produtosFiltrados = estoque.filter((p) =>
      p.nome.toLowerCase().includes(valorDigitado)
    );

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

          btAdd.style.backgroundColor = '#041033'
          btAdd.disabled = false;
        });
        listaSugestoes.appendChild(li);
      });

      listaSugestoes.style.display = "block"; // Mostra a lista
    } else {
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
const list = document.getElementById("order-items-list") as HTMLElement | null;
document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") lucide.createIcons();
  configurarDropdownProdutos();
  carregarProdutos();

  const btnAddOrder = document.getElementById("btn-add-order") as HTMLButtonElement | null;
  if (btnAddOrder) {
    btnAddOrder.addEventListener("click", () => {
      //#region LATERAL
      const nomeEl = document.getElementById("prod-nome") as HTMLInputElement | null;
      const qtyEl = document.getElementById("prod-qty") as HTMLInputElement | null;

      if (!nomeEl || !qtyEl || !nomeEl.value) return;
      const nome = nomeEl.value;
      const qty = qtyEl.value;

      if (!list) return;

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
      if (typeof lucide !== "undefined") lucide.createIcons();
      //#endregion
      if (!produtoEmEspera) {
        alert("Por favor, pesquise e selecione um produto da lista primeiro!");
        return;
      }
      const inputProduto = document.getElementById("prod-nome") as HTMLInputElement | null;
      const quantValor = document.getElementById("prod-qty") as HTMLInputElement | null;
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

function apagar(idParaRemover: string): void {
  const container = document.getElementById("global-product-list") as HTMLElement | null;
  carrinhoDePedidos = carrinhoDePedidos.filter(produto => String(produto.nome) !== String(idParaRemover));
}

const btnFinalizar = document.getElementById("btn-finalizar") as HTMLButtonElement | null;
if (btnFinalizar) {

  btnFinalizar.addEventListener("click", async () => {
    if (carrinhoDePedidos.length !== 0) {
      const filialSelecionada = document.getElementById("select-filial") as HTMLSelectElement;
      const nomeUsuario = sessionStorage.getItem("userName") || "Name";
      const listaProdutos = carrinhoDePedidos.map(item => {
        return {
          idProduto: item.idProduto,
          name: item.nome,
          undMedida: item.unidade,
          quant: item.quantidade
        }
      })

      const dadosPedido = {
        status: "PENDENTE",
        filial: filialSelecionada.value.toUpperCase().replace("FILIAL ", "").trim(),
        lProdutos: listaProdutos,
        usuario: nomeUsuario
      }
      const divProdutos = document.getElementById("listaProduto") as HTMLDivElement
      const spanProdutos = document.getElementById("spanProduto") as HTMLSpanElement
      const buttonProdutos = document.getElementById("buttonProduto") as HTMLButtonElement

      const resposta = await requestBack("pedido", "POST", dadosPedido);
      console.log(resposta);
      location.reload();
    }
  })
}

//#endregion

//#region DASHBOARD 

const caixaFiliais = document.querySelectorAll('.navFiliais');
caixaFiliais.forEach((botao) => {
  botao.addEventListener('click', () => {
    caixaFiliais.forEach(b => b.classList.remove('ativa'));

    botao.classList.add('ativa');

    const textoFilial = botao.querySelector('i')?.textContent;
    const nomeFilialH2 = document.getElementById("textoNomeFilial") as HTMLElement;

    nomeFilialH2.textContent = 'Pedidos ' + textoFilial;
  })
})

async function produtosLista(numero: Number) {
  const resposta = (await requestBack("pedido/" + numero, "GET", null));
  if(resposta){
    const dadosPedidos = await resposta.json();
    const idPedido = dadosPedidos.id;
    const usuarioPedido = dadosPedidos.usuario;
    const statusPedido = dadosPedidos.status;
    const dataFormatada = new Date(dadosPedidos.dataCriacao).toLocaleString('pt-BR');
    
    const sectionPedidos = document.getElementById()
  }
}

//#endregion