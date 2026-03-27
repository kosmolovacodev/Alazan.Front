<template>
  <q-dialog
    v-model="open"
    persistent
    transition-show="scale"
    transition-hide="scale"
    class="modal-precio"
  >
    <q-card class="modal-card-precio" style="max-width: 1400px; width: 90vw; max-height: 90vh">
      <!-- Header -->
      <q-toolbar class="bg-orange-7 text-white">
        <q-toolbar-title class="text-weight-bold">
          Autorización de Precio - Boleta {{ selectedBoleta?.noBoleta || selectedBoleta?.ticket }}
        </q-toolbar-title>

        <div class="text-caption text-orange-1 q-mr-md">
          {{ new Date().toLocaleDateString('es-MX') }}
        </div>

        <q-btn flat round dense icon="close" aria-label="Cerrar" @click="emitClose" />
      </q-toolbar>

      <q-separator />

      <!-- Tabla de información resumida -->
      <q-card-section class="q-pa-none">
        <q-markup-table flat dense separator="cell" class="text-body2">
          <thead class="bg-grey-2">
            <tr>
              <th class="text-left">No. Ticket</th>
              <th class="text-left">Fecha</th>
              <th class="text-left">Comprador</th>
              <th class="text-right">Peso Bruto</th>
              <th class="text-right">Descuento (kg/ton)</th>
              <th class="text-right">Precio Sugerido</th>
              <th class="text-center">Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-left">{{ selectedBoleta?.ticket }}</td>
              <td class="text-left">{{ formatFecha(selectedBoleta?.fecha) }}</td>
              <td class="text-left">{{ selectedBoleta?.comprador }}</td>
              <td class="text-right">{{ formatNumber(selectedBoleta?.pesoBruto) }} kg</td>
              <td class="text-right">
                {{ formatNumber(Math.round(selectedBoleta?.descuento || 0)) }}
              </td>
              <td class="text-right">
                <span class="text-weight-bold">{{ selectedBoleta?.precioSugeridoCodigo }}</span>
                ${{ formatPrecio(selectedBoleta?.precioSugerido) }}
              </td>
              <td class="text-center">
                <q-chip dense color="warning" text-color="white" size="sm">
                  {{ selectedBoleta?.estatus }}
                </q-chip>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>

      <!-- Contenido principal: Panel BOLETA y Panel PRECIO -->
      <q-card-section class="scroll q-pa-md" style="flex: 1; overflow-y: auto">
        <div class="row q-col-gutter-md">
          <!-- Panel izquierdo: BOLETA -->
          <div class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section class="bg-orange-7 text-white q-pa-md">
                <div class="text-h6 text-weight-bold text-center">BOLETA</div>
              </q-card-section>

              <q-card-section class="q-pa-md scroll" style="max-height: 500px; overflow-y: auto">
                <div class="column q-gutter-sm">
                  <!-- Campo FOLIO -->
                  <div>
                    <div class="text-caption text-grey-7 text-weight-bold">FOLIO</div>
                    <q-input
                      :model-value="selectedBoleta?.noBoleta"
                      outlined
                      dense
                      readonly
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- Campo PRODUCTOR -->
                  <div>
                    <div class="text-caption text-grey-7 text-weight-bold">PRODUCTOR</div>
                    <q-input
                      :model-value="selectedBoleta?.productor"
                      outlined
                      dense
                      readonly
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- FECHA Y HR. -->
                  <div>
                    <div class="text-caption text-grey-7 text-weight-bold">FECHA Y HR.</div>
                    <q-input
                      :model-value="formatFecha(selectedBoleta?.fecha)"
                      outlined
                      dense
                      readonly
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- TELÉFONO -->
                  <div>
                    <div class="text-caption text-grey-7 text-weight-bold">TELÉFONO</div>
                    <q-input
                      :model-value="selectedBoleta?.telefono"
                      outlined
                      dense
                      readonly
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- T PRODUCTOR -->
                  <div>
                    <div class="text-caption text-grey-7 text-weight-bold">T PRODUCTOR</div>
                    <q-input
                      :model-value="selectedBoleta?.tProductor || 'N/A'"
                      outlined
                      dense
                      readonly
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- COMPRADOR -->
                  <div>
                    <div class="text-caption text-grey-7 text-weight-bold">COMPRADOR</div>
                    <q-input
                      :model-value="selectedBoleta?.comprador"
                      outlined
                      dense
                      readonly
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- ORIGEN -->
                  <div>
                    <div class="text-caption text-grey-7 text-weight-bold">ORIGEN</div>
                    <q-input
                      :model-value="selectedBoleta?.origen"
                      outlined
                      dense
                      readonly
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- PRECIO -->
                  <div>
                    <div class="text-caption text-grey-7 text-weight-bold">PRECIO</div>
                    <q-input
                      :model-value="formatPrecio(selectedBoleta?.precioSugerido)"
                      outlined
                      dense
                      readonly
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- DESCUENTO -->
                  <div>
                    <div class="text-caption text-grey-7 text-weight-bold">DESCUENTO</div>
                    <q-input
                      :model-value="formatNumber(Math.round(selectedBoleta?.descuento || 0))"
                      outlined
                      dense
                      readonly
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- TON. APROX. -->
                  <div>
                    <div class="text-caption text-grey-7 text-weight-bold">TON. APROX.</div>
                    <q-input
                      :model-value="formatNumber(selectedBoleta?.tonsAprox)"
                      outlined
                      dense
                      readonly
                      bg-color="grey-2"
                    />
                  </div>

                  <!-- ANALISIS DE CALIDAD -->
                  <TablaAnalisisDesplegable
                    :tipo-grano-id="selectedBoleta?.granoId || 0"
                    :impurezas="selectedBoleta?.impurezas || 0"
                    :r1="selectedBoleta?.r1 || 0"
                    :r2="selectedBoleta?.r2 || 0"
                    :cafes-lisos="selectedBoleta?.cafesLisos || 0"
                    :manchados="selectedBoleta?.manchados || 0"
                    :queb-mxc="selectedBoleta?.quebMxc || 0"
                    :helados="selectedBoleta?.helados || 0"
                    :alimonados="selectedBoleta?.alimonados || 0"
                    :revolcados="selectedBoleta?.revolcados || 0"
                    :suma-r2="selectedBoleta?.sumaR2 || 0"
                    :total-danos-num="totalDanos"
                    :exportacion="selectedBoleta?.exportacion || 0"
                    :calibre="selectedBoleta?.calibre || ''"
                    :read-only="true"
                    :frijol-data-inicial="frijolDataInicial"
                    :camposConfig="camposConfigActual"
                  />

                  <!-- HUMEDAD -->
                  <div v-if="campoPantallaVisible('humedad')" class="q-mt-sm bg-cyan-1 q-pa-md rounded-borders text-center">
                    <div class="text-caption text-weight-bold text-grey-8">HUMEDAD</div>
                    <div class="text-h6 text-weight-bold text-cyan-9">
                      {{ selectedBoleta?.humedad || 0 }}%
                    </div>
                  </div>

                  <!-- CAMPOS PERSONALIZADOS -->
                  <q-card v-if="camposPersonalizadosVisibles.length > 0" bordered class="bg-white q-mt-sm">
                    <q-card-section class="q-gutter-sm">
                      <div
                        v-for="campo in camposPersonalizadosVisibles"
                        :key="campo.claveCampo"
                        class="row items-center justify-between"
                      >
                        <div class="col text-body2 text-grey-8 text-weight-medium">
                          {{ campo.nombreMostrar }}
                        </div>
                        <div class="col-auto">
                          <q-input
                            :model-value="datosPersonalizados[campo.claveCampo] || ''"
                            dense
                            outlined
                            readonly
                            bg-color="grey-2"
                            input-class="text-right"
                            style="width: 160px"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- FOTOS DEL ANÁLISIS -->
                  <div class="q-mt-md">
                    <div class="row items-center q-mb-sm">
                      <q-icon name="photo_camera" size="xs" class="q-mr-xs" />
                      <div class="text-caption text-weight-bold text-grey-8">
                        FOTOS DEL ANÁLISIS ({{ fotosAnalisis.length }})
                      </div>
                    </div>
                    <div v-if="fotosAnalisis.length > 0" class="row q-gutter-sm">
                      <div v-for="(foto, index) in fotosAnalisis" :key="index" class="col-6">
                        <div
                          class="rounded-borders cursor-pointer overflow-hidden bg-grey-3"
                          style="width: 100%; height: 150px; position: relative"
                          @click="mostrarFoto(foto)"
                        >
                          <img
                            :src="foto"
                            style="width: 100%; height: 100%; object-fit: cover; display: block"
                            @error="($event.target as HTMLImageElement).style.display = 'none'"
                          />
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-center q-pa-md bg-grey-2 rounded-borders">
                      <q-icon name="photo_camera" size="md" color="grey-5" />
                      <div class="text-caption text-grey-6 q-mt-sm">Sin fotos disponibles</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Panel derecho: PRECIO -->
          <div class="col-12 col-md-6">
            <q-card flat bordered>
              <q-card-section class="bg-orange-7 text-white q-pa-md">
                <div class="text-h6 text-weight-bold text-center">PRECIO</div>
              </q-card-section>

              <q-card-section class="q-pa-md scroll" style="max-height: 500px; overflow-y: auto">

                <!-- GARBANZO: precio/descuento editables -->
                <template v-if="esGarbanzo">
                  <!-- Modificar Precio -->
                  <div class="q-mb-md">
                    <div class="row items-center q-mb-xs">
                      <q-icon name="receipt" size="xs" color="blue-8" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Modificar Precio (opcional)</span>
                    </div>
                    <div class="row items-center q-gutter-sm">
                      <div class="text-h6 text-grey-7">$</div>
                      <q-input
                        v-model.number="precioManual"
                        type="number"
                        step="0.01"
                        min="0"
                        outlined
                        dense
                        class="col"
                        input-class="text-right text-h5 text-weight-bold"
                        :readonly="yaAutorizado"
                      />
                      <div class="text-body2 text-grey-6">/kg</div>
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      Precio calculado automáticamente: ${{ formatPrecio(selectedBoleta?.precioSugerido) }}/kg
                    </div>
                  </div>

                  <!-- Modificar Descuento -->
                  <div class="q-mb-md">
                    <div class="row items-center q-mb-xs">
                      <q-icon name="money_off" size="xs" color="orange-8" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Modificar Descuento (opcional)</span>
                    </div>
                    <div class="row items-center q-gutter-sm">
                      <q-input
                        v-model.number="descuentoManual"
                        type="number"
                        min="0"
                        outlined
                        dense
                        class="col"
                        input-class="text-right text-h5 text-weight-bold"
                        :readonly="yaAutorizado"
                      />
                      <div class="text-body2 text-grey-6">KG</div>
                    </div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      Descuento calculado automáticamente: {{ formatNumber(Math.round(selectedBoleta?.descuento || 0)) }}.00 KG
                    </div>
                  </div>

                  <!-- Tip -->
                  <q-banner dense rounded class="bg-yellow-1 text-orange-9 q-mb-md text-caption">
                    <template #avatar>
                      <q-icon name="lightbulb" color="orange-8" size="xs" />
                    </template>
                    Si subes el precio para beneficiar al productor, puedes aumentar el descuento para compensar el costo total.
                  </q-banner>

                  <!-- Justificación -->
                  <div v-if="!yaAutorizado" class="q-mb-md">
                    <div class="row items-center q-mb-xs">
                      <q-icon name="edit_note" size="xs" color="grey-8" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-grey-8">Justificación</span>
                    </div>
                    <q-input
                      v-model="justificacionModel"
                      type="textarea"
                      outlined
                      dense
                      placeholder="Explica el motivo del cambio de precio o descuento..."
                      :rows="3"
                      bg-color="white"
                    />
                  </div>

                  <!-- Autorizar -->
                  <div v-if="!yaAutorizado" class="text-center q-mt-sm">
                    <q-btn
                      color="orange-7"
                      unelevated
                      size="lg"
                      label="Autorizar"
                      class="text-weight-bold full-width"
                      @click="autorizar"
                    />
                  </div>
                </template>

                <!-- FRIJOL / OTROS: lista de precios P1-P27 / calibres -->
                <template v-else>
                  <q-list bordered separator class="rounded-borders">
                    <q-item
                      v-for="precio in precioOptions"
                      :key="precio.codigo"
                      :clickable="!yaAutorizado && !esCalibreManual(precio.codigo)"
                      v-ripple
                      :active="selectedPrecioModel === precio.codigo"
                      active-class="bg-orange-7 text-white"
                      :disable="yaAutorizado"
                      :class="{
                        'bg-green-1':
                          precio.codigo === selectedBoleta?.precioSugeridoCodigo &&
                          selectedPrecioModel !== precio.codigo,
                        'bg-blue-1':
                          !esCalibreManual(precio.codigo) &&
                          esPrecioSuperior(precio.codigo) && selectedPrecioModel !== precio.codigo,
                        'bg-red-1':
                          !esCalibreManual(precio.codigo) &&
                          esPrecioInferior(precio.codigo) && selectedPrecioModel !== precio.codigo,
                        'bg-amber-1':
                          esCalibreManual(precio.codigo) && selectedPrecioModel !== precio.codigo,
                      }"
                      @click="!yaAutorizado && !esCalibreManual(precio.codigo) && handlePrecioClick(precio.codigo)"
                    >
                      <q-item-section>
                        <q-item-label class="text-weight-bold">
                          {{ precio.codigo }}
                          <q-badge
                            v-if="precio.codigo === selectedBoleta?.precioSugeridoCodigo"
                            color="green"
                            class="q-ml-sm"
                            label="Sugerido"
                          />
                          <q-badge
                            v-else-if="esCalibreManual(precio.codigo)"
                            color="amber-8"
                            class="q-ml-sm"
                            label="Ingrese precio"
                          />
                          <q-badge
                            v-else-if="esPrecioSuperior(precio.codigo)"
                            color="blue"
                            class="q-ml-sm"
                            label="Requiere justificacion"
                          />
                          <q-badge
                            v-else-if="esPrecioInferior(precio.codigo)"
                            color="red"
                            class="q-ml-sm"
                            label="Precio inferior, doble click para seleccionar"
                          />
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <template v-if="esCalibreManual(precio.codigo)">
                          <q-input
                            v-model.number="precioCustom96"
                            dense
                            outlined
                            type="number"
                            step="0.01"
                            placeholder="$ Precio"
                            input-class="text-right text-weight-bold"
                            style="width: 120px"
                            :disable="yaAutorizado"
                            @update:model-value="() => { selectedPrecioModel = precio.codigo; }"
                          >
                            <template #prepend>
                              <span class="text-weight-bold">$</span>
                            </template>
                          </q-input>
                        </template>
                        <q-item-label v-else class="text-weight-bold">
                          {{ formatPrecioMiles(precio.valor) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </template>

              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- DESGLOSE PRECIO POR CLASIFICACIÓN — ancho completo dentro del scroll, visible al llegar abajo -->
        <q-card v-if="esGarbanzo && desglosePrecio.length > 0" flat bordered class="bg-blue-1 q-mt-md">
          <q-card-section class="q-pa-sm q-px-md">
            <div class="row items-center q-mb-xs">
              <q-icon name="table_chart" size="sm" color="blue-8" class="q-mr-sm" />
              <span class="text-subtitle2 text-weight-bold text-blue-9">DESGLOSE DEL PRECIO POR CLASIFICACIÓN</span>
            </div>
            <div class="row q-col-gutter-lg items-center">
              <div v-for="d in desglosePrecio" :key="d.label" class="col-auto">
                <span class="text-grey-8 text-body2">{{ d.label }} (${{ d.precio.toFixed(2) }}/kg) × {{ d.pct.toFixed(2) }}%:</span>
                <span class="text-weight-bold text-blue-9 q-ml-xs">${{ ((d.pct / 100) * d.precio).toFixed(2) }}/kg</span>
              </div>
              <q-separator vertical inset />
              <div class="col-auto">
                <span class="text-body2 text-weight-bold">PRECIO TOTAL:</span>
                <span class="text-h6 text-weight-bold text-blue-9 q-ml-xs">${{ precioTotalDesglose.toFixed(2) }}/kg</span>
              </div>
            </div>
          </q-card-section>
        </q-card>

      </q-card-section>

      <q-separator />

      <!-- Justificación (solo visible para frijol/otros cuando se selecciona un precio MAYOR al sugerido) -->
      <q-card-section v-if="!esGarbanzo && requiereJustificacion" class="q-pa-md bg-orange-1">
        <div class="text-caption text-weight-bold q-mb-sm text-orange-9">
          <q-icon name="warning" size="xs" class="q-mr-xs" />
          JUSTIFICACION REQUERIDA
          <span class="text-red">*</span>
        </div>
        <div class="text-caption text-orange-8 q-mb-sm">
          Esta autorizando un precio MAYOR al sugerido ({{ selectedBoleta?.precioSugeridoCodigo }}).
          Por favor justifique esta decision.
        </div>
        <q-input
          v-model="justificacionModel"
          type="textarea"
          outlined
          dense
          placeholder="Debe justificar por que selecciona un precio superior al sugerido..."
          :rows="2"
          bg-color="white"
          :rules="[
            (val) =>
              (!!val && val.trim().length >= 10) ||
              'La justificacion debe tener al menos 10 caracteres',
          ]"
          :error="!justificacionModel || justificacionModel.trim().length < 10"
          error-message="Justificacion requerida (minimo 10 caracteres)"
        />
      </q-card-section>

      <q-separator />

      <!-- Acciones (solo frijol/otros — garbanzo tiene el botón dentro del panel derecho) -->
      <q-card-actions v-if="!esGarbanzo && !yaAutorizado" class="q-pa-md bg-grey-2" align="center">
        <q-btn
          v-if="props.modo === 'renegociar'"
          color="negative"
          unelevated
          size="lg"
          label="Rechazar"
          icon="close"
          class="text-weight-bold q-mr-md"
          style="min-width: 200px"
          @click="emit('rechazar')"
        />
        <q-btn
          color="orange-7"
          unelevated
          size="lg"
          label="Autorizar"
          class="text-weight-bold"
          style="min-width: 200px"
          @click="autorizar"
        />
      </q-card-actions>
      <!-- Indicador de ya autorizado -->
      <q-card-section v-else class="q-pa-md bg-green-1 text-center">
        <q-icon name="check_circle" color="green" size="sm" class="q-mr-sm" />
        <span class="text-weight-bold text-green-9">
          Este precio ya fue autorizado ({{ selectedBoleta?.estatus }})
        </span>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { BoletaPrecio } from 'src/types/precio';
import TablaAnalisisDesplegable from 'src/pages/analisis/TablaAnalisisDesplegable.vue';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';

interface CampoConfig {
  claveCampo: string;
  visible: boolean;
  nombreMostrar?: string;
  granoId: number | null;
}

type PrecioItem = { codigo: string; valor: number };
type TablaCalibreItem = { calibre: string; descuento_kg_ton: number };

interface Props {
  modelValue: boolean;
  selectedBoleta: BoletaPrecio | null;
  selectedPrecio: string;
  justificacion: string;
  calcularPreciosDisponibles: () => PrecioItem[];
  precioBaseUSD: string;
  tipoCambioFIX: string;
  tablaCalibre: TablaCalibreItem[];
  modo?: 'autorizar' | 'renegociar';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'update:selectedPrecio', v: string): void;
  (e: 'update:justificacion', v: string): void;
  (e: 'close'): void;
  (e: 'autorizar', precioCustom?: number, descuentoCustom?: number): void;
  (e: 'rechazar'): void;
}>();

