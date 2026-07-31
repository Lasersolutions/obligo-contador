// ─── LANDING OFICIAL DE OBLIGO ─────────────────────────────────────
// Vive en https://obligo.lasersolutions.com.uy (la "puerta general").
// No es la app: es la página de producto. Muestra qué partes tiene
// Obligo, imágenes clave de cada una, y desde acá se entra a los
// estudios, que viven cada uno en su propio subdominio.
//
// Para verla en local: http://localhost:5173/?landing
// Para saltearla y ver la app en ese mismo host: /?app
import { useEffect } from "react";

const ACCESOS = [
  {
    id: "vc",
    estudio: "Estudio Valeria Calvette",
    bajada: "Estudio impositivo y contable",
    url: "https://obligo-vcestudio.lasersolutions.com.uy",
    color: "#14294F",
    accent: "#C8A44D",
  },
  {
    id: "laser",
    estudio: "Laser Solutions",
    bajada: "Gestión contable",
    url: "https://obligo-laser.lasersolutions.com.uy",
    color: "#021942",
    accent: "#8ECBDE",
  },
];

// Cada estudio entra por su propio subdominio: un usuario de un estudio
// no puede entrar por la puerta del otro.
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

const PILARES = [
  {
    t: "Las obligaciones no se cargan a mano",
    d: "Se cargan el régimen fiscal y los datos del cliente una vez. Obligo deduce solas las obligaciones de cada mes: IVA, IRAE, Patrimonio, IRPF, BPS, e-Factura. Si cambia el régimen, cambian las obligaciones.",
  },
  {
    t: "Un solo número para el mes",
    d: "El Boleto 2908 consolida en un solo importe todo lo que el cliente le paga a DGI en el mes. Sale de una sola carga —la facturación— y alimenta la lista de obligaciones, el boleto y el aviso al cliente.",
  },
  {
    t: "Nada se vence sin aviso",
    d: "Calendario, alertas y campana de avisos ordenados por fecha de vencimiento real: lo del mes se paga al mes siguiente, y Obligo lo muestra así.",
  },
];

