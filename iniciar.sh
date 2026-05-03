#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Tejidos Castañeda — Script de instalación y arranque
# ═══════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${GREEN}🌿 Tejidos Castañeda — Sistema de gestión${NC}"
echo "═══════════════════════════════════════════"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js no está instalado."
  echo "   Descárgalo en: https://nodejs.org (versión 18 o superior)"
  exit 1
fi

NODE_VER=$(node -v)
echo -e "✅ Node.js detectado: ${NODE_VER}"

# Ir al directorio del backend
cd "$(dirname "$0")/backend"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
  echo ""
  echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
  npm install
  echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
  echo -e "✅ Dependencias ya instaladas"
fi

# Crear carpeta de datos si no existe
mkdir -p ../data/backups

echo ""
echo -e "${BLUE}🚀 Iniciando el servidor...${NC}"
echo ""
echo "   URL:      http://localhost:3000"
echo "   Usuario:  admin@tejidos.com"
echo "   Clave:    admin1234"
echo ""
echo -e "${YELLOW}   Presiona Ctrl+C para detener el servidor${NC}"
echo ""

node server.js
