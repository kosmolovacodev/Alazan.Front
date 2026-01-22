<template>
  <div class="q-pa-md bg-grey-2" style="min-height: 100vh;">
    <!-- Encabezado -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="grey-8" @click="emit('volver')" />
        <div>
          <div class="text-h5 text-weight-bold">Boleta - Recepción de Granos</div>
          <div class="text-caption text-grey-7">
            {{ boletasFiltradas.length }}
            {{ boletasFiltradas.length === 1 ? 'boleta encontrada' : 'boletas encontradas' }}
          </div>
        </div>
      </div>

      <q-btn color="primary" unelevated icon="filter_alt" label="Filtros" @click="mostrarFiltros = !mostrarFiltros">
        <q-icon :name="mostrarFiltros ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" class="q-ml-xs" />
      </q-btn>
    </div>

    <!-- Tarjetas resumen SIEMPRE VISIBLE -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Sin Precio -->
      <div class="col-12 col-sm-6 col-md-2">
        <q-card
          bordered
          flat
          class="cursor-pointer"
          style="border: 2px solid #fde68a;"
          @click="aplicarFiltroEstatus('Sin Precio')"
        >
          <q-card-section class="bg-yellow-1">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey-7 text-weight-bold">Sin Precio</div>
              <div class="text-h6">⏳</div>
            </div>
            <div class="text-h4 text-weight-bold text-yellow-10">{{ countByStatus('sin_precio') }}</div>
            <div class="text-caption text-grey-7">Pendiente autorización</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Precio Autorizado -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          bordered
          flat
          class="cursor-pointer"
          style="border: 2px solid #c7d2fe;"
          @click="aplicarFiltroEstatus('Precio Autorizado')"
        >
          <q-card-section class="bg-indigo-1">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey-7 text-weight-bold">Precio Autorizado</div>
              <div class="text-h6">👍</div>
            </div>
            <div class="text-h4 text-weight-bold text-indigo-10">{{ countByStatus('precio_autorizado') }}</div>
            <div class="text-caption text-grey-7">Esperando aceptación</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Precio Aceptado -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          bordered
          flat
          class="cursor-pointer"
          style="border: 2px solid #bbf7d0;"
          @click="aplicarFiltroEstatus('Precio Aceptado')"
        >
          <q-card-section class="bg-green-1">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey-7 text-weight-bold">Precio Aceptado</div>
              <div class="text-h6">✅</div>
            </div>
            <div class="text-h4 text-weight-bold text-green-10">{{ countByStatus('precio_aceptado') }}</div>
            <div class="text-caption text-grey-7">Boletas finalizadas</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- En Renegociación -->
      <div class="col-12 col-sm-6 col-md-2">
        <q-card
          bordered
          flat
          class="cursor-pointer"
          style="border: 2px solid #fed7aa;"
          @click="aplicarFiltroEstatus('En Renegociación')"
        >
          <q-card-section class="bg-orange-1">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey-7 text-weight-bold">En Renegociación</div>
              <div class="text-h6">🔄</div>
            </div>
            <div class="text-h4 text-weight-bold text-orange-10">{{ countByStatus('en_renegociacion') }}</div>
            <div class="text-caption text-grey-7">Precio rechazado</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Total -->
      <div class="col-12 col-sm-6 col-md-2">
        <q-card
          bordered
          flat
          class="cursor-pointer"
          style="border: 2px solid #bfdbfe;"
          @click="aplicarFiltroEstatus('todos')"
        >
          <q-card-section class="bg-blue-1">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey-7 text-weight-bold">Total</div>
              <div class="text-h6">📋</div>
            </div>
            <div class="text-h4 text-weight-bold text-blue-10">{{ registros.length }}</div>
            <div class="text-caption text-grey-7">Todas las boletas</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Panel filtros -->
    <q-card v-show="mostrarFiltros" bordered flat class="q-pa-md q-mb-md" style="border: 2px solid #d1d5db;">
      <div class="row q-col-gutter-md q-mb-md">
        <!-- Buscar -->
        <div class="col-12 col-md-3">
          <q-input v-model="busqueda" outlined dense label="Buscar" placeholder="No. Boleta, Productor, Ticket..." clearable />
        </div>

        <!-- Estatus -->
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtroEstatus"
            :options="estatusUnicos"
            outlined
            dense
            label="Estatus"
          />
        </div>

        <!-- Comprador -->
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtroComprador"
            :options="compradoresUnicos"
            outlined
            dense
            label="Comprador"
          />
        </div>

        <!-- Calibre -->
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtroCalibre"
            :options="calibresUnicos"
            outlined
            dense
            label="Calibre"
          />
        </div>
      </div>

      <div class="row q-col-gutter-md items-end">
        <!-- Fecha específica -->
        <div class="col-12 col-md-3">
          <q-input v-model="filtroFecha" type="date" outlined dense label="Fecha específica" />
        </div>

        <!-- Desde -->
        <div class="col-12 col-md-3">
          <q-input v-model="filtroFechaDesde" type="date" outlined dense label="Fecha desde" />
        </div>

        <!-- Hasta -->
        <div class="col-12 col-md-3">
          <q-input v-model="filtroFechaHasta" type="date" outlined dense label="Fecha hasta" />
        </div>

        <!-- Export -->
        <div class="col-12 col-md-3">
          <q-btn color="positive" unelevated icon="table_view" label="Exportar Excel" class="full-width" @click="exportarExcel" />
        </div>
      </div>

      <!-- Limpiar filtros -->
      <div class="row justify-end q-mt-md" v-if="hayFiltrosActivos">
        <q-btn flat color="primary" icon="close" label="Limpiar todos los filtros" @click="limpiarFiltros" />
      </div>
    </q-card>

    <!-- Tabla -->
    <q-card bordered flat style="border: 2px solid #d1d5db;">
      <q-table
        :rows="boletasFiltradas"
        :columns="columns"
        row-key="id"
        flat
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #no-data>
          <div class="q-pa-lg text-center text-grey-7">
            <div class="text-h6 q-mb-xs">
              {{ registros.length === 0 ? 'No hay boletas disponibles' : 'No se encontraron boletas con los filtros seleccionados' }}
            </div>
            <div class="text-body2">
              {{ registros.length === 0
                ? 'Las boletas aparecerán aquí cuando completes el flujo de "Precio"'
                : 'Intenta modificar los criterios de búsqueda'
              }}
            </div>
          </div>
        </template>

        <template #body-cell-estatus="p">
          <q-td :props="p">
            <q-badge
              outline
              :color="estatusBadgeColor(p.row.status)"
              :label="`${getEstatusIcon(p.row.status)} ${getEstatusTexto(p.row.status)}`"
            />
          </q-td>
        </template>

        <template #body-cell-precio="p">
          <q-td :props="p">
            <span class="text-weight-bold text-green-9">
              {{
                (p.row.status === 'precio_autorizado' || p.row.status === 'precio_aceptado') && p.row.precioPorKilo
                  ? p.row.precioPorKilo
                  : '-'
              }}
            </span>
          </q-td>
        </template>

        <template #body-cell-accion="p">
          <q-td :props="p">
            <q-btn
              flat
              color="primary"
              icon="visibility"
              label="Ver"
              @click="emit('ver-boleta', indexOfRegistro(p.row))"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Dialog } from 'quasar'

