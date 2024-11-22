document.addEventListener("DOMContentLoaded", function () {
  const tableContainer = document.getElementById("colheitasTableContainer");
  const editModal = document.getElementById("editModal");
  const successModal = document.getElementById("successModal");
  const closeModalButton = editModal ? editModal.querySelector(".close") : null;
  const closeSuccessModalButton = successModal
    ? successModal.querySelector(".close-button")
    : null;
  const editForm = document.getElementById("editForm");
  const searchForm = document.getElementById("searchForm");
  const searchIdInput = document.getElementById("searchId");
  const searchNomeInput = document.getElementById("searchNome");

  // Função para obter informações do usuário
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

  // Inicialmente oculta o modal de sucesso
  if (successModal) {
    successModal.style.display = "none";
  }

  // Função para mostrar carregamento
  function showLoading() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
      loadingElement.style.display = "flex";
    }
  }

  // Função para ocultar carregamento
  function hideLoading() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
      loadingElement.style.display = "none";
    }
  }

  // Função para popular a tabela com os dados
  function populateTable(colheitas, title = " ") {
    if (!tableContainer) return;

    let tableHTML = `
      <h2>${title}</h2>
      <table>
        <thead>
          <tr>
            <th>Número de Registro</th>
            <th>Plantacao ID</th>
            <th>Data de Colheita</th>
            <th>Quantidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${colheitas
            .map(
              (colheita) => `
            <tr>
              <td>${colheita.numeroRegistro}</td>
              <td>${colheita.plantacao.id} - ${colheita.plantacao.nome}</td>
              <td>${formatDateToDDMMYYYY(colheita.dataColheita)}</td>
              <td>${colheita.quantidadeColhida}</td>
              <td><i class="fas fa-pencil-alt edit-icon" data-id="${
                colheita.numeroRegistro
              }"></i></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    tableContainer.innerHTML = tableHTML;
  }

  async function search() {
    showLoading();
    const number = document.getElementById("searchNumber").value.trim();
    const id = document.getElementById("searchId").value.trim();

    let url = `https://localhost:7165/api/Colheitas`;

    if (number) {
      url += `/concluida/${number}`;
    } else if (id) {
      url = `https://localhost:7165/api/Colheitas/concluida/Plantacao/${id}`;
    } else {
      alert(
        "Por favor, insira um número de colheita ou ID da plantação para pesquisa."
      );
      hideLoading();
      return;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Colheitas não encontradas");
      }
      let data = await response.json();

      // Verificar se a resposta é um objeto e converter para array se necessário
      if (data && !Array.isArray(data)) {
        data = [data];
      }

      if (Array.isArray(data) && data.length === 0) {
        document.getElementById(
          "reportTableContainer"
        ).innerHTML = `<p class="no-data-message">Nenhuma colheita encontrada com o ${
          number ? `Número de Registro ${number}` : `ID da Plantação ${id}`
        }</p>`;
      } else {
        populateTable(
          data,
          number ? `Número de Registro: ${number}` : `ID da Plantação: ${id}`
        );
      }
    } catch (error) {
      console.error("Erro:", error);
      document.getElementById(
        "reportTableContainer"
      ).innerHTML = `<p class="no-data-message">Nenhuma colheita encontrada com o ${
        number ? `Número De Registro ${number}` : `ID da Plantação ${id}`
      }</p>`;
    } finally {
      hideLoading();
    }
  }

  // Função para buscar e exibir colheitas
  function loadColheitas(queryParams = "") {
    const url = `https://localhost:7165/api/Colheitas/concluida${queryParams}`;

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
          tableContainer.innerHTML = "<p>Não há colheitas no momento.</p>";
          return;
        }

        populateTable(data);
      })
      .catch((error) => console.error("Error ao buscar colheitas:", error));
  }

  // Função para formatar data para dd/MM/yyyy
  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
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

  // Função para converter data para yyyy-MM-dd para exibição em input
  function convertDateForShow(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Função para lidar com o clique de edição
  function handleEditClick(event) {
    if (event.target.classList.contains("edit-icon")) {
      const id = event.target.getAttribute("data-id");
      fetch(`https://localhost:7165/api/Colheitas/${id}`)
        .then((response) => response.json())
        .then((data) => {
          document.getElementById("editData").value = convertDateForShow(
            data.dataColheita
          );
          document.getElementById("editQuantidade").value =
            data.quantidadeColhida;
          document.getElementById("editId").value = data.numeroRegistro;
          if (editModal) {
            editModal.style.display = "flex";
          }
        })
        .catch((error) =>
          console.error("Error fetching colheita details:", error)
        );
    }
  }

  // Função para lidar com o envio do formulário de edição
  function handleEditFormSubmit(event) {
    event.preventDefault();

    if (!editForm) {
      console.error("Formulário de edição não encontrado.");
      return;
    }

    const formData = new FormData(editForm);
    const id = formData.get("id");
    const dataFormatada = convertDateForInput(formData.get("dataColheita"));

    fetch(`https://localhost:7165/api/Colheitas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dataColheita: dataFormatada,
        quantidadeColhida: formData.get("quantidadeColhida"),
      }),
    })
      .then((data) => {
        if (data.ok) {
          if (successModal) {
            showSuccessModal();
            loadColheitas(); // Atualiza a lista de colheitas após a edição
          }
        } else {
          data.text().then((text) => {
            displayErrorModal(text || "Erro ao salvar colheita.");
          });
        }
      })
      .catch((error) => {
        displayErrorModal("Erro ao editar a colheita:", error);
      });
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

  // Adiciona eventos de fechar popup
  document
    .querySelector("#successModal .close")
    ?.addEventListener("click", closeSuccessModal);
  document
    .querySelector("#errorModal .close")
    ?.addEventListener("click", function () {
      document.getElementById("errorModal").style.display = "none";
    });

  // Adiciona o listener para o clique na tabela
  if (tableContainer) {
    tableContainer.addEventListener("click", handleEditClick);
  }

  // Adiciona o listener para o envio do formulário de edição
  if (editForm) {
    editForm.addEventListener("submit", handleEditFormSubmit);
  }

  // Adiciona o listener para o botão de fechar do modal de edição
  if (closeModalButton) {
    closeModalButton.addEventListener("click", () => {
      if (editModal) {
        editModal.style.display = "none";
      }
    });
  }

  // Adiciona o listener para o botão de fechar do modal de sucesso
  if (closeSuccessModalButton) {
    closeSuccessModalButton.addEventListener("click", () => {
      if (successModal) {
        successModal.style.display = "none";
      }
    });
  }

  // Função para buscar colheitas com base em parâmetros de consulta
  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      search();
    });
  }

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

  // Carregar colheitas ativas inicialmente
  loadColheitas();
});
