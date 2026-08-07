# OBLIGO — Inventario para rediseño de interfaz

**Fecha de auditoría:** 30 de julio de 2026
**Proyecto auditado:** `C:\Users\Gasto\OneDrive\Escritorio\07. Sistemas\obligo`
**Repo:** `Lasersolutions/obligo-contador` (rama `main`, deploy en Vercel)
**Stack:** React 18 + Vite 5, sin backend. PWA (`vite-plugin-pwa`). Datos en `localStorage`.

---

## Resumen en una página

Obligo es **un solo archivo**: `src/Obligo.jsx`, 2.855 líneas (816 KB, de las cuales ~558 KB son 6 líneas de logos en base64). Ahí adentro está todo: la paleta de colores, los datos de los 49 clientes precargados, el motor de reglas fiscales, los cálculos de sueldos, el generador de recibos en PDF, y las 8 pantallas con sus 3 modales.

No hay hoja de estilos. **No hay Tailwind, ni CSS modules, ni styled-components.** Hay 72 líneas de CSS global (`src/index.css`) para reset y scrollbar, y después **793 bloques de estilo escritos a mano dentro del JSX** (`style={{...}}`).

Esto tiene una consecuencia directa para el rediseño, y conviene decirla al principio:

> **No existe ningún porcentaje del rediseño que se pueda hacer "tocando solo estilos", porque no hay archivo de estilos que tocar.** Todo cambio visual, hasta el más chico, se hace editando JSX.

Eso no significa que haya que reescribir todo. Significa que **el primer trabajo del rediseño no es diseñar: es extraer** los valores visuales que hoy están desparramados y meterlos en un solo lugar. Una vez hecho eso (que es trabajo mecánico y de bajo riesgo), el 75% del rediseño pasa a ser barato.

También hay una noticia buena, y es importante: **los cálculos ya están separados de la pantalla.** El motor de obligaciones (`getObs`), los cálculos de anticipos (`calcAnticipos`), la liquidación de sueldos (`calcRecibo`), el boleto 2908 (`calc2908`) son funciones puras a nivel de archivo, que reciben datos y devuelven números. No saben nada de colores ni de layout. Se pueden rediseñar todas las pantallas sin tocar una sola línea de esa lógica.

Lo que **no** está separado es el **estado**: las pantallas manejan sus propios formularios, filtros y modales adentro, mezclados con el marcado. Ahí es donde está el trabajo de verdad.

---

## 1. Inventario de pantallas

### 1.0. Aclaración sobre "rutas"

**La app no tiene rutas.** No usa React Router ni ningún sistema de URLs. Toda la navegación es una variable de estado llamada `view` dentro del componente raíz (`Obligo.jsx:2736`), y un `if` que decide qué pantalla dibujar (`Obligo.jsx:2843-2851`).

Consecuencias que el rediseño tiene que tener en cuenta:

- **No se puede compartir un link a una pantalla.** No existe "mandale este link al cliente X".
- **El botón Atrás del navegador no funciona** dentro de la app: te saca de la app.
- **Recargar la página siempre te devuelve al login** y después al Panel Principal.
- El único parámetro que sí lee la URL es el **subdominio**, que decide qué estudio puede entrar (`hostStudio()`, `Obligo.jsx:40`).

Si el rediseño quiere URLs por pantalla (recomendable), eso es trabajo adicional que no está contemplado en los porcentajes de la sección 3.

### 1.1. Las 8 pantallas

| # | `view` | Componente | Línea | Qué hace |
|---|--------|-----------|-------|----------|
| 0 | *(sin sesión)* | `LoginScreen` | 538 | Puerta de entrada |
| 1 | `dashboard` | `Dashboard` | 759 | Panel principal |
| 2 | `clients` | `ClientList` | 1012 | Listado de clientes |
| 3 | `client` | `ClientDetail` | 1810 | Ficha del cliente (6 solapas) |
| 4 | `tareas` | `TasksModule` | 891 | Tareas de todos los clientes |
| 5 | `alertas` | `AlertsCenter` | 972 | Centro de alertas |
| 6 | `calendario` | `CalendarioView` | 2449 | Calendario mensual |
| 7 | `config` | `ConfigPanel` | 2564 | Configuración del estudio |

Más el **armazón permanente**: barra lateral (`Sidebar`, 580) + barra superior (dentro de `Obligo()`, 2820-2842).

---

### PANTALLA 0 — Login

**Componente:** `LoginScreen` (`Obligo.jsx:538-577`)

**Tiene dos versiones visuales completamente distintas**, elegidas por el subdominio o por `#laser` en la URL:

| | Versión Valeria Calvette | Versión Laser Solutions |
|---|---|---|
| Fondo | Degradé navy `#08152B → #14294F → #1E3A6B` | Degradé `#021029 → #021942 → #0A2B66` |
| Tarjeta | 366px, borde superior dorado 3px | 360px, sin borde superior |
| Logo | `LOGO_VC` (SVG, 132×132) | `LOGO_LASER_FULL` (PNG, 190px ancho) |
| Subtítulo | — | "GESTIÓN CONTABLE" con letter-spacing 2 |
| Botón | Degradé navy, texto dorado `#E9C877` | Degradé azul `#2948D9 → #1E37A8`, texto blanco |
| Pie | "Obligo · Gestión contable · Montevideo" | "Laser Solutions · Montevideo, Uruguay" |

**Datos que muestra:** nada. Solo dos campos.

**Acciones:**
- Escribir usuario y contraseña
- Ver/Ocultar contraseña (botón de texto, no ícono)
- Enter en cualquiera de los dos campos dispara el login
- Botón "Ingresar"

**Estados:** un error de texto rojo 12px, `"Usuario o contraseña incorrectos."`. Sin loading (la validación es sincrónica contra un array).

**Deuda a mirar en el rediseño:** el placeholder de la versión VC dice literalmente `"admin · secretaria · auxiliar"`, o sea que expone los nombres de usuario válidos a cualquiera que abra la pantalla.

---

### PANTALLA 1 — Panel Principal (Dashboard)

**Componente:** `Dashboard` (`Obligo.jsx:759-888`)

**Datos que muestra, en orden de arriba a abajo:**

1. **Encabezado** — título "Panel Principal", fecha de hoy, navegador de período (‹ 07/2026 ›)
2. **Aviso naranja** (condicional) — tareas pendientes del mes anterior, con los primeros 4 nombres de clientes
3. **Tarjeta de alertas** (condicional) — certificados DGI que vencen en menos de 60 días, ordenados por urgencia, clickeables
4. **5 tarjetas de números** (`StatCard`): Clientes / Sin configurar / Con empleados / Tareas vencidas / Próx. 7 días
5. **Bloque de facturación** (solo admin) — gráfico de torta + 4 contadores: Fact. emitidas, Fact. enviadas, Cobradas, Pend. de cobro
6. **Columna izquierda:** Vencimientos DGI del período (máximo 12 ítems, con scroll a 220px)
7. **Columna derecha arriba:** Tareas vencidas, agrupadas por cliente
8. **Columna derecha abajo:** Clientes sin configurar (scroll a 110px)
9. **Panel de Proveedores del estudio** (solo admin, componente aparte)
10. **Grilla de todos los clientes** — tarjetas de 155px mínimo, con colores celestes alternados

**Acciones:**
- Cambiar de período
- Click en tarjeta "Clientes" o "Sin configurar" → va al listado
- Click en cualquier cliente (grilla, alertas, vencimientos, sin configurar) → abre la ficha
- Marcar una tarea vencida como hecha (checkbox, sin salir del panel)
- Abrir el sitio de DGI/BPS en pestaña nueva (botón ↗)
- Todo el módulo de Proveedores (ver abajo)

**⚠️ Error funcional detectado:** el contador "Próx. 7 días" (línea 764) filtra tareas con vencimiento `<= "2026-04-23"` — una fecha fija que quedó escrita en el código. Hoy es 30/07/2026, así que **ese número siempre muestra 0**. No es un problema de diseño, pero el rediseño lo va a tocar y conviene arreglarlo ahí.