type Status = 'precio_aceptado' | 'precio_autorizado' | 'sin_precio' | 'en_renegociacion' | string

const props = withDefaults(defineProps<{ registros?: any[] }>(), {
  registros: () => []
})

const emit = defineEmits<{
  (e: 'ver-boleta', index: number): void
  (e: 'volver'): void
}>()

const busqueda = ref('')
const filtroEstatus = ref<string>('todos')
const filtroFecha = ref('')
const filtroComprador = ref('todos')
const filtroCalibre = ref('todos')
const filtroFechaDesde = ref('')
const filtroFechaHasta = ref('')
const mostrarFiltros = ref(true)

/** opciones */
const estatusUnicos = ['todos', 'Sin Precio', 'Precio Autorizado', 'Precio Aceptado', 'En Renegociación']

const calibresUnicos = computed(() => {
  const uniq = Array.from(new Set((props.registros || []).map(r => r?.calibre).filter(Boolean)))
  return ['todos', ...uniq]
})

const compradoresUnicos = computed(() => {
  const uniq = Array.from(new Set((props.registros || []).map(r => r?.comprador).filter(Boolean)))
  return ['todos', ...uniq]
})

/** filtro principal (misma lógica que TSX) */
const boletasFiltradas = computed(() => {
  return (props.registros || []).filter((boleta) => {
    const b = String(busqueda.value || '').toLowerCase()

    const cumpleBusqueda =
      b === '' ||
      String(boleta.boleta || '').toLowerCase().includes(b) ||
      String(boleta.productor || '').toLowerCase().includes(b) ||
      String(boleta.ticket || '').toLowerCase().includes(b)

    const cumpleEstatus =
      filtroEstatus.value === 'todos' ||
      (boleta.status === 'sin_precio' && filtroEstatus.value === 'Sin Precio') ||
      (boleta.status === 'precio_autorizado' && filtroEstatus.value === 'Precio Autorizado') ||
      (boleta.status === 'precio_aceptado' && filtroEstatus.value === 'Precio Aceptado') ||
      (boleta.status === 'en_renegociacion' && filtroEstatus.value === 'En Renegociación')

    const cumpleFecha = filtroFecha.value === '' || String(boleta.fechaHora || '').startsWith(filtroFecha.value)

    const cumpleComprador =
      filtroComprador.value === 'todos' ||
      String(boleta.comprador || '').toLowerCase().includes(String(filtroComprador.value).toLowerCase())

    const cumpleCalibre = filtroCalibre.value === 'todos' || boleta.calibre === filtroCalibre.value

    let cumpleRangoFechas = true
    if (filtroFechaDesde.value || filtroFechaHasta.value) {
      const fechaBoleta = String(boleta.fechaHora || '').split(' ')[0]
      if (filtroFechaDesde.value && fechaBoleta && fechaBoleta < filtroFechaDesde.value) cumpleRangoFechas = false
      if (filtroFechaHasta.value && fechaBoleta && fechaBoleta > filtroFechaHasta.value) cumpleRangoFechas = false
    }

    return (
      cumpleBusqueda &&
      cumpleEstatus &&
      cumpleFecha &&
      cumpleComprador &&
      cumpleCalibre &&
      cumpleRangoFechas
    )
  })
})

