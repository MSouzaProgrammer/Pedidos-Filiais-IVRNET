let estoque = [];

const b_login = document.querySelector("#b-login");
const user = document.querySelector("#user");

if (user) {
  user.innerText = sessionStorage.getItem("userName") || "Name";
}

if (b_login) {
  const loginForm = document.querySelector("form");

  // Adicionamos o 'async' aqui
  const tentarLogin = async (e) => {
    e.preventDefault();

    const emailEl = document.querySelector("#email-login");
    const senhaEl = document.querySelector("#senhaLogin");

    if (emailEl && senhaEl) {
      // 1. Prepara os dados para enviar pro Spring Boot
      // Lembre-se que as chaves devem ter o mesmo nome dos atributos na classe User (Java)
      const loginData = {
        email: emailEl.value,
        password: senhaEl.value,
        nome: null,
      };

      try {
        // 2. Faz a chamada para o back-end
        const resposta = await fetch("http://localhost:8080/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        });

        // 3. Verifica a resposta do servidor
        if (resposta.ok) {
          // 1. Extrai o JSON que o Java enviou
          const dadosDoUsuario = await resposta.json();

          // 2. Pega o nome de dentro do JSON (usando a mesma chave "nome" que colocamos no Java)
          const nomeReal = dadosDoUsuario.nome;

          // 3. Salva no SessionStorage
          sessionStorage.setItem("userName", nomeReal);
          

          // 4. Redireciona para a página principal
          window.location.href = "index.html";
        } else if (resposta.status === 401) {
          alert("Email ou senha incorretos. Tente novamente!");
        } else {
          alert("Erro inesperado no servidor.");
        }
      } catch (erro) {
        console.error("Erro de conexão:", erro);
        alert(
          "Não foi possível conectar ao servidor. Verifique se o Spring Boot está rodando.",
        );
      }
    }
  };

  if (loginForm) {
    loginForm.addEventListener("submit", tentarLogin);
  } else {
    b_login.addEventListener("click", tentarLogin);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  renderProductList(estoque);

  const btnAddOrder = document.getElementById("btn-add-order");
  if (btnAddOrder) {
    btnAddOrder.addEventListener("click", () => {
      const nome = document.getElementById("prod-nome").value;
      const qty = document.getElementById("prod-qty").value;
      if (!nome) return;

      const list = document.getElementById("order-items-list");
      const li = document.createElement("li");
      li.style =
        "display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f1f5f9; align-items:center";
      li.innerHTML = `
                <div><span style="font-size:14px; font-weight:600">${nome}</span></div>
                <div style="display:flex; align-items:center; gap:12px">
                    <span style="background:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:700">${qty} un</span>
                    <button style="border:none; background:none; color:#ef4444; cursor:pointer" onclick="this.parentElement.parentElement.remove()"><i data-lucide="trash-2" style="width:16px"></i></button>
                </div>
            `;
      list.appendChild(li);
      lucide.createIcons();
    });
  }
});

function showPage(pageId) {
  document
    .querySelectorAll(".page-content")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
  document.getElementById(pageId + "-page").classList.add("active");
  document.getElementById("nav-" + pageId).classList.add("active");
  const titles = {
    dash: "Dashboard",
    "novo-pedido": "Novo Pedido",
    produtos: "Produtos",
  };
  document.getElementById("page-title").innerText = titles[pageId];
}

function renderProductList(itens) {
  const container = document.getElementById("global-product-list");
  if (!container) return;
  container.innerHTML = "";
  itens.forEach((item) => {
    const div = document.createElement("div");
    div.className = "product-list-item";
    div.innerHTML = `
            <span style="font-weight:700; color:var(--text-muted)">${item.id}</span>
            <span style="font-weight:600">${item.nome}</span>
            <span style="color:var(--text-muted)">${item.unidade}</span>
            <div style="text-align:right">
                <button style="border:none; background:none; cursor:pointer; color:var(--text-muted); margin-right:8px"><i data-lucide="edit" style="width:16px"></i></button>
                <button style="border:none; background:none; cursor:pointer; color:#ef4444" onclick="deleteProduct('${item.id}')"><i data-lucide="trash-2" style="width:16px"></i></button>
            </div>
        `;
    container.appendChild(div);
  });
  lucide.createIcons();
}

function filterProducts() {
  const term = document.getElementById("search-product").value.toLowerCase();
  const filtered = estoque.filter(
    (p) =>
      p.nome.toLowerCase().includes(term) || p.id.toLowerCase().includes(term),
  );
  renderProductList(filtered);
}

function openModal() {
  document.getElementById("modal-produto").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal-produto").style.display = "none";
}

function saveProduct() {
  const nome = document.getElementById("new-prod-name").value;
  const id = document.getElementById("new-prod-id").value;
  const unit = document.getElementById("new-prod-unit").value;
  if (nome && id) {
    estoque.push({ id, nome, unidade: unit });
    renderProductList(estoque);
    closeModal();
    document.getElementById("new-prod-name").value = "";
    document.getElementById("new-prod-id").value = "";
  }
}

function deleteProduct(id) {
  estoque = estoque.filter((p) => p.id !== id);
  renderProductList(estoque);
}