---

### PANTALLA 1b — Proveedores del estudio (panel embebido)

**Componente:** `ProveedoresPanel` (`Obligo.jsx:679-756`) — se dibuja dentro del Dashboard, **solo si el rol es admin**.

**Datos:** 3 cajas de totales (Pagado verde / Pendiente amarillo / Total gris) + lista de proveedores del período (o recurrentes).

**Acciones:** agregar proveedor (formulario que se despliega inline), marcar pagado, eliminar, importar Excel.

**⚠️ Función incompleta:** el botón "Importar Excel" abre el selector de archivos, lee el archivo… y muestra un `alert()` que dice *"próximamente se procesarán las columnas"*. No hace nada.

**⚠️ Dato importante para el rediseño:** los proveedores **no se guardan**. `proveedores` es estado local del componente raíz (`Obligo.jsx:2745`) y nunca se escribe en `localStorage`. Todo lo que cargues se pierde al recargar.

---

### PANTALLA 2 — Clientes

**Componente:** `ClientList` (`Obligo.jsx:1012-1057`)

**Datos:** tabla de clientes con 5 columnas — Cliente (avatar + nombre + giro) / Impuestos (badges) / Tipo / Naturaleza / Tareas (pendientes o vencidas).

**Filtros, en tres niveles superpuestos:**
1. Buscador de texto (nombre, giro, RUT o Nº BPS)
2. Select de estado (Activos / Inactivos / Todos)
3. Select de impuesto — 16 opciones, cada una con su contador entre paréntesis
4. Fila de 8 chips de acceso rápido (IRAE, IRPF II, IVA 22%, IVA Mínimo, IVA SP, Patrimonio, Con empleados, Sin configurar), cada uno con contador y color propio. Los chips con 0 resultados aparecen deshabilitados al 45% de opacidad.
5. Botón "Limpiar filtro ✕" (aparece solo si hay filtro activo)
6. Línea de texto: "Mostrando **N** de M clientes · filtro: X"

**Acciones:** buscar, filtrar, abrir ficha (click en la fila), abrir modal de nuevo cliente.

**Observación de diseño:** hay **dos controles que hacen lo mismo** (el select de impuestos y los chips rápidos), sincronizados por la misma variable `tf`. Es redundancia deliberada, pero ocupa dos filas completas de la pantalla.

**Responsive:** la tabla tiene `minWidth: 520px` y scroll horizontal. En celular hay que arrastrar de costado.

---

### PANTALLA 3 — Ficha del cliente

**Componente:** `ClientDetail` (`Obligo.jsx:1810-2446`) — **638 líneas, el componente más grande de la app.** Maneja 20 variables de estado propias.

#### Encabezado (fijo, sobre fondo degradé navy)

Botón volver ← · Avatar · **Nombre editable en línea** (input sin bordes, se subraya al enfocar) · etiqueta especial · badges de impuestos · tipo de entidad · cantidad de empleados · RUT · Nº BPS · Grupo MTSS · botón 📄 Reporte (solo Laser) · botón WhatsApp · 3 botones con logos de DGI/BPS/BSE.

#### Las 6 solapas

| Solapa | Condición | Contenido |
|--------|-----------|-----------|
| **Resumen** | siempre | Avisos (sin configurar / certificados por vencer) · 4 tarjetas de números · lista de obligaciones del mes con doble checkbox Pagado/Notificado · notas internas |
| **Datos** | siempre | 6 bloques de formulario: Datos generales (16 campos) · Configuración fiscal (7 campos) · Anticipos Boleto 2908 (condicional: IRAE / IP / ICOSA) · Certificados DGI · Asociado a Gub.uy · Accesos y credenciales (7 pares usuario/contraseña) · bloque de empleados |
| **Sueldos** | solo si `hasEmployees` | Módulo completo de liquidación (ver abajo) |
| **Tributario** | siempre | Cálculo del mes · recordatorio de DDJJ anuales · resumen de régimen · desglose del boleto 2908 · certificados de crédito DGI · pagar 2908 con certificado · obligaciones mensuales/anuales/estacionales |
| **Operativo / Trámites** | siempre | Boletos del mes (BPS y DGI) · Nóminas · Tareas · Trámites · Incidencias — **5 secciones apiladas en un scroll muy largo** |
| **Comercial** | siempre | Facturación del período (3 checkboxes) · honorario mensual · 4 botones de mensajes de WhatsApp predefinidos |

**Acciones (parcial, hay muchas):** editar cualquier campo del cliente en el acto (todo guarda al tipear, sin botón Guardar) · agregar/editar/eliminar empleados · agregar/quitar certificados DGI · aplicar un certificado a un boleto · marcar obligaciones pagadas/notificadas · agregar tareas, trámites e incidencias · resolver incidencias · cambiar estado de trámite (3 botones) · marcar nóminas · enviar importes por WhatsApp · generar el reporte PDF.

**⚠️ Problema de datos importante:** los checkboxes de **Pagado / Notificado** de las obligaciones viven en `obState` (`Obligo.jsx:1815`), que es estado local del componente. **No se guardan en ningún lado.** Si el usuario marca "pagado" y navega a otra pantalla y vuelve, se perdió. Este es probablemente el bug de uso más molesto de la app y el rediseño lo va a exponer.

**⚠️ Duplicación:** los **Certificados DGI se editan en dos lugares distintos**, con dos interfaces distintas: en la solapa *Datos* (bloque desplegado, tarjetas verdes/grises con 5 campos cada una) y en la solapa *Tributario* (lista compacta con formulario de alta de 3 campos). Son los mismos datos.

**⚠️ Código muerto:** `importFactRef` y `handleImportFact` (líneas 1823 y 1872) están declarados pero **nunca se dibujan** en ningún lado.

---

### PANTALLA 3b — Módulo Sueldos

**Componente:** `SueldosModule` (`Obligo.jsx:1469-1557`)

**Encabezado navy** con título del período en largo ("Julio 2026"), botón "📈 Aumento por convenio" y botón "🖨 Imprimir todos los recibos".

**Por cada empleado, una tarjeta con:**
- Avatar, nombre, cargo, CI, básico o jornal, % de antigüedad, y el último ajuste aplicado (con ↑ si ya rige o ⏳ si es futuro)
- Botón "Ficha" que despliega 8 campos de configuración del empleado
- Botón "🧾 Recibo PDF" (deshabilitado si el gravado es 0)
- Fila de entradas del mes: faltas o jornales, adelantos, cuota de préstamo, número de cuota, IRPF, nocturnidad
- **Grilla de 6 resultados calculados:** Gravado BPS, Jubilatorio 15%, FRL 0,1%, Seg. Enf. 3%, SNIS X%, Líquido
- Línea de detalle con antigüedad / nocturnidad / descuento por faltas

**Al pie:** 3 totales del mes (gravado, aportes, líquidos).

**Aviso condicional** amarillo si hay un aumento cargado con vigencia futura.

**Estado vacío:** *"Este cliente no tiene empleados cargados. Agregalos desde la pestaña Datos."*

---

### PANTALLA 4 — Tareas

**Componente:** `TasksModule` (`Obligo.jsx:891-969`)

Reúne las tareas de **todos** los clientes. Si el usuario no es admin, solo ve las que le fueron delegadas o las sin delegar.

**Filtros:** buscador de texto + 3 selects (Estado / Frecuencia / Categoría).
**Formulario de alta inline:** cliente, descripción, fecha, frecuencia, categoría, delegar a.
**Lista:** checkbox · descripción (tachada si está hecha) · cliente y frecuencia · badge de delegación · fecha (roja si venció) · badge de categoría.

**Fondos por estado de fila:** gris `#F5F5F5` si está hecha, rojo claro `#FEF2F2` si está vencida, blanco si está al día.

**Estado vacío:** *"Sin tareas que coincidan"*.

**⚠️ El select de delegación usa `USERS`** — el array de usuarios de Valeria Calvette — **siempre, incluso cuando el estudio activo es Laser Solutions** (línea 931). Un usuario de Laser ve "Valeria Calvette / Secretaria / Auxiliar Contable" en su lista de delegación.

