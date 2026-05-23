<template>
  <q-page class="bg-grey-1">

    <!-- ══ CABECERA ══════════════════════════════════════════════════════ -->
    <div class="q-pa-md q-pb-0">
      <div class="row items-center q-mb-md">
        <q-btn flat round dense icon="arrow_back" color="grey-8" @click="router.back()" />
        <div class="text-h6 text-weight-bold q-ml-sm text-grey-9">
          Órdenes de Compra / Liquidación
        </div>
        <q-space />
        <q-btn
          v-if="puedeVerCierre"
          unelevated
          color="orange-8"
          icon="lock_clock"
          label="Cierre del Día"
          :loading="cerrando"
          :disable="!cierreHabilitado"
          class="q-mr-sm"
          @click="dialogCierre = true"
        />
        <q-btn flat round icon="refresh" color="grey-6" :loading="loading" @click="cargar">
          <q-tooltip>Recargar</q-tooltip>
        </q-btn>
      </div>

      <!-- ── Filtros ── -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="q-py-sm">
          <div class="row q-col-gutter-sm items-end">
            <div class="col-12 col-md-3">
              <q-input v-model="filtros.search" dense outlined clearable
                label="Buscar boleta / ticket / productor" debounce="400"
                @update:model-value="cargar">
                <template #prepend><q-icon name="search" /></template>
              </q-input>
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model="filtros.fecha" dense outlined clearable label="Fecha exacta"
                type="date" @update:model-value="alCambiarFecha" />
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model="filtros.fechaDesde" dense outlined clearable label="Desde"
                type="date" :disable="!!filtros.fecha"
                @update:model-value="alCambiarRango" />
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model="filtros.fechaHasta" dense outlined clearable label="Hasta"
                type="date" :disable="!!filtros.fecha"
                @update:model-value="alCambiarRango" />
            </div>
            <div class="col-6 col-md-3">
              <q-btn flat color="grey-7" icon="filter_alt_off" label="Hoy" dense
                @click="resetearAHoy" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-separator />

    <!-- ══ TABLA ÚNICA ════════════════════════════════════════════════════ -->
    <div class="q-pa-md">
      <q-card flat bordered class="overflow-hidden">
        <q-table
          :rows="filas"
          :columns="columnas"
          :loading="loading"
          row-key="preliquidacionId"
          flat
          :pagination="{ rowsPerPage: 0 }"
          hide-pagination
          no-data-label="Sin órdenes — ajusta el filtro de fechas"
        >
          <template #header="props">
            <q-tr :props="props" style="background: #E65100">
              <q-th v-for="col in props.cols" :key="col.name" :props="props"
                style="color: white; font-weight: 700; font-size: 12px; white-space: normal; text-align: center; line-height: 1.3">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template #body-cell-folioOC="{ row, value }">
            <q-td class="text-center">
              <span class="text-weight-bold cursor-pointer"
                style="color: #E65100; font-size: 14px"
                @click="abrirDetalle(row as OrdenCompraGrano)">
                {{ value }}
              </span>
            </q-td>
          </template>

          <template #body-cell-pesoNeto="{ value }">
            <q-td class="text-right">{{ fmtNum(value) }}</q-td>
          </template>

          <template #body-cell-pesoALiquidar="{ value }">
            <q-td class="text-right">{{ fmtNum(value) }}</q-td>
          </template>

          <template #body-cell-importeAPagar="{ value }">
            <q-td class="text-right text-weight-bold" style="color: #2e7d32; font-size: 14px">
              {{ fmtMoney(value) }}
            </q-td>
          </template>

          <template #body-cell-cierreDia="{ value }">
            <q-td class="text-center">
              <q-badge v-if="value === 'finalizado'" color="positive" label="Cerrado" />
              <q-badge v-else-if="value === 'rechazado'" color="deep-orange" label="Rechazado" />
              <q-badge v-else-if="value === 'cancelado'" color="grey-6" label="Cancelado por Corte Diario" />
              <q-badge v-else color="blue-6" label="Activo" />
            </q-td>
          </template>

          <template #body-cell-acciones="{ row }">
            <q-td class="text-center">
              <q-btn unelevated dense color="deep-orange-8" icon="visibility" label="Ver OC"
                size="sm" style="border-radius: 6px; font-size: 12px"
                @click="abrirDetalle(row as OrdenCompraGrano)" />
            </q-td>
          </template>
        </q-table>

        <!-- Footer totales -->
        <div class="row items-center q-pa-sm q-px-md"
          style="border-top: 1px solid #e0e0e0; background: #fafafa; flex-wrap: wrap; gap: 4px">
          <div class="text-caption text-grey-7 col-auto">
            {{ filas.length }} orden{{ filas.length !== 1 ? 'es' : '' }}
          </div>
          <q-space />
          <div class="text-caption text-grey-7 q-mr-md">
            Total Kg Liquidar:
            <strong class="text-grey-9">{{ fmtNum(totalKg) }} kg</strong>
          </div>
          <div class="text-caption text-grey-7">
            Total Importe:
            <strong style="color: #2e7d32">{{ fmtMoney(totalImporte) }}</strong>
          </div>
        </div>
      </q-card>
    </div>

    <!-- ══ DIALOG CIERRE DEL DÍA ════════════════════════════════════════ -->
    <q-dialog v-model="dialogCierre" persistent>
      <q-card style="min-width: 340px">
        <q-card-section class="bg-orange-8 text-white row items-center">
          <q-icon name="lock_clock" size="sm" class="q-mr-sm" />
          <span class="text-h6">Cierre del Día</span>
        </q-card-section>
        <q-card-section class="q-pt-md">
          <p class="text-body2 text-grey-7 q-mb-md">
            Se procesarán todos los registros activos del día. Esta acción no se puede deshacer.
            Ingrese su NIP para confirmar.
          </p>
          <q-input
            v-model="nipCierre"
            :type="nipVisible ? 'text' : 'password'"
            label="NIP"
            outlined
            dense
            autofocus
            @keyup.enter="ejecutarCierre"
          >
            <template #append>
              <q-icon
                :name="nipVisible ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="nipVisible = !nipVisible"
              />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup @click="nipCierre = ''" />
          <q-btn unelevated color="orange-8" label="Confirmar Cierre"
            :disable="nipCierre.length < 4" @click="ejecutarCierre" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══ DIALOG DETALLE ════════════════════════════════════════════════ -->
    <q-dialog v-model="dialogDetalle" maximized>
      <q-card>
        <q-toolbar class="bg-grey-2 text-grey-9">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-subtitle1 text-weight-bold">
            Orden de Compra / Liquidación
          </q-toolbar-title>
          <q-btn flat round dense icon="print" @click="imprimirOC">
            <q-tooltip>Imprimir</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="download" :loading="descargandoPDF" @click="descargarOC">
            <q-tooltip>Descargar PDF</q-tooltip>
          </q-btn>
        </q-toolbar>

        <q-card-section class="q-pa-md">
          <div v-if="loadingDetalle" class="text-center q-pa-xl">
            <q-spinner color="primary" size="lg" />
          </div>

          <div v-else-if="detalle" id="oc-print-area"
            style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; font-size: 13px; background: white; padding: 16px">

            <!-- Título + Folio/Fecha -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 0">
              <tr style="border-bottom: 2px solid #1a1a1a">
                <td style="text-align: center; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 10px">
                  ORDEN DE COMPRA / LIQUIDACIÓN
                </td>
                <td style="width: 180px; vertical-align: top; padding-bottom: 10px">
                  <table style="border-collapse: collapse; width: 100%; font-size: 12px">
                    <tr>
                      <td style="border: 1px solid #555; padding: 4px 8px; font-weight: 700; background: #f5f5f5">FOLIO</td>
                      <td style="border: 1px solid #555; padding: 4px 8px; font-weight: 700; text-align: center">{{ detalle.folioOC }}</td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid #555; padding: 4px 8px; font-weight: 700; background: #f5f5f5">FECHA</td>
                      <td style="border: 1px solid #555; padding: 4px 8px; text-align: center">{{ fmtFechaCorta(detalle.fecha) }}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <div style="height: 10px"></div>

            <!-- Cuadrícula datos -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px">
              <tbody>
                <tr>
                  <td class="oc-label">PRODUCTOR</td>
                  <td class="oc-value">{{ detalle.productor || '—' }}</td>
                  <td class="oc-label">PESO BRUTO</td>
                  <td class="oc-value text-right">{{ fmtNum(detalle.pesoBruto) }}</td>
                </tr>
                <tr>
                  <td class="oc-label">PRODUCTO</td>
                  <td class="oc-value">{{ detalle.producto || '—' }}</td>
                  <td class="oc-label">PESO NETO</td>
                  <td class="oc-value text-right">{{ fmtNum(detalle.pesoNeto) }}</td>
                </tr>
                <tr>
                  <td class="oc-label">PREDIO / ORIGEN</td>
                  <td class="oc-value">{{ detalle.origen || '—' }}</td>
                  <td class="oc-label">TICKET DE BÁSCULA</td>
                  <td class="oc-value">{{ detalle.ticket || '—' }}</td>
                </tr>
                <tr>
                  <td class="oc-label">BODEGA RECEPCIÓN</td>
                  <td class="oc-value">{{ detalle.bodegaRecepcion || '—' }}</td>
                  <td class="oc-label">CHOFER</td>
                  <td class="oc-value">{{ detalle.chofer || '—' }}</td>
                </tr>
                <tr>
                  <td class="oc-label">COMPRADOR</td>
                  <td class="oc-value">{{ detalle.comprador || '—' }}</td>
                  <td class="oc-label">BOLETA</td>
                  <td class="oc-value">{{ detalle.boleta || '—' }}</td>
                </tr>
                <tr>
                  <td class="oc-label">PRECIO</td>
                  <td class="oc-value">{{ fmtMoney(detalle.precio) }}</td>
                  <td class="oc-label">DÍAS DE PAGO</td>
                  <td class="oc-value text-center">{{ detalle.diasPago ?? 1 }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Resumen liquidación -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; text-align: center">
              <thead>
                <tr>
                  <th class="oc-th">PESO NETO</th>
                  <th class="oc-th">TOTAL DEDUCCIONES</th>
                  <th class="oc-th">PESO A LIQUIDAR</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="oc-td-big">{{ fmtNum(detalle.pesoNeto) }}</td>
                  <td class="oc-td-big">{{ fmtNum(detalle.totalDeducciones) }}</td>
                  <td class="oc-td-big">{{ fmtNum(detalle.pesoALiquidar) }}</td>
                </tr>
                <tr>
                  <td class="oc-label" style="text-align: left; font-size: 13px">IMPORTE A PAGAR</td>
                  <td colspan="2" class="oc-td-importe"
                    style="font-size: 18px; font-weight: 700; color: #1b5e20; text-align: center">
                  </td>
                </tr>
                <tr>
                  <td colspan="3" style="border: 1px solid #bbb; height: 32px">&nbsp;</td>
                </tr>
              </tbody>
            </table>

            <!-- Firmas -->
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px">
              <tr>
                <th class="oc-firma">PRODUCTOR ANALISTA</th>
                <th class="oc-firma">ANALISTA</th>
                <th class="oc-firma">VERIFICADOR</th>
              </tr>
              <tr>
                <td style="border: 1px solid #bbb; height: 64px; border-top: none"></td>
                <td style="border: 1px solid #bbb; height: 64px; border-top: none"></td>
                <td style="border: 1px solid #bbb; height: 64px; border-top: none"></td>
              </tr>
            </table>

            <!-- Footer doc -->
            <div style="text-align: center; font-size: 10px; color: #888; border-top: 1px solid #ccc; padding-top: 6px">
              AgroAlazan — Documento generado automáticamente del sistema de recepción de granos
            </div>

          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useConfiguracionStore } from 'src/stores/configuracionStore'
