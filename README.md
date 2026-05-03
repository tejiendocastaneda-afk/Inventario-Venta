# 🌿 Tejidos Castañeda — Sistema de gestión

Sistema POS completo para gestión de ventas, inventario, apartados y contabilidad.

---

## ⚡ ARRANQUE RÁPIDO

### macOS / Linux
```bash
bash iniciar.sh
```

### Windows
```
Doble clic en iniciar.bat
```

### Manual (cualquier sistema)
```bash
cd backend
npm install
node server.js
```

Luego abre: **http://localhost:3000**

---

## 🔑 USUARIO POR DEFECTO

---

## 📁 ESTRUCTURA DEL PROYECTO

```
tejidos-castaneda/
├── backend/
│   ├── config/
│   │   └── database.js          ← SQLite, se crea automáticamente
│   ├── middleware/
│   │   └── auth.js              ← JWT + control de roles
│   ├── routes/
│   │   ├── auth.routes.js       ← Login, usuarios
│   │   ├── ventas.routes.js     ← POS, ventas
│   │   ├── inventario.routes.js ← Productos, stock
│   │   ├── apartados.routes.js  ← Apartados, abonos
│   │   ├── otros.routes.js      ← Clientes, proveedores, contabilidad
│   │   └── excel.routes.js      ← Exportación a Excel
│   ├── server.js                ← Entrada principal
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── main.css             ← Estilos globales verde esmeralda
│   ├── js/
│   │   ├── api.js               ← Cliente API + utilidades globales
│   │   ├── pos.js               ← Módulo POS y carrito
│   │   ├── apartados.js         ← Módulo apartados
│   │   ├── inventario.js        ← Módulo inventario
│   │   └── app.js               ← Navegación y demás módulos
│   ├── index.html               ← SPA principal
│   └── login.html               ← Pantalla de login
├── data/
│   └── tejidos.db               ← Base de datos (se crea automáticamente)
├── iniciar.sh                   ← Arranque macOS/Linux
└── iniciar.bat                  ← Arranque Windows
```

---

## 🔗 RUTAS DE LA API

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Usuario actual |
| GET | /api/auth/usuarios | Listar usuarios (admin) |
| POST | /api/auth/usuarios | Crear usuario (admin) |
| PUT | /api/auth/usuarios/:id | Editar usuario (admin) |

### Inventario
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/inventario | Listar productos |
| GET | /api/inventario/resumen | Stats de inventario |
| GET | /api/inventario/alertas | Stock bajo/agotado |
| GET | /api/inventario/movimientos | Historial de movimientos |
| POST | /api/inventario | Crear producto |
| PUT | /api/inventario/:id | Editar producto |
| POST | /api/inventario/entrada | Entrada de stock |

### Ventas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/ventas | Listar ventas |
| GET | /api/ventas/:id | Detalle con items |
| POST | /api/ventas | Crear venta (transacción atómica) |
| GET | /api/ventas/meta/metodos | Métodos de pago y recargos |

### Apartados
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/apartados | Listar apartados |
| GET | /api/apartados/alertas | Vencidos |
| POST | /api/apartados | Crear apartado |
| POST | /api/apartados/:id/abono | Registrar abono |
| DELETE | /api/apartados/:id | Cancelar |

### Exportar a Excel
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/excel/ventas | Descargar ventas.xlsx |
| GET | /api/excel/apartados | Descargar apartados.xlsx |
| GET | /api/excel/productos | Descargar productos.xlsx |

---

## 💳 MÉTODOS DE PAGO Y RECARGOS

| Método | Recargo |
|--------|---------|
| Efectivo | 0% |
| Daviplata | 0% |
| Nequi | 0% |
| Bold | 0% |
| Tarjeta | +5% |
| Sistecrédito | +5% |
| Addi | +10% |

---

## 📋 REGLAS DE APARTADOS

- Abono mínimo: **$ 20.000 COP**
- Plazo máximo: **30 días**
- Al vencer: alerta automática al iniciar sesión
- Al cancelar: el stock se restaura automáticamente

---

## 👥 ROLES Y PERMISOS

| Módulo | Admin | Propietario | Empleado |
|--------|:-----:|:-----------:|:--------:|
| POS / Ventas | ✅ | ✅ | ✅ |
| Inventario | ✅ | ✅ | ✅ |
| Clientes | ✅ | ✅ | ✅ |
| Apartados | ✅ | ✅ | ✅ |
| Proveedores | ✅ | ✅ | ❌ |
| Contabilidad | ✅ | ✅ | ❌ |
| Usuarios | ✅ | ❌ | ❌ |
| Excel export | ✅ | ✅ | ❌ |

---

## 🛠️ REQUISITOS

- **Node.js** 18 o superior
- **npm** (incluido con Node.js)
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Sin base de datos externa — usa SQLite embebido

---

## 🌐 DESPLIEGUE EN SERVIDOR

```bash
# En el servidor
cd backend
npm install --production
NODE_ENV=production JWT_SECRET=tu_secreto_seguro node server.js
```

Para ejecutar en segundo plano con PM2:
```bash
npm install -g pm2
pm2 start server.js --name tejidos
pm2 save
pm2 startup
```
