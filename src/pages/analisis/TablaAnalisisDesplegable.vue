<template>
  <div class="q-gutter-sm">
    <!-- ===================== TABLA FRIJOL (grano_id === 1) ===================== -->
    <template v-if="tipoGranoId === 1">
      <q-card bordered class="bg-white">
        <q-card-section>
          <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-sm">
            Resultados de Daño - Frijol
          </div>
          <q-markup-table flat bordered dense separator="cell" class="frijol-table">
            <thead>
              <tr class="bg-grey-3">
                <th class="text-left text-weight-bold">Daño</th>
                <th class="text-center text-weight-bold" style="width: 120px">Peso Grs</th>
                <th class="text-center text-weight-bold" style="width: 100px">%</th>
                <th class="text-center text-weight-bold" style="width: 120px">Color</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in frijolRowsVisibles"
                :key="(row.clave ?? row.nombre) + idx"
                :class="{ 'bg-amber-1 text-weight-bold': row.esTotal }"
              >
                <td class="text-body2" :class="{ 'text-weight-bold': row.esTotal }">
                  {{ row.esTotal ? '* TOTAL *' : row.nombre }}
                </td>
                <td class="text-center">
                  <template v-if="!row.esTotal && !row.esPlaga">
                    <q-input
                      dense
                      outlined
                      type="number"
                      step="0.01"
                      :model-value="displayNumber(row.pesoGrs)"
                      @update:model-value="(v) => onFrijolChange(idx, 'pesoGrs', v)"
                      :readonly="readOnly"
                      input-class="text-right"
                      style="width: 100px; margin: 0 auto"
                      placeholder="0.00"
                    />
                  </template>
                  <template v-else-if="row.esPlaga">
                    <q-input
                      dense
                      outlined
                      type="number"
                      step="1"
                      min="0"
                      :model-value="row.plagaValor"
                      @update:model-value="(v) => onFrijolChange(idx, 'plagaValor', v)"
                      :readonly="readOnly"
                      input-class="text-right"
                      style="width: 90px; margin: 0 auto"
                      placeholder="0"
                    />
                  </template>
                  <template v-else-if="row.esTotal">
                    <span class="text-weight-bold">{{ totalPesoGrs.toFixed(2) }}</span>
                  </template>
                </td>
                <td class="text-center">
                  <template v-if="!row.esTotal && !row.esPlaga">
                    <q-input
                      dense
                      outlined
                      type="number"
                      step="0.01"
                      :model-value="displayNumber(row.porcentaje)"
                      @update:model-value="(v) => onFrijolChange(idx, 'porcentaje', v)"
                      :readonly="readOnly"
                      input-class="text-right"
                      style="width: 80px; margin: 0 auto"
                      placeholder="0.00"
                    />
                  </template>
                  <template v-else-if="row.esTotal">
                    <span class="text-weight-bold">{{ totalPorcentaje.toFixed(2) }}%</span>
                  </template>
                </td>
                <td class="text-center">
                  <template v-if="row.colorOpciones">
                    <div style="display: flex; flex-direction: column; align-items: flex-start; margin: 0 auto; width: fit-content">
                      <label
                        v-for="opt in opcionesColor"
                        :key="opt.value"
                        class="color-radio-option cursor-pointer"
                        :class="{ 'color-radio-selected': row.color === opt.value }"
                        style="display: flex; align-items: center; gap: 4px; padding: 1px 6px; margin: 0"
                      >
                        <q-radio
                          dense
                          :model-value="row.color"
                          :val="opt.value"
                          @update:model-value="(v) => onFrijolChange(idx, 'color', v)"
                          :disable="readOnly"
                          :color="getColorBadge(opt.value)"
                          size="xs"
                        />
                        <q-badge
                          :color="getColorBadge(opt.value)"
                          rounded
                          style="width: 10px; height: 10px; min-width: 10px"
                        />
                        <span
                          class="text-caption text-weight-bold"
                          :style="{ color: `var(--q-${getColorBadge(opt.value)})` }"
                        >{{ opt.label }}</span>
                      </label>
                    </div>
                  </template>
                  <template v-else-if="row.color && !row.esPlaga && !row.esTotal">
                    <div class="row items-center justify-center q-gutter-xs">
                      <q-badge
                        :color="getColorBadge(row.color)"
                        rounded
                        style="width: 12px; height: 12px; min-width: 12px"
                      />
                      <span
                        class="text-caption text-weight-bold"
                        :style="{ color: `var(--q-${getColorBadge(row.color)})` }"
                      >{{ row.color }}</span>
                    </div>
                  </template>
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>
    </template>

    <!-- ===================== TABLA NORMAL (otros granos) ===================== -->
    <template v-else>
      <!-- TOTAL DE DAÑOS - Desplegable -->
      <q-card bordered class="bg-white">
        <q-item clickable v-ripple @click="expandidoTotalDanos = !expandidoTotalDanos">
          <q-item-section avatar>
            <q-icon :name="expandidoTotalDanos ? 'expand_more' : 'chevron_right'" size="sm" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium text-grey-9">TOTAL DE DAÑOS</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="text-weight-bold text-subtitle1 text-grey-9">
              {{ Math.round(totalDanosNum) }}%
            </div>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-slide-transition>
          <div v-show="expandidoTotalDanos" class="q-pa-md bg-grey-1 q-gutter-md">
            <!-- Impurezas -->
            <div v-if="campoVisible('impurezas')" class="row items-center justify-between q-col-gutter-md">
              <div class="col">
                <div class="text-body2 text-grey-8 text-weight-medium">
                  {{ campoLabel('impurezas', 'Impurezas') }} <span class="text-negative">*</span>
                </div>
              </div>
              <div class="col-auto row items-center q-gutter-xs">
                <q-input
                  dense
                  outlined
                  type="number"
                  step="0.01"
                  :model-value="displayNumber(impurezas)"
                  @update:model-value="(v) => emitInput('impurezas', v)"
                  :readonly="readOnly"
                  input-class="text-right"
                  style="width: 110px"
                  placeholder="0.00"
                />
                <div class="text-caption text-grey-7" style="width: 14px">%</div>
              </div>
            </div>

            <!-- R1 -->
            <div v-if="campoVisible('r1')" class="row items-center justify-between q-col-gutter-md">
              <div class="col">
                <div class="text-body2 text-grey-8 text-weight-medium">{{ campoLabel('r1', 'R1') }}</div>
              </div>
              <div class="col-auto row items-center q-gutter-xs">
                <q-input
                  dense
                  outlined
                  type="number"
                  step="0.01"
                  :model-value="displayNumber(r1)"
                  @update:model-value="(v) => emitInput('r1', v)"
                  :readonly="readOnly"
                  input-class="text-right"
                  style="width: 110px"
                  placeholder="0.00"
                />
                <div class="text-caption text-grey-7" style="width: 14px">%</div>
              </div>
            </div>

            <q-card bordered class="bg-white">
              <q-item
                clickable
                v-ripple
                @click="expandidoSumaR2 = !expandidoSumaR2"
                class="q-py-xs bg-grey-1"
              >
                <q-item-section avatar>
                  <q-icon :name="expandidoSumaR2 ? 'expand_more' : 'chevron_right'" size="xs" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-body2 text-weight-medium text-grey-9">
                    Suma de R2
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="text-body2 text-weight-bold text-primary">
                    {{ sumaR2.toFixed(2) }}%
                  </div>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-slide-transition>
                <div v-show="expandidoSumaR2">
                  <q-list separator class="bg-white">
                    <q-item
                      v-for="campo in [
                        { key: 'r2', label: 'R2' },
                        { key: 'cafesLisos', label: 'Cafés y Lisos' },
                        { key: 'manchados', label: 'Manchados' },
                        { key: 'quebMxc', label: 'Queb/Mxc' },
                        { key: 'helados', label: 'Helados' },
                        { key: 'alimonados', label: 'Alimonados' },
                        { key: 'revolcados', label: 'Revolcados' },
                      ].filter(c => campoVisible(c.key))"
                      :key="campo.key"
                      class="q-py-xs"
                    >
                      <q-item-section>
                        <q-item-label
                          class="text-grey-8 text-caption text-uppercase text-weight-medium"
                        >
                          {{ campoLabel(campo.key, campo.label) }}
                        </q-item-label>
                      </q-item-section>

                      <q-item-section side>
                        <q-input
                          dense
                          outlined
                          type="number"
                          step="0.01"
                          style="width: 110px"
                          input-class="text-right"
                          :model-value="displayNumber((props as any)[campo.key])"
                          @update:model-value="(v) => emitInput(campo.key, v)"
                          :readonly="readOnly"
                        >
                          <template v-slot:append>
                            <span class="text-caption text-grey-6">%</span>
                          </template>
                        </q-input>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </q-slide-transition>
            </q-card>
          </div>
        </q-slide-transition>
      </q-card>

      <!-- EXPORTACIÓN (Solo Lectura - Calculado) -->
      <q-card v-if="campoVisible('exportacion')" bordered class="bg-green-1" style="border-width: 2px">
        <q-card-section class="row items-center justify-between q-pa-sm">
          <div class="text-subtitle2 text-green-10 text-weight-bold">{{ campoLabel('exportacion', 'EXPORTACIÓN') }}</div>
          <div class="text-h5 text-green-9 text-weight-bold">{{ exportacion.toFixed(2) }}%</div>
        </q-card-section>
      </q-card>

      <!-- CALIBRE (Opcional - Solo si se proporciona) -->
      <q-card v-if="calibre && campoVisible('calibre')" bordered class="bg-blue-1" style="border-width: 2px">
        <q-card-section class="row items-center justify-between q-pa-sm">
          <div class="text-subtitle2 text-blue-10 text-weight-bold">{{ campoLabel('calibre', 'CALIBRE') }}</div>
          <div class="text-subtitle1 text-blue-9 text-weight-bold">
            {{ calibre }}
          </div>
        </q-card-section>
      </q-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue';