const $q = useQuasar();
const authStore = useAuthStore();
const fotoAmpliadaUrl = ref('');

const GARBANZO_ID = 4;
const esGarbanzo = computed(() => (props.selectedBoleta?.granoId ?? 0) === GARBANZO_ID);

interface ClasificacionPrecio {
  codigo: string;
  nombre: string;
  precioKg: number;
}

const clasificacionesPrecios = ref<ClasificacionPrecio[]>([]);
const precioManual = ref<number | string>('');
const descuentoManual = ref<number | string>('');

async function cargarClasificaciones() {
  try {
    const sedeId = authStore.sedeActivaId ?? 0;
    const { data } = await api.get('/api/precios-clasificacion', {
      params: { sedeId, granoId: GARBANZO_ID },
    });
    clasificacionesPrecios.value = Array.isArray(data) ? data : [];
  } catch {
    // silently fail
  }
}

const desglosePrecio = computed(() => {
  if (!esGarbanzo.value || clasificacionesPrecios.value.length === 0) return [];
  const datos = datosPersonalizados.value;
  const expPct  = parseFloat(String(datos.exportacion ?? '0')) || 0;
  const cal1Pct = parseFloat(String(datos.cal_1 ?? '0')) || 0;
  const cal2Pct = parseFloat(String(datos.cal_2 ?? '0')) || 0;
  const map = new Map(clasificacionesPrecios.value.map(c => [c.codigo, c.precioKg]));
  return [
    { label: 'CAL. EXP', precio: map.get('CAL_EXP') ?? 0, pct: expPct },
    { label: 'CAL 1',    precio: map.get('CAL_1') ?? 0,   pct: cal1Pct },
    { label: 'CAL 2',    precio: map.get('CAL_2') ?? 0,   pct: cal2Pct },
  ];
});