/** utilidades estatus (equivalentes al TSX) */
function getEstatusIcon(status: Status) {
  switch (status) {
    case 'precio_aceptado': return '✅'
    case 'precio_autorizado': return '👍'
    case 'sin_precio': return '⏳'
    case 'en_renegociacion': return '🔄'
    default: return '📋'
  }
}

function getEstatusTexto(status: Status) {
  switch (status) {
    case 'precio_aceptado': return 'Precio Aceptado'
    case 'precio_autorizado': return 'Precio Autorizado'
    case 'sin_precio': return 'Sin Precio'
    case 'en_renegociacion': return 'En Renegociación'
    default: return String(status)
  }
}

function estatusBadgeColor(status: Status) {
  switch (status) {
    case 'precio_aceptado': return 'positive'
    case 'precio_autorizado': return 'primary'
    case 'sin_precio': return 'warning'
    case 'en_renegociacion': return 'orange'
    default: return 'grey'
  }
}

function countByStatus(status: Status) {
  return (props.registros || []).filter(r => r?.status === status).length
}

function aplicarFiltroEstatus(value: string) {
  filtroEstatus.value = value
  mostrarFiltros.value = true
}

const hayFiltrosActivos = computed(() =>
  !!busqueda.value ||
  filtroEstatus.value !== 'todos' ||
  !!filtroFecha.value ||
  filtroComprador.value !== 'todos' ||
  filtroCalibre.value !== 'todos' ||
  !!filtroFechaDesde.value ||
  !!filtroFechaHasta.value
)

function limpiarFiltros() {
  busqueda.value = ''
  filtroEstatus.value = 'todos'
  filtroFecha.value = ''
  filtroComprador.value = 'todos'
  filtroCalibre.value = 'todos'
  filtroFechaDesde.value = ''
  filtroFechaHasta.value = ''
}

/** Export (en React era alert) */
function exportarExcel() {
  Dialog.create({
    title: 'Exportar a Excel',
    message: 'Exportando a Excel...\n\nFormato incluirá:\n- Todos los campos de las boletas\n- Filtros aplicados\n- Fecha de generación'
  })
}

/** Para mandar el índice original (como el TSX) */
function indexOfRegistro(row: any) {
  return (props.registros || []).findIndex(r => (r?.id ?? r?.boleta) === (row?.id ?? row?.boleta))
}

const columns = [
  { name: 'ticket', label: 'No. Ticket', field: 'ticket', align: 'left' },
  { name: 'boleta', label: 'No. Boleta', field: 'boleta', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: (r: any) => String(r?.fechaHora || '').split(' ')[0] || '-', align: 'left' },
  { name: 'productor', label: 'Productor', field: 'productor', align: 'left' },
  { name: 'origen', label: 'Origen', field: (r: any) => r?.origen || 'N/A', align: 'left' },
  { name: 'calibre', label: 'Calibre', field: (r: any) => r?.calibre || 'N/A', align: 'left' },
  { name: 'pesoBruto', label: 'Peso Bruto', field: (r: any) => r?.pesoBruto || 'N/A', align: 'left' },
  { name: 'precio', label: 'Precio/kg', field: 'precioPorKilo', align: 'left' },
  { name: 'estatus', label: 'Estatus', field: 'status', align: 'left' },
  { name: 'accion', label: 'Acción', field: 'accion', align: 'left' }
] as const
</script>
