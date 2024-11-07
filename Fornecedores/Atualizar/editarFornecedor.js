document.addEventListener("DOMContentLoaded", function () {
  const tableContainer = document.getElementById("fornecedoresTableContainer");
  const editModal = document.getElementById("editModal");
  const successModal = document.getElementById("successModal");
  const errorModal = document.getElementById("errorModal");
  const closeEditModalButton = editModal?.querySelector(".close");
  const closeSuccessModalButton = successModal?.querySelector(".close-button");
  const closeErrorModalButton = errorModal?.querySelector(".close");
  const editForm = document.getElementById("editForm");
  const searchForm = document.getElementById("searchForm");
  const searchNomeInput = document.getElementById("searchNome");
  const searchCNPJInput = document.getElementById("searchCNPJ");

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

  function formatAddress(fornecedor) {
    return `${fornecedor.endereco.rua}, ${fornecedor.endereco.numero} - ${fornecedor.endereco.bairro}, ${fornecedor.endereco.cidade} - ${fornecedor.endereco.estado}`;
  }

  function populateTable(fornecedores, title = " ") {
    if (!tableContainer) return;
    let tableHTML = `
      <table>
        <thead>
          <tr>
            <th>CNPJ</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Tipo de Fornecimento</th>
            <th>Status</th>
            <th>Endereço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${fornecedores
            .map(
              (fornecedor) => `
            <tr data-id="${fornecedor.cnpj}">
              <td>${fornecedor.cnpj}</td>
              <td>${fornecedor.nomeDoFornecedor}</td>
              <td>${fornecedor.telefone}</td>
              <td>${fornecedor.email}</td>
              <td>${fornecedor.tipoDeFornecimento}</td>
              <td>${fornecedor.status}</td>
              <td>${formatAddress(fornecedor)}</td>
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
        loadFornecedor(id);
      });
    });
  }

  function loadFornecedor(id) {
    showLoading();
    const unformattedId = id.replace(/[.\-\/]/g, "");
    const encodedId = encodeURIComponent(unformattedId);
    fetch(`https://localhost:7165/api/fornecedores/${encodedId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao carregar fornecedor.");
        }
        return response.json();
      })
      .then((fornecedor) => {
        hideLoading();
        populateEditForm(fornecedor);
        showEditModal();
      })
      .catch((error) => {
        hideLoading();
        showErrorModal("Erro ao carregar fornecedor.");
        console.error("Erro ao carregar fornecedor:", error);
      });
  }

  function populateEditForm(fornecedor) {
    if (!fornecedor) return;

    document.getElementById("editNome").value = fornecedor.nomeDoFornecedor;
    document.getElementById("editTelefone").value = fornecedor.telefone;
    document.getElementById("editEmail").value = fornecedor.email;
    document.getElementById("editTipo").value = fornecedor.tipoDeFornecimento;
    document.getElementById("editStatus").value = fornecedor.status;
    document.getElementById("editCEP").value = fornecedor.endereco.cep;
    document.getElementById("editRua").value = fornecedor.endereco.rua;
    document.getElementById("editNumero").value = fornecedor.endereco.numero;
    document.getElementById("editBairro").value = fornecedor.endereco.bairro;
    document.getElementById("editCidade").value = fornecedor.endereco.cidade;
    document.getElementById("editEstado").value = fornecedor.endereco.estado;
    document.getElementById("editComplemento").value =
      fornecedor.endereco.complemento;
    document.getElementById("editId").value = fornecedor.cnpj;
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
    const tableContainer = document.getElementById(
      "fornecedoresTableContainer"
    );
    tableContainer.innerHTML = `<p class="no-data-message">${message}</p>`;
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(editForm);
    const id = formData.get("id");

    const idFornecedor = id.replace(/[.\-\/]/g, "");
    const payload = {
      nomeDoFornecedor: formData.get("nome"),
      telefone: formData.get("telefone"),
      email: formData.get("email"),
      tipoDeFornecimento: formData.get("editTipo"),
      endereco: {
        cep: formData.get("cep"),
        rua: formData.get("rua"),
        numero: formData.get("numero"),
        bairro: formData.get("bairro"),
        cidade: formData.get("cidade"),
        estado: formData.get("estado"),
        complemento: formData.get("complemento"),
      },
      status: formData.get("status"),
    };

    showLoading();
    fetch(`https://localhost:7165/api/Fornecedores/${idFornecedor}`, {
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
            fetchFornecedores();
          }, 2000);
        } else {
          return response.text().then((text) => {
            showErrorModal(text || "Erro ao salvar fornecedor.");
          });
        }
      })
      .catch((error) => {
        hideLoading();
        showErrorModal("Erro ao salvar fornecedor.");
        console.error("Erro ao salvar fornecedor:", error);
      });
  }

  function fetchFornecedores(nome = "", cnpj = "") {
    showLoading();

    const cnpjUnformatted = cnpj.replace(/[.\-\/]/g, "");

    let url = "https://localhost:7165/api/Fornecedores";

    if (nome) {
      url = `https://localhost:7165/api/Fornecedores/Ativos/nome/${nome}`;
    } else if (cnpj) {
      url = `https://localhost:7165/api/Fornecedores/Ativos/cnpj/${cnpjUnformatted}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        hideLoading();
        populateTable(data, "Lista de Fornecedores");
      })
      .catch((error) => {
        hideLoading();
        renderNoDataMessage("Nenhum fornecedor foi encontrado.");
        console.error("Erro ao buscar fornecedores:", error);
      });
  }

  function fetchCEP(cep) {
    const formattedCEP = cep.replace(/\D/g, "");
    if (formattedCEP.length === 8) {
      fetch(`https://viacep.com.br/ws/${formattedCEP}/json/`)
        .then((response) => response.json())
        .then((data) => {
          if (data.erro) {
            alert("CEP não encontrado.");
            return;
          }
          document.getElementById("editRua").value = data.logradouro;
          document.getElementById("editBairro").value = data.bairro;
          document.getElementById("editCidade").value = data.localidade;
          document.getElementById("editEstado").value = data.uf;
        })
        .catch((error) => {
          console.error("Erro ao buscar o CEP:", error);
          alert("Erro ao buscar o CEP. Tente novamente mais tarde.");
        });
    } else {
      alert("CEP inválido.");
    }
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const nome = searchNomeInput.value;
      const cnpj = searchCNPJInput.value;

      if (nome) {
        fetchFornecedores(nome);
      } else if (cnpj) {
        fetchFornecedores("", cnpj);
      } else {
        fetchFornecedores(); // Se nenhum parâmetro for fornecido, busca todos os ativos
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

  fetchFornecedores(); // Carrega fornecedores ativos ao iniciar
});
