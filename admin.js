// --- HELPERI ---
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' })[tag] || tag);
}

// --- KONFIG ---
const API_URL = "https://products-api.sergej-kaldesic.workers.dev/";
let products = [];
let currentIndex = null;
const sidebarDesktop = document.getElementById("sidebar-desktop");
const sidebarMobile = document.getElementById("sidebar-mobile");
const content = document.getElementById("product-details");
const mobileTitle = document.getElementById("mobileTitle");
const mobileSidebar = document.getElementById("mobileSidebar");
const mobileOverlay = document.getElementById("mobileSidebarOverlay");
const openSidebarBtn = document.getElementById("openMobileSidebar");
const closeSidebarBtn = document.getElementById("closeMobileSidebar");
const bottomMenuBtn = document.getElementById("bottomMenuBtn");

// --- INIT sa AUTH ---
async function init() {
  // Jednostavan auth placeholder (promijeni na JWT ili bolje kasnije)
  const password = prompt("Unesite admin password:");
  if (password !== "your_secure_password") { // Zamijeni sa pravim (ili koristi backend auth)
    alert("Pogrešan password!");
    return;
  }

  await fetchProducts();
  openSidebarBtn.addEventListener("click", openMobileSidebar);
  closeSidebarBtn.addEventListener("click", closeMobileSidebar);
  mobileOverlay.addEventListener("click", closeMobileSidebar);
  bottomMenuBtn.addEventListener("click", openMobileSidebar);
  document.getElementById("add-product-desktop")?.addEventListener("click", addNewProduct);
  document.getElementById("add-product-mobile")?.addEventListener("click", addNewProduct);
  document.getElementById("bottomAddBtn").addEventListener("click", addNewProduct);
}

function openMobileSidebar() {
  mobileSidebar.classList.add("open");
  mobileOverlay.classList.add("open");
}

function closeMobileSidebar() {
  mobileSidebar.classList.remove("open");
  mobileOverlay.classList.remove("open");
}

// --- FETCH PRODUCTS (sa cachingom) ---
async function fetchProducts() {
  content.innerHTML = `<div class="flex justify-center items-center h-full"><div class="loader"></div></div>`;
  try {
    const res = await fetch(API_URL, { headers: { 'Authorization': 'Basic your_auth_here' } }); // Dodaj auth header ako treba
    const data = await res.json();
    products = Array.isArray(data.products) ? data.products : [];
    if (products.length) currentIndex = 0;
    renderSidebars();
    renderCurrentProduct();
  } catch (err) {
    console.error(err);
    content.innerHTML = `<div class="text-center mt-20 text-red-500 text-lg">Greška pri učitavanju proizvoda.</div>`;
  }
}

// --- RENDER SIDEBARS (optimizovano sa diff-om) ---
function renderSidebars() {
  const sidebars = [sidebarDesktop, sidebarMobile];
  sidebars.forEach(sidebar => {
    if (!sidebar) return;
    const fragment = document.createDocumentFragment();
    products.forEach((p, i) => {
      const btn = document.createElement("button");
      btn.textContent = escapeHTML(p.title || "Novi proizvod");
      btn.className = `w-full text-left px-4 py-3 rounded-xl transition ${i === currentIndex ? "bg-primary text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`;
      btn.onclick = () => {
        currentIndex = i;
        renderSidebars(); // Samo update, ne rebuild cijeli DOM
        renderCurrentProduct();
        closeMobileSidebar();
      };
      fragment.appendChild(btn);
    });
    sidebar.innerHTML = ''; // Clear samo jednom
    sidebar.appendChild(fragment);
  });
}

