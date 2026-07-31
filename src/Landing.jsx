// ─── LANDING OFICIAL DE OBLIGO ─────────────────────────────────────
// Vive en https://obligo.lasersolutions.com.uy. No es la app: es la
// página de producto.
//
// DISEÑO — está construida sobre el design system de OBLIGO (proyecto
// "OBLIGO Design System" en Claude Design). Los tokens de abajo son los
// mismos de tokens/brand.css + tokens/colors.css en su variante oscura,
// con la tipografía del sistema: Poppins para todo y IBM Plex Mono para
// cifras y datos. El registro es el opuesto al de la app: secciones de
// 96–128px, display grande, y el azul de acción #2948D9 con el acento
// #8ECBDE y el violeta #7A6FA8 usados como luz, no como relleno.
//
// PRIVACIDAD — la landing no enlaza a los estudios ni nombra sus
// direcciones, y las capturas de /public/shots salen de un estudio
// vacío: no se ve ningún dato de ningún cliente.
//
// Para verla en local: http://localhost:3001/?landing
// Para saltearla y ver la app en ese mismo host: /?app
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const LOGO = "/obligo-iso.png";

export function isLandingHost() {
  if (typeof window === "undefined") return false;
  const sp = new URLSearchParams(window.location.search);
  const hash = (window.location.hash || "").toLowerCase();
  if (sp.has("app") || hash === "#app") return false; // entrar a la app igual
  if (sp.has("landing") || hash === "#landing") return true; // probarla en local
  const h = (window.location.hostname || "").toLowerCase();
  if (h.includes("obligo-") || h.includes("vcestudio")) return false;
  return h.startsWith("obligo.");
}

// ─── Contenido ────────────────────────────────────────────────────

const TICKER = [
  "Boleto 2908", "IVA", "IRAE", "Impuesto al Patrimonio", "IRPF I", "IRPF II",
  "ICOSA", "Monotributo", "e-Factura", "Aportes BPS", "FONASA · SNIS", "FRL",
  "Nóminas", "Consejos de Salarios", "Certificados DGI", "DJ IVA anual",
];

const PILARES = [
  {
    k: "01",
    t: "Las obligaciones no se cargan a mano",
    d: "Se cargan el régimen fiscal y los datos del cliente una vez. Obligo deduce solas las obligaciones de cada mes. Si cambia el régimen, cambian las obligaciones.",
  },
  {
    k: "02",
    t: "Un solo número para el mes",
    d: "El Boleto 2908 consolida en un solo importe todo lo que el cliente le paga a DGI. Sale de una sola carga y alimenta la lista, el boleto y el aviso al cliente.",
  },
  {
    k: "03",
    t: "Nada se vence sin aviso",
    d: "Calendario, alertas y campana ordenados por fecha de vencimiento real: lo del mes se paga al mes siguiente, y Obligo lo muestra así.",
  },
];

// Los dos primeros son los módulos grandes de la grilla.
const MODULOS = [
  {
    ic: "engranaje", destacado: true,
    t: "Motor de obligaciones",
    d: "El corazón del sistema. Genera mes a mes las obligaciones que le corresponden a cada cliente según su régimen, ante qué organismo y con qué vencimiento.",
    items: ["Por régimen de renta e IVA", "Por tipo de entidad y naturaleza", "DJ IVA anual con ventana temporal", "e-Factura y regímenes especiales"],
  },
  {
    ic: "boleto", destacado: true,
    t: "Boleto 2908",
    d: "El consolidado de DGI del mes: IVA, IRAE, IRPF, Patrimonio e ICOSA en un único importe a pagar, con su desglose línea por línea.",
    items: ["Se calcula de una sola carga mensual", "Marcas de Pagado y Notificado", "BPS va aparte, como en la realidad", "Alimenta el aviso al cliente"],
  },
  { ic: "panel", t: "Panel Principal", d: "La foto del mes: qué vence, qué está pago, qué falta notificar, facturación y honorarios del estudio.", items: ["Próximos vencimientos", "Estado del mes por cliente", "Facturación y honorarios", "Accesos a organismos"] },
  { ic: "clientes", t: "Clientes", d: "La ficha completa de cada contribuyente, con todo lo que el estudio necesita tener a mano.", items: ["RUT, BPS, MTSS, BSE", "Impuestos y régimen de renta", "Credenciales de organismos", "Filtro por impuesto"] },
  { ic: "calculo", t: "Cálculo del mes", d: "Los anticipos calculados con las fórmulas reales de la planilla del estudio, sin salir del sistema.", items: ["IVA con excedente arrastrado", "IRAE por coeficiente y mínimo", "Impuesto al Patrimonio", "Retenciones de tarjetas"] },
  { ic: "sueldos", t: "Sueldos", d: "Liquidación mensual completa y recibo con el formato oficial en uso, listo para imprimir.", items: ["Antigüedad, nocturnidad y faltas", "Aportes BPS, SNIS, FRL e IRPF", "Recibo PDF, dos por hoja", "Nóminas que bloquean el BPS"] },
  { ic: "convenio", t: "Convenios de salarios", d: "Los ajustes de los Consejos de Salarios precargados, con vigencia. Los meses ya liquidados no se tocan.", items: ["Grupo 15 — residenciales", "Grupo 1/12 — fábricas de pastas", "Aumentos con fecha de vigencia", "Topes, fictos y prima"] },
  { ic: "tareas", t: "Tareas", d: "El trabajo del estudio, no del cliente: lo que hay que hacer, quién lo hace y para cuándo.", items: ["Asignación por usuario", "Vencidas, del día y próximas", "Cada uno ve solo lo suyo", "Marcado de presentadas"] },
  { ic: "alertas", t: "Alertas", d: "Centro de avisos con lo que está por vencer o ya venció, más notificaciones del sistema operativo.", items: ["Vencimientos DGI y BPS", "Certificados por vencer", "Aumentos de convenio", "Aviso de escritorio diario"] },
  { ic: "calendario", t: "Calendario", d: "El mes a la vista con los vencimientos reales de cada organismo, cliente por cliente.", items: ["DGI por último dígito de RUT", "Vencimientos BPS", "Salto directo a la ficha", "Cierre de mes"] },
  { ic: "tramites", t: "Trámites y certificados", d: "Seguimiento de lo que está en curso ante los organismos y de la vigencia de los certificados.", items: ["Certificados de crédito DGI", "Trámites abiertos por cliente", "Estado y vencimiento", "Enlaces a DGI, BPS y BSE"] },
  { ic: "salida", t: "Reportes y avisos", d: "Lo que sale del sistema hacia afuera: el PDF para el cliente y el mensaje que le llega.", items: ["Reporte PDF multi-empresa", "WhatsApp con el importe del mes", "Aviso de vencimiento", "Envío de recibos"] },
  { ic: "roles", t: "Roles y permisos", d: "No todos ven lo mismo. Honorarios, facturación, proveedores y pagos recibidos son solo del admin.", items: ["Administrador", "Secretaría", "Auxiliar", "Visibilidad por dato"] },
  { ic: "estudios", t: "Multi-estudio", d: "Un mismo Obligo, varios estudios. Cada uno con su marca, sus usuarios y sus clientes.", items: ["Datos totalmente separados", "Marca e ícono propios", "Usuarios aislados", "Configuración independiente"] },
];

