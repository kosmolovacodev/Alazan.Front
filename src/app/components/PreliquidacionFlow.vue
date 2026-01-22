<template>
  <div class="q-pa-md">

    <!-- =========================
         VISTA: BOLETA (FINAL)
         ========================= -->
    <template v-if="showBoleta && selectedRegistro">
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-btn flat round icon="arrow_back" @click="handleBackFromBoleta" />
          <div>
            <div class="text-h6">Boleta - Recepción de Granos</div>
            <div class="text-caption text-grey-7">✓ Precio Aceptado - Boleta Finalizada</div>
          </div>
        </div>

        <div class="row items-center q-gutter-sm">
          <q-badge color="purple-2" text-color="purple-10" class="q-pa-sm">
            Ticket: {{ selectedRegistro.ticket }}
          </q-badge>
          <q-btn flat round icon="print" @click="printDoc" />
          <q-btn flat round icon="download" @click="notifyInfo('Descargando boleta en PDF...')" />
        </div>
      </div>

      <div class="row justify-center">
        <q-card bordered class="doc-card">
          <q-card-section class="bg-green-7 text-white text-center">
            <div class="text-h5">BOLETA</div>
            <div class="text-caption">Precio aceptado por productor</div>
          </q-card-section>

          <q-card-section>
            <div class="row justify-end q-mb-md">
              <div class="col-12 col-md-4">
                <q-input dense outlined label="FOLIO / BOLETA" :model-value="selectedRegistro.boleta" disable />
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <q-input dense outlined label="PRODUCTOR" :model-value="selectedRegistro.productor" disable />
              </div>
              <div class="col-12 col-md-6">
                <q-input dense outlined label="FECHA Y HORA" :model-value="`${selectedRegistro.fecha} 14:30`" disable />
              </div>

              <div class="col-12 col-md-6">
                <q-input dense outlined label="TELÉFONO" :model-value="selectedRegistro.telefono" disable />
              </div>
              <div class="col-12 col-md-6">
                <q-input dense outlined label="T. PRODUCTOR" :model-value="selectedRegistro.tProductor" disable />
              </div>

              <div class="col-12 col-md-6">
                <q-input dense outlined label="COMPRADOR" :model-value="selectedRegistro.comprador" disable />
              </div>
              <div class="col-12 col-md-6">
                <q-input dense outlined label="ORIGEN" :model-value="selectedRegistro.origen" disable />
              </div>

              <div class="col-12 col-md-6">
                <q-input dense outlined label="PRECIO" :model-value="`$12.50`" disable />
              </div>
              <div class="col-12 col-md-6">
                <q-input dense outlined label="DESCUENTO (KG/TON)" :model-value="`35.00 kg/ton`" disable />
              </div>

              <div class="col-12 col-md-6">
                <q-input dense outlined label="CALIBRE" :model-value="`44-46`" disable />
              </div>
              <div class="col-12 col-md-6">
                <q-input dense outlined label="HUMEDAD" :model-value="`12.5%`" disable />
              </div>
            </div>

            <!-- Resultados de análisis (expandibles) -->
            <q-card flat bordered class="bg-grey-1 q-mb-md">
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">Resultados de Análisis</div>

                <q-expansion-item
                  v-model="expandidoTotalDanos"
                  dense
                  icon="assessment"
                  label="TOTAL DE DAÑOS"
                  header-class="bg-white"
                >
                  <q-card flat>
                    <q-card-section class="q-gutter-sm">
                      <div class="row justify-between">
                        <div class="text-body2">Impurezas</div>
                        <div class="text-body2">3.5%</div>
                      </div>

                      <div class="row justify-between bg-white q-pa-sm rounded-borders">
                        <div class="text-body2">R1</div>
                        <div class="text-body2">1.4%</div>
                      </div>

                      <q-expansion-item
                        v-model="expandidoSumaR2"
                        dense
                        icon="chevron_right"
                        label="Suma de R2"
                        header-class="bg-white"
                      >
                        <q-card flat class="bg-grey-2">
                          <q-card-section class="q-gutter-xs">
                            <row-kv label="R2" value="0.9%" />
                            <row-kv label="Cafes y Lisos" value="2.1%" />
                            <row-kv label="Manchados" value="1.9%" />
                            <row-kv label="Queb/Mxc/Mitd/Cam" value="2.3%" />
                            <row-kv label="Helados" value="0.8%" />
                            <row-kv label="Alimonados" value="0.5%" />
                            <row-kv label="Revolcados" value="0.2%" />
                          </q-card-section>
                        </q-card>
                      </q-expansion-item>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>

                <div class="row items-center justify-between bg-white q-pa-md rounded-borders q-mt-sm">
                  <div class="text-body2 text-weight-medium">EXPORTACIÓN</div>
                  <div class="text-body2 text-weight-medium">87.3%</div>
                </div>
              </q-card-section>
            </q-card>

            <div class="row q-col-gutter-md q-pt-md" style="border-top: 1px solid #e5e7eb;">
              <div class="col-12 col-md-4 text-center">
                <div class="q-mt-xl" style="border-top: 1px solid #9ca3af; padding-top: 8px;">
                  <div class="text-caption text-weight-medium">ANALISTA</div>
                </div>
              </div>
              <div class="col-12 col-md-4 text-center">
                <div class="q-mt-xl" style="border-top: 1px solid #9ca3af; padding-top: 8px;">
                  <div class="text-caption text-weight-medium">RECEPCIONISTA</div>
                </div>
              </div>
              <div class="col-12 col-md-4 text-center">
                <div class="q-mt-xl" style="border-top: 1px solid #9ca3af; padding-top: 8px;">
                  <div class="text-caption text-weight-medium">AUTORIZÓ</div>
                </div>
              </div>
            </div>

          </q-card-section>
        </q-card>
      </div>
    </template>

    <!-- =========================
         VISTA: PRELIQUIDACIÓN (IMPRIMIBLE)
         ========================= -->
    <template v-else-if="showPreliquidacion && selectedRegistro">
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-btn flat round icon="arrow_back" @click="handleBackFromPreliquidacion" />
          <div>
            <div class="text-h6">Báscula Recepción</div>
            <div class="text-caption text-grey-7">Pre-Liquidación</div>
          </div>
        </div>

        <div class="row items-center q-gutter-sm">
          <q-btn flat round icon="print" @click="printDoc" />
          <q-btn flat round icon="download" @click="notifyInfo('Descargando...')" />
        </div>
      </div>

      <div class="row justify-center">
        <q-card bordered class="doc-card">
          <q-card-section class="bg-orange-6 text-white text-center">
            <div class="text-h5">Pre-Liquidación</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-xl q-mb-md">
              <div class="col-12 col-md-6 q-gutter-sm">
                <q-input dense outlined label="PRODUCTOR" :model-value="selectedRegistro.productor" disable />
                <q-input dense outlined label="T. PRODUCTOR" :model-value="selectedRegistro.tProductor" disable />
                <q-input dense outlined label="PRODUCTO" :model-value="'Garbanzo'" disable />
                <q-input dense outlined label="CAMIÓN" :model-value="selectedRegistro.chofer" disable />
                <q-input dense outlined label="PLACAS" :model-value="selectedRegistro.placas" disable />
                <q-input dense outlined label="CHOFER" :model-value="selectedRegistro.chofer" disable />
                <q-input dense outlined label="R/T" :model-value="rt" disable />
              </div>

              <div class="col-12 col-md-6 q-gutter-sm">
                <q-input dense outlined label="FECHA" :model-value="selectedRegistro.fecha" disable />
                <q-input dense outlined label="PRECIO" :model-value="precio" disable />
                <q-input dense outlined label="DESCUENTO" :model-value="descuento" disable />
                <q-input dense outlined label="KG LIQUIDAR" :model-value="kgALiquidar" disable />
                <q-input dense outlined label="PESO BRUTO" :model-value="selectedRegistro.pesoBruto" disable />
                <q-input dense outlined label="TARA" :model-value="pesoTara" disable />
                <q-input dense outlined label="PESO NETO" :model-value="pesoNeto" disable />
              </div>
            </div>

            <q-input
              dense
              outlined
              type="textarea"
              label="OBSERVACIONES"
              :model-value="observaciones"
              disable
              autogrow
              class="q-mb-md"
            />

            <div class="text-center text-subtitle2 q-mb-sm">Documentación requerida para alta</div>
            <ol class="q-pl-lg q-mb-md text-body2">
              <li>1. Identificación oficial (INE)</li>
              <li>2. Constancia de situación fiscal (vigencia &lt;= 30 días)</li>
              <li>3. Opinión de cumplimiento 32D (positivo, vigencia &lt;= 30 días)</li>
              <li>4. Carátula bancaria (vigencia &lt;= 30 días)</li>
              <li>5. Correo electrónico para envío de liquidación</li>
              <li>6. Nombre y teléfono del contador</li>
              <li>7. Nombre y teléfono del productor</li>
            </ol>

            <div class="text-center q-mb-md">
              <div class="text-body2">Favor de enviar la documentación completa al correo</div>
              <div class="text-body2 text-weight-medium">RECEPCIONMINA@ALAZAN.COM.MX</div>
            </div>

            <div class="row items-center justify-center q-gutter-sm q-mb-lg">
              <q-icon name="chat" color="green-7" size="24px" />
              <div class="text-body2">Dudas Whatsapp 673-163-75-73</div>
            </div>

            <div class="row justify-center">
              <q-btn color="orange-6" label="Guardar" @click="handleGuardarPreliquidacion" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <!-- =========================
         VISTA: DETALLE
         ========================= -->
    <template v-else-if="showDetail && selectedRegistro">
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-btn flat round icon="arrow_back" @click="handleBack" />
          <div class="text-h6">Báscula - Recepción de Granos</div>
        </div>

        <div class="row items-center q-gutter-sm">
          <q-btn color="orange-6" label="BOLETA" @click="handleVerBoleta" />
          <q-btn
            v-if="preliquidacionGuardada"
            color="orange-6"
            label="PRE-LIQUIDACIÓN"
            @click="handleVerPreliquidacion"
          />
        </div>
      </div>

      <!-- Info -->
      <q-card bordered class="q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input dense outlined label="No. Ticket" :model-value="selectedRegistro.ticket" disable />
            </div>
            <div class="col-12 col-md-6">
              <q-input dense outlined label="Productor" :model-value="selectedRegistro.productor" disable />
            </div>

            <div class="col-12 col-md-6">
              <q-input dense outlined label="Fecha y Hora" :model-value="selectedRegistro.fecha" disable />
            </div>
            <div class="col-12 col-md-6">
              <q-input dense outlined label="T. Productor" :model-value="selectedRegistro.tProductor" disable />
            </div>

            <div class="col-12 col-md-6">
              <q-input dense outlined label="Teléfono" :model-value="selectedRegistro.telefono" disable />
            </div>
            <div class="col-12 col-md-6">
              <q-input dense outlined label="Origen" :model-value="selectedRegistro.origen" disable />
            </div>

            <div class="col-12 col-md-6">
              <q-input dense outlined label="Chofer" :model-value="selectedRegistro.chofer" disable />
            </div>
            <div class="col-12 col-md-6">
              <q-input dense outlined label="Placas" :model-value="selectedRegistro.placas" disable />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Peso Bruto -->
      <q-card bordered class="q-mb-md">
        <q-card-section>
          <div class="row items-center q-gutter-md">
            <div class="text-body2" style="min-width: 120px;">Peso Bruto</div>
            <q-input dense outlined style="width: 240px;" :model-value="selectedRegistro.pesoBruto" disable />
          </div>
        </q-card-section>
      </q-card>

      <!-- Tara -->
      <q-card bordered class="q-mb-md">
        <q-card-section class="q-gutter-sm">
          <div class="row items-center q-gutter-sm text-caption">
            <div :class="basculaConectada ? 'dot-green' : 'dot-red'"></div>
            <div :class="basculaConectada ? 'text-green-7' : 'text-red-7'">
              {{ basculaConectada ? 'Báscula Conectada' : 'Báscula Desconectada' }}
            </div>

            <q-btn
              v-if="!basculaConectada"
              dense
              color="blue-7"
              label="Reconectar"
              @click="reconectarBasculaTara"
            />
          </div>

          <div class="row items-center q-gutter-md">
            <div class="text-body2" style="min-width: 120px;">Peso Tara (kg)</div>

            <q-input
              dense
              outlined
              style="width: 240px;"
              v-model="pesoTara"
              :disable="((!modoManual && basculaConectada) || preliquidacionGuardada)"
              placeholder="Peso en kilogramos"
              @update:model-value="handlePesoTaraChange"
            />

            <div class="col">
              <div class="row justify-end q-gutter-sm" v-if="!preliquidacionGuardada">
                <q-btn
                  color="grey-6"
                  label="Captura Manual"
                  :disable="modoManual"
                  @click="activarModoManualTara"
                />
                <q-btn
                  color="orange-6"
                  label="Leer Báscula"
                  :disable="!basculaConectada"
                  @click="leerBasculaTara"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Neto -->
      <q-card bordered class="q-mb-md">
        <q-card-section>
          <div class="row items-center q-gutter-md">
            <div class="text-body2" style="min-width: 120px;">Peso Neto</div>
            <q-input dense outlined style="width: 240px;" :model-value="pesoNeto" disable />
          </div>
        </q-card-section>
      </q-card>

      <!-- Liquidación -->
      <q-card bordered class="q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-3">
              <q-input dense outlined label="Impurezas (%) 🔒" :model-value="impurezas" disable />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input dense outlined label="Descuento (Kg)" :model-value="descuento" disable />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input dense outlined label="Kg a Liquidar" :model-value="kgALiquidar" disable />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input dense outlined label="Precio 🔒" :model-value="precio" disable />
            </div>
            <div class="col-12 col-md-6">
              <q-input dense outlined label="A Liquidar" :model-value="aLiquidar" disable />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                dense
                outlined
                label="R/T (Riego/Temporal)"
                v-model="rt"
                :disable="preliquidacionGuardada"
                :options="rtOptions"
                emit-value
                map-options
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Documentación (solo si preliquidación ya guardada) -->
      <q-card v-if="preliquidacionGuardada" bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Documentación</div>

          <div v-if="uploadedPhotos.length" class="row q-col-gutter-md q-mb-md">
            <div v-for="(photo, idx) in uploadedPhotos" :key="idx" class="col-12 col-md-6">
              <q-card bordered>
                <q-img :src="photo" ratio="16/9" />
                <q-card-actions align="right">
                  <q-btn color="red-6" flat label="Eliminar" @click="removeUploaded(idx)" />
                </q-card-actions>
              </q-card>
            </div>
          </div>

          <q-card flat bordered class="bg-grey-1">
            <q-card-section class="text-center">
              <q-icon name="upload" size="42px" class="text-grey-6 q-mb-sm" />
              <div class="text-body1">Arrastra la documentación aquí</div>
              <div class="text-caption text-grey-7 q-mb-md">
                Arrastra y suelta las fotos/documentos o usa los botones de abajo. Puedes agregar múltiples fotos.
              </div>

              <div class="row justify-center q-gutter-sm">
                <q-btn color="deep-purple-10" icon="photo_camera" label="Tomar Foto" @click="handleTakePhoto" />
                <q-btn color="deep-purple-10" icon="attach_file" label="Seleccionar archivo" @click="handleFileSelect" />
              </div>
            </q-card-section>
          </q-card>

          <div class="row justify-center q-mt-md">
            <q-btn
              color="orange-6"
              label="Guardar"
              :disable="uploadedPhotos.length === 0"
              @click="handleGuardarDocumentacion"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Acciones -->
      <div class="row justify-center">
        <q-btn
          v-if="!preliquidacionGuardada"
          color="orange-6"
          label="Generar Pre-Liquidación"
          @click="handleGenerarPreliquidacion"
        />
      </div>
    </template>

    <!-- =========================
         VISTA: HISTORIAL
         ========================= -->
    <template v-else>
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-btn flat round icon="arrow_back" @click="onBackSafe" />
        <div class="text-h6">Pre-Liquidación</div>
      </div>

      <div class="text-subtitle1 text-grey-7 q-mb-md">Historial</div>

      <!-- KPIs -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <kpi-card title="Total del Día" :value="String(registros.length)" tone="blue" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <kpi-card title="Con Pre-liquidación" :value="String(registrosConPre.length)" tone="green" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <kpi-card title="Sin Pre-liquidación" :value="String(registrosSinPre.length)" tone="yellow" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <kpi-card title="Total Toneladas" :value="totalToneladas" tone="purple" />
        </div>
      </div>

      <!-- Filtros (mock visual igual al TSX; sin lógica de filtrado) -->
      <q-card bordered class="q-mb-md">
        <q-card-section>
          <div class="text-center text-subtitle2 q-mb-md">Filtros</div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-2">
              <q-input dense outlined placeholder="Captura Ticket" />
            </div>
            <div class="col-12 col-md-2">
              <q-input dense outlined placeholder="Captura Boleta" />
            </div>
            <div class="col-12 col-md-2">
              <q-input dense outlined placeholder="Captura Origen" />
            </div>
            <div class="col-12 col-md-3">
              <q-input dense outlined placeholder="Captura Productor" />
            </div>
            <div class="col-12 col-md-3">
              <q-input dense outlined placeholder="Captura Comprador" />
            </div>
          </div>

          <div class="row items-center q-col-gutter-md">
            <div class="col-12 col-md-2">
              <q-checkbox v-model="filtroHoy" label="Hoy" />
            </div>

            <div class="col-12 col-md-6 row items-center q-gutter-sm">
              <div class="text-body2">Fecha:</div>
              <q-input dense outlined type="date" style="max-width: 200px;" />
              <div class="text-body2">:</div>
              <q-input dense outlined type="date" style="max-width: 200px;" />
            </div>

            <div class="col-12 col-md-4 row justify-end">
              <q-btn flat round icon="table_view" color="green-7" @click="notifyInfo('Exportar a Excel (pendiente)')" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla -->
      <q-card bordered>
        <q-table
          :rows="registros"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :rows-per-page-options="[10, 25, 50, 0]"
          no-data-label="No hay boletas pendientes de preliquidación"
        >
          <template #body-cell-actions="p">
            <q-td :props="p">
              <q-btn flat round icon="visibility" @click="handleVerDetalle(p.row)" />
            </q-td>
          </template>

          <template #no-data>
            <div class="q-pa-lg text-center text-grey-7">
              <div class="text-body1">No hay boletas pendientes de preliquidación</div>
              <div class="text-caption">Las boletas con silo asignado aparecerán aquí</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref, watch } from 'vue';