---

### PANTALLA 5 — Centro de Alertas

**Componente:** `AlertsCenter` (`Obligo.jsx:972-1009`)

Tres cajas idénticas, generadas por un sub-componente `AlertBox` definido adentro del render:

1. **Certificados por vencer** (menos de 60 días) — punto naranja
2. **Tareas vencidas** — punto rojo
3. **Próximas 9 días** — punto verde

Cada ítem muestra nombre del cliente + descripción. **No es clickeable**: ves la alerta pero no podés ir al cliente desde acá. Es la pantalla más pobre de la app.

**Estados vacíos:** tres, uno por caja, todos texto gris de 12px.

**⚠️ Inconsistencia de ventanas de tiempo:** el Dashboard dice "Próx. 7 días" (pero está roto), esta pantalla usa 9 días, y la campana de avisos usa 7 días. Tres ventanas distintas para el mismo concepto.

---

### PANTALLA 6 — Calendario

**Componente:** `CalendarioView` (`Obligo.jsx:2449-2561`)

**Grilla mensual** de lunes a domingo. Cada día muestra: el número, hasta 3 badges de organismo (DGI/BPS/BSE/Otro) con el conteo si hay más de uno, y un contador de pendientes abajo ("3 pend." en naranja o "✓" en verde).

**Bordes:** azul 2px si está seleccionado, azul translúcido si es hoy, gris si tiene eventos, gris claro si no.

**Panel lateral** (310px, aparece al hacer click en un día): fecha, cantidad de obligaciones, y las obligaciones agrupadas por cliente con badge de organismo y estado.

**Leyenda** al pie con los 4 organismos y sus días de vencimiento.

**⚠️ Tiene su propio navegador de período**, independiente del global (`calPeriod`, línea 2451). Si cambiás el mes acá, el resto de la app sigue en el mes anterior. Son dos "períodos" distintos conviviendo.

---

### PANTALLA 7 — Configuración

**Componente:** `ConfigPanel` (`Obligo.jsx:2564-2604`)

5 bloques de formulario (`FormSection`), todos a 2 columnas:

1. **Datos del estudio** — nombre, código, RUT, email, WhatsApp, **contraseña admin y contraseña secretaria en campos de texto plano visible**
2. **Vencimientos mensuales** — día DGI, día BPS
3. **Valores de referencia fiscal** — BPC, UI, IRAE mínimo, IVA mínimo, Monotributo A y B, ICOSA anual + una caja con los valores 2026 vigentes y dos botones a BCU e INE
4. **Parámetros fiscales adicionales** — ICOSA mensual, salario mínimo, límites en UI + una nota que calcula el equivalente en pesos
5. **Personalización visual** — **vacía**. Dice literalmente: *"Color del acento y datos de usuario se configuran directamente en el código fuente. Próximamente: más opciones visuales."*

Sin botón Guardar: cada tecla escribe en `localStorage`. Sin validación de rangos.

---

### 1.2. Modales y ventanas emergentes

| Modal | Componente | Línea | Se abre desde | Ancho | Fondo del overlay | z-index |
|-------|-----------|-------|---------------|-------|-------------------|---------|
| **Nuevo cliente** | `NewClientModal` | 631 | Listado de clientes | 540px | `#0b152e8c` | 1000 |
| **Aumento por convenio** | `AumentoModal` | 1379 | Módulo Sueldos | 720px | `#0b152e8c` | 1000 |
| **Reporte para el cliente** | `ReporteModal` | 1644 | Ficha (solo Laser) | 760px | `#021029a8` | 300 |
| **Campana de avisos** | `NotifBell` | 2668 | Barra superior | 330px | transparente | 150 |

**Los tres modales están construidos de tres formas distintas:**

- `NewClientModal`: encabezado blanco, título + subtítulo, botón ✕ con borde gris, contenido con scroll, botones al pie a la derecha
- `AumentoModal`: **encabezado navy sólido**, título con emoji, subtítulo celeste `#8ECBDE`, ✕ blanco translúcido, cuerpo con fondo gris, pie con borde superior
- `ReporteModal`: **encabezado con degradé** de 3 paradas, misma estructura de subtítulo celeste, pero con una fila extra de chips de selección debajo del header

Ninguno cierra con la tecla Escape. Ninguno atrapa el foco. Los tres cierran haciendo click afuera.

### 1.3. Diálogos nativos del navegador

| Tipo | Cantidad | Dónde |
|------|----------|-------|
| `window.confirm()` | 5 | Eliminar empleado · Eliminar certificado (×2) · Finalizar mes (×2, escritorio y móvil) |
| `alert()` | 5 | Importar Excel proveedores · Importar facturas · Enviar importes sin monto · (otros) |
| Ventana de impresión | 2 | Recibos de sueldo · Reporte PDF del cliente |

**Estos diálogos nativos son visualmente incompatibles con cualquier rediseño**: los dibuja el navegador, no la app. Reemplazarlos por diálogos propios es trabajo del rediseño.

**⚠️ Inconsistencia grave de confirmación:** algunas eliminaciones preguntan y otras no. **Borran al instante, sin preguntar:** proveedor, incidencia, certificado DGI desde la solapa Datos, línea del reporte PDF. **Sí preguntan:** empleado, certificado DGI desde la solapa Tributario.

### 1.4. Vistas de impresión (interfaz aparte)

Dos generadores de HTML que se abren en una ventana nueva y disparan el diálogo de impresión. **Tienen su propio sistema de estilos, totalmente separado del de la app**:

| Vista | Función | Línea | Notas |
|-------|---------|-------|-------|
| **Recibo de sueldo** | `reciboHTML` + `imprimirRecibos` | 1287, 1343 | Réplica exacta del formato oficial en uso. Números en formato **en-US** (`33,959.20`). 2 ejemplares por hoja. |
| **Reporte de obligaciones** | `generarReportePDF` | 1584 | Estética Laser Solutions, multi-empresa |

Un cambio de marca (logo, colores, tipografía) obliga a tocar estas dos funciones aparte, en HTML plano con CSS embebido en un string.

---

## 2. Inventario de componentes

Los 26 componentes viven todos en el mismo archivo. No hay carpeta `components/`.

### 2.1. Primitivos presentacionales (reciben todo por props, no tienen lógica)

Estos son los que se pueden rediseñar sin riesgo: cambiás lo de adentro y funcionan igual.

| Componente | Línea | Props | Dónde se usa | Veces |
|-----------|-------|-------|--------------|-------|
| `SpecialTag` | 393 | `tag`, `size` | Dashboard, ClientList, ClientDetail | 4 |
| `Logo` | 404 | `src`, `size`, `style` | Sidebar, ficha, formularios, WhatsApp | ~12 |
| `LogoRaw` | 410 | `src`, `size`, `style` | Sidebar (accesos), ficha | 3 |
| `Avatar` | 414 | `name`, `taxes`, `size` | Dashboard, ClientList, ficha, calendario, sueldos | ~8 |
| `TBadge` | 419 | `taxes` | Dashboard, ClientList, ficha | 4 |
| `OBadge` | 424 | `org` | Ficha (obligaciones), calendario | 4 |
| `Pill` | 429 | `label`, `color` | Ficha (tareas, entidad, empleados) | ~6 |
| `Check` | 430 | `checked`, `onChange`, `color`, `size` | **Toda la app** | ~40 |
| `StatCard` | 435 | `label`, `value`, `sub`, `color`, `onClick` | Dashboard, ficha resumen | 9 |
| `PeriodNav` | 442 | `period`, `setPeriod`, `inline` | Barra superior, Dashboard, calendario, ficha ×2 | 6 |
| `FormSection` | 454 | `title`, `children`, `cols` | Ficha (Datos), Configuración | ~10 |
| `FRow` | 462 | `label`, `value`, `editable`, `onChange`, `placeholder`, `type`, `full`, `logo` | Ficha (Datos generales) | ~11 |
| `PieChart` | 529 | `slices`, `size` | Dashboard (facturación) | 1 |

