// ===== CAJA.JS =====

registerModule('caja', (container)=>{
  renderCajaModule(container);
});

function renderCajaModule(container){
  const caja=DB.get('caja',{abierta:false,base:0,movimientos:[],historial:[]});
  const actual=calcCajaActual();
  const cfg=DB.get('config',{});
  const metodos=cfg.metodoPagos||{};

  // Calcular totales por método
  const porMetodo={};
  (caja.movimientos||[]).forEach(m=>{
    if(m.tipo==='venta'){
      if(!porMetodo[m.metodoClave])porMetodo[m.metodoClave]={label:metodos[m.metodoClave]?.label||m.metodoClave,total:0,sumaCaja:metodos[m.metodoClave]?.sumaCaja};
      porMetodo[m.metodoClave].total+=m.monto;
    }
  });

  const totalEgresos=(caja.movimientos||[]).filter(m=>m.tipo==='egreso').reduce((s,m)=>s+m.monto,0);
  const totalVentas=(caja.movimientos||[]).filter(m=>m.tipo==='venta').reduce((s,m)=>s+m.monto,0);

  container.innerHTML=`
  <div class="page-header">
    <div><div class="page-title">Caja</div><div class="page-subtitle">Control de efectivo y cierres</div></div>
    ${!caja.abierta?`<button class="btn btn-primary" onclick="abrirCaja()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      Abrir Caja</button>`:
    `<div class="flex gap-1">
      <button class="btn btn-secondary" onclick="registrarEgreso()">Registrar Egreso</button>
      <button class="btn btn-danger" onclick="cerrarCaja()">Cerrar Caja</button>
    </div>`}
  </div>

  ${caja.abierta?`
  <div class="caja-balance">
    <p style="opacity:.8;font-size:0.85rem;text-transform:uppercase;letter-spacing:.1em">Saldo en caja</p>
    <h2>${fmt(actual)}</h2>
    <p>Base inicial: ${fmt(caja.base)} • Abierta por: ${caja.abiertaPor||'—'}</p>
  </div>
  <div class="grid-3 mb-2">
    <div class="card stat-card">
      <div class="stat-label">Total Ventas</div>
      <div class="stat-value text-green">${fmt(totalVentas)}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Total Egresos</div>
      <div class="stat-value text-red">${fmt(totalEgresos)}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Movimientos</div>
      <div class="stat-value">${(caja.movimientos||[]).length}</div>
    </div>
  </div>

  <div class="grid-2 mb-2">
    <div class="card">
      <div class="section-title">Ventas por Método</div>
      ${Object.keys(porMetodo).length===0?'<p class="text-muted" style="font-size:0.85rem">Sin ventas registradas</p>':
      Object.entries(porMetodo).map(([k,m])=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid var(--border)">
          <div>
            <span style="font-weight:600;font-size:0.88rem">${m.label}</span>
            <span class="badge ${m.sumaCaja?'badge-green':'badge-amber'}" style="margin-left:0.5rem">${m.sumaCaja?'↑ suma':'→ no suma'}</span>
          </div>
          <span class="font-mono font-bold ${m.sumaCaja?'text-green':'text-amber'}">${fmt(m.total)}</span>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="section-title">Últimos Movimientos</div>
      ${(caja.movimientos||[]).length===0?'<p class="text-muted" style="font-size:0.85rem">Sin movimientos</p>':
      (caja.movimientos||[]).slice(-8).reverse().map(m=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.45rem 0;border-bottom:1px solid var(--border);font-size:0.83rem">
          <div>
            <span class="badge ${m.tipo==='venta'?'badge-green':m.tipo==='egreso'?'badge-red':'badge-amber'}">${m.tipo}</span>
            <span class="text-muted" style="margin-left:0.4rem">${new Date(m.fecha).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</span>
          </div>
          <span class="font-mono font-bold ${m.tipo==='egreso'?'text-red':'text-green'}">${m.tipo==='egreso'?'-':''}${fmt(m.monto)}</span>
        </div>`).join('')}
    </div>
  </div>`:`
  <div class="card" style="text-align:center;padding:3rem">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1" style="margin:0 auto 1rem;display:block"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
    <h3 style="font-family:'Syne',sans-serif;font-weight:700;margin-bottom:0.5rem">Caja Cerrada</h3>
    <p class="text-muted" style="margin-bottom:1.5rem">Abre la caja para registrar ventas</p>
    <button class="btn btn-primary" onclick="abrirCaja()">Abrir Caja Ahora</button>
  </div>`}

  <!-- Historial de cierres -->
  <div class="card mt-2">
    <div class="section-title">Historial de Cierres</div>
    ${(caja.historial||[]).length===0?'<p class="text-muted" style="font-size:0.85rem">Sin cierres anteriores</p>':
    `<div class="table-wrap"><table>
      <thead><tr><th>Fecha</th><th>Base</th><th>Total Ventas</th><th>Efectivo</th><th>Saldo Final</th><th>Diferencia</th><th>Cerró</th></tr></thead>
      <tbody>${(caja.historial||[]).slice().reverse().map(h=>`<tr>
        <td class="td-mono">${fmtDateTime(h.fecha)}</td>
        <td>${fmt(h.base)}</td>
        <td class="text-green font-bold">${fmt(h.totalVentas)}</td>
        <td>${fmt(h.totalEfectivo)}</td>
        <td class="text-green font-bold">${fmt(h.saldoFinal)}</td>
        <td class="${h.diferencia>=0?'text-green':'text-red'} font-bold">${h.diferencia>=0?'+':''}${fmt(h.diferencia)}</td>
        <td>${h.usuario}</td>
      </tr>`).join('')}</tbody>
    </table></div>`}
  </div>`;
}

