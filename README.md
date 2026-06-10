# KLIFNET CRM

KLIFNET CRM para administracion de equipos Wialon, clientes, cobros mensuales/anuales/semestrales, lineas celulares, prefacturacion y generacion de cotizaciones en XLSX/PDF.

## Ejecutar

```powershell
.\iniciar-crm.ps1
```

Tambien puedes abrir `iniciar-crm.bat` con doble clic desde la carpeta principal.

Abre `http://127.0.0.1:8787`.

Para usarlo desde otros equipos de la misma red WiFi, ejecuta el script y abre la URL LAN que muestra PowerShell, por ejemplo `http://192.168.1.183:8787/`.

El CRM pide login por correo. En una instalacion nueva, primero crea tu cuenta desde la pantalla de login con correo autorizado + token.

Solo se aceptan estos correos para crear cuenta: `felipe.gomez@klifnet.com` e `isaacgestrada94@gmail.com`. El primer correo creado queda como admin; los siguientes quedan como usuarios normales.

El CRM guarda estado, usuarios, bases privadas y archivos subidos cifrados en `data/`. Esa carpeta no se sube a GitHub. Para pasar la app a otra PC, clona el repo y copia tambien la carpeta `data/` desde la PC servidor si quieres conservar bases, usuarios y estado.

Algunas bases semilla pueden subirse cifradas una vez dentro de `data/private-files/`. La llave `data/secret.key`, `.env`, passwords, tokens y respaldos locales no deben subirse; sin esa llave las bases cifradas no se pueden abrir en otra PC.

Cada usuario puede cambiar su password desde `Cuenta` / `Usuarios`, ya sea con password actual o con token enviado a su correo. La recuperacion genera un token dinamico; si no hay un servicio de correo configurado, el token queda solo en la PC servidor en `data/password-reset-tokens.txt`. Tambien puedes generar tokens de un solo uso con:

```powershell
node scripts\generate-one-time-tokens.mjs 10000 --force
```

Ese comando guarda hashes cifrados en `data/one-time-tokens.enc` y una lista local en claro `data/one-time-tokens-*.csv`. La lista en claro debe guardarse fuera de GitHub.

## SMTP

Para que `Olvide mi password` mande el token por correo:

1. Copia `.env.example` como `.env`.
2. Llena `KLIFNET_SMTP_HOST`, `KLIFNET_SMTP_PORT`, `KLIFNET_SMTP_USER`, `KLIFNET_SMTP_PASS` y `KLIFNET_SMTP_FROM`.
3. Reinicia el CRM con `iniciar-crm.bat` o `.\iniciar-crm.ps1`.
4. Prueba desde la pantalla de login con `Enviar token`.

El archivo `.env` no se sube a GitHub. Si SMTP falla o no esta configurado, el token queda como respaldo local en `data/password-reset-tokens.txt`.

## Extraer facturas enviadas

Para sacar una relacion de correos enviados con PDF de factura, ejecuta el script en la PC donde esta el correo o donde puedas leer el buzon por IMAP.

Variables recomendadas en `.env` de esa PC:

```env
KLIFNET_IMAP_HOST=imap.gmail.com
KLIFNET_IMAP_PORT=993
KLIFNET_IMAP_SECURE=true
KLIFNET_IMAP_USER=tu-correo@gmail.com
KLIFNET_IMAP_PASS=tu-app-password
KLIFNET_IMAP_SENT_BOX=[Gmail]/Sent Mail
```

Comando para revisar enviados del 01/06/2026:

```powershell
npm install
npm run extraer:facturas-enviadas -- --date 2026-06-01
```

El resultado queda en `outputs/facturas_enviadas/2026-06-01/` con:

- `relacion_facturas_enviadas_2026-06-01.xlsx`
- copia de PDFs relacionados en `pdfs/`
- JSON de respaldo para auditoria

Si no quieres conectar IMAP, exporta correos como `.eml` o junta PDFs en una carpeta y corre:

```powershell
npm run extraer:facturas-enviadas -- --date 2026-06-01 --source dir --source-dir "C:\ruta\a\correos"
```

## Wialon

1. Exporta tus unidades/dispositivos desde Wialon en XLSX o CSV.
2. Carga el archivo con `Actualizar Wialon`.
3. El CRM conserva configuraciones de cobro, agrega equipos nuevos, actualiza existentes por `UID` o `IMEI`, y marca como `no encontrado` lo que ya no salga en la exportacion.

