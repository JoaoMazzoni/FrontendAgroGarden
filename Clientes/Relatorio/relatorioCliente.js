// Função de inicialização (opcional)
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

  fetchData();
});

// Função para buscar clientes por status
function fetchData(status) {
  let url = "";

  switch (status) {
    case "Ativos":
      url = "https://localhost:7165/api/Clientes/Ativos";
      break;
    case "Inativos":
      url = "https://localhost:7165/api/Clientes/Inativos";
      break;
    default:
      url = "https://localhost:7165/api/Clientes/";
      break;
  }

  fetch(url)
    .then(async (response) => {
      if (!response.ok) {
        renderNoDataMessage("Nenhum cliente encontrado.");
      }
      return await response.json();
    })
    .then((data) => {
      if (!data || data.length === 0) {
        renderNoDataMessage(
          "Nenhuma cliente encontrado com o status selecionado."
        );
      } else {
        renderTable(data, `Status: ${status ? status : "Todos"}`);
      }
    });
}

// Função para renderizar a tabela de clientes
function renderTable(clientes, title) {
  const tableContainer = document.getElementById("reportTableContainer");
  tableContainer.innerHTML = ""; // Limpa o conteúdo anterior

  if (!clientes || clientes.length === 0) {
    renderNoDataMessage("Nenhum cliente encontrado com o status selecionado.");
    return;
  }

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Cabeçalho da tabela
  thead.innerHTML = `
    <tr>
      <th>CNPJ</th>
      <th>Razão Social</th>
      <th>Telefone</th>
      <th>Email</th>
      <th>Status</th>
      <th>Endereço</th>
    </tr>
  `;

  // Preenchendo a tabela com os dados
  clientes.forEach((cliente) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cliente.cnpj || "Não informado"}</td>
      <td>${cliente.razaoSocial || "Não informado"}</td>
      <td>${cliente.telefone || "Não informado"}</td>
      <td>${cliente.email || "Não informado"}</td>
      <td>${cliente.status || "Não informado"}</td>
      <td>${formatEndereco(cliente.endereco)}</td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.innerHTML = `<h3>Relatório de Clientes - ${title}</h3>`;
  tableContainer.appendChild(table);
}

// Função para formatar o endereço
function formatEndereco(endereco) {
  if (!endereco) return "Endereço não informado";
  return `${endereco.rua || ""}, ${endereco.numero || ""} - ${
    endereco.cidade || ""
  }, ${endereco.estado || ""}, ${endereco.cep || ""}`;
}

// Função para renderizar uma mensagem quando nenhum dado é encontrado
function renderNoDataMessage(message) {
  const tableContainer = document.getElementById("reportTableContainer");
  tableContainer.innerHTML = `<p class="no-data-message">${message}</p>`;
}

// Função de busca por CNPJ ou nome
function searchCliente() {
  let cnpj = document.getElementById("searchCNPJ").value.trim();
  cnpj = cnpj.replace(/\D/g, ""); // Remove caracteres não numéricos

  let url = "";

  if (cnpj) {
    // Busca por CNPJ
    url = `https://localhost:7165/api/Clientes/${cnpj}`; // Ajuste o endpoint se necessário
  } else {
    renderNoDataMessage("Por favor, insira um CNPJ válido.");
    return;
  }

  fetch(url)
    .then(async (response) => {
      if (!response.ok) {
        renderNoDataMessage("Nenhum cliente encontrado.");
      }
      return await response.json();
    })
    .then((data) => {
      if (!data || (Array.isArray(data) && data.length === 0)) {
        renderNoDataMessage(
          "Nenhum cliente encontrado com o CNPJ ou nome informado."
        );
      } else {
        const clientes = Array.isArray(data) ? data : [data];
        renderTable(
          clientes,
          `Busca por ${cnpj ? `CNPJ: ${cnpj}` : `Nome: ${nome}`}`
        );
      }
    })
    .catch((error) => {
      displayErrorModal("Erro ao buscar cliente: " + error.message);
    });
}

// Função para gerar PDF da tabela
function generatePDF() {
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
    0: { columnWidth: 30 }, // Largura da primeira coluna
    1: { columnWidth: 30 }, // Largura da segunda coluna
    2: { columnWidth: 30 }, // Largura da terceira coluna
    3: { columnWidth: 30 }, // Largura da quarta coluna
    4: { columnWidth: 30 }, // Largura da quinta coluna
    5: { columnWidth: 30 }, // Largura da sexta coluna
    6: { columnWidth: 30 }, // Largura da sétima coluna
  };

  doc.autoTable({ html: table, startY: 40, columnStyles });

  doc.save("clientes.pdf");
}

// Adicionando eventos aos botões de busca e geração de PDF
document.getElementById("searchBtn").addEventListener("click", searchCliente);

document
  .getElementById("generatePdfBtn")
  .addEventListener("click", generatePDF);

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