interface FrijolRow {
  clave?: string;
  nombre: string;
  pesoGrs: number | string;
  porcentaje: number | string;
  color: string;
  colorOpciones: boolean;
  esTotal: boolean;
  esPlaga: boolean;
  plagaValor: string;
}

interface CampoConfig {
  claveCampo: string;
  visible: boolean;
  nombreMostrar?: string;
}

interface Props {
  r2: string | number;
  cafesLisos: string | number;
  manchados: string | number;
  quebMxc: string | number;
  helados: string | number;
  alimonados: string | number;
  revolcados: string | number;
  sumaR2: number;
  totalDanosNum: number;
  exportacion: number;
  impurezas: string | number;
  r1: string | number;
  calibre?: string;
  readOnly?: boolean;
  tipoGranoId?: number;
  frijolDataInicial?: FrijolRow[];
  camposConfig?: CampoConfig[];
}

const props = withDefaults(defineProps<Props>(), {
  tipoGranoId: 2,
  camposConfig: () => [],
});

// Helper: true si el campo es visible según config (si no hay config, muestra todo)
function campoVisible(clave: string): boolean {
  if (!props.camposConfig || props.camposConfig.length === 0) return true;
  const cfg = props.camposConfig.find(c => c.claveCampo === clave);
  return !cfg || cfg.visible;
}