import { useQuasar } from 'quasar';

interface PreliquidacionFlowProps {
  onBack?: () => void;
  initialRegistro?: RegistroData | null;
  boletasConSilo?: Array<{
    noBoleta: string;
    siloAsignado: string;
    tipoSilo: 'normal' | 'pulmon';
    fechaAsignacion: string;
  }>;
  boletasPrecios?: any[];
  onUpdatePesoNeto?: (ticket: string, pesoNeto: string) => void | Promise<void>;
  registrosBascula?: any[];
}

interface RegistroData {
  id: number;
  ticket: string;
  boleta: string;
  fecha: string;
  origen: string;
  productor: string;
  tProductor: string;
  comprador: string;
  pesoNeto: string;
  pesoBruto: string;
  telefono: string;
  chofer: string;
  placas: string;
}

const props = withDefaults(defineProps<PreliquidacionFlowProps>(), {
  onBack: () => {},
  initialRegistro: null,
  boletasConSilo: () => [],
  boletasPrecios: () => [],
  onUpdatePesoNeto: async () => {},
  registrosBascula: () => []
});

const $q = useQuasar();

/* -----------------------------
   Estado de navegación (vistas)
----------------------------- */
const showDetail = ref<boolean>(!!props.initialRegistro);
const selectedRegistro = ref<RegistroData | null>(props.initialRegistro ?? null);
const showPreliquidacion = ref(false);
const showBoleta = ref(false);

