<template>
  <q-page class="q-pa-md">

    <!-- =========================
         VIEW: LIST
    ========================== -->
    <div v-if="currentView === 'list'">
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-btn flat round icon="arrow_back" @click="props.onBack()" />
        <div class="text-h6">Volcado</div>
      </div>

      <q-card bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">Registros</div>

          <!-- Resumen -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6 col-lg-3">
              <q-card bordered class="bg-blue-1">
                <q-card-section>
                  <div class="text-caption text-grey-7">Total del Día</div>
                  <div class="text-h5 text-blue-9 text-weight-bold">
                    {{ records.length }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <q-card bordered class="bg-green-1">
                <q-card-section>
                  <div class="text-caption text-grey-7">Con Silo Asignado</div>
                  <div class="text-h5 text-green-9 text-weight-bold">
                    {{ recordsConSilo }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <q-card bordered class="bg-yellow-1">
                <q-card-section>
                  <div class="text-caption text-grey-7">Sin Silo Asignado</div>
                  <div class="text-h5 text-orange-9 text-weight-bold">
                    {{ recordsSinSilo }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-lg-3">
              <q-card bordered class="bg-purple-1">
                <q-card-section>
                  <div class="text-caption text-grey-7">Total Toneladas</div>
                  <div class="text-h5 text-purple-9 text-weight-bold">
                    {{ totalToneladas }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Filtros (UI, sin lógica en TSX original) -->
          <q-card bordered class="q-mb-md">
            <q-card-section>
              <div class="text-center text-subtitle2 q-mb-md">Filtros</div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-12 col-md-2">
                  <q-input dense outlined v-model="filters.ticket" placeholder="Captura Ticket" />
                </div>
                <div class="col-12 col-md-2">
                  <q-input dense outlined v-model="filters.boleta" placeholder="Captura Boleta" />
                </div>
                <div class="col-12 col-md-2">
                  <q-input dense outlined v-model="filters.placas" placeholder="Captura Placas" />
                </div>
                <div class="col-12 col-md-3">
                  <q-select
                    dense
                    outlined
                    v-model="filters.silo"
                    :options="siloFilterOptions"
                    label="Todos los Silos"
                    emit-value
                    map-options
                    clearable
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input dense outlined v-model.number="filters.toneladas" type="number" placeholder="Toneladas" />
                </div>
              </div>

              <div class="row q-col-gutter-md items-center">
                <div class="col-12 col-md-2">
                  <q-checkbox v-model="filters.hoy" label="Hoy" />
                </div>
                <div class="col-12 col-md-6 row items-center q-gutter-sm">
                  <div class="text-body2">Fecha:</div>
                  <q-input dense outlined v-model="filters.fechaDesde" type="date" style="max-width: 180px;" />
                  <div class="text-body2">:</div>
                  <q-input dense outlined v-model="filters.fechaHasta" type="date" style="max-width: 180px;" />
                </div>
                <div class="col-12 col-md-4 row justify-end">
                  <q-btn
                    color="green-7"
                    unelevated
                    icon="file_download"
                    label="Exportar Excel"
                    @click="notifyInfo('Exportar Excel: pendiente de implementación')"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <div class="row justify-end q-mb-sm">
            <q-btn round color="grey-9" icon="add" @click="notifyInfo('Nuevo registro: pendiente de implementación')" />
          </div>

          <!-- Tabla -->
          <q-table
            flat
            bordered
            dense
            :rows="records"
            :columns="columnsList"
            row-key="no"
            :rows-per-page-options="[0]"
          >
            <template #no-data>
              <div class="full-width row flex-center q-pa-lg text-grey-7">
                <div class="text-center">
                  <div class="text-subtitle1">No hay boletas aceptadas para volcado</div>
                  <div class="text-caption">
                    Las boletas aparecerán aquí cuando el productor acepte el precio en la opción "Boleta"
                  </div>
                </div>
              </div>
            </template>

            <template #body-cell-accion="p">
              <q-td :props="p" class="text-center">
                <q-btn flat round icon="visibility" @click="handleViewDetails(p.row)" />
              </q-td>
            </template>
          </q-table>

        </q-card-section>
      </q-card>
    </div>

    <!-- =========================
         VIEW: DETAIL
    ========================== -->
    <div v-else-if="currentView === 'detail'">
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-btn flat round icon="arrow_back" @click="setCurrentView('list')" />
        <div class="text-h6">Volcado</div>
      </div>

      <div class="row justify-center">
        <div class="col-12 col-lg-8">

          <!-- BOLETA -->
          <q-card bordered class="q-mb-md">
            <q-card-section class="bg-orange-6 text-white text-center">
              <div class="text-h6">BOLETA</div>
            </q-card-section>

            <q-card-section>
              <div class="row justify-end q-mb-md">
                <div style="width: 220px;">
                  <div class="text-caption text-grey-7 q-mb-xs">FOLIO / BOLETA</div>
                  <q-input dense outlined :model-value="selectedRecord?.boleta || ''" disable />
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">PRODUCTOR</div>
                  <q-input dense outlined :model-value="boletaCompleta?.productor || '-'" disable />
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">FECHA Y HORA</div>
                  <q-input dense outlined :model-value="boletaCompleta?.fecha || '-'" disable />
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">TELÉFONO</div>
                  <q-input dense outlined :model-value="boletaCompleta?.telefono || '-'" disable />
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">T. PRODUCTOR</div>
                  <q-input dense outlined :model-value="boletaCompleta?.tProductor || '-'" disable />
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">COMPRADOR</div>
                  <q-input dense outlined :model-value="boletaCompleta?.comprador || '-'" disable />
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">ORIGEN</div>
                  <q-input dense outlined :model-value="boletaCompleta?.origen || '-'" disable />
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">PRECIO</div>
                  <q-input
                    dense
                    outlined
                    :model-value="boletaCompleta?.precioSugerido ? `$${boletaCompleta.precioSugerido}` : '-'"
                    disable
                  />
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">DESCUENTO (KG/TON)</div>
                  <q-input
                    dense
                    outlined
                    :model-value="boletaCompleta?.descuento ? `${boletaCompleta.descuento} kg/ton` : '-'"
                    disable
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">CALIBRE</div>
                  <q-input dense outlined :model-value="boletaCompleta?.calibre || '-'" disable />
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">HUMEDAD</div>
                  <q-input
                    dense
                    outlined
                    :model-value="boletaCompleta?.humedad ? `${boletaCompleta.humedad}%` : '-'"
                    disable
                  />
                </div>
              </div>

              <!-- Tabla análisis desplegable -->
              <TablaAnalisisDesplegable
                v-if="boletaCompleta"
                :impurezas="boletaCompleta.impurezas || 0"
                :r1="boletaCompleta.r1 || 0"
                :r2="boletaCompleta.r2 || 0"
                :cafesLisos="boletaCompleta.cafesLisos || 0"
                :manchados="boletaCompleta.manchados || 0"
                :quebMxc="boletaCompleta.quebMxc || 0"
                :helados="boletaCompleta.helados || 0"
                :alimonados="boletaCompleta.alimonados || 0"
                :revolcados="boletaCompleta.revolcados || 0"
                :sumaR2="boletaCompleta.sumaR2 || 0"
                :totalDanos="parseFloat(totalDanosCalculado)"
                :exportacion="boletaCompleta.exportacion || 0"
              />

              <!-- Firmas -->
              <div class="row q-col-gutter-md q-mt-lg">
                <div class="col-12 col-md-4 text-center">
                  <div class="q-mt-lg" style="border-top: 1px solid #9ca3af; padding-top: 6px;">
                    <div class="text-caption text-weight-medium">ANALISTA</div>
                  </div>
                </div>
                <div class="col-12 col-md-4 text-center">
                  <div class="q-mt-lg" style="border-top: 1px solid #9ca3af; padding-top: 6px;">
                    <div class="text-caption text-weight-medium">RECEPCIONISTA</div>
                  </div>
                </div>
                <div class="col-12 col-md-4 text-center">
                  <div class="q-mt-lg" style="border-top: 1px solid #9ca3af; padding-top: 6px;">
                    <div class="text-caption text-weight-medium">AUTORIZÓ</div>
                  </div>
                </div>
              </div>

            </q-card-section>
          </q-card>

          <!-- SILO -->
          <q-card bordered class="q-mb-md">
            <q-card-section class="bg-deep-purple-10 text-white">
              <div class="text-subtitle1">SILO</div>
            </q-card-section>
            <q-card-section>

              <q-banner
                v-if="siloSugerido"
                rounded
                class="bg-blue-1 text-blue-10 q-mb-md"
              >
                <div class="text-body2">
                  <strong>💡 Silo Sugerido:</strong> {{ siloSugerido }}
                  <span class="text-caption text-blue-9">
                    (basado en calibre {{ boletaCompleta?.calibre || '-' }})
                  </span>
                </div>
                <div class="text-caption text-blue-9 q-mt-xs">
                  El supervisor puede cambiar el silo si es necesario
                </div>
              </q-banner>

              <div class="text-caption text-grey-7 q-mb-xs">Seleccionar Silo (Por Calibre):</div>
              <q-select
                dense
                outlined
                v-model="selectedSilo"
                :options="siloOptions"
                emit-value
                map-options
                clearable
                placeholder="Seleccione un silo..."
              />
            </q-card-section>
          </q-card>

          <!-- PRODUCCIÓN -->
          <q-card bordered class="q-mb-md">
            <q-card-section class="bg-deep-purple-10 text-white">
              <div class="text-subtitle1">PRODUCCIÓN</div>
            </q-card-section>
            <q-card-section>
              <div class="text-caption text-grey-7 q-mb-xs">Seleccionar Silo Pulmón (Trenes de Limpia):</div>

              <q-select
                dense
                outlined
                v-model="selectedProduccion"
                :options="silosPulmonOptions"
                emit-value
                map-options
                clearable
                placeholder="Seleccione un silo pulmón..."
              />

              <q-banner rounded class="bg-yellow-1 text-orange-10 q-mt-md">
                <div class="text-caption">
                  <strong>ℹ️ Nota:</strong>
                  Los Silos Pulmón se usan cuando el grano es de muy buena calidad
                  o cuando se necesita grano de cierto calibre para procesamiento inmediato en los trenes de limpia.
                </div>
              </q-banner>
            </q-card-section>
          </q-card>

          <!-- Botones -->
          <div class="row justify-center q-gutter-md q-mb-xl">
            <q-btn color="orange-6" label="Aceptar" @click="handleAceptar" />
            <q-btn color="orange-6" label="Rechazar" @click="handleRechazar" />
          </div>

        </div>
      </div>
    </div>

    <!-- =========================
         VIEW: REJECT
    ========================== -->
    <div v-else-if="currentView === 'reject'">
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-btn flat round icon="arrow_back" @click="setCurrentView('detail')" />
        <div class="text-h6">Volcado</div>
      </div>

      <div class="row justify-center">
        <div class="col-12 col-lg-8">

          <!-- BOLETA (misma sección de detalle) -->
          <q-card bordered class="q-mb-md">
            <q-card-section class="bg-orange-6 text-white text-center">
              <div class="text-h6">BOLETA</div>
            </q-card-section>

            <q-card-section>
              <div class="row justify-end q-mb-md">
                <div style="width: 220px;">
                  <div class="text-caption text-grey-7 q-mb-xs">FOLIO / BOLETA</div>
                  <q-input dense outlined :model-value="selectedRecord?.boleta || ''" disable />
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">PRODUCTOR</div>
                  <q-input dense outlined :model-value="boletaCompleta?.productor || '-'" disable />
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">FECHA Y HORA</div>
                  <q-input dense outlined :model-value="boletaCompleta?.fecha || '-'" disable />
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">TELÉFONO</div>
                  <q-input dense outlined :model-value="boletaCompleta?.telefono || '-'" disable />
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">T. PRODUCTOR</div>
                  <q-input dense outlined :model-value="boletaCompleta?.tProductor || '-'" disable />
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">COMPRADOR</div>
                  <q-input dense outlined :model-value="boletaCompleta?.comprador || '-'" disable />
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">ORIGEN</div>
                  <q-input dense outlined :model-value="boletaCompleta?.origen || '-'" disable />
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">PRECIO</div>
                  <q-input
                    dense
                    outlined
                    :model-value="boletaCompleta?.precioSugerido ? `$${boletaCompleta.precioSugerido}` : '-'"
                    disable
                  />
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">DESCUENTO (KG/TON)</div>
                  <q-input
                    dense
                    outlined
                    :model-value="boletaCompleta?.descuento ? `${boletaCompleta.descuento} kg/ton` : '-'"
                    disable
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">CALIBRE</div>
                  <q-input dense outlined :model-value="boletaCompleta?.calibre || '-'" disable />
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-7 q-mb-xs">HUMEDAD</div>
                  <q-input
                    dense
                    outlined
                    :model-value="boletaCompleta?.humedad ? `${boletaCompleta.humedad}%` : '-'"
                    disable
                  />
                </div>
              </div>

              <TablaAnalisisDesplegable
                v-if="boletaCompleta"
                :impurezas="boletaCompleta.impurezas || 0"
                :r1="boletaCompleta.r1 || 0"
                :r2="boletaCompleta.r2 || 0"
                :cafesLisos="boletaCompleta.cafesLisos || 0"
                :manchados="boletaCompleta.manchados || 0"
                :quebMxc="boletaCompleta.quebMxc || 0"
                :helados="boletaCompleta.helados || 0"
                :alimonados="boletaCompleta.alimonados || 0"
                :revolcados="boletaCompleta.revolcados || 0"
                :sumaR2="boletaCompleta.sumaR2 || 0"
                :totalDanos="parseFloat(totalDanosCalculado)"
                :exportacion="boletaCompleta.exportacion || 0"
              />

              <!-- Firmas -->
              <div class="row q-col-gutter-md q-mt-lg">
                <div class="col-12 col-md-4 text-center">
                  <div class="q-mt-lg" style="border-top: 1px solid #9ca3af; padding-top: 6px;">
                    <div class="text-caption text-weight-medium">ANALISTA</div>
                  </div>
                </div>
                <div class="col-12 col-md-4 text-center">
                  <div class="q-mt-lg" style="border-top: 1px solid #9ca3af; padding-top: 6px;">
                    <div class="text-caption text-weight-medium">RECEPCIONISTA</div>
                  </div>
                </div>
                <div class="col-12 col-md-4 text-center">
                  <div class="q-mt-lg" style="border-top: 1px solid #9ca3af; padding-top: 6px;">
                    <div class="text-caption text-weight-medium">AUTORIZÓ</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- MOTIVOS DE RECHAZO -->
          <q-card bordered class="q-mb-md">
            <q-card-section class="bg-deep-purple-10 text-white">
              <div class="text-subtitle1">MOTIVOS DE RECHAZO</div>
            </q-card-section>

            <q-card-section class="q-gutter-sm">
              <q-checkbox v-model="motivoPlaga" label="Plaga" />
              <q-checkbox v-model="motivoHongos" label="Humedad" />

              <div class="row items-center q-gutter-sm">
                <q-checkbox
                  :model-value="motivoOtros !== ''"
                  @update:model-value="(v) => { if (!v) motivoOtros = '' }"
                  label="Otros"
                />
                <q-input
                  dense
                  outlined
                  v-model="motivoOtros"
                  placeholder="Especificar motivo"
                  class="col"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Upload mock -->
          <q-card bordered class="q-mb-md">
            <q-card-section>
              <div class="column items-center justify-center q-py-lg">
                <div v-if="uploadedPhoto" class="relative-position">
                  <q-img :src="uploadedPhoto" style="max-width: 520px;" class="rounded-borders" />
                  <q-btn
                    v-if="!analisisSaved"
                    color="red-6"
                    label="Eliminar"
                    class="q-mt-sm"
                    @click="uploadedPhoto = null"
                  />
                </div>

                <div v-else class="text-center">
                  <q-icon name="upload" size="48px" class="text-grey-5 q-mb-sm" />
                  <div class="text-subtitle1 q-mb-xs">Arrastra la documentación aquí</div>
                  <div class="text-caption text-grey-6 q-mb-md">
                    Arrastra y suelta el documento que necesitas enviar o búscalo en tu equipo
                  </div>

                  <div class="row q-gutter-sm justify-center">
                    <q-btn
                      color="deep-purple-10"
                      unelevated
                      icon="photo_camera"
                      label="Tomar Foto"
                      :disable="analisisSaved"
                      @click="notifyInfo('Tomar Foto: pendiente de implementación')"
                    />
                    <q-btn
                      color="deep-purple-10"
                      unelevated
                      label="Seleccionar archivo"
                      :disable="analisisSaved"
                      @click="notifyInfo('Seleccionar archivo: pendiente de implementación')"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Botones -->
          <div class="row justify-center q-gutter-md q-mb-xl">
            <q-btn color="orange-6" label="Guardar" @click="handleGuardarRechazo" />
            <q-btn color="orange-6" label="Cancelar" @click="handleCancelar" />
          </div>

        </div>
      </div>
    </div>

  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import TablaAnalisisDesplegable from './TablaAnalisisDesplegable.vue';

interface VolcadoRecord {
  no: number;
  ticket: string;
  boleta: string;
  fecha: string;
  tonAprox: number;
  chofer: string;
  placas: string;
  silo: string;
}

type BoletaConSilo = {
  noBoleta: string;
  siloAsignado: string;
  tipoSilo: 'normal' | 'pulmon';
  fechaAsignacion: string;
};

interface VolcadoFlowProps {
  onBack?: () => void;
  boletasPrecios?: any[];
  silosPulmon?: string[];
  boletasConSilo?: BoletaConSilo[];
}

const props = withDefaults(defineProps<VolcadoFlowProps>(), {
  onBack: () => {},
  boletasPrecios: () => [],
  silosPulmon: () => [],
  boletasConSilo: () => []
});

const emit = defineEmits<{
  (e: 'update:boletasConSilo', v: BoletaConSilo[]): void;
}>();

const $q = useQuasar();

/* -----------------------
   Estado (equivalente useState)
------------------------ */
const currentView = ref<'list' | 'detail' | 'reject'>('list');
const selectedRecord = ref<VolcadoRecord | null>(null);

const selectedSilo = ref<string>('');
const selectedProduccion = ref<string>('');
const siloSugerido = ref<string>('');

const tamano = ref<string>('');
const color = ref<string>('');

const motivoPlaga = ref(false);
const motivoHongos = ref(false);
const motivoOtros = ref('');

const uploadedPhoto = ref<string | null>(null);
const analisisSaved = ref(false);

/* Filtros (UI) */
const filters = ref({
  ticket: '',
  boleta: '',
  placas: '',
  silo: '' as string | '',
  toneladas: null as number | null,
  hoy: false,
  fechaDesde: '',
  fechaHasta: ''
});

/* -----------------------
   Derivados
------------------------ */
// Solo boletas con estatus "Aceptado por Productor"
const boletasAceptadas = computed(() => {
  return props.boletasPrecios.filter((b: any) => b.estatus === 'Aceptado por Productor');
});

const records = computed<VolcadoRecord[]>(() => {
  return boletasAceptadas.value.map((boleta: any, index: number) => {
    const boletaConSilo = props.boletasConSilo.find((bc) => bc.noBoleta === boleta.noBoleta);

    return {
      no: index + 1,
      ticket: boleta.ticket || '',
      boleta: boleta.noBoleta || '',
      fecha: boleta.fecha ? String(boleta.fecha).split(' ')[0] : '',
      tonAprox: boleta.tonsAprox || 0,
      chofer: boleta.chofer || '',
      placas: boleta.placas || '',
      silo: boletaConSilo ? boletaConSilo.siloAsignado : '-'
    };
  });
});

const recordsConSilo = computed(() => records.value.filter(r => r.silo !== '-').length);
const recordsSinSilo = computed(() => records.value.filter(r => r.silo === '-').length);
const totalToneladas = computed(() => {
  const sum = records.value.reduce((acc, r) => acc + (Number(r.tonAprox) || 0), 0);
  return Number(sum.toFixed(2));
});

/* Columnas QTable */
const columnsList = [
  { name: 'no', label: 'No', field: 'no', align: 'left' as const },
  { name: 'ticket', label: 'Ticket', field: 'ticket', align: 'left' as const },
  { name: 'boleta', label: 'Boleta', field: 'boleta', align: 'left' as const },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' as const },
  { name: 'tonAprox', label: 'Ton. Aprox', field: 'tonAprox', align: 'left' as const },
  { name: 'chofer', label: 'Chofer', field: 'chofer', align: 'left' as const },
  { name: 'placas', label: 'Placas', field: 'placas', align: 'left' as const },
  { name: 'silo', label: 'Silo', field: 'silo', align: 'left' as const },
  { name: 'accion', label: 'Acción', field: 'accion', align: 'center' as const }
];

/* Selects */
const siloOptions = [
  { label: 'Silo 1 - Calibre 7', value: 'Silo 1' },
  { label: 'Silo 2 - Calibre 8', value: 'Silo 2' },
  { label: 'Silo 3 - Calibre 9', value: 'Silo 3' },
  { label: 'Silo 4 - Calibre 10', value: 'Silo 4' },
  { label: 'Silo 5 - Calibre 11', value: 'Silo 5' },
  { label: 'Silo 6 - Calibre 12', value: 'Silo 6' }
];

const silosPulmonOptions = computed(() => {
  if (props.silosPulmon && props.silosPulmon.length > 0) {
    return props.silosPulmon.map((s) => ({ label: s, value: s }));
  }
  return [
    { label: 'Silo Pulmón TL1 - Tren de Limpia 1', value: 'Silo Pulmón TL1' },
    { label: 'Silo Pulmón TL2 - Tren de Limpia 2', value: 'Silo Pulmón TL2' },
    { label: 'Silo Pulmón TL3 - Tren de Limpia 3', value: 'Silo Pulmón TL3' }
  ];
});

const siloFilterOptions = [
  { label: 'Todos los Silos', value: '' },
  { label: 'Silo 1', value: 'Silo 1' },
  { label: 'Silo 2', value: 'Silo 2' },
  { label: 'Silo 3', value: 'Silo 3' },
  { label: 'Silo 4', value: 'Silo 4' },
  { label: 'Silo 5', value: 'Silo 5' },
  { label: 'Silo 6', value: 'Silo 6' },
  { label: 'Sin Asignar', value: '-' }
];

/* Boleta completa en detalle / rechazo */
const boletaCompleta = computed(() => {
  const boletaNo = selectedRecord.value?.boleta;
  return props.boletasPrecios.find((b: any) => b.noBoleta === boletaNo);
});

// totalDanos: Impurezas + R1 + Suma R2
const totalDanosCalculado = computed(() => {
  const b = boletaCompleta.value;
  const total = b
    ? (Number(b.impurezas || 0) + Number(b.r1 || 0) + Number(b.sumaR2 || 0))
    : 0;
  return total.toFixed(1);
});

/* -----------------------
   Lógica de sugerencia
------------------------ */
function sugerirSilo(calibre: string): string {
  switch (calibre) {
    case '7': return 'Silo 1';
    case '8': return 'Silo 2';
    case '9': return 'Silo 3';
    case '10': return 'Silo 4';
    case '11': return 'Silo 5';
    case '12': return 'Silo 6';
    default: return '';
  }
}

/* -----------------------
   Acciones
------------------------ */
function setCurrentView(v: 'list' | 'detail' | 'reject') {
  currentView.value = v;
}

function handleViewDetails(record: VolcadoRecord) {
  selectedRecord.value = record;

  const calibre = boletaCompleta.value?.calibre || '';
  const sugerencia = sugerirSilo(String(calibre));
  siloSugerido.value = sugerencia;
  selectedSilo.value = sugerencia; // preseleccion

  currentView.value = 'detail';
}

function handleAceptar() {
  const siloAsignado = selectedSilo.value || selectedProduccion.value;
  const tipoSilo: 'normal' | 'pulmon' = selectedSilo.value ? 'normal' : 'pulmon';

  if (!siloAsignado) {
    notifyWarn('Debe seleccionar un silo (SILO o PRODUCCIÓN) antes de aceptar');
    return;
  }
  if (!selectedRecord.value) return;

  const fechaActual = new Date().toISOString();
  const nuevo: BoletaConSilo = {
    noBoleta: selectedRecord.value.boleta,
    siloAsignado,
    tipoSilo,
    fechaAsignacion: fechaActual
  };

  emit('update:boletasConSilo', [...props.boletasConSilo, nuevo]);

  notifyOk(`Volcado aceptado. Asignado a: ${siloAsignado}`);

  // reset
  currentView.value = 'list';
  selectedRecord.value = null;
  selectedSilo.value = '';
  selectedProduccion.value = '';
  siloSugerido.value = '';
}

function handleRechazar() {
  currentView.value = 'reject';
}

function handleGuardarRechazo() {
  const msg =
    `Rechazo guardado. Motivos: ` +
    `${motivoPlaga.value ? 'Plaga ' : ''}` +
    `${motivoHongos.value ? 'Humedad ' : ''}` +
    `${motivoOtros.value ? 'Otros: ' + motivoOtros.value : ''}`;

  notifyOk(msg);

  // reset
  currentView.value = 'list';
  selectedRecord.value = null;
  motivoPlaga.value = false;
  motivoHongos.value = false;
  motivoOtros.value = '';
}

function handleCancelar() {
  currentView.value = 'list';
  selectedRecord.value = null;
  motivoPlaga.value = false;
  motivoHongos.value = false;
  motivoOtros.value = '';
}

/* -----------------------
   Notificaciones
------------------------ */
function notifyOk(message: string) {
  $q.notify({ type: 'positive', message, position: 'top' });
}
function notifyWarn(message: string) {
  $q.notify({ type: 'warning', message, position: 'top' });
}
function notifyInfo(message: string) {
  $q.notify({ type: 'info', message, position: 'top' });
}
</script>
