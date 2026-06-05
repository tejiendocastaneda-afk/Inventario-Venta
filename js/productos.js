// ===== PRODUCTOS.JS =====

registerModule('productos', (container)=>{
  renderProductosModule(container);
});

function renderProductosModule(container){
  const prods=DB.get('productos',[]);
  container.innerHTML=`
  <div class="page-header">
    <div><div class="page-title">Inventario</div><div class="page-subtitle">${prods.length} productos registrados</div></div>
    <div class="flex gap-1">
      <button class="btn btn-secondary btn-sm" onclick="importarCSV()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Importar CSV
      </button>
      <button class="btn btn-primary" onclick="abrirFormProducto()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Producto
      </button>
    </div>
  </div>

  <div class="card mb-2" style="padding:0.75rem">
    <div class="filters-row">
      <div class="search-bar" style="flex:1;min-width:180px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="prodSearch" placeholder="Buscar por nombre, SKU, color..." oninput="filterProductos()" style="width:100%">
      </div>
      <select id="prodCatFilter" onchange="filterProductos()" style="min-width:130px">
        <option value="">Todas</option>
        <option value="ropa">👕 Ropa</option>
        <option value="zapatos">👟 Zapatos</option>
      </select>
      <select id="prodStockFilter" onchange="filterProductos()" style="min-width:130px">
        <option value="">Todo el stock</option>
        <option value="bajo">Stock bajo (≤3)</option>
        <option value="sin">Sin stock</option>
      </select>
    </div>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Imagen</th><th>Nombre</th><th>Categoría</th>
          <th>SKU</th><th>Color/Talla</th><th>Precio</th>
          <th>Stock</th><th>Estado</th><th>Acciones</th>
        </tr>
      </thead>
      <tbody id="prodTableBody"></tbody>
    </table>
  </div>`;
  filterProductos();
}

function filterProductos(){
  const q=(document.getElementById('prodSearch')||{}).value||'';
  const cat=(document.getElementById('prodCatFilter')||{}).value||'';
  const stk=(document.getElementById('prodStockFilter')||{}).value||'';
  let prods=DB.get('productos',[]);
  if(q){const ql=q.toLowerCase();prods=prods.filter(p=>(p.nombre||'').toLowerCase().includes(ql)||(p.sku||'').toLowerCase().includes(ql)||(p.color||'').toLowerCase().includes(ql));}
  if(cat)prods=prods.filter(p=>p.categoria===cat);
  if(stk==='bajo')prods=prods.filter(p=>p.stock>0&&p.stock<=3);
  if(stk==='sin')prods=prods.filter(p=>p.stock<=0);
  const tbody=document.getElementById('prodTableBody');
  if(!tbody)return;
  if(!prods.length){tbody.innerHTML=`<tr><td colspan="9" class="text-center text-muted" style="padding:2rem">Sin productos encontrados</td></tr>`;return;}

  // Guardamos el array filtrado para acceder por índice — evita problemas con IDs con caracteres especiales
  window._prodsFiltrados = prods;

  tbody.innerHTML=prods.map((p,idx)=>`<tr>
    <td><div style="width:44px;height:44px;border-radius:var(--radius-sm);background:var(--bg-tertiary);overflow:hidden;display:flex;align-items:center;justify-content:center">${p.imagen?`<img src="${p.imagen}" style="width:100%;height:100%;object-fit:cover">`:`<span>${p.categoria==='zapatos'?'👟':'👕'}</span>`}</div></td>
    <td class="td-bold">${p.nombre}</td>
    <td><span class="badge ${p.categoria==='zapatos'?'badge-blue':'badge-purple'}">${p.categoria==='zapatos'?'👟 Zapatos':'👕 Ropa'}</span></td>
    <td class="td-mono">${p.sku||'—'}</td>
    <td>${[p.color,p.talla].filter(Boolean).join(' / ')||'—'}</td>
    <td class="td-bold text-green">${fmt(p.enOferta&&p.precioOferta?p.precioOferta:p.precio)}</td>
    <td>
      <span class="${p.stock<=0?'text-red':p.stock<=3?'text-amber':'text-green'} font-bold">${p.stock}</span>
      <span class="text-muted" style="font-size:0.75rem"> uds</span>
    </td>
    <td>${p.enOferta?`<span class="badge badge-amber">En oferta</span>`:`<span class="badge badge-gray">Normal</span>`}</td>
    <td>
      <div class="flex gap-1">
        <button class="btn-icon" onclick="editarProductoPorIdx(${idx})" title="Editar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon" onclick="ajustarStockPorIdx(${idx})" title="Ajustar stock">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        </button>
        <button class="btn-icon" onclick="eliminarProductoPorIdx(${idx})" title="Eliminar" style="color:var(--accent-red)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
    </td>
  </tr>`).join('');
}

