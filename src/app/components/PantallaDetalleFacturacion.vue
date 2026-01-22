<template>
  <q-page class="bg-grey-2">

    <!-- Pantalla Cesión de Derechos -->
    <PantallaCesionDerechos
      v-if="mostrarCesionDerechos"
      :ticket="entregaActual.ticket"
      :fecha="entregaActual.fecha"
      :comprador="entregaActual.boleta.comprador"
      :productorAnterior="entregaActual.boleta.productor"
      :datosEntrega="{
        boleta: {
          productor: entregaActual.boleta.productor,
          telefono: entregaActual.boleta.telefono,
          municipio: entregaActual.boleta.origen || 'N/A',
          humedad: entregaActual.boleta.humedad,
          impurezas: entregaActual.boleta.impurezas,
          r1: entregaActual.boleta.r1,
          r2: entregaActual.boleta.r2
        },
        preliquidacion: {
          kgLiquidar: entregaActual.preliquidacion.kgLiquidar,
          precio: entregaActual.preliquidacion.precio
        }
      }"
      @back="mostrarCesionDerechos = false"
      @guardar="onGuardarCesionDerechos"
    />

    <template v-else>
      <!-- Header -->
      <div class="bg-orange-6 text-white q-px-lg q-py-md row items-center q-gutter-md">
        <q-btn flat round icon="arrow_back" @click="emitBack" />
        <div class="text-h6">Facturación - Detalle</div>
      </div>

      <div class="q-pa-lg" style="max-width: 1100px; margin: 0 auto;">
        <!-- Datos del Registro -->
        <q-card class="q-mb-lg" flat bordered>
          <q-card-section class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-medium">Datos Registro</div>
            <q-btn
              color="purple-8"
              label="ENDOSO"
              class="text-weight-medium"
              @click="mostrarCesionDerechos = true"
            />
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input dense outlined label="No. Ticket" :model-value="entregaActual.ticket" readonly />
              </div>
              <div class="col-12 col-md-6">
                <q-input dense outlined label="Fecha" :model-value="entregaActual.fecha" readonly />
              </div>
              <div class="col-12 col-md-6">
                <q-input dense outlined label="Productor" :model-value="productor" readonly />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  dense
                  outlined
                  :label="`RFC${rfcPendiente ? ' *' : ''}`"
                  v-model="rfcInputValue"
                  :readonly="!rfcPendiente"
                  maxlength="13"
                  class="font-mono"
                >
                  <template v-if="rfcPendiente && !rfcRegistrado" #append>
                    <q-btn dense flat color="purple-8" label="Guardar" @click="handleGuardarRFC" />
                  </template>
                </q-input>

                <div v-if="rfcPendiente" class="text-caption text-purple-8 q-mt-xs">
                  12 caracteres = Persona Moral | 13 caracteres = Persona Física
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Banner ayuda RFC pendiente -->
        <q-banner
          v-if="rfcPendiente && !rfcRegistrado"
          class="bg-purple-1 text-purple-10 q-mb-lg"
          rounded
          dense
        >
          <template #avatar>
            <q-icon name="lightbulb" color="purple-8" />
          </template>

          <div class="text-weight-medium">RFC Pendiente - Acción requerida</div>
          <div class="text-body2">
            Capture el RFC y presione <b>Guardar</b>. El sistema detectará Persona Moral/Física y habilitará campos correspondientes.
          </div>
        </q-banner>

        <!-- Producto -->
        <q-card class="q-mb-lg" flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium text-orange-8 q-mb-sm">Producto</div>
            <q-card flat bordered class="bg-grey-1">
              <q-card-section class="text-h6 text-grey-9">
                {{ entregaActual.preliquidacion.producto }}
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>

        <!-- Tabs entregas -->
        <q-card v-if="entregas.length > 1" class="q-mb-lg" flat bordered>
          <q-tabs
            v-model="pestanaActiva"
            dense
            class="text-grey-8"
            active-color="white"
            active-bg-color="orange-6"
            indicator-color="transparent"
            align="left"
          >
            <q-tab
              v-for="(entrega, idx) in entregas"
              :key="entrega.ticket + '-' + idx"
              :name="idx"
              :label="`Entrega ${idx + 1} - Ticket ${entrega.ticket}`"
            />
          </q-tabs>
        </q-card>

        <!-- INFORMACIÓN GENERAL -->
        <q-expansion-item
          v-model="expandidoInfoGeneral"
          label="Información General"
          header-class="bg-orange-6 text-white text-weight-medium"
          expand-icon-class="text-white"
          class="q-mb-lg"
          bordered
        >
          <q-card flat>
            <q-card-section>
              <!-- Campos básicos boleta -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input dense outlined label="FOLIO / BOLETA" :model-value="entregaActual.boleta.folio" readonly />
                </div>
                <div class="col-12 col-md-6">
                  <q-input dense outlined label="FECHA Y HORA" :model-value="entregaActual.boleta.fechaHora" readonly />
                </div>

                <div class="col-12 col-md-6">
                  <q-input dense outlined label="PRODUCTOR" :model-value="entregaActual.boleta.productor" readonly />
                </div>
                <div class="col-12 col-md-6">
                  <q-input dense outlined label="TELÉFONO" :model-value="entregaActual.boleta.telefono" readonly />
                </div>

                <div class="col-12 col-md-6">
                  <q-input dense outlined label="T. PRODUCTOR" :model-value="entregaActual.boleta.tProductor" readonly />
                </div>
                <div class="col-12 col-md-6">
                  <q-input dense outlined label="COMPRADOR" :model-value="entregaActual.boleta.comprador" readonly />
                </div>

                <div class="col-12 col-md-6">
                  <q-input dense outlined label="ORIGEN" :model-value="entregaActual.boleta.origen" readonly />
                </div>
                <div class="col-12 col-md-6">
                  <q-input dense outlined label="PRECIO" :model-value="`$${entregaActual.boleta.precio}`" readonly />
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="DESCUENTO (KG/TON)"
                    :model-value="`${entregaActual.boleta.descuento} kg/ton`"
                    readonly
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-input dense outlined label="CALIBRE" :model-value="entregaActual.boleta.calibre" readonly />
                </div>

                <div class="col-12 col-md-6">
                  <q-input dense outlined label="HUMEDAD" :model-value="`${entregaActual.boleta.humedad}%`" readonly />
                </div>

                <!-- ATIENDE sólo persona moral -->
                <div
                  v-if="mostrarAtiendeEnBoleta"
                  class="col-12 col-md-6"
                >
                  <q-input
                    dense
                    outlined
                    label="ATIENDE (Representante)"
                    v-model="datosBoletaEditables.atiende"
                    :readonly="!rfcPendiente"
                    :hint="rfcPendiente ? 'Requerido para Persona Moral' : ''"
                  />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- Resultados de análisis -->
              <q-card flat bordered class="bg-grey-1">
                <q-card-section class="text-weight-medium">Resultados de Análisis</q-card-section>

                <q-expansion-item
                  v-model="expandidoTotalDanos"
                  label="TOTAL DE DAÑOS"
                  :caption="`${entregaActual.boleta.totalDanos}%`"
                  dense
                  bordered
                >
                  <div class="q-pa-md">
                    <div class="row q-col-gutter-sm">
                      <div class="col-12">
                        <div class="row justify-between">
                          <div>Impurezas</div>
                          <div class="text-weight-medium">{{ entregaActual.boleta.impurezas }}%</div>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="row justify-between">
                          <div>R1</div>
                          <div class="text-weight-medium">{{ entregaActual.boleta.r1 }}%</div>
                        </div>
                      </div>

                      <div class="col-12">
                        <q-expansion-item
                          v-model="expandidoSumaR2"
                          label="Suma de R2"
                          :caption="`${entregaActual.boleta.sumaR2}%`"
                          dense
                          bordered
                        >
                          <div class="q-pa-sm">
                            <div class="row justify-between q-py-xs"><div>R2</div><div class="text-weight-medium">{{ entregaActual.boleta.r2 }}%</div></div>
                            <div class="row justify-between q-py-xs"><div>Cafes/Lisos</div><div class="text-weight-medium">{{ entregaActual.boleta.cafesLisos }}%</div></div>
                            <div class="row justify-between q-py-xs"><div>Manchados</div><div class="text-weight-medium">{{ entregaActual.boleta.manchados }}%</div></div>
                            <div class="row justify-between q-py-xs"><div>QUEB/MXG/MITD/CAM</div><div class="text-weight-medium">{{ entregaActual.boleta.quebMxc }}%</div></div>
                            <div class="row justify-between q-py-xs"><div>Helados</div><div class="text-weight-medium">{{ entregaActual.boleta.helados }}%</div></div>
                            <div class="row justify-between q-py-xs"><div>Alimonados</div><div class="text-weight-medium">{{ entregaActual.boleta.alimonados }}%</div></div>
                            <div class="row justify-between q-py-xs"><div>Revolcados</div><div class="text-weight-medium">{{ entregaActual.boleta.revolcados }}%</div></div>
                          </div>
                        </q-expansion-item>
                      </div>
                    </div>
                  </div>
                </q-expansion-item>

                <q-separator />

                <q-item>
                  <q-item-section>EXPORTACIÓN</q-item-section>
                  <q-item-section side class="text-weight-medium">
                    {{ entregaActual.boleta.exportacion }}%
                  </q-item-section>
                </q-item>
              </q-card>

              <q-separator class="q-my-md" />

              <!-- XML de Factura (Paso 2) -->
              <q-card flat bordered>
                <q-card-section class="row items-center justify-between">
                  <div class="text-weight-medium">Factura XML</div>
                  <q-chip
                    v-if="xmlGuardado"
                    color="green-2"
                    text-color="green-10"
                    label="XML Guardado"
                  />
                  <q-chip
                    v-else-if="xmlFacturaSubido"
                    color="orange-2"
                    text-color="orange-10"
                    label="XML Cargado (Pendiente Guardar)"
                  />
                  <q-chip
                    v-else
                    color="grey-3"
                    text-color="grey-9"
                    label="Pendiente XML"
                  />
                </q-card-section>

                <q-separator />

                <q-card-section>
                  <div class="row q-col-gutter-md items-end">
                    <div class="col-12 col-md-7">
                      <q-file
                        dense
                        outlined
                        label="Cargar XML de factura"
                        v-model="xmlFile"
                        accept=".xml"
                        :disable="!productoresGuardados"
                        @update:model-value="onXmlFileSelected"
                      />
                      <div v-if="nombreArchivoXml" class="text-caption q-mt-xs">
                        Archivo: {{ nombreArchivoXml }}
                      </div>
                      <div v-if="!productoresGuardados" class="text-caption text-negative q-mt-xs">
                        Debe guardar documentos del expediente antes de cargar/guardar el XML.
                      </div>
                    </div>

                    <div class="col-12 col-md-5">
                      <q-btn
                        color="orange-6"
                        label="Guardar XML"
                        :disable="!xmlFacturaSubido || !productoresGuardados || xmlGuardado"
                        @click="handleGuardarXmlFactura"
                        class="full-width"
                      />
                    </div>

                    <div class="col-12 col-md-4">
                      <q-input dense outlined label="IMPORTE" v-model="datosFacturacionEditables.importe" />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input dense outlined label="PAGO PREDIAL" v-model="datosFacturacionEditables.pagoPredial" />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input dense outlined label="DESC. PREDIAL" v-model="datosFacturacionEditables.descPredial" />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input dense outlined label="DESC. ISR" v-model="datosFacturacionEditables.descISR" />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input dense outlined label="A PAGAR (auto)" v-model="datosFacturacionEditables.aPagar" readonly />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input dense outlined label="DÍAS HÁBILES PAGO" v-model="datosFacturacionEditables.diasHabilesPago" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- NOTA:
                Aquí continuarías con el resto de secciones del TSX (Info Productor, Contacto adicional,
                Archivos Adjuntos, Productores agregados, Guardado de Documentos / Productores, etc.)
                usando el mismo patrón: q-expansion-item + q-input + q-file + validaciones.
              -->
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <!-- Acciones clave (Paso 1: Guardar documentos / Paso final: Guardar productores) -->
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <q-btn
              color="purple-8"
              label="Guardar Documentos (Paso 1)"
              class="full-width"
              :disable="productoresGuardados"
              @click="handleGuardarDocumentos"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-btn
              color="green-7"
              label="Guardar Productores (Validación total)"
              class="full-width"
              :disable="productoresGuardados"
              @click="handleGuardarProductores"
            />
          </div>
        </div>

      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import PantallaCesionDerechos from './PantallaCesionDerechos.vue';