// --- RENDER CURRENT PRODUCT (podijeljeno na helper-e) ---
function renderCurrentProduct() {
  if (currentIndex === null || !products[currentIndex]) {
    content.innerHTML = `
      <div class="text-center mt-20 text-gray-500 text-lg">
        Nema proizvoda.<br><br>
        Dodajte novi klikom na <strong>Novi proizvod</strong>.
      </div>
    `;
    mobileTitle.textContent = "Laptopi Plus Admin";
    document.getElementById("bottomSaveBtn").classList.add("hidden");
    document.getElementById("bottomDeleteBtn").classList.add("hidden");
    return;
  }
  const p = products[currentIndex];
  mobileTitle.textContent = escapeHTML(p.title || "Novi proizvod");
  const specsList = ["CPU","RAM","GPU","Memorija","Ekran","Baterija","OS","Težina","Dimenzije","Portovi","Bežične konekcije","Kamera","Audio"];
  if (!p.specs) p.specs = {};
  specsList.forEach(l => { if (!(l in p.specs)) p.specs[l] = ""; });
  const TAGS = ["Novo", "Poslovni", "Gamer", "Premium"];

  content.innerHTML = `
    <div class="max-w-5xl mx-auto space-y-6">
      <h2 class="text-2xl font-bold text-center md:hidden">${escapeHTML(p.title || "Novi proizvod")}</h2>
      ${renderBasicInfo(p)}
      ${renderSpecs(specsList, p.specs)}
      ${renderImages(p.images || [])}
      ${renderPriceAndTags(p, TAGS)}
      <div class="flex flex-col md:flex-row gap-4">
        <button id="saveBtn" class="flex-1 bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary/90">Sačuvaj proizvod</button>
        <button id="deleteBtn" class="flex-1 bg-red-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-red-700">Obriši proizvod</button>
      </div>
      <p class="save-confirm text-center text-lg" id="saveConfirm">Sačuvano!</p>
    </div>
  `;
  document.getElementById("bottomSaveBtn").classList.remove("hidden");
  document.getElementById("bottomDeleteBtn").classList.remove("hidden");
  bindEvents();
}

function renderBasicInfo(p) {
  return `
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 space-y-6 shadow-sm border">
      <div>
        <label class="block text-sm font-medium mb-2">Naziv proizvoda</label>
        <input id="title" value="${escapeHTML(p.title||'')}" placeholder="Unesite naziv..."/>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">Kratak opis</label>
        <input id="shortDesc" value="${escapeHTML(p.shortDesc||'')}" placeholder="Kratak opis za karticu..."/>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">Detaljan opis</label>
        <textarea id="description" rows="6">${escapeHTML(p.description||'')}</textarea>
      </div>
    </div>
  `;
}