import { jsPDF } from 'jspdf'
import alazanLogoUrl from 'src/assets/alazanLogo.png'

const $q               = useQuasar()
const router           = useRouter()
const authStore        = useAuthStore()
const configuracionStore = useConfiguracionStore()
const descargandoPDF   = ref(false)

// ─── Cierre del Día ────────────────────────────────────────────────────────────
const cerrando     = ref(false)
const dialogCierre = ref(false)
const nipCierre    = ref('')
const nipVisible   = ref(false)

const puedeVerCierre = computed(() => {
  const rol = authStore.user?.nombre_rol ?? ''
  return rol === 'ADMIN' || configuracionStore.rolesCierreDia.includes(rol)
})

// Deshabilitado cuando no hay registros activos que cerrar (tabla vacía o viendo históricos)
const cierreHabilitado = computed(() =>
  filas.value.length > 0 && filtros.value.soloActivos
)

watch(puedeVerCierre, (puede) => {
  if (!puede) filas.value = []
})

async function ejecutarCierre() {
  if (nipCierre.value.length < 4) return
  cerrando.value = true
  dialogCierre.value = false
  try {
    const sedeId = authStore.sedeActivaId ?? 0
    const { data } = await api.post('/api/ordenes-compra-granos/cierre-dia', {
      sedeId,
      nip: nipCierre.value,
    })
    $q.notify({
      type: 'positive',
      message: `Cierre completado. Procesados: ${data.finalizados}, Rechazados: ${data.rechazados}, Cancelados: ${data.cancelados}`,
      timeout: 5000,
    })
    void cargar()
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al ejecutar el cierre'
    $q.notify({ type: 'negative', message: msg })
  } finally {
    nipCierre.value  = ''
    nipVisible.value = false
    cerrando.value   = false
  }
}

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface OrdenCompraGrano {
  folioOC:          string        // Folio formateado "OC-2026-0001"
  boleta:           string | null
  ticket:           string | null
  productor:        string | null
  producto:         string | null
  pesoNeto:         number | null
  pesoALiquidar:    number | null
  importeAPagar:    number | null
  fecha:            string | null
  preliquidacionId: number        // ID numérico para llamadas a la API
  cierreDia:        string | null
}

