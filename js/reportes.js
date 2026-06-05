// ===== REPORTES.JS =====

registerModule('reportes', (container)=>{
  renderReportesModule(container);
});

function renderReportesModule(container){
  const ventas=DB.get('ventas',[]);
  const egresos=DB.get('egresos',[]);
  const hoy=new Date().toDateString();
  const mes=new Date().getMonth(); const anio=new Date().getFullYear();

  const ventasHoy=ventas.filter(v=>new Date(v.fecha).toDateString()===hoy);
  const ventasMes=ventas.filter(v=>{const d=new Date(v.fecha);return d.getMonth()===mes&&d.getFullYear()===anio;});

  const totalHoy=ventasHoy.reduce((s,v)=>s+v.total,0);
  const totalMes=ventasMes.reduce((s,v)=>s+v.total,0);
  const totalGeneral=ventas.reduce((s,v)=>s+v.total,0);

  const egresosMes=egresos.filter(e=>{const d=new Date(e.fecha);return d.getMonth()===mes&&d.getFullYear()===anio;});
  const totalEgresosMes=egresosMes.reduce((s,e)=>s+e.monto,0);
  const gananciasMes=totalMes-totalEgresosMes;

  // Top productos
  const topMap={};
  ventas.forEach(v=>v.items&&v.items.forEach(it=>{
    if(!topMap[it.nombre])topMap[it.nombre]={nombre:it.nombre,cantidad:0,total:0};
    topMap[it.nombre].cantidad+=it.cantidad;
    topMap[it.nombre].total+=it.precio*(1-(it.descuento||0)/100)*it.cantidad;
  }));
  const topProds=Object.values(topMap).sort((a,b)=>b.cantidad-a.cantidad).slice(0,10);

  // Por método de pago
  const metMap={};
  ventas.forEach(v=>{
    if(!metMap[v.metodoPago])metMap[v.metodoPago]={label:v.metodoPago,total:0,count:0};
    metMap[v.metodoPago].total+=v.total;
    metMap[v.metodoPago].count++;
  });
  const porMetodo=Object.values(metMap).sort((a,b)=>b.total-a.total);

  // Últimos 7 días
  const dias7=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);dias7.push(d);}
  const dataDias=dias7.map(d=>{
    const key=d.toDateString();
    const vd=ventas.filter(v=>new Date(v.fecha).toDateString()===key);
    return{label:d.toLocaleDateString('es-CO',{weekday:'short',day:'numeric'}),total:vd.reduce((s,v)=>s+v.total,0),count:vd.length};
  });
  const maxDia=Math.max(...dataDias.map(d=>d.total),1);

  container.innerHTML=`
  <div class="page-header">
    <div><div class="page-title">Reportes</div><div class="page-subtitle">Análisis de ventas e ingresos</div></div>
    <button class="btn btn-secondary btn-sm" onclick="exportarReporteCSV()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Exportar
    </button>
  </div>

  <div class="grid-4 mb-2">
    <div class="card stat-card">
      <div class="stat-label">Ventas Hoy</div>
      <div class="stat-value text-green">${fmt(totalHoy)}</div>
      <div class="stat-sub">${ventasHoy.length} transacciones</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Ventas del Mes</div>
      <div class="stat-value text-blue">${fmt(totalMes)}</div>
      <div class="stat-sub">${ventasMes.length} transacciones</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Egresos del Mes</div>
      <div class="stat-value text-red">${fmt(totalEgresosMes)}</div>
      <div class="stat-sub">${egresosMes.length} registros</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Ganancia Neta Mes</div>
      <div class="stat-value ${gananciasMes>=0?'text-green':'text-red'}">${fmt(gananciasMes)}</div>
      <div class="stat-sub">Ventas - Egresos</div>
    </div>
  </div>

  <!-- Gráfico 7 días -->
  <div class="card mb-2">
    <div class="section-title">Ventas últimos 7 días</div>
    <div style="display:flex;align-items:flex-end;gap:0.5rem;height:140px;padding:0.5rem 0">
      ${dataDias.map(d=>`
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:0.35rem">
        <span style="font-size:0.68rem;color:var(--text-muted)">${d.total>0?fmt(d.total).replace('$',''):''}</span>
        <div style="flex:1;width:100%;background:var(--bg-tertiary);border-radius:6px;display:flex;align-items:flex-end;overflow:hidden">
          <div style="width:100%;background:var(--gradient);border-radius:6px;height:${Math.max(4,Math.round((d.total/maxDia)*100))}%;transition:height 0.6s ease"></div>
        </div>
        <span style="font-size:0.7rem;color:var(--text-muted);text-align:center">${d.label}</span>
      </div>`).join('')}
    </div>
  </div>

  <div class="grid-2 mb-2">
    <!-- Top productos -->
    <div class="card">
      <div class="section-title">Top 10 Productos Vendidos</div>
      ${!topProds.length?'<p class="text-muted">Sin datos</p>':
      `<div class="table-wrap"><table>
        <thead><tr><th>#</th><th>Producto</th><th>Uds</th><th>Total</th></tr></thead>
        <tbody>${topProds.map((p,i)=>`<tr>
          <td style="font-weight:700;color:${i<3?'var(--accent-green)':'var(--text-muted)'}">${i+1}</td>
          <td class="td-bold">${p.nombre}</td>
          <td><span class="badge badge-blue">${p.cantidad}</span></td>
          <td class="text-green font-bold">${fmt(p.total)}</td>
        </tr>`).join('')}</tbody>
      </table></div>`}
    </div>
    <!-- Por método de pago -->
    <div class="card">
      <div class="section-title">Ventas por Método de Pago</div>
      ${!porMetodo.length?'<p class="text-muted">Sin datos</p>':
      `<div style="display:flex;flex-direction:column;gap:0.5rem">
      ${porMetodo.map(m=>`
        <div style="display:flex;align-items:center;gap:0.75rem">
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
              <span style="font-size:0.83rem;font-weight:600">${m.label}</span>
              <span class="font-mono font-bold text-green">${fmt(m.total)}</span>
            </div>
            <div style="height:5px;background:var(--bg-tertiary);border-radius:99px">
              <div style="height:5px;background:var(--gradient);border-radius:99px;width:${Math.round((m.total/porMetodo[0].total)*100)}%"></div>
            </div>
          </div>
          <span class="badge badge-gray">${m.count}</span>
        </div>`).join('')}
      </div>`}
    </div>
  </div>

  <!-- Total general -->
  <div class="card" style="background:linear-gradient(135deg,var(--bg-card),rgba(16,185,129,0.05));border-color:rgba(16,185,129,0.2)">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div class="stat-label">Total General Histórico</div>
        <div class="stat-value text-green">${fmt(totalGeneral)}</div>
        <div class="stat-sub">${ventas.length} ventas en total</div>
      </div>
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="1" opacity=".3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
    </div>
  </div>`;
}

function exportarReporteCSV(){
  const ventas=DB.get('ventas',[]);
  let csv='Fecha,Cliente,Método,Total\n';
  ventas.forEach(v=>{csv+=`"${fmtDate(v.fecha)}","${v.cliente||''}","${v.metodoPago}","${v.total}"\n`;});
  downloadCSV(csv,'reporte_ventas.csv');
  toast('Reporte exportado','success');
}
