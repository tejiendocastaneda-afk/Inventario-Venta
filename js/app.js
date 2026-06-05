// ===== APP.JS — CORE SYSTEM =====

// ===== DATA STORE =====
const DB = {
  get: (k, def=null) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):def; } catch(e){return def;} },
  set: (k,v) => { try{localStorage.setItem(k,JSON.stringify(v));}catch(e){} },
  del: (k) => localStorage.removeItem(k)
};

// ===== INITIAL SETUP =====
function initSystem() {
  // Default users if none exist
  if (!DB.get('users')) {
    DB.set('users', [
      { id:'u1', username:'admin', password:btoa('Admin2024*'), nombre:'Administrador', rol:'ADMIN', activo:true, permisos:getAllPerms() },
      { id:'u2', username:'propietario', password:btoa('Prop2024*'), nombre:'Propietario', rol:'PROPIETARIO', activo:true, permisos:getPropPerms() },
      { id:'u3', username:'empleado', password:btoa('Emp2024*'), nombre:'Empleado', rol:'EMPLEADO', activo:true, permisos:getEmpPerms() }
    ]);
  }
  if (!DB.get('config')) {
    DB.set('config', {
      nombre:'Página Web Otanche',
      direccion:'Otanche, Boyacá, Colombia',
      telefono:'',correo:'',web:'',facebook:'',instagram:'',
      descripcion:'Sistema de Control de Ventas',
      metodoPagos: {
        efectivo:{label:'Efectivo',recargo:0,sumaCaja:true},
        nequi:{label:'Nequi',recargo:0,sumaCaja:true},
        daviplata:{label:'Daviplata',recargo:0,sumaCaja:true},
        bold:{label:'Bold',recargo:0,sumaCaja:true},
        tarjeta:{label:'Tarjeta',recargo:5,sumaCaja:false},
        sistecredito:{label:'Sistecrédito',recargo:5,sumaCaja:false},
        addi:{label:'Addi',recargo:10,sumaCaja:false}
      }
    });
  }
  if (!DB.get('productos')) DB.set('productos',[]);
  if (!DB.get('ventas')) DB.set('ventas',[]);
  if (!DB.get('apartados')) DB.set('apartados',[]);
  if (!DB.get('caja')) DB.set('caja',{abierta:false,base:0,movimientos:[],historial:[]});
  if (!DB.get('cupones')) DB.set('cupones',[]);
  if (!DB.get('egresos')) DB.set('egresos',[]);
}

function getAllPerms() {
  return {dashboard:true,ventas:true,apartados:true,caja:true,productos:true,ofertas:true,
    cupones:true,movimientos:true,reportes:true,usuarios:true,configuracion:true,
    editarVentas:true,eliminarVentas:true,verBalance:true,imprimirReportes:true};
}
function getPropPerms() {
  return {dashboard:true,ventas:true,apartados:true,caja:true,productos:true,ofertas:true,
    cupones:false,movimientos:true,reportes:true,usuarios:false,configuracion:false,
    editarVentas:false,eliminarVentas:false,verBalance:true,imprimirReportes:true};
}
function getEmpPerms() {
  return {dashboard:true,ventas:true,apartados:false,caja:false,productos:false,ofertas:true,
    cupones:false,movimientos:false,reportes:false,usuarios:false,configuracion:false,
    editarVentas:false,eliminarVentas:false,verBalance:false,imprimirReportes:false};
}

// ===== AUTH =====
let currentUser = null;

function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');
  if (!u||!p){err.textContent='Completa todos los campos.';err.classList.remove('hidden');return;}
  const users = DB.get('users',[]);
  const found = users.find(x=>x.username===u && x.password===btoa(p) && x.activo);
  if (!found){err.textContent='Usuario o contraseña incorrectos.';err.classList.remove('hidden');return;}
  currentUser = found;
  DB.set('session',{userId:found.id,time:Date.now()});
  err.classList.add('hidden');
  launchApp();
}

function doLogout() {
  currentUser=null; DB.del('session');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginUser').value='';
  document.getElementById('loginPass').value='';
}

function restoreSession() {
  const s = DB.get('session');
  if (!s) return false;
  if (Date.now()-s.time > 8*60*60*1000){DB.del('session');return false;}
  const users = DB.get('users',[]);
  const found = users.find(x=>x.id===s.userId && x.activo);
  if (!found) return false;
  currentUser = found;
  return true;
}

function hasPerm(perm) {
  if (!currentUser) return false;
  const perms = currentUser.permisos||{};
  return !!perms[perm];
}

function launchApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  updateSidebarUser();
  applyNavPerms();
  applyBusinessBranding();
  showModule('dashboard');
  startClock();
}

function updateSidebarUser() {
  if (!currentUser) return;
  document.getElementById('userNameDisplay').textContent = currentUser.nombre||currentUser.username;
  const roles={ADMIN:'Administrador',PROPIETARIO:'Propietario',EMPLEADO:'Empleado'};
  document.getElementById('userRoleDisplay').textContent = roles[currentUser.rol]||currentUser.rol;
  document.getElementById('userAvatar').textContent = (currentUser.nombre||currentUser.username)[0].toUpperCase();
}