interface DetalleOC {
  folioOC:          string
  boleta:           string | null
  ticket:           string | null
  productor:        string | null
  comprador:        string | null
  origen:           string | null
  precio:           number | null
  producto:         string | null
  chofer:           string | null
  pesoBruto:        number | null
  pesoNeto:         number | null
  pesoALiquidar:    number | null
  importeAPagar:    number | null
  totalDeducciones: number | null
  bodegaRecepcion:  string | null
  fecha:            string | null
  diasPago:         number | null
}

// ─── Estado ───────────────────────────────────────────────────────────────────
const filas          = ref<OrdenCompraGrano[]>([])
const loading        = ref(false)
const dialogDetalle  = ref(false)
const loadingDetalle = ref(false)
const detalle        = ref<DetalleOC | null>(null)

const filtros = ref({
  search:      '',
  fecha:       '',
  fechaDesde:  '',
  fechaHasta:  '',
  soloActivos: true,
})

// ─── Columnas ─────────────────────────────────────────────────────────────────
const columnas = [
  { name: 'folioOC',       label: 'Folio OC',        field: 'folioOC',       align: 'center' as const, sortable: true },
  { name: 'boleta',        label: 'Boleta',           field: 'boleta',        align: 'left'   as const, sortable: true },
  { name: 'ticket',        label: 'Ticket',           field: 'ticket',        align: 'left'   as const, sortable: true },
  { name: 'productor',     label: 'Productor',        field: 'productor',     align: 'left'   as const, sortable: true },
  { name: 'producto',      label: 'Producto',         field: 'producto',      align: 'left'   as const },
  { name: 'pesoNeto',      label: 'Peso Neto (kg)',   field: 'pesoNeto',      align: 'right'  as const, sortable: true },
  { name: 'pesoALiquidar', label: 'Peso a Liquidar',  field: 'pesoALiquidar', align: 'right'  as const, sortable: true },
  { name: 'importeAPagar', label: 'Importe a Pagar',  field: 'importeAPagar', align: 'right'  as const, sortable: true },
  { name: 'cierreDia',     label: 'Estado',           field: 'cierreDia',     align: 'center' as const },
  { name: 'acciones',      label: 'Ver',              field: 'acciones',      align: 'center' as const },
]

