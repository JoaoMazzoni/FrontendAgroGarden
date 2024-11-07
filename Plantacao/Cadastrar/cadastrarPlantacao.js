document.addEventListener("DOMContentLoaded", () => {
  const datePicker = document.getElementById("dataDePlantio");
  // Função para formatar a data no formato YYYY-MM-DD
  function formatDate(date) {
    let day = ("0" + date.getDate()).slice(-2); // Adiciona zero à esquerda, se necessário
    let month = ("0" + (date.getMonth() + 1)).slice(-2); // Meses começam do 0, então soma 1
    let year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  // Obtém a data de hoje
  const today = new Date();

  // Define a data para uma semana a partir de hoje
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  // Define o valor mínimo como a data de hoje e o valor máximo como uma semana à frente
  datePicker.setAttribute("min", formatDate(today));
  datePicker.setAttribute("max", formatDate(nextWeek));

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

  document
    .getElementById("plantacaoForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Previne o comportamento padrão de envio do formulário

      // Coleta e formata a data no formato dd/MM/yyyy
      const dataDePlantioInput = document.getElementById("dataDePlantio").value;
      const [ano, mes, dia] = dataDePlantioInput.split("-"); // Quebra a data no formato yyyy-MM-dd
      const dataFormatada = `${dia}/${mes}/${ano}`; // Reformata para dd/MM/yyyy

      // Coleta os dados do formulário
      const formData = {
        nome: document.getElementById("nome").value,
        tipo: document.getElementById("tipo").value,
        localDePlantio: document.getElementById("localDePlantio").value,
        dataDePlantio: dataFormatada, // Usa a data formatada
        irrigacao: document.getElementById("irrigacao").value,
        luzSolar: document.getElementById("luzSolar").value,
        condicaoClimatica: document.getElementById("condicaoClimatica").value,
        crescimento: document.getElementById("crescimento").value,
      };

      try {
        const response = await fetch("https://localhost:7165/api/Plantacoes/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          showSuccessModal(); // Exibe o popup de sucesso
          setTimeout(() => {
            event.target.reset(); // Reseta o formulário
          }, 500); // Ajuste o tempo conforme necessário para coincidir com a duração da animação
        } else if (response.status === 409) {
          const errorText = await response.text();
          displayErrorModal(errorText); // Exibe a mensagem de erro na nova modal
        } else {
          displayErrorModal("Ocorreu um erro ao cadastrar a plantação.");
        }
      } catch (error) {
        displayErrorModal("Erro de rede: " + error.message);
      }
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

  function showSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
      modal.style.display = "flex";
    } else {
      console.error("Modal de sucesso não encontrada.");
    }
  }

  function closeSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
      modal.style.display = "none";
    } else {
      console.error("Modal de sucesso não encontrada.");
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
