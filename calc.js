let cardContainer;
let searchInput = document.querySelector(".search-input");
let searchButton = document.querySelector(".search-button");
let mainArea = document.querySelector("main");
let dados = [];
let initialMainHTML = mainArea.innerHTML;

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const closeButton = document.querySelector(".close-button");

document.addEventListener("DOMContentLoaded", async () => {
    try {
        let resposta = await fetch("data.json");
        dados = await resposta.json();
        setupEventListeners();
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
});

function setupEventListeners() {
    searchButton.addEventListener("click", handleSearch);

    searchInput.addEventListener("input", () => {
        if (searchInput.value.trim() === "") {
            mainArea.innerHTML = initialMainHTML;
            setupLogoEventListeners();
        }
    });

    closeButton.addEventListener("click", closeModal);

    window.addEventListener("click", (event) => {
        if (event.target == modal) closeModal();
    });

    setupLogoEventListeners();
}

function setupLogoEventListeners() {
    const langLogos = document.querySelectorAll(".lang-logo");
    langLogos.forEach(logo => {
        logo.addEventListener("click", () => {
            const langName = logo.getAttribute("data-lang");
            openModal(langName);
        });
    });
}

function handleSearch() {
    searchInput.classList.remove("error");
    searchInput.placeholder = "Digite uma tecnologia";

    const termoPesquisa = searchInput.value.toLowerCase().trim();
    if (!termoPesquisa) return;

    mainArea.innerHTML = "";

    cardContainer = document.createElement("div");
    cardContainer.classList.add("card-container");
    mainArea.appendChild(cardContainer);

    // 1️⃣ BUSCA EXATA
    let filtrados = dados.filter(d => 
        d.nome.toLowerCase().trim() === termoPesquisa
    );

    // 2️⃣ SE NÃO ACHOU, BUSCA POR COMEÇO
    if (filtrados.length === 0) {
        filtrados = dados.filter(d =>
            d.nome.toLowerCase().startsWith(termoPesquisa)
        );
    }

    // 3️⃣ SE AINDA ASSIM NÃO ACHOU, BUSCA PARECIDOS (similaridade simples)
    if (filtrados.length === 0) {
        filtrados = dados.filter(d =>
            isSimilar(d.nome.toLowerCase(), termoPesquisa)
        );
    }

    rederizarCards(filtrados, cardContainer);
}

// 🔥 Similaridade leve sem deixar lento
function isSimilar(a, b) {
    let dist = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) dist++;
    }
    return dist <= 2; // permite até 2 erros
}

function rederizarCards(dadosParaRenderizar, container) {
    container.innerHTML = "";

    if (dadosParaRenderizar.length === 0) {
        searchInput.value = "";
        searchInput.placeholder = "Nenhum resultado encontrado.";
        searchInput.classList.add("error");

        container.innerHTML = `<button onclick="location.reload()">Voltar</button>`;
        return;
    }

    for (let dado of dadosParaRenderizar) {
        let article = document.createElement("article");
        let classeUnica = dado.nome.toLowerCase()
            .replace(/\+/g, "plus")
            .replace(/#/g, "sharp")
            .replace(/[^a-z0-9]/g, "");

        article.classList.add("card", classeUnica);

        article.innerHTML = `
            <div class="container">
                <div class="${classeUnica}">
                    <h2>${dado.nome}</h2>
                    <span>${dado.ano}</span>
                    <span>${dado.descrição}</span>
                    <a href="${dado.sobre}" target="_blank">Saiba mais</a>
                    <p>${dado.caracteristicas}</p> 
                    <img class="imagem-principal" src="${dado.img}" alt="Imagem de ${dado.nome}">
                </div>
                <div class="logo-container">
                    <img class="logo" src="${dado.logo}" alt="Logo de ${dado.nome}">
                    <p class="texto-logo"><strong>História:</strong> ${dado.historia}</p>
                </div>
            </div>`;

        container.appendChild(article);
    }
}

function openModal(langName) {
    const langData = dados.find(d =>
        d.nome.toLowerCase().trim() === langName.toLowerCase().trim()
    );
    if (!langData) return;

    limparClassesDeTema(modal);
    const themeClass = `modal-theme-${langName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    modal.classList.add(themeClass, "modal-theme-default");

    modalBody.innerHTML = `
        <div>
            <h2>${langData.nome}</h2>
            <p>${langData.caracteristicas}</p>
        </div>
    `;
    modal.style.display = "block";
}

function closeModal() {
    modal.style.display = "none";
    modalBody.innerHTML = "";
    limparClassesDeTema(modal);
}

function limparClassesDeTema(elemento) {
    const classes = elemento.className.split(" ").filter(c => !c.startsWith("modal-theme-"));
    elemento.className = classes.join(" ");
}
