<template>
  <q-dialog v-model="open" persistent maximized transition-show="fade" transition-hide="fade">
    <q-card class="column full-height">

      <!-- Header -->
      <q-toolbar class="bg-orange-6 text-white">
        <q-icon name="price_check" size="22px" class="q-mr-sm" />
        <q-toolbar-title class="text-weight-bold">
          Autorización de Precio - Boleta #{{ selectedBoleta?.noBoleta }}
        </q-toolbar-title>

        <div class="text-caption text-orange-1 q-mr-md" v-if="selectedBoleta">
          Ticket: {{ selectedBoleta.ticket }} | Productor: {{ selectedBoleta.productor }}
        </div>

        <q-btn flat round dense icon="close" aria-label="Cerrar" @click="emitClose" />
      </q-toolbar>

      <q-separator />

      <!-- Contenido -->
      <q-card-section class="col scroll q-pa-md">
        <div class="column q-gutter-md">

          <!-- SECCIÓN 1: RESUMEN DE PRECIO -->
          <q-card flat bordered class="bg-green-1">
            <q-card-section>
              <div class="text-center q-mb-md">
                <div class="text-subtitle1 text-weight-bold text-grey-8">💰 PRECIO CALCULADO</div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4 text-center">
                  <div class="text-caption text-grey-7 text-weight-bold">Nivel de Precio</div>
                  <q-chip color="orange-6" text-color="white" class="text-weight-bold">
                    {{ selectedBoleta?.precioSugeridoCodigo }}
                  </q-chip>
                </div>

                <div class="col-12 col-md-4 text-center">
                  <div class="text-caption text-grey-7 text-weight-bold">Precio Sugerido</div>
                  <div class="text-h5 text-weight-bold text-green-9">
                    ${{ fmt2(selectedBoleta?.precioSugerido) }}
                  </div>
                  <div class="text-caption text-grey-7">por kilogramo (MXN)</div>
                </div>

                <div class="col-12 col-md-4 text-center">
                  <div class="text-caption text-grey-7 text-weight-bold">Descuento Aplicado</div>
                  <div class="text-h6 text-weight-bold text-red-9">
                    ${{ fmt2(selectedBoleta?.descuento) }}
                  </div>
                  <div class="text-caption text-grey-7">MXN/TON</div>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="text-caption text-grey-7 text-center">
                Cálculo:
                Precio Base ({{ precioBaseMXN.toFixed(2) }} MXN/TON)
                - Descuento Calibre ({{ descuentoCalibre.toFixed(2) }} MXN/TON)
                - Descuento Calidad ({{ descuentoCalidad.toFixed(2) }} MXN/TON)
                =
                {{ precioTonMXN.toFixed(2) }} MXN/TON
              </div>
            </q-card-section>
          </q-card>

          <!-- SECCIÓN 2: Peso y Valor -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-blue-1">
                <q-card-section>
                  <div class="row items-center q-gutter-sm q-mb-sm">
                    <div class="text-h6">⚖️</div>
                    <div class="text-subtitle2 text-weight-bold text-grey-9">Información de Peso</div>
                  </div>

                  <div class="column q-gutter-xs text-body2">
                    <div class="row justify-between">
                      <span class="text-grey-7">Toneladas Aprox:</span>
                      <span class="text-weight-bold">{{ fmtAny(selectedBoleta?.tonsAprox) }} TON</span>
                    </div>
                    <div class="row justify-between">
                      <span class="text-grey-7">Peso Estimado:</span>
                      <span class="text-weight-medium">{{ pesoEstimadoKg.toFixed(0) }} kg</span>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-purple-1">
                <q-card-section>
                  <div class="row items-center q-gutter-sm q-mb-sm">
                    <div class="text-h6">📊</div>
                    <div class="text-subtitle2 text-weight-bold text-grey-9">Valor Total Estimado</div>
                  </div>

                  <div class="column q-gutter-xs text-body2">
                    <div class="row justify-between">
                      <span class="text-grey-7">Valor Bruto:</span>
                      <span class="text-weight-bold text-green-9">
                        ${{ valorBrutoMXN.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} MXN
                      </span>
                    </div>

                    <div class="text-caption text-grey-6 text-right">
                      ({{ fmtAny(selectedBoleta?.tonsAprox) }} TON × ${{ fmt2(selectedBoleta?.precioSugerido) }}/kg)
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- SECCIÓN 3: Análisis de Calidad -->
          <q-card flat bordered class="bg-grey-1">
            <q-card-section>
              <div class="row items-center q-gutter-sm q-mb-md">
                <div class="text-h6">🔬</div>
                <div class="text-subtitle2 text-weight-bold text-grey-9">Análisis de Calidad</div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">Calibre</div>
                  <div class="text-subtitle1 text-weight-bold">{{ selectedBoleta?.calibre }}</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">Humedad</div>
                  <div class="text-weight-medium">{{ fmtAny(selectedBoleta?.humedad) }}%</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">Exportación</div>
                  <div class="text-subtitle1 text-weight-bold text-green-9">{{ fmtAny(selectedBoleta?.exportacion) }}%</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-caption text-grey-7">Total Daños</div>
                  <div class="text-weight-bold text-red-9">{{ totalDanos }}%</div>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="row q-col-gutter-md text-caption">
                <div class="col-12 col-md-4">
                  <div class="row justify-between">
                    <span class="text-grey-7">Impurezas:</span>
                    <span class="text-weight-medium">{{ fmtAny(selectedBoleta?.impurezas ?? 0) }}%</span>
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="row justify-between">
                    <span class="text-grey-7">R1:</span>
                    <span class="text-weight-medium">{{ fmtAny(selectedBoleta?.r1 ?? 0) }}%</span>
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="row justify-between">
                    <span class="text-grey-7">Suma R2:</span>
                    <span class="text-weight-medium">{{ fmtAny(selectedBoleta?.sumaR2 ?? 0) }}%</span>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- SECCIÓN 4: Info general -->
          <q-card flat bordered class="bg-grey-1">
            <q-card-section>
              <div class="row items-center q-gutter-sm q-mb-md">
                <div class="text-h6">ℹ️</div>
                <div class="text-subtitle2 text-weight-bold text-grey-9">Información General</div>
              </div>

              <div class="row q-col-gutter-md text-body2">
                <div class="col-12 col-md-4">
                  <div class="text-caption text-grey-7">Comprador</div>
                  <div class="text-weight-medium">{{ selectedBoleta?.comprador }}</div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-caption text-grey-7">Origen</div>
                  <div class="text-weight-medium">{{ selectedBoleta?.origen || 'N/A' }}</div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-caption text-grey-7">Fecha</div>
                  <div class="text-weight-medium">{{ selectedBoleta?.fecha }}</div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-caption text-grey-7">Teléfono</div>
                  <div class="text-weight-medium">{{ selectedBoleta?.telefono || 'N/A' }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Seleccionar Precio Alternativo -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-body2 text-weight-bold text-grey-8 q-mb-sm">
                🔄 Modificar Precio (opcional)
              </div>

              <q-select
                v-model="selectedPrecioModel"
                outlined
                dense
                :options="precioOptions"
                emit-value
                map-options
              />

              <q-banner
                v-if="precioModificado"
                dense
                rounded
                class="bg-orange-1 text-orange-10 q-mt-sm"
              >
                <template #avatar>
                  <q-icon name="warning" />
                </template>
                Has modificado el precio sugerido. Por favor, proporciona una justificación.
              </q-banner>
            </q-card-section>
          </q-card>

          <!-- Justificación -->
          <q-card flat bordered>
            <q-card-section>
              <div class="text-body2 text-weight-bold text-grey-8 q-mb-sm">
                📝 Justificación
                <span v-if="precioModificado" class="text-red-9">*</span>
              </div>

              <q-input
                v-model="justificacionModel"
                type="textarea"
                outlined
                dense
                :placeholder="precioModificado ? 'Justificación requerida al modificar precio...' : 'Justificación opcional...'"
                :rows="3"
              />
            </q-card-section>
          </q-card>

        </div>
      </q-card-section>

      <q-separator />

      <!-- Acciones -->
      <q-card-actions class="q-pa-md bg-grey-2" align="between">
        <q-btn
          color="positive"
          unelevated
          icon="check"
          label="✅ Autorizar Precio"
          class="full-width-sm"
          @click="autorizar"
        />
        <q-btn
          color="negative"
          unelevated
          icon="close"
          label="❌ Rechazar y Renegociar"
          class="full-width-sm"
          @click="emitRechazar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Notify } from 'quasar';

type PrecioItem = { codigo: string; valor: number };
type TablaCalibreItem = { calibre: string; descuento: number };

interface Props {
  /**
   * Control del modal. (Recomendado)
   */
  modelValue: boolean;

  selectedBoleta: any;

  /**
   * En TSX era selectedPrecio + setSelectedPrecio. Aquí lo mantenemos vía v-model:selectedPrecio.
   */
  selectedPrecio: string;

  /**
   * En TSX era justificacion + setJustificacion. Aquí lo mantenemos vía v-model:justificacion.
   */
  justificacion: string;

  /**
   * Callback para opciones de precio
   */
  calcularPreciosDisponibles: (calibre: string) => PrecioItem[];

  precioBaseUSD: string;
  tipoCambioFIX: string;
  tablaCalibre: TablaCalibreItem[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'update:selectedPrecio', v: string): void;
  (e: 'update:justificacion', v: string): void;
  (e: 'close'): void;
  (e: 'autorizar'): void;
  (e: 'rechazar'): void;
}>();

const open = computed<boolean>({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const selectedPrecioModel = computed<string>({
  get: () => props.selectedPrecio,
  set: (v) => emit('update:selectedPrecio', v),
});

const justificacionModel = computed<string>({
  get: () => props.justificacion,
  set: (v) => emit('update:justificacion', v),
});

function toNum(s: string): number {
  const n = parseFloat(String(s || '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

const precioBaseUSD_num = computed(() => toNum(props.precioBaseUSD));
const tipoCambio_num = computed(() => toNum(props.tipoCambioFIX));
const precioBaseMXN = computed(() => precioBaseUSD_num.value * tipoCambio_num.value);

const itemCalibre = computed(() =>
  props.tablaCalibre?.find((i) => i.calibre === props.selectedBoleta?.calibre)
);
const descuentoCalibre = computed(() => (itemCalibre.value ? Number(itemCalibre.value.descuento || 0) : 0));

const totalDanos = computed(() => {
  const imp = Number(props.selectedBoleta?.impurezas || 0);
  const r1 = Number(props.selectedBoleta?.r1 || 0);
  const r2 = Number(props.selectedBoleta?.sumaR2 || 0);
  return (imp + r1 + r2).toFixed(2);
});

const descuentoCalidad = computed(() => {
  const desc = Number(props.selectedBoleta?.descuento || 0);
  return desc - descuentoCalibre.value;
});

const precioModificado = computed(() => props.selectedPrecio !== props.selectedBoleta?.precioSugeridoCodigo);

const precioTonMXN = computed(() => Number(props.selectedBoleta?.precioSugerido || 0) * 1000);

const pesoEstimadoKg = computed(() => Number(props.selectedBoleta?.tonsAprox || 0) * 1000);

const valorBrutoMXN = computed(() => pesoEstimadoKg.value * Number(props.selectedBoleta?.precioSugerido || 0));

const precioOptions = computed(() => {
  const calibre = String(props.selectedBoleta?.calibre || '');
  const precios = props.calcularPreciosDisponibles ? props.calcularPreciosDisponibles(calibre) : [];
  const sugerido = props.selectedBoleta?.precioSugeridoCodigo;

  return precios.map((p) => ({
    value: p.codigo,
    label: `${p.codigo} - $${Number(p.valor).toFixed(2)}/kg ${p.codigo === sugerido ? '(Sugerido)' : ''}`,
  }));
});

function fmt2(v: any): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return '0.00';
  return n.toFixed(2);
}

function fmtAny(v: any): string {
  if (v === null || v === undefined || v === '') return '0';
  return String(v);
}

function emitClose(): void {
  emit('update:modelValue', false);
  emit('close');
}

function emitRechazar(): void {
  emit('rechazar');
}

function autorizar(): void {
  if (precioModificado.value && !String(props.justificacion || '').trim()) {
    Notify.create({
      type: 'warning',
      message: '⚠️ Por favor, proporciona una justificación al modificar el precio sugerido.',
    });
    return;
  }
  emit('autorizar');
}
</script>

<style scoped>
.full-width-sm {
  width: 100%;
}
@media (min-width: 600px) {
  .full-width-sm {
    width: auto;
    min-width: 260px;
  }
}
</style>
