// ─── LECTORES DE DOCUMENTOS ────────────────────────────────────────
// Todo se procesa acá adentro, en el navegador: los certificados y los
// reportes de DGI nunca salen de la máquina del estudio.
//
// Tres lectores:
//   1. Certificados y constancias (DGI 6906, DGI 6951, BPS Datos
//      Registrales, BPS Planilla de Trabajo Unificada) → datos de la ficha.
//   2. Cotizaciones del BCU (el Excel que se baja de su página).
//   3. Comprobantes recibidos de DGI → totales en pesos para liquidar IVA,
//      pasando lo que está en moneda extranjera al tipo de cambio del día
//      hábil anterior, como corresponde.

// ─── UTILIDADES ───────────────────────────────────────────────────

// "1.234,56" y "1234.56" son el mismo número escrito de dos formas.
export function num(v) {
  if (typeof v === "number") return isFinite(v) ? v : 0;
  let s = String(v == null ? "" : v).trim();
  if (!s) return 0;
  s = s.replace(/[^\d,.\-]/g, "");
  const coma = s.lastIndexOf(","), punto = s.lastIndexOf(".");
  if (coma > -1 && punto > -1) {
    // el separador decimal es el que está más a la derecha
    if (coma > punto) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (coma > -1) {
    // Convención uruguaya: la coma es el decimal. Sólo es de miles si hay
    // más de una (1,234,567). El BCU publica el dólar con cuatro decimales
    // (40,2030): tratarla como separador de miles daría 402.030.
    s = s.split(",").length > 2 ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if (punto > -1 && s.split(".").length > 2) {
    // varios puntos: son de miles (1.234.567)
    s = s.replace(/\./g, "");
  }
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// Fechas: acepta DD/MM/AAAA, AAAA-MM-DD y el serial de Excel. Devuelve ISO.
export function fechaISO(v) {
  if (v == null || v === "") return "";
  if (v instanceof Date && !isNaN(v)) {
    return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, "0")}-${String(v.getDate()).padStart(2, "0")}`;
  }
  if (typeof v === "number" && v > 20000 && v < 80000) {
    // serial de Excel: días desde el 30/12/1899
    const d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (m) {
    let a = m[3];
    if (a.length === 2) a = (+a > 70 ? "19" : "20") + a;
    return `${a}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return "";
}

export const isoAUy = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

// ─── PDF → TEXTO ──────────────────────────────────────────────────
// pdf.js devuelve los fragmentos en el orden en que están dibujados, que no
// es el orden de lectura. Se los agrupa por renglón (coordenada Y) y dentro
// de cada renglón se ordenan de izquierda a derecha; recién ahí el texto
// coincide con lo que se ve en el papel.
let _pdfjs = null;
async function cargarPdfjs() {
  if (_pdfjs) return _pdfjs;
  const lib = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  lib.GlobalWorkerOptions.workerSrc = worker.default;
  _pdfjs = lib;
  return lib;
}

export function lineasDeItems(items) {
  const puestos = items
    .filter((it) => it.str && it.str.trim())
    .map((it) => ({ x: it.transform[4], y: it.transform[5], s: it.str }));
  puestos.sort((a, b) => (Math.abs(a.y - b.y) > 3 ? b.y - a.y : a.x - b.x));
  const lineas = [];
  let actual = [], yAct = null;
  for (const p of puestos) {
    if (yAct === null || Math.abs(p.y - yAct) <= 3) {
      actual.push(p);
      yAct = yAct === null ? p.y : yAct;
    } else {
      lineas.push(actual);
      actual = [p];
      yAct = p.y;
    }
  }
  if (actual.length) lineas.push(actual);
  return lineas.map((l) =>
    l.sort((a, b) => a.x - b.x)
      .map((p) => p.s)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

export async function textoPDF(arrayBuffer) {
  let pdfjs;
  try {
    pdfjs = await cargarPdfjs();
  } catch (e) {
    throw new Error("No pude cargar el lector de PDF. Suele ser una versión vieja de la app guardada en el navegador: recargá la página con Ctrl+Shift+R y probá de nuevo.");
  }
  let doc;
  try {
    doc = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer), useSystemFonts: true }).promise;
  } catch (e) {
    // El "fake worker" es el plan B de pdf.js cuando no consigue el worker;
    // si también falla, lo que no llegó es el archivo del lector, no el PDF.
    if (/worker/i.test(String(e && e.message))) {
      throw new Error("No pude cargar el lector de PDF. Suele ser una versión vieja de la app guardada en el navegador: recargá la página con Ctrl+Shift+R y probá de nuevo.");
    }
    throw new Error("No pude abrir el PDF. ¿Está completo y no es una imagen escaneada sin texto?");
  }
  const partes = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const pagina = await doc.getPage(i);
    const contenido = await pagina.getTextContent();
    partes.push(lineasDeItems(contenido.items).join("\n"));
  }
  return partes.join("\n");
}