/* -----------------------------
   Estado negocio (igual TSX)
----------------------------- */
const preliquidacionGuardada = ref(false);
const pesoTara = ref('');
const pesoNeto = ref('');
const impurezas = ref('');
const descuento = ref('');
const kgALiquidar = ref('');
const precio = ref('');
const aLiquidar = ref('');
const comprador = ref('');
const rt = ref('');
const observaciones = ref('En caso de que sea Pequeña Propiedad, el pago a liquidar es de $...');
const uploadedPhotos = ref<string[]>([]);
const isUploadingFile = ref(false);

// Báscula Tara
const basculaConectada = ref(true);
const modoManual = ref(false);

// Expandibles boleta
const expandidoTotalDanos = ref(false);
const expandidoSumaR2 = ref(false);

const rtOptions = [
  { label: 'Riego', value: 'Riego' },
  { label: 'Temporal', value: 'Temporal' }
];

const filtroHoy = ref(false);

/* -----------------------------
   Derivaciones de registros (igual TSX)
----------------------------- */
const boletasConSiloAsignado = computed(() => {
  return (props.boletasPrecios || []).filter((boleta: any) =>
    (props.boletasConSilo || []).some(bc => bc.noBoleta === boleta.noBoleta)
  );
});

const registros = computed<RegistroData[]>(() => {
  return boletasConSiloAsignado.value.map((boleta: any, index: number) => {
    const registroBascula = (props.registrosBascula || []).find((r: any) => r.ticket === boleta.ticket);
    const pesoNetoReal = registroBascula?.pesoNeto || '-';

    return {
      id: index + 1,
      ticket: boleta.ticket || '',
      boleta: boleta.noBoleta || '',
      fecha: boleta.fecha ? String(boleta.fecha).split(' ')[0] : '',
      origen: boleta.origen || '',
      productor: boleta.productor || '',
      tProductor: boleta.tProductor || '',
      comprador: boleta.comprador || '',
      pesoNeto: pesoNetoReal,
      pesoBruto: boleta.pesoBruto ? String(boleta.pesoBruto) : '',
      telefono: boleta.telefono || '',
      chofer: boleta.chofer || '',
      placas: boleta.placas || ''
    };
  });
});

