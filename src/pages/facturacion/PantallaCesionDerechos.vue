<template>
  <div class="q-pa-md bg-grey-2">
    <!-- Header -->
    <q-toolbar class="bg-orange-6 text-white">
      <q-btn flat round dense icon="arrow_back" @click="onBackSafe" />
      <q-toolbar-title class="text-weight-medium">Cesion de Derechos del Ticket</q-toolbar-title>
    </q-toolbar>

    <div class="q-mt-md" style="max-width: 1100px; margin: 0 auto;">
      <!-- Datos del Ticket -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="bg-orange-6 text-white">
          <div class="text-subtitle1 text-weight-medium">Datos del Ticket</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <div class="text-caption text-weight-medium q-mb-xs">No. Ticket</div>
              <q-input dense outlined readonly :model-value="props.ticket" />
            </div>
            <div class="col-12 col-md-4">
              <div class="text-caption text-weight-medium q-mb-xs">Fecha</div>
              <q-input dense outlined readonly :model-value="props.fecha" />
            </div>
            <div class="col-12 col-md-4">
              <div class="text-caption text-weight-medium q-mb-xs">Comprador</div>
              <q-input dense outlined readonly :model-value="props.comprador" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Nuevo productor -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="bg-orange-6 text-white">
          <div class="text-subtitle1 text-weight-medium">Nuevo Productor/Beneficiario</div>
        </q-card-section>

        <q-card-section>
          <div class="text-caption text-weight-medium q-mb-xs">Nombre Completo</div>
          <q-input
            dense
            outlined
            v-model="nuevoProductor"
            :disable="documentoGenerado"
            placeholder="Ingrese el nombre completo del nuevo productor/beneficiario"
          />
        </q-card-section>
      </q-card>

      <!-- Generar documento -->
      <div v-if="!documentoGenerado" class="row justify-center q-mb-md">
        <q-btn
          color="purple-8"
          unelevated
          label="Generar Documento de Endoso"
          class="q-px-xl"
          @click="handleGenerarDocumento"
        />
      </div>

      <!-- Documento generado -->
      <template v-if="documentoGenerado">
        <q-card flat bordered class="q-mb-md" style="border: 2px solid #6a1b9a;">
          <q-card-section class="bg-purple-8 text-white">
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-medium">Documento de Endoso</div>
              <q-btn
                color="white"
                text-color="purple-8"
                unelevated
                icon="print"
                label="Imprimir"
                @click="handleImprimir"
              />
            </div>
          </q-card-section>

          <q-card-section class="q-pa-lg">
            <div ref="documentoRef" class="documento-endoso-print">
            <div class="text-center q-mb-lg">
              <div class="text-h5 text-weight-bold">CARTA DE CESION DE DERECHOS</div>
              <div class="text-caption text-grey-7">Ticket No. {{ props.ticket }}</div>
            </div>

            <div class="text-body2" style="line-height: 1.7;">
              <p class="q-mb-md">
                Por medio de la presente, yo
                <span class="text-weight-bold text-underline">{{ props.productorAnterior }}</span>,
                en mi caracter de PRODUCTOR CEDENTE y titular de los derechos del Ticket No.
                <span class="text-weight-bold">{{ props.ticket }}</span>
                con fecha <span class="text-weight-bold">{{ props.fecha }}</span>, manifiesto mi voluntad de
                ceder todos los derechos y obligaciones derivados del mismo.
              </p>

              <q-card flat bordered class="bg-grey-1 q-mb-md">
                <q-card-section>
                  <div class="text-weight-bold q-mb-sm">DATOS DEL TICKET:</div>
                  <div class="row q-col-gutter-md text-body2">
                    <div class="col-12 col-md-6"><span class="text-weight-bold">No. Ticket:</span> {{ props.ticket }}</div>
                    <div class="col-12 col-md-6"><span class="text-weight-bold">Fecha:</span> {{ props.fecha }}</div>
                    <div class="col-12 col-md-6"><span class="text-weight-bold">Comprador:</span> {{ props.comprador }}</div>
                    <div class="col-12 col-md-6"><span class="text-weight-bold">KG a Liquidar:</span> {{ props.datosEntrega.preliquidacion.kgLiquidar }}</div>
                    <div class="col-12 col-md-6"><span class="text-weight-bold">Precio:</span> {{ props.datosEntrega.preliquidacion.precio }}</div>
                    <div class="col-12 col-md-6"><span class="text-weight-bold">Total a Pagar:</span> ${{ totalAPagar }}</div>
                  </div>
                </q-card-section>
              </q-card>

              <p class="q-mb-md">
                CEDO en favor de
                <span class="text-weight-bold text-underline">{{ nuevoProductor }}</span>, en adelante el
                CESIONARIO o NUEVO BENEFICIARIO, todos los derechos y beneficios economicos derivados del
                Ticket antes mencionado, incluyendo pero no limitado a:
              </p>

              <ul class="q-pl-lg q-mb-md">
                <li>El derecho a recibir el pago total por la cantidad de <span class="text-weight-bold">${{ totalAPagar }} MXN</span></li>
                <li>El derecho a cobrar los <span class="text-weight-bold">{{ props.datosEntrega.preliquidacion.kgLiquidar }} KG</span> liquidados</li>
                <li>Cualquier otro derecho o beneficio derivado de la transaccion</li>
              </ul>

              <p class="q-mb-md">
                El CESIONARIO acepta asumir todos los derechos cedidos y se compromete a cumplir con las
                obligaciones correspondientes.
              </p>

              <p class="q-mb-lg">
                Ambas partes manifiestan que la presente cesion se realiza de manera libre, voluntaria y sin
                ningun tipo de coaccion, deslindando de cualquier responsabilidad entre las partes.
              </p>

              <div class="row q-col-gutter-xl q-mt-xl q-pt-md" style="border-top: 1px solid #cfcfcf;">
                <div class="col-12 col-md-6 text-center">
                  <div style="height: 60px;"></div>
                  <div style="border-top: 2px solid #333; padding-top: 6px;">
                    <div class="text-weight-bold">{{ props.productorAnterior }}</div>
                    <div class="text-caption text-grey-7">PRODUCTOR CEDENTE</div>
                    <div class="text-caption text-grey-7">Firma</div>
                  </div>
                </div>

                <div class="col-12 col-md-6 text-center">
                  <div style="height: 60px;"></div>
                  <div style="border-top: 2px solid #333; padding-top: 6px;">
                    <div class="text-weight-bold">{{ nuevoProductor }}</div>
                    <div class="text-caption text-grey-7">NUEVO BENEFICIARIO</div>
                    <div class="text-caption text-grey-7">Firma</div>
                  </div>
                </div>
              </div>

              <div class="text-center text-caption text-grey-7 q-mt-lg">
                Fecha de emision: {{ fechaEmision }}
              </div>
            </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Documento escaneado -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-orange-6 text-white">
            <div class="text-subtitle1 text-weight-medium">Documento Escaneado</div>
          </q-card-section>

          <q-card-section>
            <div class="q-pa-lg" style="border: 2px dashed #cfcfcf; border-radius: 10px;">
              <div v-if="!documentoEscaneado" class="text-center">
                <q-icon name="upload" size="42px" class="text-grey-5 q-mb-sm" />
                <div class="text-body2 text-grey-7 q-mb-md">Cargar documento escaneado firmado</div>
                <q-file
                  v-model="documentoEscaneado"
                  dense
                  outlined
                  label="Seleccionar Archivo"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style="max-width: 300px; margin: 0 auto;"
                />
                <div class="text-caption text-grey-6 q-mt-sm">PDF, JPG, PNG (Max. 10MB)</div>
              </div>

              <div v-else class="row items-center justify-between bg-grey-1 q-pa-md" style="border-radius: 8px;">
                <div class="row items-center q-gutter-sm">
                  <q-icon name="upload" color="purple-8" size="28px" />
                  <div>
                    <div class="text-weight-medium">{{ documentoEscaneado.name }}</div>
                    <div class="text-caption text-grey-7">{{ (documentoEscaneado.size / 1024).toFixed(2) }} KB</div>
                  </div>
                </div>
                <q-btn flat round dense icon="close" color="negative" @click="documentoEscaneado = null" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Informacion general del ticket -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-orange-6 text-white">
            <div class="row items-center justify-between">
              <div class="text-subtitle1 text-weight-medium">INFORMACION GENERAL DEL TICKET</div>
              <q-btn
                flat round dense
                :icon="expandidoInfoGeneral ? 'expand_less' : 'expand_more'"
                @click="expandidoInfoGeneral = !expandidoInfoGeneral"
              />
            </div>
          </q-card-section>

          <q-slide-transition>
            <div v-show="expandidoInfoGeneral">
              <q-card-section>
                <!-- Boleta -->
                <div class="text-subtitle2 text-grey-8 q-mb-sm">BOLETA</div>
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">PRODUCTOR</div>
                    <q-input dense outlined readonly :model-value="props.datosEntrega.boleta.productor" />
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">TELEFONO</div>
                    <q-input dense outlined readonly :model-value="props.datosEntrega.boleta.telefono" />
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">MUNICIPIO</div>
                    <q-input dense outlined readonly :model-value="props.datosEntrega.boleta.municipio" />
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">HUMEDAD</div>
                    <q-input dense outlined readonly :model-value="props.datosEntrega.boleta.humedad" />
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">IMPUREZAS</div>
                    <q-input dense outlined readonly :model-value="props.datosEntrega.boleta.impurezas" />
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">R1</div>
                    <q-input dense outlined readonly :model-value="props.datosEntrega.boleta.r1" />
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">R2</div>
                    <q-input dense outlined readonly :model-value="props.datosEntrega.boleta.r2" />
                  </div>
                </div>

                <!-- Preliquidacion -->
                <div class="text-subtitle2 text-grey-8 q-mb-sm">PRE - LIQUIDACION</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">KG A LIQUIDAR</div>
                    <q-input dense outlined readonly :model-value="props.datosEntrega.preliquidacion.kgLiquidar" />
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">PRECIO</div>
                    <q-input dense outlined readonly :model-value="props.datosEntrega.preliquidacion.precio" />
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="text-caption text-grey-7">TOTAL A PAGAR</div>
                    <q-input dense outlined readonly :model-value="`$${totalAPagar}`" class="text-weight-bold" />
                  </div>
                </div>
              </q-card-section>
            </div>
          </q-slide-transition>
        </q-card>

        <!-- Informacion productor -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-orange-6 text-white">
            <div class="text-subtitle1 text-weight-medium">INFORMACION PRODUCTOR</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="text-caption text-weight-medium q-mb-xs">NOMBRE</div>
                <q-input dense outlined v-model="nombreProductor" placeholder="Ingrese nombre del productor" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-caption text-weight-medium q-mb-xs">RFC</div>
                <q-input dense outlined v-model="rfcProductor" placeholder="Ingrese RFC" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-caption text-weight-medium q-mb-xs">ORIGEN</div>
                <q-input dense outlined v-model="origenProductor" placeholder="Ingrese origen" />
              </div>
              <div class="col-12 col-md-6">
                <div class="text-caption text-weight-medium q-mb-xs">MUNICIPIO</div>
                <q-input dense outlined v-model="municipioProductor" placeholder="Ingrese municipio" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Archivos adjuntos -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-orange-6 text-white">
            <div class="text-subtitle1 text-weight-medium">Archivos Adjuntos</div>
          </q-card-section>

          <q-card-section>
            <div class="column q-gutter-sm">
              <div
                v-for="doc in documentosAdjuntos"
                :key="doc.key"
                class="row items-center justify-between q-pa-md"
                style="border: 2px solid #cfcfcf; border-radius: 10px;"
              >
                <div class="col">
                  <div class="text-body2 text-weight-medium">{{ doc.label }}</div>
                  <div v-if="doc.archivo" class="text-caption text-positive">
                    <q-icon name="check_circle" color="positive" size="xs" class="q-mr-xs" />
                    {{ doc.archivo }}
                  </div>
                </div>
                <div>
                  <input
                    :ref="(el) => { fileInputRefs[doc.key] = el as HTMLInputElement; }"
                    type="file"
                    :accept="doc.accept"
                    style="display: none;"
                    @change="(e) => onFileSelected(doc.key, e)"
                  />
                  <q-btn
                    color="purple-8"
                    unelevated
                    :label="doc.archivo ? 'CAMBIAR' : 'ADJUNTAR'"
                    :icon="doc.archivo ? 'swap_horiz' : 'attach_file'"
                    @click="triggerFileInput(doc.key)"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Guardar -->
        <div class="row justify-center q-mb-lg">
          <q-btn color="positive" unelevated class="q-px-xl" label="Guardar y Regresar" @click="handleGuardar" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue';
