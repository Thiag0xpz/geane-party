const WHATSAPP_NUMBER="351961388502";function waUrl(msg=""){const text=encodeURIComponent(msg);return text?`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`:`https://wa.me/${WHATSAPP_NUMBER}`}const products=[{id:"coelhinha",name:"Kit Jardim da Coelhinha Rosa",category:"menina",tag:"Menina",price:69,image:window.Shopify?"":"assets/kit-coelhinha.jpg",asset:"kit-coelhinha.jpg",description:"Kit delicado com composição rosa para aniversário encantador."},{id:"magali",name:"Kit Magali Melancia",category:"menina",tag:"Colorido",price:69,image:"",asset:"kit-magali.jpg",description:"Tema divertido e alegre para festa infantil."},{id:"mar",name:"Kit Fundo do Mar",category:"menino",tag:"Menino",price:69,image:"",asset:"kit-fundo-do-mar.jpg",description:"Tema azul com fundo do mar para festa criativa."},{id:"ursinhos",name:"Kit Ursinhos Carinhosos",category:"menina",tag:"Menina",price:69,image:"",asset:"kit-ursinhos.jpg",description:"Kit suave, fofo e colorido para festa delicada."},{id:"brawl",name:"Kit Brawl Stars",category:"menino",tag:"Gamer",price:69,image:"",asset:"kit-brawl-stars.jpg",description:"Tema gamer forte para aniversário cheio de energia."},{id:"pink",name:"Kit Pink Party 30",category:"adulto",tag:"Adulto",price:69,image:"",asset:"kit-pink-party.jpg",description:"Kit pink moderno para comemorações adultas."}];
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);let state={cart:JSON.parse(localStorage.getItem("gp_cart")||"[]"),filter:"todos",search:"",selected:null};function assetUrl(name){const img=document.querySelector(`img[src*="${name}"]`);if(img)return img.src;return `/cdn/shop/files/${name}`}
function money(v){return new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v)}function save(){localStorage.setItem("gp_cart",JSON.stringify(state.cart))}function count(){return state.cart.reduce((s,i)=>s+i.qty,0)}function total(){return state.cart.reduce((s,i)=>{const p=products.find(x=>x.id===i.id);return s+(p?p.price*i.qty:0)},0)}function productImg(p){return (window.GEANE_ASSETS&&window.GEANE_ASSETS[p.asset])?window.GEANE_ASSETS[p.asset]:assetUrl(p.asset)}
function kitDetailItems(p){
  const base=['KIT DE cilindros P M G','Arco 1,5 metros','Painel temático','Bandejas decorativas'];
  const extras={
    coelhinha:['Paleta rosa e bege','Decoração delicada para 1 aninho','Elementos decorativos fofos'],
    magali:['Tema Magali Melancia','Cores vivas e alegres','Composição infantil divertida'],
    mar:['Tema Fundo do Mar','Tons azuis e elementos marinhos','Ideal para festa infantil criativa'],
    ursinhos:['Tema Ursinhos Carinhosos','Cores suaves e delicadas','Visual fofo para festa infantil'],
    brawl:['Tema gamer Brawl Stars','Cores fortes e modernas','Ideal para aniversário de menino'],
    pink:['Tema Pink Party','Visual adulto e moderno','Perfeito para comemoração feminina']
  };
  return [...base,...(extras[p.id]||[])];
}
function kitWhatsAppMessage(p){
  return `Olá, Geane Party! Tenho interesse neste kit:

${p.name}
Preço: ${money(p.price)}
Composição: KIT DE cilindros P M G + arco 1,5 metros

Podem confirmar disponibilidade e valor final?`;
}
function normalizeText(value){return (value||"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim()}
function searchable(p){return normalizeText(`${p.name} ${p.tag} ${p.description} ${p.category}`)}
function applySearch(value,{scroll=false}={}){state.search=value||"";renderProducts();if(scroll)document.querySelector('#kits')?.scrollIntoView({behavior:'smooth',block:'start'});}
function renderProducts(){const grid=$("#productsGrid");if(!grid)return;const term=normalizeText(state.search);const list=products.filter(p=>(state.filter==="todos"||p.category===state.filter||normalizeText(p.tag)===state.filter)&&(!term||searchable(p).includes(term)));const status=$("#searchStatus");if(status){if(term){status.innerHTML=`<strong>${list.length}</strong> kit${list.length===1?"":"s"} encontrado${list.length===1?"":"s"} para <b>“${state.search}”</b> <button type="button" id="clearSearchBtn">Limpar pesquisa</button>`;status.classList.add("active")}else{status.innerHTML="";status.classList.remove("active")}}grid.innerHTML=list.map(p=>`<article class="product-card"><div class="product-image"><span class="badge">${p.tag}</span><img src="${productImg(p)}" alt="${p.name}" loading="lazy"></div><div class="product-info"><h3>${p.name}</h3><p>${p.description}</p><div class="meta"><span class="tag">Kit P M G + arco 1,5m</span><strong class="price">${money(p.price)}</strong></div><div class="card-actions"><button class="details" data-details="${p.id}">Detalhes</button><button class="add" data-add="${p.id}">Adicionar</button></div></div></article>`).join("")||`<div class="no-results"><strong>Nenhum kit encontrado.</strong><span>Tenta pesquisar por: Magali, Fundo do Mar, Brawl Stars, Ursinhos ou Pink.</span><button type="button" id="clearSearchBtn">Ver todos os kits</button></div>`}
function renderCart(){const items=$("#cartItems");$$('[data-cart-count]').forEach(e=>e.textContent=count());const totalEl=$("#cartTotal");if(totalEl)totalEl.textContent=money(total());if(!items)return;if(!state.cart.length){items.innerHTML='<p>O carrinho está vazio.</p>';return}items.innerHTML=state.cart.map(i=>{const p=products.find(x=>x.id===i.id);return`<div class="cart-item"><img src="${productImg(p)}" alt="${p.name}"><div><div class="cart-line"><strong>${p.name}</strong><b>${money(p.price*i.qty)}</b></div><div class="cart-line qty"><span>Qtd: ${i.qty}</span><span><button data-dec="${p.id}">−</button> <button data-inc="${p.id}">+</button></span></div></div></div>`}).join("")}
function add(id){const item=state.cart.find(i=>i.id===id);if(item)item.qty++;else state.cart.push({id,qty:1});save();renderCart();document.querySelector('.floating-cart')?.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:300})}function qty(id,d){const item=state.cart.find(i=>i.id===id);if(!item)return;item.qty+=d;if(item.qty<=0)state.cart=state.cart.filter(i=>i.id!==id);save();renderCart()}
function openModal(id){
  const p=products.find(x=>x.id===id);
  state.selected=p;
  $('#modalImage').src=productImg(p);
  $('#modalImage').alt=p.name;
  $('#modalTitle').textContent=p.name;
  $('#modalDescription').textContent=p.description;
  $('#modalTag').textContent=p.tag;
  $('#modalPrice').textContent=money(p.price);
  const cat=$('#modalCategory');
  if(cat)cat.textContent=p.tag;
  $('#modalIncludes').innerHTML=kitDetailItems(p).map(x=>`<li>${x}</li>`).join('');
  $('#productModal').classList.add('active');
}
function closeModal(){$('#productModal')?.classList.remove('active')}function openCart(){$('.cart-drawer')?.classList.add('active')}function closeCart(){$('.cart-drawer')?.classList.remove('active')}
function checkout(){if(!state.cart.length){openCart();return}const lines=state.cart.map((i,n)=>{const p=products.find(x=>x.id===i.id);return`${n+1}. ${p.name}\n• Quantidade: ${i.qty}\n• Subtotal: ${money(p.price*i.qty)}`}).join('\n\n');const msg=`Olá, Geane Party! Quero orçamento para:\n\n${lines}\n\nTotal estimado: ${money(total())}\n\nData do evento: ${$('#orderDate')?.value||''}\nEndereço: ${$('#orderAddress')?.value||''}\nObservações: ${$('#orderNotes')?.value||''}`;window.open(waUrl(msg),'_blank','noopener,noreferrer')}
function bind(){document.addEventListener('click',e=>{const t=e.target.closest('[data-add],[data-details],[data-open-cart],[data-close-cart],[data-inc],[data-dec],[data-close-modal],.gallery-card,[data-close-photo],#clearSearchBtn');if(!t)return;if(t.id==='clearSearchBtn'){state.search='';const input=document.getElementById('marketSearchTop');if(input)input.value='';renderProducts();document.querySelector('#kits')?.scrollIntoView({behavior:'smooth',block:'start'});return}if(t.dataset.add)add(t.dataset.add);if(t.dataset.details)openModal(t.dataset.details);if(t.hasAttribute('data-open-cart'))openCart();if(t.hasAttribute('data-close-cart'))closeCart();if(t.dataset.inc)qty(t.dataset.inc,1);if(t.dataset.dec)qty(t.dataset.dec,-1);if(t.hasAttribute('data-close-modal'))closeModal();if(t.classList.contains('gallery-card')){$('#photoViewerImg').src=t.dataset.gallerySrc;$('#photoViewer').classList.add('active')}if(t.hasAttribute('data-close-photo'))$('#photoViewer').classList.remove('active')});$$('.cat').forEach(b=>b.addEventListener('click',()=>{$$('.cat').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.filter=b.dataset.filter;renderProducts();document.querySelector('#kits')?.scrollIntoView({behavior:'smooth',block:'start'})}));const search=document.getElementById('marketSearchTop');if(search){search.addEventListener('input',e=>applySearch(e.target.value));search.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();applySearch(e.currentTarget.value,{scroll:true});e.currentTarget.blur();return false}});search.addEventListener('search',e=>applySearch(e.currentTarget.value,{scroll:true}))}$('#checkoutBtn')?.addEventListener('click',checkout);$('#modalAddBtn')?.addEventListener('click',()=>{if(state.selected){add(state.selected.id);openCart()}});$('#modalWhatsappBtn')?.addEventListener('click',()=>{if(state.selected)window.open(waUrl(kitWhatsAppMessage(state.selected)),'_blank','noopener,noreferrer')})}document.addEventListener('DOMContentLoaded' ,()=>{document.querySelector('#year')&&(document.querySelector('#year').textContent=new Date().getFullYear());renderProducts();renderCart();bind()});




