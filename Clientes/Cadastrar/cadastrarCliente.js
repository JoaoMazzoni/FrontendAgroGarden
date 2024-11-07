document.addEventListener("DOMContentLoaded", () => {
  // Função para obter as informações do usuário do localStorage
  const getUserInfo = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  // Verificação se o usuário está autenticado
  const checkAuthentication = () => {
    const user = getUserInfo();
    if (!user) {
      window.location.href = "../../Login/login.html";
    }
    return user;
  };

  // Verificar autenticação
  const user = checkAuthentication();

  if (user) {
    const [firstName, ...lastNameArray] = user.nomeCompleto.split(" ");
    const lastName = lastNameArray.join(" ");
    document.getElementById(
      "username"
    ).textContent = `Olá, ${firstName} ${lastName}`;
    document.getElementById("user-type").textContent = user.tipo;

    document.getElementById(
      "username"
    ).textContent = `Olá, ${firstName} ${lastName}`;
    document.getElementById("user-type").textContent = user.tipo;

    // Função para esconder todos os itens de menu
    const hideAllMenuItems = () => {
      document.querySelectorAll(".top-nav > ul > li").forEach((item) => {
        item.style.display = "none";
      });
    };

    // Mostrar itens específicos para Agricultor
    const showAgricultorMenuItems = () => {
      document.getElementById("plantacao").style.display = "block";
      document.getElementById("colheita").style.display = "block";
      document.getElementById("pragas").style.display = "block";
      document.getElementById("aplicacao-insumos").style.display = "block";
      document.getElementById("insumos").style.display = "block";
      document.getElementById("insumosCadastrar").style.display = "none";
      document.getElementById("insumosDeletar").style.display = "none";
    };

    // Mostrar todos os itens de menu para Administradores
    const showAdminMenuItems = () => {
      document.getElementById("usuarios").style.display = "block";
      document.getElementById("fornecedores").style.display = "block";
      document.getElementById("insumos").style.display = "block";
      document.getElementById("produtos").style.display = "block";
      document.getElementById("vendas").style.display = "block";
      document.getElementById("vendasCadastrar").style.display = "none";
      document.getElementById("vendasDeletar").style.display = "none";
    };

    const showComercialMenuItems = () => {
      document.getElementById("vendas").style.display = "block";
      document.getElementById("clientes").style.display = "block";
      document.getElementById("produtos").style.display = "block";
      document.getElementById("produtosCadastrar").style.display = "none";
      document.getElementById("produtosDeletar").style.display = "none";
      document.getElementById("produtosAtualizar").style.display = "none";
    };

    // Exibir itens de menu com base no tipo de usuário
    if (user.tipo === "Agricultor") {
      hideAllMenuItems();
      showAgricultorMenuItems();
    } else if (user.tipo === "Comercial") {
      hideAllMenuItems();
      showComercialMenuItems();
    } else if (user.tipo === "Administrador") {
      hideAllMenuItems();
      showAdminMenuItems();
    }

    // Inicialmente esconder todos os submenus
    document
      .querySelectorAll(".top-nav > ul > li .submenu")
      .forEach((submenu) => {
        submenu.style.display = "none";
      });

    // Código para mostrar/ocultar submenu
    const menuItems = document.querySelectorAll(".top-nav > ul > li");

    menuItems.forEach((item) => {
      item.addEventListener("mouseover", () => {
        const submenu = item.querySelector(".submenu");
        if (submenu) {
          submenu.style.display = "block";
        }
      });

      item.addEventListener("mouseout", () => {
        const submenu = item.querySelector(".submenu");
        if (submenu) {
          submenu.style.display = "none";
        }
      });
    });
  }

  // Função para buscar o endereço usando o CEP
  function buscarEndereco() {
    const cep = document.getElementById("cep").value;
    if (cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((response) => response.json())
        .then((dados) => {
          if (!dados.erro) {
            document.getElementById("logradouro").value = dados.logradouro;
            document.getElementById("bairro").value = dados.bairro;
            document.getElementById("cidade").value = dados.localidade;
            document.getElementById("estado").value = dados.uf;
          } else {
            alert("CEP não encontrado!");
          }
        })
        .catch((error) => alert("Erro ao buscar endereço: " + error));
    }
  }

  // Função para enviar o formulário
  async function enviarFormulario(event) {
    event.preventDefault(); // Previne o comportamento padrão de envio do formulário

    // Coleta os dados do formulário
    const formData = {
      razaoSocial: document.getElementById("razaoSocial").value,
      cnpj: document.getElementById("cnpj").value,
      telefone: document.getElementById("telefone").value,
      email: document.getElementById("email").value,
      endereco: {
        cep: document.getElementById("cep").value,
        numero: document.getElementById("numero").value,
        complemento: document.getElementById("complemento").value,
      },
    };

    try {
      const response = await fetch("https://localhost:7165/api/Clientes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccessModal(); // Exibe o popup de sucesso
        setTimeout(() => {
          event.target.reset(); // Reseta o formulário
        }, 500); // Ajuste o tempo conforme necessário para coincidir com a duração da animação
      } else {
        const errorText = await response.text();
        displayErrorModal(errorText); // Exibe a mensagem de erro na nova modal
      }
    } catch (error) {
      displayErrorModal("Erro de rede: " + error.message);
    }
  }

  // Função para exibir modal de erro
  function displayErrorModal(message) {
    const errorModal = document.getElementById("errorModal");
    const errorMessage = document.getElementById("errorMessage");
    if (errorModal && errorMessage) {
      errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
      errorModal.style.display = "flex";
    } else {
      alert("Erro: " + message); // Fallback caso o modal não exista
    }
  }

  // Função para exibir modal de sucesso
  function showSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
      modal.style.display = "flex";
    } else {
      console.error("Modal de sucesso não encontrada.");
    }
  }

  // Função para fechar a modal de sucesso
  function closeSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
      modal.style.display = "none";
    } else {
      console.error("Modal de sucesso não encontrada.");
    }
  }

  // Adiciona o evento de clique ao botão de fechar do popup de sucesso
  document
    .querySelector("#successModal .close")
    ?.addEventListener("click", function () {
      closeSuccessModal();
    });

  // Adiciona o evento de clique ao botão de fechar do popup de erro
  document
    .querySelector("#errorModal .close")
    ?.addEventListener("click", function () {
      const errorModal = document.getElementById("errorModal");
      if (errorModal) {
        errorModal.style.display = "none";
      } else {
        console.error("Modal de erro não encontrada.");
      }
    });

  // Adiciona o evento de buscar o endereço ao campo CEP
  document.getElementById("cep").addEventListener("blur", buscarEndereco);

  // Adiciona o evento de envio do formulário
  document
    .getElementById("clienteForm")
    .addEventListener("submit", enviarFormulario);

  // Adicionar funcionalidade de logout
  document.getElementById("logout").addEventListener("click", (event) => {
    event.preventDefault();
    // Limpar informações do localStorage
    localStorage.removeItem("user");

    // Redirecionar para a página de login
    window.location.href = "../../Login/login.html";

    // Garantir que o usuário não possa usar o botão "Voltar" do navegador
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
  });
});
