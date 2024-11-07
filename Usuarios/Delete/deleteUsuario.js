document.addEventListener("DOMContentLoaded", function () {
  const tableContainer = document.getElementById("usuariosTableContainer");
  const confirmModal = document.getElementById("confirmModal");
  const successModal = document.getElementById("successModal");
  const errorModal = document.getElementById("errorModal"); // Nova modal de erro
  const closeSuccessModalButton = successModal.querySelector(".close-button");
  const closeErrorModalButton = errorModal
    ? errorModal.querySelector(".close-button")
    : null; // Novo botão de fechar modal de erro
  const confirmButton = confirmModal.querySelector(".confirm-button");
  const cancelButton = confirmModal.querySelector(".cancel-button");
  let currentUsuarioCPF = null;

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

  function formatAddress(usuario) {
    return `${usuario.endereco.rua}, ${usuario.endereco.numero} - ${usuario.endereco.bairro}, ${usuario.endereco.cidade} - ${usuario.endereco.estado}`;
  }
  function populateTable(usuarios, title = "Usuarios Encontrados") {
    if (!tableContainer) {
      console.error("O container da tabela não foi encontrado.");
      return;
    }

    // Verifica se `usuarios` é um array; se não for, transforma em um array
    const usuariosArray = Array.isArray(usuarios) ? usuarios : [usuarios];

    if (usuariosArray.length === 0) {
      tableContainer.innerHTML = `<p class="no-data-message">Nenhum usuario encontrado.</p>`;
      return;
    }

    let tableHTML = `
          <h2>${title}</h2>
          <table>
              <thead>
                  <tr>
                      <th>CPF</th>
                      <th>Nome</th>
                      <th>Telefone</th>
                      <th>Email</th>
                      <th>Tipo</th>
                      <th>Status</th>
                      <th>Endereço</th>
                      <th>Ações</th>
                  </tr>
              </thead>
              <tbody>
                  ${usuariosArray
                    .map(
                      (usuario) => `
                      <tr>
                          <td>${usuario.cpf}</td>
              <td>${usuario.nomeCompleto}</td>
              <td>${usuario.telefone}</td>
              <td>${usuario.email}</td>
              <td>${usuario.tipo}</td>
              <td>${usuario.ativo ? "Ativo" : "Inativo"}</td>
              <td>${formatAddress(usuario)}</td>
                          <td><i class="fas fa-trash-alt delete-icon" data-cpf="${
                            usuario.cpf
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
        currentUsuarioCPF = this.getAttribute("data-cpf");
        openConfirmModal();
      });
    });
  }

  // Função para buscar e exibir usuarios
  async function search(event) {
    if (event) {
      event.preventDefault(); // Impede o comportamento padrão do formulário
    }

    showLoading();
    const searchCPFElement = document.getElementById("searchCPF");
    const searchNomeElement = document.getElementById("searchNome");

    const searchCPFInput = searchCPFElement
      ? searchCPFElement.value.trim()
      : "";
    const searchNomeInput = searchNomeElement
      ? searchNomeElement.value.trim()
      : "";

    let url = `https://localhost:7165/api/Usuarios/Ativos`;

    // Modificar a URL com base nos valores de entrada
    if (searchCPFInput) {
      url = `https://localhost:7165/api/Usuarios/${searchCPFInput}`;
    } else if (searchNomeInput) {
      url = `https://localhost:7165/api/Usuarios/nome/${searchNomeInput}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Usuarios não encontrados");
      }
      const data = await response.json();

      if (Array.isArray(data) && data.length === 0) {
        tableContainer.innerHTML = `<p class="no-data-message">Nenhum usuario encontrado.</p>`;
      } else {
        populateTable(data);
      }
    } catch (error) {
      tableContainer.innerHTML = `<p class="no-data-message">Nenhum usuario foi encontrado.</p>`;
      showErrorModal(error.message); // Exibe a mensagem de erro
    } finally {
      hideLoading();
    }
  }

  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", search);
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

  // Função para remover formatação do CPF
  function removeCPFFormatting(cpf) {
    return cpf.replace(/[^\d]/g, ""); // Remove tudo que não for dígito
  }

  async function deleteUsuario() {
    if (!currentUsuarioCPF) return;

    // Remove a formatação do CPF antes de enviar para a API
    const cleanedCPF = removeCPFFormatting(currentUsuarioCPF);
    const url = `https://localhost:7165/desativarOuAtivar/${cleanedCPF}`;

    try {
      const response = await fetch(url, {
        method: "PATCH",
      });

      if (!response.ok) {
        const errorData = await response.text(); // Recebe o texto da resposta de erro
        showErrorModal("Não foi possível desativar usuário");
        return;
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
    confirmButton.addEventListener("click", deleteUsuario);
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

  // Buscar usuarios ao carregar a página
  search();
});