// Helper: etiqueta del campo (usa nombreMostrar de config si existe)
function campoLabel(clave: string, labelBase: string): string {
  if (!props.camposConfig || props.camposConfig.length === 0) return labelBase;
  const cfg = props.camposConfig.find(c => c.claveCampo === clave);
  return cfg?.nombreMostrar || labelBase;
}

const emit = defineEmits<{
  (e: 'input-change', campo: string, valor: string): void;
  (e: 'frijol-data-change', data: FrijolRow[]): void;
}>();

const expandidoTotalDanos = ref(true);
const expandidoSumaR2 = ref(true);

// --- Opciones de color para Frijol ---
const opcionesColor = [
  { value: 'MB', label: 'MB' },
  { value: 'B', label: 'B' },
  { value: 'R', label: 'R' },
];

function getColorBadge(val: string): string {
  if (val === 'MB') return 'green';
  if (val === 'B') return 'blue';
  if (val === 'R') return 'red';
  return 'grey';
}

// --- Datos de Frijol ---
const frijolRowsDefault: FrijolRow[] = [
  { clave: 'frijol_impurezas',        nombre: 'Impurezas (Palo, Paja, Etc)', pesoGrs: '', porcentaje: '', color: 'MB', colorOpciones: true,  esTotal: false, esPlaga: false, plagaValor: '' },
  { clave: 'frijol_piedras',          nombre: 'Piedras y Terron',             pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: false, esPlaga: false, plagaValor: '' },
  { clave: 'frijol_mitades',          nombre: 'MITADES Y QUEBRADOS',          pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: false, esPlaga: false, plagaValor: '' },
  { clave: 'frijol_oscuros',          nombre: 'OSCUROS/CAFES',                pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: false, esPlaga: false, plagaValor: '' },
  { clave: 'frijol_arrugados',        nombre: 'ARRUGADOS/AMPOLLADOS',         pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: false, esPlaga: false, plagaValor: '' },
  { clave: 'frijol_manchados',        nombre: 'MANCHADOS',                    pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: false, esPlaga: false, plagaValor: '' },
  { clave: 'frijol_verdes',           nombre: 'VERDES',                       pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: false, esPlaga: false, plagaValor: '' },
  { clave: 'frijol_tierra',           nombre: 'TIERRA PEGADA',                pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: false, esPlaga: false, plagaValor: '' },
  { clave: 'frijol_otras_variedades', nombre: 'OTRAS VARIEDADES AFINES',      pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: false, esPlaga: false, plagaValor: '' },
  { clave: 'frijol_granos_pequenos',  nombre: 'GRANOS PEQUEÑOS',              pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: false, esPlaga: false, plagaValor: '' },
  { clave: 'frijol_danos_campo',      nombre: 'DAÑOS CAMPO',                  pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: false, esPlaga: false, plagaValor: '' },
  { clave: '_total',                  nombre: 'TOTAL',                        pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: true,  esPlaga: false, plagaValor: '' },
  { clave: 'frijol_plaga_viva',       nombre: 'PLAGA VIVA',                   pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: false, esPlaga: true,  plagaValor: '' },
  { clave: 'frijol_plaga_muerta',     nombre: 'PLAGA MUERTA',                 pesoGrs: '', porcentaje: '', color: '',   colorOpciones: false, esTotal: false, esPlaga: true,  plagaValor: '' },
];