**Nota sobre `Check`:** está construido como un `<div onClick>`, no como un `<input type="checkbox">`. **No se puede usar con teclado, no recibe foco, no lo lee un lector de pantalla.** Y se usa 40 veces. Es el componente que más urge rehacer.

**Nota sobre `FormSection`:** es el único primitivo que lee contexto (`useR()` para saber si está en celular). Sigue siendo seguro de rediseñar.

### 2.2. Primitivos con estado interno (semi-presentacionales)

| Componente | Línea | Props | Qué lógica tiene adentro |
|-----------|-------|-------|--------------------------|
| `NumInput` | 472 | `value`, `onChange`, `style`, `placeholder`, `disabled` | Guarda un buffer de texto local y avisa recién al salir del campo. Existe para arreglar la pérdida de foco y permitir decimales tipo `0.0077`. |
| `CredRow` | 479 | `label`, `logo`, `credKey`, `creds`, `onChange` | Ver/ocultar contraseña. **Además decide sola si dibuja un campo o dos**, según si el valor es un texto (PIN) o un objeto usuario+contraseña. Esa decisión de forma está adentro del componente. |
| `ExcelImport` | 510 | `label`, `onImport` | Abre el selector de archivos, lee el archivo con `FileReader`, devuelve el contenido. Es entrada/salida, no presentación. |

### 2.3. Pantallas y módulos (presentación + lógica mezcladas)

| Componente | Línea | Líneas | Estados propios | Qué lógica tiene adentro |
|-----------|-------|--------|-----------------|--------------------------|
| `LoginScreen` | 538 | 40 | 4 | Autenticación contra 2 arrays fijos, lee el subdominio |
| `Sidebar` | 580 | 49 | 0 | Lee la variable global `ACTIVE_STUDIO` para elegir marca |
| `NewClientModal` | 631 | 45 | 2 | Formulario completo + validación + alta de empleados |
| `ProveedoresPanel` | 679 | 78 | 2 | ABM completo de proveedores + totales + control de rol |
| `Dashboard` | 759 | 130 | 0 | **Calcula 10 agregados distintos** sobre la lista de clientes; modifica tareas |
| `TasksModule` | 891 | 79 | 5 | Aplana las tareas de todos los clientes, filtra, ordena, da de alta |
| `AlertsCenter` | 972 | 38 | 0 | Recorre clientes y arma 3 listas de alertas. **Define `AlertBox` adentro del render.** |
| `ClientList` | 1012 | 46 | 4 | Filtrado múltiple + cálculo de 16 contadores |
| `EmpBlock` | 1061 | 66 | 2 | ABM de empleados. **Define `EmpForm` adentro del componente** → se recrea en cada tecla |
| `SueldosModule` | 1469 | 89 | 2 | Llama a `calcRecibo` por empleado, arma totales, dispara impresión |
| `AumentoModal` | 1379 | 89 | 5 | Lee convenios, calcula franjas y porcentajes, aplica el aumento a todos |
| `ReporteModal` | 1644 | 55 | 2 | Arma las líneas por empresa, permite editarlas, genera el PDF |
| `CalculoMes` | 1701 | 107 | 1 | Llama a `calcAnticipos`, edita facturación e impuestos. **Define `Fila` adentro.** |
| `ClientDetail` | 1810 | 638 | **20** | Todo lo de las 6 solapas. **Define `TaskRow` adentro.** |
| `CalendarioView` | 2449 | 113 | 2 | Construye el mapa de eventos del mes recorriendo todos los clientes |
| `ConfigPanel` | 2564 | 41 | 0 | Formulario de configuración |
| `NotifBell` | 2668 | 61 | 2 | Arma la lista de avisos, pide permiso de notificaciones, escribe en `localStorage` |
| `Obligo` (raíz) | 2730 | 126 | 9 | Sesión, estudio activo, persistencia, navegación, migración de datos |

### 2.4. Componentes definidos adentro de otros componentes

Esto merece un punto aparte porque **afecta directamente al rediseño**:

| Sub-componente | Definido dentro de | Línea | Problema |
|---|---|---|---|
| `AlertBox` | `AlertsCenter` | 989 | Se recrea en cada dibujado |
| `EmpForm` | `EmpBlock` | 1069 | Se recrea en cada tecla → **React lo desmonta y lo vuelve a montar** |
| `Fila` | `CalculoMes` | 1710 | Se recrea en cada dibujado |
| `TaskRow` | `ClientDetail` | 1875 | Se recrea en cada dibujado |

Estos cuatro **no se pueden reutilizar ni rediseñar por separado** sin sacarlos afuera primero. Sacarlos es trabajo obligatorio del rediseño, y en el caso de `EmpForm` además arregla un bug real de pérdida de foco.

### 2.5. Lógica pura, sin nada visual (el rediseño NO la toca)

Esta es la parte sana del proyecto. Son funciones a nivel de archivo que reciben datos y devuelven datos:

| Función | Línea | Qué hace |
|---------|-------|----------|
| `getObs(client, period)` | 133 | Motor de reglas: qué obligaciones le corresponden a un cliente |
| `calc2908(client, cfg)` | 176 | Desglose del boleto 2908 |
| `calcNomina(emp)` | 212 | Aportes y líquido simplificados |
| `calcAnticipos(client, period, config)` | 1146 | IVA, IRAE por coeficiente, patrimonio, arrastre de excedente |
| `calcRecibo(emp, inc, opts)` | 1216 | Liquidación completa de sueldo |
| `convenioDe(client)` | 1211 | Busca el convenio del Grupo MTSS |
| `taxTags`, `isConf`, `matchTaxFilter` | 88, 96, 109 | Etiquetas y filtros de impuestos |
| `pd/dp/prevP/nextP/vtoDGI/vtoBPS/daysUntil/dateAdd` | 52-60 | Manejo de fechas y períodos |
| `mk`, `mkTax`, `mkEmp`, `mkEmpL`, `mkCred`, `normClient` | 204-327 | Fábricas y normalización de datos |
| `cargarLista`, `marcarAlDia` | 246, 242 | Carga y migración de datos guardados |

**~790 líneas (28% del código real) son lógica y datos que el rediseño no necesita mirar.**

---

## 3. Nivel de acoplamiento — la respuesta honesta

### 3.1. ¿Usa Tailwind, CSS modules, styled-components, o mezcla?

**Ninguno de los tres. Usa estilos en línea, escritos a mano, en el 100% de los casos.**

| Sistema | ¿Está? |
|---------|--------|
| Tailwind | No |
| CSS Modules | No |
| styled-components / emotion | No |
| Hoja de estilos global | Sí, pero mínima: `src/index.css`, 72 líneas (reset, scrollbar, selección de texto, foco) |
| Estilos en línea `style={{...}}` | **793 apariciones** |

Dependencias instaladas: `react`, `react-dom`, `terser`, `vite`, `@vitejs/plugin-react`, `vite-plugin-pwa`, `xlsx`. **Cero librerías de UI, cero librerías de estilos, cero sistema de iconos.**

### 3.2. ¿Hay tokens, o está todo hardcodeado?

**Hay un intento de sistema de tokens, pero es parcial y está roto de dos maneras.**

**Lo que sí existe:**

```js
const C = {                                          // línea 17
  navy:"#021942", blue:"#1D4ED8", white:"#fff",
  warn:"#D97706", ok:"#059669", red:"#DC2626",
  gray:"#6B7280", dark:"#07111F", border:"#DDE2F0",
  bg:"#EEF0F6", purple:"#6D28D9", teal:"#0891B2",
  cell1:"#EBF5FF", cell2:"#D4E9FF",
};
const F = "Inter,'Segoe UI',system-ui,sans-serif";    // línea 24
const lbl = { fontSize:11, color:C.gray, ... };       // línea 451
const inp = { padding:"7px 9px", border:..., ... };   // línea 452
```

Cuatro tokens: una paleta de 14 colores, una tipografía, y dos estilos de formulario. Es un buen comienzo. **Pero:**