interface PantallaDetalleFacturacionProps {
  onBack: () => void;
  entregas: EntregaData[];
  productor: string;
  rfc: string;
  onUpdateRfc?: (tickets: string[], nuevoRfc: string) => void;
  onUpdateDocumentosStatus?: (tickets: string[], tieneDocumentos: boolean, tieneFacturaXML: boolean) => void;
}

interface EntregaData {
  ticket: string;
  fecha: string;
  boleta: {
    folio: string;
    productor: string;
    fechaHora: string;
    telefono: string;
    tProductor: string;
    comprador: string;
    origen: string;
    precio: string;
    descuento: string;
    calibre: string;
    humedad: string;
    atiende?: string;
    impurezas: string;
    r1: string;
    r2: string;
    cafesLisos: string;
    manchados: string;
    quebMxc: string;
    helados: string;
    alimonados: string;
    revolcados: string;
    sumaR2: string;
    totalDanos: string;
    exportacion: string;
  };
  preliquidacion: {
    productor: string;
    tProductor: string;
    producto: string;
    camion: string;
    placas: string;
    chofer: string;
    rt: string;
    fecha: string;
    precio: string;
    descuento: string;
    kgLiquidar: string;
    pesoBruto: string;
    tara: string;
    pesoNeto: string;
    observaciones: string;
    atiende?: string;
  };
  pago: {
    nombre: string;
    banco_recoge: string;
    desc_federal: string;
    folio_fiscal_pago: string;
    a_pagar: string;
    folio_pago_productor: string;
  };
  facturacion: {
    importe: string;
    descPredial: string;
    pagoPredial: string;
    descISR: string;
    aPagar: string;
    diasHabilesPago: string;
  };
}

