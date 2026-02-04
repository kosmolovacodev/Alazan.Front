<template>
  <div class="q-gutter-sm">

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
            {{ totalDanosNum.toFixed(2) }}%
          </div>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="expandidoTotalDanos" class="q-pa-md bg-grey-1 q-gutter-md">

          <!-- Impurezas -->
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col">
              <div class="text-body2 text-grey-8 text-weight-medium">
                Impurezas <span class="text-negative">*</span>
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
                style="width: 110px;"
                placeholder="0.00"
              />
              <div class="text-caption text-grey-7" style="width: 14px;">%</div>
            </div>
          </div>

          <!-- R1 -->
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col">
              <div class="text-body2 text-grey-8 text-weight-medium">R1</div>
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
                style="width: 110px;"
                placeholder="0.00"
              />
              <div class="text-caption text-grey-7" style="width: 14px;">%</div>
            </div>
          </div>

<q-card bordered class="bg-white">
  <q-item clickable v-ripple @click="expandidoSumaR2 = !expandidoSumaR2" class="q-py-xs bg-grey-1">
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

        <q-item v-for="campo in [
          { key: 'r2', label: 'R2' },
          { key: 'cafesLisos', label: 'Cafés y Lisos' },
          { key: 'manchados', label: 'Manchados' },
          { key: 'quebMxc', label: 'Queb/Mxc' },
          { key: 'helados', label: 'Helados' },
          { key: 'alimonados', label: 'Alimonados' },
          { key: 'revolcados', label: 'Revolcados' }
        ]" :key="campo.key" class="q-py-xs">

          <q-item-section>
            <q-item-label class="text-grey-8 text-caption text-uppercase text-weight-medium">
              {{ campo.label }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-input
              dense
              outlined
              type="number"
              step="0.01"
              style="width: 110px;"
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
    <q-card bordered class="bg-green-1" style="border-width: 2px;">
      <q-card-section class="row items-center justify-between q-pa-sm">
        <div class="text-subtitle2 text-green-10 text-weight-bold">EXPORTACIÓN</div>
        <div class="text-h5 text-green-9 text-weight-bold">
          {{ exportacion.toFixed(2) }}%
        </div>
      </q-card-section>
    </q-card>

    <!-- CALIBRE (Opcional - Solo si se proporciona) -->
    <q-card
      v-if="calibre"
      bordered
      class="bg-blue-1"
      style="border-width: 2px;"
    >
      <q-card-section class="row items-center justify-between q-pa-sm">
        <div class="text-subtitle2 text-blue-10 text-weight-bold">CALIBRE</div>
        <div class="text-subtitle1 text-blue-9 text-weight-bold">
          {{ calibre }}
        </div>
      </q-card-section>
    </q-card>

  </div>
</template>

<script setup lang="ts">
import { computed,  ref } from 'vue';

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
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'input-change', campo: string, valor: string): void;
}>();

const expandidoTotalDanos = ref(true);
const expandidoSumaR2 = ref(true);

const totalDanosNum = computed(() => {
  const v = props.totalDanosNum;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
});

function emitInput(campo: string, v: unknown) {
  // Verificamos si es un tipo primitivo que se puede convertir a string de forma segura
  const safeValue = (typeof v === 'string' || typeof v === 'number')
    ? String(v)
    : '';
  emit('input-change', campo, safeValue);
}

function displayNumber(val: string | number | undefined | null): number | string {
  if (val === '' || val === undefined || val === null) return '';
  const n = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(n) ? '' : n;
}


</script>
