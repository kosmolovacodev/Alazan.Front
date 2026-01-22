<template>
  <div class="q-pa-md" style="min-height: 100%;">

    <!-- Header -->
    <div class="row items-center q-gutter-md q-mb-lg">
      <q-btn flat round icon="arrow_back" color="grey-8" @click="emitBack" />
      <div class="text-h5 text-grey-8">Nuevo Registro - Báscula Recepción</div>
    </div>

    <!-- Formulario -->
    <q-card bordered class="q-pa-md" style="border: 2px solid #d1d5db;">
      <div class="row q-col-gutter-lg">

        <!-- Ticket -->
        <div class="col-12 col-md-6">
          <q-input
            v-model="formData.ticket"
            label="No. Ticket *"
            outlined
            dense
            disable
          />
        </div>

        <!-- Fecha y Hora -->
        <div class="col-12 col-md-6">
          <q-input
            v-model="formData.fechaHora"
            label="Fecha y Hora *"
            outlined
            dense
            disable
          />
        </div>

        <!-- Grano -->
        <div v-if="camposConfig?.grano?.habilitado" class="col-12 col-md-6">
          <q-select
            v-model="formData.grano"
            :options="catalogoGranosOptions"
            :label="labelCampo('grano')"
            outlined
            dense
            emit-value
            map-options
          />
        </div>

        <!-- Productor + botón + -->
        <div v-if="camposConfig?.productor?.habilitado" class="col-12 col-md-6">
          <div class="text-caption text-grey-8 q-mb-xs">
            {{ labelCampo('productor') }}
          </div>

          <div class="row items-center q-gutter-sm">
            <q-select
              v-model="formData.productor"
              class="col"
              :options="productoresOptions"
              outlined
              dense
              emit-value
              map-options
              use-input
              input-debounce="0"
              clearable
              label="Seleccionar productor..."
            />
            <q-btn
              color="orange-7"
              unelevated
              round
              icon="add"
              @click="abrirModalNuevoProductor"
            />
          </div>
        </div>

        <!-- T. Productor -->
        <div v-if="camposConfig?.tProductor?.habilitado" class="col-12 col-md-6">
          <q-select
            v-model="formData.tProductor"
            :options="tiposProductorOptions"
            :label="camposConfig.tProductor.nombre || 'T. Productor'"
            outlined
            dense
            emit-value
            map-options
          />
        </div>

        <!-- Atiende (solo si tiene valor) -->
        <div v-if="camposConfig?.atienda?.habilitado && !!formData.atienda" class="col-12 col-md-6">
          <q-input
            v-model="formData.atienda"
            :label="camposConfig.atienda.nombre || 'Atiende'"
            outlined
            dense
            placeholder="Nombre de quien atiende"
          />
        </div>

        <!-- Celular -->
        <div v-if="camposConfig?.celular?.habilitado" class="col-12 col-md-6">
          <q-input
            v-model="formData.celular"
            :label="camposConfig.celular.nombre || 'Celular'"
            outlined
            dense
            placeholder="Teléfono"
          />
        </div>

        <!-- Origen -->
        <div v-if="camposConfig?.origen?.habilitado" class="col-12 col-md-6">
          <q-select
            v-model="formData.origen"
            :options="catalogoOrigenesOptions"
            :label="camposConfig.origen.nombre || 'Origen'"
            outlined
            dense
            emit-value
            map-options
            clearable
          />
        </div>

        <!-- Chofer -->
        <div v-if="camposConfig?.chofer?.habilitado" class="col-12 col-md-6">
          <q-input
            v-model="formData.chofer"
            :label="camposConfig.chofer.nombre || 'Chofer'"
            outlined
            dense
            placeholder="Nombre del chofer"
          />
        </div>

        <!-- Placas -->
        <div v-if="camposConfig?.placas?.habilitado" class="col-12 col-md-6">
          <q-input
            v-model="formData.placas"
            :label="camposConfig.placas.nombre || 'Placas'"
            outlined
            dense
            placeholder="ABC-123"
          />
        </div>

        <!-- Ton Aprox -->
        <div v-if="camposConfig?.tonAprox?.habilitado" class="col-12 col-md-6">
          <q-input
            v-model="formData.tonAprox"
            type="number"
            :label="camposConfig.tonAprox.nombre || 'Ton. Aprox'"
            outlined
            dense
            placeholder="0.00"
          />
        </div>

        <!-- HAS -->
        <div v-if="camposConfig?.has?.habilitado" class="col-12 col-md-6">
          <q-input
            v-model="formData.has"
            type="number"
            :label="camposConfig.has.nombre || 'HAS'"
            outlined
            dense
            placeholder="0.00"
          />
        </div>

        <!-- Comprador -->
        <div v-if="camposConfig?.comprador?.habilitado" class="col-12 col-md-6">
          <q-select
            v-model="formData.comprador"
            :options="catalogoCompradoresOptions"
            :label="camposConfig.comprador.nombre || 'Comprador'"
            outlined
            dense
            emit-value
            map-options
            clearable
          />
        </div>
      </div>

      <!-- Peso Bruto -->
      <div v-if="camposConfig?.pesoBruto?.habilitado" class="q-mt-lg">
        <q-card bordered class="bg-yellow-1 q-pa-md" style="border: 2px solid #fcd34d;">
          <div class="text-subtitle1 text-grey-8 text-weight-medium q-mb-md">
            Peso Bruto (kg) *
          </div>

          <!-- Indicador conexión -->
          <div class="row items-center q-gutter-sm q-mb-md">
            <q-badge
              :color="basculaConectada ? 'positive' : 'negative'"
              :label="basculaConectada ? 'Báscula Conectada' : 'Báscula Desconectada'"
            />
            <q-btn
              v-if="!basculaConectada"
              size="sm"
              color="primary"
              unelevated
              label="Reconectar"
              @click="reconectarBascula"
            />
          </div>

          <div class="row items-center q-gutter-md">
            <q-input
              v-model="formData.pesoBruto"
              class="col-auto"
              style="width: 220px;"
              outlined
              dense
              :disable="!modoManual && basculaConectada"
              placeholder="0.00"
            />
            <div class="text-grey-7">kg</div>

            <div v-if="!modoManual" class="row items-center q-gutter-sm">
              <q-btn
                color="positive"
                unelevated
                label="Leer Báscula"
                :disable="!basculaConectada"
                @click="leerBascula"
              />
              <q-btn
                color="warning"
                unelevated
                label="Captura Manual"
                @click="activarModoManual"
              />
            </div>

            <div v-else class="text-warning text-weight-medium">
              Modo de captura manual activado
            </div>
          </div>
        </q-card>
      </div>

      <!-- Observaciones -->
      <div v-if="camposConfig?.observaciones?.habilitado" class="q-mt-lg">
        <q-input
          v-model="formData.observaciones"
          type="textarea"
          :rows="3"
          outlined
          :label="camposConfig.observaciones.nombre || 'Observaciones'"
          placeholder="Observaciones adicionales..."
        />
      </div>

      <!-- Botones -->
      <div class="row justify-center q-gutter-md q-mt-xl">
        <q-btn color="orange-7" unelevated label="Guardar" @click="handleGuardar" />
        <q-btn color="grey-7" unelevated label="Cancelar" @click="emitBack" />
      </div>
    </q-card>

    <!-- Modal: Nuevo Productor -->
    <q-dialog v-model="showNuevoProductorModal" persistent>
      <q-card style="width: 520px; max-width: 92vw;">
        <q-card-section>
          <div class="text-h6">Agregar Nuevo Productor</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <!-- Tipo persona -->
          <div>
            <div class="text-caption text-grey-8 q-mb-xs">Tipo de Persona</div>
            <q-option-group
              v-model="tipoPersona"
              type="radio"
              :options="tipoPersonaOptions"
              inline
            />
          </div>

          <!-- Campos según tipo -->
          <template v-if="tipoPersona === 'fisica'">
            <q-input
              v-model="nuevoProductorData.nombreProductor"
              outlined
              label="Nombre del Productor *"
              placeholder="Juan Pérez"
            />
            <q-input
              v-model="nuevoProductorData.telefono"
              outlined
              label="Teléfono *"
              placeholder="6441234567"
            />
          </template>

          <template v-else>
            <q-input
              v-model="nuevoProductorData.razonSocial"
              outlined
              label="Razón Social *"
              placeholder="Agronegocios SA de CV"
            />
            <q-input
              v-model="nuevoProductorData.nombreAtiende"
              outlined
              label="Nombre de quien Atiende *"
              placeholder="Ing. Carlos Ramírez"
            />
            <q-input
              v-model="nuevoProductorData.telefono"
              outlined
              label="Teléfono *"
              placeholder="6441234567"
            />
          </template>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat color="grey-7" label="Cancelar" @click="cerrarModalNuevoProductor" />
          <q-btn color="orange-7" unelevated label="Guardar" @click="guardarNuevoProductor" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Dialog, Notify } from 'quasar'