const registrosConPre = computed(() => registros.value.filter(r => r.pesoNeto !== '-'));
const registrosSinPre = computed(() => registros.value.filter(r => r.pesoNeto === '-'));

const totalToneladas = computed(() => {
  const t = registros.value.reduce((sum, r) => {
    const peso = parseFloat(String(r.pesoBruto).replace(/,/g, ''));
    return sum + (isNaN(peso) ? 0 : peso / 1000);
  }, 0);
  return t.toFixed(2);
});

/* -----------------------------
   Tabla
----------------------------- */
const columns = [
  { name: 'id', label: '', field: 'id', align: 'left' as const },
  { name: 'ticket', label: 'No. Ticket', field: 'ticket', align: 'left' as const },
  { name: 'boleta', label: 'No. Boleta', field: 'boleta', align: 'left' as const },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' as const },
  { name: 'origen', label: 'Origen (Municipio)', field: 'origen', align: 'left' as const },
  { name: 'productor', label: 'Productor', field: 'productor', align: 'left' as const },
  { name: 'comprador', label: 'Comprador', field: 'comprador', align: 'left' as const },
  { name: 'pesoNeto', label: 'Peso Neto', field: 'pesoNeto', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const }
];

/* -----------------------------
   Helpers UI
----------------------------- */
function notifyInfo(message: string) {
  $q.notify({ type: 'info', message, position: 'top' });
}
function notifyOk(message: string) {
  $q.notify({ type: 'positive', message, position: 'top' });
}
function notifyWarn(message: string) {
  $q.notify({ type: 'warning', message, position: 'top' });
}
function notifyErr(message: string) {
  $q.notify({ type: 'negative', message, position: 'top' });
}