// ─── Computed ────────────────────────────────────────────────────────────────
const totalKg = computed(() =>
  filas.value.reduce((sum, r) => sum + (r.pesoALiquidar ?? 0), 0)
)
const totalImporte = computed(() =>
  filas.value.reduce((sum, r) => sum + (r.importeAPagar ?? 0), 0)
)

// ─── Carga de datos ───────────────────────────────────────────────────────────
async function cargar() {
  loading.value = true
  try {
    const sedeId = authStore.sedeActivaId ?? 0
    const { data } = await api.get('/api/ordenes-compra-granos', {
      params: {
        sedeId,
        fecha:       filtros.value.fecha      || undefined,
        fechaDesde:  !filtros.value.fecha ? (filtros.value.fechaDesde || undefined) : undefined,
        fechaHasta:  !filtros.value.fecha ? (filtros.value.fechaHasta || undefined) : undefined,
        search:      filtros.value.search     || undefined,
        soloActivos: filtros.value.soloActivos,
        _t:          Date.now(),
      },
    })
    filas.value = data ?? []
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar órdenes', position: 'top' })
  } finally {
    loading.value = false
  }
}

// ─── Filtros ─────────────────────────────────────────────────────────────────
function alCambiarFecha() {
  if (filtros.value.fecha) {
    filtros.value.fechaDesde = ''
    filtros.value.fechaHasta = ''
    filtros.value.soloActivos = false
  } else {
    filtros.value.soloActivos = true
  }
  void cargar()
}

