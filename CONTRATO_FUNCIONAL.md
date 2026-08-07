# OBLIGO — Contrato funcional

**Fecha:** 31 de julio de 2026
**Fuente:** `src/Obligo.jsx` (código en producción, leído línea por línea)
**Documento hermano:** `REDISEÑO_INVENTARIO.md`

---

## Cómo leer este documento

Esto **no** es una lista de deseos ni una especificación de algo a construir. Es la transcripción de lo que la app **ya hace hoy** y que un cliente real usa todos los meses. Cada regla tiene la línea de código de donde salió.

**Para el rediseño, la regla es simple:** todo lo que está acá tiene que seguir funcionando igual. Se puede rediseñar cómo se ve, dónde está y cómo se llega, pero **no qué hace ni cuándo se bloquea**.

Las secciones están ordenadas por importancia para el diseño:

| Sección | Qué contiene |
|---|---|
| 1 | Entidades y campos — qué datos existen |
| 2 | Motor de obligaciones — qué le aparece a cada cliente y por qué |
| 3 | Cálculos fiscales — IVA, IRAE, Patrimonio, Boleto 2908 |
| 4 | Cálculos de sueldos — liquidación y convenios |
| 5 | Certificados de crédito DGI |
| **6** | **Bloqueos e interdependencias ← lo más importante** |
| **7** | **Visibilidad condicional y por rol** |
| 8 | Períodos y vencimientos |
| 9 | Multi-estudio (dos marcas) |
| 10 | Salidas externas — WhatsApp, DGI, BPS, BSE |
| 11 | Formatos de datos |
| 12 | Lo que NO existe |
| 13 | Inconsistencias detectadas a resolver |

---

## 1. Entidades y campos

### 1.1. Cliente

Un cliente es un contribuyente que el estudio atiende. Campos, agrupados por para qué sirven:

**Identificación**
`id` · `name` (razón social) · `rut` · `cedula` (del titular) · `numEmpresa` (Nº BPS) · `giro` · `status` (`activo` / `inactivo`) · `startDate` (inicio de actividades) · `cierreBalance` (formato `DD/MM`) · `grupoMTSS` · `grupoSubgrupo` (texto libre) · `specialTag` (`Solo Web` / `Solo Marketing` / `Convenio pendiente`)

**Contacto**
`phone` · `whatsapp` (arranca en `+598`) · `email`

**Clasificación fiscal**
`entityType`: `unipersonal` · `soc_hecho` · `srl` · `sa` · `sas` · `persona_fisica` · `otro`
`nature`: `industria_comercio` · `servicios` · `construccion` · `servicios_personales` · `agro` · `capital_inmobiliario` · `transporte` · `otro`

**Impuestos** (`taxes`)
- `renta`: `ninguno` · `irpf_cat1` · `irpf_cat2` · `irae`
- `iva`: `no_aplica` · `basica` (22%) · `reducida` (10%) · `minimo` (Literal E, Form. 2908) · `sp` (Servicios Personales, Form. 1302) · `monotributo`
- `patrimonio`: sí/no
- `iraeMontoMensual` · `iraeEsMinimo` · `iraeCoeficiente` · `iraeEsFicto` · `iraeMinimoMensual`
- `ipMontoAnual` · `ipAnticipoMensual`

**Otros fiscales**
`efactura`: `activo` · `pendiente` · `no_aplica` · `exceptuado`
`specialTaxes` (array, hoy solo `"gasoil"`) · `icosaMonto` · `domelMTSS` · `gubAsocBPS` / `gubAsocDGI` / `gubAsocBSE`

**Credenciales** (`credentials`) — pares usuario+contraseña de: `dgi` · `bps` · `usuarioGUB` · `efactura` · `bse` · `focer`. Más `efacturaUrl` (texto) y `pinFOCER` (texto suelto).

**Operativo**
`tasks[]` · `tramites[]` · `certsDGI[]` · `incidencias[]` · `employees[]` · `hasEmployees`
`boletos{período}{organismo}` · `nominas{empleadoId_período}` · `sueldos{período}{empleadoId}` · `billing{período}`

**Comercial**
`studyFee` (honorario mensual) · `studyFeeDate` · `studyFeeNotes` · `notes` (internas)

### 1.2. Empleado

`id` · `name` · `nombres` · `apellidos` (los dos últimos salen en el recibo) · `ci` · `cargo` · `nroContrato` (BPS) · `ingreso` (fecha) · `horario` (sale en el recibo)
`tipo`: `mensual` · `jornalero`
`sueldo` (si mensual) · `jornal` (si jornalero) · `menores` (a cargo)
`snisAd`: 0 · 1,5 · 3 · 5 (%)
`noct`: nocturnidad habitual sí/no
`sueldoAnterior` · `jornalAnterior` · `sueldoVigencia` (`MM/AAAA`) · `ultimoAjuste{fecha, pct, anterior}`

### 1.3. Obligación

**Se genera sola, no se crea a mano.** Es el resultado de aplicar el motor de reglas (sección 2) a la configuración fiscal del cliente y al período.

`id` · `label` · `org` (DGI · BPS · BSE · BCU · BPS/DGI · DGI/BPS · CJPPU · Otro) · `freq` (`mensual` · `anual` · `especial`) · `form` (nº de formulario) · `url` (a qué organismo linkea) · `autoCalc` · `needsNominas` · `monto`

**Estado:** dos marcas independientes — `paid` (Pagado) y `notified` (Notificado). **No hay flujo de estados.** No existe "en proceso" ni "observada". Se pueden marcar en cualquier orden y una no depende de la otra.

### 1.4. Tarea

A diferencia de la obligación, **la tarea sí se crea a mano**.

`id` · `label` · `due` (fecha) · `freq` (`mensual` · `anual` · `otro`) · `cat` (`dgi` · `bps` · `bse` · `facturacion` · `otro`) · `assignedTo` (id de usuario, o vacío) · `done` · `paid` · `notified`

### 1.5. Otras

- **Trámite:** `titulo` · `estado` (`pendiente` · `enviado` · `procesado`) · `comentario` · `fecha`
- **Incidencia:** `texto` · `tipo` (`nota` · `urgente` · `resuelto`) · `period` · `fecha`
- **Certificado DGI:** `num` · `importe` · `saldoRestante` · `vencimiento` · `emision` · `usado`
- **Boleto:** por período y organismo (`bps` / `dgi`) — `monto` · `ref` · `pagado` · `pagadoCert` · `certMonto`
- **Proveedor del estudio:** `nombre` · `categoria` · `monto` · `fecha` · `recurrente` · `pagado` · `periodo`

---

## 2. Motor de obligaciones

> `getObs(client, period)` — líneas 133-173

Esta es la regla central de la app: **el contador no elige qué obligaciones tiene un cliente; se deducen de su régimen fiscal.** Si cambiás el IVA de un cliente, sus obligaciones cambian solas.

