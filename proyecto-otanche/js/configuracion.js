// ===== CONFIGURACION.JS =====

registerModule('configuracion', (container)=>{
  if(!hasPerm('configuracion')){
    container.innerHTML=`<div class="empty-state"><p>Sin permiso para Configuración.</p></div>`;return;
  }
  renderConfigModule(container);
});

function renderConfigModule(container){
  const cfg=DB.get('config',{});
  const metodos=cfg.metodoPagos||{};

  container.innerHTML=`
  <div class="page-header">
    <div><div class="page-title">Configuración</div><div class="page-subtitle">Información del negocio y sistema</div></div>
    <button class="btn btn-primary" onclick="guardarConfiguracion()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      Guardar Cambios
    </button>
  </div>

  <div class="grid-2">
    <!-- Info del negocio -->
    <div class="card">
      <div class="section-title">Información del Negocio</div>
      <div class="form-group">
        <label>Nombre del negocio *</label>
        <input type="text" id="cfg_nombre" value="${cfg.nombre||''}" placeholder="Mi Tienda" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
      </div>
      <div class="form-group">
        <label>Descripción / Slogan</label>
        <input type="text" id="cfg_desc" value="${cfg.descripcion||''}" placeholder="Sistema de Control de Ventas" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
      </div>
      <div class="form-group">
        <label>Dirección</label>
        <input type="text" id="cfg_dir" value="${cfg.direccion||''}" placeholder="Calle 1 # 2-3, Ciudad" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
      </div>
      <div class="inp-row">
        <div class="form-group">
          <label>Teléfono</label>
          <input type="text" id="cfg_tel" value="${cfg.telefono||''}" placeholder="310 000 0000" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
        </div>
        <div class="form-group">
          <label>Correo</label>
          <input type="email" id="cfg_email" value="${cfg.correo||''}" placeholder="info@negocio.com" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
        </div>
      </div>
      <div class="form-group">
        <label>Página web</label>
        <input type="text" id="cfg_web" value="${cfg.web||''}" placeholder="www.minegocio.com" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
      </div>
      <div class="inp-row">
        <div class="form-group">
          <label>Facebook</label>
          <input type="text" id="cfg_fb" value="${cfg.facebook||''}" placeholder="@minegocio" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
        </div>
        <div class="form-group">
          <label>Instagram</label>
          <input type="text" id="cfg_ig" value="${cfg.instagram||''}" placeholder="@minegocio" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
        </div>
      </div>
    </div>

    <!-- Logo y métodos de pago -->
    <div style="display:flex;flex-direction:column;gap:1rem">
      <!-- Logo -->
      <div class="card">
        <div class="section-title">Logo del Negocio</div>
        <div style="display:flex;align-items:center;gap:1.25rem;margin-bottom:1rem">
          <div id="logoPreview" style="width:80px;height:80px;border-radius:var(--radius);background:var(--bg-tertiary);border:2px dashed var(--border);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
            ${cfg.logo?`<img src="${cfg.logo}" style="width:100%;height:100%;object-fit:contain">`:`<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`}
          </div>
          <div>
            <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:0.75rem">Sube el logo de tu negocio. Se mostrará en facturas, tickets y el sistema.</p>
            <label class="btn btn-secondary btn-sm" style="cursor:pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Subir Logo
              <input type="file" id="logoFile" accept="image/*" style="display:none" onchange="previewLogo(this)">
            </label>
            ${cfg.logo?`<button class="btn btn-danger btn-sm" style="margin-left:0.5rem" onclick="borrarLogo()">Quitar logo</button>`:''}
          </div>
        </div>
        <input type="hidden" id="cfg_logo" value="${cfg.logo||''}">
      </div>

      <!-- Métodos de pago -->
      <div class="card">
        <div class="section-title">Métodos de Pago y Recargos</div>
        <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.75rem">Configura el recargo (%) de cada método. Solo métodos marcados como "suma caja" cuentan en el saldo de caja.</p>
        <div id="metodosConfig">
          ${Object.entries(metodos).map(([k,m])=>`
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0;border-bottom:1px solid var(--border)">
            <span style="flex:1;font-weight:600;font-size:0.88rem">${m.label}</span>
            <div style="display:flex;align-items:center;gap:0.35rem">
              <span style="font-size:0.75rem;color:var(--text-muted)">Recargo %</span>
              <input type="number" id="met_${k}_recargo" value="${m.recargo||0}" min="0" max="50" style="width:60px;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:6px;padding:0.35rem 0.5rem;color:var(--text-primary);font-size:0.85rem;text-align:center">
            </div>
            <div style="display:flex;align-items:center;gap:0.35rem">
              <span style="font-size:0.75rem;color:var(--text-muted)">Suma caja</span>
              <label class="switch" style="transform:scale(0.8)">
                <input type="checkbox" id="met_${k}_suma" ${m.sumaCaja?'checked':''}>
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>

  <!-- Zona de datos -->
  <div class="card mt-2" style="border-color:rgba(239,68,68,0.3)">
    <div class="section-title" style="color:var(--accent-red)">⚠️ Zona Peligrosa</div>
    <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:1rem">Estas acciones no se pueden deshacer. Úsalas con precaución.</p>
    <div class="flex gap-1" style="flex-wrap:wrap">
      <button class="btn btn-danger btn-sm" onclick="limpiarVentas()">Borrar todas las ventas</button>
      <button class="btn btn-danger btn-sm" onclick="limpiarInventario()">Borrar inventario</button>
      <button class="btn btn-danger btn-sm" onclick="resetearSistema()">Resetear sistema completo</button>
      <button class="btn btn-secondary btn-sm" onclick="exportarBackup()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Exportar Backup JSON
      </button>
    </div>
  </div>`;
}

function previewLogo(input){
  const file=input.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    document.getElementById('cfg_logo').value=e.target.result;
    document.getElementById('logoPreview').innerHTML=`<img src="${e.target.result}" style="width:100%;height:100%;object-fit:contain">`;
  };
  reader.readAsDataURL(file);
}

function borrarLogo(){
  document.getElementById('cfg_logo').value='';
  document.getElementById('logoPreview').innerHTML=`<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
}

