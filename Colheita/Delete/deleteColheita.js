document.addEventListener("DOMContentLoaded", function () {
  const tableContainer = document.getElementById("colheitasTableContainer");
  const confirmModal = document.getElementById("confirmModal");
  const successModal = document.getElementById("successModal");
  const errorModal = document.getElementById("errorModal"); // Nova modal de erro
  const closeSuccessModalButton = successModal.querySelector(".close-button");
  const closeErrorModalButton = errorModal
    ? errorModal.querySelector(".close-button")
    : null; // Novo botão de fechar modal de erro
  const confirmButton = confirmModal.querySelector(".confirm-button");
  const cancelButton = confirmModal.querySelector(".cancel-button");
  let currentPlantacaoId = null;

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

  // Inicialmente oculta o modal de sucesso e de erro
  if (successModal) {
    successModal.style.display = "none";
  }

  if (errorModal) {
    errorModal.style.display = "none";
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

  function populateTable(colheitas, title = "Colheitas Concluídas") {
    if (!tableContainer) {
      console.error("O container da tabela não foi encontrado.");
      return;
    }

    // Verifica se `colheitas` é um array; se não for, transforma em um array
    const colheitasArray = Array.isArray(colheitas) ? colheitas : [colheitas];

    if (colheitasArray.length === 0) {
      tableContainer.innerHTML = `<p class="no-data-message">Nenhuma colheita concluída foi encontrada.</p>`;
      return;
    }

    let tableHTML = `
        <h2>${title}</h2>
        <table>
            <thead>
                <tr>
                    <th>Número de Registro</th>
                    <th>Plantação ID</th>
                    <th>Data de Colheita</th>
                    <th>Quantidade</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${colheitasArray
                  .map(
                    (colheita) => `
                    <tr>
                        <td>${colheita.numeroRegistro}</td>
                        <td>${colheita.plantacao.id} - ${colheita.plantacao.nome}</td>
                        <td>${formatDateToDDMMYYYY(colheita.dataColheita)}</td>
                        <td>${colheita.quantidadeColhida}</td>
                        <td><i class="fas fa-trash-alt delete-icon" data-id="${
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

    // Adicionar eventos de clique para os ícones de lixeira
    const deleteIcons = document.querySelectorAll(".delete-icon");
    deleteIcons.forEach((icon) => {
      icon.addEventListener("click", function () {
        currentPlantacaoId = this.getAttribute("data-id");
        openConfirmModal();
      });
    });
  }

  // Função para buscar e exibir colheitas concluídas
  async function search(event) {
    // Verifica se a função foi chamada com um evento
    if (event) {
      event.preventDefault(); // Impede o comportamento padrão do formulário
    }

    showLoading();
    const numeroRegistroElement = document.getElementById("numeroRegistro");
    const plantacaoIdElement = document.getElementById("plantacaoId");

    const numeroRegistroInput = numeroRegistroElement
      ? numeroRegistroElement.value.trim()
      : "";
    const plantacaoIdInput = plantacaoIdElement
      ? plantacaoIdElement.value.trim()
      : "";

    let url = `https://localhost:7165/api/Colheitas/concluida`;

    // Modificar a URL com base nos valores de entrada
    if (numeroRegistroInput) {
      url = `https://localhost:7165/api/Colheitas/concluida/${numeroRegistroInput}`;
    } else if (plantacaoIdInput) {
      url = `https://localhost:7165/api/Colheitas/concluida/Plantacao/${plantacaoIdInput}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Colheitas não encontradas");
      }
      const data = await response.json();

      // Verifica se `data` é um array ou um objeto único
      if (Array.isArray(data) && data.length === 0) {
        tableContainer.innerHTML = `<p class="no-data-message">Nenhuma colheita concluída foi encontrada.</p>`;
      } else {
        populateTable(data);
      }
    } catch (error) {
      tableContainer.innerHTML = `<p class="no-data-message">Erro ao buscar colheita: ${error.message}</p>`;
      showErrorModal(error.message); // Exibe a mensagem de erro
    } finally {
      hideLoading();
    }
  }

  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", search);
  }

  // Função para formatar data para dd/MM/yyyy
  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function openConfirmModal() {
    confirmModal.style.display = "flex";
  }

  function closeConfirmModal() {
    confirmModal.style.display = "none";
  }

  function openSuccessModal() {
    successModal.style.display = "flex";
  }

  function closeSuccessModal() {
    successModal.style.display = "none";
  }

  function showErrorModal(message) {
    if (errorModal) {
      const errorMessage = errorModal.querySelector(".error-message");
      if (errorMessage) {
        errorMessage.textContent = message;
      }
      errorModal.style.display = "flex";
    }
  }

  function closeErrorModal() {
    if (errorModal) {
      errorModal.style.display = "none";
    }
  }

  async function deleteColheita() {
    if (!currentPlantacaoId) return;

    const url = `https://localhost:7165/api/Colheitas/${currentPlantacaoId}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.text(); // Recebe o texto da resposta de erro
        console.error("Erro recebido do backend:", errorData); // Verifique o que está sendo retornado
        throw new Error(errorData);
      }

      openSuccessModal();
      search();
    } catch (error) {
      showErrorModal(error.message);
    } finally {
      closeConfirmModal();
    }
  }

  // Evento de clique para o botão de confirmação
  if (confirmButton) {
    confirmButton.addEventListener("click", deleteColheita);
  }

  // Evento de clique para o botão de cancelamento
  if (cancelButton) {
    cancelButton.addEventListener("click", closeConfirmModal);
  }

  // Evento de clique para o botão de fechar modal de sucesso
  if (closeSuccessModalButton) {
    closeSuccessModalButton.addEventListener("click", closeSuccessModal);
  }

  // Evento de clique para o botão de fechar modal de erro
  if (closeErrorModalButton) {
    closeErrorModalButton.addEventListener("click", closeErrorModal);
  }

  // Buscar colheitas ao carregar a página
  search();
});
