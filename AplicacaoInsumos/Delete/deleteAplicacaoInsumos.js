document.addEventListener("DOMContentLoaded", function () {
  const tableContainer = document.getElementById("aplicacoesTableContainer");
  const confirmModal = document.getElementById("confirmModal");
  const confirmButton = confirmModal.querySelector(".confirm-button");
  const cancelButton = confirmModal.querySelector(".cancel-button");
  const successModal = document.getElementById("successModal");
  const closeSuccessModalButton = successModal.querySelector(".close-button");
  const searchForm = document.getElementById("searchForm");
  const searchIdInput = document.getElementById("searchId");

  let currentAplicacaoId = null;

  successModal.style.display = "none";

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
    // Obtém o primeiro nome do usuário
    const firstName = user.nomeCompleto.split(" ")[0];
    const lastName = user.nomeCompleto.split(" ").pop();
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

  // Função para carregar os aplicacoes
  function loadAplicacoes(queryParams) {
    let url = `https://localhost:7165/api/AplicacaoInsumos/`;

    if (queryParams) url += `${encodeURIComponent(queryParams)}`;
    else url += "aplicado";

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        if (!data || (Array.isArray(data) && data.length === 0)) {
          tableContainer.innerHTML =
            "<p>Não há infestações ativos no momento.</p>";
          return;
        }
        renderAplicacoesTable(data);
      })
      .catch((error) => {
        displayErrorModal("Erro ao buscar aplicacoes:", error);
        tableContainer.innerHTML = `<p class="no-data-message">Nenhum aplicacao encontrada.</p>`;
      });
  }

  function displayErrorModal(message) {
    const errorModal = document.getElementById("errorModal");
    const errorMessage = document.getElementById("errorMessage");
    if (errorModal && errorMessage) {
      errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
      errorModal.style.display = "flex";
    } else {
      displayErrorModal("Erro: " + message); // Fallback caso o modal não exista
    }
  }

  // Função para renderizar a tabela de infestacao
  function renderAplicacoesTable(data) {
    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Id da Aplicação</th>
          <th>Nome da Plantação</th>
          <th>Tipo da Plantação</th>
          <th>Nome do Insumo</th>
          <th>Nome do Fornecedor</th>
          <th>Validade do Insumo</th>
          <th>Tipo</th>
          <th>Quantidade</th>
          <th>Data de Aplicação</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${
          Array.isArray(data)
            ? data
                .map(
                  (infestacao) => `
              <tr>
                <td>${infestacao.registro}</td>
                <td>${infestacao.plantacao.nome}</td>
                <td>${infestacao.plantacao.tipo}</td>
                <td>${infestacao.insumo.nomeDoInsumo}</td>
                <td>${
                  infestacao.insumo.fornecedor
                    ? infestacao.insumo.fornecedor.nomeDoFornecedor
                    : "Não Especificado"
                }</td>
                <td>${formatDateToDDMMYYYY(infestacao.insumo.dataValidade)}</td>
                <td>${infestacao.tipo}</td>
                <td>${infestacao.quantidade}</td>
                <td>${formatDateToDDMMYYYY(infestacao.dataAplicacao)}</td>
                <td>${infestacao.status}</td>
                <td><i class="fas fa-trash-alt delete-icon" data-id="${
                  infestacao.registro
                }"></i></td>
              </tr>`
                )
                .join("")
            : `
              <tr>
                <td>${data.registro}</td>
                <td>${data.plantacao.nome}</td>
                <td>${data.plantacao.tipo}</td>
                <td>${data.insumo.nomeDoInsumo}</td>
                <td>${data.insumo.fornecedor.nomeDoFornecedor}</td>
                <td>${data.insumo.dataValidade}</td>
                <td>${data.tipo}</td>
                <td>${data.quantidade}</td>
                <td>${formatDateToDDMMYYYY(data.dataAplicacao)}</td>
                <td>${data.status}</td>
                <td><i class="fas fa-trash-alt delete-icon" data-id="${
                  data.registro
                }"></i></td>
              </tr>`
        }
      </tbody>
    `;

    tableContainer.innerHTML = "";
    tableContainer.appendChild(table);

    // Adicionar eventos de clique para os ícones de lixeira
    const deleteIcons = document.querySelectorAll(".delete-icon");
    deleteIcons.forEach((icon) => {
      icon.addEventListener("click", function () {
        currentAplicacaoId = this.getAttribute("data-id");
        openConfirmModal();
      });
    });
  }

  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  function openConfirmModal() {
    confirmModal.style.display = "flex";
  }

  function closeConfirmModal() {
    confirmModal.style.display = "none";
    currentAplicacaoId = null;
  }

  // Quando o botão de confirmação for clicado
  confirmButton.addEventListener("click", function () {
    if (currentAplicacaoId) {
      fetch(
        `https://localhost:7165/api/AplicacaoInsumos/${currentAplicacaoId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then((response) => {
        if (!response.ok) {
          displayErrorModal("Erro ao deletar aplicacao.");
        }
        return response.json();
      });

      closeConfirmModal(); // Fechar a modal de confirmação
      successModal.style.display = "flex"; // Mostrar a modal de sucesso

      closeSuccessModalButton.addEventListener("click", function () {
        successModal.style.display = "none";
        location.reload(); // Recarregar a página após fechar a modal de sucesso
      });

      displayErrorModal("Nenhum ID de aplicacao selecionado.");
    }
  });

  // Cancelar modal de confirmação
  cancelButton.addEventListener("click", closeConfirmModal);

  // Fechar a modal de sucesso ao clicar fora dela
  window.addEventListener("click", function (event) {
    if (event.target === confirmModal) {
      closeConfirmModal();
    }
    if (event.target === successModal) {
      successModal.style.display = "none";
    }
  });

  // Fechar a modal de sucesso ao clicar no botão de fechar
  closeSuccessModalButton.addEventListener("click", function () {
    successModal.style.display = "none";
  });

  // Função de busca
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const id = searchIdInput.value.trim();
    let queryParams = "";

    const idInsumo = document.getElementById("searchIdInsumo").value.trim();
    const idPlantacao = document
      .getElementById("searchIdPlantacao")
      .value.trim();
    const idRegistro = document.getElementById("searchIdRegistro").value.trim();

    if (idInsumo) {
      queryParams = `insumo/${encodeURIComponent(idInsumo)}`;
    } else if (idPlantacao) {
      queryParams = `plantacao/${encodeURIComponent(idPlantacao)}`;
    } else if (idRegistro) {
      queryParams = `${encodeURIComponent(idRegistro)}`;
    }

    loadAplicacoes(queryParams);
  });

  // Logout
  document.getElementById("logout").addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("user");
    window.location.href = "../../Login/login.html";
  });

  // Carregar aplicacoes ao iniciar
  loadAplicacoes();
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
