<template>
  <!-- VISTA LISTA -->
  <BoletaListado
    v-if="showList"
    :registros="registros"
    @ver-boleta="handleVerBoleta"
    @volver="volverARecepcion"
  />

  <!-- VISTA DETALLE -->
  <div v-else class="q-pa-md bg-grey-2" style="min-height: 100%">
    <!-- Top bar -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="grey-8" @click="setShowList(true)" />
        <div class="text-h6">
          {{ tituloPantalla }}
        </div>

        <!-- Navegación -->
        <div class="row items-center q-gutter-xs q-ml-md">
          <q-btn
            flat
            round
            icon="chevron_left"
            :disable="currentRegistroIndex === 0"
            @click="handlePrevRegistro"
          />
          <q-badge color="grey-4" text-color="grey-9">
            {{ currentRegistroIndex + 1 }} / {{ totalRegistros }}
          </q-badge>
          <q-btn
            flat
            round
            icon="chevron_right"
            :disable="currentRegistroIndex >= totalRegistros - 1"
            @click="handleNextRegistro"
          />
        </div>
      </div>

      <!-- Banner ticket / productor -->
      <div class="row items-center q-gutter-sm">
        <q-badge
          v-if="currentRegistro?.ticket"
          color="purple-2"
          text-color="purple-9"
          class="q-pa-sm"
        >
          Ticket: {{ currentRegistro.ticket }}
        </q-badge>
        <q-badge
          v-if="currentRegistro?.productor && currentStatus === 'precio_autorizado'"
          color="blue-2"
          text-color="blue-9"
          class="q-pa-sm"
        >
          Productor: {{ currentRegistro.productor }}
        </q-badge>
      </div>
    </div>

    <!-- Indicador de estado -->
    <div class="q-mb-md">
      <q-banner rounded :class="estadoBannerClass">
        <template #avatar>
          <q-icon :name="estadoIcon" />
        </template>
        <div class="text-weight-medium">{{ estadoTexto }}</div>
      </q-banner>
    </div>

    <!-- Card principal -->
    <div class="row justify-center">
      <q-card bordered class="full-width" style="max-width: 980px">
        <!-- Header color por estado -->
        <q-card-section class="text-white text-center" :style="headerStyle">
          <div class="text-h6">{{ headerTitle }}</div>
          <div class="text-caption" style="opacity: 0.9">{{ headerSubtitle }}</div>
        </q-card-section>

        <!-- Acciones imprimir/descargar -->
        <q-card-section class="row justify-end q-gutter-sm">
          <q-btn
            flat
            round
            icon="print"
            :disable="!accionesDisponibles"
            :title="accionesDisponibles ? '' : 'Disponible cuando se autorice el precio'"
            @click="handleImprimir"
          />
          <q-btn
            flat
            round
            icon="download"
            :disable="!accionesDisponibles"
            :title="accionesDisponibles ? '' : 'Disponible cuando se autorice el precio'"
            @click="handleDescargar"
          />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <!-- Folio -->
          <div class="row justify-end q-mb-md">
            <div style="width: 320px">
              <q-input
                :model-value="currentRegistro?.boleta || ''"
                label="FOLIO / BOLETA"
                outlined
                dense
                disable
              />
            </div>
          </div>

          <!-- Grid campos (2 columnas) -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-input
                :model-value="currentRegistro?.productor || ''"
                label="PRODUCTOR"
                outlined
                dense
                disable
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                :model-value="currentRegistro?.fechaHora || ''"
                label="FECHA Y HORA"
                outlined
                dense
                disable
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                :model-value="currentRegistro?.telefono || '-'"
                label="TELÉFONO"
                outlined
                dense
                disable
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                :model-value="currentRegistro?.tProductor || ''"
                label="T. PRODUCTOR"
                outlined
                dense
                disable
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                :model-value="currentRegistro?.comprador || ''"
                label="COMPRADOR"
                outlined
                dense
                disable
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                :model-value="currentRegistro?.origen || ''"
                label="ORIGEN"
                outlined
                dense
                disable
              />
            </div>

            <!-- PRECIO -->
            <div class="col-12 col-md-6">
              <q-input
                :model-value="precioInputValue"
                label="PRECIO"
                outlined
                dense
                disable
                :placeholder="precioPlaceholder"
                :class="precioClass"
              />
            </div>

            <!-- DESCUENTO -->
            <div class="col-12 col-md-6">
              <q-input
                :model-value="`${precioCalculado.descuento} kg/ton`"
                label="DESCUENTO (KG/TON)"
                outlined
                dense
                disable
                :class="precioClass"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                :model-value="currentRegistro?.calibre || '-'"
                label="CALIBRE"
                outlined
                dense
                disable
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input :model-value="humedadStr" label="HUMEDAD" outlined dense disable />
            </div>
          </div>

          <!-- Tabla análisis -->
          <TablaAnalisisDesplegable
            v-if="currentRegistro"
            :impurezas="currentRegistro.impurezas"
            :r1="currentRegistro.r1"
            :r2="currentRegistro.r2"
            :cafesLisos="currentRegistro.cafesLisos"
            :manchados="currentRegistro.manchados"
            :quebMxc="currentRegistro.quebMxc"
            :helados="currentRegistro.helados"
            :alimonados="currentRegistro.alimonados"
            :revolcados="currentRegistro.revolcados"
            :sumaR2="currentRegistro.sumaR2"
            :totalDanos="currentRegistro.totalDanos"
            :exportacion="currentRegistro.exportacion"
            :readOnly="true"
          />

          <!-- Fotos -->
          <div v-if="currentRegistro?.fotos?.length" class="q-mt-md">
            <q-card bordered>
              <q-card-section class="row items-center q-gutter-sm bg-grey-2">
                <q-icon name="photo_camera" />
                <div class="text-subtitle2">
                  FOTOS DEL ANÁLISIS ({{ currentRegistro.fotos.length }})
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div
                    v-for="(foto, idx) in currentRegistro.fotos"
                    :key="foto + idx"
                    class="col-6 col-sm-4"
                  >
                    <q-img
                      :src="foto"
                      ratio="4/3"
                      class="rounded-borders cursor-pointer"
                      @click="abrirFoto(foto)"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Pregunta aceptación (cuando aplica) -->
          <div v-if="mostrarPreguntaAceptacion" class="q-mt-lg">
            <q-card bordered class="bg-blue-1" style="border: 2px solid #90caf9">
              <q-card-section class="text-center">
                <div class="text-h6 text-blue-10 q-mb-md">¿Productor Aceptó Precio?</div>

                <div class="row justify-center q-gutter-md">
                  <q-btn
                    color="positive"
                    unelevated
                    size="lg"
                    label="✓ SÍ"
                    @click="handleAceptarPrecio(true)"
                  />
                  <q-btn
                    color="negative"
                    unelevated
                    size="lg"
                    label="✗ NO"
                    @click="handleAceptarPrecio(false)"
                  />
                </div>

                <div class="text-caption text-grey-8 q-mt-md">
                  Si acepta, se manda a Volcado. Si rechaza, se manda a Renegociar Precio.
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Acciones extra (renegociar / volcado) -->
          <div v-if="currentStatus === 'en_renegociacion'" class="q-mt-md row justify-center">
            <q-btn
              color="negative"
              unelevated
              icon="edit"
              label="Ir a Renegociar"
              @click="handleIrARenegociar"
            />
          </div>

          <div v-if="currentStatus === 'precio_aceptado'" class="q-mt-md row justify-center">
            <q-btn
              color="positive"
              unelevated
              icon="local_shipping"
              label="Enviar a Volcado"
              @click="handleDescargarVolcado"
            />
          </div>

          <!-- Firmas (layout simple) -->
          <div class="q-mt-xl">
            <q-separator />
            <div class="row q-col-gutter-md q-mt-lg">
              <div class="col-4 text-center">
                <div style="border-top: 1px solid #999; padding-top: 8px; margin-top: 48px">
                  <div class="text-caption text-weight-medium">ANALISTA</div>
                </div>
              </div>
              <div class="col-4 text-center">
                <div style="border-top: 1px solid #999; padding-top: 8px; margin-top: 48px">
                  <div class="text-caption text-weight-medium">RECEPCIONISTA</div>
                </div>
              </div>
              <div class="col-4 text-center">
                <div style="border-top: 1px solid #999; padding-top: 8px; margin-top: 48px">
                  <div class="text-caption text-weight-medium">AUTORIZÓ</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Dialog, Notify } from 'quasar';