### 2.1. Por régimen de renta

| Si `renta` es | Se generan |
|---|---|
| `irpf_cat1` | **Mensual:** Control retenciones IRPF Cat I (DGI)<br>**Anual:** DDJJ IRPF anual – Form. 1102 (Cat I) |
| `irpf_cat2` | **Mensual:** Anticipo IRPF Cat II (DGI) · Aportes BPS titular/independiente (BPS)<br>**Anual:** DDJJ IRPF anual – Form. 1102 (Cat II) |
| `irae` | **Anual:** DDJJ IRAE anual (25% renta neta) |

### 2.2. Por IVA

| Si `iva` es | Se generan |
|---|---|
| `minimo` | **Mensual:** Pago IVA Mínimo – Boleto 2908 (DGI, cálculo automático) · Aportes BPS titular (Literal E) |
| `sp` | **Mensual:** DJ IVA Serv. Personales – Form. 1302 (DGI) |
| `monotributo` | **Mensual:** Cuota Monotributo unificada BPS+DGI (cálculo automático) |

### 2.3. Boleto 2908 consolidado

**Regla:** aparece solo si el cliente **está configurado** Y el IVA **no es** monotributo Y el IVA **no es** mínimo Y la renta **no es** ninguno.

> Es decir: quien paga monotributo o IVA mínimo tiene su propio boleto y no lleva el 2908 consolidado.

### 2.4. Impuesto al Patrimonio

**Anual:** DDJJ Impuesto al Patrimonio — solo si `patrimonio` está activo **Y** la renta no es `ninguno`.

### 2.5. DJ IVA anual (Form. 2178) — regla de ventana temporal

Aparece **solo si**: el IVA es básica o reducida, **Y** el cliente tiene fecha de cierre de balance, **Y hoy está dentro de los 60 días posteriores al último cierre**.

Fuera de esa ventana de 60 días, la obligación **no existe**. Aparece y desaparece sola.

### 2.6. Por tipo de entidad

| Entidad | Obligación |
|---|---|
| `sas` | **Mensual:** FONASA directores SAS (mín. 15 BFC) — BPS |
| `sa` o `sas` | **Anual:** Beneficiarios finales BCU (Ley 19.484) |

### 2.7. Por naturaleza — Construcción

Si `nature === "construccion"`, se generan **tres obligaciones mensuales**: FOCER (Cesantía Construcción) · Fondo Social Construcción · FOSVOC (Vivienda Obrera). Todas BPS.

### 2.8. Por impuestos especiales

Si `specialTaxes` incluye `"gasoil"` → **Anual:** DJ Gasoil – Form. 2181.

### 2.9. Con empleados

Si `hasEmployees`:

**Mensuales**
- Declaración nominada nómina (BPS) — **⚠️ marcada con `needsNominas: true`, ver bloqueo B1**
- Nóminas (BPS/DGI)
- Retención IRPF dependientes (código 104)

**Anual**
- Seguro accidentes laborales (BSE)

**Estacionales — dependen del mes del período**
| Mes del período | Obligación |
|---|---|
| Junio (6) | Aguinaldo – 1ª cuota |
| Diciembre (12) | Aguinaldo – 2ª cuota |
| Diciembre (12) | Ajuste anual IRPF dependientes |

### 2.10. e-Factura

**Mensual:** Control e-Factura CFE — si el IVA **no** es monotributo Y el cliente está configurado.

### 2.11. Qué significa "configurado"

> `isConf(client)` — línea 96

Un cliente está **configurado** si tiene renta distinta de `ninguno`, **o** IVA distinto de `no_aplica`, **o** patrimonio activo.

Un cliente **sin configurar** casi no genera obligaciones y la app lo marca en todos lados: badge rojo `S/C`, aviso amarillo en su ficha, contador en el Panel, y un filtro propio en el listado.

---

## 3. Cálculos fiscales

### 3.1. Cálculo del mes

> `calcAnticipos(client, period, config)` — líneas 1146-1176

Es el cálculo que convierte **facturación** en **plata a pagar**.

**Entradas que carga el contador** (por cliente y por período):
- Ventas netas del mes
- IVA ventas *(opcional — si se deja vacío se calcula solo)*
- IVA compras
- Retenciones de tarjetas
- Excedente del mes anterior *(opcional — se arrastra solo)*
- Venta de activo fijo *(solo si la renta es IRAE)*

**Reglas de cálculo, en orden:**

**IVA**
```
tasa           = 10% si IVA reducida · 22% si IVA básica · 0% en cualquier otro caso
IVA ventas     = el valor cargado a mano, si hay; si no → ventas × tasa
IVA a pagar    = IVA ventas − IVA compras − retenciones tarjetas − excedente anterior
```
- Si el resultado es **positivo** → se paga, redondeado. El excedente queda en 0.
- Si el resultado es **negativo** → **no se paga nada** y el valor absoluto queda como **excedente** para el mes siguiente.

**⚠️ Regla de arrastre — importante:** el excedente del mes anterior **se calcula recursivamente**, mes por mes hacia atrás, **hasta 12 meses**. Si el contador carga un excedente a mano, ese pisa el cálculo automático para ese mes.

**IRAE** *(solo si la renta es IRAE)*
```
IRAE por coeficiente = (ventas + venta de activo fijo) × coeficiente
IRAE mínimo          = el del cliente si tiene; si no, el de configuración
```
- Si hay un **IRAE fijo mensual** cargado → **ese manda**, se ignoran coeficiente y mínimo.
- Si no → **se paga el MAYOR entre el coeficiente y el mínimo.**

**Patrimonio** *(solo si `patrimonio` está activo)*
- Si hay anticipo mensual cargado → ese.
- Si no → monto anual ÷ 12, redondeado.

**IVA Mínimo** *(solo si el IVA es `minimo`)* → el valor fijo de configuración.

**TOTAL A PAGAR = Pago IVA + IRAE + Patrimonio + IVA Mínimo**

**Estado "sin cargar":** si el contador no cargó ventas, ni IVA compras, ni retenciones, ni IVA ventas, la app muestra el aviso *"Todavía no cargaste la facturación de este mes: el total muestra sólo los importes fijos."*

### 3.2. Boleto 2908 — el consolidado ⭐

> **Definición confirmada por el estudio (31/7/2026).** Reemplaza el comportamiento anterior del código, que tenía dos cálculos paralelos con distinta fuente de datos.

**El Boleto 2908 es el total de todo lo que el cliente le paga a DGI ese mes.** Se arma sumando todos los impuestos que le correspondan según su régimen — cualquier combinación es posible.

#### Líneas del boleto