function printDoc() {
  window.print();
}

/* -----------------------------
   Lógica de cálculo (igual TSX)
----------------------------- */
function calcularPesoNeto(bruto: string, tara: string) {
  if (bruto && tara) {
    const brutoParsed = parseFloat(bruto.replace(/,/g, ''));
    const taraParsed = parseFloat(tara.replace(/,/g, ''));
    if (!isNaN(brutoParsed) && !isNaN(taraParsed)) {
      const neto = brutoParsed - taraParsed;
      pesoNeto.value = neto.toLocaleString('en-US');
      calcularDescuento(neto.toString(), impurezas.value);
      return;
    }
  }
  pesoNeto.value = '';
  descuento.value = '';
  kgALiquidar.value = '';
  aLiquidar.value = '';
}

function calcularDescuento(neto: string, impurezasPorcentaje: string) {
  if (neto && impurezasPorcentaje) {
    const netoParsed = parseFloat(neto.replace(/,/g, ''));
    const impParsed = parseFloat(impurezasPorcentaje.replace(/,/g, ''));
    if (!isNaN(netoParsed) && !isNaN(impParsed)) {
      const desc = impParsed * 10; // kg/ton
      descuento.value = desc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      calcularKgALiquidar(neto, desc.toString());
      return;
    }
  }
  descuento.value = '';
  calcularKgALiquidar(neto, '');
}