const props = defineProps<PantallaDetalleFacturacionProps>();
const $q = useQuasar();

const emitBack = () => props.onBack?.();

const pestanaActiva = ref<number>(0);
const entregaActual = computed(() => props.entregas[pestanaActiva.value]);

const expandidoTotalDanos = ref(false);
const expandidoSumaR2 = ref(false);
const expandidoInfoGeneral = ref(true);

const mostrarCesionDerechos = ref(false);

// RFC pendiente
const rfcPendiente = computed(() => props.rfc === 'Pendiente RFC');
const rfcRegistrado = ref(!rfcPendiente.value);

const datosProductorEditables = reactive({
  nombre: props.productor,
  telefono: '',
  rfc: rfcPendiente.value ? '' : props.rfc,
  correo: '',
  origen: '',
  municipio: '',
  atiende: '',
  contactoAdicionalNombre: '',
  contactoAdicionalCorreo: '',
  contactoAdicionalTelefono: ''
});

const rfcInputValue = computed({
  get() {
    return rfcPendiente.value ? datosProductorEditables.rfc : props.rfc;
  },
  set(v: string) {
    if (rfcPendiente.value) datosProductorEditables.rfc = (v || '').toUpperCase();
  }
});

// Persona moral/física
const esPersonaMoral = (rfcValue: string) => {
  if (!rfcValue || rfcValue === 'Pendiente RFC') return false;
  return rfcValue.length === 12;
};