| Línea | Aparece si | Monto |
|---|---|---|
| **IVA a pagar** | IVA básica o reducida | Del cálculo del mes: `IVA ventas − IVA compras − retenciones tarjetas − excedente anterior`, **con piso en 0** |
| **IVA Mínimo (Literal E)** | IVA = mínimo | Valor fijo de configuración |
| **Anticipo IRAE** | renta = IRAE | Monto fijo si está cargado; si no → **el mayor entre coeficiente y mínimo** |
| **Anticipo IRPF** | renta = IRPF Cat I o Cat II | *(ver 3.2.1 — pendiente de definir el cálculo)* |
| **Anticipo IP** | patrimonio activo **Y** renta ≠ ninguno | Anticipo mensual cargado; si no → monto anual ÷ 12 |
| **ICOSA** | entidad = S.A. | Monto mensual cargado en el cliente |

**TOTAL DEL BOLETO 2908 = suma de todas las líneas que apliquen.**

#### Reglas de armado

1. **Cualquier combinación es válida.** Un cliente puede llevar IVA + IRAE + IP + ICOSA en el mismo boleto, o una sola línea. El boleto se arma con lo que tenga.

2. **Una sola fuente de datos: el período.** Todas las líneas salen del cálculo del mes (sección 3.1), que se carga por período. **Se eliminan** los campos sueltos a nivel cliente que existían antes (`ivaVentasMes`, `ivaComprasMes`, `ivaFavorAcumulado`) — eran la causa de que el mismo IVA diera dos números distintos según dónde se lo mirara.

3. **El IVA nunca resta.** Si el IVA da a favor, la línea de IVA **es 0** y el saldo queda como **excedente para el mes siguiente** (se arrastra solo). Un IVA a favor no baja el IRAE ni el patrimonio.

4. **Monotributo no lleva 2908.** Paga una cuota unificada BPS+DGI y queda fuera de este boleto.

5. **El total alimenta tres lugares a la vez**, y tienen que coincidir siempre:
   - El importe que se muestra al lado de la obligación *"Anticipo impuestos – Boleto 2908"* en las listas
   - El campo **monto del boleto DGI** en Operativo
   - El **mensaje para el cliente** (sección 10.3)

6. **El boleto se puede pagar con certificado de crédito DGI**, total o parcialmente (sección 5).

#### 3.2.1. ⚠️ Pendiente de definir: cómo se calcula el anticipo de IRPF

El código **hoy no calcula ningún anticipo de IRPF** — ni Cat I ni Cat II. Solo genera la obligación como recordatorio, sin importe.

Para incorporarlo al boleto hace falta que el estudio defina la regla. Las opciones habituales:

- **Monto fijo mensual cargado a mano**, igual que el IRAE fijo *(la más simple, y sirve para arrancar)*
- **Por coeficiente sobre la facturación**, igual que el IRAE
- **Por escala de franjas** sobre los ingresos del período

**Mientras no esté definida**, la línea se implementa como **monto mensual cargado a mano** por cliente, y se documenta como provisoria. Es lo mismo que ya hace el IRAE cuando se carga un monto fijo, así que no agrega complejidad nueva.

#### 3.2.2. Lo que NO va en el 2908

**BPS va aparte, siempre.** Es otro organismo, otro boleto, otro día de vencimiento (10 vs 22).

**Y el monto de BPS no se calcula: se carga a mano.** El módulo de Sueldos calcula los **aportes del empleado** (jubilatorio, FRL, seguro de enfermedad, SNIS), pero **no calcula los aportes patronales**, que son la otra mitad del boleto de BPS. Hasta que eso exista, el importe de BPS lo carga el contador.

---

## 4. Sueldos

### 4.1. Liquidación mensual

> `calcRecibo(emp, inc, opts)` — líneas 1216-1248

**Entradas del mes** (por empleado): faltas en días *(mensual)* o jornales trabajados *(jornalero)* · adelantos · cuota de préstamo · nº de cuota (texto, ej. `4/12`) · IRPF · nocturnidad del mes (puede pisar la habitual del empleado).

**Cadena de cálculo, en orden estricto:**

**1 · Antigüedad**
```
años            = (último día del período − fecha de ingreso) / 365
antigüedad %    = TRUNC(años) × 1%        ← años enteros cumplidos, se trunca
si hay tope     → se limita al tope del convenio
```
Los jornaleros **no** cobran antigüedad.

**2 · Sueldo a usar — regla contable crítica**
```
Si el empleado tiene una vigencia de aumento cargada
Y el período que se está liquidando es ANTERIOR a esa vigencia
→ se usa el sueldo (o jornal) ANTERIOR
```
> **Los meses ya cerrados no se alteran.** Si en julio se aplica un aumento con vigencia 07/2026 y después hay que reimprimir el recibo de mayo, mayo sale con el sueldo viejo. Esto no es negociable.

**3 · Base**
```
mensual    → base = sueldo
jornalero  → base = jornal × jornales del mes
```

**4 · Antigüedad en pesos** = base × antigüedad % *(0 para jornaleros)*

**5 · Nocturnidad** = (base + antigüedad) × **23%** — solo mensuales, y solo si está activa

**6 · Descuento por faltas** = (base + antigüedad + nocturnidad) ÷ 30 × días de falta — solo mensuales

**7 · Gravado BPS** = base + antigüedad + nocturnidad − faltas *(con piso en 0)*

**8 · Aportes del empleado**
| Aporte | Tasa |
|---|---|
| Jubilatorio | 15% del gravado |
| **FRL** | **0,125% del gravado** ⭐ |
| Seguro de Enfermedad | 3% del gravado |
| **SNIS adicional** | **0% si el gravado es menor a 2,5 BPC.** Si no, el % del empleado: 0 · 1,5 · 3 · 5 |

> ⭐ **FRL = 0,125%, confirmado por el estudio (31/7/2026).** El código de liquidación usa hoy **0,1%** y lo rotula así en pantalla. **Es un error a corregir en la implementación**, en el cálculo y en la etiqueta. El otro lugar de la app que ya usa 0,125% está bien.

**9 · Líquido**
```
Total descuentos = aportes + IRPF + adelantos + cuota préstamo
Neto             = gravado − total descuentos
Líquido a cobrar = redondeo del neto, con piso en 0
Redondeo         = líquido − neto   ← sale explícito en el recibo
```

### 4.2. Convenios de Consejos de Salarios

> `CONVENIOS` — líneas 1181-1210. Se busca por el campo `grupoMTSS` del cliente.

**Grupo 15 · Subgrupo 4 — Casas de Salud y Residenciales de Ancianos (con fines de lucro)**
Expediente 2025-13-2-0003506 · acta 7/11/2025 · vigencia 1/7/2025 a 30/6/2028

*Franjas según salario nominal al 30/6/2025 (44 hs semanales):* Nivel I hasta $35.704 · Nivel II de $35.705 a $151.459 · Nivel III desde $151.460

