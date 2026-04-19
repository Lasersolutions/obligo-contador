#!/bin/bash

# 🚀 GESTCONT UY - QUICKSTART

echo "╔════════════════════════════════════════╗"
echo "║   GestCont UY - Instalación Rápida    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado."
    echo "📥 Descarga desde: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION detectado"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

echo ""
echo "✅ Instalación completada"
echo ""
echo "🚀 Ejecuta: npm run dev"
echo "🌐 Abre:    http://localhost:3000"
echo ""
echo "📚 Para más info, lee README.md"
