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
});

async function fetchData(filter) {
  showLoading();
  try {
    const response = await fetch(
      `https://localhost:7165/api/Colheitas/${filter}`
    );
    if (!response.ok) {
      throw new Error("Erro ao buscar colheitas");
    }
    const data = await response.json();
    populateTable(data, `Filtro: ${filter}`);
  } catch (error) {
    console.error(error);
    document.getElementById(
      "reportTableContainer"
    ).innerHTML = `<p class="no-data-message">Nenhum dado encontrado para o filtro ${filter}.</p>`;
  } finally {
    hideLoading();
  }
}

async function search() {
  showLoading();
  const number = document.getElementById("searchNumber").value.trim();
  const id = document.getElementById("searchId").value.trim();
  const startDate = document.getElementById("searchStartDate").value;
  const endDate = document.getElementById("searchEndDate").value;

  let url = `https://localhost:7165/api/Colheitas`;

  if (number) {
    url += `/${number}`;
  } else if (id) {
    url += `/concluida/Plantacao/${id}`;
  } else if (startDate && endDate) {
    url += `/data?startDate=${encodeURIComponent(
      startDate
    )}&endDate=${encodeURIComponent(endDate)}`;
  } else {
    alert(
      "Por favor, insira um número de colheita, ID ou intervalo de datas para pesquisa."
    );
    hideLoading();
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Colheitas não encontradas");
    }
    let data = await response.json(); // Use let em vez de const para permitir reatribuição

    // Verificar se a resposta é um objeto e converter para array se necessário
    if (data && !Array.isArray(data)) {
      data = [data]; // Converte objeto para array com um único item
    }

    if (Array.isArray(data) && data.length === 0) {
      document.getElementById(
        "reportTableContainer"
      ).innerHTML = `<p class="no-data-message">Nenhuma colheita encontrada com o ${
        number
          ? `Número de Registro ${number}`
          : id
          ? `ID ${id}`
          : `entre ${startDate} e ${endDate}`
      }</p>`;
    } else {
      populateTable(
        data,
        number
          ? `Número: ${number}`
          : id
          ? `ID: ${id}`
          : `Data entre ${startDate} e ${endDate}`
      );
    }
  } catch (error) {
    console.error(error);
    document.getElementById(
      "reportTableContainer"
    ).innerHTML = `<p class="no-data-message">Nenhuma colheita encontrada com o ${
      number
        ? `Número ${number}`
        : id
        ? `ID ${id}`
        : `entre ${startDate} e ${endDate}`
    }</p>`;
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
    "Número da Colheita",
    "ID da Plantação",
    "Data de Colheita",
    "Status",
  ];
  headers.forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Adicionar dados ao corpo da tabela
  data.forEach((item) => {
    const row = document.createElement("tr");
    const cells = [
      item.numeroRegistro,
      item.plantacao.id + " - " + item.plantacao.nome || "Desconhecido",
      formatDate(item.dataColheita),
      item.status,
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
  container.innerHTML = `<h3>Relatório de Colheitas - ${title}</h3>`;
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

function generatePdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Obter título do relatório
  const reportTitle = document.querySelector("#reportTableContainer h3");
  const titleText = reportTitle ? reportTitle.textContent : "Relatório";

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

  // Adicionar a tabela ao PDF
  const table = document.querySelector("#reportTableContainer table");
  if (table) {
    // Adicionar tabela ao PDF usando autoTable
    doc.autoTable({ html: table, startY: 40 });
  }

  // Salvar o PDF
  doc.save("relatorio_colheitas.pdf");
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