| Vigencia | Nivel I | Nivel II | Nivel III | Mínimo del sector |
|---|---|---|---|---|
| 07/2025 | 3,3% | 2,5% | 1,6% | $28.643 |
| 01/2026 | 3,6% | 3,3% | 2,9% | $29.674 |
| **07/2026** | **2,8%** | **1,9%** | **1,7%** | — |
| 01/2027 | 3,5% | 3,2% | 2,7% | — |
| 07/2027 | 2,8% | 1,9% | 1,7% | — |
| 01/2028 | 3,5% | 3,2% | 2,7% | — |

*Notas:* categorías del acta — Cocinero, Limpiador, Cuidador y Cuidador Nochero · al Cuidador Nochero se le adiciona 23% de nocturnidad sobre el mínimo · los correctivos solo se aplican en más y solo a las franjas I y II.

**Grupo 1 · Subgrupo 12 · Capítulo 2 — Fábricas de Pastas**
Expediente 2025-13-2-0002292 · actas 23 y 24/7/2025 · **aumento lineal, sin franjas**

| Vigencia | % |
|---|---|
| 07/2025 | 2,5% |
| 11/2025 | 2% |
| 01/2026 | 0,75% |
| 03/2026 | 2,5% |

*Notas:* tope para prima por antigüedad (al 1/7/2025) $72.852 · ficto de pasta mensual $481 · el correctivo 7/2024–6/2025 dio negativo y no se aplicó.

### 4.3. Aplicar un aumento

Al aplicar, por cada empleado con sueldo y porcentaje mayor a cero:
```
sueldoAnterior  ← el sueldo que tenía
sueldo          ← sueldo × (1 + % / 100), redondeado a 2 decimales
sueldoVigencia  ← el período de vigencia del ajuste
ultimoAjuste    ← { fecha del acta, %, sueldo anterior }
```
Para jornaleros lo mismo, pero sobre `jornal` / `jornalAnterior`.

**Por defecto se propone el último ajuste cuya vigencia ya pasó.** Si el cliente no tiene convenio precargado, se habilita el modo manual (porcentaje + vigencia a mano).

---

## 5. Certificados de crédito DGI

Un certificado de crédito de DGI se puede aplicar como forma de pago de un boleto.

**Al aplicar un monto:**
```
monto aplicado = MÍNIMO entre (lo que se quiere aplicar) y (el saldo restante)
saldo restante = saldo anterior − monto aplicado
si el saldo queda en 0 o menos → el certificado se marca USADO automáticamente
```

Un certificado usado se puede **reactivar** a mano.

**Al aplicarlo desde un boleto**, además se registra en el boleto: `pagadoCert = true` y se acumula `certMonto`.

**Alertas de vencimiento:** un certificado alerta si **no está usado**, tiene fecha de vencimiento, y faltan **entre 0 y 59 días**. Dentro de esa ventana, si faltan **menos de 9 días** se muestra en rojo; si no, en naranja.

Estas alertas aparecen en cuatro lugares: Panel principal, Centro de alertas, campana de avisos, y la solapa Resumen de la ficha.

---

## 6. Bloqueos e interdependencias ⚠️

**Esta es la sección más importante del documento.** Son las reglas del tipo *"si pasa X, se bloquea Y"*. Cada una tiene que estar diseñada: el control bloqueado, el texto que lo explica, y el camino para desbloquearlo.

### B1 · Nóminas bloquean el pago de BPS

**La regla más importante de la app.**

> **Condición:** la obligación tiene `needsNominas` (hoy solo *"Declaración nominada nómina (BPS)"*) **Y** el cliente tiene empleados **Y** no están marcadas **todas** las nóminas.
>
> **Qué se bloquea:** el checkbox **Pagado** de esa obligación. El de Notificado **sigue habilitado**.
>
> **"Todas las nóminas marcadas" significa:** para **cada** empleado del cliente, en **ese período**, las dos marcas — `sueldoLiq` (Sueldo liquidado) **y** `reciboEnv` (Recibo enviado).
>
> **Textos actuales:** *"Faltan nóminas antes de pagar BPS"* (solapa Resumen) · *"Marcar todas las nóminas antes de pagar BPS"* (solapa Tributario)
>
> **Cómo se ve hoy:** el checkbox al 30% de opacidad y sin respuesta al click.

**Para el rediseño:** hoy el aviso no dice *cuántas* faltan ni *de quién*, y no lleva al lugar donde se marcan (que está en otra solapa, Operativo → Nóminas). Ese es el mejor ejemplo de "el bloqueo existe pero no está diseñado". Debería decir *"Faltan 3 de 13 nóminas"* y ser un enlace directo.

**Atajo relacionado:** en Operativo → Nóminas hay un botón **"Marcar todas"** que pone las dos marcas en todos los empleados de una. Y un indicador: *"Todas al día"* (verde) o *"Faltan nóminas"* (naranja).

### B2 · Recibo de sueldo sin gravado

> **Condición:** el gravado BPS del empleado en ese período es 0 o menos.
> **Qué se bloquea:** el botón **"Recibo PDF"** de ese empleado.
> **Por qué:** no se puede emitir un recibo de un mes sin haber trabajado (jornalero con 0 jornales, o faltas que se comen el sueldo).

**Relacionado:** el botón **"Imprimir todos los recibos"** salta silenciosamente a los empleados con gravado 0. **Hoy no avisa cuántos salteó** — habría que decirlo.

### B3 · Aplicar aumento sin porcentaje

> **Condición:** ningún empleado del cliente tiene un porcentaje de aumento mayor a 0.
> **Qué se bloquea:** el botón **"Aplicar aumento desde MM/AAAA"**.
> **Cuándo pasa:** el cliente no tiene empleados cargados, o el porcentaje manual está vacío.

### B4 · Aviso de aumento duplicado

> **Condición:** algún empleado ya tiene `sueldoVigencia` igual a la vigencia que se está por aplicar.
> **Qué pasa:** **no bloquea**, pero muestra una advertencia naranja: *"⚠ Ya hay empleados con un ajuste vigente desde MM/AAAA. Si lo aplicás de nuevo, el aumento se suma otra vez."*
> **Por qué importa:** aplicar dos veces el mismo aumento corrompe los sueldos y no hay forma de deshacerlo.

**Para el rediseño:** este es el caso donde una advertencia salva de un error irreversible. Merece más peso visual del que tiene hoy.

### B5 · IRAE mínimo bloquea el monto manual

> **Condición:** el checkbox **"Usar anticipo mínimo (de configuración)"** está tildado.
> **Qué se bloquea:** el campo **"Anticipo mensual IRAE ($)"** — deshabilitado y al 50% de opacidad.
> **Por qué:** si se usa el mínimo, el monto manual no tiene efecto.

### B6 · Generar reporte sin empresas

