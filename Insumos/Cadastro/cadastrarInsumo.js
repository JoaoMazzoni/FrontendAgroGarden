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

  function dataFormatada(dataValidade) {
    date = new Date(dataValidade);
    day = String(date.getUTCDate()).padStart(2, "0");
    mes = (date.getMonth() + 1).toString(); //+1 pois no getMonth Janeiro começa com zero.
    mesF = mes.length == 1 ? "0" + mes : mes;
    anoF = date.getFullYear();
    return day + "/" + mesF + "/" + anoF;
  }

  // Função para carregar fornecedores baseados no tipo de insumo
  async function carregarFornecedoresPorTipo(tipo) {
    try {
      const response = await fetch(
        `https://localhost:7165/api/Fornecedores/Ativos/tipo/${tipo}`
      );

      if (response.ok) {
        const fornecedores = await response.json();

        if (Array.isArray(fornecedores) && fornecedores.length > 0) {
          preencherDropdownFornecedores(fornecedores);
        } else {
          displayErrorModal(
            "Nenhum fornecedor disponível para este tipo de insumo."
          );
          document.getElementById("fornecedorCnpj").innerHTML =
            '<option value="">Nenhum fornecedor disponível</option>';
        }
      } else {
        const errorMessage = await response.text();
        displayErrorModal("Não foi possível carregar os fornecedores: " + errorMessage);
      }
    } catch (error) {
      displayErrorModal("Erro ao se conectar ao servidor: " + error.message);
    }
  }

  // Função para preencher o dropdown de fornecedores
  function preencherDropdownFornecedores(fornecedores) {
    const fornecedorSelect = document.getElementById("fornecedorCnpj");
    fornecedorSelect.innerHTML =
      '<option value="">Selecione um fornecedor</option>'; // Reseta o dropdown

    fornecedores.forEach((fornecedor) => {
      if (fornecedor.cnpj && fornecedor.nomeDoFornecedor) {
        // Verifica se os dados existem
        const option = document.createElement("option");
        option.value = fornecedor.cnpj;
        option.textContent = `${fornecedor.nomeDoFornecedor} - CNPJ: ${fornecedor.cnpj}`;
        fornecedorSelect.appendChild(option);
      } else {
        console.error("Fornecedor com dados incompletos:", fornecedor);
      }
    });
  }

  // Função para enviar o formulário de insumos
  async function enviarFormulario(event) {
    event.preventDefault(); // Previne o comportamento padrão de envio do formulário

    const data = document.getElementById("dataValidade").value;

    const formData = {
      nomeDoInsumo: document.getElementById("nomeDoInsumo").value,
      funcao: document.getElementById("funcao").value,
      fornecedorCNPJ: document.getElementById("fornecedorCnpj").value,
      quantidadeEntrada: document.getElementById("mililitros").value,
      dataValidade: dataFormatada(data),
      status: document.getElementById("status").value,
    };

    try {
      const response = await fetch("https://localhost:7165/api/Insumos", {
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
        }, 500);
      } else {
        const errorText = await response.text();
        displayErrorModal(errorText); // Exibe a mensagem de erro na nova modal
      }
    } catch (error) {
      displayErrorModal("Erro de rede: " + error.message);
    }
  }

  // Exibe modal de sucesso
  function showSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
      modal.style.display = "flex";
    } else {
      console.error("Modal de sucesso não encontrada.");
    }
  }

  // Fecha modal de sucesso
  function closeSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
      modal.style.display = "none";
    } else {
      console.error("Modal de sucesso não encontrada.");
    }
  }

  // Carrega fornecedores quando o tipo de insumo é selecionado
  document.getElementById("funcao").addEventListener("change", (event) => {
    const tipoInsumo = event.target.value;
    if (tipoInsumo) {
      carregarFornecedoresPorTipo(tipoInsumo);
    } else {
      document.getElementById("fornecedorCNPJ").innerHTML =
        '<option value="">Selecione um fornecedor</option>';
    }
  });

  // Adiciona eventos de fechar popup
  document
    .querySelector("#successModal .close")
    ?.addEventListener("click", closeSuccessModal);
  document
    .querySelector("#errorModal .close")
    ?.addEventListener("click", function () {
      document.getElementById("errorModal").style.display = "none";
    });

  // Envio do formulário
  document
    .getElementById("insumoForm")
    .addEventListener("submit", enviarFormulario);

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
});