// ─── CERTIFICADOS Y CONSTANCIAS ───────────────────────────────────

const ENTIDAD_POR_TEXTO = [
  [/SOCIEDAD POR ACCIONES SIMPLIFICADA|\bS\.?A\.?S\.?\b/i, "sas"],
  [/SOCIEDAD DE RESPONSABILIDAD LIMITADA|\bS\.?R\.?L\.?\b/i, "srl"],
  [/SOCIEDAD AN[OÓ]NIMA/i, "sa"],
  [/SOCIEDAD DE HECHO/i, "soc_hecho"],
  [/EMPRESA UNIPERSONAL|UNIPERSONAL/i, "unipersonal"],
  [/PERSONA F[IÍ]SICA/i, "persona_fisica"],
];
export function entidadDesde(texto) {
  for (const [re, id] of ENTIDAD_POR_TEXTO) if (re.test(texto || "")) return id;
  return null;
}

// Cada obligación que DGI lista se traduce a los campos del motor de reglas.
// El orden importa: "IVA PEQUEÑAS EMPRESAS" tiene que ganarle a "IVA" a secas.
const OBLIGACIONES_DGI = [
  { re: /IVA\s+PEQUE[NÑ]A?S?\s+EMPRESAS?/i, campo: "iva", valor: "minimo", etiqueta: "IVA Mínimo — Literal E" },
  { re: /IVA\s+SERVICIOS\s+PERSONALES/i, campo: "iva", valor: "sp", etiqueta: "IVA Servicios Personales" },
  { re: /MONOTRIBUTO/i, campo: "iva", valor: "monotributo", etiqueta: "Monotributo" },
  { re: /IVA\s+M[IÍ]NIMO/i, campo: "iva", valor: "minimo", etiqueta: "IVA Mínimo" },
  { re: /IVA\s+TASA\s+REDUCIDA/i, campo: "iva", valor: "reducida", etiqueta: "IVA tasa reducida 10%" },
  { re: /^IVA\b(?!\s*(M[IÍ]N|PEQ|SERV|TASA))/i, campo: "iva", valor: "basica", etiqueta: "IVA tasa básica 22%" },
  { re: /IRAE/i, campo: "renta", valor: "irae", etiqueta: "IRAE" },
  { re: /IRPF.*CATEGOR[IÍ]A\s*(II|2)/i, campo: "renta", valor: "irpf_cat2", etiqueta: "IRPF Categoría II" },
  { re: /IRPF.*CATEGOR[IÍ]A\s*(I|1)\b/i, campo: "renta", valor: "irpf_cat1", etiqueta: "IRPF Categoría I" },
  { re: /IRPF/i, campo: "renta", valor: "irpf_cat2", etiqueta: "IRPF" },
  { re: /(IMPUESTO\s+AL\s+)?PATRIMONIO/i, campo: "patrimonio", valor: true, etiqueta: "Impuesto al Patrimonio" },
  { re: /ICOSA|CONTROL\s+DE\s+SOCIEDADES/i, campo: "icosa", valor: true, etiqueta: "ICOSA" },
];