> **Condición:** no hay ninguna empresa seleccionada.
> **Qué se bloquea:** el botón **"Generar PDF"**.
> Además la lista muestra: *"Seleccioná al menos una empresa arriba."*

### B7 · Filtros sin resultados

> **Condición:** un chip de filtro rápido tiene contador 0 y no está activo.
> **Qué se bloquea:** el chip — deshabilitado, 45% de opacidad, cursor normal.
> **Nota:** si el filtro está activo, **no** se deshabilita aunque dé 0 (si no, no se podría desactivar).

### B8 · Aumento con vigencia futura

> **Condición:** algún empleado tiene una vigencia de aumento **posterior** al período que se está liquidando.
> **Qué pasa:** aviso amarillo — *"Hay un aumento de convenio cargado con vigencia posterior a [Mes Año]. Este mes se liquida con los sueldos anteriores; el nuevo importe entra automáticamente desde su mes de vigencia."*
> **No bloquea nada.** Es informativo, y explica por qué los números no cambiaron.

**Además, por empleado**, se muestra el estado del ajuste: **↑ verde** si ya rige en el período que se ve, **⏳ naranja** si todavía no.

### B9 · Cambiar a un mes cerrado

> **Condición:** el período al que se navega está en la lista de meses cerrados.
> **Qué pasa:** confirmación — *"El mes MM/AAAA está cerrado. ¿Deseas continuar de todas formas?"*
> **No impide** entrar. Solo advierte.
> Además, la barra superior cambia: en vez del botón **"✓ Finalizar mes"** muestra un badge rojo **"Cerrado"**.

### B10 · Eliminaciones que piden confirmación

| Acción | ¿Confirma hoy? |
|---|---|
| Eliminar empleado | ✅ Sí |
| Eliminar certificado *(desde Tributario)* | ✅ Sí |
| Finalizar mes | ✅ Sí |
| Eliminar proveedor | ❌ **No** |
| Eliminar incidencia | ❌ **No** |
| Eliminar certificado *(desde Datos)* | ❌ **No** |
| Eliminar línea del reporte PDF | ❌ **No** |

**⚠️ A resolver en el rediseño:** el mismo certificado se borra con confirmación desde una solapa y sin confirmación desde otra. Hay que unificar. **Recomendación:** confirmar todo lo que destruya datos cargados a mano, y no confirmar lo que se puede rehacer en un click.

---

## 7. Visibilidad condicional y por rol

### 7.1. Por datos del cliente

| Elemento | Aparece si |
|---|---|
| Solapa **Sueldos** | El cliente tiene empleados |
| Bloque **Empleados** *(en Datos)* | El cliente tiene empleados |
| Bloque **Nóminas** *(en Operativo)* | El cliente tiene empleados |
| Bloque **Anticipos Boleto 2908** *(en Datos)* | renta = IRAE **o** patrimonio activo **o** entidad = S.A. |
| — sub-bloque **IRAE** | renta = IRAE |
| — sub-bloque **IP** | patrimonio activo **Y** renta ≠ ninguno |
| — sub-bloque **ICOSA** | entidad = S.A. |
| **Cálculo del mes** *(en Tributario)* | El cliente está configurado |
| Campo **IVA ventas del mes** | IVA básica o reducida *(tasa > 0)* |
| Campo **Venta de activo fijo** | renta = IRAE |
| Bloque **Pagar 2908 con certificado** | Hay al menos un certificado no usado con saldo > 0 |
| Bloque **Pagar con certificado** *(dentro de cada boleto)* | Misma condición |
| Aviso **"Sin configurar"** | El cliente **no** está configurado |
| Aviso **certificados por vencer** | Hay certificado activo con 0 ≤ días < 60 |
| Recordatorio **DDJJ anuales** | Hay cierre de balance **Y** faltan ≤ 30 días para el plazo, o ya venció |
| Campo **Nocturnidad** *(en la liquidación)* | El empleado **no** es jornalero |
| **Jornales del mes** vs **Faltas (días)** | Según el tipo de empleado |

**Recordatorio de DDJJ anuales — el detalle:** el plazo se calcula como *cierre de balance + 2 meses*. Si faltan 30 días o menos → caja naranja *"Recordatorio: DDJJ anuales próximas"*. Si ya pasó → caja roja *"DDJJ anuales vencidas — Hace N días venció el plazo"*. Los formularios a presentar son **2178 y 1050**, y si el cliente tiene el impuesto especial de gasoil, además el **2181 (CEDE)**.

### 7.2. Por rol de usuario

Hay tres roles: **admin** · **secretaria** · **auxiliar**.

| Elemento | Solo admin |
|---|---|
| Panel de **Proveedores del estudio** | ✅ |
| Bloque de **Facturación** del Panel *(torta + 4 contadores)* | ✅ |
| Checkbox **"Pago recibido"** *(en Comercial)* | ✅ — los otros dos, Factura emitida y Factura enviada, los ve todo el mundo |
| **Honorario mensual**, fecha de cobro y observaciones | ✅ |

**Tareas — regla distinta:**
> Si el usuario **no es admin**, solo ve las tareas que **le fueron delegadas a él** o las que **no están delegadas a nadie**. Las tareas delegadas a otro usuario no aparecen.

### 7.3. Por estudio

| Elemento | Condición |
|---|---|
| Botón **"📄 Reporte"** en la ficha del cliente | Solo si el estudio activo es **Laser Solutions** |
| Frase **"Normativa clara. Decisiones seguras."** en el sidebar | Solo si el estudio activo es **Valeria Calvette** |

---

## 8. Períodos y vencimientos

### 8.1. Cómo funciona el período

El período es un **mes de cargo**, en formato `MM/AAAA`. La app abre siempre en **el mes en curso**.

**Regla central:** *lo de un mes se paga al mes siguiente.*
```
Vencimiento DGI = día 22 (configurable) del mes SIGUIENTE al período
Vencimiento BPS = día 10 (configurable) del mes SIGUIENTE al período
```
Ejemplo: las obligaciones del período **07/2026** vencen el **22/08/2026** (DGI) y el **10/08/2026** (BPS).

### 8.2. El calendario invierte la relación

En el calendario, las obligaciones que **vencen** en el mes que se está mirando son las del **período anterior**. Es la misma regla vista al revés, y hay que dejarla explícita en pantalla porque es la fuente número uno de confusión.

### 8.3. Ventanas de alerta — hoy inconsistentes

| Dónde | Ventana |
|---|---|
| Panel — "Próx. 7 días" | ⚠️ Fecha fija en el código, siempre da 0 — **bug** |
| Centro de alertas — "Próximas" | 9 días |
| Campana de avisos | 7 días |
| Certificados por vencer | 60 días, rojo si < 9 |

**A resolver:** unificar en una sola ventana. **Recomendación: 7 días** para tareas, **60 días** para certificados.

### 8.4. Cierre de mes

