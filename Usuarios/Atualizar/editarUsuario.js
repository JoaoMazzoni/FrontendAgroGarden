document.addEventListener("DOMContentLoaded", function () {
  const tableContainer = document.getElementById("usuariosTableContainer");
  const editModal = document.getElementById("editModal");
  const successModal = document.getElementById("successModal");
  const errorModal = document.getElementById("errorModal");
  const closeEditModalButton = editModal?.querySelector(".close");
  const closeSuccessModalButton = successModal?.querySelector(".close-button");
  const closeErrorModalButton = errorModal?.querySelector(".close");
  const editForm = document.getElementById("editForm");
  const searchForm = document.getElementById("searchForm");
  const searchNomeInput = document.getElementById("searchNome");
  const searchCNPJInput = document.getElementById("searchCPF");
  const togglePassword = document.getElementById("togglePassword");
  const passwordField = document.getElementById("password");

  function convertDateForShow(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const getUserInfo = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  const checkAuthentication = () => {
    const user = getUserInfo();
    if (!user) {
      window.location.href = "../../Login/login.html";
    }
    return user;
  };

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

  if (successModal) successModal.style.display = "none";
  if (errorModal) errorModal.style.display = "none";

  function showLoading() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) loadingElement.style.display = "flex";
  }

  function hideLoading() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) loadingElement.style.display = "none";
  }

  function formatAddress(usuario) {
    return `${usuario.endereco.rua}, ${usuario.endereco.numero} - ${usuario.endereco.bairro}, ${usuario.endereco.cidade} - ${usuario.endereco.estado}`;
  }

  function populateTable(usuarios, title = " ") {
    if (!tableContainer) return;
    let tableHTML = `
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
          ${usuarios
            .map(
              (usuario) => `
            <tr data-id="${usuario.cpf}">
              <td>${usuario.cpf}</td>
              <td>${usuario.nomeCompleto}</td>
              <td>${usuario.telefone}</td>
              <td>${usuario.email}</td>
              <td>${usuario.tipo}</td>
              <td>${usuario.ativo ? "Ativo" : "Inativo"}</td>
              <td>${formatAddress(usuario)}</td>
              <td>
                <i class="fas fa-pencil-alt edit-icon"></i>
              </td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;

    tableContainer.innerHTML = tableHTML;

    tableContainer.querySelectorAll(".edit-icon").forEach((button) => {
      button.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        const id = row.dataset.id;
        loadUsuario(id);
      });
    });
  }

  function loadUsuario(id) {
    showLoading();
    const unformattedId = id.replace(/[.\-\/]/g, "");
    const encodedId = encodeURIComponent(unformattedId);
    fetch(`https://localhost:7165/api/usuarios/${encodedId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao carregar usuario.");
        }
        return response.json();
      })
      .then((usuario) => {
        hideLoading();
        populateEditForm(usuario);
        showEditModal();
      })
      .catch((error) => {
        hideLoading();
        showErrorModal("Erro ao carregar usuario." + error);
      });
  }

  function populateEditForm(usuario) {
    if (!usuario) return;

    document.getElementById("editNome").value = usuario.nomeCompleto;
    document.getElementById("editDataDeNascimento").value = convertDateForShow(
      usuario.dataNascimento
    );
    document.getElementById("editTelefone").value = usuario.telefone;
    document.getElementById("editEmail").value = usuario.email;
    document.getElementById("editTipo").value = usuario.tipo;
    document.getElementById("editAtivo").value = usuario.ativo
      ? "true"
      : "false";
    document.getElementById("password").value = usuario.senha;
    document.getElementById("editCEP").value = usuario.endereco.cep;
    document.getElementById("editRua").value = usuario.endereco.rua;
    document.getElementById("editNumero").value = usuario.endereco.numero;
    document.getElementById("editBairro").value = usuario.endereco.bairro;
    document.getElementById("editCidade").value = usuario.endereco.cidade;
    document.getElementById("editEstado").value = usuario.endereco.estado;
    document.getElementById("editComplemento").value =
      usuario.endereco.complemento;
    document.getElementById("editId").value = usuario.cpf;
  }

  function showEditModal() {
    if (editModal) editModal.style.display = "block";
  }

  function closeEditModal() {
    if (editModal) editModal.style.display = "none";
  }

  function showSuccessModal() {
    if (successModal) successModal.style.display = "block";
  }

  function closeSuccessModal() {
    if (successModal) successModal.style.display = "none";
  }

  function showErrorModal(message) {
    if (errorModal) {
      const errorMessage = document.getElementById("errorMessage");
      if (errorMessage) errorMessage.textContent = message;
      errorModal.style.display = "block";
    }
  }

  function closeErrorModal() {
    if (errorModal) errorModal.style.display = "none";
  }

  function renderNoDataMessage(message) {
    const tableContainer = document.getElementById("usuariosTableContainer");
    tableContainer.innerHTML = `<p class="no-data-message">${message}</p>`;
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(editForm);
    const id = formData.get("id");

    const idUsuario = id.replace(/[.\-\/]/g, "");
    const payload = {
      nomeCompleto: formData.get("nome"),
      dataNascimento: formData.get("dataDeNascimento"),
      telefone: formData.get("telefone"),
      email: formData.get("email"),
      tipo: formData.get("tipo"),
      ativo: formData.get("ativo") === "true",
      endereco: {
        cep: formData.get("cep"),
        rua: formData.get("rua"),
        numero: formData.get("numero"),
        bairro: formData.get("bairro"),
        cidade: formData.get("cidade"),
        estado: formData.get("estado"),
        complemento: formData.get("complemento"),
      },
      senha: formData.get("password"),
    };

    showLoading();
    fetch(`https://localhost:7165/api/Usuarios/${idUsuario}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        hideLoading();
        if (response.ok) {
          showSuccessModal();
          setTimeout(() => {
            closeEditModal();
            closeSuccessModal();
            fetchUsuarios();
          }, 2000);
        } else {
          return response.text().then((text) => {
            showErrorModal(text || "Erro ao salvar usuario.");
          });
        }
      })
      .catch((error) => {
        hideLoading();
        showErrorModal("Erro ao salvar usuario.");
      });
  }

  function fetchUsuarios(nome = "", cpf = "") {
    showLoading();

    const cpfUnformatted = cpf.replace(/[.\-\/]/g, "");

    let url = "https://localhost:7165/api/Usuarios";

    if (nome) {
      url = `https://localhost:7165/api/Usuarios/nome/${nome}`;
    } else if (cpf) {
      url = `https://localhost:7165/api/Usuarios/${cpfUnformatted}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        hideLoading();
        if (cpf) {
          populateTable([data], "Lista de Usuarios");
        } else {
          populateTable(data, "Lista de Usuarios");
        }
      })
      .catch((error) => {
        hideLoading();
        renderNoDataMessage("Nenhum usuario foi encontrado.");
        showErrorModal("Erro ao buscar usuarios:", error.message);
      });
  }

  function fetchCEP(cep) {
    const formattedCEP = cep.replace(/\D/g, "");
    if (formattedCEP.length === 8) {
      fetch(`https://viacep.com.br/ws/${formattedCEP}/json/`)
        .then((response) => response.json())
        .then((data) => {
          if (data.erro) {
            showErrorModal("CEP não encontrado.");
            return;
          }
          document.getElementById("editRua").value = data.logradouro;
          document.getElementById("editBairro").value = data.bairro;
          document.getElementById("editCidade").value = data.localidade;
          document.getElementById("editEstado").value = data.uf;
        })
        .catch((error) => {
          showErrorModal("Erro ao buscar o CEP. Tente novamente mais tarde.");
        });
    } else {
      showErrorModal("CEP inválido.");
    }
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const nome = searchNomeInput.value;
      const cpf = searchCNPJInput.value;

      if (nome) {
        fetchUsuarios(nome);
      } else if (cpf) {
        fetchUsuarios("", cpf);
      } else {
        fetchUsuarios(); // Se nenhum parâmetro for fornecido, busca todos os ativos
      }
    });
  }

  if (editForm) {
    document.getElementById("editCEP").addEventListener("blur", function () {
      fetchCEP(this.value);
    });
    editForm.addEventListener("submit", handleFormSubmit);
  }

  if (closeEditModalButton)
    closeEditModalButton.addEventListener("click", closeEditModal);
  if (closeSuccessModalButton)
    closeSuccessModalButton.addEventListener("click", closeSuccessModal);
  if (closeErrorModalButton)
    closeErrorModalButton.addEventListener("click", closeErrorModal);

  togglePassword.addEventListener("click", function () {
    const type =
      passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);

    // Alterna entre ícones de planta e árvore
    if (type === "text") {
      this.classList.remove("fa-seedling");
      this.classList.add("fa-tree");
      this.classList.add("show");
      this.classList.remove("hide");
    } else {
      this.classList.remove("fa-tree");
      this.classList.add("fa-seedling");
      this.classList.add("hide");
      this.classList.remove("show");
    }
  });

  fetchUsuarios(); // Carrega usuarios ativos ao iniciar
});