const PRECARGA = [
  { t: "La normativa uruguaya", d: "Las reglas de cada régimen fiscal ya están escritas adentro: qué obligación le toca a cada tipo de contribuyente, ante qué organismo y con qué vencimiento." },
  { t: "Los valores del año", d: "BPC, UI, Salario Mínimo Nacional, IVA mínimo, IRAE mínimo, monotributo y los días de vencimiento vienen cargados y actualizados." },
  { t: "Los convenios de salarios", d: "Los Consejos de Salarios que le sirven al estudio vienen con sus porcentajes, sus fechas de vigencia, sus topes y sus fictos." },
  { t: "Y la carga inicial del estudio", d: "Antes de empezar cargamos los clientes con su régimen, sus datos de DGI, BPS, MTSS y BSE y sus empleados. El primer día ya está todo adentro." },
];

// Se muestran como consola de datos: son los valores vigentes 2026 que
// trae la configuración de fábrica.
const VALORES = [
  ["BPC", "$ 6.864"],
  ["Unidad Indexada", "$ 6,5720"],
  ["Salario Mínimo Nacional", "$ 24.572"],
  ["IVA mínimo · Literal E", "$ 5.910"],
  ["IRAE mínimo mensual", "$ 6.840"],
  ["Monotributo A / B", "$ 2.800 / 5.500"],
  ["Vencimiento DGI", "día 22"],
  ["Vencimiento BPS", "día 10"],
];

// Capturas de un estudio vacío. Ver la nota de privacidad de arriba.
const IMAGENES = [
  {
    src: "/shots/nuevo.png",
    t: "Alta de un cliente",
    d: "Se elige el tipo de entidad y el régimen de renta e IVA. Con eso alcanza: las obligaciones de cada mes se generan solas, no se cargan a mano.",
  },
  {
    src: "/shots/clientes.png",
    t: "Lista de clientes",
    d: "Cada cliente con su régimen, sus impuestos y sus tareas pendientes. Los chips de arriba filtran por impuesto y llevan el contador.",
  },
  {
    src: "/shots/calendario.png",
    t: "Calendario de vencimientos",
    d: "El mes con los vencimientos de DGI y BPS de todo el estudio. Lo del mes se paga al mes siguiente, y el calendario lo muestra así.",
  },
  {
    src: "/shots/config.png",
    t: "Valores del año, ya cargados",
    d: "BPC, UI, Salario Mínimo Nacional, IVA mínimo, IRAE mínimo y monotributo vienen puestos y actualizados. No hay que buscarlos.",
  },
];

const PASOS = [
  { n: "01", t: "Se carga la facturación", d: "Ventas, IVA de ventas, IVA de compras y retenciones. Una sola carga por cliente y por mes." },
  { n: "02", t: "Obligo arma el mes", d: "Calcula los anticipos, genera las obligaciones que corresponden y consolida el Boleto 2908." },
  { n: "03", t: "Se paga y se marca", d: "Cada obligación tiene dos marcas independientes: Pagado y Notificado. No hay flujo de estados." },
  { n: "04", t: "Se le avisa al cliente", d: "Mensaje de WhatsApp con el importe del mes o reporte PDF, desde el mismo sistema." },
];

const REGLAS = [
  "Boleto 2908 consolidado de DGI",
  "Vencimientos por último dígito de RUT",
  "Lo del mes se paga al mes siguiente",
  "IRAE mínimo e IVA mínimo vigentes",
  "BPC y Salario Mínimo Nacional del año",
  "Aportes BPS, FONASA/SNIS y FRL",
  "Prima por antigüedad y nocturnidad",
  "Convenios de Consejos de Salarios",
  "Certificados de crédito DGI",
  "Régimen de e-Factura",
];