import { useQuasar } from 'quasar';

interface DatosEntrega {
  boleta: {
    productor: string;
    telefono: string;
    municipio: string;
    humedad: string;
    impurezas: string;
    r1: string;
    r2: string;
  };
  preliquidacion: {
    kgLiquidar: string;
    precio: string;
  };
}

interface GuardarPayload {
  nuevoProductor: string;
  documentoEscaneado: File | null;
  nombreProductor: string;
  rfcProductor: string;
  origenProductor: string;
  municipioProductor: string;
  identificacionOficial: string;
  constanciaSituacionFiscal: string;
  opinionCumplimiento: string;
  otroArchivo: string;
}

interface Props {
  ticket: string;
  fecha: string;
  comprador: string;
  productorAnterior: string;
  datosEntrega: DatosEntrega;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  back: [];
  guardar: [datos: GuardarPayload];
}>();

const $q = useQuasar();

const onBackSafe = () => emit('back');

// Estado
const nuevoProductor = ref('');
const documentoGenerado = ref(false);
const documentoRef = ref<HTMLElement | null>(null);
const expandidoInfoGeneral = ref(true);

// Info productor
const nombreProductor = ref('');
const rfcProductor = ref('');
const origenProductor = ref('');
const municipioProductor = ref('');

// Documento escaneado
const documentoEscaneado = ref<File | null>(null);

