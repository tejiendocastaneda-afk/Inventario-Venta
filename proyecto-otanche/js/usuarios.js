// ===== USUARIOS.JS =====

registerModule('usuarios', (container)=>{
  if(!hasPerm('usuarios')){
    container.innerHTML=`<div class="empty-state"><p>Sin permiso para acceder a Usuarios.</p></div>`;return;
  }
  renderUsuariosModule(container);
});

function renderUsuariosModule(container){
  const users=DB.get('users',[]);
  container.innerHTML=`
  <div class="page-header">
    <div><div class="page-title">Usuarios</div><div class="page-subtitle">${users.length} usuarios registrados</div></div>
    <button class="btn btn-primary" onclick="abrirFormUsuario()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Nuevo Usuario
    </button>
  </div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Permisos</th><th>Acciones</th></tr></thead>
      <tbody>
      ${users.map(u=>`<tr>
        <td class="td-mono font-bold">${u.username}</td>
        <td class="td-bold">${u.nombre||'—'}</td>
        <td><span class="badge ${u.rol==='ADMIN'?'badge-red':u.rol==='PROPIETARIO'?'badge-amber':'badge-blue'}">${u.rol}</span></td>
        <td>${u.activo?'<span class="badge badge-green">Activo</span>':'<span class="badge badge-gray">Inactivo</span>'}</td>
        <td><span style="font-size:0.78rem;color:var(--text-muted)">${Object.values(u.permisos||{}).filter(Boolean).length} permisos</span></td>
        <td>
          <div class="flex gap-1">
            <button class="btn btn-secondary btn-xs" onclick="editarUsuario('${u.id}')">Editar</button>
            <button class="btn btn-primary btn-xs" onclick="gestionarPermisos('${u.id}')">Permisos</button>
            ${u.id!==currentUser.id?`<button class="btn btn-${u.activo?'danger':'success'} btn-xs" onclick="toggleUsuario('${u.id}')">${u.activo?'Desactivar':'Activar'}</button>`:''}
            ${u.id!==currentUser.id?`<button class="btn-icon" onclick="eliminarUsuario('${u.id}')" style="color:var(--accent-red)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>`:''}
          </div>
        </td>
      </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

function abrirFormUsuario(userId=null){
  const users=DB.get('users',[]);
  const u=userId?users.find(x=>x.id===userId):null;
  openModal(u?'Editar Usuario':'Nuevo Usuario',`
    <div class="form-group">
      <label>Nombre completo *</label>
      <input type="text" id="uf_nombre" value="${u?u.nombre||'':''}" placeholder="Juan Pérez" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
    </div>
    <div class="form-group">
      <label>Nombre de usuario *</label>
      <input type="text" id="uf_username" value="${u?u.username:''}" placeholder="juanperez" ${u?'readonly style="opacity:.6"':''} style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
    </div>
    <div class="form-group">
      <label>${u?'Nueva contraseña (dejar vacío para mantener)':'Contraseña *'}</label>
      <div class="input-password-wrap">
        <input type="password" id="uf_pass" placeholder="${u?'Nueva contraseña...':'Contraseña segura'}" autocomplete="new-password" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 3rem 0.75rem 1rem;color:var(--text-primary)">
        <button class="toggle-pass" onclick="togglePassword('uf_pass',this)" tabindex="-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    </div>
    <div class="form-group">
      <label>Rol</label>
      <select id="uf_rol" style="width:100%;background:var(--bg-tertiary);border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem 1rem;color:var(--text-primary)">
        <option value="EMPLEADO" ${u&&u.rol==='EMPLEADO'?'selected':''}>EMPLEADO</option>
        <option value="PROPIETARIO" ${u&&u.rol==='PROPIETARIO'?'selected':''}>PROPIETARIO</option>
        <option value="ADMIN" ${u&&u.rol==='ADMIN'?'selected':''}>ADMIN</option>
      </select>
    </div>
    <div class="perm-toggle">
      <span class="perm-label">Usuario activo</span>
      <label class="switch"><input type="checkbox" id="uf_activo" ${!u||u.activo?'checked':''}><span class="switch-slider"></span></label>
    </div>
    <input type="hidden" id="uf_id" value="${u?u.id:''}">
    <div class="modal-footer" style="padding:1rem 0 0">
      <button class="btn btn-primary" onclick="guardarUsuario()">Guardar Usuario</button>
      <button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button>
    </div>`);
}

function guardarUsuario(){
  const nombre=document.getElementById('uf_nombre').value.trim();
  const username=document.getElementById('uf_username').value.trim().toLowerCase();
  const pass=document.getElementById('uf_pass').value;
  const rol=document.getElementById('uf_rol').value;
  const activo=document.getElementById('uf_activo').checked;
  const userId=document.getElementById('uf_id').value;

  if(!nombre){toast('El nombre es obligatorio','warn');return;}
  if(!username){toast('El usuario es obligatorio','warn');return;}
  if(!userId&&!pass){toast('La contraseña es obligatoria para usuarios nuevos','warn');return;}

  const users=DB.get('users',[]);
  if(!userId&&users.find(u=>u.username===username)){toast('Ese nombre de usuario ya existe','error');return;}

  let permisos;
  if(userId){
    const existing=users.find(u=>u.id===userId);
    permisos=existing?existing.permisos:getDefaultPerms(rol);
  } else {
    permisos=getDefaultPerms(rol);
  }

  const user={
    id:userId||uid(), nombre, username, rol, activo, permisos,
    password:pass?btoa(pass):(users.find(u=>u.id===userId)||{}).password
  };

  if(userId){
    const idx=users.findIndex(u=>u.id===userId);
    if(idx>-1)users[idx]=user;
  } else {
    users.push(user);
  }
  DB.set('users',users);

  // Actualizar currentUser si es el mismo
  if(currentUser.id===userId){
    currentUser=user;
    DB.set('session',{userId:user.id,time:Date.now()});
    updateSidebarUser();
  }

  closeModalDirect();
  toast(userId?'Usuario actualizado':'Usuario creado','success');
  showModule('usuarios');
}

function getDefaultPerms(rol){
  if(rol==='ADMIN')return getAllPerms();
  if(rol==='PROPIETARIO')return getPropPerms();
  return getEmpPerms();
}

function editarUsuario(id){abrirFormUsuario(id);}

function toggleUsuario(id){
  if(id===currentUser.id){toast('No puedes desactivarte a ti mismo','warn');return;}
  const users=DB.get('users',[]);
  const idx=users.findIndex(u=>u.id===id);
  if(idx>-1){users[idx].activo=!users[idx].activo;DB.set('users',users);}
  showModule('usuarios');
}

function eliminarUsuario(id){
  if(id===currentUser.id){toast('No puedes eliminar tu propio usuario','warn');return;}
  openModal('Eliminar Usuario',`
    <p style="color:var(--text-secondary)">¿Eliminar este usuario? Esta acción no se puede deshacer.</p>
    <div class="modal-footer" style="padding:1rem 0 0">
      <button class="btn btn-danger" onclick="confirmarEliminarUsuario('${id}')">Eliminar</button>
      <button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button>
    </div>`);
}

function confirmarEliminarUsuario(id){
  DB.set('users',DB.get('users',[]).filter(u=>u.id!==id));
  closeModalDirect();
  toast('Usuario eliminado','info');
  showModule('usuarios');
}