function applyNavPerms() {
  const navMap = {
    'ventas':'ventas','apartados':'apartados','caja':'caja','productos':'productos',
    'ofertas':'ofertas','cupones':'cupones','movimientos':'movimientos',
    'reportes':'reportes','usuarios':'usuarios','configuracion':'configuracion'
  };
  document.querySelectorAll('.nav-item[data-module]').forEach(el=>{
    const mod = el.dataset.module;
    if (mod==='dashboard'){el.style.display='';return;}
    const perm = navMap[mod]||mod;
    el.style.display = hasPerm(perm)?'':'none';
  });
}

function applyBusinessBranding() {
  const cfg = DB.get('config',{});
  const name = cfg.nombre||'Otanche POS';
  const logo = cfg.logo||'';

  // Nombre en login y sidebar
  const el1=document.getElementById('loginBusinessName');
  const el2=document.getElementById('sidebarBusinessName');
  if(el1)el1.textContent=name;
  if(el2)el2.textContent=name;
  document.title = name+' — POS';

  // Logo en login
  const loginLogo=document.getElementById('loginLogo');
  if(loginLogo){
    loginLogo.innerHTML=logo
      ? '<img src="'+logo+'" style="width:100%;height:100%;object-fit:contain;border-radius:8px">'
      : '<svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="url(#lg)"/><path d="M10 28V18l10-8 10 8v10H24v-6h-8v6z" fill="white" opacity=".9"/><defs><linearGradient id="lg" x1="0" y1="0" x2="40" y2="40"><stop stop-color="#10b981"/><stop offset="1" stop-color="#0ea5e9"/></linearGradient></defs></svg>';
  }

  // Logo en sidebar
  const sidebarLogoEl=document.querySelector('.sidebar-logo .logo-icon');
  if(sidebarLogoEl){
    sidebarLogoEl.innerHTML=logo
      ? '<img src="'+logo+'" style="width:100%;height:100%;object-fit:contain;border-radius:6px">'
      : '<svg viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="url(#lg2)"/><path d="M10 28V18l10-8 10 8v10H24v-6h-8v6z" fill="white" opacity=".9"/><defs><linearGradient id="lg2" x1="0" y1="0" x2="40" y2="40"><stop stop-color="#10b981"/><stop offset="1" stop-color="#0ea5e9"/></linearGradient></defs></svg>';
  }
}

// ===== MODULE ROUTING =====
const moduleRenderers = {};
function registerModule(name,fn){moduleRenderers[name]=fn;}

function showModule(name) {
  if (!hasPerm(name) && name!=='dashboard'){
    toast('Sin permiso para acceder a este módulo.','error'); return;
  }
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-item[data-module="${name}"]`);
  if(activeNav)activeNav.classList.add('active');
  const container = document.getElementById('moduleContainer');
  container.innerHTML='';
  if (moduleRenderers[name]){
    moduleRenderers[name](container);
  } else {
    container.innerHTML=`<div class="empty-state"><p>Módulo en construcción</p></div>`;
  }
}

// ===== CLOCK =====
function startClock(){
  const el=document.getElementById('dashClock');
  function tick(){
    const now=new Date();
    const t=now.toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    if(el)el.textContent=t;
  }
  tick(); setInterval(tick,1000);
}

// ===== PASSWORD TOGGLE =====
function togglePassword(inputId,btn){
  const inp=document.getElementById(inputId);
  if(inp.type==='password'){inp.type='text';btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';}
  else{inp.type='password';btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';}
}

// ===== SIDEBAR TOGGLE =====
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ===== THEME =====
function toggleTheme(){
  const html=document.documentElement;
  const isDark=html.getAttribute('data-theme')==='dark';
  html.setAttribute('data-theme',isDark?'light':'dark');
  const icon=document.getElementById('themeIcon');
  const label=document.querySelector('.theme-toggle span');
  if(isDark){
    if(label)label.textContent='Modo Oscuro';
    if(icon)icon.innerHTML='<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none" stroke="currentColor" stroke-width="2"/>';
  } else {
    if(label)label.textContent='Modo Claro';
    if(icon)icon.innerHTML='<circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" stroke-width="2"/>';
  }
  DB.set('theme',isDark?'light':'dark');
}

// ===== MODAL =====
function openModal(title,bodyHtml,opts={}){
  document.getElementById('modalTitle').textContent=title;
  document.getElementById('modalBody').innerHTML=bodyHtml;
  document.getElementById('modalBox').className='modal-box'+(opts.lg?' modal-lg':'')+(opts.xl?' modal-xl':'');
  document.getElementById('modalOverlay').classList.remove('hidden');
}
function closeModal(e){if(e&&e.target!==document.getElementById('modalOverlay'))return;closeModalDirect();}
function closeModalDirect(){document.getElementById('modalOverlay').classList.add('hidden');document.getElementById('modalBody').innerHTML='';}

// ===== FORMAT =====
function fmt(n){return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0,maximumFractionDigits:0}).format(n||0);}
function fmtDate(d){return new Date(d).toLocaleDateString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric'});}
function fmtDateTime(d){return new Date(d).toLocaleString('es-CO',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}

// ===== INIT =====
document.addEventListener('DOMContentLoaded',()=>{
  initSystem();
  const savedTheme=DB.get('theme','dark');
  document.documentElement.setAttribute('data-theme',savedTheme);
  const tLabel=document.querySelector('.theme-toggle span');
  if(savedTheme==='light'&&tLabel)tLabel.textContent='Modo Oscuro';
  if(restoreSession()){launchApp();}
  document.getElementById('loginPass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
  document.getElementById('loginUser').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('loginPass').focus();});
});