function calcularKgALiquidar(neto: string, descPorTonelada: string) {
  if (neto && descPorTonelada) {
    const netoParsed = parseFloat(neto.replace(/,/g, ''));
    const descParsed = parseFloat(descPorTonelada.replace(/,/g, ''));
    if (!isNaN(netoParsed) && !isNaN(descParsed)) {
      const descuentoTotal = descParsed * (netoParsed / 1000);
      const kgLiquidar = netoParsed - descuentoTotal;
      kgALiquidar.value = kgLiquidar.toLocaleString('en-US');
      calcularALiquidar(kgLiquidar.toString(), precio.value);
      return;
    }
  } else if (neto && !descPorTonelada) {
    kgALiquidar.value = neto;
    calcularALiquidar(neto, precio.value);
    return;
  }
  kgALiquidar.value = '';
  aLiquidar.value = '';
}

function calcularALiquidar(kgLiq: string, prec: string) {
  if (kgLiq && prec) {
    const kgParsed = parseFloat(kgLiq.replace(/,/g, ''));
    const precioParsed = parseFloat(prec.replace(/,/g, ''));
    if (!isNaN(kgParsed) && !isNaN(precioParsed)) {
      const total = kgParsed * precioParsed;
      aLiquidar.value = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return;
    }
  }
  aLiquidar.value = '';
}

/* -----------------------------
   Acciones (igual TSX)
----------------------------- */
function onBackSafe() {
  props.onBack?.();
}

