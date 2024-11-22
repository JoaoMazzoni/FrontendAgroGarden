document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("colheitaForm");
  const successModal = document.getElementById("successModal");
  const errorModal = document.getElementById("errorModal");
  const errorMessage = document.getElementById("errorMessage");
  const plantacaoSelect = document.getElementById("plantacao");

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
      document.getElementById("plantacaoMenu").style.display = "block";
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

  // URL da API para buscar plantações ativas
  const apiUrl = "https://localhost:7165/api/Plantacoes/Ativas";

  // Função para preencher o campo de seleção com as plantações ativas
  function populatePlantacaoOptions() {
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Limpar as opções existentes
        plantacaoSelect.innerHTML =
          '<option value="">Selecione uma plantação</option>';

        // Adicionar novas opções
        data.forEach((plantacao) => {
          const option = document.createElement("option");
          option.value = plantacao.id; // ou o campo que identifica a plantação

          // Formatando a data para dia/mês/ano
          const dataDePlantio = new Date(plantacao.dataDePlantio);
          const formattedDate = dataDePlantio.toLocaleDateString("pt-BR"); // 'pt-BR' para formato dd/mm/aaaa

          option.textContent = `${plantacao.id} - ${plantacao.nome} - ${formattedDate}`; // Formatação desejada
          plantacaoSelect.appendChild(option);
        });
      })
      .catch((error) => {
        displayErrorModal("Nenhuma plantação ativa encontrada", error);
      });
  }

  // Preencher o campo de seleção quando a página carregar
  populatePlantacaoOptions();

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(form);

    // Obtendo e formatando a data de colheita
    const dataColheitaInput = formData.get("dataColheita");
    const [ano, mes, dia] = dataColheitaInput.split("-"); // Quebra a data no formato yyyy-MM-dd
    const dataFormatada = `${dia}/${mes}/${ano}`; // Reformata para dd/MM/yyyy

    const data = {
      plantacao: formData.get("plantacao"),
      dataColheita: dataFormatada,
      quantidadeColhida: parseInt(formData.get("quantidadeColhida"), 10),
    };

    try {
      const response = await fetch("https://localhost:7165/api/Colheitas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showSuccessModal();
        form.reset(); // Limpa o formulário após sucesso
        setTimeout(() => {
          populatePlantacaoOptions(); // Atualiza a lista de plantações
          location.reload(); // Recarrega a página
        }, 1000); // Delay de 1 segundo para garantir que o modal seja exibido
      } else {
        const errorData = await response.text();
        displayErrorModal(errorData);
      }
    } catch (error) {
      displayErrorModal("Erro ao conectar com o servidor.");
    }
  });

  function showSuccessModal() {
    successModal.style.display = "flex";
  }

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

  function closeModal(modal) {
    modal.style.display = "none";
  }

  successModal.querySelector(".close").addEventListener("click", function () {
    closeModal(successModal);
  });

  errorModal.querySelector(".close").addEventListener("click", function () {
    closeModal(errorModal);
  });

  window.addEventListener("click", function (event) {
    if (event.target === successModal) {
      closeModal(successModal);
    }
    if (event.target === errorModal) {
      closeModal(errorModal);
    }
  });
});
