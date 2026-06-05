// ===== APARTADOS.JS =====

registerModule('apartados', (container)=>{
  renderApartadosModule(container);
});

function renderApartadosModule(container){
  const apartados=DB.get('apartados',[]);
  const activos=apartados.filter(a=>a.estado==='activo');
  const vencidos=apartados.filter(a=>{
    if(a.estado!=='activo')return false;
    return new Date(a.fechaVencimiento)<new Date();
  });
  const completados=apartados.filter(a=>a.estado==='completado');

  container.innerHTML=`
  <div class="page-header">
    <div><div class="page-title">Apartados</div><div class="page-subtitle">${activos.length} activos • ${vencidos.length} vencidos</div></div>
    <button class="btn btn-primary" onclick="abrirFormApartado()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Nuevo Apartado
    </button>
  </div>

  ${vencidos.length>0?`<div class="card mb-2" style="border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.04)">
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <strong style="color:var(--accent-red)">${vencidos.length} apartado(s) vencidos</strong>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem">${vencidos.map(a=>`<span class="badge badge-red">${a.cliente}</span>`).join('')}</div>
  </div>`:''}

  <div style="display:flex;gap:0.75rem;margin-bottom:1rem">
    <button class="btn ${window._apTab!=='completados'?'btn-primary':'btn-secondary'}" onclick="window._apTab='activos';renderApartadosCards()">Activos (${activos.length})</button>
    <button class="btn ${window._apTab==='completados'?'btn-primary':'btn-secondary'}" onclick="window._apTab='completados';renderApartadosCards()">Completados (${completados.length})</button>
  </div>

  <div id="apartadosCards"></div>`;
  window._apTab=window._apTab||'activos';
  renderApartadosCards();
}

