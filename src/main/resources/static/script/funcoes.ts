// --- INTERFACES ---
export interface Produto {
  id: string | number;
  idProduto: string | number;
  nome: string;
  unidade: string;
  quantidade: number;
}
export interface LoginData { email: string; password: string; }
export interface ProdutosRegistrados {
  id: string | number;
  idProduto: string | number;
  name: string;
  undMedida: string;
}

// --- VARIÁVEIS GLOBAIS (ESTADO) ---
export let estoque: Produto[] = [];
export function setEstoque(novoEstoque: Produto[]) { estoque = novoEstoque; }

export let produtoEmEspera: Produto | null = null;
export function setProdutoEmEspera(prod: Produto | null) { produtoEmEspera = prod; }

export let carrinhoDePedidos: Produto[] = [];
export function setCarrinhoDePedidos(novoCarrinho: Produto[]) { carrinhoDePedidos = novoCarrinho; }

export let filialNome: string = "";
export function setFilialNome(nome: string) { filialNome = nome; }

export let consultaGlobal: any = null;
export function setConsultaGlobal(consulta: any) { consultaGlobal = consulta; }

// --- FUNÇÕES UTILITÁRIAS ---
export async function requestBack(caminho: string, metodo: string, dados: unknown): Promise<Response> {
  ligarLoading();
  const opcoes: RequestInit = {
    method: metodo,
    headers: { "Content-Type": "application/json" }
  };
  const token = sessionStorage.getItem("token");
  if (token) {
    opcoes.headers = { ...opcoes.headers, "Authorization": `Bearer ${token}` };
  }
  if (dados && metodo.toUpperCase() !== "GET") {
    opcoes.body = JSON.stringify(dados);
  }

  const resposta = await fetch("http://localhost:8080/" + caminho, opcoes);
  desligarLoading();
  return resposta;
}

export function ligarLoading(mensagem: string = "Carregando dados..."): void {
  const overlay = document.getElementById("loading-global");
  if (overlay) {
    const texto = overlay.querySelector("span");
    if (texto) texto.textContent = mensagem;
    overlay.classList.add("ativo");
  }
}

export function desligarLoading(): void {
  const overlay = document.getElementById("loading-global");
  if (overlay) overlay.classList.remove("ativo");
}

export function showPage(pageId: string): void {
  document.querySelectorAll(".page-content").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
  const pageTarget = document.getElementById(pageId + "-page");
  const navTarget = document.getElementById("nav-" + pageId);
  if (pageTarget) pageTarget.classList.add("active");
  if (navTarget) navTarget.classList.add("active");

  const titles: Record<string, string> = { dash: "Dashboard", "novo-pedido": "Novo Pedido", produtos: "Produtos" };
  const titleEl = document.getElementById("page-title") as HTMLElement | null;
  if (titleEl) titleEl.innerText = titles[pageId] || "Página";
}

export function avisoDePermissao() {
  alert("Você não tem permissão de administrador");
}

export function pegarNome(elemento: HTMLElement): string {
  const iElement = elemento.querySelector('i');
  if (iElement) {
    setFilialNome(iElement.innerText);
  }
  return filialNome;
}