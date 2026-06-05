// ===== VENTAS.JS — POS COMPLETO =====

let cart = [];
let selectedPayment = 'efectivo';
let appliedCoupon = null;

registerModule('ventas', (container)=>{
  cart=[]; appliedCoupon=null; selectedPayment='efectivo';
  container.innerHTML=`
  <div class="page-header">
    <div><div class="page-title">Ventas / POS</div><div class="page-subtitle">Punto de venta</div></div>
  </div>
  <div class="grid-pos">
    <!-- PRODUCTOS -->
    <div class="pos-products">
      <div class="card" style="padding:0.75rem">
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
          <div class="search-bar" style="flex:1;min-width:180px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="posSearch" placeholder="Buscar producto, SKU, color..." oninput="renderPosProducts()" style="width:100%">
          </div>
          <select id="posCat" onchange="renderPosProducts()" style="background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.6rem 0.9rem;color:var(--text-primary);font-size:0.85rem">
            <option value="">Todas las categorías</option>
            <option value="ropa">👕 Ropa</option>
            <option value="zapatos">👟 Zapatos</option>
          </select>
        </div>
      </div>
      <div id="posProductsGrid" class="product-grid"></div>
    </div>

    <!-- CARRITO -->
    <div class="pos-cart">
      <div class="cart-header">
        <div class="flex items-center justify-between">
          <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:1rem">Carrito</span>
          <button class="btn btn-xs btn-danger" onclick="clearCart()">Vaciar</button>
        </div>
      </div>

      <div class="cart-items" id="cartItems"></div>

      <div class="cart-footer">

        <!-- Observaciones -->
        <div style="margin-bottom:0.75rem">
          <label class="lbl-small" style="margin-bottom:0.35rem;display:flex;align-items:center;gap:0.4rem">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Observaciones
          </label>
          <textarea class="obs-field" id="ventaObservaciones" placeholder="Escribe observaciones aquí (opcional)..." rows="2"></textarea>
        </div>

        <!-- Cupón -->
        <div style="display:flex;gap:0.5rem;margin-bottom:0.5rem">
          <input type="text" id="couponInput" placeholder="Código de cupón" style="flex:1;background:var(--bg-secondary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.55rem 0.75rem;color:var(--text-primary);font-size:0.82rem;text-transform:uppercase">
          <button class="btn btn-secondary btn-sm" onclick="applyCoupon()">Aplicar</button>
        </div>
        <div id="couponMsg" style="font-size:0.78rem;margin-bottom:0.5rem"></div>

        <!-- Cliente -->
        <input type="text" id="clienteNombre" placeholder="Nombre del cliente (opcional)" style="width:100%;background:var(--bg-secondary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.55rem 0.75rem;color:var(--text-primary);font-size:0.82rem;margin-bottom:0.75rem">

        <!-- Totales -->
        <div class="cart-total-row"><span class="cart-total-label">Subtotal</span><span class="cart-total-value" id="cartSubtotal">$0</span></div>
        <div class="cart-total-row" id="discountRow" style="display:none"><span class="cart-total-label text-green">Descuento cupón</span><span class="cart-total-value text-green" id="cartDiscount"></span></div>
        <div class="cart-total-row" id="recargoRow" style="display:none"><span class="cart-total-label text-amber">Recargo método</span><span class="cart-total-value text-amber" id="cartRecargo"></span></div>
        <div class="cart-total-row" style="margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid var(--border)">
          <span style="font-weight:700;font-size:0.95rem">TOTAL</span>
          <span class="cart-grand-total" id="cartTotal">$0</span>
        </div>

        <!-- ── MÉTODO DE PAGO — DROPDOWN ── -->
        <div style="margin:0.75rem 0 0.5rem;position:relative">
          <label class="lbl-small">Método de pago</label>
          <div id="payDropdownBtn" onclick="togglePayDropdown()" style="
            display:flex;align-items:center;justify-content:space-between;
            background:var(--bg-secondary);border:1.5px solid var(--accent-green);
            border-radius:var(--radius-sm);padding:0.6rem 0.85rem;cursor:pointer;
            transition:var(--transition);user-select:none">
            <div style="display:flex;align-items:center;gap:0.6rem">
              <span id="payIcon" style="font-size:1rem">💵</span>
              <div>
                <div id="payLabel" style="font-weight:700;font-size:0.9rem;color:var(--text-primary)">Efectivo</div>
                <div id="payRecargo" style="font-size:0.7rem;color:var(--accent-green)">Sin recargo</div>
              </div>
            </div>
            <svg id="payChevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              style="width:16px;height:16px;color:var(--text-muted);transition:transform 0.2s">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <!-- Lista desplegable -->
          <div id="payDropdownList" style="
            display:none">
          </div>
        </div>

        <!-- Monto recibido -->
        <div style="margin-bottom:0.5rem">
          <input type="number" id="montoRecibido" placeholder="Monto recibido (efectivo)" min="0"
            oninput="calcCambio()"
            style="width:100%;background:var(--bg-secondary);border:1.5px solid var(--border);
            border-radius:var(--radius-sm);padding:0.55rem 0.75rem;color:var(--text-primary);font-size:0.9rem">
        </div>
        <div class="change-display" id="changeDisplay" style="display:none">
          <span class="change-label">💵 Cambio</span>
          <span class="change-amount" id="changeAmount">$0</span>
        </div>

        <!-- ── BOTONES FINALES: VENTA + APARTADO ── -->
        <div style="display:grid;grid-template-columns:1fr auto;gap:0.5rem;margin-top:0.75rem">
          <button class="btn btn-primary" style="justify-content:center;padding:0.85rem" onclick="procesarVenta()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="17" height="17"><polyline points="20 6 9 17 4 12"/></svg>
            Registrar Venta
          </button>
          <button class="btn btn-amber" style="padding:0.85rem 0.9rem;flex-direction:column;gap:0.15rem;align-items:center;justify-content:center;min-width:70px" onclick="convertirApartadoDesdeCarrito()" title="Guardar como Apartado">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            <span style="font-size:0.68rem;font-weight:700;line-height:1">Apartar</span>
          </button>
        </div>

      </div><!-- /cart-footer -->
    </div><!-- /pos-cart -->
  </div>`;

  renderPosProducts();
  buildPayDropdown();
  renderCart();
});

