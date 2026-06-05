// ===== MOVIMIENTOS.JS =====

registerModule('movimientos', (container)=>{
  renderMovimientosModule(container);
});

function renderMovimientosModule(container){
  const ventas=DB.get('ventas',[]);
  container.innerHTML=`
  <div class="page-header">
    <div><div class="page-title">Movimientos</div><div class="page-subtitle">${ventas.length} ventas registradas</div></div>
    <div class="flex gap-1">
      <button class="btn btn-secondary btn-sm" onclick="exportarVentasCSV()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Exportar CSV
      </button>
    </div>
  </div>

  <div class="card mb-2" style="padding:0.75rem">
    <div class="filters-row">
      <div class="search-bar" style="flex:1;min-width:180px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="movSearch" placeholder="Buscar por cliente, método..." oninput="filterMovimientos()" style="width:100%">
      </div>
      <input type="date" id="movFechaDesde" onchange="filterMovimientos()" style="background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.6rem 0.9rem;color:var(--text-primary)">
      <input type="date" id="movFechaHasta" onchange="filterMovimientos()" style="background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.6rem 0.9rem;color:var(--text-primary)">
    </div>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Método</th><th>Cupón</th><th>Total</th><th>Usuario</th><th>Acciones</th></tr>
      </thead>
      <tbody id="movTableBody"></tbody>
    </table>
  </div>`;
  filterMovimientos();
}

