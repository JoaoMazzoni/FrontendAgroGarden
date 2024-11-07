document.addEventListener("DOMContentLoaded", function () {
  const tableContainer = document.getElementById("plantacoesTableContainer");
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

  // Function to fetch and display active plantacoes
  function loadPlantacoes(queryParams = "") {
    const url = `https://localhost:7165/api/Plantacoes/Ativas${queryParams}`;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) {
          displayErrorModal(await response.text());
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (!data || (Array.isArray(data) && data.length === 0)) {
          tableContainer.innerHTML =
            "<p>Não há plantações ativas no momento.</p>";
          return;
        }

        const table = document.createElement("table");
        table.innerHTML = `
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Local de Plantio</th>
                            <th>Data de Plantio</th>
                            <th>Irrigação</th>
                            <th>Luz Solar</th>
                            <th>Condição Climática</th>
                            <th>Crescimento</th>
                            <th>Colheita</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          Array.isArray(data)
                            ? data
                                .map(
                                  (plantacao) => `
                            <tr>
                                <td>${plantacao.id}</td>
                                <td>${plantacao.nome}</td>
                                <td>${plantacao.tipo}</td>
                                <td>${plantacao.localDePlantio}</td>
                                <td>${formatDateToDDMMYYYY(
                                  plantacao.dataDePlantio
                                )}</td>
                                <td>${plantacao.irrigacao}</td>
                                <td>${plantacao.luzSolar}</td>
                                <td>${plantacao.condicaoClimatica}</td>
                                <td>${plantacao.crescimento}</td>
                                <td>${plantacao.colheita}</td>
                                <td>${plantacao.status}</td>
                                <td><i class="fas fa-pencil-alt edit-icon" data-id="${
                                  plantacao.id
                                }"></i></td>
                            </tr>
                        `
                                )
                                .join("")
                            : `
                            <tr>
                                <td>${data.id}</td>
                                <td>${data.nome}</td>
                                <td>${data.tipo}</td>
                                <td>${data.localDePlantio}</td>
                                <td>${formatDateToDDMMYYYY(
                                  data.dataDePlantio
                                )}</td>
                                <td>${data.irrigacao}</td>
                                <td>${data.luzSolar}</td>
                                <td>${data.condicaoClimatica}</td>
                                <td>${data.crescimento}</td>
                                <td>${data.colheita}</td>
                                <td>${data.status}</td>
                                <td><i class="fas fa-pencil-alt edit-icon" data-id="${
                                  data.id
                                }"></i></td>
                            </tr>
                        `
                        }
                    </tbody>
                `;
        tableContainer.innerHTML = "";
        tableContainer.appendChild(table);
      })
      .catch((error) => console.error("Error fetching plantacoes:", error));
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
  function showEditModal(plantacao) {
    document.getElementById("editName").value = plantacao.nome;
    document.getElementById("editTipo").value = plantacao.tipo;
    document.getElementById("editLocal").value = plantacao.localDePlantio;
    document.getElementById("editData").value = convertDateForShow(
      plantacao.dataDePlantio
    );
    document.getElementById("editIrrigacao").value = plantacao.irrigacao;
    document.getElementById("editLuzSolar").value = plantacao.luzSolar;
    document.getElementById("editCondicao").value = plantacao.condicaoClimatica;
    document.getElementById("editCrescimento").value = plantacao.crescimento;
    document.getElementById("editId").value = plantacao.id;
    editModal.style.display = "block";
  }

  // Function to handle form submission
  editForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(editForm);
    const id = formData.get("id");

    const dateInput = formData.get("dataDePlantio");
    // Convert the date to dd/MM/yyyy format for submission
    const formattedDate = convertDateForInput(dateInput);

    const updatedPlantacao = {
      nome: formData.get("nome"),
      tipo: formData.get("tipo"),
      localDePlantio: formData.get("localDePlantio"),
      dataDePlantio: formattedDate, // Use the correct format here
      irrigacao: formData.get("irrigacao"),
      luzSolar: formData.get("luzSolar"),
      condicaoClimatica: formData.get("condicaoClimatica"),
      crescimento: formData.get("crescimento"),
    };

    fetch(`https://localhost:7165/api/Plantacoes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedPlantacao),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.id) {
          loadPlantacoes();
          editModal.style.display = "none";
          // Show success modal
          successModal.style.display = "flex"; // Adjust to make the modal visible
        } else {
          displayErrorModal("Erro ao salvar as alterações.");
        }
      })
      .catch((error) => console.error("Error updating plantacao:", error));
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

  // Load plantacoes when the page loads
  loadPlantacoes();

  // Handle search form submission
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const id = searchIdInput.value.trim();
    const name = searchNameInput.value.trim();
    let queryParams = "";

    if (id) {
      queryParams = `/Id/${id}`;
    } else if (name) {
      queryParams = `/Nome/${encodeURIComponent(name)}`;
    }

    loadPlantacoes(queryParams);
  });

  // Handle row click for editing
  tableContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("edit-icon")) {
      const id = event.target.getAttribute("data-id");
      fetch(`https://localhost:7165/api/Plantacoes/${id}`)
        .then((response) => {
          if (!response.ok) {
            displayErrorModal("Erro ao encontrar plantações");
          }
          return response.json();
        })
        .then((data) => showEditModal(data))
        .catch((error) =>
          displayErrorModal("Error fetching plantacao:", error)
        );
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