import TablaAnalisisDesplegable from './TablaAnalisisDesplegable.vue';
import BoletaListado from './BoletaListado.vue';

type BoletaStep = 'preliminar' | 'confirmacion' | 'final' | null;

interface BoletaFlowProps {
  boletaStep?: BoletaStep;
  setBoletaStep?: (step: BoletaStep) => void;
  setActiveMenu?: (menu: string) => void;
  setPrecioAceptado?: (accepted: boolean | null) => void;
  setShowRenegociar?: (show: boolean) => void;
  setRegistroRenegociar?: (registro: any) => void;
  boletaData?: any;
  setBoletaData?: (data: any) => void;
  precioBaseUSD?: string;
  tipoCambioFIX?: string;
  tablaCalibre?: Array<{ calibre: string; descuento: number }>;
  boletasPrecios?: any[];
  setBoletasPrecios?: (boletas: any[] | ((prev: any[]) => any[])) => void;
}

const props = withDefaults(defineProps<BoletaFlowProps>(), {
  boletaStep: null,
  setBoletaStep: () => {},
  setActiveMenu: () => {},
  setPrecioAceptado: () => {},
  setShowRenegociar: () => {},
  setRegistroRenegociar: () => {},
  boletaData: () => ({
    folio: '',
    productor: '',
    telefono: '',
    comprador: '',
    origen: '',
    fechaHora: '',
    tProductor: '',
    descuento: '',
    humedad: '',
    producto: '',
    precio: '',
    denominacion: '',
    totalGranos: '',
    exportacion: '',
    calidadB2: '',
  }),
  setBoletaData: () => {},
  precioBaseUSD: '0',
  tipoCambioFIX: '0',
  tablaCalibre: () => [],
  boletasPrecios: () => [],
  setBoletasPrecios: () => {},
});