// Archivos adjuntos
const archivosState = reactive<Record<string, string>>({
  identificacion: '',
  constancia: '',
  opinion: '',
  otro: ''
});

const documentosAdjuntos = computed(() => [
  { key: 'identificacion', label: 'IDENTIFICACION OFICIAL .PDF', archivo: archivosState.identificacion, accept: '.pdf' },
  { key: 'constancia', label: 'CONSTANCIA DE SITUACION FISCAL .PDF', archivo: archivosState.constancia, accept: '.pdf' },
  { key: 'opinion', label: 'OPINION DE CUMPLIMIENTO DE OBLIGACIONES FISCALES .PDF', archivo: archivosState.opinion, accept: '.pdf' },
  { key: 'otro', label: 'OTRO', archivo: archivosState.otro, accept: '.pdf,.doc,.docx,.jpg,.png' }
]);

const fileInputRefs = reactive<Record<string, HTMLInputElement | null>>({});

function triggerFileInput(key: string) {
  const input = fileInputRefs[key];
  if (input) {
    input.value = '';
    input.click();
  }
}

function onFileSelected(key: string, event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // Validar que sea PDF para los documentos que lo requieren
  const doc = documentosAdjuntos.value.find((d) => d.key === key);
  if (doc && doc.accept === '.pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    $q.notify({
      type: 'warning',
      message: 'Solo se permiten archivos PDF para este documento.',
      position: 'top',
    });
    return;
  }

  archivosState[key] = file.name;
}