// Wrappers seguros que usan índice en vez de ID crudo en onclick
function editarProductoPorIdx(idx){
  const p=(window._prodsFiltrados||[])[idx];
  if(p)abrirFormProducto(p.id);
}
function ajustarStockPorIdx(idx){
  const p=(window._prodsFiltrados||[])[idx];
  if(p)ajustarStock(p.id);
}
function eliminarProductoPorIdx(idx){
  const p=(window._prodsFiltrados||[])[idx];
  if(p)eliminarProducto(p.id);
}

function abrirFormProducto(prodId=null){
  const prods=DB.get('productos',[]);
  const p=prodId?prods.find(x=>x.id===prodId):null;
  const titulo=p?'Editar Producto':'Nuevo Producto';
  openModal(titulo, buildProductForm(p), {lg:true});
  setTimeout(()=>{
    const catSel=document.getElementById('fp_categoria');
    if(catSel)catSel.addEventListener('change',()=>toggleProdFields());
    toggleProdFields();
    const imgInput=document.getElementById('fp_imagenFile');
    if(imgInput)imgInput.addEventListener('change',previewProductImage);
  },50);
}

function buildProductForm(p){
  const cat=p?p.categoria:'ropa';
  return `
  <div class="inp-row">
    <div class="form-group">
      <label>Categoría *</label>
      <select id="fp_categoria">
        <option value="ropa" ${cat==='ropa'?'selected':''}>👕 Ropa</option>
        <option value="zapatos" ${cat==='zapatos'?'selected':''}>👟 Zapatos</option>
      </select>
    </div>
    <div class="form-group">
      <label>SKU / Código</label>
      <input type="text" id="fp_sku" value="${p?p.sku||'':''}" placeholder="AUTO">
    </div>
  </div>
  <div class="form-group">
    <label>Nombre del producto *</label>
    <input type="text" id="fp_nombre" value="${p?p.nombre||'':''}" placeholder="Ej: Camisa Oxford">
  </div>
  <div class="inp-row">
    <div class="form-group">
      <label>Precio *</label>
      <input type="number" id="fp_precio" value="${p?p.precio||'':''}" min="0" placeholder="0">
    </div>
    <div class="form-group">
      <label>Stock *</label>
      <input type="number" id="fp_stock" value="${p?p.stock||0:0}" min="0">
    </div>
  </div>
  <div class="inp-row">
    <div class="form-group">
      <label>Color</label>
      <input type="text" id="fp_color" value="${p?p.color||'':''}" placeholder="Negro, Blanco...">
    </div>
    <div class="form-group" id="fpTallaGrp">
      <label>Talla</label>
      <input type="text" id="fp_talla" value="${p?p.talla||'':''}" placeholder="S, M, L, XL / 36, 37...">
    </div>
  </div>

  <!-- ROPA -->
  <div id="ropaFields">
    <div class="inp-row">
      <div class="form-group">
        <label>Categoría/Tipo</label>
        <input type="text" id="fp_categoriaRopa" value="${p?p.categoriaRopa||'':''}" placeholder="Camisa, Pantalón...">
      </div>
      <div class="form-group">
        <label>Modelo</label>
        <input type="text" id="fp_modelo" value="${p?p.modelo||'':''}" placeholder="Slim Fit, Regular...">
      </div>
    </div>
    <div class="inp-row">
      <div class="form-group">
        <label>Material</label>
        <input type="text" id="fp_material" value="${p?p.material||'':''}" placeholder="Algodón, Poliéster...">
      </div>
      <div class="form-group">
        <label>Género</label>
        <select id="fp_genero">
          <option value="" ${!p||!p.genero?'selected':''}>—</option>
          <option value="hombre" ${p&&p.genero==='hombre'?'selected':''}>Hombre</option>
          <option value="mujer" ${p&&p.genero==='mujer'?'selected':''}>Mujer</option>
          <option value="unisex" ${p&&p.genero==='unisex'?'selected':''}>Unisex</option>
          <option value="niño" ${p&&p.genero==='niño'?'selected':''}>Niño/a</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Detalle</label>
      <input type="text" id="fp_detalle" value="${p?p.detalle||'':''}" placeholder="Descripción del producto">
    </div>
  </div>

  <!-- ZAPATOS -->
  <div id="zapatosFields" style="display:none">
    <div class="inp-row">
      <div class="form-group">
        <label>Marca</label>
        <input type="text" id="fp_marca" value="${p?p.marca||'':''}" placeholder="Nike, Adidas...">
      </div>
      <div class="form-group">
        <label>Modelo zapato</label>
        <input type="text" id="fp_modeloZapato" value="${p?p.modeloZapato||'':''}" placeholder="Air Max, Stan Smith...">
      </div>
    </div>
    <div class="inp-row">
      <div class="form-group">
        <label>Tipo de suela</label>
        <input type="text" id="fp_suela" value="${p?p.suela||'':''}" placeholder="Caucho, EVA...">
      </div>
      <div class="form-group">
        <label>¿Tiene caja?</label>
        <select id="fp_caja">
          <option value="si" ${p&&p.cajaProd==='si'?'selected':''}>Sí</option>
          <option value="no" ${p&&p.cajaProd==='no'?'selected':''}>No</option>
        </select>
      </div>
    </div>
  </div>

  <!-- OFERTA -->
  <div class="card mt-2" style="padding:0.75rem;background:rgba(245,158,11,0.05);border-color:rgba(245,158,11,0.2)">
    <div class="perm-toggle" style="background:transparent;border:none;padding:0;margin-bottom:0.5rem">
      <span class="perm-label">¿Producto en oferta?</span>
      <label class="switch"><input type="checkbox" id="fp_enOferta" ${p&&p.enOferta?'checked':''} onchange="toggleOfertaField()"><span class="switch-slider"></span></label>
    </div>
    <div id="ofertaPriceField" style="display:${p&&p.enOferta?'block':'none'}">
      <div class="form-group"><label>Precio de oferta</label><input type="number" id="fp_precioOferta" value="${p?p.precioOferta||'':''}" min="0" placeholder="0"></div>
    </div>
  </div>

  <!-- IMAGEN -->
  <div class="form-group mt-2">
    <label>Imagen del producto</label>
    <input type="file" id="fp_imagenFile" accept="image/*" style="background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.6rem 0.9rem;color:var(--text-primary);font-size:0.85rem;width:100%">
    <div id="fp_imgPreview" style="margin-top:0.5rem;${p&&p.imagen?'':'display:none'}">
      ${p&&p.imagen?`<img src="${p.imagen}" style="width:80px;height:80px;object-fit:cover;border-radius:var(--radius-sm)">`:'' }
    </div>
    <input type="hidden" id="fp_imagenData" value="${p?p.imagen||'':''}" >
  </div>

  <input type="hidden" id="fp_id" value="${p?p.id:''}">
  <div class="modal-footer" style="padding:1rem 0 0"><button class="btn btn-primary" onclick="guardarProducto()">Guardar Producto</button><button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button></div>`;
}