function filterMovimientos(){
  const q=(document.getElementById('movSearch')||{}).value?.toLowerCase()||'';
  const desde=(document.getElementById('movFechaDesde')||{}).value;
  const hasta=(document.getElementById('movFechaHasta')||{}).value;
  let ventas=DB.get('ventas',[]);
  if(q)ventas=ventas.filter(v=>(v.cliente||'').toLowerCase().includes(q)||(v.metodoPago||'').toLowerCase().includes(q));
  if(desde)ventas=ventas.filter(v=>new Date(v.fecha)>=new Date(desde));
  if(hasta)ventas=ventas.filter(v=>new Date(v.fecha)<=new Date(hasta+' 23:59:59'));
  ventas=ventas.slice().reverse();
  const tbody=document.getElementById('movTableBody');
  if(!tbody)return;
  if(!ventas.length){tbody.innerHTML=`<tr><td colspan="9" class="text-center text-muted" style="padding:2rem">Sin ventas encontradas</td></tr>`;return;}
  tbody.innerHTML=ventas.map((v,i)=>`<tr>
    <td class="td-mono text-muted" style="font-size:0.72rem">${v.id.toUpperCase().slice(-6)}</td>
    <td class="td-mono">${fmtDateTime(v.fecha)}</td>
    <td class="td-bold">${v.cliente||'Ocasional'}</td>
    <td style="font-size:0.8rem;max-width:160px"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${(v.items||[]).map(it=>it.nombre+'×'+it.cantidad).join(', ')}</div></td>
    <td><span class="badge badge-blue">${v.metodoPago}</span></td>
    <td>${v.cupon?`<span class="badge badge-green">${v.cupon}</span>`:'—'}</td>
    <td class="td-bold text-green">${fmt(v.total)}</td>
    <td class="text-muted" style="font-size:0.8rem">${v.usuario||'—'}</td>
    <td>
      <div class="flex gap-1">
        <button class="btn-icon" onclick="verDetalleVenta('${v.id}')" title="Ver detalle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        ${hasPerm('editarVentas')?`<button class="btn-icon" onclick="editarVenta('${v.id}')" title="Editar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>`:''}
        ${hasPerm('eliminarVentas')?`<button class="btn-icon" onclick="eliminarVenta('${v.id}')" title="Eliminar" style="color:var(--accent-red)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>`:''}
        <button class="btn-icon" onclick="reimprimirVenta('${v.id}')" title="Reimprimir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        </button>
      </div>
    </td>
  </tr>`).join('');
}

function verDetalleVenta(id){
  const v=DB.get('ventas',[]).find(x=>x.id===id);
  if(!v)return;
  openModal('Detalle de Venta',`
    <div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between"><span class="text-muted">ID</span><span class="font-mono">${v.id.toUpperCase()}</span></div>
      <div style="display:flex;justify-content:space-between"><span class="text-muted">Fecha</span><span>${fmtDateTime(v.fecha)}</span></div>
      <div style="display:flex;justify-content:space-between"><span class="text-muted">Cliente</span><strong>${v.cliente}</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="text-muted">Método</span><span class="badge badge-blue">${v.metodoPago}</span></div>
      ${v.cupon?`<div style="display:flex;justify-content:space-between"><span class="text-muted">Cupón</span><span class="badge badge-green">${v.cupon}</span></div>`:''}
      ${v.observaciones?`<div style="display:flex;justify-content:space-between;align-items:flex-start"><span class="text-muted">Observaciones</span><span style="max-width:200px;text-align:right;font-size:0.85rem">${v.observaciones}</span></div>`:''}
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Total</th></tr></thead>
      <tbody>${(v.items||[]).map(it=>{const pf=it.precio*(1-(it.descuento||0)/100);return`<tr><td>${it.nombre}${it.detalle?`<br><small>${it.detalle}</small>`:''}</td><td>${it.cantidad}</td><td>${fmt(pf)}</td><td class="text-green font-bold">${fmt(pf*it.cantidad)}</td></tr>`}).join('')}</tbody>
    </table></div>
    <div style="margin-top:1rem;display:flex;flex-direction:column;gap:0.3rem">
      ${v.descupon?`<div style="display:flex;justify-content:space-between"><span class="text-muted">Descuento cupón</span><span class="text-green">-${fmt(v.descupon)}</span></div>`:''}
      ${v.recargo?`<div style="display:flex;justify-content:space-between"><span class="text-muted">Recargo</span><span class="text-amber">+${fmt(v.recargo)}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;font-size:1.1rem;font-weight:800;border-top:1px solid var(--border);padding-top:0.5rem"><span>TOTAL</span><span class="text-green">${fmt(v.total)}</span></div>
      ${v.cambio?`<div style="display:flex;justify-content:space-between"><span class="text-muted">Cambio entregado</span><span>${fmt(v.cambio)}</span></div>`:''}
    </div>
    <div class="modal-footer" style="padding:1rem 0 0"><button class="btn btn-secondary" onclick="closeModalDirect()">Cerrar</button></div>`,{lg:true});
}

function editarVenta(id){
  if(!hasPerm('editarVentas')){toast('Sin permiso para editar ventas','error');return;}
  const ventas=DB.get('ventas',[]);
  const v=ventas.find(x=>x.id===id);
  if(!v)return;
  openModal('Editar Venta',`
    <p class="text-muted" style="font-size:0.82rem;margin-bottom:1rem">Solo se pueden modificar campos básicos. Los cambios quedan registrados.</p>
    <div class="form-group"><label>Cliente</label><input type="text" id="ev_cliente" value="${v.cliente||''}" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary)"></div>
    <div class="form-group"><label>Observaciones</label><textarea id="ev_obs" rows="3" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary);resize:vertical">${v.observaciones||''}</textarea></div>
    <div class="modal-footer" style="padding:1rem 0 0"><button class="btn btn-primary" onclick="guardarEdicionVenta('${id}')">Guardar Cambios</button><button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button></div>`);
}

function guardarEdicionVenta(id){
  const ventas=DB.get('ventas',[]);
  const idx=ventas.findIndex(v=>v.id===id);
  if(idx>-1){
    ventas[idx].cliente=document.getElementById('ev_cliente').value||ventas[idx].cliente;
    ventas[idx].observaciones=document.getElementById('ev_obs').value;
    ventas[idx].editadoPor=currentUser.nombre;
    ventas[idx].editadoEn=new Date().toISOString();
    DB.set('ventas',ventas);
  }
  closeModalDirect();
  toast('Venta actualizada','success');
  filterMovimientos();
}

function eliminarVenta(id){
  if(!hasPerm('eliminarVentas')){toast('Sin permiso para eliminar ventas','error');return;}
  openModal('Eliminar Venta',`
    <p style="color:var(--text-secondary)">¿Confirmas la eliminación de esta venta? Esta acción no se puede deshacer y no revertirá el stock.</p>
    <div class="modal-footer" style="padding:1rem 0 0"><button class="btn btn-danger" onclick="confirmarEliminarVenta('${id}')">Eliminar</button><button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button></div>`);
}

function confirmarEliminarVenta(id){
  const ventas=DB.get('ventas',[]).filter(v=>v.id!==id);
  DB.set('ventas',ventas);
  closeModalDirect();
  toast('Venta eliminada','info');
  filterMovimientos();
}

function reimprimirVenta(id){
  const v=DB.get('ventas',[]).find(x=>x.id===id);
  if(v&&typeof printInvoice==='function')printInvoice(v);
}

function exportarVentasCSV(){
  const ventas=DB.get('ventas',[]);
  if(!ventas.length){toast('Sin ventas para exportar','warn');return;}
  let csv='ID,Fecha,Cliente,Productos,Método,Cupón,Subtotal,Descuento,Recargo,Total,Usuario,Observaciones\n';
  ventas.forEach(v=>{
    const prods=(v.items||[]).map(it=>it.nombre+'x'+it.cantidad).join(' | ');
    csv+=`"${v.id}","${fmtDateTime(v.fecha)}","${v.cliente||''}","${prods}","${v.metodoPago}","${v.cupon||''}","${v.subtotal||0}","${v.descupon||0}","${v.recargo||0}","${v.total}","${v.usuario||''}","${v.observaciones||''}"\n`;
  });
  downloadCSV(csv,'ventas_otanche.csv');
  toast('CSV exportado','success');
}