Los equipos marcados como `no encontrado` o con `Desactivacion` no se cuentan como facturables.

## Empresas

En `Empresas`, abre cualquier empresa para registrar su email de facturacion. Ese email se conserva al actualizar Wialon y sale en el XLSX de prefacturacion.

## Cobros

En `Cobros`, puedes filtrar por empresa, grupo y buscar por equipo, UID o IMEI. Cada equipo puede quedar como:

- `Mensual`
- `Semestral`
- `Anual por equipo`, con fecha de renovacion

Cada equipo puede tener precio pactado, fecha de venta y nota del acuerdo. Si lo dejas vacio, usa el precio general mensual de `$297.50` o el anual definido en `Facturacion`.

## Lineas

En `Lineas`, el CRM permite importar bases de lineas celulares activas, buscar por ICC/ICCID o IMEI, y separar lineas activas y desactivadas. Tambien permite clasificar lineas como:

- `Emprenet`
- `Telcel prepago`
- `Telcel post pago`
- `M2M`
- `Emnify`

La clasificacion automatica por ICCID usa estas reglas: `8934` y `8949` son Emnify; `8952` sin telefono es Emprenet; `8952` con telefono es Telcel.

Las lineas pueden ligarse a equipos por IMEI o manejarse como venta independiente de linea celular con renovacion anual. Tambien reconoce renovaciones escritas como `bernardo 15 mayo 2026`.

## Prefacturacion

1. En `Facturacion`, usa `Aplicar pagos pactados` para cargar `Klifnet_Admon_Mensual_Pagos.xlsx`, o `Importar pagos XLSX` para cargar una version nueva.
2. El CRM compara primero por `UID/IMEI`, despues por `empresa + nombre de equipo`, y al final por nombre de equipo.
3. Los equipos encontrados toman `Tipo de Pago`, `Importe` y meses de pago. Soporta mensual, anual y semestral.
4. Los equipos Wialon que no esten en el archivo de pagos quedan como mensuales.
5. Elige el periodo: `Mes actual`, `Mes siguiente` o `Mes anterior`.
6. Por defecto trabaja con `Mes siguiente`, pensado para preparar prefacturas al cierre de mes.
7. Usa `Generar prefactura`.
8. Usa `Exportar XLSX` para descargar un archivo con resumen por cliente y detalle de partidas.

Las lineas celulares con renovacion del periodo tambien entran a la prefacturacion. Bernardo queda preparado a `$550` por linea anual.

### Preparacion API de facturas

En `Facturacion`, usa `Preparar facturas API` para revisar el lote y `Crear facturas API` para mandarlo al conector interno.

La regla del payload es:

- 1 factura por `razon social / empresa + grupo de facturacion`.
- Cada factura incluye sus destinatarios, RFC, periodo, subtotal, IVA y total.
- Cada partida corresponde a un equipo o linea facturada con su precio pactado, IMEI, UID, ICCID, ciclo, vendedor y grupo de facturacion.
- Si falta RFC, correo, partidas o total, esa factura queda bloqueada y no se envia al API.

Mientras no exista API externa configurada, el servidor responde en modo simulacion y valida el lote sin emitir facturas. Para activar el llamado real, agrega al `.env` del servidor:

```env
KLIFNET_INVOICE_API_URL=https://tu-api-de-facturas/crear
KLIFNET_INVOICE_API_TOKEN=token-opcional
KLIFNET_INVOICE_API_TIMEOUT_MS=60000
```

## Cotizaciones

En `Cotizaciones`, captura cliente/prospecto, cantidad manual, precios y notas. No busca equipos Wialon porque la venta aun no esta instalada.

La cotizacion separa equipo GPS, instalacion dentro de ciudad, instalacion fuera de ciudad, viaticos de traslado ida/vuelta del tecnico para pueblos o servicios foraneos, sensores de combustible, dashcams y accesorios. El GPS y accesorios pueden calcularse con precio de proveedor, descuento de proveedor y porcentaje de ganancia.

Usa `Generar cotizacion XLSX + PDF` para descargar la propuesta lista para enviar.

## Notas

`Facturacion` cuenta estrictamente equipos importados desde Wialon para equipos GPS. Las lineas celulares salen de la base cifrada de `Lineas`.

Los cambios editables del CRM se guardan en el servidor cifrado. Las bases en claro no deben guardarse dentro del repo.
