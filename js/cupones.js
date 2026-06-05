// ===== CUPONES.JS =====

registerModule('cupones', (container)=>{
  renderCuponesModule(container);
});

function renderCuponesModule(container){
  const cupones=DB.get('cupones',[]);
  container.innerHTML=`
  <div class="page-header">
    <div><div class="page-title">Cupones de Descuento</div><div class="page-subtitle">${cupones.length} cupones registrados</div></div>
    <button class="btn btn-primary" onclick="abrirFormCupon()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Nuevo Cupón
    </button>
  </div>

  ${!cupones.length?`<div class="card"><div class="empty-state">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    <p>No hay cupones creados.<br>Crea tu primer cupón de descuento.</p>
  </div></div>`:
  `<div class="table-wrap"><table>
    <thead><tr><th>Código</th><th>Tipo</th><th>Descuento</th><th>Vencimiento</th><th>Usos</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>${cupones.map(c=>{
      const vencido=c.vencimiento&&new Date(c.vencimiento)<new Date();
      const agotado=c.usoMax&&c.usosActuales>=c.usoMax;
      return`<tr>
        <td><span class="font-mono font-bold" style="font-size:1rem;letter-spacing:.05em">${c.codigo}</span></td>
        <td><span class="badge ${c.tipo==='porcentaje'?'badge-blue':'badge-green'}">${c.tipo==='porcentaje'?'%':'$'} ${c.tipo==='porcentaje'?'Porcentaje':'Fijo'}</span></td>
        <td class="td-bold text-green">${c.tipo==='porcentaje'?c.valor+'%':fmt(c.valor)}</td>
        <td>${c.vencimiento?`<span class="${vencido?'text-red':''}">${fmtDate(c.vencimiento)}</span>`:'Sin límite'}</td>
        <td>${c.usoMax?`${c.usosActuales||0}/${c.usoMax}`:`${c.usosActuales||0}/∞`}</td>
        <td>${!c.activo||vencido||agotado?`<span class="badge badge-red">${vencido?'Vencido':agotado?'Agotado':'Inactivo'}</span>`:`<span class="badge badge-green">Activo</span>`}</td>
        <td>
          <div class="flex gap-1">
            <button class="btn-icon" onclick="editarCupon('${c.id}')" title="Editar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon" onclick="toggleCupon('${c.id}')" title="${c.activo?'Desactivar':'Activar'}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
            </button>
            <button class="btn-icon" onclick="eliminarCupon('${c.id}')" title="Eliminar" style="color:var(--accent-red)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </td>
      </tr>`;}).join('')}
    </tbody>
  </table></div>`}`;
}

function abrirFormCupon(cuponId=null){
  const cupones=DB.get('cupones',[]);
  const c=cuponId?cupones.find(x=>x.id===cuponId):null;
  openModal(c?'Editar Cupón':'Nuevo Cupón',`
    <div class="form-group">
      <label>Código del cupón *</label>
      <input type="text" id="cup_codigo" value="${c?c.codigo:''}" placeholder="BIENVENIDA10" style="text-transform:uppercase;width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary);font-size:1rem;letter-spacing:.05em" oninput="this.value=this.value.toUpperCase()">
    </div>
    <div class="inp-row">
      <div class="form-group">
        <label>Tipo de descuento *</label>
        <select id="cup_tipo" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
          <option value="porcentaje" ${!c||c.tipo==='porcentaje'?'selected':''}>% Porcentaje</option>
          <option value="fijo" ${c&&c.tipo==='fijo'?'selected':''}>$ Valor fijo</option>
        </select>
      </div>
      <div class="form-group">
        <label>Valor del descuento *</label>
        <input type="number" id="cup_valor" value="${c?c.valor:''}" min="0" placeholder="10" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
      </div>
    </div>
    <div class="inp-row">
      <div class="form-group">
        <label>Fecha de vencimiento</label>
        <input type="date" id="cup_vence" value="${c?c.vencimiento||'':''}" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
      </div>
      <div class="form-group">
        <label>Usos máximos</label>
        <input type="number" id="cup_usoMax" value="${c?c.usoMax||'':''}" min="0" placeholder="Ilimitado" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
      </div>
    </div>
    <div class="perm-toggle" style="margin-top:0.5rem">
      <span class="perm-label">Cupón activo</span>
      <label class="switch"><input type="checkbox" id="cup_activo" ${!c||c.activo?'checked':''}><span class="switch-slider"></span></label>
    </div>
    <input type="hidden" id="cup_id" value="${c?c.id:''}">
    <div class="modal-footer" style="padding:1rem 0 0">
      <button class="btn btn-primary" onclick="guardarCupon()">Guardar Cupón</button>
      <button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button>
    </div>`);
}

function guardarCupon(){
  const codigo=document.getElementById('cup_codigo').value.trim().toUpperCase();
  const tipo=document.getElementById('cup_tipo').value;
  const valor=parseFloat(document.getElementById('cup_valor').value)||0;
  const vencimiento=document.getElementById('cup_vence').value||null;
  const usoMax=parseInt(document.getElementById('cup_usoMax').value)||null;
  const activo=document.getElementById('cup_activo').checked;
  const cuponId=document.getElementById('cup_id').value;

  if(!codigo){toast('El código es obligatorio','warn');return;}
  if(!valor){toast('El valor del descuento es obligatorio','warn');return;}
  if(tipo==='porcentaje'&&valor>100){toast('El porcentaje no puede superar 100','warn');return;}

  const cupones=DB.get('cupones',[]);
  // Validar código único (excepto edición)
  const existe=cupones.find(c=>c.codigo===codigo&&c.id!==cuponId);
  if(existe){toast('Ya existe un cupón con ese código','error');return;}

  const cupon={
    id:cuponId||uid(), codigo, tipo, valor,
    vencimiento, usoMax, activo,
    usosActuales:cuponId?(cupones.find(c=>c.id===cuponId)||{}).usosActuales||0:0
  };

  if(cuponId){
    const idx=cupones.findIndex(c=>c.id===cuponId);
    if(idx>-1)cupones[idx]=cupon;
  } else {
    cupones.push(cupon);
  }
  DB.set('cupones',cupones);
  closeModalDirect();
  toast(cuponId?'Cupón actualizado':'Cupón creado','success');
  showModule('cupones');
}

function editarCupon(id){abrirFormCupon(id);}

function toggleCupon(id){
  const cupones=DB.get('cupones',[]);
  const idx=cupones.findIndex(c=>c.id===id);
  if(idx>-1){cupones[idx].activo=!cupones[idx].activo;DB.set('cupones',cupones);}
  showModule('cupones');
}

function eliminarCupon(id){
  openModal('Eliminar Cupón',`
    <p style="color:var(--text-secondary)">¿Eliminar este cupón? No se podrá recuperar.</p>
    <div class="modal-footer" style="padding:1rem 0 0">
      <button class="btn btn-danger" onclick="confirmarEliminarCupon('${id}')">Eliminar</button>
      <button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button>
    </div>`);
}

function confirmarEliminarCupon(id){
  DB.set('cupones',DB.get('cupones',[]).filter(c=>c.id!==id));
  closeModalDirect();
  toast('Cupón eliminado','info');
  showModule('cupones');
}