const precioTotalDesglose = computed(() =>
  desglosePrecio.value.reduce((sum, d) => sum + (d.pct / 100) * d.precio, 0),
);

const camposAnalisisConfig = ref<CampoConfig[]>([]);

const camposConfigActual = computed(() => {
  const granoId = props.selectedBoleta?.granoId ?? null;
  return camposAnalisisConfig.value.filter(c => c.granoId === granoId);
});

function campoPantallaVisible(clave: string): boolean {
  if (camposConfigActual.value.length === 0) return true;
  const cfg = camposConfigActual.value.find(c => c.claveCampo === clave);
  return !cfg || cfg.visible;
}

const CAMPOS_PREDEFINIDOS = new Set([
  'calibre', 'humedad', 'impurezas', 'r1', 'r2', 'cafesLisos', 'manchados',
  'quebMxc', 'helados', 'alimonados', 'revolcados', 'exportacion',
  'frijol_impurezas', 'frijol_piedras', 'frijol_mitades', 'frijol_oscuros',
  'frijol_arrugados', 'frijol_manchados', 'frijol_verdes', 'frijol_tierra',
  'frijol_otras_variedades', 'frijol_granos_pequenos', 'frijol_danos_campo',
  'frijol_plaga_viva', 'frijol_plaga_muerta',
]);

