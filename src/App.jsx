import Obligo from './Obligo'
import Landing, { isLandingHost } from './Landing'

// obligo.lasersolutions.com.uy muestra la landing del producto.
// Los estudios entran cada uno por su subdominio (obligo-vcestudio / obligo-laser),
// donde se sigue mostrando la app.
function App() {
  return isLandingHost() ? <Landing /> : <Obligo />
}

export default App
