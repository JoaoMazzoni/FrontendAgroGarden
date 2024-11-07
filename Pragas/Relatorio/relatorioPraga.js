document.addEventListener("DOMContentLoaded", () => {
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

  // Adicionar evento ao botão de pesquisa
  document
    .querySelector(".search-container button")
    .addEventListener("click", search);

  // Adicionar evento ao botão de gerar PDF
  document
    .getElementById("generatePdfBtn")
    .addEventListener("click", generatePdf);

  // Adicionar evento de logout
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
  document
    .querySelector("#successModal .close")
    ?.addEventListener("click", closeSuccessModal);

  document
    .querySelector("#errorModal .close")
    ?.addEventListener("click", function () {
      document.getElementById("errorModal").style.display = "none";
    });
});

// Fecha modal de sucesso
function closeSuccessModal() {
  const modal = document.getElementById("successModal");
  if (modal) {
    modal.style.display = "none";
  } else {
    displayErrorModal("Modal de sucesso não encontrada.");
  }
}

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

async function fetchData(filter) {
  showLoading();
  try {
    const response = await fetch(
      `https://localhost:7165/api/RegistrosInfestacoes/${filter}`
    );
    if (!response.ok) {
      displayErrorModal("Erro ao buscar infestacão");
    }
    const data = await response.json();
    populateTable(data, `Filtro: ${filter}`);
  } catch (error) {
    displayErrorModal(
      `Nenhuma infestacão encontrada com o ${`Filtro ${filter}`}`
    );
  } finally {
    hideLoading();
  }
}

async function search() {
  showLoading();
  const id = document.getElementById("searchId").value.trim();

  let url = `https://localhost:7165/api/RegistrosInfestacoes/`;

  if (id) {
    url += `${encodeURIComponent(id)}`;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      displayErrorModal("Infestacões não encontradas");
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length === 0) {
      displayErrorModal(`Nenhuma infestacão encontrada com o ${`ID ${id}`}`);
    } else if (data.id) {
      // Se a resposta for um objeto (pesquisa por ID), transformá-la em um array
      populateTable([data], `Id: ${id}`);
    } else {
      populateTable(data, `Id: ${id}`);
    }
  } catch (error) {
    displayErrorModal(`Nenhuma infestacão encontrada com o ${`ID ${id}`}`);
  } finally {
    hideLoading();
  }
}

function populateTable(data, title) {
  const container = document.getElementById("reportTableContainer");
  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = `<p class="no-data-message">Nenhum dado encontrado para o ${title}.</p>`;
    return;
  }

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Criar o cabeçalho da tabela
  const headerRow = document.createElement("tr");

  const headers = [
    "Id da Infestação",
    "Nome da Plantação",
    "Nome da Praga",
    "Tipo de Controle",
    "Controle Adequado",
    "Data de Registro",
    "Data de Conclusão do Tratamento",
    "Status",
  ];
  headers.forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Adicionar dados ao corpo da tabela
  data.forEach((infestacao) => {
    const row = document.createElement("tr");
    const cells = [
      infestacao.id,
      infestacao.plantacao.id + " - " + infestacao.plantacao.nome,
      infestacao.praga.nomeDaPraga,
      infestacao.praga.tipoControle,
      infestacao.praga.controleAdequado,
      formatDate(infestacao.dataRegistro),
      infestacao.dataConclusaoTratamento
        ? formatDate(infestacao.dataConclusaoTratamento)
        : "Tratamento não concluído",
      infestacao.status,
    ];
    cells.forEach((text) => {
      const td = document.createElement("td");
      td.textContent = text;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  container.innerHTML = `<h3>Relatório de Infestacões - ${title}</h3>`;
  container.appendChild(table);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function showLoading() {
  document.getElementById(
    "reportTableContainer"
  ).innerHTML = `<div class="loading-mask"><p>Carregando...</p></div>`;
}

function hideLoading() {
  document.querySelector(".loading-mask")?.remove();
}

// Função para gerar PDF da tabela
function generatePdf() {
  const { jsPDF } = window.jspdf; // Pegando a instância do jsPDF
  const doc = new jsPDF();

  const reportTitleElement = document.querySelector("#reportTableContainer h3");
  const titleText = reportTitleElement
    ? reportTitleElement.textContent
    : "Relatório";

  // Adicionar o título do relatório no PDF
  doc.setFontSize(16);
  doc.text(titleText, 20, 20);

  // Adicionar a data e hora atual
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  // Formatar a data e hora
  const dateString = now
    .toLocaleDateString("pt-BR", options)
    .replace(/(\d{2}:\d{2}:\d{2})/, "$1 horas");

  // Adicionar a data, o dia da semana e a hora no PDF
  doc.setFontSize(12);
  doc.text(`Gerado em: ${dateString}`, 20, 30);

  // Verifica se há uma tabela renderizada
  const table = document.querySelector("#reportTableContainer table");

  if (!table) {
    displayErrorModal("Nenhuma tabela encontrada para gerar o PDF.");
    return;
  }

  // Define estilos para as colunas
  const columnStyles = {
    0: { columnWidth: 20 }, // Largura da primeira coluna
    1: { columnWidth: 20 }, // Largura da segunda coluna
    2: { columnWidth: 25 }, // Largura da terceira coluna
    3: { columnWidth: 25 }, // Largura da quarta coluna
    4: { columnWidth: 25 }, // Largura da quinta coluna
    5: { columnWidth: 25 }, // Largura da sexta coluna
    6: { columnWidth: 25 }, // Largura da sétima coluna
    7: { columnWidth: 20 }, // Largura da sétima coluna
  };

  doc.autoTable({ html: table, startY: 40, columnStyles });

  // Salvar o PDF
  doc.save("relatorio_infestacoes.pdf");
  // Adiciona eventos de fechar popup
}

function exportarParaExcel() {
  // Captura a tabela e a converte para uma string
  const tabela = document.querySelector("#reportTableContainer table");
  let dados = "";
  for (let i = 0; i < tabela.rows.length; i++) {
    let linha = tabela.rows[i];
    for (let j = 0; j < linha.cells.length; j++) {
      dados +=
        linha.cells[j].innerText + (j === linha.cells.length - 1 ? "" : ",");
    }
    dados += "\n";
  }

  // Converte para Blob no formato de arquivo CSV
  const blob = new Blob([dados], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const reportTitleElement = document.querySelector("#reportTableContainer h3");
  // Define nome do arquivo e o link de download
  link.href = url;
  link.download = `${reportTitleElement.textContent}.xls`;
  link.click();

  // Limpa a URL temporária
  URL.revokeObjectURL(url);
}