const camposPersonalizadosVisibles = computed(() =>
  camposConfigActual.value.filter(c => c.visible && !CAMPOS_PREDEFINIDOS.has(c.claveCampo))
);

const datosPersonalizados = computed<Record<string, string>>(() => {
  const raw = props.selectedBoleta?.datosAdicionales;
  if (!raw) return {};
  try {
    const datos = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return datos as Record<string, string>;
  } catch {
    return {};
  }
});

async function cargarConfigCampos() {
  try {
    const sedeId = authStore.sedeActivaId ?? 0;
    const { data } = await api.get<{ campos: (CampoConfig & { pantalla: string })[] }>(
      '/api/configuracion-recepcion',
      { params: { sedeId } },
    );
    camposAnalisisConfig.value = (data.campos ?? [])
      .filter(c => c.pantalla === 'ANALISIS')
      .map(c => ({ ...c, visible: !!c.visible, granoId: c.granoId ?? null }));
  } catch {
    // Si falla, se muestran todos los campos
  }
}

onMounted(() => {
  void cargarConfigCampos();
});

watch(() => authStore.sedeActivaId, () => {
  void cargarConfigCampos();
});

// Inicializar precio/descuento manuales y cargar clasificaciones cuando cambia la boleta
watch(() => props.selectedBoleta, (b) => {
  if (!b) return;
  precioManual.value = b.precioSugerido ?? '';
  descuentoManual.value = Math.round(b.descuento || 0);
  if ((b.granoId ?? 0) === GARBANZO_ID) void cargarClasificaciones();
}, { immediate: true });
const precioInferiorClickPendiente = ref<string | null>(null);
const precioInferiorTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const precioCustom96 = ref<number | string>('');

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