const productoEsPersonaMoral = computed(() => esPersonaMoral(props.rfc));
const mostrarAtiendeEnBoleta = computed(() => {
  if (rfcPendiente.value) return esPersonaMoral(datosProductorEditables.rfc);
  return productoEsPersonaMoral.value;
});

// Datos editables para boleta / preliquidación cuando RFC pendiente
const datosBoletaEditables = reactive({ atiende: '' });
const datosPreliquidacionEditables = reactive({ atiende: '' });

// Estado expediente / XML
const productoresGuardados = ref(false);

const xmlFacturaSubido = ref(false);
const xmlGuardado = ref(false);
const nombreArchivoXml = ref('');
const xmlFile = ref<File | null>(null);

// Documentos (en TSX eran strings; aquí almacenamos nombre/filename para mantener paridad)
const archivoIdentificacion = ref<string>('');
const archivoConstancia = ref<string>('');
const archivoOpinion = ref<string>('');
const archivoOtro = ref<string>('');
const archivoActaConstitutiva = ref<string>('');

// Validaciones fechas docs
const fechaConstancia = ref<Date | null>(null);
const fechaOpinion = ref<Date | null>(null);
const errorConstancia = ref<string>('');
const errorOpinion = ref<string>('');

// Facturación editable
const datosFacturacionEditables = reactive({
  importe: '',
  pagoPredial: '',
  descPredial: '',
  descISR: '',
  aPagar: '',
  diasHabilesPago: ''
});