type StatusLocal = 'sin_precio' | 'precio_autorizado' | 'precio_aceptado' | 'en_renegociacion';

const currentRegistroIndex = ref(0);
const showList = ref(true);
const registros = ref<any[]>([]);

function mapBoletasToRegistros(list: any[]) {
  return (list || [])
    .filter(
      (b) =>
        b.estatus === 'Pendiente por Autorizar' ||
        b.estatus === 'Autorizado CC' ||
        b.estatus === 'Pendiente por Negociar' ||
        b.estatus === 'Aceptado por Productor',
    )
    .map((b, index) => ({
      ...b,
      id: b.noBoleta || `boleta-${index}`,
      boleta: b.noBoleta,
      fechaHora: b.fecha || '',
      pesoBruto: `${((b.tonsAprox || 0) * 1000).toFixed(0)} kg`,
      status:
        b.estatus === 'Pendiente por Autorizar'
          ? 'sin_precio'
          : b.estatus === 'Autorizado CC'
            ? 'precio_autorizado'
            : b.estatus === 'Aceptado por Productor'
              ? 'precio_aceptado'
              : 'en_renegociacion',
      precioPorKilo:
        b.estatus === 'Autorizado CC' || b.estatus === 'Aceptado por Productor'
          ? `$${(b.precioSugerido || 0).toFixed(2)}`
          : null,
      descuento: `${(b.descuento || 0).toFixed(2)}`,
      precioAutorizado: b.estatus === 'Autorizado CC' || b.estatus === 'Aceptado por Productor',
      totalDanos: (Number(b.impurezas || 0) + Number(b.r1 || 0) + Number(b.sumaR2 || 0)).toFixed(1),
      humedad: b.humedad || 0,
      tProductor: b.tProductor || '',
    }));
}