Un mes se puede marcar como **finalizado**. Es solo una marca de advertencia: no bloquea nada, solo pide confirmación al entrar (ver B9).

**⚠️ Hoy no se guarda:** al recargar la página, todos los meses vuelven a estar abiertos.

---

## 9. Multi-estudio

La misma aplicación sirve a **dos estudios distintos**, con datos completamente separados.

| | Estudio Valeria Calvette | Laser Solutions |
|---|---|---|
| Subdominio | `obligo-vcestudio.lasersolutions.com.uy` | `obligo-laser.lasersolutions.com.uy` |
| Clientes | 42 | 7 |
| Usuarios | `admin` · `secretaria` · `auxiliar` | `laser` · `ayudante` |
| Navy | `#14294F` | `#021942` |
| Acción | dorado `#C8A44D` | azul `#2948D9` |
| Acento | dorado claro `#E9C877` | celeste `#8ECBDE` |
| Nombre por defecto | "Estudio Valeria Calvette" | "Laser Solutions" |

**Reglas de aislamiento:**
- En cada subdominio **solo entran los usuarios de ese estudio.** Un usuario de Valeria es rechazado en el subdominio de Laser y viceversa.
- En el dominio general (`obligo.lasersolutions.com.uy`) entran los dos, y el estudio se decide por el usuario que ingresa.
- Los datos viven en claves separadas y **no se mezclan nunca**.
- El **título de la pestaña y el favicon** cambian según el estudio.

**⚠️ Para el rediseño:** todo tiene que verse bien en las dos marcas. Los tokens de marca (navy, acción, acento, logo, nombre) tienen que estar separados de los tokens de sistema (grises, semánticos, espaciado, tipografía).

---

## 10. Salidas externas — WhatsApp y organismos

> Solicitado expresamente. Parte ya existe; se documenta completo y se marca qué falta.

### 10.1. Organismos — enlaces fijos

| Organismo | URL |
|---|---|
| **DGI** | `https://servicios.dgi.gub.uy/serviciosenlinea` |
| **BPS** | `https://scp.bps.gub.uy/my.policy` |
| **BSE** | `https://mibse.bse.com.uy/wps/portal/mi-bse/` |
| **BCU** *(cotizaciones)* | `https://www.bcu.gub.uy/Estadisticas-e-Indicadores/Paginas/Cotizaciones.aspx` |
| **INE** *(UI diaria)* | página de publicaciones del INE |

**Todos abren en pestaña nueva**, con `noopener`.

### 10.2. Dónde aparecen hoy

| Lugar | Qué hay |
|---|---|
| **Sidebar → bloque "ACCESOS"** | 3 botones blancos con los logos de DGI, BPS y BSE a 33px, apilados |
| **Encabezado de la ficha del cliente** | Los mismos 3 logos a 22px, en línea, más el de WhatsApp |
| **Cada obligación** | Botón `↗` que abre el organismo de esa obligación |
| **Credenciales → e-Factura** | Botón "Ir ↗" que abre la URL propia del cliente |
| **Configuración** | Botones a BCU (cotizaciones) e INE (UI diaria) |

**⚠️ Dos tratamientos distintos del mismo control** (33px apilado vs 22px en línea). **A unificar.**

### 10.3. WhatsApp — tres salidas distintas

**a) Botón directo** *(encabezado de la ficha)*
Limpia todo lo que no sea número del campo WhatsApp y abre `https://wa.me/[número]`. Si quedan 5 dígitos o menos, **no hace nada** *(hoy en silencio — debería avisar)*.

**b) Enviar importes del mes** ⭐ *(rediseñado — sale del Boleto 2908)*

> **Definición confirmada por el estudio (31/7/2026).** Antes el mensaje se armaba con dos montos cargados a mano. Ahora **sale del desglose del 2908**: el cliente recibe el detalle de qué compone lo que tiene que pagar, no un número suelto.

**Regla:** el mensaje se arma solo, a partir de las líneas del Boleto 2908 calculadas para ese período (sección 3.2), más el importe de BPS que se carga a mano.

**Formato:**
```
Hola *[Cliente]*, estos son los importes del período *[Mes Año]*:

*DGI — Boleto 2908* · vence el 22/08/2026
  IVA a pagar            $ 45.320
  Anticipo IRAE          $ 12.800
  Anticipo IP            $  1.117
  ────────────────────────────────
  Subtotal DGI           $ 59.237

*BPS* · vence el 10/08/2026
  Aportes                $ 88.400

*TOTAL A PAGAR: $ 147.637*

Saludos, [Nombre del estudio]
```

**Reglas de armado:**

1. **Solo se incluyen las líneas que existen para ese cliente.** Un cliente con IVA Mínimo y nada más recibe una sola línea. Un cliente sin empleados no lleva bloque de BPS.
2. **Los montos del bloque DGI salen del cálculo**, no de carga manual. Si el contador todavía no cargó la facturación del mes, el mensaje **no se puede enviar** y hay que avisarlo.
3. **El monto de BPS se carga a mano** (ver 3.2.2) e igual que hoy es opcional.
4. **El subtotal DGI solo aparece si hay más de una línea.** Con una sola línea es ruido.
5. **El total solo aparece si hay bloque DGI y bloque BPS.** Si hay uno solo, el subtotal ya es el total.
6. **Las fechas de vencimiento van calculadas y escritas completas** — nada de "vto. día 22". El cliente tiene que leer una fecha, no interpretarla.
7. **Los números van alineados en columna.** WhatsApp usa monoespaciada dentro de bloques de código; hay que evaluar si conviene usarla para que las cifras queden derechas.
8. **Si el certificado de crédito cubrió parte del boleto**, tiene que decirlo: *"(se aplicaron $ 20.000 de certificado de crédito)"*.
9. **Antes de enviar, el contador tiene que poder ver y editar el mensaje.** Hoy se abre WhatsApp directo, sin previsualización. Con el desglose completo eso deja de ser aceptable: hay que mostrar una vista previa con el texto final antes de salir.

**Validaciones antes de enviar:**

| Situación | Qué pasa |
|---|---|
| WhatsApp del cliente vacío o inválido | No se puede enviar, se explica por qué y se ofrece completarlo |
| Facturación del mes sin cargar | No se puede enviar; se ofrece ir al Cálculo del mes |
| Total en 0 | Se avisa antes de enviar |

**c) Cuatro mensajes rápidos** *(solapa Comercial)*

| Botón | Mensaje |
|---|---|
| Vencimiento | *"Hola, te recuerdo que el próximo vencimiento es el 22/MM/AAAA."* |
| Honorario pend. | *"Hola, el honorario del período MM/AAAA está pendiente."* |
| Pago confirmado | *"Hola, confirmamos que el pago fue procesado correctamente."* |
| Documentación | *"Hola, necesitamos documentación para el período MM/AAAA."* |