function renderSpecs(specsList, specs) {
  return `
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border">
      <h3 class="text-lg font-semibold mb-4">Specifikacije</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${specsList.map(label => `
          <div>
            <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">${label}</label>
            <input type="text" class="spec-value" data-label="${label}" value="${escapeHTML(specs[label]||'')}" placeholder="${label}..."/>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderImages(images) {
  return `
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border space-y-4">
      <h3 class="text-lg font-semibold">Slike (${images.length})</h3>
      <div class="grid grid-cols-3 md:grid-cols-4 gap-3">
        ${images.map((src,i)=>`
          <div class="relative aspect-square rounded-xl overflow-hidden border">
            <img src="${src}" alt="Slika proizvoda ${i+1}" class="w-full h-full object-cover" loading="lazy"/>
            <button class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center delete-image" data-index="${i}" aria-label="Obriši sliku">×</button>
          </div>
        `).join('')}
        <button id="imageUpload" class="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center text-4xl text-slate-400 hover:text-primary hover:border-primary">+</button>
      </div>
    </div>
  `;
}

function renderPriceAndTags(p, TAGS) {
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border">
        <h3 class="text-lg font-semibold mb-4">Cena (€)</h3>
        <input id="price" value="${p.price==='Cena na upit'?'':escapeHTML(p.price)}" placeholder="Unesite cenu ili ostavite prazno"/>
      </div>
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border">
        <h3 class="text-lg font-semibold mb-4">Tag</h3>
        <div class="flex flex-wrap gap-3">
          ${TAGS.map(t => `<button type="button" data-tag="${t}" class="tag-btn ${p.tag===t?'active':''}">${t}</button>`).join('')}
        </div>
      </div>
    </div>
  `;
}

// --- BIND EVENTS ---
function bindEvents() {
  if (currentIndex === null) return;
  const p = products[currentIndex];
  ["title","shortDesc","description","price"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.oninput = debounce(() => {
      const val = el.value.trim();
      if (id === "title") {
        p.title = val;
        mobileTitle.textContent = escapeHTML(val || "Novi proizvod");
        renderSidebars(); // Update samo
      } else if (id === "shortDesc") p.shortDesc = val;
      else if (id === "description") p.description = val;
      else if (id === "price") p.price = val || "Cena na upit";
    }, 300);
  });
  document.querySelectorAll(".spec-value").forEach(inp => {
    inp.oninput = debounce(() => {
      p.specs[inp.dataset.label] = inp.value.trim();
    }, 300);
  });
  document.querySelectorAll(".tag-btn").forEach(btn => {
    btn.onclick = () => {
      p.tag = btn.dataset.tag;
      document.querySelectorAll(".tag-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
  });
  document.querySelectorAll(".delete-image").forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index);
      p.images.splice(idx, 1);
      renderCurrentProduct();
    };
  });

  // Image upload premješten na backend (worker.js treba da ima /upload endpoint)
  document.getElementById("imageUpload").onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async e => {
      const files = [...e.target.files];
      if (files.length === 0) return;
      const uploadBtn = document.getElementById("imageUpload");
      uploadBtn.innerHTML = "Uploadujem...";
      uploadBtn.disabled = true;
      try {
        for (let file of files) {
          const formData = new FormData();
          formData.append('image', file);
          const res = await fetch(`${API_URL}upload`, { // Novi endpoint u worker.js
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.link) {
            p.images.push(data.link);
          } else {
            Swal.fire({icon: "error", text: `Greška pri uploadu ${file.name}`});
          }
        }
        renderCurrentProduct();
      } catch (err) {
        console.error(err);
        Swal.fire({icon: "error", text: "Greška pri uploadu!"});
      } finally {
        uploadBtn.innerHTML = "+";
        uploadBtn.disabled = false;
      }
    };
    input.click();
  };

  document.getElementById("saveBtn").onclick = saveProduct;
  document.getElementById("bottomSaveBtn").onclick = saveProduct;
  document.getElementById("deleteBtn").onclick = deleteProduct;
  document.getElementById("bottomDeleteBtn").onclick = deleteProduct;
}

// --- SAVE / DELETE / ADD ---
async function saveProduct() {
  if (currentIndex === null) return;
  const p = products[currentIndex];
  if (!p.title || !p.shortDesc || !p.description || !p.tag || !p.images.length) {
    Swal.fire({icon:"warning", title:"Nedostaju podaci", text:"Popunite sva obavezna polja i dodajte bar jednu sliku."});
    return;
  }
  try {
    await fetch(`${API_URL}?id=${p.id}`, {
      method: "POST",
      headers: {"Content-Type":"application/json", 'Authorization': 'Basic your_auth_here'},
      body: JSON.stringify(p)
    });
    document.getElementById("saveConfirm").style.display = "block";
    setTimeout(() => document.getElementById("saveConfirm").style.display = "none", 2000);
    renderSidebars();
  } catch (err) {
    console.error(err);
    Swal.fire({icon:"error", text:"Greška pri čuvanju!"});
  }
}

async function deleteProduct() {
  if (currentIndex === null) return;
  const p = products[currentIndex];
  const res = await Swal.fire({
    title: "Obrisati proizvod?",
    text: escapeHTML(p.title || "Ovaj proizvod"),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Da, obriši",
    cancelButtonText: "Otkaži"
  });
  if (!res.isConfirmed) return;
  try {
    await fetch(`${API_URL}?id=${p.id}`, {
      method: "DELETE",
      headers: { 'Authorization': 'Basic your_auth_here' }
    });
    products.splice(currentIndex, 1);
    currentIndex = products.length ? Math.max(0, currentIndex - 1) : null;
    renderSidebars();
    renderCurrentProduct();
    Swal.fire({icon:"success", text:"Proizvod obrisan!"});
  } catch (err) {
    console.error(err);
    Swal.fire({icon:"error", text:"Greška pri brisanju!"});
  }
}

function addNewProduct() {
  const newProd = {
    id: crypto.randomUUID(),
    title: "",
    shortDesc: "",
    description: "",
    specs: {},
    price: "",
    tag: "Novo",
    images: []
  };
  products.push(newProd);
  currentIndex = products.length - 1;
  renderSidebars();
  renderCurrentProduct();
  closeMobileSidebar();
}

// Pozovi init
init();