watch(
  () => props.boletasPrecios,
  (v) => {
    registros.value = mapBoletasToRegistros(v || []);
    if (currentRegistroIndex.value >= registros.value.length) currentRegistroIndex.value = 0;
  },
  { immediate: true, deep: true },
);

const totalRegistros = computed(() => registros.value.length);
const currentRegistro = computed(() => registros.value[currentRegistroIndex.value] || null);
const currentStatus = computed<StatusLocal | null>(
  () => (currentRegistro.value?.status as StatusLocal) || null,
);

function handlePrevRegistro() {
  if (currentRegistroIndex.value > 0) currentRegistroIndex.value--;
}

function handleNextRegistro() {
  if (currentRegistroIndex.value < totalRegistros.value - 1) currentRegistroIndex.value++;
}

function setShowList(v: boolean) {
  showList.value = v;
}

function handleVerBoleta(index: number) {
  currentRegistroIndex.value = index;
  showList.value = false;
}

function volverARecepcion() {
  props.setActiveMenu?.('Recepción de Granos');
}

function abrirFoto(url: string) {
  window.open(url, '_blank');
}

/** Precio dinámico */
function calcularPrecio(calibre: string, impurezas: number) {
  const precioBase = parseFloat(props.precioBaseUSD) * parseFloat(props.tipoCambioFIX);
  const item = (props.tablaCalibre || []).find((i) => i.calibre === calibre);
  const descuentoCalibre = item ? item.descuento : 0;
  const precioMXNPorTonelada = precioBase - descuentoCalibre;
  const precioPorKilo = precioMXNPorTonelada / 1000;
  const descuentoImpurezas = impurezas * 10;

  return {
    precioPorKilo: `$${precioPorKilo.toFixed(2)}`,
    descuento: `${descuentoImpurezas.toFixed(2)}`,
  };
}

const precioCalculado = computed(() => {
  const r = currentRegistro.value;
  if (!r?.calibre) return { precioPorKilo: null as string | null, descuento: '0.00' };
  return calcularPrecio(r.calibre, Number(r.impurezas || 0));
});

/** UI helpers */
const accionesDisponibles = computed(
  () => currentStatus.value === 'precio_autorizado' || currentStatus.value === 'precio_aceptado',
);

const humedadStr = computed(() => {
  const h = currentRegistro.value?.humedad;
  return h ? `${h}%` : '-';
});

const precioInputValue = computed(() => {
  if (!currentRegistro.value) return '';
  // igual que TSX: si no autorizado, no mostrar precio
  if (!accionesDisponibles.value) return '';
  // si está autorizado, preferir precioCalculado (derivado) o precioPorKilo del registro
  return precioCalculado.value.precioPorKilo || currentRegistro.value.precioPorKilo || '';
});

const precioPlaceholder = computed(() =>
  accionesDisponibles.value ? '' : 'Pendiente de autorización',
);

const precioClass = computed(() => (accionesDisponibles.value ? 'bg-green-1' : ''));

const estadoTexto = computed(() => {
  switch (currentStatus.value) {
    case 'en_renegociacion':
      return '⚠️ Pendiente de Renegociación - Precio Rechazado por Productor';
    case 'precio_autorizado':
      return '✓ Precio Autorizado - Pendiente de Confirmación del Productor';
    case 'precio_aceptado':
      return '✓ Precio Aceptado - Boleta Finalizada';
    case 'sin_precio':
      return '⏳ Pendiente de Autorización de Precio';
    default:
      return 'Estado desconocido';
  }
});

const estadoIcon = computed(() => {
  switch (currentStatus.value) {
    case 'en_renegociacion':
      return 'warning';
    case 'precio_autorizado':
      return 'check_circle';
    case 'precio_aceptado':
      return 'check_circle';
    case 'sin_precio':
      return 'schedule';
    default:
      return 'help';
  }
});

