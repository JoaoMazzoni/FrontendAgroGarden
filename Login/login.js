document.addEventListener("DOMContentLoaded", function () {
  const togglePassword = document.getElementById("togglePassword");
  const passwordField = document.getElementById("password");
  const form = document.getElementById("loginForm");
  const submitButton = document.getElementById("submitButton");
  const errorModal = document.getElementById("errorModal");
  const closeModal = document.querySelector(".modal .close");
  const errorMessageElement = document.getElementById("errorMessage");

  // Função para alternar a visibilidade da senha e os ícones
  togglePassword.addEventListener("click", function () {
    const type =
      passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);

    // Alterna entre ícones de planta e árvore
    if (type === "text") {
      this.classList.remove("fa-seedling");
      this.classList.add("fa-tree");
      this.classList.add("show");
      this.classList.remove("hide");
    } else {
      this.classList.remove("fa-tree");
      this.classList.add("fa-seedling");
      this.classList.add("hide");
      this.classList.remove("show");
    }
  });

  // Função para lidar com o envio do formulário
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitButton.classList.add("loading");

    const cpf = document.getElementById("cpf").value;
    const password = passwordField.value;

    try {
      const response = await fetch("https://localhost:7165/api/Usuarios/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpf, Senha: password }),
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem("user", JSON.stringify(userData));
        window.location.href = "../Menu/menu.html";
      } else {
        const errorData = await response.json(); // Mudança para json para capturar mensagem específica
        let errorMessage = "Ocorreu um erro desconhecido.";
        errorMessageElement.textContent = errorMessage;
        errorModal.style.display = "block"; // Exibe a modal
        submitButton.classList.remove("loading");
      }
    } catch (error) {
      errorMessageElement.textContent =
        "Usuário e senha incorretos. Por favor, tente novamente.";
      errorModal.style.display = "block"; // Exibe a modal
      submitButton.classList.remove("loading");
    }
  });

  // Fechar a modal ao clicar no botão de fechar
  closeModal.addEventListener("click", function () {
    errorModal.style.display = "none";
  });

  // Fechar a modal ao clicar fora dela
  window.addEventListener("click", function (event) {
    if (event.target === errorModal) {
      errorModal.style.display = "none";
    }
  });
});