#### Problema 1 — La paleta es una variable global que se muta en caliente

```js
function applyStudio(id){
  ACTIVE_STUDIO = id;
  Object.assign(C, id==="laser" ? C_LASER : C_VC);   // línea 47
}
```

`Object.assign(C, ...)` **reescribe el objeto `C` en el lugar**. No crea uno nuevo. Los componentes leen `C.navy` en el momento de dibujarse, así que el cambio "funciona"… por accidente: React no se entera de que la paleta cambió y solo se ve el efecto porque el cambio de estudio siempre viene acompañado de un cambio de sesión que redibuja todo.

Para el rediseño esto significa: **no se puede agregar un selector de tema, ni modo oscuro, ni previsualizar una paleta, sin cambiar antes esta arquitectura.** Es el cambio estructural más importante que habilita todo lo demás.

#### Problema 2 — 101 colores viven fuera de la paleta

| Métrica | Valor |
|---------|-------|
| Colores hexadecimales escritos directo en el JSX | **304 apariciones** |
| Colores distintos que no están en `C` | **101** |

Los más repetidos, y de dónde salen:

| Color | Veces | Qué es |
|-------|-------|--------|
| `#0001` | 31 | La sombra de las tarjetas |
| `#fff` / `#000` | 32 | Blanco y negro sueltos, aunque existe `C.white` |
| `#8ECBDE` | **17** | **Celeste de marca de Laser Solutions** |
| `#021942` | 14 | El navy — existe como `C.navy`, pero se escribe a mano igual |
| `#F0FDF4` / `#86EFAC` | 19 | Verdes de "todo bien" |
| `#FEF2F2` / `#FCA5A5` | 10 | Rojos de "vencido" |
| `#FFFBEB` / `#FDE68A` / `#78350F` | 15 | Amarillos de aviso |
| `#14294F` / `#C8A44D` / `#E9C877` | 13 | Navy y dorado de Valeria Calvette |

**Consecuencia concreta y visible hoy:** el celeste `#8ECBDE` es color de marca de Laser Solutions, pero está escrito a mano en `AumentoModal`, `SueldosModule`, `CalculoMes` y `ClientDetail`. Como la solapa Sueldos también está habilitada para Valeria Calvette, **un usuario de Valeria ve colores de marca de Laser en su propia app**. La paleta `C` no lo puede corregir porque esos valores no pasan por `C`.

#### Problema 3 — No hay escala de nada

| Dimensión | Valores distintos en uso | Detalle |
|-----------|------------------------|---------|
| **Tamaños de fuente** | **20** | 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 15, 16, 17, 18, 19, 20, 22 — **con medios píxeles** |
| **Espaciados (`padding`)** | **79 combinaciones distintas** | `"7px 14px"` (12 veces), `"5px 7px"` (10), `"8px 10px"` (8), `"6px 14px"` (7), `"6px 12px"` (6)… |
| **Separaciones (`gap`)** | 15 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20 |
| **Radios de borde** | 13 | 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 18, 99 |
| **Sombras** | ~8 | `0 1px 3px #0001` (31 veces), y 7 más para modales y desplegables |

No hay múltiplos de 4 ni de 8. Los valores parecen elegidos uno por uno, a ojo, en el momento.

#### Problema 4 — La tipografía que se carga no es la que se usa

Esto es un hallazgo concreto:

- `index.html` línea 16: descarga **Poppins** (400/500/600/700) y **Montserrat** desde Google Fonts
- `index.css` línea 15: pone `font-family: 'Poppins', 'Montserrat', ...` en el `<body>`
- `Obligo.jsx` línea 24: define `F = "Inter,'Segoe UI',system-ui,sans-serif"`
- …y aplica `fontFamily: F` **317 veces** en línea, pisando el `body`

**Inter nunca se descarga.** Así que en Windows la app se ve en **Segoe UI**, mientras descarga dos familias completas de Google Fonts que casi no se usan. El rediseño arregla esto cambiando una sola línea — pero conviene saberlo antes de elegir la tipografía.

### 3.3. ¿Los componentes hacen fetch/mutaciones adentro, o reciben datos por props?

**No hay fetch en ninguna parte de la app. No hay backend, no hay API, no hay red.**

Los datos salen de:
1. Arrays escritos en el código: `CLIENTS_INIT` (42 clientes, línea 265) y `CLIENTS_LASER` (7 clientes, línea 328)
2. `localStorage`, con 11 puntos de lectura/escritura (`gc_clients`, `gc_config`, `ls_clients`, `ls_config`, `ls_seed`, y las banderas de limpieza)

Y ahí sí hay **una separación bastante limpia**, que es la mejor noticia de esta auditoría:

| Capa | ¿Cómo recibe los datos? | Veredicto |
|------|------------------------|-----------|
| **Primitivos** (Avatar, Pill, Check, StatCard, TBadge…) | Todo por props | ✅ Limpio. Ninguno lee `localStorage` ni estado global. |
| **Cálculos** (getObs, calcRecibo, calcAnticipos, calc2908) | Funciones puras a nivel de archivo | ✅ Limpio. Reciben datos, devuelven datos. No saben de React ni de colores. |
| **Pantallas** (Dashboard, ClientList, ClientDetail…) | Reciben `clients` y `setClients` por props | ⚠️ Mixto. Reciben los datos por props, pero **calculan sus propios agregados adentro y mutan el estado global directamente**. |
| **Persistencia** | Concentrada en el componente raíz, con dos `useEffect` | ✅ Bastante bien encapsulada. Solo `NotifBell` escribe en `localStorage` por su cuenta. |
| **Marca / estudio activo** | Variable global mutable `ACTIVE_STUDIO` | ❌ La leen `Sidebar`, `ClientDetail`, `NotifBell` y `LoginScreen` directamente. No pasa por props ni por contexto. |

**Lo bueno:** ninguna pantalla "va a buscar" datos. Si mañana hay un backend, los cálculos y los primitivos no se enteran.

**Lo malo para el rediseño:** cada pantalla arma sus propios números. Por ejemplo, el Dashboard calcula 10 agregados (clientes sin configurar, tareas vencidas, alertas de certificados, facturación…) en las 15 líneas que van antes del `return`. Si el rediseño reordena o divide el Dashboard, esos cálculos hay que moverlos también. No se puede "solo cambiar el layout".

Y hay **duplicación de esa lógica derivada** entre pantallas: la lógica de "certificados que vencen en menos de 60 días" está escrita **tres veces**, con tres formas distintas — en `Dashboard` (línea 765), en `AlertsCenter` (978) y en `NotifBell` (2674).

### 3.4. Los porcentajes

Primero, la respuesta directa a la pregunta como está formulada:

> **0% del rediseño se puede hacer tocando solo estilos.** No hay hoja de estilos. Todo cambio visual pasa por editar el archivo de JSX.

Pero eso no describe bien el esfuerzo real, porque **la mayor parte de esos cambios en el JSX son mecánicos, no creativos ni riesgosos**. La división útil es esta:

#### El rediseño en tres capas

| Capa | Qué implica | % del esfuerzo | Riesgo | ¿Toca lógica? |
|------|-------------|----------------|--------|---------------|
| **A — Sustitución de valores** | Reemplazar los 304 hex sueltos, los 20 tamaños de fuente, los 79 espaciados y los 13 radios por tokens. Cambiar la tipografía. | **~40%** | Bajo | No |
| **B — Reemplazo de marcado repetido** | Crear `Button`, `Card`, `Input`, `Select`, `Badge`, `Modal`, `EmptyState`, `SectionHeader`, `KpiTile` y sustituir las ~250 copias artesanales por ellos. Sacar afuera los 4 sub-componentes internos. | **~35%** | Medio | No |
| **C — Reescritura de componentes** | Rehacer de verdad: `ClientDetail` (638 líneas, 6 solapas, 20 estados), `Dashboard`, `SueldosModule`, `CalendarioView`. Arreglar `Check` para que sea accesible. Reemplazar los 10 diálogos nativos. | **~25%** | Alto | Sí, inevitablemente |

