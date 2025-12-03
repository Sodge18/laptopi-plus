const API_URL = 'https://products-api.sergej-kaldesic.workers.dev/';
let products = [];

// Jedna funkcija za proveru duplikata – koristi se svuda
function isTitleTaken(title, excludeIndex = -1) {
  const normalized = title.trim().toLowerCase();
  return products.some((p, i) => 
    i !== excludeIndex && p.title && p.title.trim().toLowerCase() === normalized
  );
}

// Učitavanje proizvoda iz KV
async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch");
    products = await res.json();

    // Ako nema proizvoda ili je prazno – ostavi prazan niz
    if (!Array.isArray(products)) products = [];

    renderProducts();
    console.log("Proizvodi učitani:", products);
  } catch (err) {
    console.error("Greška pri učitavanju:", err);
    document.getElementById('products-list').innerHTML = '<p style="color:red;text-align:center;">Ne mogu da učitam proizvode. Proveri internet ili Worker.</p>';
  }
}

// Renderovanje proizvoda
function renderProducts() {
  const list = document.getElementById('products-list');

  if (products.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:3rem;color:#6b7280;">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        <div style="margin-top:1rem;font-size:1.1rem;">Još uvek nema proizvoda</div>
        <div style="font-size:0.9rem;margin-top:0.5rem;">Klikni na "+ Novi proizvod" da dodaš prvi</div>
      </div>
    `;
    return;
  }

  list.innerHTML = products.map((p, i) => `
    <div style="margin-bottom:1.5rem;padding:1rem;background:#fff;border:1px solid #e5e7eb;border-radius:8px;">
      <div style="display:grid;grid-template-columns:1fr 1fr 200px 150px 1fr auto;gap:0.75rem;align-items:start;">
        
        <input value="${p.title || ''}" data-index="${i}" data-field="title" placeholder="Naziv proizvoda" style="font-weight:600;"/>

        <input value="${p.shortDesc || ''}" data-index="${i}" data-field="shortDesc" placeholder="Kratak opis"/>

        <input value="${p.price || ''}" data-index="${i}" data-field="price" placeholder="Cena" style="width:100px;"/>

        <input value="${p.tag || ''}" data-index="${i}" data-field="tag" placeholder="Tag (npr. new)" style="width:120px;"/>

        <textarea data-index="${i}" data-field="description" placeholder="Pun opis..." style="min-height:70px;resize:vertical;">${p.description || ''}</textarea>

        <div style="display:flex;gap:0.5rem;">
          <button data-index="${i}" class="save" style="background:#6366f1;color:white;padding:0.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">Sačuvaj</button>
          <button data-index="${i}" class="delete" style="background:#ef4444;color:white;padding:0.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">Obriši</button>
        </div>
      </div>
    </div>
  `).join('');

  // Save dugme
  document.querySelectorAll('.save').forEach(btn => {
    btn.onclick = async (e) => {
      const i = parseInt(e.target.dataset.index);
      const row = e.target.closest('div');
      const inputs = row.querySelectorAll('input, textarea');
      const newData = {};

      let hasError = false;

      inputs.forEach(el => {
        const field = el.dataset.field;
        const value = el.value.trim();
        newData[field] = value;

        if (field === 'title') {
          if (!value) {
            el.style.border = '2px solid #ef4444';
            hasError = true;
          } else if (isTitleTaken(value, i)) {
            el.style.border = '2px solid #ef4444';
            alert(`Greška: Proizvod sa nazivom "${value}" već postoji!`);
            hasError = true;
          } else {
            el.style.border = '1px solid #d1d5db';
          }
        }
      });

      if (hasError) return;

      // Ažuriraj proizvod
      products[i] = { ...products[i], ...newData };
      await saveProducts();
      alert(`"${newData.title}" sačuvan!`);
    };
  });

  // Delete dugme
  document.querySelectorAll('.delete').forEach(btn => {
    btn.onclick = async (e) => {
      const i = parseInt(e.target.dataset.index);
      if (confirm(`Da li sigurno želiš da obrišeš "${products[i].title}"?`)) {
        products.splice(i, 1);
        await saveProducts();
        renderProducts();
        alert("Proizvod obrisan!");
      }
    };
  });
}

// Dodavanje novog proizvoda – bez duplikata
document.getElementById('add-product').onclick = () => {
  let counter = 1;
  let newTitle;
  do {
    newTitle = `Novi proizvod ${counter}`;
    counter++;
  } while (isTitleTaken(newTitle));

  products.push({
    id: Date.now(),
    title: newTitle,
    shortDesc: '',
    price: '0.00',
    tag: 'new',
    description: '',
    images: []
  });

  renderProducts();
  alert(`Dodat: ${newTitle}`);
};

// Čuvanje svih proizvoda u KV
async function saveProducts() {
  // Provera da li ima prazan ili duplikat naziv
  const titles = products.map(p => p.title?.trim().toLowerCase()).filter(Boolean);
  if (titles.length !== new Set(titles).size) {
    alert("Greška: Postoje duplirani nazivi proizvoda!");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products)
    });

    if (res.ok) {
      console.log("Svi proizvodi sačuvani u KV!");
    } else {
      throw new Error("Neuspešno čuvanje");
    }
  } catch (err) {
    console.error("Greška pri čuvanju:", err);
    alert("Neuspešno čuvanje na server!");
  }
}

// Pokreni odmah
fetchProducts();
