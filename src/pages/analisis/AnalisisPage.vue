<template>
  <div v-if="!listaPendientes || listaPendientes.length === 0" class="column items-center justify-center" style="min-height: 70vh;">
    <div class="text-center">
      <div class="text-h2 q-mb-md">📊</div>
      <div class="text-h5 text-weight-bold text-grey-8 q-mb-xs">No hay registros pendientes</div>
      <div class="text-body2 text-grey-6">Esperando registros desde la pantalla de Báscula...</div>
      <q-btn label="Actualizar" icon="refresh" flat color="primary" class="q-mt-md" @click="$emit('refresh')" />
    </div>
  </div>

  <div v-else class="column bg-grey-2" style="min-height: 100%;">
    <div class="q-pa-md text-white" style="background:#ff6900;">
      <div class="text-h5 text-weight-bold text-center">ANÁLISIS DE CALIDAD</div>
      <div class="text-caption text-center q-mt-xs">Esperando asignación de precio</div>
    </div>

    <q-card flat bordered class="q-pa-sm">
      <div class="row items-center justify-between">
        <div class="text-body2 text-grey-8">
          Registro {{ currentIndex + 1 }} de {{ listaPendientes?.length || 0 }}
        </div>

        <div class="row items-center q-gutter-sm">
          <q-btn
            round
            dense
            flat
            icon="chevron_left"
            :disable="currentIndex === 0"
            @click="prevRegistro"
          />
          <q-badge color="grey-3" text-color="grey-9" class="q-px-md q-py-sm">
            {{ currentIndex + 1 }} / {{ listaPendientes?.length || 0 }}
          </q-badge>
          <q-btn
            round
            dense
            flat
            icon="chevron_right"
            :disable="currentIndex === (listaPendientes?.length || 0) - 1"
            @click="nextRegistro"
          />
        </div>
      </div>
    </q-card>

    <div class="q-pa-md" style="flex: 1; overflow: auto;">
      <div class="q-mx-auto" style="max-width: 980px; display: grid; gap: 16px;">

        <q-card bordered>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input :model-value="analisisData.ticket" label="TICKET" outlined dense readonly bg-color="grey-1" />
              </div>
              <div class="col-12 col-md-6">
                <q-input :model-value="analisisData.fechaHora" label="FECHA Y HORA" outlined dense readonly bg-color="grey-1" />
              </div>
              <div class="col-12 col-md-6">
                <q-input :model-value="analisisData.chofer" label="CHOFER" outlined dense readonly bg-color="grey-1" />
              </div>
              <div class="col-12 col-md-6">
                <q-input :model-value="analisisData.placas" label="PLACAS" outlined dense readonly bg-color="grey-1" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-md">Resultados de Análisis</div>

            <TablaAnalisisDesplegable
              :impurezas="num(analisisData.impurezas)"
              :r1="num(analisisData.r1)"
              :r2="num(analisisData.r2)"
              :cafesLisos="num(analisisData.cafesLisos)"
              :manchados="num(analisisData.manchados)"
              :quebMxc="num(analisisData.quebMxc)"
              :helados="num(analisisData.helados)"
              :alimonados="num(analisisData.alimonados)"
              :revolcados="num(analisisData.revolcados)"
              :sumaR2="analisisData.sumaR2"
              :totalDanosNum="analisisData.totalDanosNum"
              :exportacion="analisisData.exportacion"
              @input-change="onTablaInputChange"
            />

            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="analisisData.calibre"
                  :options="listaCalibres"
                  option-label="nombre"
                  option-value="nombre"
                  label="CALIBRE *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :loading="listaCalibres.length === 0"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No hay opciones disponibles
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="analisisData.humedad"
                  type="number"
                  step="0.1"
                  inputmode="decimal"
                  label="HUMEDAD *"
                  outlined
                  dense
                  suffix="%"
                  placeholder="0.0"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle1 text-weight-bold text-grey-8">
                Evidencia Fotográfica <span class="text-negative">*</span>
              </div>
              <div class="row items-center q-gutter-sm">
                <q-btn color="positive" unelevated icon="photo_camera" label="Cámara" @click="tomarFotoReal" />
                <q-btn color="primary" unelevated icon="upload" label="Galería" @click="triggerFilePick" />
                <input ref="fileInputRef" type="file" accept="image/*" multiple class="hidden" @change="onPhotoUpload" />
              </div>
            </div>

            <div v-if="uploadedPhotos.length === 0" class="q-pa-md bg-grey-3 text-center text-grey-7 rounded-borders">
               Se requiere al menos 1 foto para guardar.
            </div>

            <div v-else class="row q-col-gutter-md">
              <div v-for="(photo, idx) in uploadedPhotos" :key="idx" class="col-6 col-sm-4 col-md-3">
                <q-card bordered>
                  <q-img
                    :src="photo"
                    spinner-color="white"
                    style="height: 140px; max-width: 100%"
                  >
                    <div class="absolute-top-right q-pa-xs">
                      <q-btn round dense color="negative" icon="close" size="sm" @click="removePhoto(idx)" />
                    </div>
                  </q-img>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <div class="row justify-end q-mb-xl">
          <q-btn color="positive" unelevated class="q-px-xl q-py-md text-weight-bold" label="GUARDAR ANÁLISIS" @click="guardar" />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import TablaAnalisisDesplegable from './TablaAnalisisDesplegable.vue'