**Traducido a algo accionable:**

- **75% del rediseño (capas A + B) no requiere entender ni tocar la lógica contable.** Es sustitución sistemática. Un diseñador con un desarrollador de front puede hacerlo sin riesgo de romper cálculos.
- **25% (capa C) sí exige reescribir componentes**, porque en esos casos el layout y la lógica están entrelazados: no podés reorganizar la ficha del cliente sin tocar las 20 variables de estado que la controlan.

**Pero hay una precondición.** Las capas A y B solo son baratas **después** de crear el archivo de tokens y el juego de componentes base. Eso es trabajo nuevo, no incluido arriba, y estimo:

- Extraer tokens a variables CSS + arreglar la mutación de `C`: **~1 día**
- Crear los 9 componentes base con todos sus estados: **~2-3 días**

Sin ese paso previo, la capa A pasa de "40% mecánico" a "editar 793 bloques de estilo a mano, uno por uno" — que es el escenario caro y propenso a errores.

**Además, fuera de los porcentajes:**

- Las **dos vistas de impresión** (recibo de sueldo y reporte PDF) son un sistema de estilos aparte, en HTML plano. Rediseñarlas es trabajo adicional, aunque acotado.
- Si el rediseño quiere **URLs por pantalla** (botón Atrás, links compartibles, recargar sin perder el lugar), eso es una reestructuración de la navegación que hoy no existe.

---

## 4. Estados que hoy existen

### 4.1. Estados de carga

**No existe ninguno, en ninguna pantalla.**

Es coherente: no hay red, todo es sincrónico. Pero hay tres puntos donde el usuario sí espera y no ve nada:

| Momento | Qué pasa hoy | Qué falta |
|---------|--------------|-----------|
| Exportar a Excel | `import("xlsx")` descarga la librería (~400 KB) al vuelo. **Cero indicación visual.** El botón no cambia. | Botón con estado "Generando…" |
| Imprimir recibos | Se abre una ventana nueva y se dispara `window.print()`. Sin aviso previo. | Aviso de que va a abrirse una ventana |
| Generar reporte PDF | Igual que el anterior | Igual |
| Arranque de la app | Lee y migra `localStorage`. Con 49 clientes es instantáneo, pero no hay pantalla intermedia. | Pantalla de carga si crece el volumen |
| Actualización del service worker (PWA) | **Ninguna.** El usuario sigue viendo la versión vieja sin saberlo. | Aviso "Hay una versión nueva, recargá" |

**Veredicto:** los estados de carga están **totalmente sin diseñar**. Hoy no molesta porque nada tarda; en cuanto haya un backend, hay que diseñarlos desde cero.

### 4.2. Estados vacíos

**Existen bastantes** — 15 en total — pero **ninguno está diseñado**: todos son la misma línea de texto gris centrado, con padding distinto cada vez.

| Pantalla | Mensaje | Padding |
|----------|---------|---------|
| Proveedores | "Sin proveedores registrados para este período" | 16 |
| Tareas | "Sin tareas que coincidan" | 20 |
| Clientes | "Sin resultados" | 28 |
| Alertas ×3 | "Sin certificados próximos a vencer" / "Sin tareas vencidas" / "Sin tareas próximas" | — |
| Dashboard | "Sin vencimientos" / "Sin tareas vencidas" | 14 / — |
| Sueldos | "Este cliente no tiene empleados cargados. Agregalos desde la pestaña Datos." | 24 |
| Ficha · Tareas | "Sin tareas registradas" | 28 |
| Ficha · Trámites | "Sin trámites" | 28 |
| Ficha · Incidencias | "Sin incidencias en este período" | 18 |
| Ficha · Certificados | "Sin certificados registrados" | 12 |
| Calendario | "Sin obligaciones configuradas este día" | 18 |
| Campana | "🎉 Sin vencimientos próximos. Todo en orden." | 26 |
| PieChart | "Sin datos" (dentro de un círculo gris) | — |
| Aumento | "Sin empleados cargados." | 20 |
| Reporte | "Seleccioná al menos una empresa arriba." | 24 |

**Lo que falta:**

- **Ningún estado vacío tiene una acción.** Solo el de Sueldos dice a dónde ir, y en texto plano, no como botón. Un estado vacío de "Sin tareas registradas" debería tener el botón "+ Agregar tarea" adentro.
- **No hay estado de "app recién instalada"**: si un estudio nuevo entra sin clientes, ve un Panel Principal con todos los contadores en 0, una grilla vacía y ninguna guía de por dónde empezar.
- **El listado de clientes usa el mismo mensaje** ("Sin resultados") para "no hay clientes" y para "tu filtro no encontró nada" — que son dos situaciones muy distintas.
- **Faltan del todo** en: la grilla "Todos los clientes" del Dashboard, y la lista "Sin configurar" del Dashboard (dibuja un contenedor vacío).
- Siete padding distintos para lo mismo (12, 14, 16, 18, 20, 24, 26, 28).

### 4.3. Estados de error

**Casi no existen.**

| Dónde | Qué hay |
|-------|---------|
| Login | Un texto rojo de 12px: "Usuario o contraseña incorrectos." ✅ |
| Nuevo cliente | Caja roja: "Poné el nombre o razón social del cliente." y "No se pudo guardar: …" ✅ |
| **Todo lo demás** | Nada |

**Lo que falta, y es importante:**

1. **No hay barrera de errores (`ErrorBoundary`).** Un solo error de JavaScript en cualquier parte deja **la pantalla completamente en blanco**, sin mensaje. Y como toda la app es un solo árbol de componentes, un error en la ficha del cliente tumba todo. Ya pasó al menos una vez (según el registro del proyecto, un bug en `NewClientModal` trababa la app entera).

2. **Los 11 usos de `localStorage` están envueltos en `try/catch` vacíos** (`catch(e){}`). Si el almacenamiento se llena o el navegador lo bloquea (modo incógnito, por ejemplo), **los datos no se guardan y el usuario nunca se entera.** Sigue trabajando creyendo que guardó.

3. **`alert()` como manejo de errores** en 5 lugares, incluyendo dos funcionalidades que directamente no existen todavía ("próximamente").

4. **No hay sistema de avisos dentro de la app** (toast, snackbar). Nada confirma que una acción salió bien. Guardás un cliente y no pasa nada visible.

### 4.4. Validaciones de formulario

**Muy pobres, y con un patrón peligroso.**

**Lo que sí valida:**

| Formulario | Validación |
|-----------|-----------|
| Nuevo cliente | Nombre obligatorio, con mensaje visible ✅ |
| Login | Usuario y contraseña deben coincidir ✅ |

**El patrón peligroso — el botón que no hace nada:**

Siete formularios validan así:

```js
const addTask = () => { if(!newTask.label) return; ... }        // línea 1867
const addTram = () => { if(!newTram.titulo) return; ... }       // línea 1870
const addInc  = () => { if(!newInc.texto)  return; ... }        // línea 1860
const addEmpF = () => { if(!newEmp.name)   return; ... }        // línea 1869
const add     = () => { if(!form.nombre || !form.monto) return; ... }  // línea 687
const addGlobalTask = () => { if(!label || !clientId) return; ... }    // línea 899
const addCertTrib   = () => { if(!imp && !num) return; ... }          // línea 1865
```

En los siete casos: **el usuario aprieta "Guardar" y no pasa absolutamente nada.** Sin mensaje, sin campo marcado en rojo, sin explicación. El formulario queda abierto y parece roto.

**Lo que no se valida en ningún lado:**

- **RUT** — campo de texto libre, sin formato ni dígito verificador
- **Cédula** — texto libre
- **Teléfono / WhatsApp** — texto libre. Los botones de WhatsApp hacen `.replace(/\D/g,"")` y chequean `length > 5`, y si no, no hacen nada (uno muestra un `alert`)
- **Email** — texto libre, sin `type="email"`
- **Montos** — `type="number"` sin mínimo, máximo ni control de decimales. Se aceptan negativos.
- **Período `MM/AAAA`** — en el modal de Aumento se escribe a mano en un campo de texto, sin ningún control de formato (línea 1440)
- **Fechas** — solo el control nativo `type="date"`. Sin rangos, sin coherencia (una fecha de ingreso puede ser posterior a hoy)
- **Contraseñas** en Configuración — sin largo mínimo, y visibles en pantalla