### 10.4. Lo que hay que agregar

**Requisito nuevo: desde cualquier lugar donde aparezca un cliente, se tiene que poder salir a WhatsApp y a los tres organismos.**

Hoy eso solo está en el encabezado de la ficha. **Tiene que estar también en:** el listado de clientes · la grilla del Panel · las filas de vencimientos · el panel del día del calendario · los resultados del buscador.

**Requisito relacionado — acciones rápidas de cliente:** desde cualquier lugar donde aparezca un cliente, se tiene que poder hacer casi todo lo suyo sin abrir la ficha completa. El patrón sugerido es un **panel lateral de acciones rápidas** que se abre desde cualquier mención del cliente y ofrece: WhatsApp · DGI · BPS · BSE · ver obligaciones del mes · marcar pagado/notificado · ver credenciales · agregar tarea · agregar incidencia · abrir la ficha completa.

**Reglas que ese panel tiene que respetar:** todos los bloqueos de la sección 6 y todas las visibilidades de la sección 7 valen igual ahí. Si el check de BPS está bloqueado por nóminas en la ficha, tiene que estar bloqueado en el panel rápido, con el mismo texto.

---

## 11. Formatos de datos

### 11.1. RUT — **sin puntos**

El RUT uruguayo son **12 dígitos corridos**, y así están guardados: `219035810010` · `212334200012` · `213415590013` · `220808140016`.

> **Se muestra sin puntos ni separadores.** En tipografía monoespaciada, para que se puedan comparar columnas de un vistazo.

Lo mismo para el **Nº de empresa BPS** (`7755330`, `1886112`) y la **cédula**.

### 11.2. Dinero

| Contexto | Formato | Ejemplo |
|---|---|---|
| Pantalla, montos redondos | es-UY sin decimales | `$ 312.480` |
| Pantalla, liquidación de sueldos | es-UY con 2 decimales | `$ 33.959,20` |
| **Recibo de sueldo impreso** | **en-US** *(formato del documento oficial)* | `$ 33,959.20` |

> **⚠️ El formato del recibo impreso es distinto a propósito**: replica el documento oficial en uso. **No unificarlo.** Es la única excepción.

**Todos los números en columna llevan cifras tabulares** (`font-variant-numeric: tabular-nums`) para que las unidades queden alineadas.

### 11.3. Fechas

| Contexto | Formato | Ejemplo |
|---|---|---|
| Guardado interno | ISO | `2026-07-22` |
| Pantalla | día/mes/año | `22/07/2026` |
| Vencimientos | día/mes/año | `22/08/2026` |
| Período | mes/año | `07/2026` |
| Período en títulos y recibos | mes en palabra | `Julio 2026` |
| Encabezado del recibo | abreviado | `Jul-26` |
| Cierre de balance | día/mes | `30/06` |

### 11.4. Porcentajes

Con **coma** decimal, y sin decimal si es entero: `15%` · `2,8%` · `0,1%` · `1,5%`

---

## 12. Lo que NO existe

> **Para que no se diseñe.** Si algo de esta lista aparece en una pantalla, el diseño no se puede implementar.

**Nada de esto existe, y no puede existir sin cambiar la arquitectura de la aplicación:**

| No existe | Por qué |
|---|---|
| **Backend, servidor, base de datos** | Todo vive en el navegador del usuario, en su propia máquina |
| **Sincronización entre usuarios** | Dos personas en dos computadoras **no comparten nada**. Cada una tiene su copia. |
| **Integración con DGI, BPS o BSE** | Los organismos solo se abren en una pestaña. No hay lectura ni envío automático. |
| **Chat entre usuarios** | Requiere servidor. Ver la nota abajo. |
| **Notificaciones entre usuarios** | Idem |
| **Gestión de equipo** | Hay 3 usuarios fijos escritos en el código, con contraseñas en texto plano |
| **Carga de archivos o documentos** | No hay dónde guardarlos |
| **Historial, auditoría, timeline de cambios** | No se registra quién cambió qué ni cuándo |
| **Deshacer** | Todo cambio es inmediato y definitivo |
| **Flujo de estados en obligaciones** | Solo dos marcas independientes: Pagado y Notificado |
| **Responsable por obligación** | Solo las **tareas** se delegan |
| **Importar Excel de proveedores o facturas** | Los botones existen y muestran "próximamente" |
| **Modo oscuro** | Ver nota abajo |

### 12.1. Nota sobre el chat entre usuarios *(pedido nuevo)*

**Un chat entre usuarios es imposible en la arquitectura actual.** Los datos de cada usuario viven en su propio navegador; no hay ningún punto en común por donde puedan pasar mensajes. Dos usuarios en dos computadoras distintas están, hoy, completamente aislados.

Para tenerlo hacen falta **tres cosas nuevas**: un servidor, cuentas de usuario reales, y una conexión en vivo. En la práctica: mover la app a Supabase (que ya se usa en otros proyectos) — autenticación, base de datos y mensajería en tiempo real vienen resueltos.

**Es una decisión de producto, no de diseño.** Tres caminos posibles:

1. **Diseñarlo ahora, construirlo después.** Design dibuja el panel de tareas con el chat y el popup, pero se implementa recién cuando haya backend. Riesgo: pantallas terminadas que no se pueden usar durante meses.
2. **Migrar a backend primero.** Es la solución de fondo — además arregla que hoy cada usuario tenga su propia copia de los datos, que ya es un problema real. Pero es un proyecto en sí mismo.
3. **Reemplazarlo por algo que sí funciona hoy:** notas e incidencias por cliente, con el nombre del autor y la fecha, visibles para todo el equipo. **No es un chat en vivo**, pero cubre el 80% del uso real ("dejale dicho a la secretaria que a este cliente le falta la factura") y se puede construir sin servidor.

**Mi recomendación: diseñar la opción 3 ahora y dejar el chat en vivo anotado como fase 2.** Pero es tu decisión, y hasta que la tomes design no debería dibujar el chat.

### 12.2. Nota sobre el modo oscuro *(pedido nuevo)*

**El modo claro/oscuro es una buena decisión de diseño y hay que hacerlo.** Pero hoy es técnicamente imposible: los colores viven en un objeto de JavaScript que se sobreescribe a sí mismo, y la aplicación no se entera cuando cambia.

**Es el mismo arreglo que ya recomendé en el inventario** (pasar los colores a variables CSS). O sea: no es trabajo extra, es el mismo trabajo, y habilita las dos cosas — las dos marcas y los dos modos. **Ese arreglo tiene que ser el paso 1 de la implementación.**

---

## 13. Inconsistencias detectadas — decisiones pendientes

Cosas donde el código actual **se contradice a sí mismo**. No son opiniones de diseño: son diferencias reales que hay que resolver antes de implementar.

### 13.1. ✅ RESUELTO — FRL

