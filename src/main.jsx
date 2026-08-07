import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Cuando se publica una versión nueva, el service worker la instala pero la
// pestaña abierta sigue con la vieja hasta que alguien recarga a mano. Eso hizo
// que un arreglo ya publicado siguiera fallando del lado del usuario. Ahora, en
// cuanto el service worker nuevo toma el control, la página se recarga sola una
// única vez (el guard evita el bucle si el navegador vuelve a avisar).
if ('serviceWorker' in navigator) {
  let recargando = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargando) return
    recargando = true
    window.location.reload()
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