const totalDanos = computed(() => {
  const imp = Number(props.selectedBoleta?.impurezas || 0);
  const r1 = Number(props.selectedBoleta?.r1 || 0);
  const r2 = Number(props.selectedBoleta?.sumaR2 || 0);
  return Math.round(imp + r1 + r2);
});

const frijolDataInicial = computed(() => {
  const raw = props.selectedBoleta?.datosAdicionales;
  if (!raw) return undefined;
  try {
    const datos = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return datos.frijol_datos || undefined;
  } catch {
    return undefined;
  }
});

const precioOptions = computed(() => {
  const precios = props.calcularPreciosDisponibles ? props.calcularPreciosDisponibles() : [];
  return precios;
});

const yaAutorizado = computed(() => {
  const est = props.selectedBoleta?.estatus;
  return est === 'Precio Autorizado' || est === 'Precio Autorizado CG' || est === 'Autorizado CC';
});

// Determinar si la boleta es de Frijol
const esFrijol = computed(() => {
  return props.selectedBoleta?.tipoGrano === 'Frijol';
});

// Verificar si un calibre requiere precio manual (> 96 para frijol)
function esCalibreManual(codigo: string): boolean {
  return esFrijol.value && (codigo.includes('> 96') || codigo.includes('>96') || codigo.toLowerCase().includes('mayor 96'));
}

