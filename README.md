# GestCont UY 📋

Gestor integral de clientes y obligaciones tributarias para profesionales contables uruguayos.

**Período actual:** 04/2026

---

## 🚀 Instalación rápida

### Requisitos previos
- Node.js 16+ ([descargar](https://nodejs.org/))
- npm (incluido con Node.js)
- Git (opcional, para clonar)

### Pasos

1. **Clonar o descargar el proyecto**
```bash
git clone <tu-repositorio>
cd gestcont-uy
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
```
Abre http://localhost:3000 automáticamente.

---

## 📦 Compilar para producción

```bash
npm run build
```
Genera la carpeta `dist/` lista para deploy.

---

## 🌐 Deployment

### Opción 1: Vercel (recomendado ⭐)
```bash
npm install -g vercel
vercel
# Sigue las instrucciones en pantalla
```

### Opción 2: Netlify
1. Ejecuta `npm run build`
2. Ve a [netlify.com](https://netlify.com)
3. Arrastra la carpeta `dist/` a Netlify Drop
4. ¡Listo! Tu app está online

### Opción 3: GitHub Pages
```bash
npm install --save-dev gh-pages
# Edita package.json y agrega "homepage": "https://tuusuario.github.io/gestcont-uy"
npm run build
npm run deploy
```

---

## 📁 Estructura del proyecto

```
gestcont-uy/
├── src/
│   ├── GestContUY.jsx      ← Componente principal
│   ├── App.jsx             ← Wrapper
│   ├── main.jsx            ← Entrada
│   └── index.css           ← Estilos globales
├── index.html              ← HTML
├── package.json            ← Dependencias
├── vite.config.js          ← Config Vite
└── README.md               ← Este archivo
```

---

## 🎯 Funcionalidades MVP

✅ Dashboard con clientes y obligaciones  
✅ Gestión de clientes por régimen tributario  
✅ Cálculo automático de obligaciones tributarias  
✅ Edición de datos del cliente  
✅ Control de pagos y notificaciones  
✅ Integración WhatsApp para recordatorios  
✅ Formularios de estudio y honorarios  
✅ Navegación lateral intuitiva  

---

## 🔧 Personalización

### Cambiar período
En `src/GestContUY.jsx`, línea 12:
```javascript
const PERIOD = "04/2026";  // Cambiar aquí
```

### Agregar nuevos clientes
En `src/GestContUY.jsx`, función `CLIENTS_INIT`, agrega con la función `mk()`:
```javascript
mk(id, "Nombre", "entityType", "nature", "regime", { opts })
```

### Modificar paleta de colores
En `src/GestContUY.jsx`, objeto `C`:
```javascript
const C = {
  navy:"#021942", blue:"#2948D9", light:"#EFF0F4", accent:"#8ECBDE",
  // ... etc
};
```

---

## 💾 Persistencia de datos

Actualmente los datos se guardan en **memoria**. Para persistencia permanente:

### Usar localStorage (simple)
```javascript
// En GestContUY.jsx, agrega esto:
import { useEffect } from 'react';

const [clients, setClients] = useState(() => {
  const saved = localStorage.getItem('gestcont_clients');
  return saved ? JSON.parse(saved) : CLIENTS_INIT;
});

useEffect(() => {
  localStorage.setItem('gestcont_clients', JSON.stringify(clients));
}, [clients]);
```

### Usar base de datos (avanzado)
- Firebase/Supabase para sincronización en tiempo real
- Node.js + Express + MongoDB/PostgreSQL

---

## 🐛 Troubleshooting

**Error: "React is not defined"**
- ✅ Ya está arreglado, React se importa automáticamente

**El navegador no abre automáticamente**
- Abre manualmente http://localhost:3000

**Cambios no se reflejan al guardar**
- Verifica que `npm run dev` esté ejecutándose
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)

**Error de puerto ocupado**
- Puerto 3000 en uso. Edita `vite.config.js` y cambia el puerto.

---

## 📝 Notas para Laser Solutions

- **Tipografía**: Poppins (fallback Montserrat)
- **Paleta**: Navy (#021942), Blue (#2948D9), Accent (#8ECBDE)
- **Clientes de ejemplo**: Incluidos en CLIENTS_INIT
- **Regímenes tributarios**: Todos los regímenes uruguayos cubiertos
- **Motor de reglas**: Genera automáticamente obligaciones según régimen

---

## 🤝 Próximos pasos

- [ ] Agregar persistencia en base de datos
- [ ] Exportar a Excel/PDF
- [ ] Notificaciones por email
- [ ] Sincronización con WhatsApp API
- [ ] Modulo de tareas avanzado
- [ ] Centro de alertas integrado
- [ ] Configuración de estudio

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa el navegador → F12 → Console
2. Verifica que tengas Node.js 16+: `node -v`
3. Limpia node_modules: `rm -rf node_modules && npm install`

---

**Hecho con ❤️ para Laser Solutions**  
Montevideo, Uruguay 🇺🇾
