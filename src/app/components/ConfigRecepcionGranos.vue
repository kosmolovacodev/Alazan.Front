<!-- src/app/components/ConfigRecepcionGranos.vue -->
<template>
  <div class="scroll-area">
    <div class="q-mb-md">
      <div class="text-h6">Configuración de Recepción de Granos</div>
      <div class="text-body2 text-grey-7 q-mt-xs">
        Gobierna el comportamiento del módulo Recepción de Granos (Báscula, Análisis, Precio, Boleta, Volcado, Pre-liquidación).
      </div>
    </div>

    <div class="q-gutter-lg">
      <!-- 💰 CÁLCULO DE DESCUENTO -->
      <q-card flat bordered class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="text-h6">💰</div>
          <div class="text-subtitle1">Cálculo de Descuento por Impurezas</div>
        </div>

        <q-banner rounded class="bg-yellow-1 text-grey-9">
          <div class="row items-center q-col-gutter-md">
            <div class="col-auto text-caption text-grey-8">
              <span class="text-weight-medium">Fórmula:</span>
            </div>

            <div class="col">
              <div class="row items-center q-gutter-xs">
                <q-badge color="white" text-color="grey-9" class="q-pa-sm">
                  Descuento (kg/ton) = Impurezas (%) ×
                </q-badge>

                <q-input
                  v-model.number="factorImpurezas"
                  type="number"
                  dense
                  outlined
                  style="width: 90px"
                  input-class="text-center"
                />
              </div>

              <div class="text-caption text-grey-7 q-mt-sm">
                Ejemplo: Si Impurezas = 3.2%, entonces Descuento = 3.2 × {{ factorImpurezas }} = {{ (3.2 * factorImpurezas).toFixed(2) }} kg/ton
              </div>
              <div class="text-caption text-grey-7 q-mt-xs">
                Este descuento aparece en el campo DESCUENTO de la boleta marcado como "KG/TON"
              </div>
            </div>
          </div>
        </q-banner>
      </q-card>

      <!-- 🚛 VOLCADO Y SILOS -->
      <q-card flat bordered class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="text-h6">🚛</div>
          <div class="text-subtitle1">Volcado y Silos</div>
        </div>

        <q-card flat bordered class="bg-grey-1 q-pa-md">
          <div class="q-mb-md">
            <q-checkbox v-model="asignacionAutoSilo" label="Asignación automática de silo" />
          </div>

          <div class="q-mb-md">
            <div class="text-caption text-grey-8 text-weight-medium q-mb-sm">
              Reglas de Asignación (Prioridad de arriba a abajo)
            </div>

            <div class="q-gutter-sm">
              <q-checkbox v-model="reglasAsignacion.porTipoGrano" label="Por tipo de grano (Garbanzo/Frijol)" />
              <q-checkbox v-model="reglasAsignacion.porCalibre" label="Por calibre" />
              <q-checkbox v-model="reglasAsignacion.porExportacion" label="Por % exportación" />
              <q-checkbox v-model="reglasAsignacion.porCapacidad" label="Por capacidad disponible" />
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-8 q-mb-xs">Alerta de Capacidad cuando el silo esté al:</div>
            <div class="row items-center q-gutter-sm">
              <q-input
                v-model.number="alertaCapacidadPct"
                type="number"
                dense
                outlined
                style="width: 110px"
                :min="50"
                :max="100"
              />
              <div class="text-body2 text-grey-7">% de su capacidad</div>
            </div>
          </div>
        </q-card>
      </q-card>

      <!-- 📝 CAMPOS OBLIGATORIOS POR ETAPA -->
      <q-card flat bordered class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="text-h6">📝</div>
          <div class="text-subtitle1">Configuración de Campos por Pantalla</div>
        </div>

        <div class="text-body2 text-grey-7 q-mb-md">
          Activa/desactiva campos y define cuáles son obligatorios en cada etapa del flujo.
        </div>

        <!-- BÁSCULA -->
        <q-card flat bordered class="bg-grey-1 q-pa-md">
          <div class="row items-center q-gutter-sm q-mb-sm">
            <div class="text-h6">⚖️</div>
            <div class="text-subtitle2 text-grey-8">Báscula - Configuración de Campos</div>
          </div>

          <q-banner rounded class="bg-blue-1 text-blue-10 q-mb-md">
            <div class="text-body2">
              <span class="text-weight-bold">💾 Auto-guardado:</span>
              Los cambios se guardan automáticamente. Los campos obligatorios (marcados con *) no se pueden deshabilitar.
            </div>
          </q-banner>

          <q-table
            :rows="rowsCamposBascula"
            :columns="columnsCamposBascula"
            row-key="key"
            dense
            flat
            bordered
            hide-pagination
            :rows-per-page-options="[0]"
          >
            <!-- Orden + flechas -->
            <template #body-cell_orden="props">
              <q-td :props="props" align="center">
                <div class="row items-center justify-center q-gutter-xs">
                  <div class="text-weight-bold text-grey-8" style="min-width: 24px;">
                    {{ props.row.orden }}
                  </div>

                  <div class="column">
                    <q-btn
                      flat
                      dense
                      round
                      icon="keyboard_arrow_up"
                      :disable="props.row.isFirst"
                      @click="moverCampoArriba(props.row.key)"
                      size="sm"
                      color="grey-7"
                    />
                    <q-btn
                      flat
                      dense
                      round
                      icon="keyboard_arrow_down"
                      :disable="props.row.isLast"
                      @click="moverCampoAbajo(props.row.key)"
                      size="sm"
                      color="grey-7"
                    />
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Campo -->
            <template #body-cell_nombre="props">
              <q-td :props="props">
                <span class="text-weight-medium">
                  {{ props.row.nombre }}
                </span>
                <span v-if="props.row.obligatorio" class="text-negative q-ml-xs">*</span>
              </q-td>
            </template>

            <!-- Habilitado -->
            <template #body-cell_habilitado="props">
              <q-td :props="props" align="center">
                <q-checkbox
                  :model-value="props.row.habilitado"
                  :disable="props.row.obligatorio"
                  @update:model-value="(v) => onToggleHabilitado(props.row.key, v)"
                />
              </q-td>
            </template>

            <!-- Obligatorio -->
            <template #body-cell_obligatorio="props">
              <q-td :props="props" align="center">
                <q-badge
                  :color="props.row.obligatorio ? 'red-2' : 'grey-3'"
                  :text-color="props.row.obligatorio ? 'red-9' : 'grey-9'"
                  class="q-px-sm q-py-xs"
                >
                  {{ props.row.obligatorio ? 'Sí' : 'No' }}
                </q-badge>
              </q-td>
            </template>

            <!-- Descripción -->
            <template #body-cell_descripcion="props">
              <q-td :props="props">
                <div class="text-caption text-grey-7">
                  {{ descripcionCampoBascula(props.row.key) }}
                </div>
              </q-td>
            </template>
          </q-table>

          <div class="row q-gutter-sm q-mt-md">
            <q-btn
              color="positive"
              label="Habilitar Todos"
              unelevated
              @click="habilitarTodos"
            />
            <q-btn
              color="grey-8"
              label="Deshabilitar Opcionales"
              unelevated
              @click="deshabilitarOpcionales"
            />
          </div>
        </q-card>

        <!-- BOLETA (estático) -->
        <q-card flat bordered class="bg-grey-1 q-pa-md q-mt-md">
          <div class="row items-center q-gutter-sm q-mb-sm">
            <div class="text-h6">📄</div>
            <div class="text-subtitle2 text-grey-8">Boleta - Configuración de Campos</div>
          </div>

          <div class="text-caption text-grey-7 q-mb-sm">Grid Superior (10 campos)</div>

          <q-table
            :rows="rowsBoletaGrid"
            :columns="columnsBoletaGrid"
            row-key="campo"
            dense
            flat
            bordered
            hide-pagination
            :rows-per-page-options="[0]"
            class="q-mb-md"
          >
            <template #body-cell_visible="props">
              <q-td :props="props" align="center">
                <q-checkbox :model-value="true" :disable="props.row.sistema" />
              </q-td>
            </template>
            <template #body-cell_obligatorio="props">
              <q-td :props="props" align="center">
                <q-checkbox :model-value="props.row.sistema" :disable="props.row.sistema" />
              </q-td>
            </template>
            <template #body-cell_orden="props">
              <q-td :props="props" align="center">
                <q-input :model-value="props.row.orden" dense outlined readonly input-class="text-center" style="width: 80px" />
              </q-td>
            </template>
            <template #body-cell_campo="props">
              <q-td :props="props">
                {{ props.row.campo }}
                <span v-if="props.row.sistema" class="text-caption text-grey-6 q-ml-sm">(sistema)</span>
              </q-td>
            </template>
          </q-table>

          <div class="text-caption text-grey-7 q-mb-sm">Tabla de Análisis Desplegable</div>

          <q-table
            :rows="rowsBoletaAnalisis"
            :columns="columnsBoletaAnalisis"
            row-key="campo"
            dense
            flat
            bordered
            hide-pagination
            :rows-per-page-options="[0]"
          >
            <template #body-cell_visible="props">
              <q-td :props="props" align="center">
                <q-checkbox :model-value="true" :disable="props.row.sistema" />
              </q-td>
            </template>
            <template #body-cell_obligatorio="props">
              <q-td :props="props" align="center">
                <q-checkbox :model-value="props.row.sistema" :disable="props.row.sistema" />
              </q-td>
            </template>
            <template #body-cell_campo="props">
              <q-td :props="props">
                {{ props.row.campo }}
                <span v-if="props.row.sistema" class="text-caption text-grey-6 q-ml-sm">(sistema)</span>
              </q-td>
            </template>
          </q-table>

          <!-- Confirmación productor (estático) -->
          <q-banner rounded class="bg-blue-1 text-blue-10 q-mt-md">
            <div class="text-weight-medium q-mb-sm">✓ Precio Autorizado - Pendiente de Confirmación del Productor</div>

            <q-checkbox v-model="solicitarAprobacionProductor" label="Solicitar aprobación del productor antes de finalizar boleta" />

            <q-card flat bordered class="bg-white q-pa-md q-mt-sm">
              <div class="text-caption text-grey-8 q-mb-xs">Pregunta a mostrar al productor:</div>
              <q-input v-model="preguntaProductor" dense outlined />

              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="bg-green-1 q-pa-md">
                    <div class="row items-center q-gutter-sm q-mb-sm">
                      <q-icon name="check_circle" />
                      <div class="text-weight-medium text-green-9">Si acepta:</div>
                    </div>
                    <q-select
                      v-model="accionSiAcepta"
                      :options="opcionesAccionAcepta"
                      dense
                      outlined
                    />
                    <div class="text-caption text-grey-7 q-mt-sm">
                      La boleta se marca como aceptada y continúa el flujo
                    </div>
                  </q-card>
                </div>

                <div class="col-12 col-md-6">
                  <q-card flat bordered class="bg-red-1 q-pa-md">
                    <div class="row items-center q-gutter-sm q-mb-sm">
                      <q-icon name="cancel" />
                      <div class="text-weight-medium text-red-9">Si rechaza:</div>
                    </div>
                    <q-select
                      v-model="accionSiRechaza"
                      :options="opcionesAccionRechaza"
                      dense
                      outlined
                    />
                    <div class="text-caption text-grey-7 q-mt-sm">
                      Se registra el rechazo y permite ajustes
                    </div>
                  </q-card>
                </div>
              </div>

              <div class="q-mt-md">
                <q-checkbox v-model="solicitarMotivoRechazo" label="Solicitar motivo del rechazo" />
                <q-checkbox v-model="requerirFirmaDigital" label="Requerir firma digital del productor al aceptar" />
              </div>
            </q-card>
          </q-banner>
        </q-card>

        <!-- PRE-LIQUIDACIÓN (estático) -->
        <q-card flat bordered class="bg-grey-1 q-pa-md q-mt-md">
          <div class="row items-center q-gutter-sm q-mb-sm">
            <div class="text-h6">💵</div>
            <div class="text-subtitle2 text-grey-8">Pre-liquidación - Configuración de Campos</div>
          </div>

          <q-table
            :rows="rowsPreliquidacion"
            :columns="columnsPreliquidacion"
            row-key="campo"
            dense
            flat
            bordered
            hide-pagination
            :rows-per-page-options="[0]"
          >
            <template #body-cell_visible="props">
              <q-td :props="props" align="center">
                <q-checkbox :model-value="true" :disable="props.row.sistema" />
              </q-td>
            </template>
            <template #body-cell_obligatorio="props">
              <q-td :props="props" align="center">
                <q-checkbox :model-value="props.row.sistema" :disable="props.row.sistema" />
              </q-td>
            </template>
            <template #body-cell_orden="props">
              <q-td :props="props" align="center">
                <q-input :model-value="props.row.orden" dense outlined readonly input-class="text-center" style="width: 80px" />
              </q-td>
            </template>
            <template #body-cell_campo="props">
              <q-td :props="props">
                {{ props.row.campo }}
                <span v-if="props.row.sistema" class="text-caption text-grey-6 q-ml-sm">(sistema)</span>
              </q-td>
            </template>
          </q-table>

          <div class="text-caption text-grey-6 q-mt-sm">
            * Los campos marcados "de XML" se llenan automáticamente al cargar la factura del productor
          </div>
        </q-card>

        <!-- Campos personalizados (estático) -->
        <q-banner rounded class="bg-blue-1 text-blue-10 q-mt-md">
          <div class="text-weight-medium">Campos Personalizados</div>
          <div class="text-caption text-grey-8 q-mt-xs">
            Agrega campos adicionales que necesites capturar en cualquier pantalla
          </div>
          <q-btn class="q-mt-md" color="primary" icon="add" label="Agregar Campo Personalizado" unelevated />
        </q-banner>
      </q-card>

      <!-- ✅ VALIDACIONES -->
      <q-card flat bordered class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="text-h6">✅</div>
          <div class="text-subtitle1">Validaciones</div>
        </div>

        <q-card flat bordered class="bg-grey-1 q-pa-md">
          <div class="q-gutter-sm">
            <q-checkbox v-model="validaciones.atiendePersonasMorales" label='Habilitar automáticamente campo "ATIENDE" para Personas Morales' />
            <q-checkbox v-model="validaciones.multiplesEntregasMismoDia" label="Permitir múltiples entregas del mismo productor en el mismo día" />
            <q-checkbox v-model="validaciones.bloquearPlacasDuplicadasMismoDia" label="Bloquear placas duplicadas en el mismo día" />
            <q-checkbox v-model="validaciones.lecturaAutomaticaBascula" label="Permitir lectura automática de báscula" />
            <q-checkbox v-model="validaciones.capturaManualPeso" label="Permitir captura manual de peso" />
            <q-checkbox v-model="validaciones.motivoPesoManual" label="Solicitar motivo cuando se capture peso manualmente" />
          </div>
        </q-card>
      </q-card>

      <!-- ✍️ PLANTILLAS DE OBSERVACIONES -->
      <q-card flat bordered class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="text-h6">✍️</div>
          <div class="text-subtitle1">Plantillas de Observaciones para Pre-liquidación</div>
        </div>

        <div class="q-gutter-md">
          <div>
            <div class="text-body2 text-grey-8 text-weight-medium q-mb-xs">Para Productor Ejidal:</div>
            <q-input v-model="tplEjidal" type="textarea" outlined :rows="2" />
            <div class="text-caption text-grey-6 q-mt-xs">
              Variables disponibles: {'{monto}'}, {'{tipo_productor}'}, {'{fecha}'}
            </div>
          </div>

          <div>
            <div class="text-body2 text-grey-8 text-weight-medium q-mb-xs">Para Pequeña Propiedad:</div>
            <q-input v-model="tplPequenaPropiedad" type="textarea" outlined :rows="2" />
            <div class="text-caption text-grey-6 q-mt-xs">
              Variables disponibles: {'{monto}'}, {'{tipo_productor}'}, {'{fecha}'}
            </div>
          </div>

          <div>
            <div class="text-body2 text-grey-8 text-weight-medium q-mb-xs">Para Persona Moral:</div>
            <q-input v-model="tplPersonaMoral" type="textarea" outlined :rows="2" />
            <div class="text-caption text-grey-6 q-mt-xs">
              Variables disponibles: {'{razon_social}'}, {'{atiende}'}, {'{monto}'}, {'{fecha}'}
            </div>
          </div>
        </div>

        <!-- Botón Guardar (estético, como en TSX) -->
        <div class="q-mt-lg">
          <q-btn color="orange" label="Guardar Configuración" unelevated class="q-px-xl q-py-sm" />
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Notify } from 'quasar'