function clasificarObligacion(nombre) {
  for (const o of OBLIGACIONES_DGI) if (o.re.test(nombre)) return o;
  return null;
}

// Al reordenar el PDF por coordenadas, a veces se pega la etiqueta de la
// columna de al lado ("... PASTAS FRESCAS e-mail:"). Se corta ahí.
const COLAS = /\s*(e-?mail|Nombre Comercial|Tel[eé]fono|Fax|GIRO|Cod\.?\s*Postal|Obs\.?|Domicilio|Departamento|Localidad|Calle|Es Principal|Fecha)\b.*$/i;
function limpiarGiro(s) {
  return String(s || "").replace(COLAS, "").replace(/[:\-–—\s]+$/, "").trim();
}

// En los formularios de DGI la calle va dos renglones debajo del rótulo
// "Domicilio", pasando por la fila Departamento / Localidad.
function domicilioDGI(lineas) {
  for (let i = 0; i < lineas.length; i++) {
    if (!/^Domicilio\s+(Constitu[ií]do|FISCAL|CONSTITUIDO)/i.test(lineas[i])) continue;
    for (let j = i + 1; j < Math.min(i + 7, lineas.length); j++) {
      const l = lineas[j].trim();
      if (!l || /^(Departamento|Localidad|Domicilio|Calle|Contactos|C[oó]digo)/i.test(l)) continue;
      if (/^[A-ZÁÉÍÓÚÑ]/.test(l) && /\d/.test(l) && !/^\d{2}\/\d{2}/.test(l)) {
        return l.replace(/\s+0\s*$/, "").trim(); // el 0 final es el código postal vacío
      }
    }
  }
  return "";
}

export function tipoDeDocumento(texto) {
  const t = texto || "";
  if (/Planilla de Trabajo Unificada/i.test(t)) return "bps_planilla";
  if (/Situaci[oó]n de Contribuyentes y Empresas|APORTACIONES/i.test(t)) return "bps_registrales";
  if (/Actos y Fechas de Vigencia|Constancia de inscripci/i.test(t)) return "dgi_6951";
  if (/Tipo de Entidad|Consulta Datos Registrales|N[ºo°]\s*de RUT/i.test(t)) return "dgi_6906";
  return null;
}

const NOMBRE_TIPO = {
  dgi_6906: "DGI · Consulta de Datos Registrales (form. 6906)",
  dgi_6951: "DGI · Constancia de inscripción (form. 6951)",
  bps_registrales: "BPS · Situación de Contribuyentes y Empresas",
  bps_planilla: "BPS · Planilla de Trabajo Unificada",
};

// Devuelve la primera línea después de la que hace match con la etiqueta.
function lineaTras(lineas, re, saltar = 0) {
  for (let i = 0; i < lineas.length; i++) {
    if (re.test(lineas[i])) {
      for (let j = i + 1 + saltar; j < lineas.length; j++) {
        if (lineas[j].trim()) return lineas[j].trim();
      }
    }
  }
  return "";
}

