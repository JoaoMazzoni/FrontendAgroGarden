document.addEventListener("DOMContentLoaded", function () {
  const tableContainer = document.getElementById("produtosTableContainer");
  const editModal = document.getElementById("editModal");
  const successModal = document.getElementById("successModal");
  const closeModalButton = document.querySelector("#editModal .close");
  const closeSuccessModalButton = successModal.querySelector(".close-button");
  const editForm = document.getElementById("editForm");
  const searchForm = document.getElementById("searchForm");
  const searchLoteInput = document.getElementById("searchLote");

  const getUserInfo = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };
  loadProdutos();

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

  // Initially hide the success modal
  successModal.style.display = "none";

  // Function to fetch and display active Produtos
  function loadProdutos(queryParams = "Ativos") {
    const url = `https://localhost:7165/api/Produtos/${queryParams}`;

    fetch(url)
      .then(async (response) => {
        if (response.status === 404) {
          displayErrorModal(await response.text());
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (!data || (Array.isArray(data) && data.length === 0)) {
          tableContainer.innerHTML =
            "<p>Não há produtos ativos no momento.</p>";
          return;
        }

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
                  }</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${produto.valorUnitario}</td>
                <td>${formatDateToDDMMYYYY(produto.dataValidade)}</td>
                <td>${produto.status}</td>
                <td><i class="fas fa-pencil-alt edit-icon" data-id="${
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
              }</td>
                <td>${data.quantidade}</td>
                <td>R$ ${data.valorUnitario}</td>
                <td>${formatDateToDDMMYYYY(data.dataValidade)}</td>
                <td>${data.status}</td>
                <td><i class="fas fa-pencil-alt edit-icon" data-id="${
                  data.lote
                }"></i></td>
              </tr>`
        }
      </tbody>
    `;
        tableContainer.innerHTML = "";
        tableContainer.appendChild(table);
      })
      .catch((error) => displayErrorModal("Não há produtos no momento"));
  }

  // Function to format date to dd/MM/yyyy
  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  // Function to show the modal and populate form fields
  function showEditModal(produto) {
    document.getElementById("editName").value = produto.nomeProduto;
    document.getElementById("editCategoria").value = produto.categoriaProduto;
    document.getElementById("editQuantidade").value = produto.quantidade;
    document.getElementById("editValor").value = produto.valorUnitario;
    document.getElementById("editId").value = produto.lote;

    editModal.style.display = "block";
  }

  // Function to handle form submission
  editForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(editForm);
    const id = formData.get("id");

    const updatedProduto = {
      categoriaProduto: formData.get("categoria"),
      quantidade: formData.get("quantidade"),
      valorUnitario: formData.get("valorUnitario"),
      status: "Ativo",
    };

    fetch(`https://localhost:7165/api/Produtos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduto),
    })
      .then(async (response) => {
        if (!response.ok) {
          const error = await response.text();
          displayErrorModal(error);
          return;
        }

        showSuccessModal();
        loadProdutos();
        editModal.style.display = "none";
      })
      .catch((error) =>
        displayErrorModal("Error updating Produto:", error.message)
      );
  });

  // Close modals when clicking outside or on close button
  closeModalButton.addEventListener("click", function () {
    editModal.style.display = "none";
  });

  closeSuccessModalButton.addEventListener("click", function () {
    successModal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === editModal) {
      editModal.style.display = "none";
    }
    if (event.target === successModal) {
      successModal.style.display = "none"; // Correctly hide the success modal
    }
  });

  // Handle search form submission
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const id = searchLoteInput.value.trim();
    let queryParams = "";

    if (id) {
      queryParams = `${id}`;
    }

    loadProdutos(queryParams);
  });

  // Handle row click for editing
  tableContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("edit-icon")) {
      const id = event.target.getAttribute("data-id");
      fetch(`https://localhost:7165/api/Produtos/${id}`)
        .then(async (response) => await response.json())
        .then((data) => {
          showEditModal(data);
        })
        .catch((error) => displayErrorModal("Error fetching Produto:", error));
    }
  });

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

function showLoading() {
  document.getElementById(
    "produtosTableContainer"
  ).innerHTML = `<div class="loading-mask"><p>Carregando...</p></div>`;
}

function hideLoading() {
  document.querySelector(".loading-mask")?.remove();
}

// Adiciona eventos de fechar popup

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

function showSuccessModal() {
  const modal = document.getElementById("successModal");
  if (modal) {
    modal.style.display = "flex";
  } else {
    console.error("Modal de sucesso não encontrada.");
  }
}

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