type CampoConfig = { habilitado: boolean; nombre: string; obligatorio: boolean }

const props = defineProps<{
  onBack: () => void
  onGuardar: (registro: any) => void
  camposConfig: Record<string, CampoConfig>
  listaProductores: Array<{ nombre: string; tipo: string; telefono: string; atiende?: string }>
  ultimoTicket: number
  catalogoOrigenes?: string[]
  catalogoCompradores?: string[]
  catalogoGranos?: string[]
}>()

/**
 * Para mantener 1:1 con React:
 * - mantenemos props onBack/onGuardar, pero también emitimos por si quieres migrar después.
 */
const emit = defineEmits<{
  (e: 'back'): void
  (e: 'guardar', registro: any): void
}>()

function emitBack() {
  props.onBack?.()
  emit('back')
}

/** Estado UI */
const basculaConectada = ref(true)
const modoManual = ref(false)
const showNuevoProductorModal = ref(false)
const tipoPersona = ref<'fisica' | 'moral'>('fisica')

const nuevoProductorData = reactive({
  nombreProductor: '',
  razonSocial: '',
  nombreAtiende: '',
  telefono: ''
})

/** Inicialización ticket + fechaHora (igual a TSX) */
function formatFechaHora(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

const formData = reactive({
  ticket: String(props.ultimoTicket + 1),
  productor: '',
  tProductor: '',
  atienda: '',
  fechaHora: formatFechaHora(new Date()),
  celular: '',
  origen: '',
  chofer: '',
  placas: '',
  tonAprox: '',
  has: '',
  pesoBruto: '',
  tara: '500',
  grano: props.catalogoGranos?.[0] || 'Garbanzo',
  comprador: '',
  observaciones: ''
})

/** Autollenado al seleccionar productor (igual a useEffect) */
watch(
  () => formData.productor,
  (nuevo) => {
    const p = props.listaProductores.find(x => x.nombre === nuevo)
    if (p) {
      formData.atienda = p.atiende || ''
      formData.celular = p.telefono || ''
    } else if (!nuevo) {
      formData.atienda = ''
      formData.celular = ''
    }
  },
  { immediate: true }
)

/** Helpers de opciones */
const productoresOptions = computed(() =>
  props.listaProductores.map(p => ({ label: p.nombre, value: p.nombre }))
)

const catalogoGranosOptions = computed(() => {
  const arr = props.catalogoGranos?.length ? props.catalogoGranos : ['Garbanzo']
  return arr.map(x => ({ label: x, value: x }))
})

const catalogoOrigenesOptions = computed(() =>
  (props.catalogoOrigenes || []).map(x => ({ label: x, value: x }))
)

const catalogoCompradoresOptions = computed(() =>
  (props.catalogoCompradores || []).map(x => ({ label: x, value: x }))
)

const tiposProductorOptions = [
  { label: '', value: '' },
  { label: 'Ejidal', value: 'Ejidal' },
  { label: 'Pequeña Propiedad', value: 'Pequeña Propiedad' }
]

const tipoPersonaOptions = [
  { label: 'Física', value: 'fisica' },
  { label: 'Moral', value: 'moral' }
]

function labelCampo(key: string) {
  const c = props.camposConfig?.[key]
  if (!c) return key
  return `${c.nombre}${c.obligatorio ? ' *' : ''}`
}

/** Báscula: leer / manual / reconectar (simulado igual que TSX) */
function leerBascula() {
  const intentarLectura = Math.random() > 0.1 // 90% éxito
  if (intentarLectura) {
    const pesoSimulado = (Math.random() * 20000 + 25000).toFixed(2)
    formData.pesoBruto = pesoSimulado
    // console.log('Peso bruto leído de báscula:', pesoSimulado, 'kg')
  } else {
    basculaConectada.value = false
    modoManual.value = true
    Dialog.create({
      title: '⚠️ Atención',
      message: 'Conexión con báscula perdida. Se ha activado el modo de captura manual.'
    })
  }
}

function activarModoManual() {
  modoManual.value = true
  formData.pesoBruto = ''
}

function reconectarBascula() {
  const reconexionExitosa = Math.random() > 0.3 // 70% éxito
  if (reconexionExitosa) {
    basculaConectada.value = true
    modoManual.value = false
    Notify.create({ type: 'positive', message: '✅ Báscula reconectada correctamente' })
  } else {
    Notify.create({ type: 'negative', message: '❌ No se pudo reconectar con la báscula. Intente nuevamente.' })
  }
}

/** Nuevo productor modal */
function abrirModalNuevoProductor() {
  showNuevoProductorModal.value = true
  tipoPersona.value = 'fisica'
  nuevoProductorData.nombreProductor = ''
  nuevoProductorData.razonSocial = ''
  nuevoProductorData.nombreAtiende = ''
  nuevoProductorData.telefono = ''
}

function cerrarModalNuevoProductor() {
  showNuevoProductorModal.value = false
}

function guardarNuevoProductor() {
  if (tipoPersona.value === 'fisica') {
    if (!nuevoProductorData.nombreProductor || !nuevoProductorData.telefono) {
      Dialog.create({ title: 'Error', message: 'Por favor complete todos los campos requeridos' })
      return
    }
    formData.productor = nuevoProductorData.nombreProductor
    formData.celular = nuevoProductorData.telefono
    formData.tProductor = 'Física'
  } else {
    if (!nuevoProductorData.razonSocial || !nuevoProductorData.nombreAtiende || !nuevoProductorData.telefono) {
      Dialog.create({ title: 'Error', message: 'Por favor complete todos los campos requeridos' })
      return
    }
    formData.productor = nuevoProductorData.razonSocial
    formData.atienda = nuevoProductorData.nombreAtiende
    formData.celular = nuevoProductorData.telefono
    formData.tProductor = 'Moral'
  }
  cerrarModalNuevoProductor()
}

/** Guardar */
function handleGuardar() {
  // Validaciones (igual TSX)
  if (!formData.productor) {
    Dialog.create({ title: '❌ Error', message: 'El campo Productor es obligatorio' })
    return
  }
  if (!formData.grano && props.camposConfig.grano?.obligatorio) {
    Dialog.create({ title: '❌ Error', message: 'El campo Grano es obligatorio' })
    return
  }
  if (!formData.pesoBruto) {
    Dialog.create({ title: '❌ Error', message: 'El campo Peso Bruto es obligatorio' })
    return
  }

  const nuevoRegistro = {
    id: Date.now(),
    ticket: formData.ticket,
    boleta: '',
    fecha: formData.fechaHora.split(' ')[0],
    fechaHora: formData.fechaHora,
    productor: formData.productor,
    tProductor: formData.tProductor,
    atienda: formData.atienda,
    celular: formData.celular,
    origen: formData.origen,
    chofer: formData.chofer,
    placas: formData.placas,
    tonAprox: formData.tonAprox,
    has: formData.has,
    pesoBruto: parseFloat(formData.pesoBruto),
    tara: parseFloat(formData.tara || '500'),
    grano: formData.grano,
    pesoNeto: '-',
    comprador: formData.comprador,
    observaciones: formData.observaciones,
    tipoProductor: formData.tProductor,
    telefono: formData.celular
  }

  props.onGuardar?.(nuevoRegistro)
  emit('guardar', nuevoRegistro)
}
</script>
