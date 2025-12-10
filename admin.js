function debounce(fn, delay=300){
  let timer;
  return function(...args){
    clearTimeout(timer);
    timer = setTimeout(()=>fn.apply(this, args), delay);
  };
}

const API_URL = 'https://products-api.sergej-kaldesic.workers.dev/';
let products = [];
let currentIndex = null;

const sidebar = document.getElementById('product-sidebar');
const content = document.getElementById('product-details');
const addBtn = document.getElementById('add-product-btn');

const TAGS = ['Novo', 'Poslovni', 'Gamer', 'Premium'];

// --- FETCH proizvoda ---
async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    products = data.products || data;
    renderSidebar();
  } catch(err) {
    console.error(err);
    alert('Ne mogu da učitam proizvode.');
  }
}

// --- SIDEBAR ---
function renderSidebar() {
  // ukloni samo prethodna dugmad proizvoda, ne + Novi proizvod
  sidebar.querySelectorAll('button.product-tab').forEach(b => b.remove());

  products.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.textContent = p.title || 'Bez naziva';
    btn.className = 'product-tab';
    if(i === currentIndex) btn.classList.add('active');

    btn.addEventListener('click', () => {
      currentIndex = i;
      updateActiveSidebarButton();
      renderProductDetails(currentIndex);
    });

    sidebar.appendChild(btn);
  });
}

// --- UPDATE ACTIVE BUTTON ---
function updateActiveSidebarButton() {
  sidebar.querySelectorAll('button.product-tab').forEach(btn => btn.classList.remove('active'));
  if(currentIndex !== null){
    const btns = sidebar.querySelectorAll('button.product-tab');
    if(btns[currentIndex]) btns[currentIndex].classList.add('active');
  }
}