// Helpers monto
const parsearMonto = (valor: string): number => {
  if (!valor) return 0;
  return parseFloat(valor.replace(/[$,]/g, '')) || 0;
};

const formatearMonto = (valor: number): string => {
  const fixed = Number.isFinite(valor) ? valor : 0;
  return fixed.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Watch: calcular A PAGAR automático
watch(
  () => [datosFacturacionEditables.importe, datosFacturacionEditables.pagoPredial, datosFacturacionEditables.descPredial, datosFacturacionEditables.descISR],
  () => {
    const importe = parsearMonto(datosFacturacionEditables.importe);
    const pagoPredial = parsearMonto(datosFacturacionEditables.pagoPredial);
    const descPredial = parsearMonto(datosFacturacionEditables.descPredial);
    const descISR = parsearMonto(datosFacturacionEditables.descISR);

    const aPagarCalculado = importe - pagoPredial - descPredial - descISR;
    const aPagarFormateado = formatearMonto(aPagarCalculado);

    if (datosFacturacionEditables.aPagar !== aPagarFormateado) {
      datosFacturacionEditables.aPagar = aPagarFormateado;
    }
  },
  { immediate: true }
);

const notifyError = (message: string) => {
  $q.notify({ type: 'negative', message, position: 'top' });
};

const notifyOk = (message: string) => {
  $q.notify({ type: 'positive', message, position: 'top' });
};

// Guardar RFC
const handleGuardarRFC = () => {
  const rfcCapturado = (datosProductorEditables.rfc || '').trim().toUpperCase();

  if (rfcCapturado.length !== 12 && rfcCapturado.length !== 13) {
    notifyError(`RFC inválido: debe tener 12 (moral) o 13 (física). Capturado: ${rfcCapturado.length}`);
    return;
  }

  const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2,3}$/;
  if (!rfcRegex.test(rfcCapturado)) {
    notifyError('Formato de RFC inválido. Verifique que sea correcto.');
    return;
  }

  datosProductorEditables.rfc = rfcCapturado;
  rfcRegistrado.value = true;

  if (props.onUpdateRfc) {
    const tickets = props.entregas.map(e => e.ticket);
    props.onUpdateRfc(tickets, rfcCapturado);
  }

  const tipoPersona = rfcCapturado.length === 12 ? 'Persona Moral' : 'Persona Física';
  notifyOk(`RFC registrado: ${rfcCapturado} (${tipoPersona})`);
};

// Cargar XML (simulación igual al TSX)
const onXmlFileSelected = (file: File | null) => {
  if (!file) return;
  nombreArchivoXml.value = file.name;

  // Simulación extracción (igual TSX: sólo IMPORTE)
  datosFacturacionEditables.importe = '125,450.00';
  xmlFacturaSubido.value = true;

  notifyOk(`XML cargado: ${file.name}. IMPORTE extraído: $${datosFacturacionEditables.importe}`);
};

const handleGuardarXmlFactura = () => {
  if (!xmlFacturaSubido.value || !datosFacturacionEditables.importe) {
    notifyError('Debe cargar primero el XML de la factura.');
    return;
  }
  if (!productoresGuardados.value) {
    notifyError('Antes de guardar el XML, debe guardar los documentos del expediente.');
    return;
  }

  xmlGuardado.value = true;

  if (props.onUpdateDocumentosStatus) {
    const tickets = props.entregas.map(e => e.ticket);
    props.onUpdateDocumentosStatus(tickets, true, true);
  }

  notifyOk(`XML guardado: ${nombreArchivoXml.value || 'XML cargado'}. Expediente listo para solicitar pago.`);
};