const MODULOS = [
  {
    ic: "📊",
    t: "Panel Principal",
    d: "La foto del mes: qué vence, qué está pago, qué falta notificar, facturación y honorarios del estudio.",
    items: ["Próximos vencimientos", "Estado del mes por cliente", "Facturación y honorarios (solo admin)", "Accesos rápidos a organismos"],
  },
  {
    ic: "👥",
    t: "Clientes",
    d: "La ficha completa de cada contribuyente, con todo lo que el estudio necesita tener a mano.",
    items: ["RUT, BPS, MTSS, BSE, naturaleza y tipo de entidad", "Impuestos y régimen de renta", "Credenciales de organismos", "Filtro por impuesto con contadores"],
  },
  {
    ic: "⚙️",
    t: "Motor de obligaciones",
    d: "El corazón del sistema. Genera mes a mes las obligaciones que le corresponden a cada cliente según su régimen.",
    items: ["Por régimen de renta e IVA", "Por tipo de entidad y naturaleza", "DJ IVA anual con ventana temporal", "e-Factura y regímenes especiales"],
  },
  {
    ic: "🧾",
    t: "Boleto 2908",
    d: "El consolidado de DGI del mes: IVA, IRAE, IRPF, Patrimonio e ICOSA en un único importe a pagar.",
    items: ["Se calcula de una sola carga mensual", "Detalle línea por línea", "Marcas de Pagado y Notificado", "BPS va aparte, como en la realidad"],
  },
  {
    ic: "🧮",
    t: "Cálculo del mes",
    d: "Los anticipos calculados con las fórmulas reales de la planilla del estudio, sin salir del sistema.",
    items: ["IVA a pagar con excedente arrastrado", "IRAE por coeficiente y mínimo legal", "Impuesto al Patrimonio", "Retenciones de tarjetas"],
  },
  {
    ic: "💵",
    t: "Sueldos",
    d: "Liquidación mensual completa y recibo de sueldo con el formato oficial en uso, listo para imprimir.",
    items: ["Antigüedad, nocturnidad, faltas y adelantos", "Aportes BPS, FONASA/SNIS, FRL e IRPF", "Recibo PDF en dos ejemplares por hoja", "Nóminas que bloquean el pago de BPS"],
  },
  {
    ic: "📈",
    t: "Convenios de salarios",
    d: "Los ajustes de los Consejos de Salarios precargados, con vigencia. Los meses ya liquidados no se tocan.",
    items: ["Grupo 15 — residenciales", "Grupo 1/12 — fábricas de pastas", "Aumentos con fecha de vigencia", "Topes, fictos y prima por antigüedad"],
  },
  {
    ic: "✅",
    t: "Tareas",
    d: "El trabajo del estudio, no del cliente: lo que hay que hacer, quién lo hace y para cuándo.",
    items: ["Asignación por usuario", "Vencidas, del día y próximas", "Cada usuario ve solo lo suyo", "Marcado de presentadas"],
  },
  {
    ic: "🔔",
    t: "Alertas",
    d: "Centro de avisos con lo que está por vencer o ya venció, más notificaciones del sistema operativo.",
    items: ["Vencimientos DGI y BPS", "Certificados por vencer", "Aumentos de convenio pendientes", "Aviso de escritorio una vez por día"],
  },
  {
    ic: "📅",
    t: "Calendario",
    d: "El mes a la vista con los vencimientos reales de cada organismo, cliente por cliente.",
    items: ["Vencimientos DGI por último dígito de RUT", "Vencimientos BPS", "Salto directo a la ficha del cliente", "Cierre de mes"],
  },
  {
    ic: "📄",
    t: "Trámites y certificados",
    d: "Seguimiento de lo que está en curso ante los organismos y de la vigencia de los certificados.",
    items: ["Certificados de crédito DGI", "Trámites abiertos por cliente", "Estado y fecha de vencimiento", "Enlaces directos a DGI, BPS y BSE"],
  },
  {
    ic: "📤",
    t: "Reportes y avisos al cliente",
    d: "Lo que sale del sistema hacia afuera: el PDF para el cliente y el mensaje que le llega.",
    items: ["Reporte PDF multi-empresa", "Mensaje de WhatsApp con el importe del mes", "Aviso de vencimiento", "Envío de recibos"],
  },
  {
    ic: "🔐",
    t: "Roles y permisos",
    d: "No todos ven lo mismo. Honorarios, facturación, proveedores y pagos recibidos son solo del admin.",
    items: ["Administrador", "Secretaría", "Auxiliar", "Visibilidad por dato del cliente"],
  },
  {
    ic: "🏢",
    t: "Multi-estudio",
    d: "Un mismo Obligo, varios estudios. Cada uno con su marca, sus usuarios, sus clientes y su subdominio.",
    items: ["Datos totalmente separados", "Marca e ícono propios", "Usuarios aislados por subdominio", "Configuración independiente"],
  },
];

// Las imágenes viven en /public/shots. Si todavía no está capturada,
// el marco muestra el detalle en texto y la página no se rompe.
// El Panel Principal ya se ve en el hero, así que el recorrido arranca
// en Clientes y sigue el orden en que se trabaja el mes.
const IMAGENES = [
  {
    src: "/shots/clientes.png",
    t: "Lista de clientes",
    d: "Los clientes del estudio con su régimen, filtrables por impuesto y con el estado del mes a la vista.",
  },
  {
    src: "/shots/ficha.png",
    t: "Obligaciones del mes",
    d: "Cada cliente con lo que le toca ese período, generado por el motor de reglas. Dos marcas independientes: pagado y notificado.",
  },
  {
    src: "/shots/tributario.png",
    t: "Cálculo del mes y Boleto 2908",
    d: "Se carga la facturación y el resto se calcula solo: IVA, IRAE, Patrimonio y el total a pagar a DGI, con el desglose del boleto.",
  },
  {
    src: "/shots/sueldos.png",
    t: "Liquidación de sueldos",
    d: "Antigüedad, nocturnidad, faltas, aportes y líquido de cada empleado. El recibo PDF sale con el formato oficial.",
  },
  {
    src: "/shots/calendario.png",
    t: "Calendario de vencimientos",
    d: "El mes con los vencimientos reales de DGI y BPS de todos los clientes del estudio.",
  },
];