const frijolRows = reactive<FrijolRow[]>(frijolRowsDefault.map((r) => ({ ...r })));

// Filas de frijol filtradas por config (las filas especiales siempre se muestran)
const frijolRowsVisibles = computed(() =>
  frijolRows.filter(r => r.esTotal || r.esPlaga || !r.clave || campoVisible(r.clave))
);

// Cargar datos iniciales si se proporcionan
watch(
  () => props.frijolDataInicial,
  (data) => {
    if (data && data.length > 0) {
      data.forEach((item, idx) => {
        if (frijolRows[idx]) {
          frijolRows[idx].pesoGrs = item.pesoGrs ?? '';
          frijolRows[idx].porcentaje = item.porcentaje ?? '';
          if (item.color) frijolRows[idx].color = item.color;
          if (item.plagaValor !== undefined) frijolRows[idx].plagaValor = item.plagaValor;
        }
      });
    }
  },
  { immediate: true },
);

// Totales calculados para frijol
const totalPesoGrs = computed(() => {
  return frijolRows
    .filter((r) => !r.esTotal)
    .reduce((sum, r) => {
      const n = typeof r.pesoGrs === 'number' ? r.pesoGrs : parseFloat(String(r.pesoGrs));
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
});

const totalPorcentaje = computed(() => {
  return frijolRows
    .filter((r) => !r.esTotal)
    .reduce((sum, r) => {
      const n = typeof r.porcentaje === 'number' ? r.porcentaje : parseFloat(String(r.porcentaje));
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
});

function onFrijolChange(visibleIdx: number, field: 'pesoGrs' | 'porcentaje' | 'color' | 'plagaValor', value: unknown) {
  // Traducimos el índice visible al índice real en frijolRows
  const clave = frijolRowsVisibles.value[visibleIdx]?.clave;
  if (!clave) return;
  const realIdx = frijolRows.findIndex(r => r.clave === clave);
  const row = realIdx >= 0 ? frijolRows[realIdx] : undefined;
  if (!row) return;
  const safeValue = typeof value === 'string' || typeof value === 'number' ? value : '';
  (row as Record<string, unknown>)[field] = safeValue;
  emit(
    'frijol-data-change',
    frijolRows.map((r) => ({ ...r })),
  );
}

// --- Lógica normal (granos que no son frijol) ---
const totalDanosNum = computed(() => {
  const v = props.totalDanosNum;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
});

function emitInput(campo: string, v: unknown) {
  const safeValue = typeof v === 'string' || typeof v === 'number' ? String(v) : '';
  emit('input-change', campo, safeValue);
}

function displayNumber(val: string | number | undefined | null): number | string {
  if (val === '' || val === undefined || val === null) return '';
  const n = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(n) ? '' : n;
}
</script>

<style scoped>
.frijol-table th {
  font-size: 0.8rem;
  padding: 6px 8px;
}
.frijol-table td {
  padding: 4px 8px;
  vertical-align: middle;
}
.color-radio-option {
  padding: 2px 4px;
  border-radius: 6px;
  transition: background-color 0.15s;
}
.color-radio-option:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
.color-radio-selected {
  background-color: rgba(0, 0, 0, 0.08);
}
</style>
