document.addEventListener("DOMContentLoaded", function () {
  const tableContainer = document.getElementById("produtosTableContainer");
  const confirmModal = document.getElementById("confirmModal");
  const confirmButton = confirmModal.querySelector(".confirm-button");
  const cancelButton = confirmModal.querySelector(".cancel-button");
  const successModal = document.getElementById("successModal");
  const closeSuccessModalButton = successModal.querySelector(".close-button");
  const searchForm = document.getElementById("searchForm");
  const searchLoteInput = document.getElementById("searchLote");

  let currentProdutoId = null;

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

  // Função para carregar os produtos
  function loadProdutos(queryParams = "") {
    let url = `https://localhost:7165/api/Produtos/`;

    if (queryParams) url += `${encodeURIComponent(queryParams)}`;
    else url += "ativos";

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
            "<p>Não há produtos ativos no momento.</p>";
          return;
        }
        renderProdutosTable(data);
      })
      .catch((error) => {
        displayErrorModal("Erro ao buscar produtos:", error);
        tableContainer.innerHTML = `<p class="no-data-message">Nenhum produto encontrado.</p>`;
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

  // Função para renderizar a tabela de produtos
  function renderProdutosTable(data) {
    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Lote</th>
          <th>Nome do Produto</th>
          <th>Categoria</th>
          <th>Colheita</th>
          <th>Quantidade</th>
          <th>Valor Unitário</th>
          <th>Data de Validade</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${
          Array.isArray(data)
            ? data
                .map(
                  (produto) => `
              <tr>
                <td>${produto.lote}</td>
                <td>${produto.nomeProduto}</td>
                <td>${produto.categoriaProduto}</td>
                <td>${produto.colheitaOrigem.numeroRegistro} - ${
                    produto.nomeProduto
                  } | ${
                    produto.colheitaOrigem.plantacao ||
                    "Plantação não especificada"
                  }</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${produto.valorUnitario}</td>
                <td>${formatDateToDDMMYYYY(produto.dataValidade)}</td>
                <td>${produto.status}</td>
                <td><i class="fas fa-trash-alt delete-icon" data-id="${
                  produto.lote
                }"></i></td>
              </tr>`
                )
                .join("")
            : `
              <tr>
                <td>${data.lote}</td>
                <td>${data.nomeProduto}</td>
                <td>${data.categoriaProduto}</td>
                <td>${data.colheitaOrigem.numeroRegistro} - ${
                data.nomeProduto
              } | ${
                data.colheitaOrigem.plantacao || "Plantação não especificada"
              }</td>
                <td>${data.quantidade}</td>
                <td>R$ ${data.valorUnitario}</td>
                <td>${formatDateToDDMMYYYY(data.dataValidade)}</td>
                <td>${data.status}</td>
                <td><i class="fas fa-trash-alt delete-icon" data-id="${
                  data.lote
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
        currentProdutoId = this.getAttribute("data-id");
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
    currentProdutoId = null;
  }

  // Quando o botão de confirmação for clicado
  confirmButton.addEventListener("click", function () {
    if (currentProdutoId) {
      fetch(`https://localhost:7165/api/Produtos/${currentProdutoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao deletar produto.");
        }
        return response.json();
      });

      closeConfirmModal(); // Fechar a modal de confirmação
      successModal.style.display = "flex"; // Mostrar a modal de sucesso

      closeSuccessModalButton.addEventListener("click", function () {
        successModal.style.display = "none";
        location.reload(); // Recarregar a página após fechar a modal de sucesso
      });

      console.error("Nenhum ID de produto selecionado.");
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
    const id = searchLoteInput.value.trim();
    let queryParams = "";

    if (id) {
      queryParams = `${id}`;
    }

    loadProdutos(queryParams);
  });

  // Logout
  document.getElementById("logout").addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("user");
    window.location.href = "../../Login/login.html";
  });

  // Carregar produtos ao iniciar
  loadProdutos();
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