// Totales validación (igual TSX)
const calcularTotalEsperado = (): number => {
  const totalKg = props.entregas.reduce((sum, e) => {
    const kg = parseFloat((e.preliquidacion.kgLiquidar || '').replace(/,/g, ''));
    return sum + (isNaN(kg) ? 0 : kg);
  }, 0);

  const precio = props.entregas.length > 0 ? parseFloat(props.entregas[0].preliquidacion.precio) : 0;
  return totalKg * (isNaN(precio) ? 0 : precio);
};

const calcularSumaFacturas = (): number => {
  let total = 0;
  if (datosFacturacionEditables.aPagar) {
    const val = parseFloat(datosFacturacionEditables.aPagar.replace(/,/g, '').replace('$', ''));
    if (!isNaN(val)) total += val;
  }
  // Nota: aquí sumarías productores agregados si ya migras esa sección (como en TSX)
  return total;
};

// Guardar documentos (PASO 1) – mantiene lógica base (en TSX también valida campos y docs)
const handleGuardarDocumentos = () => {
  const nombreVacio = !datosProductorEditables.nombre?.trim();
  const telefonoVacio = !datosProductorEditables.telefono?.trim();
  const correoVacio = !datosProductorEditables.correo?.trim();

  if (nombreVacio || telefonoVacio || correoVacio) {
    notifyError('Información incompleta del productor: nombre, teléfono y correo son requeridos.');
    return;
  }

  const personaMoral = props.rfc !== 'Pendiente RFC' ? (props.rfc.length === 12) : esPersonaMoral(datosProductorEditables.rfc);
  const faltantes: string[] = [];

  if (!archivoIdentificacion.value) faltantes.push('Identificación Oficial PDF');
  if (!archivoConstancia.value) faltantes.push('Constancia de Situación Fiscal PDF');
  if (!archivoOpinion.value) faltantes.push('Opinión de Cumplimiento PDF');
  if (personaMoral && !archivoActaConstitutiva.value) faltantes.push('Acta Constitutiva');

  if (faltantes.length) {
    notifyError(`Documentos faltantes: ${faltantes.join(', ')}`);
    return;
  }

  if (errorConstancia.value || errorOpinion.value) {
    notifyError('No se puede guardar con documentos vencidos (> 30 días).');
    return;
  }

  productoresGuardados.value = true;

  if (props.onUpdateDocumentosStatus) {
    const tickets = props.entregas.map(e => e.ticket);
    props.onUpdateDocumentosStatus(tickets, true, false);
  }

  notifyOk('Documentos guardados. Status: pendiente factura XML.');
};

// Guardar productores (validación total) – mantiene núcleo del TSX
const handleGuardarProductores = () => {
  if (rfcPendiente.value && !rfcRegistrado.value) {
    notifyError('Debe capturar y guardar el RFC antes de continuar.');
    return;
  }

  const nombreVacio = !datosProductorEditables.nombre?.trim();
  const telefonoVacio = !datosProductorEditables.telefono?.trim();
  const correoVacio = !datosProductorEditables.correo?.trim();
  if (nombreVacio || telefonoVacio || correoVacio) {
    notifyError('Información incompleta del productor: nombre, teléfono y correo son requeridos.');
    return;
  }

  const totalEsperado = calcularTotalEsperado();
  const sumaFacturas = calcularSumaFacturas();
  const diferencia = Math.abs(totalEsperado - sumaFacturas);

  if (diferencia > 1) {
    notifyError(`Validación: suma de facturas no coincide con total esperado. Diferencia: $${formatearMonto(diferencia)}`);
    return;
  }

  productoresGuardados.value = true;

  if (props.onUpdateDocumentosStatus) {
    const tickets = props.entregas.map(e => e.ticket);
    const tieneFacturaXML = !!datosFacturacionEditables.importe;
    props.onUpdateDocumentosStatus(tickets, true, tieneFacturaXML);
  }

  notifyOk('Productores guardados. Campos bloqueados.');
};

// Endoso
const onGuardarCesionDerechos = (datos: unknown) => {
  // Igual que TSX: aquí guardas/actualizas estado si aplica.
  // console.log('Cesión guardada', datos);
  notifyOk('Cesión de derechos guardada.');
};
</script>

<style scoped>
.font-mono :deep(input) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