function alCambiarRango() {
  filtros.value.soloActivos = !(filtros.value.fechaDesde || filtros.value.fechaHasta)
  void cargar()
}

function resetearAHoy() {
  filtros.value = {
    search:      '',
    fecha:       new Date().toLocaleDateString('en-CA'),
    fechaDesde:  '',
    fechaHasta:  '',
    soloActivos: true,
  }
  void cargar()
}

// ─── Detalle ─────────────────────────────────────────────────────────────────
async function abrirDetalle(oc: OrdenCompraGrano) {
  dialogDetalle.value  = true
  detalle.value        = null
  loadingDetalle.value = true
  try {
    const sedeId = authStore.sedeActivaId ?? 0
    const { data } = await api.get(`/api/ordenes-compra-granos/${oc.preliquidacionId}`, { params: { sedeId } })
    detalle.value = data
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar detalle', position: 'top' })
  } finally {
    loadingDetalle.value = false
  }
}

// ─── Builder HTML del documento OC ──────────────────────────────────────────
function buildOcHTML(d: DetalleOC): string {
  const lbl  = 'border:1px solid #bbb;padding:5px 8px;font-weight:700;background:#f5f5f5;white-space:nowrap;font-size:12px;'
  const val = 'border:1px solid #bbb;padding:5px 8px;font-size:12px;word-break:break-word;'
  const th   = 'border:1px solid #bbb;padding:6px 8px;background:#f5f5f5;font-weight:700;text-transform:uppercase;text-align:center;font-size:12px;'
  const tdBg = 'border:1px solid #bbb;padding:10px;font-size:16px;font-weight:700;text-align:center;'

  return `
<div style="font-family:Arial,sans-serif;font-size:13px;background:white;padding:24px 28px;width:100%;box-sizing:border-box;">

  <table style="width:100%;border-collapse:collapse;margin-bottom:0;table-layout:fixed;">
    <colgroup><col style="width:auto"><col style="width:160px"></colgroup>
    <tr style="border-bottom:2px solid #1a1a1a">
      <td style="text-align:center;font-size:17px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;vertical-align:middle;">
        ORDEN DE COMPRA / LIQUIDACIÓN
      </td>
      <td style="vertical-align:top;padding-bottom:10px;">
        <table style="border-collapse:collapse;width:100%;font-size:12px;">
          <tr>
            <td style="border:1px solid #555;padding:4px 8px;font-weight:700;background:#f5f5f5;white-space:nowrap;">FOLIO</td>
            <td style="border:1px solid #555;padding:4px 8px;font-weight:700;text-align:center;">${d.folioOC}</td>
          </tr>
          <tr>
            <td style="border:1px solid #555;padding:4px 8px;font-weight:700;background:#f5f5f5;white-space:nowrap;">FECHA</td>
            <td style="border:1px solid #555;padding:4px 8px;text-align:center;">${fmtFechaCorta(d.fecha)}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <div style="height:12px;"></div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:14px;table-layout:fixed;">
    <colgroup><col style="width:22%"><col style="width:28%"><col style="width:22%"><col style="width:28%"></colgroup>
    <tr><td style="${lbl}">PRODUCTOR</td><td style="${val}">${d.productor ?? '—'}</td><td style="${lbl}">PESO BRUTO</td><td style="${val};text-align:right;">${fmtNum(d.pesoBruto)}</td></tr>
    <tr><td style="${lbl}">PRODUCTO</td><td style="${val}">${d.producto ?? '—'}</td><td style="${lbl}">PESO NETO</td><td style="${val};text-align:right;">${fmtNum(d.pesoNeto)}</td></tr>
    <tr><td style="${lbl}">PREDIO / ORIGEN</td><td style="${val}">${d.origen ?? '—'}</td><td style="${lbl}">TICKET BÁSCULA</td><td style="${val}">${d.ticket ?? '—'}</td></tr>
    <tr><td style="${lbl}">BODEGA RECEPCIÓN</td><td style="${val}">${d.bodegaRecepcion ?? '—'}</td><td style="${lbl}">CHOFER</td><td style="${val}">${d.chofer ?? '—'}</td></tr>
    <tr><td style="${lbl}">COMPRADOR</td><td style="${val}">${d.comprador ?? '—'}</td><td style="${lbl}">BOLETA</td><td style="${val}">${d.boleta ?? '—'}</td></tr>
    <tr><td style="${lbl}">PRECIO</td><td style="${val}">${fmtMoney(d.precio)}</td><td style="${lbl}">DÍAS DE PAGO</td><td style="${val};text-align:center;">${d.diasPago ?? 1}</td></tr>
  </table>

  <table style="width:100%;border-collapse:collapse;margin-bottom:14px;table-layout:fixed;">
    <colgroup><col style="width:33.33%"><col style="width:33.33%"><col style="width:33.33%"></colgroup>
    <tr>
      <th style="${th}">PESO NETO</th>
      <th style="${th}">TOTAL DEDUCCIONES</th>
      <th style="${th}">PESO A LIQUIDAR</th>
    </tr>
    <tr>
      <td style="${tdBg}">${fmtNum(d.pesoNeto)}</td>
      <td style="${tdBg}">${fmtNum(d.totalDeducciones)}</td>
      <td style="${tdBg}">${fmtNum(d.pesoALiquidar)}</td>
    </tr>
    <tr>
      <td style="${lbl};text-align:left;font-size:13px;">IMPORTE A PAGAR</td>
      <td colspan="2" style="border:1px solid #bbb;padding:10px;font-size:18px;font-weight:700;color:#1b5e20;text-align:center;"></td>
    </tr>
    <tr><td colspan="3" style="border:1px solid #bbb;height:30px;">&nbsp;</td></tr>
  </table>

  <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:20px;table-layout:fixed;">
    <colgroup><col style="width:33.33%"><col style="width:33.33%"><col style="width:33.33%"></colgroup>
    <tr>
      <th style="${th}">PRODUCTOR ANALISTA</th>
      <th style="${th}">ANALISTA</th>
      <th style="${th}">VERIFICADOR</th>
    </tr>
    <tr>
      <td style="border:1px solid #bbb;height:60px;border-top:none;"></td>
      <td style="border:1px solid #bbb;height:60px;border-top:none;"></td>
      <td style="border:1px solid #bbb;height:60px;border-top:none;"></td>
    </tr>
  </table>

  <div style="text-align:center;font-size:10px;color:#888;border-top:1px solid #ccc;padding-top:6px;">
    AgroAlazan — Documento generado automáticamente del sistema de recepción de granos
  </div>

</div>`
}