function toggleOfertaField(){
  const checked=document.getElementById('fp_enOferta').checked;
  document.getElementById('ofertaPriceField').style.display=checked?'block':'none';
}

function toggleProdFields(){
  const cat=document.getElementById('fp_categoria').value;
  document.getElementById('ropaFields').style.display=cat==='ropa'?'block':'none';
  document.getElementById('zapatosFields').style.display=cat==='zapatos'?'block':'none';
}

function previewProductImage(){
  const file=this.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    document.getElementById('fp_imagenData').value=e.target.result;
    const prev=document.getElementById('fp_imgPreview');
    prev.style.display='block';
    prev.innerHTML=`<img src="${e.target.result}" style="width:80px;height:80px;object-fit:cover;border-radius:var(--radius-sm)">`;
  };
  reader.readAsDataURL(file);
}

function guardarProducto(){
  const nombre=(document.getElementById('fp_nombre')||{}).value||'';
  const precio=parseFloat((document.getElementById('fp_precio')||{}).value)||0;
  const stock=parseInt((document.getElementById('fp_stock')||{}).value)||0;
  const cat=(document.getElementById('fp_categoria')||{}).value||'ropa';
  if(!nombre){toast('El nombre es obligatorio','warn');return;}
  if(!precio){toast('El precio es obligatorio','warn');return;}

  const prodId=document.getElementById('fp_id').value;
  const prods=DB.get('productos',[]);

  const prod={
    id:prodId||uid(),
    nombre, precio, stock, categoria:cat,
    sku:document.getElementById('fp_sku').value||`SKU-${Date.now().toString(36).toUpperCase()}`,
    color:document.getElementById('fp_color').value||'',
    talla:document.getElementById('fp_talla').value||'',
    imagen:document.getElementById('fp_imagenData').value||'',
    enOferta:document.getElementById('fp_enOferta').checked,
    precioOferta:parseFloat(document.getElementById('fp_precioOferta').value)||0,
  };

  if(cat==='ropa'){
    Object.assign(prod,{
      categoriaRopa:document.getElementById('fp_categoriaRopa').value||'',
      modelo:document.getElementById('fp_modelo').value||'',
      material:document.getElementById('fp_material').value||'',
      genero:document.getElementById('fp_genero').value||'',
      detalle:document.getElementById('fp_detalle').value||''
    });
  } else {
    Object.assign(prod,{
      marca:document.getElementById('fp_marca').value||'',
      modeloZapato:document.getElementById('fp_modeloZapato').value||'',
      suela:document.getElementById('fp_suela').value||'',
      cajaProd:document.getElementById('fp_caja').value||'no'
    });
  }

  if(prodId){
    const idx=prods.findIndex(p=>p.id===prodId);
    if(idx>-1)prods[idx]=prod;
  } else {
    prods.push(prod);
  }
  DB.set('productos',prods);
  closeModalDirect();
  toast(prodId?'Producto actualizado':'Producto creado','success');
  showModule('productos');
}