function renderApartadosCards(){
  const apartados=DB.get('apartados',[]);
  const tab=window._apTab||'activos';
  let lista=tab==='completados'?apartados.filter(a=>a.estado==='completado'):apartados.filter(a=>a.estado==='activo');
  const div=document.getElementById('apartadosCards');
  if(!div)return;
  if(!lista.length){div.innerHTML=`<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg><p>Sin apartados ${tab}</p></div>`;return;}
  div.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem">
  ${lista.map(a=>{
    const pagado=a.abonos?a.abonos.reduce((s,ab)=>s+ab.monto,0):0;
    const pct=Math.min(100,Math.round((pagado/a.total)*100));
    const vencido=new Date(a.fechaVencimiento)<new Date()&&a.estado==='activo';
    const diasRestantes=Math.ceil((new Date(a.fechaVencimiento)-new Date())/(1000*60*60*24));
    return `<div class="apartado-card ${vencido?'vencido':''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem">
        <div>
          <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:1rem">${a.cliente}</div>
          <div class="text-muted" style="font-size:0.78rem">${fmtDate(a.fecha)}</div>
        </div>
        <span class="badge ${vencido?'badge-red':a.estado==='completado'?'badge-green':'badge-blue'}">${vencido?'Vencido':a.estado==='completado'?'Completado':'Activo'}</span>
      </div>

      ${a.items&&a.items.length?`<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.5rem">
        ${a.items.slice(0,3).map(it=>`<span style="display:inline-block;margin:0.15rem;padding:0.15rem 0.45rem;background:var(--bg-tertiary);border-radius:99px;font-size:0.72rem">${it.nombre} x${it.cantidad}</span>`).join('')}
        ${a.items.length>3?`<span style="font-size:0.72rem;color:var(--text-muted)">+${a.items.length-3} más</span>`:''}
      </div>`:''}

      <div style="margin-bottom:0.5rem">
        <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:0.25rem">
          <span class="text-muted">Pagado: <strong class="text-green">${fmt(pagado)}</strong></span>
          <span class="text-muted">Total: <strong>${fmt(a.total)}</strong></span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:${vencido?'var(--accent-red)':''}"></div>
        </div>
        <div style="font-size:0.75rem;color:var(--text-muted);text-align:right">${pct}% completado</div>
      </div>

      <div style="font-size:0.78rem;color:${vencido?'var(--accent-red)':'var(--text-muted)'}">
        ${vencido?`⚠️ Venció hace ${Math.abs(diasRestantes)} días`:`📅 Vence: ${fmtDate(a.fechaVencimiento)} (${diasRestantes} días)`}
      </div>

      <div class="flex gap-1 mt-1">
        ${a.estado==='activo'?`<button class="btn btn-success btn-sm" onclick="registrarAbono('${a.id}')">+ Abono</button>`:''}
        <button class="btn btn-secondary btn-sm" onclick="verDetalleApartado('${a.id}')">Ver detalle</button>
        ${a.estado==='activo'&&pagado>=a.total?`<button class="btn btn-primary btn-sm" onclick="completarApartado('${a.id}')">✓ Completar</button>`:''}
      </div>
    </div>`;}).join('')}</div>`;
}

function abrirFormApartado(){
  const prods=DB.get('productos',[]).filter(p=>p.stock>0);
  openModal('Nuevo Apartado',`
    <div class="form-group"><label>Nombre del cliente *</label><input type="text" id="ap_cliente" placeholder="Nombre completo" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary)"></div>
    <div class="form-group"><label>Teléfono</label><input type="text" id="ap_tel" placeholder="Opcional" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary)"></div>
    <div class="inp-row">
      <div class="form-group"><label>Total del apartado *</label><input type="number" id="ap_total" min="20000" placeholder="Min $20.000" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary)"></div>
      <div class="form-group"><label>Abono inicial *</label><input type="number" id="ap_abono" min="20000" placeholder="Min $20.000" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary)"></div>
    </div>
    <div class="form-group"><label>Fecha vencimiento</label><input type="date" id="ap_vence" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary)"></div>
    <div class="form-group"><label>Producto(s) apartado(s)</label>
      <select id="ap_prod" multiple style="width:100%;height:100px;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.4rem;color:var(--text-primary)">
        ${prods.map(p=>`<option value="${p.id}">${p.nombre} - ${[p.color,p.talla].filter(Boolean).join('/')} (${fmt(p.precio)})</option>`).join('')}
      </select>
      <span style="font-size:0.72rem;color:var(--text-muted)">Ctrl+clic para seleccionar varios</span>
    </div>
    <div class="form-group"><label>Observaciones</label><textarea id="ap_obs" rows="2" placeholder="Notas adicionales..." style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary);resize:vertical"></textarea></div>
    <div class="modal-footer" style="padding:1rem 0 0"><button class="btn btn-primary" onclick="guardarApartado()">Crear Apartado</button><button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button></div>`,
    {lg:true});

  // Set default vencimiento 30 días
  setTimeout(()=>{
    const d=new Date(); d.setDate(d.getDate()+30);
    const vEl=document.getElementById('ap_vence');
    if(vEl)vEl.value=d.toISOString().slice(0,10);
  },50);
}

function guardarApartado(){
  const cliente=document.getElementById('ap_cliente').value||'';
  const total=parseFloat(document.getElementById('ap_total').value)||0;
  const abono=parseFloat(document.getElementById('ap_abono').value)||0;
  const vence=document.getElementById('ap_vence').value;
  if(!cliente){toast('Ingresa el nombre del cliente','warn');return;}
  if(total<20000){toast('El total mínimo es $20.000','warn');return;}
  if(abono<20000){toast('El abono mínimo es $20.000','warn');return;}
  if(abono>total){toast('El abono no puede superar el total','warn');return;}

  // Items seleccionados
  const sel=document.getElementById('ap_prod');
  const prods=DB.get('productos',[]);
  const items=Array.from(sel.selectedOptions).map(opt=>{
    const p=prods.find(x=>x.id===opt.value);
    return p?{prodId:p.id,nombre:p.nombre,precio:p.precio,cantidad:1}:null;
  }).filter(Boolean);

  const ap={
    id:uid(), fecha:new Date().toISOString(),
    cliente, telefono:document.getElementById('ap_tel').value||'',
    total, estado:'activo',
    fechaVencimiento:vence||new Date(Date.now()+30*86400000).toISOString(),
    items, observaciones:document.getElementById('ap_obs').value||'',
    usuario:currentUser.nombre,
    abonos:[{id:uid(),fecha:new Date().toISOString(),monto:abono,usuario:currentUser.nombre}]
  };

  const apartados=DB.get('apartados',[]);
  apartados.push(ap);
  DB.set('apartados',apartados);
  closeModalDirect();
  toast('Apartado creado','success');
  renderApartadosModule(document.getElementById('moduleContainer'));
}

function registrarAbono(apId){
  openModal('Registrar Abono',`
    <div class="form-group"><label>Monto del abono</label>
      <input type="number" id="abonoMonto" min="1" placeholder="0" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary);font-size:1rem">
    </div>
    <div class="modal-footer" style="padding:1rem 0 0"><button class="btn btn-success" onclick="confirmarAbono('${apId}')">Registrar Abono</button><button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button></div>`);
}

function confirmarAbono(apId){
  const monto=parseFloat(document.getElementById('abonoMonto').value)||0;
  if(!monto){toast('Ingresa un monto válido','warn');return;}
  const apartados=DB.get('apartados',[]);
  const idx=apartados.findIndex(a=>a.id===apId);
  if(idx>-1){
    apartados[idx].abonos=apartados[idx].abonos||[];
    apartados[idx].abonos.push({id:uid(),fecha:new Date().toISOString(),monto,usuario:currentUser.nombre});
    const pagado=apartados[idx].abonos.reduce((s,ab)=>s+ab.monto,0);
    if(pagado>=apartados[idx].total)apartados[idx].estado='completado';
    DB.set('apartados',apartados);
  }
  closeModalDirect();
  toast('Abono registrado','success');
  renderApartadosModule(document.getElementById('moduleContainer'));
}

function completarApartado(apId){
  const apartados=DB.get('apartados',[]);
  const idx=apartados.findIndex(a=>a.id===apId);
  if(idx>-1){apartados[idx].estado='completado';DB.set('apartados',apartados);}
  toast('Apartado completado','success');
  renderApartadosModule(document.getElementById('moduleContainer'));
}

function verDetalleApartado(apId){
  const ap=DB.get('apartados',[]).find(a=>a.id===apId);
  if(!ap)return;
  const pagado=ap.abonos?ap.abonos.reduce((s,ab)=>s+ab.monto,0):0;
  const falta=ap.total-pagado;
  openModal('Detalle Apartado',`
    <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between"><span class="text-muted">Cliente</span><strong>${ap.cliente}</strong></div>
      ${ap.telefono?`<div style="display:flex;justify-content:space-between"><span class="text-muted">Teléfono</span><span>${ap.telefono}</span></div>`:''}
      <div style="display:flex;justify-content:space-between"><span class="text-muted">Total</span><strong>${fmt(ap.total)}</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="text-muted">Pagado</span><strong class="text-green">${fmt(pagado)}</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="text-muted">Por pagar</span><strong class="${falta>0?'text-amber':'text-green'}">${fmt(falta)}</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="text-muted">Vencimiento</span><span>${fmtDate(ap.fechaVencimiento)}</span></div>
      ${ap.observaciones?`<div style="display:flex;justify-content:space-between"><span class="text-muted">Notas</span><span>${ap.observaciones}</span></div>`:''}
    </div>
    <div class="section-title">Historial de Abonos</div>
    ${ap.abonos&&ap.abonos.length?`<div class="table-wrap"><table>
      <thead><tr><th>Fecha</th><th>Monto</th><th>Usuario</th></tr></thead>
      <tbody>${ap.abonos.map(ab=>`<tr><td class="td-mono">${fmtDateTime(ab.fecha)}</td><td class="text-green font-bold">${fmt(ab.monto)}</td><td>${ab.usuario||'—'}</td></tr>`).join('')}</tbody>
    </table></div>`:'<p class="text-muted">Sin abonos</p>'}
    <div class="modal-footer" style="padding:1rem 0 0"><button class="btn btn-secondary" onclick="closeModalDirect()">Cerrar</button></div>`,{lg:true});
}