// Obtener el número de nivel del código del precio sugerido (P1 = 1, P2 = 2, etc.)
function getNivelFromCodigo(codigo: string | null | undefined): number {
  if (!codigo) return 999;
  const match = codigo.match(/P(\d+)/);
  return match && match[1] ? parseInt(match[1], 10) : 999;
}

// Obtener el valor del precio para un código dado (para frijol = calibre)
function getValorPrecio(codigo: string): number {
  const precios = props.calcularPreciosDisponibles ? props.calcularPreciosDisponibles() : [];
  const encontrado = precios.find((p) => p.codigo === codigo);
  return encontrado ? encontrado.valor : 0;
}

// Verificar si un precio es SUPERIOR al sugerido
function esPrecioSuperior(codigo: string): boolean {
  const codigoSugerido = props.selectedBoleta?.precioSugeridoCodigo;
  if (esFrijol.value) {
    // Para frijol: comparar por valor monetario (mayor valor = precio superior)
    if (codigo === codigoSugerido) return false;
    return getValorPrecio(codigo) > getValorPrecio(codigoSugerido || '');
  }
  const nivelSugerido = getNivelFromCodigo(codigoSugerido);
  const nivelPrecio = getNivelFromCodigo(codigo);
  return nivelPrecio < nivelSugerido;
}