const estadoBannerClass = computed(() => {
  switch (currentStatus.value) {
    case 'en_renegociacion':
      return 'bg-red-1 text-red-10';
    case 'precio_autorizado':
      return 'bg-green-1 text-green-10';
    case 'precio_aceptado':
      return 'bg-green-1 text-green-10';
    default:
      return 'bg-yellow-1 text-yellow-10';
  }
});

const headerStyle = computed(() => {
  if (currentStatus.value === 'precio_aceptado') return 'background:#2e7d32;';
  return 'background:#fb8c00;';
});

const headerTitle = computed(() =>
  currentStatus.value === 'precio_aceptado' ? 'BOLETA' : 'BOLETA PRELIMINAR',
);
const headerSubtitle = computed(() => {
  if (currentStatus.value === 'precio_aceptado') return 'Precio aceptado por productor';
  if (currentStatus.value === 'precio_autorizado')
    return 'Precio autorizado - Requiere confirmación del productor';
  return 'En espera de autorización de precio';
});

const tituloPantalla = computed(() => {
  if (currentStatus.value === 'precio_autorizado') return 'Boleta - Confirmación de Precio';
  return 'Boleta - Recepción de Granos';
});

const mostrarPreguntaAceptacion = computed(
  () =>
    currentStatus.value === 'precio_autorizado' ||
    currentStatus.value === 'sin_precio' ||
    currentStatus.value === 'en_renegociacion',
);

/** Acciones */
function handleAceptarPrecio(acepta: boolean) {
  const r = currentRegistro.value;
  if (!r) return;

  if (acepta) {
    // actualizar boletasPrecios
    props.setBoletasPrecios?.((prev: any[]) =>
      prev.map((b) => (b.noBoleta === r.boleta ? { ...b, estatus: 'Aceptado por Productor' } : b)),
    );

    // actualizar local
    registros.value = registros.value.map((x) =>
      x.boleta === r.boleta ? { ...x, status: 'precio_aceptado', precioAceptado: true } : x,
    );

    props.setPrecioAceptado?.(true);

    Dialog.create({
      title: '✅ Precio aceptado',
      message: `Boleta: ${r.boleta}\nTicket: ${r.ticket}\n\nLa boleta está lista para Volcado.`,
    });
  } else {
    props.setBoletasPrecios?.((prev: any[]) =>
      prev.map((b) => (b.noBoleta === r.boleta ? { ...b, estatus: 'Pendiente por Negociar' } : b)),
    );

    registros.value = registros.value.map((x) =>
      x.boleta === r.boleta ? { ...x, status: 'en_renegociacion', precioAceptado: false } : x,
    );

    props.setPrecioAceptado?.(false);

    Dialog.create({
      title: '❌ Precio rechazado',
      message: `Boleta: ${r.boleta}\nTicket: ${r.ticket}\n\nEl registro se enviará a Renegociar Precio.`,
    });
  }
}

function handleIrARenegociar() {
  const r = currentRegistro.value;
  if (!r) return;
  props.setRegistroRenegociar?.(r);
  props.setShowRenegociar?.(true);
}

function handleDescargarVolcado() {
  const r = currentRegistro.value;
  if (!r) return;

  Dialog.create({
    title: 'Volcado',
    message: `Boleta ${r.boleta} enviada a Volcado para su descarga.\n\nTicket: ${r.ticket}\nProductor: ${r.productor}\nPrecio Final: ${r.precioFinal || r.precioPorKilo || ''}`,
  });

  props.setActiveMenu?.('Volcado');
}

function handleImprimir() {
  if (currentStatus.value === 'precio_aceptado') {
    window.print();
    return;
  }
  Notify.create({
    type: 'info',
    message: 'Imprimir: disponible cuando la boleta sea final (precio aceptado).',
  });
}

function handleDescargar() {
  Notify.create({
    type: 'info',
    message: 'Descargar PDF: pendiente de backend (igual que TSX, estaba como TODO).',
  });
}
</script>