function abrirCaja(){
  openModal('Abrir Caja',`
    <div class="form-group"><label>Base inicial (efectivo en caja)</label>
      <input type="number" id="baseInicial" value="0" min="0" placeholder="0" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary);font-size:1.1rem">
    </div>
    <p class="text-muted" style="font-size:0.82rem">Este es el efectivo físico con el que inicia el día.</p>
    <div class="modal-footer" style="padding:1rem 0 0"><button class="btn btn-primary" onclick="confirmarAbrirCaja()">Abrir Caja</button><button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button></div>`);
}

function confirmarAbrirCaja(){
  const base=parseFloat(document.getElementById('baseInicial').value)||0;
  DB.set('caja',{abierta:true,base,movimientos:[],historial:DB.get('caja',{historial:[]}).historial||[],abiertaPor:currentUser.nombre,fechaApertura:new Date().toISOString()});
  closeModalDirect();
  toast('Caja abierta','success');
  showModule('caja');
}

function registrarEgreso(){
  openModal('Registrar Egreso',`
    <div class="form-group"><label>Concepto</label><input type="text" id="egresoConcepto" placeholder="Compra de mercancía, pago proveedor..." style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary);font-size:0.9rem"></div>
    <div class="form-group"><label>Monto</label><input type="number" id="egresoMonto" min="0" placeholder="0" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary);font-size:1rem"></div>
    <div class="modal-footer" style="padding:1rem 0 0"><button class="btn btn-danger" onclick="confirmarEgreso()">Registrar Egreso</button><button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button></div>`);
}

function confirmarEgreso(){
  const concepto=document.getElementById('egresoConcepto').value||'Sin concepto';
  const monto=parseFloat(document.getElementById('egresoMonto').value)||0;
  if(!monto){toast('Ingresa un monto válido','warn');return;}
  const caja=DB.get('caja',{});
  caja.movimientos=caja.movimientos||[];
  caja.movimientos.push({id:uid(),tipo:'egreso',fecha:new Date().toISOString(),monto,concepto,usuario:currentUser.nombre});
  DB.set('caja',caja);
  // También guardar en egresos separado
  const egresos=DB.get('egresos',[]);
  egresos.push({id:uid(),fecha:new Date().toISOString(),concepto,monto,usuario:currentUser.nombre});
  DB.set('egresos',egresos);
  closeModalDirect();
  toast('Egreso registrado','info');
  showModule('caja');
}