// Verificar si un precio es INFERIOR al sugerido
function esPrecioInferior(codigo: string): boolean {
  const codigoSugerido = props.selectedBoleta?.precioSugeridoCodigo;
  if (esFrijol.value) {
    // Para frijol: comparar por valor monetario (menor valor = precio inferior)
    if (codigo === codigoSugerido) return false;
    return getValorPrecio(codigo) < getValorPrecio(codigoSugerido || '');
  }
  const nivelSugerido = getNivelFromCodigo(codigoSugerido);
  const nivelPrecio = getNivelFromCodigo(codigo);
  return nivelPrecio > nivelSugerido;
}

// Manejar selección de precio con validación
function handlePrecioClick(codigo: string) {
  // Si es el precio sugerido, seleccionar directamente
  if (codigo === props.selectedBoleta?.precioSugeridoCodigo) {
    selectedPrecioModel.value = codigo;
    precioInferiorClickPendiente.value = null;
    return;
  }

  // Si es un precio INFERIOR al sugerido, requiere doble click
  if (esPrecioInferior(codigo)) {
    if (precioInferiorClickPendiente.value === codigo) {
      // Segundo click: permitir selección
      selectedPrecioModel.value = codigo;
      precioInferiorClickPendiente.value = null;
      if (precioInferiorTimer.value) {
        clearTimeout(precioInferiorTimer.value);
        precioInferiorTimer.value = null;
      }
      return;
    }

    // Primer click: esperar segundo click para confirmar
    precioInferiorClickPendiente.value = codigo;

    // Resetear después de 3 segundos
    if (precioInferiorTimer.value) clearTimeout(precioInferiorTimer.value);
    precioInferiorTimer.value = setTimeout(() => {
      precioInferiorClickPendiente.value = null;
      precioInferiorTimer.value = null;
    }, 3000);
    return;
  }

  // Si es un precio SUPERIOR, seleccionar (la justificación se pide aparte)
  selectedPrecioModel.value = codigo;
  precioInferiorClickPendiente.value = null;
}

// Formatear precio en miles (17400 -> 17.4)
// function formatPrecioMiles(valor: number): string {
//   // Si el valor es mayor a 1000, asumimos que viene de la base de datos sin procesar
//   // Si ya es pequeño (como 14.21), lo dejamos igual.
//   const valorNormalizado = valor > 1000 ? valor / 1000 : valor;

//   return `$${valorNormalizado.toFixed(2)}`;
// }

function formatPrecio(v: number | string | null | undefined): string {
  if (v === null || v === undefined) return '0.00';
  let num = Number(v);

  // Si el valor es mayor a 1000, es que viene de la base de datos sin dividir por 1000
  if (num > 1000) {
    num = num / 1000;
  }

  return num.toFixed(2);
}