/**
 * Props: equivalentes a TSX
 */
type CamposBascula = Record<
  string,
  {
    nombre: string
    orden: number
    habilitado: boolean
    obligatorio: boolean
  }
>

interface Props {
  camposBascula: CamposBascula
  setCamposBascula: (campos: CamposBascula) => void
  catalogoOrigenes: string[]
  setCatalogoOrigenes: (origenes: string[]) => void
  catalogoCompradores: string[]
  setCatalogoCompradores: (compradores: string[]) => void
  catalogoGranos: string[]
  setCatalogoGranos: (productos: string[]) => void
}

const props = defineProps<Props>()

// Alias como en TSX
const catalogoProductos = computed(() => props.catalogoGranos)
const setCatalogoProductos = (v: string[]) => props.setCatalogoGranos(v)

// Estados locales de inputs (se conservan aunque en el TSX no se usan aún)
const nuevoOrigen = ref('')
const nuevoComprador = ref('')
const nuevoProducto = ref('')
const mostrarInputOrigen = ref(false)
const mostrarInputComprador = ref(false)
const mostrarInputProducto = ref(false)

// Auto-guardado (notify) cuando cambia camposBascula (debounce 500ms)
let timer: number | undefined
watch(
  () => props.camposBascula,
  () => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      Notify.create({
        type: 'positive',
        message: '✅ Configuración guardada automáticamente',
        position: 'bottom-right',
        timeout: 2000
      })
    }, 500)
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (timer) window.clearTimeout(timer)
})

