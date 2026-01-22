<template>
  <div
    v-if="registrosBascula.length === 0"
    class="column items-center justify-center"
    style="min-height: 70vh"
  >
    <div class="text-center">
      <div class="text-h2 q-mb-md">📊</div>
      <div class="text-h5 text-weight-bold text-grey-8 q-mb-xs">No hay registros de báscula</div>
      <div class="text-body2 text-grey-6">Esperando registros desde la pantalla de Báscula...</div>
    </div>
  </div>

  <div v-else class="column bg-grey-2" style="min-height: 100%">
    <!-- Header Naranja -->
    <div class="q-pa-md text-white" style="background: #ff6900">
      <div class="text-h5 text-weight-bold text-center">ANÁLISIS DE CALIDAD</div>
      <div class="text-caption text-center q-mt-xs">Esperando asignación de precio</div>
    </div>

    <!-- Navegación entre registros -->
    <q-card flat bordered class="q-pa-sm">
      <div class="row items-center justify-between">
        <div class="text-body2 text-grey-8">
          Registro {{ currentIndex + 1 }} de {{ registrosBascula.length }}
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
            {{ currentIndex + 1 }} / {{ registrosBascula.length }}
          </q-badge>
          <q-btn
            round
            dense
            flat
            icon="chevron_right"
            :disable="currentIndex === registrosBascula.length - 1"
            @click="nextRegistro"
          />
        </div>
      </div>
    </q-card>

    <!-- Contenido -->
    <div class="q-pa-md" style="flex: 1; overflow: auto">
      <div class="q-mx-auto" style="max-width: 980px; display: grid; gap: 16px">
        <!-- 4 Campos Bloqueados -->
        <q-card bordered>
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="analisisData.ticket" label="TICKET" outlined dense disable />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="analisisData.fechaHora"
                  label="FECHA Y HORA"
                  outlined
                  dense
                  disable
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="analisisData.chofer" label="CHOFER" outlined dense disable />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="analisisData.placas" label="PLACAS" outlined dense disable />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Tabla de análisis -->
        <q-card bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-md">
              Resultados de Análisis
            </div>

            <!-- Mantengo tu componente TablaAnalisisDesplegable (debe existir en Vue) -->
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
              :totalDanos="analisisData.totalDanos"
              :exportacion="analisisData.exportacion"
              @input-change="onTablaInputChange"
            />

            <!-- Calibre + Humedad -->
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="analisisData.calibre"
                  :options="calibresDisponibles"
                  label="CALIBRE *"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="analisisData.humedad"
                  type="number"
                  step="0.1"
                  label="HUMEDAD *"
                  outlined
                  dense
                  placeholder="Ej: 13.2"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Fotos -->
        <q-card bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle1 text-weight-bold text-grey-8">
                Evidencia Fotográfica <span class="text-negative">*</span>
              </div>

              <div class="row items-center q-gutter-sm">
                <q-btn
                  color="positive"
                  unelevated
                  icon="photo_camera"
                  label="Tomar Foto"
                  @click="tomarFotoSimulada"
                />
                <q-btn
                  color="primary"
                  unelevated
                  icon="upload"
                  label="Subir Fotos"
                  @click="triggerFilePick"
                />
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="onPhotoUpload"
                />
              </div>
            </div>

            <div v-if="uploadedPhotos.length === 0">
              <q-banner rounded class="bg-grey-3 text-grey-8">
                <template #avatar>
                  <q-icon name="photo" />
                </template>
                <div class="text-weight-medium">No hay fotos cargadas</div>
                <div class="text-caption">
                  Tome fotos o suba archivos (se requiere al menos 1 foto)
                </div>
              </q-banner>
            </div>

            <div v-else class="row q-col-gutter-md">
              <div
                v-for="(photo, idx) in uploadedPhotos"
                :key="photo + idx"
                class="col-6 col-sm-4 col-md-3"
              >
                <q-card bordered class="relative-position">
                  <q-img :src="photo" ratio="4/3" />
                  <q-btn
                    round
                    dense
                    color="negative"
                    icon="close"
                    class="absolute"
                    style="top: 8px; right: 8px"
                    @click="removePhoto(idx)"
                  />
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Guardar -->
        <div class="row justify-end">
          <q-btn
            color="positive"
            unelevated
            class="q-px-xl q-py-sm"
            label="Guardar Análisis"
            @click="guardar"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect } from 'vue';
import { Dialog, Notify } from 'quasar';
import TablaAnalisisDesplegable from './TablaAnalisisDesplegable.vue'; // debes convertirlo también

interface RegistroBascula {
  ticket: string;
  productor: string;
  telefono: string;
  comprador: string;
  origen: string;
  fecha: string;
  tProductor: string;
  chofer: string;
  placas: string;
  pesoBruto: number;
  tara: number;
  atiende?: string;
  grano?: string;
  fechaHora?: string;
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
  totalDanos: number;
  exportacion: number;
}

