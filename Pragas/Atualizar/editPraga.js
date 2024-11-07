document.addEventListener("DOMContentLoaded", function () {
  const tableContainer = document.getElementById("infestacaoTableContainer");
  const editModal = document.getElementById("editModal");
  const successModal = document.getElementById("successModal");
  const closeModalButton = document.querySelector("#editModal .close");
  const closeSuccessModalButton = successModal.querySelector(".close-button");
  const editForm = document.getElementById("editForm");
  const searchForm = document.getElementById("searchForm");
  const searchIdInput = document.getElementById("searchId");

  // Load Infestacoes when the page loads
  loadInfestacoes();

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

  // Function to fetch and display active Infestacoes
  function loadInfestacoes(queryParams = "ativos") {
    const url = `https://localhost:7165/api/RegistrosInfestacoes/${queryParams}`;

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
            "<p>Não há infestações ativos no momento.</p>";
          return;
        }

        const table = document.createElement("table");
        table.innerHTML = `
        <thead>
          <tr>
            <th>Id da Infestação</th>
            <th>Nome da Plantação</th>
            <th>Nome da Praga</th>
            <th>Tipo de Controle</th>
            <th>Controle Adequado</th>
            <th>Data de Registro</th>
            <th>Data de Conclusão do Tratamento</th>
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
                  <td>${infestacao.id}</td>
                  <td>${infestacao.plantacao.id} - ${
                      infestacao.plantacao.nome
                    }</td>
                  <td>${infestacao.praga.nomeDaPraga}</td>
                  <td>${infestacao.praga.tipoControle}</td>
                  <td>${infestacao.praga.controleAdequado}</td>
                  <td>${formatDateToDDMMYYYY(infestacao.dataRegistro)}</td>
                  <td>${
                    infestacao.dataConclusaoTratamento
                      ? formatDateToDDMMYYYY(infestacao.dataConclusaoTratamento)
                      : "Tratamento não concluído"
                  }</td>
                  <td>${infestacao.status}</td>
                  <td><i class="fas fa-pencil-alt edit-icon" data-id="${
                    infestacao.id
                  }"></i></td>
                </tr>`
                  )
                  .join("")
              : `
                <tr>
                  <td>${data.id}</td>
                     <td>${data.plantacao.id} - ${data.plantacao.nome}</td>
                  <td>${data.praga.nomeDaPraga}</td>
                  <td>${data.praga.tipoControle}</td>
                  <td>${data.praga.controleAdequado}</td>
                  <td>${formatDateToDDMMYYYY(data.dataRegistro)}</td>
                  <td>${
                    data.dataConclusaoTratamento
                      ? formatDateToDDMMYYYY(data.dataConclusaoTratamento)
                      : "Tratamento não concluído"
                  }</td>
                  <td>${data.status}</td>
                  <td><i class="fas fa-pencil-alt edit-icon" data-id="${
                    data.id
                  }"></i></td>
                </tr>`
          }
        </tbody>
      `;
        tableContainer.innerHTML = "";
        tableContainer.appendChild(table);
      })
      .catch((error) => displayErrorModal(error.message));
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
  function showEditModal(infestacao) {
    document.getElementById("editCauterizado").value = infestacao.cauterizado;
    document.getElementById("editId").value = infestacao.id;
    document.getElementById("editConclusaoTratamento").value =
      formatDateToDDMMYYYY(infestacao.dataConclusaoTratamento);

    editModal.style.display = "block";
  }

  // Function to handle form submission
  editForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(editForm);
    const id = formData.get("id");

    const updatedInfestacao = {
      cauterizado: formData.get("cauterizado"),
      dataConclusaoTratamento: formatDateToDDMMYYYY(
        formData.get("conclusaoTratamento")
      ),
    };

    fetch(`https://localhost:7165/api/RegistrosInfestacoes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedInfestacao),
    })
      .then(async (response) => {
        if (response.ok) {
          showSuccessModal();
          editModal.style.display = "none";
          loadInfestacoes();
        } else {
          displayErrorModal(await response.text());
        }
      })
      .catch((error) =>
        displayErrorModal("Error updating Infestacao:", error.message)
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
    const id = searchIdInput.value.trim();
    let queryParams = "";

    if (id) {
      queryParams = `${id}`;
    }
    loadInfestacoes(queryParams);
  });

  // Handle row click for editing
  tableContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("edit-icon")) {
      const id = event.target.getAttribute("data-id");
      fetch(`https://localhost:7165/api/RegistrosInfestacoes/${id}`)
        .then(async (response) => await response.json())
        .then((data) => {
          showEditModal(data);
        })
        .catch((error) =>
          displayErrorModal("Error fetching Infestação:", error)
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
});

function showLoading() {
  document.getElementById(
    "infestacoesTableContainer"
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
    displayErrorModal("Modal de sucesso não encontrada.");
  }
}

function closeSuccessModal() {
  const modal = document.getElementById("successModal");
  if (modal) {
    modal.style.display = "none";
  } else {
    displayErrorModal("Modal de sucesso não encontrada.");
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
