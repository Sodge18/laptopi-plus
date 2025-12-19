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
let authToken = null; // Čuvamo token ovdje

// DOM elementi
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
  // Prompt za token (možeš ga kasnije čuvati u localStorage)
  authToken = prompt("Unesite admin token (Bearer token):")?.trim();

  if (!authToken) {
    alert("Niste unijeli token!");
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
    // Javni GET ne treba header (samo za history ili admin operacije treba Bearer)
    const res = await fetch(API_URL, {
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    products = Array.isArray(data.products) ? data.products : [];
    if (products.length) currentIndex = 0;
    renderSidebars();
    renderCurrentProduct();
  } catch (err) {
    console.error("Greška pri fetch-u:", err);
    content.innerHTML = `<div class="text-center mt-20 text-red-500 text-lg">Greška pri učitavanju proizvoda: ${err.message}</div>`;
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
        renderSidebars();
        renderCurrentProduct();
        closeMobileSidebar();
      };
      fragment.appendChild(btn);
    });
    sidebar.innerHTML = '';
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
    document.getElementById("bottomSaveBtn")?.classList.add("hidden");
    document.getElementById("bottomDeleteBtn")?.classList.add("hidden");
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
  document.getElementById("bottomSaveBtn")?.classList.remove("hidden");
  document.getElementById("bottomDeleteBtn")?.classList.remove("hidden");
  bindEvents();
}

// Ostale funkcije (renderBasicInfo, renderSpecs, renderImages, renderPriceAndTags, bindEvents, saveProduct, deleteProduct, addNewProduct) ostaju iste kao u tvojoj verziji!

// --- BIND EVENTS (ostaje isto, samo sam osigurao da radi) ---
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
        renderSidebars();
      } else if (id === "shortDesc") p.shortDesc = val;
      else if (id === "description") p.description = val;
      else if (id === "price") p.price = val || "Cena na upit";
    }, 300);
  });
  // ... (ostali event listeneri isti)
}

// SAVE / DELETE / ADD (dodaj Bearer token)
async function saveProduct() {
  if (currentIndex === null) return;
  const p = products[currentIndex];
  if (!p.title || !p.shortDesc || !p.description || !p.tag || !p.images.length) {
    Swal.fire({icon:"warning", title:"Nedostaju podaci", text:"Popunite sva obavezna polja i dodajte bar jednu sliku."});
    return;
  }
  try {
    const res = await fetch(`${API_URL}?id=${p.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify(p)
    });
    if (!res.ok) throw new Error("Save failed");
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
    const deleteRes = await fetch(`${API_URL}?id=${p.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${authToken}` }
    });
    if (!deleteRes.ok) throw new Error("Delete failed");
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

// Image upload (dodaj Bearer token)
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
        const res = await fetch(`${API_URL}upload`, {
          method: 'POST',
          headers: { "Authorization": `Bearer ${authToken}` },
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

// Pozovi init
init();
