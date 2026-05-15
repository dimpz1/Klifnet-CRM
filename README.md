# KLIFNET CRM

KLIFNET CRM para administracion de equipos Wialon, clientes, cobros mensuales/anuales/semestrales, lineas celulares, prefacturacion y generacion de cotizaciones en XLSX/PDF.

## Ejecutar

```powershell
.\iniciar-crm.ps1
```

Abre `http://127.0.0.1:8787`.

Para usarlo desde otros equipos de la misma red WiFi, ejecuta el script y abre la URL LAN que muestra PowerShell, por ejemplo `http://192.168.1.183:8787/`.

El CRM pide login por correo. El primer arranque crea un admin para `felipe.gomez@klifnet.com` y guarda la clave temporal en `data/admin-inicial.txt`.

El CRM guarda estado, usuarios, bases privadas y archivos subidos cifrados en `data/`. Esa carpeta no se sube a GitHub. Para pasar la app a otra PC, clona el repo y copia tambien la carpeta `data/` desde la PC servidor si quieres conservar bases, usuarios y estado.

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

## Cotizaciones

En `Cotizaciones`, captura cliente/prospecto, cantidad manual, precios y notas. No busca equipos Wialon porque la venta aun no esta instalada.

La cotizacion separa equipo GPS, instalacion dentro de ciudad, instalacion fuera de ciudad, viaticos de traslado ida/vuelta del tecnico para pueblos o servicios foraneos, sensores de combustible, dashcams y accesorios. El GPS y accesorios pueden calcularse con precio de proveedor, descuento de proveedor y porcentaje de ganancia.

Usa `Generar cotizacion XLSX + PDF` para descargar la propuesta lista para enviar.

## Notas

`Facturacion` cuenta estrictamente equipos importados desde Wialon para equipos GPS. Las lineas celulares salen de la base cifrada de `Lineas`.

Los cambios editables del CRM se guardan en el servidor cifrado. Las bases en claro no deben guardarse dentro del repo.
