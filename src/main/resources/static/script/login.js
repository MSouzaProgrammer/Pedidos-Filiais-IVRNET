import { requestBack, ligarLoading, desligarLoading } from './funcoes.js';
const b_login = document.querySelector("#b-login");
const user = document.querySelector("#user");
if (b_login) {
    const loginForm = document.querySelector("form");
    const tentarLogin = async (e) => {
        e.preventDefault();
        const emailEl = document.querySelector("#email-login");
        const senhaEl = document.querySelector("#senhaLogin");
        if (emailEl && senhaEl) {
            try {
                ligarLoading();
                const resposta = await requestBack("auth/login", "POST", { email: emailEl.value, password: senhaEl.value });
                if (resposta.ok) {
                    const dadosDoUsuario = await resposta.json();
                    sessionStorage.setItem("token", dadosDoUsuario.token);
                    sessionStorage.setItem("userName", dadosDoUsuario.name);
                    sessionStorage.setItem("userAccess", dadosDoUsuario.access);
                    window.location.href = "index.html";
                    desligarLoading();
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
                alert("Não foi possível conectar ao servidor.");
            }
        }
    };
    if (loginForm)
        loginForm.addEventListener("submit", tentarLogin);
    else
        b_login.addEventListener("click", tentarLogin);
}
if (user) {
    const nomeGuardado = sessionStorage.getItem("userName");
    const tokenGuardado = sessionStorage.getItem("token");
    if (!tokenGuardado)
        window.location.href = "login.html";
    else
        user.innerText = nomeGuardado || "Name";
}
//# sourceMappingURL=login.js.map