function editarProducto(id){abrirFormProducto(id);}

function eliminarProducto(id){
  if(!hasPerm('productos')){toast('Sin permiso','error');return;}
  // Guardamos el id en variable global temporal para el confirm
  window._pendingDeleteProdId = id;
  openModal('Eliminar Producto',`
    <p style="color:var(--text-secondary)">¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.</p>
    <div class="modal-footer" style="padding:1rem 0 0">
      <button class="btn btn-danger" onclick="confirmarEliminarProducto()">Eliminar</button>
      <button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button>
    </div>`);
}

function confirmarEliminarProducto(){
  const id = window._pendingDeleteProdId;
  if(!id){closeModalDirect();return;}
  const prods=DB.get('productos',[]).filter(p=>p.id!==id);
  DB.set('productos',prods);
  window._pendingDeleteProdId = null;
  closeModalDirect();
  toast('Producto eliminado','info');
  showModule('productos');
}

function ajustarStock(id){
  const prods=DB.get('productos',[]);
  const p=prods.find(x=>x.id===id);
  if(!p)return;
  window._pendingStockProdId = id;
  openModal('Ajustar Stock',`
    <p style="color:var(--text-secondary);margin-bottom:1rem"><strong>${p.nombre}</strong> — Stock actual: <strong>${p.stock}</strong></p>
    <div class="form-group"><label>Nuevo stock</label><input type="number" id="newStock" value="${p.stock}" min="0" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary);font-size:0.95rem"></div>
    <div class="modal-footer" style="padding:1rem 0 0">
      <button class="btn btn-primary" onclick="confirmarAjusteStock()">Guardar</button>
      <button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button>
    </div>`);
}

function confirmarAjusteStock(){
  const id = window._pendingStockProdId;
  if(!id){closeModalDirect();return;}
  const val=parseInt(document.getElementById('newStock').value)||0;
  const prods=DB.get('productos',[]);
  const idx=prods.findIndex(p=>p.id===id);
  if(idx>-1){prods[idx].stock=val;DB.set('productos',prods);}
  window._pendingStockProdId = null;
  closeModalDirect();
  toast('Stock actualizado','success');
  showModule('productos');
}

// ===== OFERTAS MODULE =====
registerModule('ofertas', (container)=>{
  const prods=DB.get('productos',[]).filter(p=>p.enOferta&&p.precioOferta);
  container.innerHTML=`
  <div class="page-header">
    <div><div class="page-title">Ofertas</div><div class="page-subtitle">${prods.length} productos en oferta</div></div>
    <button class="btn btn-primary" onclick="showModule('productos')">Ver Inventario</button>
  </div>
  ${!prods.length?`<div class="card"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><p>No hay productos en oferta.<br>Márcalos desde Inventario.</p></div></div>`:
  `<div class="product-grid">${prods.map(p=>{
    const desc=Math.round(((p.precio-p.precioOferta)/p.precio)*100);
    const imgContent=p.imagen?`<img src="${p.imagen}" alt="${p.nombre}" style="width:100%;height:100%;object-fit:cover">`:`<span style="font-size:2rem">${p.categoria==='zapatos'?'👟':'👕'}</span>`;
    return `<div class="product-card offer-card">
      <span class="offer-badge">-${desc}%</span>
      <div class="product-card-img">${imgContent}</div>
      <div class="product-card-body">
        <div class="product-card-name">${p.nombre}</div>
        <div class="product-card-detail">${[p.color,p.talla].filter(Boolean).join(' • ')}</div>
        <div style="display:flex;flex-direction:column;gap:0.15rem">
          <span style="text-decoration:line-through;color:var(--text-muted);font-size:0.75rem">${fmt(p.precio)}</span>
          <span class="product-card-price text-amber">${fmt(p.precioOferta)}</span>
        </div>
        <span class="product-card-stock">Stock: ${p.stock}</span>
      </div>
    </div>`;}).join('')}</div>`}`;
});