function renderPosProducts(){
  const search=(document.getElementById('posSearch')||{}).value||'';
  const cat=(document.getElementById('posCat')||{}).value||'';
  let prods=DB.get('productos',[]);
  if(cat)prods=prods.filter(p=>p.categoria===cat);
  if(search){const q=search.toLowerCase();prods=prods.filter(p=>(p.nombre||'').toLowerCase().includes(q)||(p.sku||'').toLowerCase().includes(q)||(p.color||'').toLowerCase().includes(q)||(p.modelo||'').toLowerCase().includes(q));}
  const grid=document.getElementById('posProductsGrid');
  if(!grid)return;
  if(!prods.length){grid.innerHTML='<div class="empty-state" style="grid-column:1/-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg><p>No hay productos</p></div>';return;}
  grid.innerHTML=prods.map(p=>{
    const imgContent=p.imagen?`<img src="${p.imagen}" alt="${p.nombre}" style="width:100%;height:100%;object-fit:cover">`:`<span style="font-size:2rem">${p.categoria==='zapatos'?'👟':'👕'}</span>`;
    const oferta=p.enOferta&&p.precioOferta?`<span class="offer-badge">-${Math.round(((p.precio-p.precioOferta)/p.precio)*100)}%</span>`:'';
    const sinStock=p.stock<=0?`<span class="out-badge">Agotado</span>`:'';
    const precio=p.enOferta&&p.precioOferta?p.precioOferta:p.precio;
    return `<div class="product-card${p.enOferta?' offer-card':''}${p.stock<=0?' out-of-stock':''}" onclick="addToCart('${p.id}')">
      ${oferta}${sinStock}
      <div class="product-card-img">${imgContent}</div>
      <div class="product-card-body">
        <div class="product-card-name">${p.nombre}</div>
        <div class="product-card-detail">${[p.color,p.talla,p.modelo].filter(Boolean).join(' • ')}</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="product-card-price">${fmt(precio)}</span>
          <span class="product-card-stock">Stock: ${p.stock}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── ICONOS POR MÉTODO ──
const PAY_ICONS={efectivo:'💵',nequi:'📱',daviplata:'💜',bold:'🟢',tarjeta:'💳',sistecredito:'🏦',addi:'⚡'};

function buildPayDropdown(){
  const cfg=DB.get('config',{});
  const metodos=cfg.metodoPagos||{};
  const list=document.getElementById('payDropdownList');
  if(!list)return;
  list.innerHTML=Object.entries(metodos).map(([k,m])=>`
    <div onclick="selectPayment('${k}')" style="
      display:flex;align-items:center;gap:0.75rem;
      padding:0.65rem 1rem;cursor:pointer;transition:background 0.15s;
      border-bottom:1px solid var(--border);
      ${selectedPayment===k?'background:var(--accent-green-dim);':''}"
      onmouseover="this.style.background='var(--bg-hover)'"
      onmouseout="this.style.background='${selectedPayment===k?'var(--accent-green-dim)':'transparent'}'">
      <span style="font-size:1.1rem;width:22px;text-align:center">${PAY_ICONS[k]||'💳'}</span>
      <div style="flex:1">
        <div style="font-weight:600;font-size:0.88rem;color:${selectedPayment===k?'var(--accent-green)':'var(--text-primary)'}">${m.label}</div>
        <div style="font-size:0.7rem;color:${m.recargo?'var(--accent-amber)':'var(--text-muted)'}">${m.recargo?'+'+m.recargo+'% recargo':'Sin recargo'}</div>
      </div>
      ${selectedPayment===k?`<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>`:''}
    </div>`).join('');
  updatePayDropdownBtn();
}

function togglePayDropdown(){
  const list=document.getElementById('payDropdownList');
  const btn=document.getElementById('payDropdownBtn');
  const chevron=document.getElementById('payChevron');
  if(!list||!btn)return;
  const open=list.style.display==='block';
  if(open){
    list.style.display='none';
    if(chevron)chevron.style.transform='';
    return;
  }
  const rect=btn.getBoundingClientRect();
  const spaceBelow=window.innerHeight-rect.bottom;
  const spaceAbove=rect.top;
  const goUp=spaceBelow<180&&spaceAbove>spaceBelow;
  const maxH=Math.min(260,(goUp?spaceAbove:spaceBelow)-12);
  list.style.cssText='display:block;position:fixed;left:'+rect.left+'px;width:'+rect.width+'px;max-height:'+maxH+'px;overflow-y:auto;z-index:99999;background:var(--bg-card);border:1.5px solid var(--border);border-radius:var(--radius-sm);box-shadow:0 8px 32px rgba(0,0,0,0.45)';
  if(goUp){list.style.bottom=(window.innerHeight-rect.top+4)+'px';list.style.top='auto';}
  else{list.style.top=(rect.bottom+4)+'px';list.style.bottom='auto';}
  if(chevron)chevron.style.transform='rotate(180deg)';
  setTimeout(()=>{document.addEventListener('click',closePayDropdownOutside,{once:true});},10);
}

function closePayDropdownOutside(e){
  const list=document.getElementById('payDropdownList');
  const btn=document.getElementById('payDropdownBtn');
  if(list&&btn&&!btn.contains(e.target)&&!list.contains(e.target)){
    list.style.display='none';
    const chevron=document.getElementById('payChevron');
    if(chevron)chevron.style.transform='';
  }
}

function updatePayDropdownBtn(){
  const cfg=DB.get('config',{});
  const metodos=cfg.metodoPagos||{};
  const met=metodos[selectedPayment]||{label:'Efectivo',recargo:0};
  const lbl=document.getElementById('payLabel');
  const rec=document.getElementById('payRecargo');
  const ico=document.getElementById('payIcon');
  if(lbl)lbl.textContent=met.label;
  if(rec)rec.textContent=met.recargo?'+'+met.recargo+'% recargo':'Sin recargo';
  if(rec)rec.style.color=met.recargo?'var(--accent-amber)':'var(--accent-green)';
  if(ico)ico.textContent=PAY_ICONS[selectedPayment]||'💳';
}

function selectPayment(key){
  selectedPayment=key;
  // Cerrar dropdown
  const list=document.getElementById('payDropdownList');
  const chevron=document.getElementById('payChevron');
  if(list)list.style.display='none';
  if(chevron)chevron.style.transform='';
  // Redibujar lista para actualizar el check
  buildPayDropdown();
  updateCartTotals();
  calcCambio();
}

// Mantener compatibilidad legacy
function renderPayMethods(){ buildPayDropdown(); }

function addToCart(prodId){
  const prods=DB.get('productos',[]);
  const prod=prods.find(p=>p.id===prodId);
  if(!prod)return;
  if(prod.stock<=0){toast('Producto sin stock','warn');return;}
  const existing=cart.find(it=>it.prodId===prodId);
  if(existing){
    if(existing.cantidad>=prod.stock){toast('Stock máximo alcanzado','warn');return;}
    existing.cantidad++;
  } else {
    const precio=prod.enOferta&&prod.precioOferta?prod.precioOferta:prod.precio;
    cart.push({id:uid(),prodId,nombre:prod.nombre,detalle:[prod.color,prod.talla,prod.modelo].filter(Boolean).join(' / '),imagen:prod.imagen||'',precio,precioOriginal:precio,cantidad:1,descuento:0,categoria:prod.categoria});
  }
  renderCart();
  updateCartTotals();
}

function removeFromCart(itemId){
  cart=cart.filter(it=>it.id!==itemId);
  renderCart();
  updateCartTotals();
}

function changeQty(itemId,delta){
  const it=cart.find(i=>i.id===itemId);
  if(!it)return;
  const prods=DB.get('productos',[]);
  const prod=prods.find(p=>p.id===it.prodId);
  const maxStock=prod?prod.stock:9999;
  it.cantidad=Math.max(1,Math.min(it.cantidad+delta,maxStock));
  renderCart();
  updateCartTotals();
}

function clearCart(){cart=[];appliedCoupon=null;renderCart();updateCartTotals();const ci=document.getElementById('couponInput');if(ci)ci.value='';const cm=document.getElementById('couponMsg');if(cm)cm.innerHTML='';}

function editItemPrice(itemId){
  const it=cart.find(i=>i.id===itemId);
  if(!it)return;
  openModal('Editar precio / descuento',`
    <div class="form-group"><label>Precio actual</label><input type="number" id="editPrice" value="${it.precio}" min="0" class="w-full" style="background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary);font-size:0.95rem"></div>
    <div class="form-group"><label>Descuento % (solo este ítem)</label><input type="number" id="editDisc" value="${it.descuento||0}" min="0" max="100" class="w-full" style="background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary);font-size:0.95rem"></div>
    <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.5rem">⚠️ Este cambio solo aplica a este ítem en el carrito.</p>
    <div class="modal-footer" style="padding:1rem 0 0"><button class="btn btn-primary" onclick="applyItemEdit('${itemId}')">Aplicar</button><button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button></div>`);
}

function applyItemEdit(itemId){
  const it=cart.find(i=>i.id===itemId);
  if(!it)return;
  const newPrice=parseFloat(document.getElementById('editPrice').value)||0;
  const disc=parseFloat(document.getElementById('editDisc').value)||0;
  it.precio=newPrice;
  it.descuento=disc;
  closeModalDirect();
  renderCart();
  updateCartTotals();
  toast('Precio actualizado','success');
}

function renderCart(){
  const div=document.getElementById('cartItems');
  if(!div)return;
  if(!cart.length){div.innerHTML='<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>Carrito vacío</p></div>';return;}
  div.innerHTML=cart.map(it=>{
    const precioFinal=it.precio*(1-(it.descuento||0)/100);
    const imgContent=it.imagen?`<img src="${it.imagen}" alt="" style="width:100%;height:100%;object-fit:cover">`:`<span>${it.categoria==='zapatos'?'👟':'👕'}</span>`;
    return `<div class="cart-item">
      <div class="cart-item-img">${imgContent}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${it.nombre}</div>
        <div class="cart-item-detail">${it.detalle}${it.descuento?` • <span class="text-green">-${it.descuento}%</span>`:''}</div>
        <button onclick="editItemPrice('${it.id}')" style="font-size:0.7rem;color:var(--accent-blue);background:none;border:none;cursor:pointer;padding:0;margin-top:2px">✏️ Editar precio</button>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty('${it.id}',-1)">−</button>
        <span class="qty-num">${it.cantidad}</span>
        <button class="qty-btn" onclick="changeQty('${it.id}',1)">+</button>
      </div>
      <span class="cart-item-price">${fmt(precioFinal*it.cantidad)}</span>
      <span class="cart-item-del" onclick="removeFromCart('${it.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></span>
    </div>`;
  }).join('');
}

function updateCartTotals(){
  const subtotal=cart.reduce((s,it)=>s+it.precio*(1-(it.descuento||0)/100)*it.cantidad,0);
  let descCupon=0;
  if(appliedCoupon){
    if(appliedCoupon.tipo==='porcentaje')descCupon=subtotal*(appliedCoupon.valor/100);
    else descCupon=Math.min(appliedCoupon.valor,subtotal);
  }
  const cfg=DB.get('config',{});
  const metodos=cfg.metodoPagos||{};
  const met=metodos[selectedPayment]||{};
  const recargo=((subtotal-descCupon)*(met.recargo||0))/100;
  const total=subtotal-descCupon+recargo;

  const el=id=>document.getElementById(id);
  if(el('cartSubtotal'))el('cartSubtotal').textContent=fmt(subtotal);
  if(el('cartTotal'))el('cartTotal').textContent=fmt(total);
  if(el('discountRow'))el('discountRow').style.display=descCupon?'flex':'none';
  if(el('cartDiscount'))el('cartDiscount').textContent='-'+fmt(descCupon);
  if(el('recargoRow'))el('recargoRow').style.display=recargo?'flex':'none';
  if(el('cartRecargo'))el('cartRecargo').textContent='+'+fmt(recargo);
  calcCambio();
}

function calcCambio(){
  const cfg=DB.get('config',{});
  const metodos=cfg.metodoPagos||{};
  const met=metodos[selectedPayment]||{};
  const subtotal=cart.reduce((s,it)=>s+it.precio*(1-(it.descuento||0)/100)*it.cantidad,0);
  let descCupon=0;
  if(appliedCoupon){
    if(appliedCoupon.tipo==='porcentaje')descCupon=subtotal*(appliedCoupon.valor/100);
    else descCupon=Math.min(appliedCoupon.valor,subtotal);
  }
  const recargo=((subtotal-descCupon)*(met.recargo||0))/100;
  const total=subtotal-descCupon+recargo;
  const recibido=parseFloat((document.getElementById('montoRecibido')||{}).value)||0;
  const cambio=recibido-total;
  const cd=document.getElementById('changeDisplay');
  const ca=document.getElementById('changeAmount');
  if(cd&&ca){
    if(recibido>0&&recibido>=total){cd.style.display='flex';ca.textContent=fmt(cambio);}
    else{cd.style.display='none';}
  }
}

function applyCoupon(){
  const code=(document.getElementById('couponInput')||{}).value||'';
  const msg=document.getElementById('couponMsg');
  if(!code){if(msg)msg.innerHTML='<span style="color:var(--text-muted)">Ingresa un código</span>';return;}
  const cupones=DB.get('cupones',[]);
  const c=cupones.find(x=>x.codigo.toUpperCase()===code.toUpperCase()&&x.activo);
  if(!c){if(msg)msg.innerHTML='<span style="color:var(--accent-red)">❌ Cupón no válido</span>';return;}
  if(c.vencimiento&&new Date(c.vencimiento)<new Date()){if(msg)msg.innerHTML='<span style="color:var(--accent-red)">❌ Cupón vencido</span>';return;}
  if(c.usoMax&&c.usosActuales>=c.usoMax){if(msg)msg.innerHTML='<span style="color:var(--accent-red)">❌ Cupón sin usos disponibles</span>';return;}
  appliedCoupon=c;
  if(msg)msg.innerHTML=`<span style="color:var(--accent-green)">✅ Cupón aplicado: ${c.tipo==='porcentaje'?c.valor+'%':fmt(c.valor)} de descuento</span>`;
  updateCartTotals();
  toast('Cupón aplicado','success');
}

function calcTotal(){
  const cfg=DB.get('config',{});
  const metodos=cfg.metodoPagos||{};
  const met=metodos[selectedPayment]||{};
  const subtotal=cart.reduce((s,it)=>s+it.precio*(1-(it.descuento||0)/100)*it.cantidad,0);
  let descCupon=0;
  if(appliedCoupon){
    if(appliedCoupon.tipo==='porcentaje')descCupon=subtotal*(appliedCoupon.valor/100);
    else descCupon=Math.min(appliedCoupon.valor,subtotal);
  }
  const recargo=((subtotal-descCupon)*(met.recargo||0))/100;
  return {subtotal,descCupon,recargo,total:subtotal-descCupon+recargo};
}

function procesarVenta(){
  if(!cart.length){toast('El carrito está vacío','warn');return;}
  const caja=DB.get('caja',{});
  if(!caja.abierta){toast('Debes abrir la caja antes de vender','warn');return;}
  const {subtotal,descCupon,recargo,total}=calcTotal();
  const recibido=parseFloat((document.getElementById('montoRecibido')||{}).value)||0;
  if(selectedPayment==='efectivo'&&recibido>0&&recibido<total){toast('El monto recibido es menor al total','error');return;}
  const cliente=(document.getElementById('clienteNombre')||{}).value||'';
  const observaciones=(document.getElementById('ventaObservaciones')||{}).value||'';
  const cfg=DB.get('config',{});
  const metodos=cfg.metodoPagos||{};
  const met=metodos[selectedPayment]||{};
  const venta={
    id:uid(), fecha:new Date().toISOString(),
    cliente:cliente||'Cliente ocasional',
    items:cart.map(it=>({...it})),
    subtotal, descupon:descCupon, recargo, total,
    metodoPago:met.label||selectedPayment, metodoClave:selectedPayment,
    montoRecibido:recibido, cambio:Math.max(0,recibido-total),
    cupon:appliedCoupon?appliedCoupon.codigo:null,
    observaciones,
    usuario:currentUser.nombre||currentUser.username,
    usuarioId:currentUser.id
  };

  // Guardar venta
  const ventas=DB.get('ventas',[]);
  ventas.push(venta);
  DB.set('ventas',ventas);

  // Descontar stock
  const prods=DB.get('productos',[]);
  cart.forEach(it=>{const p=prods.find(x=>x.id===it.prodId);if(p)p.stock=Math.max(0,p.stock-it.cantidad);});
  DB.set('productos',prods);

  // Registrar en caja
  const cajaData=DB.get('caja',{});
  cajaData.movimientos=cajaData.movimientos||[];
  cajaData.movimientos.push({id:uid(),tipo:'venta',fecha:new Date().toISOString(),monto:total,metodoClave:selectedPayment,ref:venta.id});
  DB.set('caja',cajaData);

  // Actualizar usos cupón
  if(appliedCoupon){
    const cups=DB.get('cupones',[]);
    const idx=cups.findIndex(c=>c.id===appliedCoupon.id);
    if(idx>-1){cups[idx].usosActuales=(cups[idx].usosActuales||0)+1;DB.set('cupones',cups);}
  }

  toast('Venta registrada exitosamente','success');
  printInvoice(venta);
  cart=[]; appliedCoupon=null; selectedPayment='efectivo';
  showModule('ventas');
}

// ── CONVERTIR CARRITO EN APARTADO ──
function convertirApartadoDesdeCarrito(){
  if(!cart.length){toast('El carrito está vacío','warn');return;}
  const {total}=calcTotal();
  if(total<20000){toast('El mínimo para un apartado es $20.000','warn');return;}

  const itemsHtml=cart.map(it=>`
    <div style="display:flex;justify-content:space-between;align-items:center;
      padding:0.4rem 0.6rem;background:var(--bg-tertiary);border-radius:6px;margin-bottom:0.35rem;font-size:0.82rem">
      <span>${it.nombre} ${it.detalle?'· '+it.detalle:''}</span>
      <span style="font-weight:700;color:var(--accent-green)">×${it.cantidad} — ${fmt(it.precio*it.cantidad)}</span>
    </div>`).join('');

  openModal('Guardar como Apartado',`
    <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);
      border-radius:var(--radius-sm);padding:0.75rem 1rem;margin-bottom:1rem;font-size:0.82rem">
      <strong style="color:var(--accent-amber)">📦 Productos a apartar:</strong>
      <div style="margin-top:0.5rem">${itemsHtml}</div>
      <div style="margin-top:0.5rem;display:flex;justify-content:space-between;font-weight:700">
        <span>Total:</span><span style="color:var(--accent-green)">${fmt(total)}</span>
      </div>
    </div>

    <div class="form-group">
      <label>Nombre del cliente *</label>
      <input type="text" id="ap2_cliente" placeholder="Nombre completo"
        value="${(document.getElementById('clienteNombre')||{}).value||''}"
        style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);
        border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary)">
    </div>
    <div class="form-group">
      <label>Teléfono</label>
      <input type="text" id="ap2_tel" placeholder="Opcional"
        style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);
        border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary)">
    </div>
    <div class="inp-row">
      <div class="form-group">
        <label>Abono inicial * <span style="color:var(--text-muted);font-size:0.72rem">(mín. $20.000)</span></label>
        <input type="number" id="ap2_abono" min="20000" placeholder="20000"
          style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);
          border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary)">
      </div>
      <div class="form-group">
        <label>Fecha vencimiento</label>
        <input type="date" id="ap2_vence"
          style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);
          border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary)">
      </div>
    </div>
    <div class="form-group">
      <label>Observaciones</label>
      <textarea id="ap2_obs" rows="2" placeholder="Notas adicionales..."
        style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);
        border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary);resize:vertical"
      >${(document.getElementById('ventaObservaciones')||{}).value||''}</textarea>
    </div>

    <div class="modal-footer" style="padding:1rem 0 0">
      <button class="btn btn-amber" onclick="confirmarApartadoDesdeCarrito(${total})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        Crear Apartado
      </button>
      <button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button>
    </div>`,{lg:true});

  // Default: 30 días
  setTimeout(()=>{
    const d=new Date(); d.setDate(d.getDate()+30);
    const el=document.getElementById('ap2_vence');
    if(el)el.value=d.toISOString().slice(0,10);
  },50);
}

function confirmarApartadoDesdeCarrito(total){
  const cliente=(document.getElementById('ap2_cliente')||{}).value||'';
  const abono=parseFloat((document.getElementById('ap2_abono')||{}).value)||0;
  const vence=(document.getElementById('ap2_vence')||{}).value||'';
  const tel=(document.getElementById('ap2_tel')||{}).value||'';
  const obs=(document.getElementById('ap2_obs')||{}).value||'';

  if(!cliente){toast('Ingresa el nombre del cliente','warn');return;}
  if(abono<20000){toast('El abono mínimo es $20.000','warn');return;}
  if(abono>total){toast('El abono no puede superar el total','warn');return;}

  const ap={
    id:uid(), fecha:new Date().toISOString(),
    cliente, telefono:tel, total, estado:'activo',
    fechaVencimiento:vence||new Date(Date.now()+30*86400000).toISOString(),
    items:cart.map(it=>({...it})),
    observaciones:obs,
    usuario:currentUser.nombre,
    abonos:[{id:uid(),fecha:new Date().toISOString(),monto:abono,usuario:currentUser.nombre}]
  };

  const apartados=DB.get('apartados',[]);
  apartados.push(ap);
  DB.set('apartados',apartados);

  closeModalDirect();
  toast(`Apartado creado para ${cliente} ✔️`,'success');

  // Limpiar carrito
  cart=[]; appliedCoupon=null; selectedPayment='efectivo';
  showModule('ventas');
}

function printInvoice(venta){
  const cfg=DB.get('config',{});
  const items=venta.items.map(it=>{
    const pFinal=it.precio*(1-(it.descuento||0)/100);
    return `<tr>
      <td>${it.nombre}${it.detalle?`<br><small style="color:#666">${it.detalle}</small>`:''}</td>
      <td style="text-align:center">${it.cantidad}</td>
      <td style="text-align:right">${fmt(pFinal)}</td>
      <td style="text-align:right">${fmt(pFinal*it.cantidad)}</td>
    </tr>`;
  }).join('');

  const printDiv=document.getElementById('printArea');
  printDiv.innerHTML=`
    <div class="invoice-header">
    ${cfg.logo?`<img src="${cfg.logo}" style="width:70px;height:70px;object-fit:contain;margin:0 auto 0.5rem;display:block;border-radius:6px">`:''}
      <div style="font-family:monospace;font-weight:900;font-size:1.4rem">${cfg.nombre||'Otanche POS'}</div>
      <div style="font-size:0.78rem;color:#555;margin-top:0.25rem">${cfg.direccion||''}</div>
      ${cfg.telefono?`<div style="font-size:0.78rem">${cfg.telefono}</div>`:''}
      <div style="font-size:0.75rem;margin-top:0.5rem">${fmtDateTime(venta.fecha)}</div>
      <div style="font-size:0.7rem;color:#666"># ${venta.id.toUpperCase()}</div>
    </div>
    <div style="margin:0.75rem 0;font-size:0.82rem"><strong>Cliente:</strong> ${venta.cliente}</div>
    ${venta.observaciones?`<div style="margin:0.5rem 0;font-size:0.78rem;padding:0.4rem 0.5rem;border:1px dashed #ccc;border-radius:4px"><strong>Observaciones:</strong> ${venta.observaciones}</div>`:''}
    <table class="invoice-table">
      <thead><tr><th>Producto</th><th>Cant</th><th>P.Unit</th><th>Total</th></tr></thead>
      <tbody>${items}</tbody>
      <tfoot>
        <tr><td colspan="3">Subtotal</td><td style="text-align:right">${fmt(venta.subtotal)}</td></tr>
        ${venta.descupon?`<tr><td colspan="3">Descuento cupón ${venta.cupon?'('+venta.cupon+')':''}</td><td style="text-align:right">-${fmt(venta.descupon)}</td></tr>`:''}
        ${venta.recargo?`<tr><td colspan="3">Recargo ${venta.metodoPago}</td><td style="text-align:right">+${fmt(venta.recargo)}</td></tr>`:''}
        <tr class="invoice-total"><td colspan="3"><strong>TOTAL</strong></td><td style="text-align:right"><strong>${fmt(venta.total)}</strong></td></tr>
      </tfoot>
    </table>
    <div class="invoice-total-section">
      <div style="display:flex;justify-content:space-between;font-size:0.85rem"><span>Método de pago:</span><strong>${venta.metodoPago}</strong></div>
      ${venta.montoRecibido?`<div style="display:flex;justify-content:space-between;font-size:0.85rem"><span>Recibido:</span><strong>${fmt(venta.montoRecibido)}</strong></div>`:''}
      ${venta.cambio?`<div class="invoice-change">💵 CAMBIO: ${fmt(venta.cambio)}</div>`:''}
    </div>
    <div id="qrcode-print" style="margin:0.75rem auto;text-align:center"></div>
    <div class="invoice-footer">
      <p>Atendido por: ${venta.usuario}</p>
      <p>¡Gracias por su compra!</p>
      ${cfg.web?`<p>${cfg.web}</p>`:''}
    </div>`;

  if(typeof QRCode!=='undefined'){
    try{new QRCode(document.getElementById('qrcode-print'),{text:venta.id,width:80,height:80});}catch(e){}
  }
  setTimeout(()=>window.print(),400);
}
