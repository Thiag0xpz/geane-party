/* WHATSAPP PROFISSIONAL GEANE PARTY: mensagem estruturada com referência do pedido, fotos por link, composição do kit e próximos passos. */
/* WHATSAPP FOTO NOTE: wa.me não anexa imagem automaticamente; por isso a mensagem inclui o link direto da foto do kit. */

const WHATSAPP_NUMBER = "351961388502";
const products = window.GEANE_PRODUCTS || [];

const state = {
  cart: JSON.parse(localStorage.getItem("geaneCart") || "[]"),
  selectedProduct: null
};

const els = {
  grid: document.querySelector("#productsGrid"),
  cartDrawer: document.querySelector(".cart-drawer"),
  cartItems: document.querySelector("#cartItems"),
  cartTotal: document.querySelector("#cartTotal"),
  cartCounts: document.querySelectorAll("[data-cart-count]"),
  checkoutBtn: document.querySelector("#checkoutBtn"),
  clearCartBtn: document.querySelector("#clearCartBtn"),
  orderDate: document.querySelector("#orderDate"),
  orderLocation: document.querySelector("#orderLocation"),
  orderNotes: document.querySelector("#orderNotes"),
  modal: document.querySelector("#productModal"),
  modalImage: document.querySelector("#modalImage"),
  modalTag: document.querySelector("#modalTag"),
  modalTitle: document.querySelector("#modalTitle"),
  modalDescription: document.querySelector("#modalDescription"),
  modalIncludes: document.querySelector("#modalIncludes"),
  modalPrice: document.querySelector("#modalPrice"),
  modalAddBtn: document.querySelector("#modalAddBtn"),
  modalWhatsAppBtn: document.querySelector("#modalWhatsAppBtn")
};

function money(v){
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(v);
}

function saveCart(){
  localStorage.setItem("geaneCart", JSON.stringify(state.cart));
}