**Sin marcado de campos obligatorios más allá del asterisco en la etiqueta.** Sin validación mientras se escribe. Sin resumen de errores.

### 4.5. Otros estados de interacción

| Estado | Cómo está |
|--------|-----------|
| **Hover** | Solo en los 6 ítems del menú lateral, hecho a mano con `onMouseEnter`/`onMouseLeave` (línea 606). **Los otros ~85 botones no tienen ningún hover.** |
| **Activo / pressed** | No existe en ningún lado |
| **Foco** | Sí, global en `index.css`: contorno azul `#2948D9` de 2px. ✅ Pero ese azul es de la marca Laser y **se ve igual en la app de Valeria Calvette**, cuya marca es navy y dorado. |
| **Deshabilitado** | Existe en 4 lugares, **estilado distinto en cada uno**: aplicar aumento (fondo `C.border`), generar PDF (fondo `C.border`), recibo PDF (fondo `C.border` + cursor default), chips de filtro (opacidad .45). Sin un patrón común. |
| **Seleccionado** | 4 patrones distintos: solapas (borde inferior 2px), menú lateral (fondo + borde izquierdo + sombra), chips (fondo lleno), día del calendario (borde 2px + fondo translúcido) |
| **Transiciones** | 4 en toda la app: `all .12s` en `Check`, `background .12s` en el menú, `filter .1s` en las tarjetas de cliente, `all .1s` en el calendario. Tres duraciones distintas. |
| **Skeletons** | No existen |
| **Deshacer** | No existe. Todo borrado es definitivo, y la mitad ni siquiera pregunta. |

---

## 5. Deuda visual

### 5.1. Componentes duplicados que hacen lo mismo

Este es el capítulo más grande de deuda. Ordenado por impacto:

#### a) Botones — 90 en total, ~8 variantes, cero componente

No existe un componente `Button`. Cada uno de los 90 botones tiene su estilo escrito a mano. Las variantes que se repiten:

| Variante | Estilo típico | Aprox. |
|----------|--------------|--------|
| Primario azul | `background:C.blue, color:white, borderRadius:6, padding:"8px 16px", fontSize:13, fontWeight:600` | ~12 |
| Guardar verde | `background:C.ok, color:white, borderRadius:6, padding:"7px 14px", fontSize:12, fontWeight:600` | ~8 |
| Cancelar fantasma | `background:transparent, border:1px solid C.border, color:C.gray` | ~8 |
| Agregar punteado | `border:1px dashed C.blue, color:C.blue, background:transparent` | ~4 |
| Peligro | `background:C.red+"10", border:1px solid C.red+"30", color:C.red` | ~8 |
| Chip / píldora | `borderRadius:99, border:1.5px solid, fondo condicional` | ~3 grupos |
| Ícono cuadrado ✕ | 24×24 o 28×28 o 30×30, tres tamaños distintos | ~6 |
| Enlace externo ↗ | `padding:"1px 5px"` o `"2px 7px"`, dos versiones | ~6 |

**Y las mismas variantes tienen medidas distintas según dónde estén.** El par "Guardar / Cancelar" aparece 7 veces en la app, con `padding:"6px 14px"` en cuatro lugares y `padding:"7px 14px"` en tres. Nadie lo nota mirando una pantalla; se nota al ponerlas una al lado de la otra.

#### b) Tarjetas — 31 copias del mismo patrón, con 3 variaciones cada una

```js
{background:C.white, borderRadius:8, padding:14, boxShadow:"0 1px 3px #0001"}
```

Este bloque aparece **31 veces**. Pero el radio varía entre **7, 8, 9 y 10**, y el padding entre **12, 14 y 16**, sin ningún criterio visible.

#### c) Badges y píldoras — 4 componentes + ~6 versiones sueltas

Hay cuatro componentes que hacen básicamente lo mismo (`Pill`, `TBadge`, `OBadge`, `SpecialTag`), con **cuatro radios distintos**: 3, 3, 3 y 99.

Y además, escritos directo en el JSX sin usar ninguno de los cuatro:
- Estado de trámite (línea 2355)
- Tipo de incidencia (2395)
- Categoría de tarea (963)
- "Recurrente" en proveedores (750)
- "Cerrado" en la barra superior (2828)
- Delegación "→ Nombre" en tareas (959)

**Total: 10 formas distintas de dibujar una etiqueta de color.**

#### d) Tarjetas de números — 5 implementaciones distintas

| Dónde | Aspecto |
|-------|---------|
| `StatCard` (componente) | Fondo blanco, borde izquierdo de color 3px, número 22px peso 800 |
| Dashboard · Facturación | Fondo del color al 10%, borde al 20%, centrado, número 20px |
| Proveedores · resumen | Fondo pastel fijo (`#F0FDF4`, `#FEF9C3`), número 18px, alineado a la izquierda |
| EmpBlock · liquidación | Fondo del color al 10%, radio 4, número 13px |
| SueldosModule · totales | Sin fondo, centrado, número 17px peso 800 |

Cinco maneras de mostrar "una etiqueta y un número".

#### e) Formularios de alta inline — 7 implementaciones casi iguales

Proveedor, tarea global, tarea del cliente, trámite, incidencia, certificado, empleado. Todos siguen el mismo esquema (caja + grilla de campos + Guardar/Cancelar), y **todos están escritos de cero cada vez**, con diferencias de fondo (`C.white` vs `C.bg`), color de borde (azul, verde azulado, naranja según el módulo) y padding de los botones.

#### f) Encabezados de sección — 3 tratamientos mezclados

El mismo `fontWeight:600, color:C.navy, fontSize:13` aparece ~20 veces, pero:
- A veces solo con texto
- A veces con una barra vertical de color de 3px o 4px de ancho y 11px o 14px de alto (dos medidas)
- A veces con un punto redondo de 7px u 8px (dos medidas)

#### g) Modales — 3, con 3 arquitecturas distintas

Ver sección 1.2. Distintos encabezados, distintos fondos de overlay (`#0b152e8c` vs `#021029a8`), distintos z-index (1000, 1000, 300 — y la campana en 150).

#### h) Estados vacíos — 15, sin componente

Ver sección 4.2.

### 5.2. Colores fuera de paleta

Ya cubierto en detalle en 3.2. Resumen:

- **101 colores distintos** escritos a mano, contra 14 en la paleta
- **304 apariciones** de hex literal
- El celeste de marca de Laser (`#8ECBDE`, 17 veces) aparece en módulos que también usa Valeria Calvette
- Ningún hex usa la paleta para los estados semánticos: los verdes de "ok" (`#F0FDF4`, `#86EFAC`, `#DCFCE7`, `#A7F3D0`), los rojos de "vencido" (`#FEF2F2`, `#FCA5A5`, `#FEE2E2`, `#7F1D1D`) y los amarillos de aviso (`#FFFBEB`, `#FDE68A`, `#FEF9C3`, `#FFF7ED`, `#FED7AA`, `#92400E`, `#78350F`, `#854D0E`) están todos escritos sueltos. **Son 8 tonos de amarillo para el mismo concepto.**

### 5.3. Tamaños de fuente sueltos

20 tamaños distintos, con medios píxeles (8.5, 9.5, 10.5, 11.5, 12.5, 13.5). **384 declaraciones de `fontSize` en total.**

Los medios píxeles son señal de ajuste manual: alguien vio que "12 quedaba grande y 11 chico" y puso 11.5. Repetido 40 veces, deja una tipografía sin ritmo.

**Además:** hay texto de **8px** en la app (los badges de organismo en las celdas del calendario, línea 2515) y de **9px** (etiquetas Pagado/Notif. en las tareas). En pantalla, con color gris `#6B7280` sobre fondo `#EEF0F6`, eso está **por debajo del mínimo legible y del contraste mínimo de accesibilidad (WCAG AA)**.

