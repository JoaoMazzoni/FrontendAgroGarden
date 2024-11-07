document.addEventListener("DOMContentLoaded", () => {
  const insumos = document.getElementById("insumoLote");
  // Função para obter as informações do usuário do localStorage
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

  function dataFormatada(dataValidade) {
    date = new Date(dataValidade);
    day = String(date.getUTCDate()).padStart(2, "0");
    mes = (date.getMonth() + 1).toString(); // +1 pois no getMonth Janeiro começa com zero.
    mesF = mes.length == 1 ? "0" + mes : mes;
    anoF = date.getFullYear();
    return day + "/" + mesF + "/" + anoF;
  }

  // Função para preencher o dropdown de Plantacao
  function preencherDropdownPlantacao(plantacoes) {
    const plantacoesSelect = document.getElementById("plantacaoId");
    plantacoesSelect.innerHTML =
      '<option value="">Selecione uma plantação</option>'; // Reseta o dropdown

    plantacoes.forEach((plantacao) => {
      if (plantacao.id && plantacao.nome) {
        // Verifica se os dados existem
        const option = document.createElement("option");
        option.value = plantacao.id;
        option.textContent = `${
          plantacao.id +
          " - " +
          plantacao.nome +
          " - " +
          plantacao.dataDePlantio.split("T")[0].split("-").reverse().join("/")
        }`;
        plantacoesSelect.appendChild(option);
      } else {
        displayErrorModal("Colheita com dados incompletos:", plantacao);
      }
    });
  }
  // Função para preencher o dropdown de Insumos
  function preencherDropdownInsumo(insumos) {
    const insumosSelect = document.getElementById("insumoLote");
    insumosSelect.innerHTML = '<option value="">Selecione um insumo</option>'; // Reseta o dropdown

    insumos.forEach((insumo) => {
      if (insumo.codigoLote && insumo.nomeDoInsumo) {
        // Verifica se os dados existem
        const option = document.createElement("option");
        option.value = insumo.codigoLote;
        option.textContent = `${insumo.codigoLote} - ${insumo.nomeDoInsumo}`;
        insumosSelect.appendChild(option);
      } else {
        displayErrorModal("Insumos com dados incompletos:", insumo);
      }
    });
  }

  async function montarTipoInsumo() {
    const insumoLote = document.getElementById("insumoLote").value;
    const tipoInsumo = document.getElementById("tipoInsumo");
    try {
      const response = await fetch(
        `https://localhost:7165/api/Insumos/${insumoLote}`
      );

      if (response.ok) {
        const insumo = await response.json();
        if (insumos) {
          tipoInsumo.value = insumo.funcao;
          tipoInsumo.innerText = insumo.funcao;
        } else {
          displayErrorModal("Nenhuma insumo disponível.");
          document.getElementById("insumoId").innerHTML =
            '<option value="">Nenhuma insumo incluida</option>';
        }
      } else {
        const errorMessage = await response.text();
        displayErrorModal("Erro ao carregar insumos: " + errorMessage);
      }
    } catch (error) {
      displayErrorModal("Erro ao se conectar ao servidor: " + error.message);
    }
  }

  insumos.addEventListener("change", montarTipoInsumo);

  // Função para enviar o formulário de insumos
  async function enviarFormulario(event) {
    event.preventDefault(); // Previne o comportamento padrão de envio do formulário

    const formData = {
      plantacaoId: document.getElementById("plantacaoId").value,
      loteInsumo: document.getElementById("insumoLote").value,
      tipo: document.getElementById("tipoInsumo").value,
      quantidade: document.getElementById("quantidade").value,
      dataAplicacao: dataFormatada(
        document.getElementById("dataAplicacao").value
      ),
    };

    try {
      const response = await fetch(
        "https://localhost:7165/api/AplicacaoInsumos/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        showSuccessModal(); // Exibe o popup de sucesso
        setTimeout(() => {
          event.target.reset(); // Reseta o formulário
        }, 500);
      } else {
        const errorText = await response.text();
        displayErrorModal(errorText); // Exibe a mensagem de erro na nova modal
      }
    } catch (error) {
      displayErrorModal("Erro de rede: " + error.message);
    }
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

  // Envio do formulário
  document
    .getElementById("aplicacaoInsumoForm")
    .addEventListener("submit", enviarFormulario);

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

  async function loadInsumo() {
    try {
      const response = await fetch(`https://localhost:7165/api/Insumos/Ativos`);

      if (response.ok) {
        const insumos = await response.json();

        if (Array.isArray(insumos) && insumos.length > 0) {
          preencherDropdownInsumo(insumos);
        } else {
          displayErrorModal("Nenhuma insumo disponível.");
          document.getElementById("insumoId").innerHTML =
            '<option value="">Nenhuma insumo incluida</option>';
        }
      } else {
        const errorMessage = await response.text();
        displayErrorModal("Erro ao carregar insumos: " + errorMessage);
      }
    } catch (error) {
      displayErrorModal("Erro ao se conectar ao servidor: " + error.message);
    }
  }

  async function loadPlantacao() {
    try {
      const response = await fetch(
        `https://localhost:7165/api/Plantacoes/Ativas`
      );

      if (response.ok) {
        const plantacao = await response.json();

        if (Array.isArray(plantacao) && plantacao.length > 0) {
          preencherDropdownPlantacao(plantacao);
        } else {
          displayErrorModal("Nenhuma insumo disponível.");
          document.getElementById("plantacaoId").innerHTML =
            '<option value="">Nenhuma plantação incluida</option>';
        }
      } else {
        const errorMessage = await response.text();
        displayErrorModal("Erro ao carregar plantação: " + errorMessage);
      }
    } catch (error) {
      displayErrorModal("Erro ao se conectar ao servidor: " + error.message);
    }
  }

  loadPlantacao();
  loadInsumo();
});