function handleGenerarDocumento() {
  if (!nuevoProductor.value.trim()) {
    $q.dialog({
      title: 'Validacion',
      message: 'Por favor ingrese el nombre del nuevo productor/beneficiario',
      ok: { label: 'Entendido', color: 'primary' },
    });
    return;
  }
  documentoGenerado.value = true;
}

function handleImprimir() {
  if (!documentoRef.value) return;
  const contenido = documentoRef.value.innerHTML;
  const ventana = window.open('', '_blank', 'width=800,height=600');
  if (!ventana) return;
  ventana.document.write(`
    <html>
      <head>
        <title>Carta de Cesion de Derechos - Ticket ${props.ticket}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.7; color: #333; }
          .text-h5 { font-size: 1.4rem; margin: 0; }
          .text-weight-bold { font-weight: bold; }
          .text-center { text-align: center; }
          .text-caption { font-size: 0.75rem; color: #777; }
          .text-underline { text-decoration: underline; }
          .q-mb-lg { margin-bottom: 20px; }
          .q-mb-md { margin-bottom: 12px; }
          .q-mt-lg { margin-top: 20px; }
          .q-mt-xl { margin-top: 30px; }
          .q-pt-md { padding-top: 12px; }
          .q-pa-lg { padding: 24px; }
          .q-pl-lg { padding-left: 24px; }
          ul { padding-left: 24px; }
          li { margin-bottom: 4px; }
          .row { display: flex; flex-wrap: wrap; gap: 12px; }
          .col-12 { width: 100%; }
          .col-md-6 { width: 48%; }
          @media print { body { padding: 15px; } }
        </style>
      </head>
      <body>${contenido}</body>
    </html>
  `);
  ventana.document.close();
  ventana.focus();
  ventana.print();
  ventana.close();
}

const totalAPagar = computed(() => {
  const kgLiquidar = parseFloat((props.datosEntrega.preliquidacion.kgLiquidar || '').replace(/,/g, '')) || 0;
  const precio = parseFloat((props.datosEntrega.preliquidacion.precio || '').replace(/[$,]/g, '')) || 0;
  const total = kgLiquidar * precio;
  return total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
});

const fechaEmision = computed(() => {
  return new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
});

function handleGuardar() {
  emit('guardar', {
    nuevoProductor: nuevoProductor.value,
    documentoEscaneado: documentoEscaneado.value,
    nombreProductor: nombreProductor.value,
    rfcProductor: rfcProductor.value,
    origenProductor: origenProductor.value,
    municipioProductor: municipioProductor.value,
    identificacionOficial: archivosState.identificacion ?? '',
    constanciaSituacionFiscal: archivosState.constancia ?? '',
    opinionCumplimiento: archivosState.opinion ?? '',
    otroArchivo: archivosState.otro ?? '',
  });

  $q.notify({ type: 'positive', message: 'Cesion de derechos guardada.', position: 'top' });
  onBackSafe();
}
</script>

<style scoped>
.text-underline {
  text-decoration: underline;
}

@media print {
  .q-toolbar,
  .q-btn {
    display: none !important;
  }
}
</style>