function getCartQty(){
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal(){
  return state.cart.reduce((sum, item) => {
    const p = products.find(product => product.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function normalize(text){
  return (text || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function renderProducts(term = ""){
  const query = normalize(term);
  const filtered = products.filter(product => {
    const searchable = normalize(`${product.name} ${product.category} ${product.tag} ${product.description}`);
    return !query || searchable.includes(query);
  });

  if (!els.grid) return;

  function productCard(product) {
    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="image-wrap">
          <span class="product-badge">${product.tag}</span>
          <img src="${product.image}" alt="${product.name}" loading="lazy" decoding="async">
        </div>
        <div class="product-body">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-meta">
            <span class="category">${product.category}</span>
            <span class="price">${money(product.price)}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-soft" type="button" data-details="${product.id}">Detalhes</button>
            <button class="btn btn-primary" type="button" data-add="${product.id}">Adicionar</button>
          </div>
        </div>
      </article>
    `;
  }

  if (!filtered.length) {
    els.grid.innerHTML = `<div class="empty-cart" style="grid-column:1/-1">Nenhum kit encontrado.</div>`;
  } else {
    const rowOne = filtered.filter((_, index) => index % 2 === 0).map(productCard).join("");
    const rowTwo = filtered.filter((_, index) => index % 2 === 1).map(productCard).join("");

    els.grid.innerHTML = `
      <div class="products-row products-row-1" aria-label="Linha 1 dos kits">${rowOne}</div>
      <div class="products-row products-row-2" aria-label="Linha 2 dos kits">${rowTwo}</div>
    `;
  }

  const note = document.querySelector("#searchResultNote");
  if (note) note.textContent = query ? `${filtered.length} kit(s) encontrado(s)` : "";
}

function renderCart(){
  els.cartCounts.forEach(count => count.textContent = getCartQty());
  if (els.cartTotal) els.cartTotal.textContent = money(getCartTotal());
  if (!els.cartItems) return;

  if (!state.cart.length) {
    els.cartItems.innerHTML = `<div class="empty-cart"><h3>O carrinho está vazio</h3><p>Adicione um kit para começar.</p></div>`;
    return;
  }

  els.cartItems.innerHTML = state.cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return "";

    return `
      <article class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <div class="cart-line">
            <h3>${product.name}</h3>
            <strong>${money(product.price * item.qty)}</strong>
          </div>
          <span class="category">${money(product.price)} / unidade</span>
          <div class="cart-line">
            <div class="qty-controls">
              <button type="button" data-decrease="${product.id}">−</button>
              <strong>${item.qty}</strong>
              <button type="button" data-increase="${product.id}">+</button>
            </div>
            <button class="remove-item" type="button" data-remove="${product.id}">Remover</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function addToCart(id){
  const existing = state.cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else state.cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  document.querySelector(".floating-cart")?.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }],
    { duration: 260, easing: "ease-out" }
  );
}

function updateQty(id, delta){
  const item = state.cart.find(item => item.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function openCart(){
  els.cartDrawer?.classList.add("active");
  els.cartDrawer?.setAttribute("aria-hidden", "false");
}

function closeCart(){
  els.cartDrawer?.classList.remove("active");
  els.cartDrawer?.setAttribute("aria-hidden", "true");
}

function openModal(id){
  const product = products.find(p => p.id === id);
  if (!product || !els.modal) return;

  state.selectedProduct = product;
  els.modalImage.src = product.image;
  els.modalImage.alt = product.name;
  els.modalTag.textContent = product.tag;
  els.modalTitle.textContent = product.name;
  els.modalDescription.textContent = product.description;
  els.modalPrice.textContent = money(product.price);
  els.modalIncludes.innerHTML = (product.includes || []).map(item => `<li><span>✓</span><strong>${item}</strong></li>`).join("");
  els.modal.classList.add("active");
  els.modal.setAttribute("aria-hidden", "false");
}

function closeModal(){
  els.modal?.classList.remove("active");
  els.modal?.setAttribute("aria-hidden", "true");
}


function askProductOnWhatsApp(){
  const product = state.selectedProduct;
  if (!product) return;

  const pedidoId = `GP-KIT-${Date.now().toString().slice(-6)}`;

  const message = [
    "*GEANE PARTY | PEDIDO DE INFORMAÇÃO*",
    "",
    `Referência: *${pedidoId}*`,
    "Tenho interesse no seguinte *Kit Pegue e Monte*:",
    "",
    `*Kit:* ${product.name}`,
    `*Valor estimado:* ${money(product.price)}`,
    `*Foto do kit:* ${product.image}`,
    "",
    "*Composição incluída:*",
    ...(product.includes || []).map(item => `• ${item}`),
    "",
    "*Dados do evento:*",
    "Data da festa: A confirmar",
    "Endereço completo: A confirmar",
    "Observações: A confirmar",
    "",
    "Pode confirmar disponibilidade, valor final com entrega/recolha e próximos passos para reserva?",
    "",
    "Obrigado(a)."
  ].join("\n");

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

function checkout(){
  if (!state.cart.length) return openCart();

  const pedidoId = `GP-${Date.now().toString().slice(-6)}`;
  const kits = state.cart.map((item, index) => {
    const product = products.find(p => p.id === item.id);
    if (!product) return "";

    return [
      `*${index + 1}. ${product.name}*`,
      `Quantidade: ${item.qty}`,
      `Valor unitário: ${money(product.price)}`,
      `Subtotal: ${money(product.price * item.qty)}`,
      `Foto do kit: ${product.image}`,
      `Composição: ${(product.includes || []).join(" + ")}`
    ].join("\n");
  }).filter(Boolean);

  const message = [
    "*GEANE PARTY | SOLICITAÇÃO DE ORÇAMENTO*",
    "",
    `Pedido: *${pedidoId}*`,
    "Tipo de serviço: *Kit Pegue e Monte*",
    "",
    "*KITS SELECIONADOS*",
    "",
    ...kits,
    "",
    "*TOTAL ESTIMADO*",
    `${money(getCartTotal())}`,
    "",
    "*DADOS DO EVENTO*",
    `Data da festa: ${els.orderDate?.value || "A confirmar"}`,
    `Endereço completo: ${els.orderLocation?.value || "A confirmar"}`,
    `Observações: ${els.orderNotes?.value || "Sem observações"}`,
    "",
    "*PRÓXIMO PASSO*",
    "Por favor, confirme disponibilidade para a data, valor final com entrega/recolha e instruções para pagamento por MB WAY.",
    "",
    "Obrigado(a)."
  ].join("\n");

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

function bindSearch(){
  const inputs = [
    document.querySelector("#singleKitSearchInput"),
    document.querySelector("#singleKitSearchInputBottom")
  ].filter(Boolean);

  inputs.forEach(input => {
    input.addEventListener("input", event => {
      inputs.forEach(other => {
        if (other !== input) other.value = event.target.value;
      });
      renderProducts(event.target.value);
    });

    input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        renderProducts(input.value);
        document.querySelector("#kits")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  document.querySelector("#gpSearchForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const value = document.querySelector("#singleKitSearchInput")?.value || "";
    renderProducts(value);
    document.querySelector("#kits")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

document.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  const details = event.target.closest("[data-details]");
  const open = event.target.closest("[data-open-cart]");
  const close = event.target.closest("[data-close-cart]");
  const closeModalBtn = event.target.closest("[data-close-modal]");
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  const remove = event.target.closest("[data-remove]");

  if (add) addToCart(add.dataset.add);
  if (details) openModal(details.dataset.details);
  if (open) openCart();
  if (close) closeCart();
  if (closeModalBtn) closeModal();
  if (increase) updateQty(increase.dataset.increase, 1);
  if (decrease) updateQty(decrease.dataset.decrease, -1);
  if (remove) {
    state.cart = state.cart.filter(item => item.id !== remove.dataset.remove);
    saveCart();
    renderCart();
  }
});

els.checkoutBtn?.addEventListener("click", checkout);
els.clearCartBtn?.addEventListener("click", () => {
  state.cart = [];
  saveCart();
  renderCart();
});
els.modalWhatsAppBtn?.addEventListener("click", askProductOnWhatsApp);

els.modalAddBtn?.addEventListener("click", () => {
  if (state.selectedProduct) {
    addToCart(state.selectedProduct.id);
    closeModal();
    openCart();
  }
});

function applyPageRoute(){
  const params = new URLSearchParams(window.location.search);
  const selectedPage = params.get("gp_page");
  const sections = document.querySelectorAll(".gp-page-section");
  const titles = {
    kits: "Kits Pegue e Monte",
    como: "Como funciona",
    pagamento: "Método de pagamento",
    resumo: "Resumo dos kits"
  };

  document.body.classList.toggle("gp-page-mode", Boolean(selectedPage));
  document.body.classList.toggle("gp-home-mode", !selectedPage);

  sections.forEach(section => {
    const isMenuOnly = section.classList.contains("gp-menu-only");
    const shouldShow = selectedPage ? section.dataset.gpPage === selectedPage : !isMenuOnly;
    section.hidden = !shouldShow;
    section.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  });

  if (selectedPage && titles[selectedPage]) {
    document.title = `${titles[selectedPage]} | Geane Party`;
    window.addEventListener("load", () => window.scrollTo({ top: 0, behavior: "auto" }));
  }
}

applyPageRoute();
renderProducts();
renderCart();
bindSearch();




/* MENU DE TÓPICOS + PESQUISA DO HEADER */
(function(){
  const panel = document.querySelector("#topicPanel");
  const openBtn = document.querySelector("#topicMenuOpen");
  const closeBtn = document.querySelector("#topicMenuClose");
  const overlay = document.querySelector("#topicOverlay");
  const links = document.querySelectorAll(".gp-topic-link");
  const searchBtn = document.querySelector("#siteSearchOpen");
  const searchBox = document.querySelector("#siteSearchBox");
  const searchInput = document.querySelector("#singleKitSearchInput");

  function openMenu(){
    if (!panel) return;
    panel.classList.add("active");
    panel.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
  }

  function closeMenu(){
    if (!panel) return;
    panel.classList.remove("active");
    panel.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
  }

  openBtn?.addEventListener("click", openMenu);
  closeBtn?.addEventListener("click", closeMenu);
  overlay?.addEventListener("click", closeMenu);
  links.forEach(link => link.addEventListener("click", closeMenu));

  searchBtn?.addEventListener("click", () => {
    if (!searchBox) return;
    searchBox.classList.toggle("active");
    searchBox.setAttribute("aria-hidden", searchBox.classList.contains("active") ? "false" : "true");
    if (searchBox.classList.contains("active")) {
      setTimeout(() => searchInput?.focus(), 80);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      searchBox?.classList.remove("active");
    }
  });
})();



/* Galeria removida para deixar o site mais leve. */