// ─── Íconos ───────────────────────────────────────────────────────
// Línea de 1.5px, trazo redondeado, caja de 24 — como los 28 íconos
// del sistema. Se dibujan acá para no cargar ninguna librería.
const ICONOS = {
  engranaje: "M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6h.09A1.65 1.65 0 0010 3.09V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9v.09a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z",
  boleto: "M4 3h11l5 5v13H4z M15 3v5h5 M8 13h8 M8 17h5",
  panel: "M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z",
  clientes: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M22 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  calculo: "M5 2h14v20H5z M8 6h8 M8 11h2 M12 11h2 M16 11h2 M8 15h2 M12 15h2 M16 15v4 M8 19h6",
  sueldos: "M2 6h20v12H2z M12 15a3 3 0 100-6 3 3 0 000 6 M6 9v.01 M18 15v.01",
  convenio: "M3 20l5-6 4 3 5-8 4 5 M3 20h18",
  tareas: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  alertas: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 01-3.4 0",
  calendario: "M3 5h18v16H3z M3 10h18 M8 3v4 M16 3v4 M7.5 14h2 M14.5 14h2 M7.5 17.5h2 M14.5 17.5h2",
  tramites: "M14 2H6v20h12V8z M14 2v6h6 M9 13h6 M9 17h4",
  salida: "M4 4h16v12H4z M8 20h8 M12 16v4 M12 12V6 M9 9l3-3 3 3",
  roles: "M5 11h14v10H5z M8 11V7a4 4 0 018 0v4 M12 15v2",
  estudios: "M3 21h18 M5 21V7l7-4 7 4v14 M9 21v-5h6v5 M9 10h.01 M15 10h.01",
};

function Ico({ n, size = 22 }) {
  const d = ICONOS[n] || ICONOS.panel;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split(" M").map((seg, i) => <path key={i} d={(i ? "M" : "") + seg} />)}
    </svg>
  );
}