import type { AxiosError } from 'axios';

interface RegistroBascula {
  id: number;
  ticket_numero: string;
  productor: string;
  telefono?: string;
  comprador: string;
  origen: string;
  fecha: string;
  chofer: string;
  placas: string;
  peso_bruto_kg: number;
  grano?: string;
  // Campos del análisis (vienen del LEFT JOIN)
  calibre?: string;
  humedad?: number | string;
  impurezas?: number | string;
  r1_danado_insecto?: number | string;
  r2_arrugado?: number | string;
  r2_manchado?: number | string;
  r2_quebrado?: number | string;
  datos_adicionales?: string;
}

interface AnalisisData {
  ticket: string;
  fechaHora: string;
  chofer: string;
  placas: string;
  calibre: string;
  humedad: string;
  impurezas: string;
  r1: string;
  r2: string;
  cafesLisos: string;
  manchados: string;
  quebMxc: string;
  helados: string;
  alimonados: string;
  revolcados: string;
  sumaR2: number;
  totalDanosNum: number;
  exportacion: number;
}

// --- Props & Emits ---
const props = withDefaults(defineProps<{
  calibresDisponibles?: string[]
}>(), {
  calibresDisponibles: () => ['44-46', '42-44', '40-42']
})

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// --- Estado ---
const $q = useQuasar()
const loading = ref(false)
const currentIndex = ref(0)
const listaPendientes = ref<RegistroBascula[]>([])
const listaCalibres = ref<{ id: number; nombre: string }[]>([])
const uploadedPhotos = ref<string[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

const analisisData = reactive<AnalisisData>({
  ticket: '', fechaHora: '', chofer: '', placas: '',
  calibre: props.calibresDisponibles?.[0] || '44-46',
  humedad: '', impurezas: '', r1: '', r2: '',
  cafesLisos: '', manchados: '', quebMxc: '',
  helados: '', alimonados: '', revolcados: '',
  sumaR2: 0, totalDanosNum: 0, exportacion: 0
})

async function cargarCalibres() {
  try {
    const response = await api.get('/api/catalogos/calibres')
    // Asumimos que el API devuelve un array de objetos { id, nombre }
    listaCalibres.value = response.data

    // Si hay calibres y el formulario está vacío, pre-seleccionamos el primero
    if (listaCalibres.value.length > 0 && !analisisData.calibre) {
      analisisData.calibre = listaCalibres.value[0]?.nombre || ''
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar catálogo de calibres' })
  }
}

// --- Lógica de Carga API ---
async function cargarPendientes() {
  loading.value = true
  try {
    const response = await api.get('/api/analisis/pendientes-analisis')
    listaPendientes.value = response.data
    // Resetear al primer registro si hay datos
    if (listaPendientes.value.length > 0) {
      currentIndex.value = 0
    }
  } catch  {
    $q.notify({ type: 'negative', message: 'Error al cargar tickets pendientes' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await cargarPendientes();
  void cargarCalibres(); // <--- Nueva llamada
});

// --- Computados ---
const registroActual = computed(() => {
  if (!listaPendientes.value.length) return null
  return listaPendientes.value[currentIndex.value]
})

// --- Watches ---
// --- Watches ---
watch([currentIndex, listaPendientes], () => {
  const r = registroActual.value // Eliminamos el "as any"
  if (!r) return

  // 1. Datos básicos del encabezado
  analisisData.ticket = r.ticket_numero || ''
  analisisData.fechaHora = r.fecha ? new Date(r.fecha).toLocaleString() : new Date().toLocaleString()
  analisisData.chofer = r.chofer || ''
  analisisData.placas = r.placas || ''

  // 2. Cargar valores técnicos de la base de datos de forma segura
  analisisData.calibre = r.calibre || '44-46'
  analisisData.humedad = r.humedad?.toString() || ''
  analisisData.impurezas = r.impurezas?.toString() || ''
  analisisData.r1 = r.r1_danado_insecto?.toString() || ''
  analisisData.r2 = r.r2_arrugado?.toString() || ''
  analisisData.manchados = r.r2_manchado?.toString() || ''
  analisisData.quebMxc = r.r2_quebrado?.toString() || ''

  // 3. Procesar JSON de datos adicionales
  if (r.datos_adicionales) {
    try {
      const extra = JSON.parse(r.datos_adicionales)
      analisisData.cafesLisos = extra.cafes_lisos?.toString() || ''
      analisisData.helados = extra.helados?.toString() || ''
      analisisData.alimonados = extra.alimonados?.toString() || ''
      analisisData.revolcados = extra.revolcados?.toString() || ''

      uploadedPhotos.value = Array.isArray(extra.fotos) ? [...extra.fotos] : []
    } catch (e) {
      console.error("Error al parsear datos adicionales:", e)
      uploadedPhotos.value = []
    }
  } else {
    // Si no hay análisis previo, aseguramos que los campos calculados inicien limpios
    analisisData.cafesLisos = ''
    analisisData.helados = ''
    analisisData.alimonados = ''
    analisisData.revolcados = ''
    uploadedPhotos.value = []
  }
}, { immediate: true })





// Cálculos automáticos
watchEffect(() => {
  const suma = num(analisisData.r2) + num(analisisData.cafesLisos) + num(analisisData.manchados) +
               num(analisisData.quebMxc) + num(analisisData.helados) + num(analisisData.alimonados) +
               num(analisisData.revolcados)
  analisisData.sumaR2 = round2(suma)
})

watchEffect(() => {
  analisisData.totalDanosNum = round2(num(analisisData.impurezas) + num(analisisData.r1) + analisisData.sumaR2)
})

watchEffect(() => {
  analisisData.exportacion = round2(Math.max(0, 100 - analisisData.totalDanosNum))
})

// --- Funciones Auxiliares ---
function num(v: string | number) {
  const n = typeof v === 'number' ? v : parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

function round2(v: number) {
  return parseFloat(v.toFixed(2))
}

function limpiarFormulario() {
  analisisData.humedad = ''
  analisisData.impurezas = ''
  analisisData.r1 = ''
  analisisData.r2 = ''
  analisisData.cafesLisos = ''
  analisisData.manchados = ''
  analisisData.quebMxc = ''
  analisisData.helados = ''
  analisisData.alimonados = ''
  analisisData.revolcados = ''

  // Limpiar el array de fotos
  uploadedPhotos.value = []
}

function onTablaInputChange(campo: string, valor: string) {
  if (campo in analisisData) {
    (analisisData[campo as keyof AnalisisData] as unknown) = valor
  }
}

// --- Navegación ---
function prevRegistro() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    limpiarFormulario()
  }
}

function nextRegistro() {
  if (currentIndex.value < listaPendientes.value.length - 1) {
    currentIndex.value++
    limpiarFormulario()
  }
}

// --- Fotos ---
function triggerFilePick() { fileInputRef.value?.click() }

function tomarFotoReal() {
  if (fileInputRef.value) {
    // Forzamos que abra la cámara trasera
    fileInputRef.value.setAttribute('capture', 'environment');
    fileInputRef.value.click();

    // Quitamos el atributo inmediatamente después para que no afecte
    // a la selección normal de archivos si se usa el otro botón
    setTimeout(() => {
      fileInputRef.value?.removeAttribute('capture');
    }, 500);
  }
}

function onPhotoUpload(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return

  Array.from(input.files).forEach((file) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 800
        const scale = MAX_WIDTH / img.width
        canvas.width = MAX_WIDTH
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        uploadedPhotos.value.push(canvas.toDataURL('image/jpeg', 0.7))
      }
    }
    reader.readAsDataURL(file)
  })
  input.value = ''
}