// --- UPDATE UI ---
function updateProductDetailsUI(index) {
  const p = products[index];
  content.innerHTML = `
    <div class="grid grid-cols-3 gap-8">
      <div class="col-span-2 space-y-6">
        <div class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-4">Product Details</h3>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="title">Naziv proizvoda</label>
              <input class="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-primary dark:text-white" type="text" id="title" value="${p.title||''}"/>
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="shortDesc">Kratak opis</label>
              <input class="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-primary dark:text-white" type="text" id="shortDesc" value="${p.shortDesc||''}"/>
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="description">Detaljan opis</label>
              <textarea class="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-primary dark:text-white" id="description" rows="5">${p.description||''}</textarea>
            </div>
          </div>
        </div>
        <div class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-4">Specifikacije</h3>
          <textarea id="specs" class="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-primary dark:text-white h-20">${p.specs.map(s=>`${s.label}:${s.value}`).join('\n')}</textarea>
        </div>
      </div>
      <div class="col-span-1 space-y-6">
        <div class="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white mb-4">Slike</h3>
          <div class="grid grid-cols-2 gap-4">
            ${(p.images||[]).map(src=>`<img src="${src}" class="aspect-square w-full rounded-lg object-cover">`).join('')}
            <div class="flex aspect-square w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:text-primary transition-colors text-slate-500 dark:text-slate-400">
              <div class="text-center">
                <span class="material-symbols-outlined text-4xl">upload</span>
                <p class="mt-1 text-sm">Upload Image</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('title').value = p.title || '';
  document.getElementById('shortDesc').value = p.shortDesc || '';
  document.getElementById('description').value = p.description || '';
  document.getElementById('specs').value = p.specs.map(s=>`${s.label}:${s.value}`).join('\n');
  document.getElementById('price').value = p.price==='Cena na upit' ? '' : p.price;

  const tagContainer = document.getElementById('tagContainer');
  tagContainer.querySelectorAll('button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tag === p.tag);
  });

  const imgContainer = document.getElementById('imagePreviewContainer');
  imgContainer.innerHTML = '';
  (p.images||[]).forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'product-image-preview';
    imgContainer.appendChild(img);
  });
}

// --- RENDER DETALJA ---
function renderProductDetails(index) {
  const p = products[index];
  content.innerHTML = `
    <div>
      <div class="input-field"><label>Naziv proizvoda</label><input type="text" id="title" class="w-full p-2 border rounded"/></div>
      <div class="input-field"><label>Kratak opis</label><input type="text" id="shortDesc" class="w-full p-2 border rounded"/></div>
      <div class="input-field"><label>Detaljan opis</label><textarea id="description" class="w-full p-2 border rounded h-24"></textarea></div>
      <div class="input-field"><label>Specifikacije</label><textarea id="specs" class="w-full p-2 border rounded h-20"></textarea>
        <p class="text-sm text-gray-400 mt-1">Format: label:value po liniji</p></div>
      <div class="input-field"><label>Cena</label><input type="text" id="price" class="w-full p-2 border rounded"/>
        <p class="text-sm text-gray-400 mt-1">Ako ostane prazno, prikazaće "Cena na upit"</p></div>
      <div class="input-field"><label>Tag</label><div id="tagContainer" class="flex gap-2 flex-wrap">
        ${TAGS.map(tag => `<button type="button" data-tag="${tag}" class="tag-btn px-3 py-1 border rounded">${tag}</button>`).join('')}
      </div></div>
      <div class="input-field"><label>Slike</label><input type="file" id="imageUpload" accept="image/*" multiple/>
        <div id="imagePreviewContainer" class="flex flex-wrap gap-3"></div></div>
      <button id="saveBtn" class="bg-indigo-500 text-white px-4 py-2 rounded">Sačuvaj</button>
      <button id="deleteBtn" class="bg-red-500 text-white px-4 py-2 rounded ml-2">Obriši</button>
      <span class="save-confirm" id="saveConfirm">Sačuvano!</span>
    </div>
  `;
  updateProductDetailsUI(index);

  const inputs = ['title','shortDesc','description','specs','price'];
  inputs.forEach(id=>{
    const el = document.getElementById(id);
    el.addEventListener('input', debounce(()=>{
      if(currentIndex===null) return;
      const val = el.value.trim();
      switch(id){
        case 'title': products[currentIndex].title = val; break;
        case 'shortDesc': products[currentIndex].shortDesc = val; break;
        case 'description': products[currentIndex].description = val; break;
        case 'specs': 
          products[currentIndex].specs = val.split('\n').map(line=>{
            const [label,...rest] = line.split(':');
            return {label: label?.trim()||'', value: rest.join(':').trim()||''};
          });
          break;
        case 'price':
          products[currentIndex].price = val || 'Cena na upit';
          break;
      }
    }, 300));
  });

  // --- EVENT LISTENERS ---
  document.getElementById('price').addEventListener('input', e=>{
    let val = e.target.value.replace(/[^0-9.]/g,'');
    const parts = val.split('.');
    if(parts.length>2) val = parts[0]+'.'+parts[1];
    e.target.value = val;
  });

  // Tagovi
  document.getElementById('tagContainer').addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    document.querySelectorAll('#tagContainer button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    products[currentIndex].tag = btn.dataset.tag;
  });

  // Upload slika
  const imgInput = document.getElementById('imageUpload');
  const imgContainer = document.getElementById('imagePreviewContainer');
  imgInput.addEventListener('change', e=>{
    const files = [...e.target.files];
    if(files.length + (products[currentIndex].images?.length || 0) > 30){ 
      Swal.fire({icon:'error', text:'Maksimalno 30 slika!'}); 
      return; 
    }
    files.forEach(file=>{
      const reader = new FileReader();
      reader.onload = ev=>{
        const img = document.createElement('img');
        img.src = ev.target.result;
        img.className='product-image-preview';
        imgContainer.appendChild(img);
        if(!products[currentIndex].images) products[currentIndex].images = [];
        products[currentIndex].images.push(ev.target.result);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });

  document.getElementById('saveBtn').addEventListener('click', ()=>saveProduct(currentIndex));
  document.getElementById('deleteBtn').addEventListener('click', ()=>deleteProduct(currentIndex));
}

// --- SAVE ---
async function saveProduct(index){
  const p = products[index];
  const title = document.getElementById('title').value.trim();
  const shortDesc = document.getElementById('shortDesc').value.trim();
  const description = document.getElementById('description').value.trim();
  const specsText = document.getElementById('specs').value.trim();
  const price = document.getElementById('price').value.trim();
  const tag = document.getElementById('tagContainer').querySelector('.active')?.dataset.tag || '';
  const imgs = products[index].images || [];
  if(!title||!shortDesc||!description||!specsText||!tag||imgs.length===0){
    Swal.fire({icon:'error', text:'Popunite sva polja!'}); return;
  }
  const specs = specsText.split('\n').map(line=>{
    const [label,...rest]=line.split(':');
    return {label:label?.trim()||'', value:rest.join(':').trim()||''};
  });
  products[index] = {...p, title, shortDesc, description, specs, price:price||'Cena na upit', tag, images:imgs};

  const saveConfirm = document.getElementById('saveConfirm');
  saveConfirm.innerHTML=`<span class="spinner"></span> Čuvanje...`;
  saveConfirm.style.display='inline-flex';

  try{
    await fetch(API_URL,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({products})});
    saveConfirm.innerHTML='✔ Sačuvano!';
    setTimeout(()=>saveConfirm.style.display='none',2000);
    renderSidebar();
  }catch(err){
    console.error(err); saveConfirm.style.display='none';
    Swal.fire({icon:'error', text:'Greška pri čuvanju!'});
  }
}

// --- DELETE ---
async function deleteProduct(index){
  Swal.fire({
    title:'Obrisati proizvod?', 
    text: products[index].title || '',
    icon:'warning', 
    showCancelButton:true, 
    confirmButtonText:'Da', 
    cancelButtonText:'Otkaži'
  }).then(async result => {
    if(result.isConfirmed){
      products.splice(index,1);
      try{
        await fetch(API_URL, {
          method:'POST', 
          headers:{'Content-Type':'application/json'}, 
          body:JSON.stringify({products})
        });
        currentIndex = null;
        renderSidebar();  // samo ažurira sidebar, početni tekst je u HTML-u
      } catch(err) {
        console.error(err);
        Swal.fire({icon:'error', text:'Greška pri brisanju!'});
      }
    }
  });
}

// --- ADD NOVI ---
addBtn.addEventListener('click', ()=>{
  const newProd = {title:'', shortDesc:'', description:'', specs:[], price:'', tag:'', images:[]};
  products.push(newProd);
  currentIndex = products.length-1;
  renderSidebar();
  renderProductDetails(currentIndex);
});

// --- INIT ---
fetchProducts();
