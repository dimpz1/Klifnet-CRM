# KLIFNET CRM

CRM local para convertir la lista exportada de dispositivos Wialon en empresas, grupos y equipos. Incluye actualizacion incremental con UID/IMEI, configuracion de cobro por equipo y prefacturacion exportable a XLSX.

## Ejecutar

```powershell
.\iniciar-crm.ps1
```

Abre `http://127.0.0.1:8787`.

La app ya incluye como base `DispositivosWialon_Abril2026.xlsx`.

## Actualizar Wialon

1. Exporta tus unidades/dispositivos desde Wialon en XLSX o CSV.
2. Carga el archivo con `Actualizar Wialon`.
3. El CRM conserva configuraciones de cobro, agrega equipos nuevos, actualiza existentes por `UID` y marca como `no encontrado` lo que ya no salga en la exportacion.

Los equipos marcados como `no encontrado` o con `Desactivacion` no se cuentan como facturables.

## Cobros

En `Empresas`, abre cualquier empresa para registrar su email de facturacion. Ese email se conserva al actualizar Wialon y sale en el XLSX de prefacturacion.

En `Cobros`, puedes filtrar por empresa, grupo y buscar por equipo, UID o IMEI. Cada equipo puede quedar como:

- `Mensual`
- `Anual por equipo`, con fecha de renovacion

Cada equipo tambien puede tener precio pactado, fecha de venta y nota del acuerdo. Si lo dejas vacio, usa el precio general mensual de `$297.50` o el anual definido en `Facturacion`. La lista de prefacturacion usa la fecha de renovacion para saber si la anualidad cae en el periodo elegido.

En `Equipos`, puedes agregar equipos manualmente y editar empresa/grupo, cobro, meses de pago y precio pactado. Los equipos manuales quedan marcados como `Manual`; sirven para control y seguimiento, pero la facturacion formal cuenta solo equipos importados desde Wialon.

## Prefacturacion

1. En `Facturacion`, usa `Aplicar pagos pactados` para cargar `Klifnet_Admon_Mensual_Pagos.xlsx`, o `Importar pagos XLSX` para cargar una version nueva.
2. El CRM compara primero por `UID/IMEI`, despues por `empresa + nombre de equipo`, y al final por nombre de equipo.
3. Los equipos encontrados toman `Tipo de Pago`, `Importe` y meses de pago. Soporta mensual, anual y semestral.
4. Los equipos Wialon que no esten en el archivo de pagos quedan como mensuales.
5. Elige el periodo: `Mes actual`, `Mes siguiente` o `Mes anterior`.
6. Usa `Generar lista`.
7. Usa `Exportar XLSX` para descargar un archivo con dos hojas: resumen por cliente y detalle por equipo.

## Cotizaciones

En `Cotizaciones`, captura cliente/prospecto, cantidad manual, precios y notas. No busca equipos Wialon porque la venta aun no esta instalada. La cotizacion separa equipo GPS, instalacion dentro de ciudad `$350`, instalacion fuera de ciudad `$600`, viaticos de traslado ida/vuelta del tecnico para pueblos o servicios foraneos, sensores de combustible y dashcams para unidades transportistas. El GPS y accesorios pueden calcularse con precio de proveedor, descuento de proveedor y porcentaje de ganancia; para Syscom el descuento default es `20%`. Usa `Generar cotizacion XLSX` para descargar la propuesta.

`Facturacion` cuenta estrictamente equipos importados desde Wialon. Si un equipo pertenece a otra empresa o grupo, cambialo en `Cobros` o `Equipos` y la prefacturacion usara esa asignacion.

Los cambios editables del CRM se guardan localmente mientras capturas.