const props = defineProps<{
  registrosBascula: RegistroBascula[];
  calibresDisponibles: string[];
  granosDisponibles: string[]; // (no se usa en el TSX actual, lo mantengo)
}>();

const emit = defineEmits<{
  (e: 'guardar-analisis', payload: any): void;
}>();

const currentIndex = ref(0);
const uploadedPhotos = ref<string[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);

const analisisData = reactive<AnalisisData>({
  ticket: '',
  fechaHora: '',
  chofer: '',
  placas: '',

  calibre: props.calibresDisponibles?.[0] || '44-46',
  humedad: '',

  impurezas: '',
  r1: '',
  r2: '',
  cafesLisos: '',
  manchados: '',
  quebMxc: '',
  helados: '',
  alimonados: '',
  revolcados: '',
  sumaR2: 0,
  totalDanos: 0,
  exportacion: 0,
});

const registroActual = computed(() => props.registrosBascula[currentIndex.value]);

/** Cargar datos del registro actual (equivalente al useEffect de React) */
watch(
  [currentIndex, () => props.registrosBascula],
  () => {
    const r = registroActual.value;
    if (!r) return;

    analisisData.ticket = r.ticket || '';
    analisisData.fechaHora = r.fechaHora || r.fecha || new Date().toLocaleDateString('es-MX');
    analisisData.chofer = r.chofer || '';
    analisisData.placas = r.placas || '';
  },
  { immediate: true },
);

/** Cálculos: sumaR2, totalDanos, exportacion (equivalente a los 3 useEffect) */
watchEffect(() => {
  const suma =
    num(analisisData.r2) +
    num(analisisData.cafesLisos) +
    num(analisisData.manchados) +
    num(analisisData.quebMxc) +
    num(analisisData.helados) +
    num(analisisData.alimonados) +
    num(analisisData.revolcados);

  analisisData.sumaR2 = round2(suma);
});

watchEffect(() => {
  const total = num(analisisData.impurezas) + num(analisisData.r1) + analisisData.sumaR2;
  analisisData.totalDanos = round2(total);
});

watchEffect(() => {
  const exp = Math.max(0, 100 - analisisData.totalDanos);
  analisisData.exportacion = round2(exp);
});

function num(v: string | number) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(v: number) {
  return parseFloat(v.toFixed(2));
}

/** Recibe eventos del componente TablaAnalisisDesplegable (equivalente a onInputChange) */
function onTablaInputChange(campo: keyof AnalisisData, valor: string) {
  (analisisData as any)[campo] = valor;
}

/** Navegación */
function prevRegistro() {
  currentIndex.value = Math.max(0, currentIndex.value - 1);
}

function nextRegistro() {
  currentIndex.value = Math.min(props.registrosBascula.length - 1, currentIndex.value + 1);
}

/** Fotos */
function triggerFilePick() {
  fileInputRef.value?.click();
}

function onPhotoUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (files && files.length) {
    const newPhotos = Array.from(files).map((f) => URL.createObjectURL(f));
    uploadedPhotos.value = [...uploadedPhotos.value, ...newPhotos];
  }
  // permitir seleccionar mismo archivo de nuevo
  input.value = '';
}

function tomarFotoSimulada() {
  const timestamp = Date.now();
  const url = `https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&t=${timestamp}`;
  uploadedPhotos.value = [...uploadedPhotos.value, url];
}

function removePhoto(index: number) {
  uploadedPhotos.value = uploadedPhotos.value.filter((_, i) => i !== index);
}

/** Guardar */
function guardar() {
  if (uploadedPhotos.value.length === 0) {
    Dialog.create({
      title: '⚠️ Error',
      message: 'Debe subir al menos 1 foto del análisis antes de guardar.',
    });
    return;
  }

  if (!analisisData.calibre || !analisisData.humedad || !analisisData.impurezas) {
    Dialog.create({
      title: '⚠️ Error',
      message: 'Debe completar los campos obligatorios: Calibre, Humedad e Impurezas.',
    });
    return;
  }

  const r = registroActual.value;
  if (!r) return;

  emit('guardar-analisis', {
    ...analisisData,
    ticket: r.ticket,
    productor: r.productor,
    telefono: r.telefono,
    comprador: r.comprador,
    origen: r.origen,
    pesoBruto: r.pesoBruto,
    tara: r.tara,
    chofer: r.chofer,
    placas: r.placas,
    tProductor: r.tProductor,
    fotos: uploadedPhotos.value,
    timestamp: new Date().toISOString(),
  });

  Notify.create({
    type: 'positive',
    message: `✅ Análisis guardado | Ticket: ${r.ticket} | Exportación: ${analisisData.exportacion}%`,
  });

  uploadedPhotos.value = [];

  if (currentIndex.value < props.registrosBascula.length - 1) {
    currentIndex.value++;
  }
}
</script>

<style scoped>
.hidden {
  display: none;
}
</style>