function handleVerDetalle(registro: RegistroData) {
  selectedRegistro.value = registro;

  const boletaCorrespondiente = (props.boletasPrecios || []).find((b: any) => b.noBoleta === registro.boleta);
  const yaGenerado = registro.pesoNeto !== '-';
  preliquidacionGuardada.value = yaGenerado;

  // Impurezas y Precio (solo lectura, desde boletasPrecios)
  const impDeAnalisis = boletaCorrespondiente?.impurezas?.toString() || '';
  impurezas.value = impDeAnalisis;

  const precioAutorizado = boletaCorrespondiente?.precioSugerido?.toString() || '';
  precio.value = precioAutorizado;

  if (yaGenerado) {
    const pesoNetoReal = registro.pesoNeto || '';
    pesoNeto.value = pesoNetoReal;

    const impNum = parseFloat(impDeAnalisis || '0');
    const descCalc = impNum * 10;
    descuento.value = descCalc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const pesoNetoNum = parseFloat(pesoNetoReal.replace(/,/g, '') || '0');
    const toneladas = pesoNetoNum / 1000;
    const descTotal = descCalc * toneladas;
    const kgLiq = pesoNetoNum - descTotal;
    kgALiquidar.value = kgLiq.toLocaleString('en-US');

    const precioNum = parseFloat(precioAutorizado || '0');
    const aLiq = kgLiq * precioNum;
    aLiquidar.value = aLiq.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    pesoTara.value = '';
    comprador.value = registro.comprador || '';
    rt.value = '';
  } else {
    pesoTara.value = '';
    pesoNeto.value = '';
    descuento.value = '';
    kgALiquidar.value = '';
    aLiquidar.value = '';
    comprador.value = '';
    rt.value = '';
  }

  observaciones.value =
    registro.tProductor === 'Ejidal'
      ? 'En caso de que sea Pequeña Propiedad, el pago a liquidar es de $...'
      : 'En caso de que sea Ejidal, el pago a liquidar es de $...';

  showDetail.value = true;
}

function handleBack() {
  showDetail.value = false;
  selectedRegistro.value = null;
  preliquidacionGuardada.value = false;
  showPreliquidacion.value = false;
  showBoleta.value = false;
}

function handleGenerarPreliquidacion() {
  if (!pesoNeto.value.trim()) {
    notifyErr('❌ Error: Debe capturar el Peso Neto antes de generar la Pre-liquidación.');
    return;
  }
  if (!precio.value.trim()) {
    notifyErr('❌ Error: El ticket no tiene un Precio autorizado. Debe completar la Boleta de Precio primero.');
    return;
  }
  if (!impurezas.value.trim()) {
    notifyErr('❌ Error: El ticket no tiene Impurezas capturadas. Debe completar la Boleta de Análisis primero.');
    return;
  }
  showPreliquidacion.value = true;
}

function handleGuardarPreliquidacion() {
  if (!pesoNeto.value.trim()) return notifyErr('❌ Error: Debe capturar el Peso Neto antes de guardar.');
  if (!descuento.value.trim()) return notifyErr('❌ Error: El Descuento no se ha calculado.');
  if (!kgALiquidar.value.trim()) return notifyErr('❌ Error: Los Kilogramos a Liquidar no se han calculado.');
  if (!precio.value.trim()) return notifyErr('❌ Error: El Precio no está disponible.');
  if (!aLiquidar.value.trim()) return notifyErr('❌ Error: El monto A Liquidar no se ha calculado.');

  preliquidacionGuardada.value = true;
  showPreliquidacion.value = false;

  if (selectedRegistro.value && props.onUpdatePesoNeto) {
    void props.onUpdatePesoNeto(selectedRegistro.value.ticket, pesoNeto.value);
  }
  notifyOk('✅ Pre-liquidación guardada exitosamente.');
}

function handleBackFromPreliquidacion() {
  showPreliquidacion.value = false;
}

function handleVerPreliquidacion() {
  showPreliquidacion.value = true;
}

function handleVerBoleta() {
  showBoleta.value = true;
}

function handleBackFromBoleta() {
  showBoleta.value = false;
}

/* -----------------------------
   Tara / Báscula (simulado)
----------------------------- */
function handlePesoTaraChange(v: string) {
  // v ya viene en pesoTara por v-model; mantenemos la firma
  pesoTara.value = v;
  if (selectedRegistro.value) {
    calcularPesoNeto(selectedRegistro.value.pesoBruto, v);
  }
}

function activarModoManualTara() {
  modoManual.value = true;
  pesoTara.value = '';
}