const PASOS = [
  { n: "1", t: "Se carga la facturación del mes", d: "Ventas, IVA de ventas, IVA de compras y retenciones. Una sola carga por cliente." },
  { n: "2", t: "Obligo arma el mes", d: "Calcula los anticipos, genera las obligaciones que corresponden y consolida el Boleto 2908." },
  { n: "3", t: "Se paga y se marca", d: "Cada obligación tiene dos marcas independientes: Pagado y Notificado." },
  { n: "4", t: "Se le avisa al cliente", d: "Mensaje de WhatsApp con el importe del mes o reporte PDF, desde el mismo sistema." },
];

const REGLAS = [
  "Boleto 2908 consolidado de DGI",
  "Vencimientos por último dígito de RUT",
  "Lo del mes se paga al mes siguiente",
  "IRAE mínimo y IVA mínimo vigentes",
  "BPC y Salario Mínimo Nacional del año",
  "Aportes BPS, FONASA/SNIS y FRL",
  "Prima por antigüedad y nocturnidad",
  "Convenios de Consejos de Salarios",
  "Certificados de crédito DGI",
  "e-Factura",
];

// ─── Componente ───────────────────────────────────────────────────

export default function Landing() {
  useEffect(() => {
    document.title = "Obligo · Gestión contable para estudios uruguayos";
    try {
      let l = document.querySelector("link[rel~='icon']");
      if (!l) { l = document.createElement("link"); l.rel = "icon"; document.head.appendChild(l); }
      l.type = "image/png";
      l.href = "/icon-192.png";
    } catch (e) {}
  }, []);

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* ── Barra superior ── */}
      <header className="lp-top">
        <a className="lp-brand" href="#top">
          <img src="/icon-192.png" alt="" />
          <span>Obligo<b>.</b></span>
        </a>
        <nav className="lp-nav">
          <a href="#modulos">Módulos</a>
          <a href="#imagenes">Pantallas</a>
          <a href="#como">Cómo funciona</a>
          <a href="#accesos">Accesos</a>
        </nav>
        <a className="lp-btn lp-btn-sm" href="#accesos">Ingresar</a>
      </header>

      {/* ── Hero ── */}
      <section className="lp-hero" id="top">
        <div className="lp-wrap">
          <span className="lp-tag">Sistema de gestión para estudios contables · Uruguay</span>
          <h1>El estudio no se olvida de nada,<br />porque Obligo lo tiene todo.</h1>
          <p className="lp-lead">
            Obligo arma solo las obligaciones de cada cliente, calcula lo que hay
            que pagar cada mes, liquida los sueldos y avisa antes de que algo se
            venza. Pensado para la normativa uruguaya: DGI, BPS, MTSS y BSE.
          </p>
          <div className="lp-cta">
            <a className="lp-btn" href="#accesos">Entrar a mi estudio</a>
            <a className="lp-btn lp-btn-ghost" href="#modulos">Ver qué tiene</a>
          </div>
          <Shot src="/shots/panel.png" alt="Panel Principal de Obligo" big />
        </div>
      </section>

      {/* ── Pilares ── */}
      <section className="lp-sec lp-sec-alt">
        <div className="lp-wrap">
          <div className="lp-grid3">
            {PILARES.map((p) => (
              <div className="lp-pilar" key={p.t}>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Módulos ── */}
      <section className="lp-sec" id="modulos">
        <div className="lp-wrap">
          <Titulo
            kicker="Las partes"
            h="Todo lo que hace un estudio, en un solo lugar"
            s="Catorce módulos que trabajan con los mismos datos: lo que se carga una vez sirve en todos."
          />
          <div className="lp-mods">
            {MODULOS.map((m) => (
              <article className="lp-mod" key={m.t}>
                <div className="lp-mod-ic">{m.ic}</div>
                <h3>{m.t}</h3>
                <p>{m.d}</p>
                <ul>{m.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Imágenes clave ── */}
      <section className="lp-sec lp-sec-alt" id="imagenes">
        <div className="lp-wrap">
          <Titulo
            kicker="Pantallas"
            h="Cómo se ve Obligo por dentro"
            s="Las pantallas donde pasa el trabajo del mes."
          />
          <div className="lp-shots">
            {IMAGENES.map((im, i) => (
              <div className={"lp-shot-row" + (i % 2 ? " lp-inv" : "")} key={im.t}>
                <div className="lp-shot-txt">
                  <span className="lp-num">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{im.t}</h3>
                  <p>{im.d}</p>
                </div>
                <div className="lp-shot-img">
                  <Shot src={im.src} alt={im.t} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="lp-sec" id="como">
        <div className="lp-wrap">
          <Titulo
            kicker="El mes, de punta a punta"
            h="De la carga al aviso al cliente"
            s="El recorrido completo son cuatro pasos y no sale del sistema."
          />
          <div className="lp-pasos">
            {PASOS.map((p) => (
              <div className="lp-paso" key={p.n}>
                <span className="lp-paso-n">{p.n}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reglas uruguayas ── */}
      <section className="lp-sec lp-sec-dark">
        <div className="lp-wrap">
          <Titulo
            dark
            kicker="Normativa"
            h="Las reglas uruguayas ya están adentro"
            s="No hay que explicarle a Obligo cómo se liquida en Uruguay."
          />
          <div className="lp-chips">
            {REGLAS.map((r) => <span className="lp-chip" key={r}>{r}</span>)}
          </div>
        </div>
      </section>

      {/* ── Accesos ── */}
      <section className="lp-sec" id="accesos">
        <div className="lp-wrap">
          <Titulo
            kicker="Accesos"
            h="Entrá al estudio que te corresponde"
            s="Cada estudio tiene su propia dirección, sus usuarios y sus datos. Un usuario de un estudio no entra por la puerta del otro."
          />
          <div className="lp-accesos">
            {ACCESOS.map((a) => (
              <a className="lp-acceso" key={a.id} href={a.url} style={{ "--c": a.color, "--a": a.accent }}>
                <div className="lp-acceso-bar" />
                <h3>{a.estudio}</h3>
                <p>{a.bajada}</p>
                <span className="lp-acceso-url">{a.url.replace("https://", "")}</span>
                <span className="lp-acceso-go">Ingresar →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pie ── */}
      <footer className="lp-foot">
        <div className="lp-wrap lp-foot-in">
          <div className="lp-brand">
            <img src="/icon-192.png" alt="" />
            <span>Obligo<b>.</b></span>
          </div>
          <p>Gestión contable para estudios uruguayos · Montevideo, Uruguay</p>
          <p className="lp-foot-sm">Desarrollado por Laser Solutions</p>
        </div>
      </footer>
    </div>
  );
}

function Titulo({ kicker, h, s, dark }) {
  return (
    <div className={"lp-tit" + (dark ? " lp-tit-dark" : "")}>
      <span className="lp-kicker">{kicker}</span>
      <h2>{h}</h2>
      {s && <p>{s}</p>}
    </div>
  );
}

// Marco de pantalla. Si la captura todavía no existe, en lugar de un
// ícono roto se ve un marco vacío con el nombre de la pantalla.
function Shot({ src, alt, big }) {
  return (
    <figure className={"lp-frame" + (big ? " lp-frame-big" : "")}>
      <div className="lp-frame-bar"><i /><i /><i /></div>
      <div className="lp-frame-body">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const ph = e.currentTarget.nextElementSibling;
            if (ph) ph.style.display = "flex";
          }}
        />
        <div className="lp-ph" style={{ display: "none" }}>{alt}</div>
      </div>
    </figure>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────
const CSS = `
.lp{--ink:#1B2A4A;--blue:#2948D9;--acc:#8ECBDE;--vio:#7A6FA8;--ok:#2D9C6B;
  --line:#E3E8F2;--soft:#F5F7FC;--muted:#5C6B8A;
  font-family:Poppins,Inter,'Segoe UI',system-ui,sans-serif;color:var(--ink);
  background:#fff;-webkit-font-smoothing:antialiased;}
.lp *{box-sizing:border-box;}
.lp h1,.lp h2,.lp h3{margin:0;line-height:1.18;letter-spacing:-.02em;}
.lp p{margin:0;}
.lp a{text-decoration:none;color:inherit;}
.lp-wrap{width:100%;max-width:1140px;margin:0 auto;padding:0 24px;}

/* barra superior */
.lp-top{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:24px;
  padding:12px 24px;background:#ffffffee;backdrop-filter:blur(10px);
  border-bottom:1px solid var(--line);}
.lp-brand{display:flex;align-items:center;gap:9px;font-weight:700;font-size:19px;letter-spacing:-.03em;}
.lp-brand img{width:30px;height:30px;border-radius:8px;}
.lp-brand b{color:var(--blue);}
.lp-nav{display:flex;gap:22px;margin-left:auto;font-size:14px;color:var(--muted);font-weight:500;}
.lp-nav a:hover{color:var(--blue);}

/* botones */
.lp-btn{display:inline-flex;align-items:center;justify-content:center;
  background:var(--blue);color:#fff;border-radius:10px;padding:13px 24px;
  font-size:15px;font-weight:600;box-shadow:0 6px 18px #2948d940;transition:.15s;}
.lp-btn:hover{background:#1E37A8;transform:translateY(-1px);}
.lp-btn-sm{padding:9px 17px;font-size:14px;}
.lp-btn-ghost{background:transparent;color:var(--ink);border:1px solid var(--line);box-shadow:none;}
.lp-btn-ghost:hover{background:var(--soft);color:var(--ink);}

/* hero */
.lp-hero{padding:72px 0 0;text-align:center;
  background:radial-gradient(1100px 480px at 50% -140px,#E8EDFB 0%,#fff 70%);}
.lp-tag{display:inline-block;background:#fff;border:1px solid var(--line);border-radius:999px;
  padding:6px 15px;font-size:12.5px;font-weight:600;color:var(--muted);margin-bottom:22px;}
.lp-hero h1{font-size:clamp(30px,4.6vw,54px);font-weight:700;}
.lp-lead{max-width:660px;margin:20px auto 0;font-size:17px;line-height:1.65;color:var(--muted);}
.lp-cta{display:flex;gap:12px;justify-content:center;margin:30px 0 54px;flex-wrap:wrap;}

/* secciones */
.lp-sec{padding:88px 0;}
.lp-sec-alt{background:var(--soft);}
.lp-sec-dark{background:linear-gradient(160deg,#0F1B33 0%,#1B2A4A 60%,#22376B 100%);color:#fff;}
.lp-tit{max-width:720px;margin:0 auto 48px;text-align:center;}
.lp-kicker{display:block;font-size:12.5px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--blue);margin-bottom:12px;}
.lp-tit h2{font-size:clamp(25px,3.2vw,38px);font-weight:700;}
.lp-tit p{margin-top:14px;font-size:16px;line-height:1.65;color:var(--muted);}
.lp-tit-dark .lp-kicker{color:var(--acc);}
.lp-tit-dark p{color:#B9C6E0;}

/* pilares */
.lp-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;}
.lp-pilar{background:#fff;border:1px solid var(--line);border-radius:14px;padding:28px 24px;}
.lp-pilar h3{font-size:18px;font-weight:600;margin-bottom:10px;}
.lp-pilar p{font-size:14.5px;line-height:1.65;color:var(--muted);}

/* módulos */
.lp-mods{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.lp-mod{border:1px solid var(--line);border-radius:14px;padding:24px 22px;background:#fff;transition:.15s;}
.lp-mod:hover{border-color:#C3CEEA;box-shadow:0 10px 30px #1b2a4a12;transform:translateY(-2px);}
.lp-mod-ic{width:42px;height:42px;border-radius:11px;background:var(--soft);
  display:flex;align-items:center;justify-content:center;font-size:21px;margin-bottom:14px;}
.lp-mod h3{font-size:17px;font-weight:600;margin-bottom:8px;}
.lp-mod p{font-size:14px;line-height:1.6;color:var(--muted);}
.lp-mod ul{margin:14px 0 0;padding:0;list-style:none;border-top:1px solid var(--line);padding-top:12px;}
.lp-mod li{font-size:13px;line-height:1.5;color:var(--muted);padding-left:16px;position:relative;margin-bottom:6px;}
.lp-mod li:before{content:"";position:absolute;left:0;top:7px;width:6px;height:6px;
  border-radius:50%;background:var(--acc);}

/* pantallas */
.lp-shots{display:flex;flex-direction:column;gap:64px;}
.lp-shot-row{display:grid;grid-template-columns:.85fr 1.15fr;gap:44px;align-items:center;}
.lp-shot-row.lp-inv .lp-shot-txt{order:2;}
.lp-num{display:block;font-size:13px;font-weight:700;color:var(--blue);letter-spacing:.1em;margin-bottom:10px;}
.lp-shot-txt h3{font-size:24px;font-weight:600;margin-bottom:12px;}
.lp-shot-txt p{font-size:15.5px;line-height:1.65;color:var(--muted);}

/* marco de pantalla */
.lp-frame{margin:0;border:1px solid var(--line);border-radius:14px;overflow:hidden;
  background:#fff;box-shadow:0 18px 50px #1b2a4a1f;}
.lp-frame-big{max-width:960px;margin:0 auto;}
.lp-frame-bar{display:flex;gap:6px;align-items:center;padding:10px 14px;
  background:#F0F3FA;border-bottom:1px solid var(--line);}
.lp-frame-bar i{width:9px;height:9px;border-radius:50%;background:#CBD5E8;}
.lp-frame-body{position:relative;background:#EEF0F6;}
.lp-frame-body img{display:block;width:100%;height:auto;}
.lp-ph{display:none;align-items:center;justify-content:center;min-height:260px;
  font-size:14px;font-weight:600;color:#93A0BC;letter-spacing:.02em;}

/* pasos */
.lp-pasos{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
.lp-paso{border-top:2px solid var(--line);padding-top:20px;}
.lp-paso-n{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;
  border-radius:50%;background:var(--blue);color:#fff;font-size:14px;font-weight:700;margin-bottom:14px;}
.lp-paso h3{font-size:16.5px;font-weight:600;margin-bottom:8px;}
.lp-paso p{font-size:14px;line-height:1.6;color:var(--muted);}

/* chips normativa */
.lp-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;}
.lp-chip{border:1px solid #ffffff2e;background:#ffffff12;border-radius:999px;
  padding:9px 17px;font-size:14px;font-weight:500;color:#DCE5F7;}

/* accesos */
.lp-accesos{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;max-width:820px;margin:0 auto;}
.lp-acceso{position:relative;border:1px solid var(--line);border-radius:16px;padding:32px 28px 26px;
  background:#fff;overflow:hidden;transition:.15s;display:block;}
.lp-acceso:hover{box-shadow:0 14px 40px #1b2a4a1f;transform:translateY(-2px);border-color:#C3CEEA;}
.lp-acceso-bar{position:absolute;top:0;left:0;right:0;height:4px;
  background:linear-gradient(90deg,var(--c),var(--a));}
.lp-acceso h3{font-size:20px;font-weight:600;color:var(--c);}
.lp-acceso p{font-size:14px;color:var(--muted);margin-top:6px;}
.lp-acceso-url{display:block;margin-top:18px;font-size:12.5px;color:#93A0BC;
  font-family:ui-monospace,Menlo,Consolas,monospace;word-break:break-all;}
.lp-acceso-go{display:inline-block;margin-top:16px;font-size:14.5px;font-weight:600;color:var(--blue);}

/* pie */
.lp-foot{border-top:1px solid var(--line);padding:44px 0;background:var(--soft);}
.lp-foot-in{text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;}
.lp-foot p{font-size:13.5px;color:var(--muted);}
.lp-foot-sm{font-size:12.5px;color:#93A0BC;}

/* responsive */
@media(max-width:980px){
  .lp-mods{grid-template-columns:repeat(2,1fr);}
  .lp-pasos{grid-template-columns:repeat(2,1fr);}
}
@media(max-width:760px){
  .lp-nav{display:none;}
  .lp-sec{padding:60px 0;}
  .lp-hero{padding-top:48px;}
  .lp-grid3,.lp-mods,.lp-accesos{grid-template-columns:1fr;}
  .lp-shot-row{grid-template-columns:1fr;gap:22px;}
  .lp-shot-row.lp-inv .lp-shot-txt{order:0;}
  .lp-shots{gap:44px;}
}
`;
