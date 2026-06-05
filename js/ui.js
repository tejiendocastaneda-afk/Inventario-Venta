// ===== UI.JS =====

function toast(msg, type='info', dur=3500){
  const icons={
    success:'<svg class="toast-icon text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    error:'<svg class="toast-icon text-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info:'<svg class="toast-icon text-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warn:'<svg class="toast-icon text-amber" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };
  const t=document.createElement('div');
  t.className=`toast toast-${type}`;
  t.innerHTML=(icons[type]||icons.info)+`<span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(()=>{t.classList.add('toast-fade');setTimeout(()=>t.remove(),350);},dur);
}

// ===== DASHBOARD MODULE =====
registerModule('dashboard', (container)=>{
  const ventas = DB.get('ventas',[]);
  const hoy = new Date().toDateString();
  const ventasHoy = ventas.filter(v=>new Date(v.fecha).toDateString()===hoy);
  const totalHoy = ventasHoy.reduce((s,v)=>s+v.total,0);
  const caja = DB.get('caja',{});
  const cajaActual = caja.abierta ? calcCajaActual() : null;
  const productos = DB.get('productos',[]);
  const stockBajo = productos.filter(p=>p.stock<=3).length;
  const apartados = DB.get('apartados',[]);
  const apVivos = apartados.filter(a=>a.estado==='activo').length;

  // Semana
  const hace7 = new Date(); hace7.setDate(hace7.getDate()-7);
  const ventasSem = ventas.filter(v=>new Date(v.fecha)>=hace7);
  const totalSem = ventasSem.reduce((s,v)=>s+v.total,0);

  // top products
  const topMap={};
  ventas.forEach(v=>v.items&&v.items.forEach(it=>{topMap[it.nombre]=(topMap[it.nombre]||0)+it.cantidad;}));
  const topProds = Object.entries(topMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const cfg = DB.get('config',{});

  container.innerHTML=`
  <div class="dashboard-welcome">
    <div class="welcome-text">
      <h2>Bienvenido, ${currentUser.nombre||currentUser.username} 👋</h2>
      <p>${cfg.nombre||'Sistema POS'} — ${cfg.direccion||''}</p>
    </div>
    <div class="dash-time" id="dashClock">00:00:00</div>
  </div>

  <div class="grid-4 mb-2">
    <div class="card stat-card card-hover">
      <div class="stat-header">
        <span class="stat-label">Ventas Hoy</span>
        <div class="stat-icon" style="background:var(--accent-green-dim)">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
        </div>
      </div>
      <div class="stat-value">${fmt(totalHoy)}</div>
      <div class="stat-sub">${ventasHoy.length} transacciones hoy</div>
    </div>
    <div class="card stat-card card-hover">
      <div class="stat-header">
        <span class="stat-label">Esta Semana</span>
        <div class="stat-icon" style="background:var(--accent-blue-dim)">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
      </div>
      <div class="stat-value">${fmt(totalSem)}</div>
      <div class="stat-sub">${ventasSem.length} transacciones</div>
    </div>
    <div class="card stat-card card-hover">
      <div class="stat-header">
        <span class="stat-label">Caja Actual</span>
        <div class="stat-icon" style="background:rgba(245,158,11,0.12)">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
      </div>
      <div class="stat-value">${caja.abierta?fmt(cajaActual):'—'}</div>
      <div class="stat-sub">${caja.abierta?'Caja abierta':'Caja cerrada'}</div>
    </div>
    <div class="card stat-card card-hover">
      <div class="stat-header">
        <span class="stat-label">Apartados</span>
        <div class="stat-icon" style="background:rgba(139,92,246,0.12)">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg>
        </div>
      </div>
      <div class="stat-value">${apVivos}</div>
      <div class="stat-sub">${stockBajo} productos stock bajo</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="section-title">Últimas Ventas</div>
      ${ventasHoy.length===0?'<div class="empty-state"><p>Sin ventas hoy</p></div>':
      `<div class="table-wrap"><table><thead><tr><th>Hora</th><th>Cliente</th><th>Método</th><th>Total</th></tr></thead><tbody>
      ${ventasHoy.slice(-8).reverse().map(v=>`<tr>
        <td class="td-mono">${new Date(v.fecha).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</td>
        <td>${v.cliente||'Ocasional'}</td>
        <td><span class="badge badge-blue">${v.metodoPago||''}</span></td>
        <td class="td-bold text-green">${fmt(v.total)}</td>
      </tr>`).join('')}
      </tbody></table></div>`}
    </div>
    <div class="card">
      <div class="section-title">Productos más Vendidos</div>
      ${topProds.length===0?'<div class="empty-state"><p>Sin datos aún</p></div>':
      `<div style="display:flex;flex-direction:column;gap:0.6rem">
      ${topProds.map(([name,qty],i)=>`
        <div style="display:flex;align-items:center;gap:0.75rem">
          <span style="width:22px;height:22px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;color:white;flex-shrink:0">${i+1}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:0.85rem;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
            <div style="height:4px;background:var(--bg-tertiary);border-radius:99px;margin-top:4px">
              <div style="height:4px;background:var(--gradient);border-radius:99px;width:${Math.round((qty/topProds[0][1])*100)}%"></div>
            </div>
          </div>
          <span class="badge badge-green">${qty} uds</span>
        </div>`).join('')}
      </div>`}
    </div>
  </div>

  ${stockBajo>0?`<div class="card mt-2" style="border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.03)">
    <div class="flex items-center gap-2" style="margin-bottom:0.75rem">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span class="section-title" style="border:none;margin:0;padding:0;color:var(--accent-red)">⚠️ Productos con stock bajo</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
    ${productos.filter(p=>p.stock<=3).map(p=>`<span class="badge badge-red">${p.nombre} — ${p.stock} uds</span>`).join('')}
    </div>
  </div>`:''}
  `;
  startClock();
});

function calcCajaActual(){
  const caja=DB.get('caja',{});
  if(!caja.abierta)return 0;
  let total=caja.base||0;
  const cfg=DB.get('config',{});
  const metodos=cfg.metodoPagos||{};
  (caja.movimientos||[]).forEach(m=>{
    if(m.tipo==='venta'){
      const met=metodos[m.metodoClave];
      if(met&&met.sumaCaja)total+=m.monto;
    } else if(m.tipo==='egreso'){
      total-=m.monto;
    } else if(m.tipo==='devolucion'){
      const met=metodos[m.metodoClave];
      if(met&&met.sumaCaja)total-=m.monto;
    }
  });
  return total;
}