function leerBasculaTara() {
  const ok = Math.random() > 0.1; // 90% éxito
  if (ok) {
    const pesoSim = (Math.random() * 7000 + 8000).toFixed(2);
    pesoTara.value = pesoSim;
    if (selectedRegistro.value) calcularPesoNeto(selectedRegistro.value.pesoBruto, pesoSim);
  } else {
    basculaConectada.value = false;
    modoManual.value = true;
    notifyWarn('⚠️ Conexión con báscula perdida. Se activó modo manual.');
  }
}

function reconectarBasculaTara() {
  const ok = Math.random() > 0.3; // 70% éxito
  if (ok) {
    basculaConectada.value = true;
    modoManual.value = false;
    notifyOk('✅ Báscula reconectada correctamente');
  } else {
    notifyErr('❌ No se pudo reconectar con la báscula. Intente nuevamente.');
  }
}

/* -----------------------------
   Fotos / Archivos (simulado)
----------------------------- */
function handleFileSelect() {
  const fotoNum = uploadedPhotos.value.length + 1;
  const nuevoArchivo =
    `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZjJmZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMwMDY2Y2MiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRvY3VtZW50byAjJHtmb3RvTnVtfTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjU1JSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjZhYWRkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4oU2ltdWxhZG8pPC90ZXh0Pjwvc3ZnPg==`;
  uploadedPhotos.value = [...uploadedPhotos.value, nuevoArchivo];
}

function handleTakePhoto() {
  const fotoNum = uploadedPhotos.value.length + 1;
  const nuevaFoto =
    `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZvdG8gZGUgRG9jdW1lbnRvICMke2ZvdG9OdW19PC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPihTaW11bGFkYSk8L3RleHQ+PC9zdmc+`;
  uploadedPhotos.value = [...uploadedPhotos.value, nuevaFoto];
}

function removeUploaded(idx: number) {
  uploadedPhotos.value = uploadedPhotos.value.filter((_, i) => i !== idx);
}

async function handleGuardarDocumentacion() {
  if (uploadedPhotos.value.length === 0) {
    notifyWarn('⚠️ Por favor, toma al menos una foto o selecciona un archivo antes de guardar.');
    return;
  }
  if (!selectedRegistro.value) return;

  await props.onUpdatePesoNeto?.(selectedRegistro.value.ticket, pesoNeto.value);

  notifyOk('✅ Documentación guardada correctamente. Peso neto actualizado en la tabla de báscula.');
  handleBack();
}

/* -----------------------------
   Reactividad: si cambia initialRegistro
----------------------------- */
watch(
  () => props.initialRegistro,
  (v) => {
    if (v) {
      selectedRegistro.value = v;
      showDetail.value = true;
    }
  }
);

/* -----------------------------
   Mini componentes locales (para evitar archivos extra)
----------------------------- */
const KpiCard = defineComponent({
  name: 'kpi-card',
  props: {
    title: { type: String, required: true },
    value: { type: String, required: true },
    tone: { type: String as () => 'blue' | 'green' | 'yellow' | 'purple', required: true }
  },
  setup(p) {
    const bg = computed(() => {
      if (p.tone === 'blue') return 'bg-blue-1';
      if (p.tone === 'green') return 'bg-green-1';
      if (p.tone === 'yellow') return 'bg-yellow-1';
      return 'bg-purple-1';
    });
    const tx = computed(() => {
      if (p.tone === 'blue') return 'text-blue-10';
      if (p.tone === 'green') return 'text-green-10';
      if (p.tone === 'yellow') return 'text-yellow-10';
      return 'text-purple-10';
    });

    return () =>
      h(
        'div',
        {},
        h(
          'div',
          { class: `q-pa-md rounded-borders bordered ${bg.value}`, style: 'border: 1px solid #cbd5e1;' },
          [
            h('div', { class: 'text-caption text-grey-7' }, p.title),
            h('div', { class: `text-h5 ${tx.value}` }, p.value)
          ]
        )
      );
  }
});

const RowKv = defineComponent({
  name: 'row-kv',
  props: { label: { type: String, required: true }, value: { type: String, required: true } },
  setup(p) {
    return () =>
      h('div', { class: 'row items-center justify-between q-py-xs' }, [
        h('div', { class: 'text-body2' }, p.label),
        h('div', { class: 'text-body2' }, p.value)
      ]);
  }
});

// Exponer en template
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const kpiCard = KpiCard;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const rowKv = RowKv;
</script>

<style scoped>
.doc-card {
  width: 100%;
  max-width: 920px;
}
.dot-green,
.dot-red {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}
.dot-green { background: #22c55e; }
.dot-red { background: #ef4444; }
</style>