/* Pesquisa única dos kits */
(function(){
  const input = document.querySelector('#singleKitSearchInput') || document.querySelector('#searchInput');
  const note = document.querySelector('#searchResultNote');
  const grid = document.querySelector('#productsGrid');
  const section = document.querySelector('#kits') || grid?.closest('section');

  function normalize(text){
    return (text || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }

  function getCards(){
    if (!grid) return [];
    return Array.from(grid.children).filter(el => el.nodeType === 1);
  }

  function applySearch(term){
    const q = normalize(term);
    let visible = 0;
    getCards().forEach(card => {
      const text = normalize(card.innerText || card.textContent || '');
      const match = !q || text.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visible += 1;
    });
    if (note) note.textContent = q ? `${visible} kit(s) encontrado(s)` : '';
  }

  input?.addEventListener('input', e => applySearch(e.target.value));
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applySearch(input.value);
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();


/* Arrastar modelo 2 linhas com mouse/touch */
(function(){
  document.querySelectorAll('.drag-2rows-grid, .products-grid').forEach(grid => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    grid.addEventListener('mousedown', e => {
      isDown = true;
      grid.classList.add('is-dragging');
      startX = e.pageX - grid.offsetLeft;
      scrollLeft = grid.scrollLeft;
    });

    grid.addEventListener('mouseleave', () => {
      isDown = false;
      grid.classList.remove('is-dragging');
    });

    grid.addEventListener('mouseup', () => {
      isDown = false;
      grid.classList.remove('is-dragging');
    });

    grid.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - grid.offsetLeft;
      const walk = (x - startX) * 1.3;
      grid.scrollLeft = scrollLeft - walk;
    });
  });
})();