function guardarConfiguracion(){
  const cfg=DB.get('config',{});
  cfg.nombre=document.getElementById('cfg_nombre').value.trim()||cfg.nombre;
  cfg.descripcion=document.getElementById('cfg_desc').value.trim();
  cfg.direccion=document.getElementById('cfg_dir').value.trim();
  cfg.telefono=document.getElementById('cfg_tel').value.trim();
  cfg.correo=document.getElementById('cfg_email').value.trim();
  cfg.web=document.getElementById('cfg_web').value.trim();
  cfg.facebook=document.getElementById('cfg_fb').value.trim();
  cfg.instagram=document.getElementById('cfg_ig').value.trim();
  cfg.logo=document.getElementById('cfg_logo').value||cfg.logo||'';

  // Métodos de pago
  const metodos=cfg.metodoPagos||{};
  Object.keys(metodos).forEach(k=>{
    const recEl=document.getElementById(`met_${k}_recargo`);
    const sumaEl=document.getElementById(`met_${k}_suma`);
    if(recEl)metodos[k].recargo=parseFloat(recEl.value)||0;
    if(sumaEl)metodos[k].sumaCaja=sumaEl.checked;
  });
  cfg.metodoPagos=metodos;

  DB.set('config',cfg);
  applyBusinessBranding();
  toast('Configuración guardada','success');
}

function limpiarVentas(){
  openModal('Borrar Ventas',`
    <p style="color:var(--accent-red);font-weight:600">⚠️ Esta acción borrará TODAS las ventas permanentemente.</p>
    <p style="color:var(--text-secondary);margin-top:0.5rem">Escribe <strong>BORRAR</strong> para confirmar:</p>
    <input type="text" id="confirmText" placeholder="BORRAR" style="margin-top:0.75rem;width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
    <div class="modal-footer" style="padding:1rem 0 0">
      <button class="btn btn-danger" onclick="if(document.getElementById('confirmText').value==='BORRAR'){DB.set('ventas',[]);DB.set('caja',{abierta:false,base:0,movimientos:[],historial:[]});closeModalDirect();toast('Ventas eliminadas','info');}else{toast('Escribe BORRAR para confirmar','warn');}">Confirmar</button>
      <button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button>
    </div>`);
}

function limpiarInventario(){
  openModal('Borrar Inventario',`
    <p style="color:var(--accent-red);font-weight:600">⚠️ Se borrarán TODOS los productos del inventario.</p>
    <p style="color:var(--text-secondary);margin-top:0.5rem">Escribe <strong>BORRAR</strong> para confirmar:</p>
    <input type="text" id="confirmText2" placeholder="BORRAR" style="margin-top:0.75rem;width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
    <div class="modal-footer" style="padding:1rem 0 0">
      <button class="btn btn-danger" onclick="if(document.getElementById('confirmText2').value==='BORRAR'){DB.set('productos',[]);closeModalDirect();toast('Inventario eliminado','info');}else{toast('Escribe BORRAR para confirmar','warn');}">Confirmar</button>
      <button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button>
    </div>`);
}

function resetearSistema(){
  openModal('RESETEAR SISTEMA',`
    <p style="color:var(--accent-red);font-weight:700;font-size:1rem">🚨 ADVERTENCIA TOTAL</p>
    <p style="color:var(--text-secondary);margin-top:0.5rem">Se borrarán ventas, productos, apartados, cupones, caja y egresos. Solo se conservarán usuarios y configuración.</p>
    <p style="margin-top:0.75rem;color:var(--text-secondary)">Escribe <strong>RESETEAR</strong> para confirmar:</p>
    <input type="text" id="confirmReset" placeholder="RESETEAR" style="margin-top:0.5rem;width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
    <div class="modal-footer" style="padding:1rem 0 0">
      <button class="btn btn-danger" onclick="confirmarResetear()">Resetear Todo</button>
      <button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button>
    </div>`);
}

function confirmarResetear(){
  if((document.getElementById('confirmReset')||{}).value!=='RESETEAR'){toast('Escribe RESETEAR para confirmar','warn');return;}
  DB.set('ventas',[]);DB.set('productos',[]);DB.set('apartados',[]);
  DB.set('cupones',[]);DB.set('egresos',[]);
  DB.set('caja',{abierta:false,base:0,movimientos:[],historial:[]});
  closeModalDirect();
  toast('Sistema reseteado','info');
  showModule('dashboard');
}

function exportarBackup(){
  const data={
    ventas:DB.get('ventas',[]),
    productos:DB.get('productos',[]),
    apartados:DB.get('apartados',[]),
    cupones:DB.get('cupones',[]),
    caja:DB.get('caja',{}),
    egresos:DB.get('egresos',[]),
    config:DB.get('config',{}),
    exportadoEn:new Date().toISOString()
  };
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=`backup_otanche_${new Date().toISOString().slice(0,10)}.json`;
  a.click(); URL.revokeObjectURL(url);
  toast('Backup exportado','success');
}