// Tabla de campos báscula
type RowCampoBascula = {
  key: string
  nombre: string
  orden: number
  habilitado: boolean
  obligatorio: boolean
  isFirst: boolean
  isLast: boolean
}

const rowsCamposBascula = computed<RowCampoBascula[]>(() => {
  const entries = Object.entries(props.camposBascula || {})
    .map(([key, cfg]) => ({ key, ...cfg }))
    .sort((a, b) => a.orden - b.orden)

  return entries.map((x, idx) => ({
    key: x.key,
    nombre: x.nombre,
    orden: x.orden,
    habilitado: x.habilitado,
    obligatorio: x.obligatorio,
    isFirst: idx === 0,
    isLast: idx === entries.length - 1
  }))
})

const columnsCamposBascula = [
  { name: 'orden', label: 'Orden', field: 'orden', align: 'center' as const, style: 'width: 120px' },
  { name: 'nombre', label: 'Campo', field: 'nombre', align: 'left' as const },
  { name: 'habilitado', label: 'Habilitado', field: 'habilitado', align: 'center' as const, style: 'width: 140px' },
  { name: 'obligatorio', label: 'Obligatorio', field: 'obligatorio', align: 'center' as const, style: 'width: 140px' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' as const }
]

// Mover arriba/abajo (misma lógica TSX: swap con orden-1 u orden+1)
function moverCampoArriba(key: string) {
  const campos = Object.entries(props.camposBascula)
  const actual = campos.find(([k]) => k === key)
  if (!actual) return

  const [, cfgActual] = actual
  const ordenActual = cfgActual.orden

  const anterior = campos.find(([, cfg]) => cfg.orden === ordenActual - 1)
  if (!anterior) return

  const [keyAnterior, cfgAnterior] = anterior
  props.setCamposBascula({
    ...props.camposBascula,
    [key]: { ...cfgActual, orden: ordenActual - 1 },
    [keyAnterior]: { ...cfgAnterior, orden: ordenActual }
  })
}

function moverCampoAbajo(key: string) {
  const campos = Object.entries(props.camposBascula)
  const actual = campos.find(([k]) => k === key)
  if (!actual) return

  const [, cfgActual] = actual
  const ordenActual = cfgActual.orden

  const siguiente = campos.find(([, cfg]) => cfg.orden === ordenActual + 1)
  if (!siguiente) return

  const [keySiguiente, cfgSiguiente] = siguiente
  props.setCamposBascula({
    ...props.camposBascula,
    [key]: { ...cfgActual, orden: ordenActual + 1 },
    [keySiguiente]: { ...cfgSiguiente, orden: ordenActual }
  })
}

function onToggleHabilitado(key: string, habilitado: boolean) {
  const cfg = props.camposBascula[key]
  if (!cfg) return
  if (cfg.obligatorio) return

  props.setCamposBascula({
    ...props.camposBascula,
    [key]: { ...cfg, habilitado }
  })
}

function habilitarTodos() {
  const nuevos: CamposBascula = { ...props.camposBascula }
  Object.keys(nuevos).forEach((k) => {
    if (!nuevos[k].obligatorio) nuevos[k].habilitado = true
  })
  props.setCamposBascula(nuevos)
}

function deshabilitarOpcionales() {
  const nuevos: CamposBascula = { ...props.camposBascula }
  Object.keys(nuevos).forEach((k) => {
    if (!nuevos[k].obligatorio) nuevos[k].habilitado = false
  })
  props.setCamposBascula(nuevos)
}

// Descripción por key (igual que TSX)
function descripcionCampoBascula(key: string): string {
  const m: Record<string, string> = {
    ticket: 'Número de ticket generado automáticamente',
    fechaHora: 'Fecha y hora del registro',
    grano: 'Tipo de grano (Garbanzo, Trigo, etc.) - Desde Catálogo',
    productor: 'Nombre del productor',
    tProductor: 'Tipo de productor (Ejidal/Pequeña Propiedad)',
    atienda: 'Contacto para personas morales',
    celular: 'Teléfono de contacto (10 dígitos)',
    origen: 'Municipio de origen',
    chofer: 'Nombre del chofer',
    placas: 'Placas del vehículo',
    tonAprox: 'Toneladas aproximadas',
    has: 'Hectáreas sembradas',
    comprador: 'Comprador asignado',
    observaciones: 'Notas adicionales',
    pesoBruto: 'Peso capturado por la báscula'
  }
  return m[key] || ''
}

/** ====== Secciones estáticas/placeholder (como en TSX) ====== */
const factorImpurezas = ref<number>(10)

const asignacionAutoSilo = ref(true)
const reglasAsignacion = ref({
  porTipoGrano: true,
  porCalibre: true,
  porExportacion: false,
  porCapacidad: true
})
const alertaCapacidadPct = ref<number>(80)

// Boleta (rows estáticos)
type RowSimple = { campo: string; sistema: boolean; orden?: number }
const rowsBoletaGrid = ref<RowSimple[]>([
  { campo: 'Folio', sistema: true, orden: 1 },
  { campo: 'Fecha', sistema: true, orden: 2 },
  { campo: 'Productor', sistema: true, orden: 3 },
  { campo: 'RFC', sistema: false, orden: 4 },
  { campo: 'Origen', sistema: true, orden: 5 },
  { campo: 'Producto', sistema: true, orden: 6 },
  { campo: 'Calibre', sistema: true, orden: 7 },
  { campo: 'Humedad', sistema: true, orden: 8 },
  { campo: 'Peso Neto', sistema: true, orden: 9 },
  { campo: 'Descuento (kg/ton)', sistema: true, orden: 10 },
  { campo: 'ATIENDE (Persona Moral)', sistema: false, orden: 11 },
  { campo: 'Comprador', sistema: false, orden: 12 }
])

const columnsBoletaGrid = [
  { name: 'campo', label: 'Campo', field: 'campo', align: 'left' as const },
  { name: 'visible', label: 'Visible', field: 'visible', align: 'center' as const, style: 'width: 140px' },
  { name: 'obligatorio', label: 'Obligatorio', field: 'obligatorio', align: 'center' as const, style: 'width: 140px' },
  { name: 'orden', label: 'Orden', field: 'orden', align: 'center' as const, style: 'width: 120px' }
]

const rowsBoletaAnalisis = ref<RowSimple[]>([
  { campo: 'Impurezas', sistema: true },
  { campo: 'R1', sistema: true },
  { campo: 'R2 - Partido', sistema: true },
  { campo: 'R2 - Quebrado', sistema: true },
  { campo: 'R2 - Cristalizado', sistema: true },
  { campo: 'R2 - Picado', sistema: true },
  { campo: 'R2 - Manchado', sistema: true },
  { campo: 'R2 - Arrugado', sistema: true },
  { campo: 'R2 - Germinado', sistema: true },
  { campo: 'Total R2 (suma automática)', sistema: true },
  { campo: 'Total Daños (Impurezas + R1 + R2)', sistema: true },
  { campo: 'Exportación (%)', sistema: true }
])

const columnsBoletaAnalisis = [
  { name: 'campo', label: 'Campo', field: 'campo', align: 'left' as const },
  { name: 'visible', label: 'Visible', field: 'visible', align: 'center' as const, style: 'width: 140px' },
  { name: 'obligatorio', label: 'Obligatorio', field: 'obligatorio', align: 'center' as const, style: 'width: 140px' }
]

// Confirmación productor (placeholder)
const solicitarAprobacionProductor = ref(true)
const preguntaProductor = ref('¿Acepta los términos de esta boleta?')
const opcionesAccionAcepta = ['Pasar de Boleta Preliminar → Boleta', 'Continuar a Pre-liquidación', 'Continuar a Volcado']
const opcionesAccionRechaza = ['Ir a Renegociar (Precio)', 'Volver a Análisis', 'Cancelar operación']
const accionSiAcepta = ref(opcionesAccionAcepta[0])
const accionSiRechaza = ref(opcionesAccionRechaza[0])
const solicitarMotivoRechazo = ref(true)
const requerirFirmaDigital = ref(false)

// Preliquidación (rows estáticos)
const rowsPreliquidacion = ref<RowSimple[]>([
  { campo: 'Folio', sistema: true, orden: 1 },
  { campo: 'Fecha', sistema: true, orden: 2 },
  { campo: 'Productor', sistema: true, orden: 3 },
  { campo: 'RFC', sistema: false, orden: 4 },
  { campo: 'Producto', sistema: true, orden: 5 },
  { campo: 'Calibre', sistema: true, orden: 6 },
  { campo: 'Precio Base USD/TON', sistema: true, orden: 7 },
  { campo: 'Tipo de Cambio', sistema: true, orden: 8 },
  { campo: 'Precio Base MXN/TON', sistema: true, orden: 9 },
  { campo: 'Peso Neto', sistema: true, orden: 10 },
  { campo: 'Descuento (kg/ton)', sistema: true, orden: 11 },
  { campo: 'Total a Pagar', sistema: true, orden: 12 },
  { campo: 'ATIENDE (Persona Moral)', sistema: false, orden: 13 },
  { campo: 'Sup. Has (Superficie)', sistema: false, orden: 14 },
  { campo: 'R/T (Riego/Temporal)', sistema: false, orden: 15 },
  { campo: 'Tipo de Productor', sistema: false, orden: 16 },
  { campo: 'Foto de Documento', sistema: false, orden: 17 },
  { campo: 'Observaciones', sistema: false, orden: 18 },
  { campo: 'IMPORTE (de XML)', sistema: false, orden: 19 },
  { campo: 'DESC. PREDIAL (de XML)', sistema: false, orden: 20 },
  { campo: 'PAGO PREDIAL (de XML)', sistema: false, orden: 21 },
  { campo: 'DESC. ISR (de XML)', sistema: false, orden: 22 },
  { campo: 'A PAGAR (de XML)', sistema: false, orden: 23 },
  { campo: 'DÍAS HÁBILES DE PAGO', sistema: false, orden: 24 }
])

const columnsPreliquidacion = [
  { name: 'campo', label: 'Campo', field: 'campo', align: 'left' as const },
  { name: 'visible', label: 'Visible', field: 'visible', align: 'center' as const, style: 'width: 140px' },
  { name: 'obligatorio', label: 'Obligatorio', field: 'obligatorio', align: 'center' as const, style: 'width: 140px' },
  { name: 'orden', label: 'Orden', field: 'orden', align: 'center' as const, style: 'width: 120px' }
]

// Validaciones (placeholder)
const validaciones = ref({
  atiendePersonasMorales: true,
  multiplesEntregasMismoDia: true,
  bloquearPlacasDuplicadasMismoDia: false,
  lecturaAutomaticaBascula: true,
  capturaManualPeso: true,
  motivoPesoManual: true
})

// Plantillas (placeholder)
const tplEjidal = ref('En caso de que sea Pequeña Propiedad, el pago a liquidar es de $...')
const tplPequenaPropiedad = ref('En caso de que sea Ejidal, el pago a liquidar es de $...')
const tplPersonaMoral = ref('Liquidación a favor de {razon_social}, representada por {atiende}...')
</script>

<style scoped>
.scroll-area {
  overflow-y: auto;
  max-height: calc(100vh - 240px);
}
</style>
