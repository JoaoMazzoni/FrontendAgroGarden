document.addEventListener("DOMContentLoaded", function () {
  const tableContainer = document.getElementById("insumosTableContainer");
  const editModal = document.getElementById("editModal");
  const successModal = document.getElementById("successModal");
  const closeModalButton = document.querySelector("#editModal .close");
  const closeSuccessModalButton = successModal.querySelector(".close-button");
  const editForm = document.getElementById("editForm");
  const searchForm = document.getElementById("searchForm");
  const searchIdInput = document.getElementById("searchId");
  const searchNameInput = document.getElementById("searchName");

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

  // Initially hide the success modal
  successModal.style.display = "none";

  // Function to fetch and display active Insumos
  function loadInsumos(queryParams = "") {
    let url = `https://localhost:7165/api/Insumos/`;

    if (queryParams) url += `${encodeURIComponent(queryParams)}`;
    else url += "Ativos";

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
          tableContainer.innerHTML = "<p>Não há insumos ativos no momento.</p>";
          return;
        }

        const table = document.createElement("table");
        table.innerHTML = `
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Função</th>
              <th>Fornecedor</th>
              <th>Data de Validade</th>
              <th>Data de Entrada</th>
              <th>Quantidade de Entrada</th>
              <th>Quantidade Atual</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${
              Array.isArray(data)
                ? data
                    .map(
                      (insumo) => `
                  <tr>
                    <td>${insumo.codigoLote}</td>
                    <td>${insumo.nomeDoInsumo}</td>
                    <td>${insumo.funcao}</td>
                    <td>${insumo.fornecedor.nomeDoFornecedor} - ${
                        insumo.fornecedor.cnpj
                      }</td>
                    <td>${formatDateToDDMMYYYY(insumo.dataValidade)}</td>
                    <td>${formatDateToDDMMYYYY(insumo.dataEntrada)}</td>
                    <td>${insumo.quantidadeEntrada}ml</td>
                    <td>${insumo.mililitrosAtual}ml</td>
                    <td>${insumo.status}</td>
                    <td><i class="fas fa-pencil-alt edit-icon" data-id="${
                      insumo.codigoLote
                    }"></i></td>
                  </tr>`
                    )
                    .join("")
                : `
                  <tr>
                    <td>${data.codigoLote}</td>
                    <td>${data.nomeDoInsumo}</td>
                    <td>${data.funcao}</td>
                    <td>${data.fornecedor.nomeDoFornecedor} - ${
                    data.fornecedor.cnpj
                  }</td>
                    <td>${formatDateToDDMMYYYY(data.dataValidade)}</td>
                    <td>${formatDateToDDMMYYYY(data.dataEntrada)}</td>
                    <td>${data.quantidadeEntrada}ml</td>
                    <td>${data.mililitrosAtual}ml</td>
                    <td>${data.status}</td>
                    <td><i class="fas fa-pencil-alt edit-icon" data-id="${
                      data.codigoLote
                    }"></i></td>
                  </tr>`
            }
          </tbody>
        `;
        tableContainer.innerHTML = "";
        tableContainer.appendChild(table);
      })
      .catch((error) => console.error("Error fetching Insumos:", error));
  }

  // Function to format date to dd/MM/yyyy
  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  // Function to convert date from yyyy-MM-dd to dd/MM/yyyy format for input
  function convertDateForInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  }

  // Function to convert date from yyyy-MM-dd to yyyy-MM-dd format for showing in input
  function convertDateForShow(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Function to show the modal and populate form fields
  function showEditModal(insumo) {
    document.getElementById("editName").value = insumo.nomeDoInsumo;
    document.getElementById("editFuncao").value = insumo.funcao;
    document.getElementById("editDataValidade").value = convertDateForShow(
      insumo.dataValidade
    );
    document.getElementById("mililitros").value = insumo.mililitrosAtual;
    document.getElementById("editId").value = insumo.codigoLote;
    editModal.style.display = "block";
  }

  // Function to handle form submission
  editForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(editForm);
    const id = formData.get("id");

    const dateInput = formData.get("dataValidade");
    // Convert the date to dd/MM/yyyy format for submission
    const formattedDate = convertDateForInput(dateInput);

    const updatedInsumo = {
      nomeDoInsumo: formData.get("nome"),
      funcao: formData.get("tipo"),
      mililitrosAtual: formData.get("mililitros"),
      dataValidade: formattedDate,
      status: formData.get("Status"),
    };

    fetch(`https://localhost:7165/api/Insumos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedInsumo),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.codigoLote) {
          loadInsumos();
          editModal.style.display = "none";
          // Show success modal
          successModal.style.display = "flex"; // Adjust to make the modal visible
        } else {
          alert("Erro ao salvar as alterações.");
        }
      })
      .catch((error) => console.error("Error updating Insumo:", error));
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

  // Load Insumos when the page loads
  loadInsumos();

  // Handle search form submission
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const id = searchIdInput.value.trim();
    let queryParams = "";

    if (id) {
      queryParams = `${id}`;
    }

    loadInsumos(queryParams);
  });

  // Handle row click for editing
  tableContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("edit-icon")) {
      const id = event.target.getAttribute("data-id");
      fetch(`https://localhost:7165/api/Insumos/${id}`)
        .then((response) => response.json())
        .then((data) => showEditModal(data))
        .catch((error) => console.error("Error fetching Insumo:", error));
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
