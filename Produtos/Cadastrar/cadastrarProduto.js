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

  // Função para carregar colheitas baseados no tipo de insumo
  async function carregarColheitaPorTipo(tipoColheita) {
    try {
      const response = await fetch(
        `https://localhost:7165/api/Colheitas/concluida`
      );

      if (response.ok) {
        const colheitas = await response.json();

        if (Array.isArray(colheitas) && colheitas.length > 0) {
          preencherDropdownColheita(
            colheitas.filter((x) => tipoColheita.includes(x.plantacao.tipo))
          );
        } else {
          displayErrorModal("Nenhuma colheita disponível.");
          document.getElementById("colheitaId").innerHTML =
            '<option value="">Nenhuma colheita concluida</option>';
        }
      } else {
        const errorMessage = await response.text();
        displayErrorModal("Erro ao carregar colheitas: " + errorMessage);
      }
    } catch (error) {
      displayErrorModal("Erro ao se conectar ao servidor: " + error.message);
    }
  }

  // Função para preencher o dropdown de colheitas
  function preencherDropdownColheita(colheitas) {
    const colheitaSelect = document.getElementById("colheitaId");
    colheitaSelect.innerHTML =
      '<option value="">Selecione uma colheita</option>'; // Reseta o dropdown

    colheitas.forEach((colheita) => {
      if (colheita.numeroRegistro && colheita.plantacao.id) {
        // Verifica se os dados existem
        const option = document.createElement("option");
        option.value = colheita.numeroRegistro;
        option.textContent = `${
          colheita.plantacao.nome
        } - Data de colheita: ${dataFormatada(colheita.dataColheita)}`;
        colheitaSelect.appendChild(option);
      } else {
        displayErrorModal("Colheita com dados incompletos:", colheita);
      }
    });
  }

  // Função para enviar o formulário de insumos
  async function enviarFormulario(event) {
    event.preventDefault(); // Previne o comportamento padrão de envio do formulário

    const formData = {
      categoriaProduto: document.getElementById("categoriaDoProduto").value,
      colheitaOrigem: document.getElementById("colheitaId").value,
      valorUnitario: document.getElementById("produtoValor").value,
    };

    try {
      const response = await fetch("https://localhost:7165/api/Produtos", {
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
      displayErrorModal("Modal de sucesso não encontrada.");
    }
  }

  // Fecha modal de sucesso
  function closeSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
      modal.style.display = "none";
    } else {
      displayErrorModal("Modal de sucesso não encontrada.");
    }
  }

  // Carrega colheitas quando o tipo de insumo é selecionado
  document
    .getElementById("categoriaDoProduto")
    .addEventListener("change", (event) => {
      const tipoColheita = event.target.value;
      if (tipoColheita !== "Selecione uma categoria") {
        carregarColheitaPorTipo(tipoColheita);
      } else {
        document.getElementById("categoriaDoProduto").innerHTML =
          '<option value="">Selecione uma categoria</option>';
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
    .getElementById("produtoForm")
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