function cerrarCaja(){
  const caja=DB.get('caja',{});
  const actual=calcCajaActual();
  const cfg=DB.get('config',{});
  const metodos=cfg.metodoPagos||{};
  const totalVentas=(caja.movimientos||[]).filter(m=>m.tipo==='venta').reduce((s,m)=>s+m.monto,0);
  const totalEfectivo=(caja.movimientos||[]).filter(m=>m.tipo==='venta'&&metodos[m.metodoClave]?.sumaCaja).reduce((s,m)=>s+m.monto,0);
  const totalEgresos=(caja.movimientos||[]).filter(m=>m.tipo==='egreso').reduce((s,m)=>s+m.monto,0);

  openModal('Cierre de Caja',`
    <div class="caja-balance" style="padding:1.25rem;margin-bottom:1rem">
      <p style="opacity:.8;font-size:0.8rem">Saldo en caja</p>
      <h2 style="font-size:2rem;margin:0.25rem 0">${fmt(actual)}</h2>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--border)"><span class="text-muted">Base inicial</span><span class="font-bold">${fmt(caja.base||0)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--border)"><span class="text-muted">Total ventas</span><span class="font-bold text-green">${fmt(totalVentas)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--border)"><span class="text-muted">Efectivo en caja</span><span class="font-bold text-green">${fmt(totalEfectivo)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--border)"><span class="text-muted">Total egresos</span><span class="font-bold text-red">${fmt(totalEgresos)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0"><span class="font-bold">Saldo final</span><span class="font-bold text-green" style="font-size:1.1rem">${fmt(actual)}</span></div>
    </div>
    <div class="form-group"><label>Efectivo contado (físico)</label>
      <input type="number" id="efectivoContado" placeholder="0" min="0" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.7rem 1rem;color:var(--text-primary);font-size:0.95rem" oninput="calcDiferencia(${actual})">
    </div>
    <div id="difDisplay" style="display:none;padding:0.6rem 1rem;border-radius:var(--radius-sm);margin-bottom:0.75rem;font-weight:700"></div>
    <div class="modal-footer" style="padding:1rem 0 0"><button class="btn btn-danger" onclick="confirmarCierreCaja(${actual},${totalVentas},${totalEfectivo},${caja.base||0})">Confirmar Cierre</button><button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button></div>`,
    {lg:true});
}

function calcDiferencia(saldoFinal){
  const contado=parseFloat(document.getElementById('efectivoContado').value)||0;
  const dif=contado-saldoFinal;
  const el=document.getElementById('difDisplay');
  el.style.display='block';
  el.style.background=dif>=0?'var(--accent-green-dim)':'rgba(239,68,68,0.1)';
  el.style.color=dif>=0?'var(--accent-green)':'var(--accent-red)';
  el.style.border=`1px solid ${dif>=0?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`;
  el.textContent=`Diferencia: ${dif>=0?'+':''}${fmt(dif)}`;
}

function confirmarCierreCaja(saldoFinal,totalVentas,totalEfectivo,base){
  const contado=parseFloat((document.getElementById('efectivoContado')||{}).value)||0;
  const caja=DB.get('caja',{historial:[]});
  const cierre={
    id:uid(),fecha:new Date().toISOString(),
    base,totalVentas,totalEfectivo,
    saldoFinal,efectivoContado:contado,
    diferencia:contado-saldoFinal,
    usuario:currentUser.nombre,
    movimientos:[...(caja.movimientos||[])]
  };
  caja.historial=caja.historial||[];
  caja.historial.push(cierre);
  caja.abierta=false;
  caja.movimientos=[];
  caja.base=0;
  DB.set('caja',caja);
  closeModalDirect();
  toast('Caja cerrada correctamente','success');
  showModule('caja');
}
