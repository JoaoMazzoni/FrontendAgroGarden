// script.js
document.addEventListener("DOMContentLoaded", () => {
  const listaProdutos = document.getElementById("listaProdutos");
  const addProdutoButton = document.getElementById("addProdutoButton");
  const documentoFuncionario = document.getElementById("documentoFuncionario");
  let produtosAdicionados = [];

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

  carregarProduto();
  carregarCliente();

  // Adicionar produto na lista
  addProdutoButton.addEventListener("click", () => {
    const produtoVenda = document.getElementById("produto").value.split("-");
    const quantidade = document.getElementById("quantidade").value;

    if (produto && quantidade) {
      produtosAdicionados.push({
        produtoVenda: produtoVenda[0],
        produtoNome: produtoVenda[1],
        valor: produtoVenda[2],
        quantidade,
      });
      atualizarListaProdutos();
      document.getElementById("produto").value = ""; // Limpa o campo
      document.getElementById("quantidade").value = ""; // Limpa o campo
    } else {
      displayErrorModal("Preencha o nome do produto e a quantidade.");
    }
  });

  documentoFuncionario.value = user.cpf;

  // Atualiza a lista de produtos no HTML
  function atualizarListaProdutos() {
    listaProdutos.innerHTML = "";
    let total = 0;
    const produtoValor = document.getElementById("valorTotal");
    produtosAdicionados.forEach((item, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
      <span>Produto: ${item.produtoVenda} - ${item.produtoNome} , Quantidade: ${item.quantidade}, R$${item.valor}(un)</span>
      <button class="delete-btn" data-index="${index}" aria-label="Excluir produto">
        <i class="fas fa-trash-alt delete-icon" data-id="${index}"></i>
      </button>
      `;
      listaProdutos.appendChild(li);
      total += Number(item.valor) * Number(item.quantidade);

      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          const index = e.target.getAttribute("data-index");
          produtosAdicionados.splice(index, 1); // Remove o produto pelo índice
          atualizarListaProdutos(); // Atualiza a lista
        });
      });
    });
    produtoValor.value = "R$" + total.toFixed(2);
  }

  async function carregarProduto() {
    try {
      const response = await fetch(
        `https://localhost:7165/api/Produtos/Ativos`
      );

      if (response.ok) {
        const produtos = await response.json();

        if (Array.isArray(produtos) && produtos.length > 0) {
          preencherDropdownProdutos(produtos);
        } else {
          displayErrorModal("Nenhum produto disponível.");
          document.getElementById("produtosId").innerHTML =
            '<option value="">Nenhum produto encontrado</option>';
        }
      } else {
        const errorMessage = await response.text();
        displayErrorModal("Erro ao carregar produtos: " + errorMessage);
      }
    } catch (error) {
      displayErrorModal("Erro ao se conectar ao servidor: " + error.message);
    }
  }

  async function carregarCliente() {
    try {
      const response = await fetch(
        `https://localhost:7165/api/Clientes/Ativos`
      );

      if (response.ok) {
        const clientes = await response.json();

        if (Array.isArray(clientes) && clientes.length > 0) {
          preencherDropdownClientes(clientes);
        } else {
          displayErrorModal("Nenhum clientes disponível.");
          document.getElementById("clientesId").innerHTML =
            '<option value="">Nenhum clientes encontrado</option>';
        }
      } else {
        const errorMessage = await response.text();
        displayErrorModal("Erro ao carregar clientes: " + errorMessage);
      }
    } catch (error) {
      displayErrorModal("Erro ao se conectar ao servidor: " + error.message);
    }
  }

  function preencherDropdownProdutos(produtos) {
    const produtoSelect = document.getElementById("produto");
    produtoSelect.innerHTML = '<option value="">Selecione um produto</option>'; // Reseta o dropdown

    produtos.forEach((produto) => {
      if (produto.lote) {
        // Verifica se os dados existem
        const option = document.createElement("option");
        option.value =
          produto.lote +
          "-" +
          produto.nomeProduto +
          "-" +
          produto.valorUnitario;
        option.textContent = `${
          produto.lote + " - " + produto.nomeProduto
        } - Data de vencimento: ${dataFormatada(produto.dataValidade)}`;
        produtoSelect.appendChild(option);
      } else {
        displayErrorModal("Produto com dados incompletos:", produto);
      }
    });
  }

  function preencherDropdownClientes(clientes) {
    const clienteSelect = document.getElementById("documentoCliente");
    clienteSelect.innerHTML = '<option value="">Selecione um Cliente</option>'; // Reseta o dropdown

    clientes.forEach((cliente) => {
      console.log(cliente.cnpj);
      if (cliente.cnpj) {
        // Verifica se os dados existem
        const option = document.createElement("option");
        option.value = cliente.cnpj;
        option.textContent = `${cliente.cnpj + " - " + cliente.razaoSocial}`;
        clienteSelect.appendChild(option);
      } else {
        displayErrorModal("Cliente com dados incompletos:", produto);
      }
    });
  }

  function dataFormatada(dataValidade) {
    date = new Date(dataValidade);
    day = String(date.getUTCDate()).padStart(2, "0");
    mes = (date.getMonth() + 1).toString(); //+1 pois no getMonth Janeiro começa com zero.
    mesF = mes.length == 1 ? "0" + mes : mes;
    anoF = date.getFullYear();
    return day + "/" + mesF + "/" + anoF;
  }
  // Enviar o formulário com todos os produtos
  document.getElementById("vendaForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const documentoCliente = document.getElementById("documentoCliente").value;
    const documentoFuncionario = document.getElementById(
      "documentoFuncionario"
    ).value;
    const formaPagamento = document.getElementById("formaPagamento").value;
    if (produtosAdicionados.length === 0) {
      displayErrorModal("Adicione pelo menos um produto.");
      return;
    }

    const dadosVenda = {
      documentoCliente,
      documentoFuncionario,
      produtoVenda: produtosAdicionados.map((x) => {
        return { produtoVenda: x.produtoVenda, quantidade: x.quantidade };
      }),
      formaPagamento,
    };

    // Enviar os dados da venda via POST
    fetch("https://localhost:7165/api/Vendas/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosVenda),
    })
      .then(async (response) => {
        if (!response.ok) {
          displayErrorModal(await response.text());
          return;
        }
        showSuccessModal();
      })
      .then((data) => {
        document.getElementById("produto").value = ""; // Limpa o campo
        document.getElementById("quantidade").value = ""; // Limpa o campo
        document.getElementById("documentoCliente").value = ""; // Limpa o campo
        produtosAdicionados = [];
        atualizarListaProdutos();
      })
      .catch((error) => {
        displayErrorModal("Erro ao cadastrar a venda ");
      });
  });

  // Função para exibir modal de sucesso
  function showSuccessModal() {
    const modal = document.getElementById("successModal");
    if (modal) {
      modal.style.display = "flex";
    } else {
      console.error("Modal de sucesso não encontrada.");
    }
  }

  // Adiciona eventos de fechar popup
  document
    .querySelector("#successModal .close")
    ?.addEventListener("click", function () {
      document.getElementById("successModal").style.display = "none";
    });
  document
    .querySelector("#errorModal .close")
    ?.addEventListener("click", function () {
      document.getElementById("errorModal").style.display = "none";
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
});