export function leerCertificado(texto) {
  const lineas = (texto || "").split("\n").map((l) => l.trim());
  const tipo = tipoDeDocumento(texto);
  const d = { tipo, tipoNombre: NOMBRE_TIPO[tipo] || "Documento no reconocido", campos: {}, obligaciones: [], aportaciones: [], empleados: [] };
  const set = (k, v) => { if (v !== null && v !== undefined && v !== "" && v !== false) d.campos[k] = v; };

  // RUT: doce dígitos. Aparece en los cuatro documentos.
  const rut = (texto.match(/\b(\d{12})\b/) || [])[1];
  set("rut", rut);

  if (tipo === "dgi_6906" || tipo === "dgi_6951") {
    const nom = lineaTras(lineas, /Denominaci[oó]n/i);
    const mNom = nom.match(/^(.+?)\s+\d{12}\s*$/);
    set("name", (mNom ? mNom[1] : nom).trim());
    const ent = lineaTras(lineas, /Tipo de Entidad/i);
    set("entityType", entidadDesde(ent || texto));
    const fechas = lineaTras(lineas, /Fecha de inscripci[oó]n en DGI/i).match(/(\d{2}\/\d{2}\/\d{4})\D+(\d{2}\/\d{2}\/\d{4})/);
    if (fechas) { set("inscripcionDGI", fechaISO(fechas[1])); set("startDate", fechaISO(fechas[2])); }
    // El 6951 no trae obligaciones, pero sí el último reinicio de actividades
    const per = texto.match(/Per[ií]odos de Actividad[\s\S]{0,400}?(\d{2}\/\d{2}\/\d{4})\s*\/\s*\/\s*$/m);
    if (per) set("startDate", fechaISO(per[1]));
    const act = lineaTras(lineas, /^Actividad\s+Es Principal/i).match(/^(\d{4,6})\s+(.+?)\s+(?:Si|No)\b/i);
    if (act) set("giro", `${limpiarGiro(act[2])} — ${act[1]}`);
    const bal = lineaTras(lineas, /^Balance\b/i).match(/(\d{2}\/\d{2})\s+\d{2}\/\d{2}\/\d{4}/);
    if (bal) set("cierreBalance", bal[1]);
    if (/EMISOR\s+ELECTRONICO/i.test(texto)) set("efactura", "activo");
    const tel = texto.match(/TELEFONO\s+MOVIL\s+(\d{6,})/i) || texto.match(/TELEFONO\s+FIJO\s+(\d{6,})/i);
    if (tel) { set("phone", tel[1]); set("whatsapp", "+598" + tel[1].replace(/^0/, "")); }
    const mail = texto.match(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
    if (mail) set("email", mail[1].toLowerCase());
    set("domicilio", domicilioDGI(lineas));
    // Obligaciones: van entre el encabezado y el siguiente bloque
    const iOb = lineas.findIndex((l) => /^Obligaci[oó]n\b/i.test(l));
    if (iOb > -1) {
      for (let i = iOb + 1; i < lineas.length; i++) {
        const l = lineas[i];
        if (!l || /^(Balance|Condici[oó]n|Vinculaciones|Fecha\b|Tipo de Documento)/i.test(l)) break;
        const m = l.match(/^(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s*$/);
        if (!m) continue;
        const nombre = m[1].replace(/\s+(CONTRIBUYENTE|RESPONSABLE|AGENTE DE RETENCI[OÓ]N)\s*$/i, "").trim();
        const cl = clasificarObligacion(nombre);
        d.obligaciones.push({ nombre, desde: fechaISO(m[2]), campo: cl?.campo || null, valor: cl?.valor, etiqueta: cl?.etiqueta || nombre });
      }
    }
  }

  if (tipo === "bps_registrales") {
    const c = texto.match(/Contribuyente:\s*(\d{12}),\s*([^\n]+)/i);
    if (c) { set("rut", c[1]); set("name", c[2].trim()); }
    set("entityType", entidadDesde(texto));
    const emp = texto.match(/Empresa:\s*(\d{4,10}),/i);
    if (emp) set("numEmpresa", emp[1]);
    const ini = texto.match(/Fecha Inicio:\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (ini) set("startDate", fechaISO(ini[1]));
    const giro = texto.match(/(\d{4,6})\s*-\s*\d+\s*:\s*([^\n]+)/);
    if (giro) set("giro", `${limpiarGiro(giro[2])} — ${giro[1]}`);
    const tel = texto.match(/Tel[eé]fono:\s*(\d{6,})/i);
    if (tel) { set("phone", tel[1]); set("whatsapp", "+598" + tel[1].replace(/^0/, "")); }
    const dom = texto.match(/Domicilio Fiscal:\s*([^\n]+?)\s*Cod\.Postal/i);
    if (dom) set("domicilio", dom[1].trim());
    // Aportaciones: el bloque que el usuario llama "cotizaciones" del BPS
    const iAp = lineas.findIndex((l) => /^APORTACIONES\b/i.test(l));
    if (iAp > -1) {
      for (let i = iAp + 1; i < lineas.length; i++) {
        const l = lineas[i];
        if (!l || /^(CONSEJOS DE SALARIOS|OTROS LOCALES|REPRESENTANTES)/i.test(l)) break;
        if (/^Aportaci[oó]n\b/i.test(l)) continue;
        const m = l.match(/^(.+?)\s+(ACTIVA|INACTIVA|SUSPENDIDA|CLAUSURADA)\s*(\d{2}\/\d{2}\/\d{4})?/i);
        if (m) d.aportaciones.push({ nombre: m[1].trim(), estado: m[2].toUpperCase(), desde: fechaISO(m[3] || "") });
      }
    }
    const cons = texto.match(/^(\d{8})\s+(\d{2}\/\d{2}\/\d{4})/m);
    if (cons) set("codigoConsejo", cons[1]);
  }

  if (tipo === "bps_planilla") {
    const empNro = (texto.match(/0{4,}(\d{6,8})/) || [])[1];
    if (empNro) set("numEmpresa", empNro);
    const den = lineaTras(lineas, /^Den\.\s*Empresa/i);
    if (den) set("name", den.replace(/\s+(EMPRESA UNIPERSONAL|SOCIEDAD[^\n]*|PERSONA F[IÍ]SICA)\b.*$/i, "").trim());
    set("entityType", entidadDesde(texto));
    const g = texto.match(/Grupo\s*(\d+)\/\s*Subgrupo\s*(\d+)(?:\/\s*Cap[ií]tulo\s*(\d+))?/i);
    if (g) set("grupoMTSS", g[3] ? `${g[1]}/${g[2]}.${g[3]}` : `${g[1]}.${g[2]}`);
    const giro = lineaTras(lineas, /^Giro principal/i);
    if (giro) set("giro", limpiarGiro(giro));
    const tel = texto.match(/Tel[eé]fono\/fax\s*(\d{6,})/i);
    if (tel) set("phone", tel[1]);
    // Cada persona arranca en un renglón "documento · nombre · Ac. · fechas".
    // La primera fecha es el ingreso y la última la de nacimiento; si hay tres,
    // la del medio es el egreso.
    for (let i = 0; i < lineas.length; i++) {
      const m = lineas[i].match(/^(\d{7,8})\s+([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ'´\s]+?)\s+(\d+)\s+(.*)$/);
      if (!m) continue;
      const fechas = m[4].match(/\d{2}\/\d{2}\/\d{4}/g) || [];
      if (!fechas.length) continue;
      const bloque = lineas.slice(i, i + 8).join("\n");
      const cargo = ((bloque.match(/Categoria\s+([^\n]+)/i) || [])[1] || "").trim();
      const sueldo = (bloque.match(/Remuneraci[oó]n Base:\s*\$?\s*([\d.,]+)/i) || [])[1];
      d.empleados.push({
        ci: m[1],
        name: m[2].replace(/\s+/g, " ").trim(),
        ingreso: fechaISO(fechas[0]),
        egreso: fechas.length >= 3 ? fechaISO(fechas[1]) : "",
        nacimiento: fechaISO(fechas[fechas.length - 1]),
        sexo: /MASCULINO/i.test(m[4]) ? "M" : /FEMENINO/i.test(m[4]) ? "F" : "",
        tipo: /jornal/i.test(m[4]) ? "jornalero" : "mensual",
        cargo,
        sueldo: sueldo ? num(sueldo) : null,
        titular: /titular|due[nñ]o|patr[oó]n/i.test(cargo),
      });
    }
  }

  if (d.empleados.some((e) => !e.titular)) d.campos.hasEmployees = true;
  return d;
}

// ─── COTIZACIONES DEL BCU ─────────────────────────────────────────

const MONEDAS = [
  [/D[OÓ]?LS?\.?\s*USA|D[OÓ]LAR|\bUSD\b|\bU\$S\b/i, "USD", "Dólar"],
  [/UNIDAD\s+INDEXADA|\bU\.?I\.?\b/i, "UI", "Unidad Indexada"],
  [/UNIDAD\s+REAJUSTABLE|\bU\.?R\.?\b/i, "UR", "Unidad Reajustable"],
  [/EURO|\bEUR\b/i, "EUR", "Euro"],
  [/REAL|\bBRL\b/i, "BRL", "Real"],
  [/PESO\s+ARG|\bARS\b/i, "ARS", "Peso argentino"],
];
export function codigoMoneda(txt) {
  const s = String(txt || "");
  for (const [re, cod] of MONEDAS) if (re.test(s)) return cod;
  return null;
}
export const nombreMoneda = (cod) => (MONEDAS.find((m) => m[1] === cod) || [, , cod])[2];

// Toma la matriz de filas del Excel del BCU y devuelve las cotizaciones.
// Columnas esperadas: Moneda · Fecha · Venta · Compra · Arbitraje.
export function leerCotizacionesXLS(filas) {
  const out = [];
  for (const f of filas || []) {
    if (!f || f.length < 3) continue;
    const cod = codigoMoneda(f[0]);
    const fecha = fechaISO(f[1]);
    if (!cod || !fecha) continue;
    const venta = num(f[2]), compra = num(f[3]);
    if (!venta && !compra) continue;
    out.push({ fecha, moneda: cod, venta: venta || compra, compra: compra || venta });
  }
  return out;
}

// Fusiona cotizaciones nuevas sobre las guardadas, sin duplicar fecha+moneda.
export function fusionarCotizaciones(guardadas, nuevas) {
  const mapa = {};
  for (const c of guardadas || []) mapa[`${c.fecha}|${c.moneda}`] = c;
  let altas = 0, cambios = 0;
  for (const c of nuevas || []) {
    const k = `${c.fecha}|${c.moneda}`;
    if (!mapa[k]) altas++;
    else if (mapa[k].venta !== c.venta) cambios++;
    mapa[k] = c;
  }
  const lista = Object.values(mapa).sort((a, b) => (a.fecha === b.fecha ? a.moneda.localeCompare(b.moneda) : b.fecha.localeCompare(a.fecha)));
  return { lista, altas, cambios };
}

// El tipo de cambio que corresponde aplicar es el del día hábil anterior:
// la última cotización publicada ANTES de la fecha del comprobante.
export function tcAnterior(cotizaciones, fechaComprobante, moneda = "USD") {
  const f = fechaISO(fechaComprobante);
  if (!f) return null;
  let mejor = null;
  for (const c of cotizaciones || []) {
    if (c.moneda !== moneda || c.fecha >= f) continue;
    if (!mejor || c.fecha > mejor.fecha) mejor = c;
  }
  return mejor;
}

// ─── COMPROBANTES RECIBIDOS DE DGI ────────────────────────────────

// Los remitos no llevan IVA: se cuentan aparte para que el total no mienta.
const SIN_EFECTO_FISCAL = /e-?Remito|Remito/i;

const COLUMNAS = {
  fecha: /Fecha\s+comprobante/i,
  tipo: /Tipo\s+comprobante/i,
  serie: /^Serie/i,
  numero: /^N[uú]mero/i,
  rut: /RUT\s+Emisor/i,
  moneda: /^Moneda/i,
  neto: /Monto\s+Neto/i,
  iva: /^IVA(\s+Ventas)?$/i,
  total: /Monto\s+Total/i,
  retPer: /Monto\s+Ret\.?\s*\/?\s*Per/i,
  credito: /Cr[eé]d\.?\s*Fiscal/i,
};

// Recibe la matriz completa de la hoja (array de arrays).
export function leerRecibidos(matriz, cotizaciones) {
  const filas = matriz || [];
  // El encabezado es la fila que tiene a la vez "Fecha comprobante" y "Moneda"
  let iHdr = -1;
  for (let i = 0; i < Math.min(filas.length, 40); i++) {
    const txt = (filas[i] || []).map((c) => String(c == null ? "" : c));
    if (txt.some((c) => COLUMNAS.fecha.test(c)) && txt.some((c) => COLUMNAS.moneda.test(c))) { iHdr = i; break; }
  }
  if (iHdr < 0) return { error: "No encontré el encabezado del reporte. ¿Es el Excel de CFE Recibidos de DGI?" };

  const hdr = (filas[iHdr] || []).map((c) => String(c == null ? "" : c).trim());
  const col = {};
  for (const [clave, re] of Object.entries(COLUMNAS)) col[clave] = hdr.findIndex((h) => re.test(h));

  const registros = [];
  for (let i = iHdr + 1; i < filas.length; i++) {
    const f = filas[i] || [];
    const fecha = fechaISO(f[col.fecha]);
    if (!fecha) continue;
    const tipo = String(f[col.tipo] == null ? "" : f[col.tipo]).trim();
    const moneda = codigoMoneda(f[col.moneda]) || (String(f[col.moneda] || "").toUpperCase().includes("UYU") ? "UYU" : "UYU");
    const r = {
      fecha, tipo, moneda,
      serie: String(f[col.serie] == null ? "" : f[col.serie]).trim(),
      numero: String(f[col.numero] == null ? "" : f[col.numero]).trim(),
      rut: String(f[col.rut] == null ? "" : f[col.rut]).trim(),
      neto: num(f[col.neto]), iva: num(f[col.iva]), total: num(f[col.total]),
      retPer: num(f[col.retPer]), credito: num(f[col.credito]),
      fiscal: !SIN_EFECTO_FISCAL.test(tipo),
      tc: 1, tcFecha: "", sinTC: false,
    };
    if (moneda !== "UYU") {
      const c = tcAnterior(cotizaciones, fecha, moneda);
      if (c) { r.tc = c.venta; r.tcFecha = c.fecha; }
      else r.sinTC = true;
    }
    registros.push(r);
  }

  const tot = { neto: 0, iva: 0, total: 0, retPer: 0, credito: 0 };
  const totME = { neto: 0, iva: 0, total: 0 };
  let nFiscales = 0, nRemitos = 0, nME = 0;
  const faltantes = [];
  for (const r of registros) {
    if (!r.fiscal) { nRemitos++; continue; }
    nFiscales++;
    if (r.sinTC) { faltantes.push(r); continue; }
    if (r.moneda !== "UYU") { nME++; totME.neto += r.neto * r.tc; totME.iva += r.iva * r.tc; totME.total += r.total * r.tc; }
    tot.neto += r.neto * r.tc;
    tot.iva += r.iva * r.tc;
    tot.total += r.total * r.tc;
    tot.retPer += r.retPer * r.tc;
    tot.credito += r.credito * r.tc;
  }

  // Período: el mes que más comprobantes aporta
  const cuenta = {};
  registros.forEach((r) => { const p = r.fecha.slice(0, 7); cuenta[p] = (cuenta[p] || 0) + 1; });
  const mejor = Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0];
  const periodo = mejor ? `${mejor[0].slice(5, 7)}/${mejor[0].slice(0, 4)}` : "";

  return { registros, totales: tot, totalesME: totME, periodo, nFiscales, nRemitos, nME, faltantes };
}