**Decisión del estudio (31/7/2026): la tasa correcta es 0,125%.**

El código de liquidación de sueldos usa **0,1%** y lo rotula así en pantalla. **Hay que corregir el cálculo y la etiqueta.** El otro lugar de la app (la liquidación estimada de la ficha del empleado) ya usa 0,125% y queda como está.

> **Impacto:** afecta a todos los recibos que se emitan de ahora en más. Los ya emitidos con 0,1% quedan con una diferencia de 0,025% sobre el gravado — sobre un sueldo de $40.000 son $10 por recibo. El estudio decide si corresponde ajustar algo hacia atrás.

### 13.2. ✅ RESUELTO — Cálculo único del 2908

**Decisión del estudio (31/7/2026): el Boleto 2908 es el consolidado de todos los impuestos DGI del mes, calculado desde el período.**

Se elimina el cálculo paralelo que leía de los campos sueltos a nivel cliente (`ivaVentasMes`, `ivaComprasMes`, `ivaFavorAcumulado`). **Queda una sola fuente: el cálculo del mes.**

Y se agrega al boleto una línea que hoy no existe: **el anticipo de IRPF** (ver 3.2.1, pendiente definir cómo se calcula).

**Ver la definición completa en la sección 3.2.**

### 13.3. Valores por defecto desactualizados

| Concepto | Por defecto en el código | Valor 2026 vigente |
|---|---|---|
| IVA Mínimo | $4.500 | **$5.910** |
| IRAE mínimo mensual | $6.550 | **$6.840** |
| BPC *(en el cálculo de sueldos)* | $6.756 | **$6.864** |

Si la configuración del estudio está bien cargada, se usa la de configuración. Pero si falta, se cae a estos valores viejos **sin avisar**.

### 13.4. Tres ventanas de "próximos vencimientos"

7 días *(campana)*, 9 días *(alertas)* y una fecha fija rota *(panel)*. Ver 8.3.

### 13.5. Los usuarios de delegación son siempre los de Valeria

El desplegable "Delegar a" del módulo de Tareas usa siempre la lista de usuarios de Valeria Calvette, **incluso cuando el estudio activo es Laser Solutions**. Un usuario de Laser ve nombres que no son de su estudio.

### 13.6. Certificados DGI en dos pantallas

El mismo dato se edita desde la solapa **Datos** y desde la solapa **Tributario**, con dos interfaces distintas, dos formularios de alta distintos y distinto comportamiento al eliminar. **A unificar en una sola.**

### 13.7. ✅ RESUELTO — Un solo número para "cuánto pagar este mes"

Antes había tres: el Cálculo del mes, el Desglose 2908 (con otra fuente de datos) y los Boletos cargados a mano.

**Con la decisión de la sección 3.2 queda una sola cadena:**

```
Facturación del mes cargada
        ↓
Cálculo del mes  (IVA · IRAE · IRPF · IP · ICOSA)
        ↓
TOTAL BOLETO 2908  ← un único número
        ↓
        ├─→ importe al lado de la obligación en las listas
        ├─→ monto del boleto DGI en Operativo
        └─→ mensaje de WhatsApp para el cliente
```

**Los tres destinos muestran el mismo número siempre.** Si difieren, es un error.

**Para el diseño:** esta cadena es la columna vertebral de la app. El contador carga la facturación en un solo lugar y todo lo demás se deduce. Diseñarla como un recorrido claro — de la carga al mensaje enviado — es probablemente la decisión de arquitectura de información más importante del rediseño.

**BPS queda aparte**, con su propio boleto, su propio vencimiento y su monto cargado a mano (ver 3.2.2).

### 13.8. Cosas que hoy no se guardan

| Dato | Qué pasa |
|---|---|
| Marcas **Pagado / Notificado** de obligaciones | Se pierden al cambiar de pantalla |
| **Proveedores** del estudio | Se pierden al recargar |
| **Meses cerrados** | Se pierden al recargar |

**Son bugs, no decisiones de diseño.** Hay que arreglarlos en la implementación. El más grave es el primero: es una acción que el contador hace decenas de veces por mes y que no queda registrada.

### 13.9. ⚠️ NUEVA — Cliente con IVA pero sin renta se queda sin boleto

Detectada al escribir la definición consolidada del 2908.

**La regla actual** para que aparezca la obligación *"Anticipo impuestos – Boleto 2908"* exige que la renta **no sea** `ninguno`. Pero un cliente puede tener **IVA básica y renta ninguno**: paga IVA todos los meses y **no le aparece ningún boleto donde pagarlo**.

Bajo la definición nueva —el 2908 es el consolidado de todo lo que se le paga a DGI— esa condición no se sostiene: **si hay algo que pagar, tiene que haber boleto.**

**Regla propuesta, a confirmar:**
> El Boleto 2908 aparece si el cliente tiene **al menos una línea con importe** (IVA a pagar, IRAE, IRPF, IP o ICOSA), y el IVA **no** es monotributo.

Es más simple que la actual y no deja a nadie afuera. **Necesita tu confirmación** antes de implementarla.

---

## Resumen para el diseñador

Si solo leés una parte de este documento, que sea esta:

1. **Las obligaciones no se crean a mano.** Salen solas del régimen fiscal del cliente. Cambiás el IVA, cambian las obligaciones.
2. **El Boleto 2908 es el corazón de la app.** Es el consolidado de todo lo que el cliente le paga a DGI ese mes — IVA, IRAE, IRPF, Patrimonio, ICOSA, en cualquier combinación. Sale de una sola carga (la facturación del mes) y alimenta tres lugares: la lista de obligaciones, el boleto de Operativo y el mensaje de WhatsApp al cliente. **Ese recorrido, de la carga al mensaje enviado, es lo más importante a diseñar.** BPS va aparte.
3. **Cada obligación tiene dos marcas independientes**: Pagado y Notificado. No hay flujo de estados.
4. **Si un cliente tiene empleados, no se puede marcar como pagada la declaración de BPS hasta que todas las nóminas estén marcadas.** Es el bloqueo más importante de la app y hoy está mal explicado en pantalla.
5. **Lo de un mes se paga al mes siguiente.** El calendario muestra vencimientos del período anterior. Hay que decirlo explícitamente en pantalla.
6. **Los meses ya liquidados no se alteran.** Un aumento de sueldo con vigencia futura no cambia los recibos viejos.
7. **Cuatro cosas las ve solo el admin**: proveedores, facturación del panel, "pago recibido" y honorarios. Y quien no es admin solo ve sus propias tareas.
8. **El RUT va sin puntos**, en monoespaciada, 12 dígitos.
9. **Son dos marcas**, no una.
10. **No hay servidor.** Nada que dependa de que dos usuarios se vean entre sí puede diseñarse todavía.

---

*Documento generado leyendo el código en producción, sin modificarlo.*