function formatPrecioMiles(valor: number): string {
  // Esta función es para la lista de la derecha
  const num = valor > 1000 ? valor / 1000 : valor;
  return `$${num.toFixed(2)}`;
}

// Determinar si requiere justificación (cuando el precio seleccionado es MAYOR al sugerido)
const requiereJustificacion = computed(() => {
  // Requiere justificación cuando selecciona un precio SUPERIOR al sugerido
  return esPrecioSuperior(selectedPrecioModel.value);
});

// Extraer fotos del análisis desde datosAdicionales
const fotosAnalisis = computed(() => {
  const datosAdicionales = props.selectedBoleta?.datosAdicionales;
  if (!datosAdicionales) return [];

  try {
    const datos =
      typeof datosAdicionales === 'string' ? JSON.parse(datosAdicionales) : datosAdicionales;

    // Las fotos pueden estar en datos.fotos o datos.fotos_analisis
    const fotos = datos.fotos || datos.fotos_analisis || [];
    return Array.isArray(fotos) ? fotos : [];
  } catch {
    return [];
  }
});

function mostrarFoto(url: string): void {
  fotoAmpliadaUrl.value = url;
  $q.dialog({
    title: 'Foto del Análisis',
    message: `<img src="${url}" style="max-width: 100%; max-height: 80vh;" />`,
    html: true,
    ok: 'Cerrar',
    cancel: false,
    persistent: false,
    style: 'max-width: 90vw',
  });
}

function formatNumber(v: number | string | null | undefined): string {
  if (v === null || v === undefined) return '0.00';
  const num = Number(v);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}

// Función específica para formatear precios (divide entre 1000: 17400 -> 17.4)
// function formatPrecio(v: number | string | null | undefined): string {
//   if (v === null || v === undefined) return '0.00';
//   const num = Number(v) / 1000;
//   if (isNaN(num)) return '0.00';
//   return num.toFixed(2);
// }

function formatFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return 'N/A';
  try {
    const date = new Date(fecha);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(fecha);
  }
}

function emitClose(): void {
  emit('update:modelValue', false);
  emit('close');
}

function autorizar(): void {
  // Garbanzo: validar justificación si precio o descuento es mayor al original
  if (esGarbanzo.value) {
    const precio = Number(precioManual.value) || 0;
    const descuento = Number(descuentoManual.value) || undefined;
    const precioOriginal = Number(props.selectedBoleta?.precioSugerido) || 0;
    const descuentoOriginal = Math.round(Number(props.selectedBoleta?.descuento) || 0);
    const necesitaJustificacion = precio > precioOriginal || (descuento !== undefined && descuento > descuentoOriginal);
    if (necesitaJustificacion) {
      const justif = justificacionModel.value?.trim() || '';
      if (justif.length < 10) {
        $q.notify({
          type: 'warning',
          message: 'Debe justificar el motivo cuando el precio o descuento es mayor al original (mínimo 10 caracteres).',
          position: 'top',
          timeout: 4000,
        });
        return;
      }
    }
    emit('autorizar', precio, descuento);
    return;
  }

  // Validar calibre > 96: debe tener precio ingresado
  if (esFrijol.value && esCalibreManual(selectedPrecioModel.value)) {
    const val = Number(precioCustom96.value);
    if (!val || val <= 0) {
      $q.notify({
        type: 'warning',
        message: 'Debe ingresar un precio válido para el calibre > 96.',
        position: 'top',
        timeout: 4000,
      });
      return;
    }
  }
  // Validar que si requiere justificación, esta esté completa
  if (requiereJustificacion.value) {
    const justificacion = justificacionModel.value?.trim() || '';
    if (justificacion.length < 10) {
      $q.notify({
        type: 'warning',
        message:
          'Debe proporcionar una justificación de al menos 10 caracteres para autorizar un precio superior al sugerido.',
        position: 'top',
        timeout: 4000,
      });
      return;
    }
  }
  // Pasar precio custom si es calibre > 96
  const custom = esCalibreManual(selectedPrecioModel.value) ? Number(precioCustom96.value) : undefined;
  emit('autorizar', custom);
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 4px;
}

.modal-card-precio {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
}
</style>

<style>
/* Efecto blur en el backdrop del modal */
.modal-precio .q-dialog__backdrop {
  backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.5) !important;
}
</style>
