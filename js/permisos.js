// ===== PERMISOS.JS =====

const PERMISOS_LISTA = [
  { key:'dashboard',    label:'Dashboard',           desc:'Ver panel principal' },
  { key:'ventas',       label:'Ventas / POS',         desc:'Realizar ventas' },
  { key:'apartados',    label:'Apartados',            desc:'Crear y ver apartados' },
  { key:'caja',         label:'Caja',                 desc:'Ver y operar caja' },
  { key:'productos',    label:'Inventario',           desc:'Crear/editar productos' },
  { key:'ofertas',      label:'Ofertas',              desc:'Ver sección de ofertas' },
  { key:'cupones',      label:'Cupones',              desc:'Gestionar cupones' },
  { key:'movimientos',  label:'Movimientos',          desc:'Ver historial de ventas' },
  { key:'reportes',     label:'Reportes',             desc:'Acceder a reportes' },
  { key:'usuarios',     label:'Usuarios',             desc:'Gestionar usuarios' },
  { key:'configuracion',label:'Configuración',        desc:'Configurar el negocio' },
  { key:'editarVentas', label:'Editar Ventas',        desc:'Modificar ventas existentes' },
  { key:'eliminarVentas',label:'Eliminar Ventas',     desc:'Borrar ventas del historial' },
  { key:'verBalance',   label:'Ver Balance Caja',     desc:'Ver saldo de caja' },
  { key:'imprimirReportes',label:'Imprimir / Exportar',desc:'Imprimir y exportar datos' },
];

function gestionarPermisos(userId){
  const users=DB.get('users',[]);
  const u=users.find(x=>x.id===userId);
  if(!u)return;
  const perms=u.permisos||{};

  const rows=PERMISOS_LISTA.map(p=>`
    <div class="perm-toggle">
      <div>
        <div class="perm-label">${p.label}</div>
        <div style="font-size:0.72rem;color:var(--text-muted)">${p.desc}</div>
      </div>
      <label class="switch">
        <input type="checkbox" id="perm_${p.key}" ${perms[p.key]?'checked':''}>
        <span class="switch-slider"></span>
      </label>
    </div>`).join('');

  openModal(`Permisos — ${u.nombre||u.username}`,`
    <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:1rem">
      Personaliza el acceso de este usuario. Los cambios se aplican en su próximo inicio de sesión.
    </p>
    <div style="display:flex;gap:0.5rem;margin-bottom:1rem">
      <button class="btn btn-secondary btn-xs" onclick="selectAllPerms(true)">Activar todos</button>
      <button class="btn btn-secondary btn-xs" onclick="selectAllPerms(false)">Desactivar todos</button>
      <button class="btn btn-secondary btn-xs" onclick="resetPermsByRol('${u.rol}')">Restaurar por rol</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.35rem">${rows}</div>
    <div class="modal-footer" style="padding:1rem 0 0">
      <button class="btn btn-primary" onclick="guardarPermisos('${userId}')">Guardar Permisos</button>
      <button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button>
    </div>`,{lg:true});
}

function selectAllPerms(val){
  PERMISOS_LISTA.forEach(p=>{
    const el=document.getElementById('perm_'+p.key);
    if(el)el.checked=val;
  });
}

function resetPermsByRol(rol){
  let defaults={};
  if(rol==='ADMIN')defaults=getAllPerms();
  else if(rol==='PROPIETARIO')defaults=getPropPerms();
  else defaults=getEmpPerms();
  PERMISOS_LISTA.forEach(p=>{
    const el=document.getElementById('perm_'+p.key);
    if(el)el.checked=!!defaults[p.key];
  });
  toast('Permisos restaurados al rol por defecto','info');
}

function guardarPermisos(userId){
  const users=DB.get('users',[]);
  const idx=users.findIndex(u=>u.id===userId);
  if(idx>-1){
    const newPerms={};
    PERMISOS_LISTA.forEach(p=>{
      const el=document.getElementById('perm_'+p.key);
      newPerms[p.key]=el?el.checked:false;
    });
    users[idx].permisos=newPerms;
    DB.set('users',users);
    // Si es el usuario actual, actualizar en memoria
    if(currentUser.id===userId){
      currentUser.permisos=newPerms;
      applyNavPerms();
    }
  }
  closeModalDirect();
  toast('Permisos guardados','success');
  showModule('usuarios');
}