// ─── Imprimir ─────────────────────────────────────────────────────────────────
function imprimirOC() {
  if (!detalle.value) return
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>OC-${detalle.value.folioOC}</title>
    <style>@page{size:A4;margin:12mm;}body{margin:0;}</style>
    </head><body>${buildOcHTML(detalle.value)}</body></html>`)
  win.document.close()
  setTimeout(() => { win.focus(); win.print(); win.close() }, 700)
}

// ─── Descargar PDF (jsPDF programático) ───────────────────────────────────────
async function descargarOC() {
  const d = detalle.value
  if (!d || descargandoPDF.value) return
  descargandoPDF.value = true

  try {
    const now = new Date()
    const dd  = String(now.getDate()).padStart(2, '0')
    const mm2 = String(now.getMonth() + 1).padStart(2, '0')
    const aa  = String(now.getFullYear()).slice(-2)
    const filename = `OrdenCompra_${d.folioOC}_${dd}-${mm2}-${aa}`

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const PW  = 210
    const ML  = 14
    const MT  = 14
    const CW  = PW - 2 * ML

    function cell(
      x: number, y: number, w: number, h: number,
      text: string,
      opts: { fill?: string; bold?: boolean; size?: number; align?: 'left' | 'center' | 'right' } = {},
    ) {
      const fs = opts.size ?? 9
      pdf.setDrawColor('#bbbbbb')
      pdf.setLineWidth(0.25)
      if (opts.fill) {
        pdf.setFillColor(opts.fill)
        pdf.rect(x, y, w, h, 'FD')
      } else {
        pdf.rect(x, y, w, h, 'D')
      }
      if (text) {
        pdf.setFontSize(fs)
        pdf.setFont('helvetica', opts.bold ? 'bold' : 'normal')
        pdf.setTextColor('#000000')
        const pad   = 2
        const textY = y + h / 2 + (fs * 0.352778) * 0.35
        const textX = opts.align === 'right'  ? x + w - pad
                    : opts.align === 'center' ? x + w / 2
                    : x + pad
        pdf.text(text, textX, textY, { align: opts.align ?? 'left', maxWidth: w - 2 * pad })
      }
    }

    // ── Logo Alazan ──────────────────────────────────────────────────────────
    const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload  = () => resolve(img)
      img.onerror = reject
      img.src = alazanLogoUrl
    })
    const logoH = 14
    const logoW = logoH * (logoImg.naturalWidth / logoImg.naturalHeight)
    pdf.addImage(logoImg, 'PNG', ML, MT, logoW, logoH)

    let y = MT

    // ── Caja FOLIO / FECHA ───────────────────────────────────────────────────
    const FW = 60
    const FX = ML + CW - FW
    const FH = 6
    cell(FX,          y,       FW / 2, FH, 'FOLIO', { fill: '#f5f5f5', bold: true, size: 8 })
    cell(FX + FW / 2, y,       FW / 2, FH, d.folioOC, { size: 8, align: 'center' })
    cell(FX,          y + FH,  FW / 2, FH, 'FECHA', { fill: '#f5f5f5', bold: true, size: 8 })
    cell(FX + FW / 2, y + FH,  FW / 2, FH, fmtFechaCorta(d.fecha), { size: 8, align: 'center' })

    // ── Título ───────────────────────────────────────────────────────────────
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor('#000000')
    pdf.text('ORDEN DE COMPRA / LIQUIDACIÓN', (ML + FX) / 2, y + 8, { align: 'center' })

    y += 16

    // ── Línea divisora ───────────────────────────────────────────────────────
    pdf.setDrawColor('#1a1a1a')
    pdf.setLineWidth(0.5)
    pdf.line(ML, y, ML + CW, y)
    y += 7

    // ── Cuadrícula de datos ──────────────────────────────────────────────────
    const LC = 42
    const VC = CW / 2 - LC
    const RH = 7

    const dataRows: [string, string, string, string][] = [
      ['PRODUCTOR',        d.productor       ?? '—', 'PESO BRUTO',      fmtNum(d.pesoBruto)    ],
      ['PRODUCTO',         d.producto        ?? '—', 'PESO NETO',       fmtNum(d.pesoNeto)     ],
      ['PREDIO / ORIGEN',  d.origen          ?? '—', 'TICKET BÁSCULA',  d.ticket               ?? '—'],
      ['BODEGA RECEPCIÓN', d.bodegaRecepcion ?? '—', 'CHOFER',          d.chofer               ?? '—'],
      ['COMPRADOR',        d.comprador       ?? '—', 'BOLETA',          d.boleta               ?? '—'],
      ['PRECIO',           fmtMoney(d.precio),       'DÍAS DE PAGO',    String(d.diasPago ?? 1) ],
    ]

    for (const [l1, v1, l2, v2] of dataRows) {
      cell(ML,                y, LC, RH, l1, { fill: '#f5f5f5', bold: true, size: 8 })
      cell(ML + LC,           y, VC, RH, v1, { size: 8 })
      cell(ML + LC + VC,      y, LC, RH, l2, { fill: '#f5f5f5', bold: true, size: 8 })
      cell(ML + LC + VC + LC, y, VC, RH, v2, { size: 8 })
      y += RH
    }

    y += 7

    // ── Tabla resumen ────────────────────────────────────────────────────────
    const SC = CW / 3

    cell(ML,          y, SC, 6, 'PESO NETO',         { fill: '#f5f5f5', bold: true, size: 8, align: 'center' })
    cell(ML + SC,     y, SC, 6, 'TOTAL DEDUCCIONES', { fill: '#f5f5f5', bold: true, size: 8, align: 'center' })
    cell(ML + 2 * SC, y, SC, 6, 'PESO A LIQUIDAR',   { fill: '#f5f5f5', bold: true, size: 8, align: 'center' })
    y += 6

    cell(ML,          y, SC, 12, fmtNum(d.pesoNeto),         { bold: true, size: 13, align: 'center' })
    cell(ML + SC,     y, SC, 12, fmtNum(d.totalDeducciones), { bold: true, size: 13, align: 'center' })
    cell(ML + 2 * SC, y, SC, 12, fmtNum(d.pesoALiquidar),    { bold: true, size: 13, align: 'center' })
    y += 12

    // Fila IMPORTE A PAGAR (sin valor — se llena a mano)
    cell(ML, y, SC, 8, 'IMPORTE A PAGAR', { fill: '#f5f5f5', bold: true, size: 9 })
    pdf.setDrawColor('#bbbbbb')
    pdf.setLineWidth(0.25)
    pdf.rect(ML + SC, y, 2 * SC, 8, 'D')
    y += 8

    pdf.setDrawColor('#bbbbbb')
    pdf.setLineWidth(0.25)
    pdf.rect(ML, y, CW, 8, 'D')
    y += 8 + 8

    // ── Tabla firmas ─────────────────────────────────────────────────────────
    cell(ML,          y, SC, 6, 'PRODUCTOR ANALISTA', { fill: '#f5f5f5', bold: true, size: 8, align: 'center' })
    cell(ML + SC,     y, SC, 6, 'ANALISTA',           { fill: '#f5f5f5', bold: true, size: 8, align: 'center' })
    cell(ML + 2 * SC, y, SC, 6, 'VERIFICADOR',        { fill: '#f5f5f5', bold: true, size: 8, align: 'center' })
    y += 6

    pdf.setDrawColor('#bbbbbb')
    pdf.setLineWidth(0.25)
    pdf.rect(ML,          y, SC, 22, 'D')
    pdf.rect(ML + SC,     y, SC, 22, 'D')
    pdf.rect(ML + 2 * SC, y, SC, 22, 'D')
    y += 22 + 8

    // ── Pie de página ────────────────────────────────────────────────────────
    pdf.setDrawColor('#cccccc')
    pdf.setLineWidth(0.3)
    pdf.line(ML, y, ML + CW, y)
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor('#888888')
    pdf.text(
      'AgroAlazan — Documento generado automáticamente del sistema de recepción de granos',
      PW / 2, y + 4, { align: 'center' },
    )

    pdf.save(`${filename}.pdf`)
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al generar PDF', position: 'top' })
  } finally {
    descargandoPDF.value = false
  }
}

// ─── Helpers formato ─────────────────────────────────────────────────────────
function fmtNum(val: number | null | undefined): string {
  if (val == null) return '—'
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(val)
}

function fmtMoney(val: number | null | undefined): string {
  if (val == null) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val)
}

function fmtFechaCorta(val: string | null | undefined): string {
  if (!val) return '—'
  const d = new Date(val + 'T12:00:00')
  return isNaN(d.getTime()) ? val : d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' })
}

// ─── Inicialización ───────────────────────────────────────────────────────────
onMounted(cargar)
</script>

<style scoped>
:deep(.oc-label) {
  border: 1px solid #bbb;
  padding: 5px 8px;
  font-weight: 700;
  background: #f5f5f5;
  white-space: nowrap;
}
:deep(.oc-value) {
  border: 1px solid #bbb;
  padding: 5px 8px;
}
:deep(.oc-th) {
  border: 1px solid #bbb;
  padding: 6px;
  background: #f5f5f5;
  font-weight: 700;
  text-transform: uppercase;
}
:deep(.oc-td-big) {
  border: 1px solid #bbb;
  padding: 10px;
  font-size: 16px;
  font-weight: 700;
}
:deep(.oc-td-importe) {
  border: 1px solid #bbb;
  padding: 10px;
}
:deep(.oc-firma) {
  border: 1px solid #bbb;
  padding: 8px;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  background: #f5f5f5;
}
</style>