// ─── Componente ───────────────────────────────────────────────────

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = "Obligo · Gestión contable para estudios uruguayos";
    try {
      let l = document.querySelector("link[rel~='icon']");
      if (!l) { l = document.createElement("link"); l.rel = "icon"; document.head.appendChild(l); }
      l.type = "image/png";
      l.href = LOGO;
      document.documentElement.style.background = "#070C18";
    } catch (e) {}
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useReveal();
  const modsRef = useSpotlight();

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* ── Barra superior ── */}
      <header className={"lp-top" + (scrolled ? " on" : "")}>
        <a className="lp-brand" href="#top">
          <span className="lp-brand-tile"><img src={LOGO} alt="" /></span>
          <span className="lp-brand-tx">Obligo<b>.</b></span>
        </a>
        <nav className="lp-nav">
          <a href="#partes">Módulos</a>
          <a href="#precarga">Precarga</a>
          <a href="#pantallas">Pantallas</a>
          <a href="#mes">El mes</a>
        </nav>
        <span className="lp-top-tag">Uruguay · DGI · BPS</span>
      </header>

      {/* ── Hero ── */}
      <section className="lp-hero" id="top">
        <div className="lp-aurora" aria-hidden="true">
          <i className="a1" /><i className="a2" /><i className="a3" />
        </div>
        <div className="lp-mesh" aria-hidden="true" />

        <div className="lp-wrap lp-hero-in">
          <span className="lp-chip lp-rv">
            <i className="lp-dot" />
            Sistema de gestión para estudios contables
          </span>
          <h1 className="lp-rv" style={{ "--d": "60ms" }}>
            El estudio no se olvida de nada,<br />
            <em>porque Obligo lo tiene todo.</em>
          </h1>
          <p className="lp-lead lp-rv" style={{ "--d": "120ms" }}>
            Arma solo las obligaciones de cada cliente, calcula lo que hay que
            pagar cada mes, liquida los sueldos y avisa antes de que algo se
            venza. Y no arranca vacío: se entrega con la información ya cargada.
          </p>
          <div className="lp-cta lp-rv" style={{ "--d": "180ms" }}>
            <a className="lp-btn" href="#partes">Ver qué tiene<Flecha /></a>
            <a className="lp-btn lp-btn-2" href="#mes">Cómo funciona el mes</a>
          </div>

          <div className="lp-stage lp-rv" style={{ "--d": "260ms" }}>
            <div className="lp-glow" aria-hidden="true" />
            <figure className="lp-screen">
              <div className="lp-screen-bar"><i /><i /><i /><span>Panel Principal</span></div>
              <img src="/shots/panel.png" alt="Panel Principal de Obligo" />
            </figure>
            <div className="lp-float lp-float-a" aria-hidden="true">
              <span className="lp-float-k">Vence 22/08</span>
              <span className="lp-float-v">Boleto 2908</span>
            </div>
            <div className="lp-float lp-float-b" aria-hidden="true">
              <span className="lp-float-k">Nóminas</span>
              <span className="lp-float-v lp-ok">13 marcadas</span>
            </div>
          </div>
        </div>

        {/* cinta de impuestos */}
        <div className="lp-ticker" aria-hidden="true">
          <div className="lp-ticker-in">
            {[0, 1].map((r) => (
              <div className="lp-ticker-row" key={r}>
                {TICKER.map((t) => <span key={t}>{t}</span>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pilares ── */}
      <section className="lp-sec lp-sec-corta">
        <div className="lp-wrap">
          <div className="lp-pilares">
            {PILARES.map((p, i) => (
              <div className="lp-pilar lp-rv" key={p.t} style={{ "--d": i * 80 + "ms" }}>
                <span className="lp-k">{p.k}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Módulos ── */}
      <section className="lp-sec" id="partes">
        <div className="lp-wrap">
          <Titulo
            kicker="Las partes"
            h={<>Todo lo que hace un estudio,<br /><em>en un solo lugar</em></>}
            s="Catorce módulos que trabajan con los mismos datos: lo que se carga una vez sirve en todos."
          />
          <div className="lp-bento" ref={modsRef}>
            {MODULOS.map((m, i) => (
              <article
                className={"lp-mod lp-rv" + (m.destacado ? " big" : "")}
                key={m.t}
                style={{ "--d": Math.min(i, 6) * 50 + "ms" }}
              >
                <span className="lp-mod-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="lp-mod-ic"><Ico n={m.ic} size={m.destacado ? 26 : 22} /></span>
                <h3>{m.t}</h3>
                <p>{m.d}</p>
                <ul>{m.items.map((it) => <li key={it}><Tick />{it}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Precarga ── */}
      <section className="lp-sec lp-sec-line" id="precarga">
        <div className="lp-wrap">
          <Titulo
            kicker="Precarga"
            h={<>Obligo <em>no se entrega vacío</em></>}
            s="Llega con la normativa puesta y con la información del estudio ya cargada. El primer día se empieza a trabajar, no a cargar datos."
          />
          <div className="lp-pre">
            <div className="lp-pre-list">
              {PRECARGA.map((p, i) => (
                <div className="lp-pre-item lp-rv" key={p.t} style={{ "--d": i * 70 + "ms" }}>
                  <span className="lp-pre-n">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{p.t}</h3>
                    <p>{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <aside className="lp-console lp-rv" style={{ "--d": "120ms" }}>
              <div className="lp-console-top">
                <span className="lp-console-dot" />
                configuración de fábrica · 2026
              </div>
              <ul>
                {VALORES.map(([k, v]) => (
                  <li key={k}><span>{k}</span><i /><b>{v}</b></li>
                ))}
              </ul>
              <div className="lp-console-foot">
                convenios y reglas fiscales cargados<span className="lp-caret" />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Pantallas ── */}
      <section className="lp-sec" id="pantallas">
        <div className="lp-wrap">
          <Titulo
            kicker="Pantallas"
            h={<>Cómo se ve Obligo <em>por dentro</em></>}
            s="Las pantallas donde pasa el trabajo del mes."
          />
          <p className="lp-priv lp-rv">
            <Candado />
            Las pantallas se muestran sin datos. La información de los clientes
            de cada estudio es privada y no se publica.
          </p>
          <div className="lp-shots">
            {IMAGENES.map((im, i) => (
              <div className={"lp-row" + (i % 2 ? " inv" : "")} key={im.t}>
                <div className="lp-row-tx lp-rv">
                  <span className="lp-k">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{im.t}</h3>
                  <p>{im.d}</p>
                </div>
                <div className="lp-row-im lp-rv" style={{ "--d": "80ms" }}>
                  <figure className="lp-screen sm">
                    <div className="lp-screen-bar"><i /><i /><i /><span>{im.t}</span></div>
                    <img src={im.src} alt={im.t} loading="lazy" />
                  </figure>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── El mes ── */}
      <section className="lp-sec lp-sec-line" id="mes">
        <div className="lp-wrap">
          <Titulo
            kicker="El mes, de punta a punta"
            h={<>De la carga <em>al aviso al cliente</em></>}
            s="El recorrido completo son cuatro pasos y no sale del sistema."
          />
          <div className="lp-pasos">
            <span className="lp-rail" aria-hidden="true" />
            {PASOS.map((p, i) => (
              <div className="lp-paso lp-rv" key={p.n} style={{ "--d": i * 90 + "ms" }}>
                <span className="lp-nodo" aria-hidden="true" />
                <span className="lp-paso-n">{p.n}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Normativa ── */}
      <section className="lp-sec lp-sec-cierre">
        <div className="lp-halo" aria-hidden="true" />
        <div className="lp-wrap">
          <Titulo
            kicker="Normativa"
            h={<>Las reglas uruguayas <em>ya están adentro</em></>}
            s="No hay que explicarle a Obligo cómo se liquida en Uruguay."
          />
          <div className="lp-chips lp-rv">
            {REGLAS.map((r) => <span className="lp-tag" key={r}>{r}</span>)}
          </div>
        </div>
      </section>

      {/* ── Pie ── */}
      <footer className="lp-foot">
        <div className="lp-wrap lp-foot-in">
          <a className="lp-brand" href="#top">
            <span className="lp-brand-tile"><img src={LOGO} alt="" /></span>
            <span className="lp-brand-tx">Obligo<b>.</b></span>
          </a>
          <p>Gestión contable para estudios uruguayos · Montevideo, Uruguay</p>
          <p className="lp-foot-sm">Desarrollado por Laser Solutions</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Piezas ───────────────────────────────────────────────────────

function Titulo({ kicker, h, s }) {
  return (
    <div className="lp-tit lp-rv">
      <span className="lp-kicker"><i />{kicker}</span>
      <h2>{h}</h2>
      {s && <p>{s}</p>}
    </div>
  );
}

const Flecha = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h13M13 6l6 6-6 6" />
  </svg>
);

const Tick = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

const Candado = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 11h14v10H5zM8 11V7a4 4 0 018 0v4" />
  </svg>
);

// Aparición al entrar en pantalla.
// El contenido arranca VISIBLE y recién se esconde cuando este efecto
// enciende la clase rv-on, antes del primer pintado. Así, si el JS falla
// o el navegador no tiene IntersectionObserver, la página se ve entera
// igual en vez de quedar en blanco.
function useReveal() {
  useLayoutEffect(() => {
    const menos = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (menos || !("IntersectionObserver" in window)) return;
    const raiz = document.querySelector(".lp");
    if (raiz) raiz.classList.add("rv-on");
    const nodos = document.querySelectorAll(".lp-rv");
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    nodos.forEach((n) => io.observe(n));
    // Red de seguridad: si a los 2,5s el observador no reportó ni un solo
    // elemento, algo falló y se muestra todo. Nunca una página en blanco.
    const red = setTimeout(() => {
      if (!document.querySelector(".lp-rv.in")) nodos.forEach((n) => n.classList.add("in"));
    }, 2500);
    return () => { clearTimeout(red); io.disconnect(); };
  }, []);
}

// Luz que sigue al cursor sobre la grilla de módulos: un solo listener
// para las catorce tarjetas.
function useSpotlight() {
  const ref = useRef(null);
  useEffect(() => {
    const cont = ref.current;
    if (!cont || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mover = (e) => {
      const t = e.target.closest(".lp-mod");
      if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", (e.clientX - r.left) + "px");
      t.style.setProperty("--my", (e.clientY - r.top) + "px");
    };
    cont.addEventListener("pointermove", mover);
    return () => cont.removeEventListener("pointermove", mover);
  }, []);
  return ref;
}

// ─── Estilos ──────────────────────────────────────────────────────
// Los tokens replican tokens/brand.css + tokens/colors.css (variante
// oscura, marca laser) y tokens/typography.css del design system.
// OJO: esto vive dentro de un template literal — ningún comentario
// puede llevar comillas invertidas.
const CSS = `
.lp{
  --ink:#021942;
  --page:#0B1220; --deep:#070C18; --card:#131B2C; --raised:#1C2740;
  --blue:#2948D9; --blue-lit:#4463EC; --blue-tx:#8CA5FF; --blue-tint:#1B2450;
  --cyan:#8ECBDE; --violet:#7A6FA8;
  --green:#4FC98D; --amber:#E3AE55;
  --t1:#E8EBF3; --t2:#98A3B8; --t3:#5B6780;
  --line:#28324A; --line-soft:#1A2233;

  --fs-display:40px; --fs-h1:30px; --fs-h2:24px; --fs-h3:19px; --fs-h4:16px;
  --fs-body:14px; --fs-body-lg:15px; --fs-small:13px; --fs-caption:11px;
  --radius-sm:5px; --radius-md:8px; --radius-lg:12px; --radius-pill:999px;
  --ease:cubic-bezier(.2,0,.2,1);

  --f:"Poppins","Montserrat",system-ui,-apple-system,"Segoe UI",sans-serif;
  --m:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;

  font-family:var(--f);color:var(--t1);background:var(--deep);
  -webkit-font-smoothing:antialiased;overflow-x:hidden;
}
.lp *{box-sizing:border-box;}
.lp h1,.lp h2,.lp h3{margin:0;letter-spacing:-.02em;font-weight:600;line-height:1.16;}
.lp p{margin:0;}
.lp a{text-decoration:none;color:inherit;}
.lp em{font-style:normal;
  background:linear-gradient(100deg,var(--blue-tx) 0%,var(--cyan) 55%,#C9B8FF 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;}
.lp-wrap{width:100%;max-width:1140px;margin:0 auto;padding:0 40px;position:relative;z-index:2;}

/* aparición — sólo se esconde si el JS alcanzó a encender rv-on */
.lp.rv-on .lp-rv{opacity:0;transform:translateY(20px);}
.lp.rv-on .lp-rv.in{opacity:1;transform:none;
  transition:opacity .7s var(--ease) var(--d,0ms),transform .7s var(--ease) var(--d,0ms);}

/* ── barra ── */
.lp-top{position:sticky;top:0;z-index:60;display:flex;align-items:center;gap:32px;
  height:64px;padding:0 40px;transition:background .3s,border-color .3s,backdrop-filter .3s;
  border-bottom:1px solid transparent;}
.lp-top.on{background:rgba(11,18,32,.82);backdrop-filter:blur(14px) saturate(140%);
  border-bottom-color:var(--line-soft);}
.lp-brand{display:flex;align-items:center;gap:10px;}
.lp-brand-tile{width:32px;height:32px;border-radius:9px;background:#fff;flex:none;
  display:grid;place-items:center;box-shadow:0 0 0 1px rgba(255,255,255,.10),0 6px 18px rgba(41,72,217,.30);}
.lp-brand-tile img{width:24px;height:24px;display:block;}
.lp-brand-tx{font-size:18px;font-weight:700;letter-spacing:-.03em;color:var(--t1);}
.lp-brand-tx b{color:var(--blue-tx);}
.lp-nav{display:flex;gap:26px;margin-left:auto;font-size:var(--fs-body);
  font-weight:500;color:var(--t2);}
.lp-nav a{position:relative;padding:4px 0;transition:color .18s;}
.lp-nav a:after{content:"";position:absolute;left:0;right:100%;bottom:0;height:1px;
  background:var(--blue-tx);transition:right .25s var(--ease);}
.lp-nav a:hover{color:var(--t1);} .lp-nav a:hover:after{right:0;}
.lp-top-tag{font-family:var(--m);font-size:var(--fs-caption);letter-spacing:.08em;
  text-transform:uppercase;color:var(--t3);}

/* ── hero ── */
.lp-hero{position:relative;padding:96px 0 0;overflow:hidden;background:var(--deep);}
/* minmax(0,1fr) y no 1fr: con 1fr la columna nunca baja del min-content de su
   contenido y en pantallas angostas el titular ensancha toda la página */
.lp-hero-in{display:grid;grid-template-columns:minmax(0,1fr);justify-items:center;text-align:center;}
.lp-hero-in>*{max-width:100%;min-width:0;}
.lp-aurora{position:absolute;inset:-20% -20% auto;height:1100px;pointer-events:none;filter:blur(90px);opacity:.75;}
.lp-aurora i{position:absolute;display:block;border-radius:50%;}
.lp-aurora .a1{width:760px;height:620px;left:6%;top:-160px;
  background:radial-gradient(circle,rgba(41,72,217,.72),transparent 66%);animation:lpF1 22s ease-in-out infinite alternate;}
.lp-aurora .a2{width:620px;height:520px;right:2%;top:-60px;
  background:radial-gradient(circle,rgba(142,203,222,.34),transparent 66%);animation:lpF2 26s ease-in-out infinite alternate;}
.lp-aurora .a3{width:700px;height:520px;left:34%;top:340px;
  background:radial-gradient(circle,rgba(122,111,168,.40),transparent 68%);animation:lpF3 30s ease-in-out infinite alternate;}
@keyframes lpF1{to{transform:translate3d(90px,50px,0) scale(1.12);}}
@keyframes lpF2{to{transform:translate3d(-70px,70px,0) scale(1.08);}}
@keyframes lpF3{to{transform:translate3d(60px,-60px,0) scale(1.14);}}
.lp-mesh{position:absolute;inset:0;pointer-events:none;opacity:.5;
  background-image:linear-gradient(rgba(140,165,255,.075) 1px,transparent 1px),
    linear-gradient(90deg,rgba(140,165,255,.075) 1px,transparent 1px);
  background-size:64px 64px;
  -webkit-mask-image:radial-gradient(120% 80% at 50% 0%,#000 25%,transparent 72%);
  mask-image:radial-gradient(120% 80% at 50% 0%,#000 25%,transparent 72%);}

.lp-chip{display:inline-flex;align-items:center;gap:9px;padding:7px 16px 7px 12px;
  border-radius:var(--radius-pill);border:1px solid var(--line);background:rgba(255,255,255,.035);
  backdrop-filter:blur(6px);font-size:var(--fs-small);font-weight:500;color:var(--t2);}
.lp-dot{width:7px;height:7px;border-radius:50%;background:var(--green);flex:none;
  box-shadow:0 0 0 4px rgba(79,201,141,.16);animation:lpPulse 2.6s var(--ease) infinite;}
@keyframes lpPulse{50%{box-shadow:0 0 0 8px rgba(79,201,141,0);}}

.lp-hero h1{margin-top:26px;font-size:clamp(32px,4.9vw,62px);line-height:1.08;
  letter-spacing:-.035em;font-weight:600;max-width:min(24ch,100%);text-wrap:balance;}
.lp p.lp-lead{max-width:640px;margin:24px auto 0;font-size:17px;line-height:1.7;color:var(--t2);}
.lp-cta{display:flex;gap:12px;justify-content:center;margin-top:38px;flex-wrap:wrap;}

.lp-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;height:48px;
  padding:0 26px;border-radius:var(--radius-md);font-size:15px;font-weight:600;
  background:linear-gradient(180deg,var(--blue-lit),var(--blue));color:#fff;
  box-shadow:0 1px 0 rgba(255,255,255,.16) inset,0 12px 30px -8px rgba(41,72,217,.85);
  transition:transform .18s var(--ease),box-shadow .18s var(--ease),filter .18s;}
.lp-btn:hover{transform:translateY(-2px);filter:brightness(1.07);
  box-shadow:0 1px 0 rgba(255,255,255,.2) inset,0 18px 40px -10px rgba(41,72,217,.95);}
.lp-btn svg{transition:transform .2s var(--ease);}
.lp-btn:hover svg{transform:translateX(3px);}
.lp-btn-2{background:rgba(255,255,255,.045);color:var(--t1);
  border:1px solid var(--line);box-shadow:none;}
.lp-btn-2:hover{background:rgba(255,255,255,.08);border-color:#3A4560;box-shadow:none;filter:none;}

/* pantalla del hero */
.lp-stage{position:relative;width:100%;margin-top:72px;perspective:2000px;}
.lp-glow{position:absolute;left:50%;top:6%;width:78%;height:70%;transform:translateX(-50%);
  background:radial-gradient(closest-side,rgba(41,72,217,.62),transparent 72%);filter:blur(60px);}
.lp-screen{margin:0;position:relative;border-radius:var(--radius-lg);overflow:hidden;
  border:1px solid rgba(255,255,255,.10);background:var(--card);
  box-shadow:0 60px 120px -40px rgba(0,0,0,.9),0 0 0 1px rgba(140,165,255,.07),
    0 0 90px -20px rgba(41,72,217,.5);}
.lp-stage .lp-screen{transform:rotateX(7deg) scale(.99);transform-origin:50% 0;
  transition:transform .8s var(--ease);}
.lp-stage:hover .lp-screen{transform:rotateX(2deg) scale(1);}
.lp-screen-bar{display:flex;align-items:center;gap:7px;padding:0 14px;height:38px;
  background:linear-gradient(180deg,#1A2438,#141C2C);border-bottom:1px solid var(--line-soft);}
.lp-screen-bar i{width:9px;height:9px;border-radius:50%;background:#2E3950;}
.lp-screen-bar i:first-child{background:#3A4560;}
.lp-screen-bar span{margin-left:12px;font-family:var(--m);font-size:var(--fs-caption);
  letter-spacing:.06em;color:var(--t3);text-transform:uppercase;}
.lp-screen img{display:block;width:100%;height:auto;}

.lp-float{position:absolute;display:grid;gap:2px;padding:12px 16px;border-radius:var(--radius-md);
  background:rgba(19,27,44,.82);border:1px solid var(--line);backdrop-filter:blur(12px);
  box-shadow:0 20px 44px -14px rgba(0,0,0,.8);text-align:left;}
.lp-float-k{font-family:var(--m);font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:var(--t3);}
.lp-float-v{font-size:var(--fs-body);font-weight:600;color:var(--t1);}
.lp-float-v.lp-ok{color:var(--green);}
.lp-float-a{left:-76px;top:24%;animation:lpFloatA 7s ease-in-out infinite alternate;}
.lp-float-b{right:-64px;bottom:15%;animation:lpFloatB 8.5s ease-in-out infinite alternate;}
@keyframes lpFloatA{to{transform:translateY(-16px);}}
@keyframes lpFloatB{to{transform:translateY(14px);}}

/* cinta */
.lp-ticker{margin-top:88px;padding:18px 0;border-top:1px solid var(--line-soft);
  border-bottom:1px solid var(--line-soft);overflow:hidden;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);}
.lp-ticker-in{display:flex;width:max-content;animation:lpSlide 44s linear infinite;}
.lp-ticker-row{display:flex;gap:44px;padding-right:44px;}
.lp-ticker-row span{font-family:var(--m);font-size:var(--fs-small);letter-spacing:.04em;
  color:var(--t3);white-space:nowrap;}
@keyframes lpSlide{to{transform:translateX(-50%);}}

/* ── secciones ── */
.lp-sec{position:relative;padding:112px 0;}
.lp-sec-corta{padding-bottom:0;}
.lp-sec-line{border-top:1px solid var(--line-soft);border-bottom:1px solid var(--line-soft);
  background:var(--page);}
.lp-tit{max-width:760px;margin:0 auto 64px;text-align:center;}
.lp-kicker{display:inline-flex;align-items:center;gap:8px;font-family:var(--m);
  font-size:var(--fs-caption);font-weight:500;letter-spacing:.14em;text-transform:uppercase;
  color:var(--cyan);margin-bottom:18px;}
.lp-kicker i{width:22px;height:1px;background:linear-gradient(90deg,transparent,var(--cyan));}
.lp-tit h2{font-size:clamp(27px,3.6vw,44px);line-height:1.14;letter-spacing:-.03em;}
.lp-tit p{margin-top:18px;font-size:16px;line-height:1.7;color:var(--t2);
  max-width:600px;margin-left:auto;margin-right:auto;}

/* pilares */
.lp-pilares{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--line-soft);
  border:1px solid var(--line-soft);border-radius:var(--radius-lg);overflow:hidden;}
.lp-pilar{background:var(--deep);padding:38px 32px;}
.lp-k{display:block;font-family:var(--m);font-size:var(--fs-caption);letter-spacing:.14em;
  color:var(--blue-tx);margin-bottom:16px;}
.lp-pilar h3{font-size:var(--fs-h3);margin-bottom:12px;}
.lp-pilar p{font-size:var(--fs-body-lg);line-height:1.72;color:var(--t2);}

/* módulos — bento */
.lp-bento{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:16px;}
.lp-mod{position:relative;grid-column:span 2;padding:26px 24px 24px;border-radius:var(--radius-lg);
  border:1px solid var(--line-soft);background:linear-gradient(180deg,rgba(28,39,64,.5),rgba(19,27,44,.5));
  overflow:hidden;transition:border-color .25s,transform .25s var(--ease);}
.lp-mod:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;
  transition:opacity .3s;
  background:radial-gradient(340px circle at var(--mx,50%) var(--my,0%),rgba(68,99,236,.20),transparent 62%);}
.lp-mod:hover{border-color:#39456A;transform:translateY(-3px);}
.lp-mod:hover:before{opacity:1;}
.lp-mod.big{grid-column:span 3;padding:32px 30px 30px;
  background:linear-gradient(150deg,rgba(41,72,217,.16),rgba(19,27,44,.6) 52%),var(--card);
  border-color:#2E3A5C;}
.lp-mod-n{position:absolute;top:22px;right:22px;font-family:var(--m);font-size:var(--fs-caption);
  letter-spacing:.1em;color:var(--t3);}
.lp-mod-ic{display:grid;place-items:center;width:44px;height:44px;border-radius:var(--radius-md);
  background:rgba(68,99,236,.14);border:1px solid rgba(140,165,255,.18);color:var(--blue-tx);
  margin-bottom:18px;transition:color .25s,background .25s;}
.lp-mod.big .lp-mod-ic{width:50px;height:50px;background:rgba(142,203,222,.12);
  border-color:rgba(142,203,222,.24);color:var(--cyan);}
.lp-mod:hover .lp-mod-ic{background:rgba(68,99,236,.24);color:#B9C8FF;}
.lp-mod h3{font-size:var(--fs-h3);margin-bottom:10px;}
.lp-mod.big h3{font-size:var(--fs-h2);}
.lp-mod p{font-size:var(--fs-body);line-height:1.7;color:var(--t2);}
.lp-mod.big p{font-size:var(--fs-body-lg);}
.lp-mod ul{list-style:none;margin:18px 0 0;padding:16px 0 0;border-top:1px solid var(--line-soft);
  display:grid;gap:9px;}
.lp-mod li{display:flex;gap:9px;align-items:flex-start;font-size:var(--fs-small);
  line-height:1.5;color:var(--t2);}
.lp-mod li svg{flex:none;margin-top:2px;color:var(--green);opacity:.85;}

/* precarga */
.lp-pre{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:56px;align-items:start;}
.lp-pre-list{display:grid;gap:8px;}
.lp-pre-item{display:grid;grid-template-columns:auto 1fr;gap:20px;padding:22px 0;
  border-bottom:1px solid var(--line-soft);}
.lp-pre-item:last-child{border-bottom:none;}
.lp-pre-n{font-family:var(--m);font-size:var(--fs-small);color:var(--violet);padding-top:3px;}
.lp-pre-item h3{font-size:var(--fs-h4);margin-bottom:8px;}
.lp-pre-item p{font-size:var(--fs-body);line-height:1.72;color:var(--t2);}

.lp-console{border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--card);
  overflow:hidden;box-shadow:0 30px 70px -30px rgba(0,0,0,.85);position:sticky;top:96px;}
.lp-console-top{display:flex;align-items:center;gap:9px;padding:14px 20px;
  background:linear-gradient(180deg,#1A2438,#141C2C);border-bottom:1px solid var(--line-soft);
  font-family:var(--m);font-size:var(--fs-caption);letter-spacing:.06em;text-transform:uppercase;color:var(--t3);}
.lp-console-dot{width:7px;height:7px;border-radius:50%;background:var(--cyan);flex:none;
  box-shadow:0 0 10px var(--cyan);}
.lp-console ul{list-style:none;margin:0;padding:10px 20px;display:grid;}
.lp-console li{display:flex;align-items:baseline;gap:10px;padding:9px 0;font-family:var(--m);
  font-size:var(--fs-small);}
.lp-console li span{color:var(--t2);min-width:0;}
.lp-console li i{flex:1;border-bottom:1px dotted var(--line);transform:translateY(-3px);}
.lp-console li b{color:var(--t1);font-weight:500;white-space:nowrap;}
.lp-console-foot{padding:14px 20px;border-top:1px solid var(--line-soft);font-family:var(--m);
  font-size:var(--fs-caption);letter-spacing:.05em;color:var(--green);display:flex;align-items:center;gap:8px;}
.lp-caret{width:7px;height:13px;background:var(--green);animation:lpBlink 1.15s steps(2) infinite;}
@keyframes lpBlink{50%{opacity:0;}}

/* pantallas */
.lp p.lp-priv{display:flex;align-items:center;justify-content:center;gap:10px;max-width:660px;
  margin:-40px auto 64px;padding:13px 20px;border:1px dashed var(--line);border-radius:var(--radius-md);
  font-size:var(--fs-small);line-height:1.6;color:var(--t3);text-align:center;}
.lp p.lp-priv svg{flex:none;color:var(--cyan);opacity:.7;}
.lp-shots{display:grid;gap:96px;}
.lp-row{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);gap:56px;align-items:center;}
/* al invertir hay que invertir también los anchos, o la captura queda en la
   columna angosta y el texto en la ancha */
.lp-row.inv{grid-template-columns:minmax(0,1.18fr) minmax(0,.82fr);}
.lp-row.inv .lp-row-tx{order:2;}
.lp-row-tx h3{font-size:26px;margin-bottom:14px;}
.lp-row-tx p{font-size:var(--fs-body-lg);line-height:1.75;color:var(--t2);}
.lp-row-im{position:relative;}
.lp-row-im:before{content:"";position:absolute;inset:8% 6%;border-radius:50%;
  background:radial-gradient(closest-side,rgba(41,72,217,.4),transparent 72%);filter:blur(46px);}
.lp-screen.sm{transition:transform .5s var(--ease),box-shadow .5s var(--ease);}
.lp-row-im:hover .lp-screen.sm{transform:translateY(-5px);
  box-shadow:0 70px 120px -40px rgba(0,0,0,.95),0 0 0 1px rgba(140,165,255,.14),
    0 0 110px -20px rgba(41,72,217,.6);}

/* pasos */
.lp-pasos{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px;}
.lp-rail{position:absolute;left:0;right:0;top:6px;height:1px;
  background:linear-gradient(90deg,transparent,var(--blue) 12%,var(--cyan) 55%,var(--violet) 88%,transparent);
  opacity:.55;}
.lp-paso{padding-top:36px;position:relative;}
.lp-nodo{position:absolute;left:0;top:1px;width:11px;height:11px;border-radius:50%;
  background:var(--blue-lit);box-shadow:0 0 0 4px rgba(68,99,236,.16),0 0 16px rgba(68,99,236,.9);}
.lp-paso-n{display:block;font-family:var(--m);font-size:var(--fs-caption);letter-spacing:.14em;
  color:var(--blue-tx);margin-bottom:12px;}
.lp-paso h3{font-size:var(--fs-h4);margin-bottom:10px;}
.lp-paso p{font-size:var(--fs-body);line-height:1.7;color:var(--t2);}

/* cierre */
.lp-sec-cierre{overflow:hidden;}
.lp-halo{position:absolute;left:50%;top:-30%;width:900px;height:700px;transform:translateX(-50%);
  background:radial-gradient(closest-side,rgba(41,72,217,.28),transparent 70%);filter:blur(70px);}
.lp-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;}
.lp-tag{padding:10px 18px;border-radius:var(--radius-pill);border:1px solid var(--line);
  background:rgba(255,255,255,.03);font-size:var(--fs-body);color:var(--t2);
  transition:border-color .2s,color .2s,background .2s;}
.lp-tag:hover{border-color:rgba(140,165,255,.4);color:var(--t1);background:rgba(68,99,236,.1);}

/* pie */
.lp-foot{border-top:1px solid var(--line-soft);padding:56px 0;background:var(--page);}
.lp-foot-in{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;}
.lp-foot p{font-size:var(--fs-small);color:var(--t2);}
.lp-foot-sm{font-family:var(--m);font-size:var(--fs-caption);letter-spacing:.06em;
  text-transform:uppercase;color:var(--t3);}

/* ── responsive ── */
@media(max-width:1080px){
  .lp-bento{grid-template-columns:repeat(4,minmax(0,1fr));}
  .lp-mod,.lp-mod.big{grid-column:span 2;}
  .lp-pre{grid-template-columns:minmax(0,1fr);gap:40px;}
  .lp-console{position:static;}
  .lp-float{display:none;}
}
@media(max-width:820px){
  .lp-wrap{padding:0 22px;}
  .lp-hero h1{font-size:clamp(29px,7.6vw,40px);}
  .lp p.lp-lead{font-size:15.5px;}
  .lp-btn{width:100%;}
  .lp-cta{width:100%;}
  .lp-console li{font-size:12px;gap:8px;}
  .lp-top{padding:0 22px;gap:16px;}
  .lp-nav,.lp-top-tag{display:none;}
  .lp-sec{padding:76px 0;}
  .lp-hero{padding-top:56px;}
  .lp-pilares,.lp-bento,.lp-pasos{grid-template-columns:minmax(0,1fr);}
  .lp-mod,.lp-mod.big{grid-column:span 1;}
  .lp-rail{display:none;}
  .lp-paso{padding-top:0;padding-left:24px;}
  .lp-nodo{top:6px;}
  .lp-row,.lp-row.inv{grid-template-columns:minmax(0,1fr);gap:26px;}
  .lp-row.inv .lp-row-tx{order:0;}
  .lp-shots{gap:60px;}
  .lp-tit{margin-bottom:44px;}
  .lp p.lp-priv{margin-top:-24px;}
  .lp-ticker{margin-top:56px;}
}
@media(prefers-reduced-motion:reduce){
  .lp *,.lp *:before,.lp *:after{animation:none!important;transition:none!important;}
  .lp.rv-on .lp-rv{opacity:1;transform:none;}
}
`;