function removePhoto(index: number) {
  uploadedPhotos.value.splice(index, 1)
}

// --- Guardar ---
async function guardar() {
  if (!analisisData.humedad || !analisisData.calibre) {
    $q.notify({ type: 'warning', message: 'Humedad y Calibre son obligatorios.' })
    return
  }

  if (uploadedPhotos.value.length === 0) {
    $q.notify({ type: 'warning', message: 'Debe subir al menos una foto.' })
    return
  }

  const r = registroActual.value
  if (!r) return

  $q.loading.show({ message: 'Procesando análisis...' })

  try {
    const payload = {
      bascula_id: r.id,
      calibre: analisisData.calibre,
      humedad: num(analisisData.humedad),
      impurezas: num(analisisData.impurezas),
      r1_danado_insecto: num(analisisData.r1),
      r2_quebrado: num(analisisData.quebMxc),
      r2_manchado: num(analisisData.manchados),
      r2_arrugado: num(analisisData.r2),
      // Nota: suma_r2 y total_danos se omiten si son calculadas por SQL
      analista_usuario_id: 1,
      observaciones: `Análisis para ticket ${r.ticket_numero}`,
      datos_adicionales: JSON.stringify({
        exportacion: analisisData.exportacion,
        cafes_lisos: num(analisisData.cafesLisos),
        helados: num(analisisData.helados),
        alimonados: num(analisisData.alimonados),
        revolcados: num(analisisData.revolcados),
        fotos: uploadedPhotos.value
      })
    }

    // DETERMINAR SI ES ACTUALIZACIÓN O INSERCIÓN
    // Si r.calibre o r.humedad ya tienen valor, significa que ya existe un análisis
    const yaExisteAnalisis = !!r.calibre || !!r.datos_adicionales;

    if (yaExisteAnalisis) {
      // Usamos PUT para actualizar el registro existente vinculado a bascula_id
      await api.put(`/api/analisis/actualizar/${r.id}`, payload)
      $q.notify({ type: 'positive', message: `Análisis del ticket ${r.ticket_numero} actualizado.` })
    } else {
      // Usamos POST para crear uno nuevo
      await api.post('/api/analisis/guardar', payload)
      $q.notify({ type: 'positive', message: `Ticket ${r.ticket_numero} guardado con éxito.` })
    }

    emit('refresh')
    await cargarPendientes()
    // No limpiamos el formulario inmediatamente para que el usuario vea sus cambios reflejados
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>
    $q.notify({
      type: 'negative',
      message: axiosError.response?.data?.message || 'Error al procesar el análisis.'
    })
  } finally {
    $q.loading.hide()
  }
}
</script>

<style scoped>
.hidden { display: none; }

.q-img__image {
  object-fit: cover !important;
}

/* Asegura que el card de la foto no colapse */
.q-card .q-img {
  min-height: 100px;
  background-color: #f0f0f0; /* Color de fondo mientras carga */
}

</style>