### 5.4. Espaciados arbitrarios

- **79 combinaciones distintas de padding**
- **15 valores distintos de gap** (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20)
- **13 radios de borde**

Ninguna escala. No hay múltiplos de 4 ni de 8. `gap:1` y `gap:2` conviven con `gap:20`.

### 5.5. Iconografía sin sistema

Tres sistemas mezclados:

| Sistema | Ejemplos | Problema |
|---------|----------|----------|
| **Emoji** | 📊 👥 ✅ 🔔 📅 ⚙️ 📈 🖨 🧾 📄 🔗 🖥 🎉 ⚠ | Se ven distinto en cada sistema operativo y no se pueden colorear. El menú lateral les aplica `filter: grayscale(35%)` cuando no están activos — un parche. |
| **Caracteres de texto** | ‹ › ← ↗ ↑ ↓ ✕ × ✓ ☰ | Cambian de tamaño con la fuente |
| **Imágenes** | Logos de DGI, BPS, BSE, WhatsApp, e-Factura, Laser, VC — en base64 dentro del código | Ocupan 558 KB del archivo fuente |

**Y dos caracteres distintos para lo mismo:** `×` (multiplicación) y `✕` (cruz) se usan indistintamente para cerrar y para eliminar, a veces en la misma pantalla.

### 5.6. Inconsistencias de formato de datos

| Dato | Formatos en uso | Dónde |
|------|----------------|-------|
| **Dinero** | `toLocaleString("es-UY")` → `33.959` (**22 veces**) · `fU()` es-UY 2 decimales → `33.959,20` · `fN()` **en-US** → `33,959.20` (recibos) | La misma app muestra el mismo importe con el punto y la coma **invertidos** según la pantalla |
| **Fechas** | ISO crudo `2026-07-22` (listas de tareas) · `22/07/2026` (invertido a mano con `.split("-").reverse().join("/")`) · `22/08/2026` (vencimientos) · `07/2026` (período) · `Julio 2026` (recibos) · `Jul-26` (encabezado del recibo) | 6 formatos |
| **Porcentajes** | `2,8%` (coma, con `.replace(".",",")`) · `15%` · `0,1%` · `1,5%` | Coherente, pero hecho a mano en cada lugar |

### 5.7. Responsive frágil

Un solo punto de quiebre, a **700px**, calculado en JavaScript (`useWW`, línea 10) y repartido por contexto de React.

**Se lee con 9 nombres distintos** para la misma variable, uno por componente:

```
{m}      Sidebar, FormSection, Dashboard, NewClientModal
{m:clM}  ClientList
{m:empM} EmpBlock
{m:auM}  AumentoModal
{m:suM}  SueldosModule
{m:rpM}  ReporteModal
{m:cmM}  CalculoMes
{m:cdM}  ClientDetail
{m:calM} CalendarioView
```

**Pantallas que directamente lo ignoran:**
- `TasksModule` — padding fijo de 22px
- `AlertsCenter` — padding fijo de 22px
- `ConfigPanel` — padding fijo de 22px, formularios siempre a 2 columnas
- `Dashboard` — la grilla del medio es `"1fr 1fr"` fija (línea 817): en celular quedan dos columnas de 150px
- `ClientList` — tabla con `minWidth: 520px` y scroll horizontal

**No hay nada entre 700px y escritorio**: una tablet de 900px ve exactamente el layout de escritorio, con la tabla apretada.

### 5.8. Accesibilidad

| Problema | Alcance |
|----------|---------|
| `Check` es un `<div onClick>`, no un checkbox | **~40 usos.** No recibe foco, no funciona con teclado, no lo anuncia un lector de pantalla |
| Elementos clickeables que son `<div>` | Tarjetas de cliente, días del calendario, filas de alertas, filas de "asociado a Gub.uy", cajas de facturación |
| `<label>` sin vínculo al campo | Todos. Se usa `<label style={lbl}>` suelto, sin `htmlFor` ni `id` |
| Sin `aria-label` en botones de solo ícono | Los botones ✕, ↗, ‹ › |
| Contraste insuficiente | Gris `#6B7280` a 8-10px sobre fondo `#EEF0F6` |
| Sin `alt` descriptivo | Los `<img>` de logos usan `alt=""` |
| Sin jerarquía de encabezados | Un `<h1>` por pantalla, y después todo `<div>`. No hay `<h2>`, `<h3>` |
| Sin regiones (`<main>`, `<nav>`, `<header>`) | Toda la app son `<div>` anidados |
| Modales sin atrapar el foco ni cerrar con Escape | Los 3 |

### 5.9. Funcionalidades a medias que se ven en la interfaz

| Dónde | Qué pasa |
|-------|----------|
| Configuración · "Personalización visual" | Sección vacía que dice "Próximamente" |
| Proveedores · Importar Excel | Lee el archivo y muestra un `alert` de "próximamente" |
| Ficha · Importar facturas | La función existe (`handleImportFact`, línea 1872) pero **el botón nunca se dibuja** — código muerto |
| Dashboard · "Próx. 7 días" | Fecha fija `"2026-04-23"` en el código: siempre muestra 0 |
| Proveedores | No se guardan en `localStorage`: se pierden al recargar |
| Obligaciones · Pagado/Notificado | No se guardan: se pierden al navegar |
| Períodos cerrados | `closedPeriods` no se guarda: se pierde al recargar |

### 5.10. Superposición de información

Tres lugares distintos muestran "cuánto hay que pagar este mes", con tres interfaces diferentes:

1. **Tributario · Cálculo del mes** — el cálculo automático a partir de la facturación
2. **Tributario · Desglose Boleto 2908** — el desglose de `calc2908`
3. **Operativo · Boletos del mes** — dos cajas (BPS y DGI) con monto cargado a mano

Y **dos lugares muestran facturación del estudio**: el Dashboard (agregado, con torta) y la solapa Comercial de cada ficha (individual). Con dos diseños distintos.

Esto no es solo deuda visual: es **deuda de arquitectura de información**, y es probablemente lo primero que un rediseño debería resolver, antes de elegir un color.

---

## 6. Recomendación de secuencia

No fue pedido, pero se desprende directamente del inventario. En orden, de más habilitante a menos:

1. **Arreglar la paleta mutable.** Pasar `C` (y `C_VC` / `C_LASER`) a variables CSS sobre un atributo `data-studio` en el `<html>`. Es un día de trabajo y desbloquea todo lo demás: temas, previsualización, modo oscuro.
2. **Definir las escalas** — tipografía (6-7 tamaños, no 20), espaciado (múltiplos de 4), radios (4 valores), sombras (3). Y elegir de una vez la tipografía real (hoy se descarga Poppins y se muestra Segoe UI).
3. **Crear los 9 componentes base:** `Button`, `Card`, `Input`, `Select`, `Badge`, `Modal`, `EmptyState`, `SectionHeader`, `KpiTile`. Con todos sus estados (normal, hover, foco, activo, deshabilitado, error) definidos una vez.
4. **Rehacer `Check` como checkbox accesible de verdad.** Toca 40 lugares y arregla el problema de accesibilidad más grande de la app.
5. **Sacar afuera los 4 sub-componentes internos** (`EmpForm`, `TaskRow`, `Fila`, `AlertBox`). Arregla el bug de pérdida de foco de `EmpForm`.
6. **Sustituir en masa** los 304 hex, los 384 `fontSize` y los 79 padding por tokens. Mecánico.
7. **Recién ahí, rediseñar de verdad** `ClientDetail`, que es el 22% del código y donde vive el trabajo diario del usuario.

Y dos cosas que conviene arreglar de paso, porque el rediseño va a tocar esas líneas igual:

- Guardar `obState` (Pagado/Notificado), `proveedores` y `closedPeriods` en `localStorage`
- El contador "Próx. 7 días" del Dashboard, con su fecha fija de abril

---

*Documento generado sin modificar una sola línea de código del proyecto.*
