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

          <!-- Suma de R2 - Desplegable -->
          <q-card bordered class="bg-white">
            <q-item clickable v-ripple @click="expandidoSumaR2 = !expandidoSumaR2" class="q-py-xs">
              <q-item-section avatar>
                <q-icon :name="expandidoSumaR2 ? 'expand_more' : 'chevron_right'" size="xs" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-body2 text-weight-medium text-grey-9">
                  Suma de R2
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="text-body2 text-weight-bold text-grey-9">
                  {{ sumaR2.toFixed(2) }}%
                </div>
              </q-item-section>
            </q-item>

            <q-separator />

            <q-slide-transition>
              <div v-show="expandidoSumaR2" class="q-pa-sm bg-grey-2 q-gutter-sm">

                <!-- R2 -->
                <MiniRow
                  label="R2"
                  :value="r2"
                  :read-only="readOnly"
                  @change="(v) => emitInput('r2', v)"
                />

                <!-- Cafes y Lisos -->
                <MiniRow
                  label="Cafes y Lisos"
                  :value="cafesLisos"
                  :read-only="readOnly"
                  @change="(v) => emitInput('cafesLisos', v)"
                />

                <!-- Manchados -->
                <MiniRow
                  label="Manchados"
                  :value="manchados"
                  :read-only="readOnly"
                  @change="(v) => emitInput('manchados', v)"
                />

                <!-- Queb/Mxc -->
                <MiniRow
                  label="Queb/Mxc"
                  :value="quebMxc"
                  :read-only="readOnly"
                  @change="(v) => emitInput('quebMxc', v)"
                />

                <!-- Helados -->
                <MiniRow
                  label="Helados"
                  :value="helados"
                  :read-only="readOnly"
                  @change="(v) => emitInput('helados', v)"
                />

                <!-- Alimonados -->
                <MiniRow
                  label="Alimonados"
                  :value="alimonados"
                  :read-only="readOnly"
                  @change="(v) => emitInput('alimonados', v)"
                />

                <!-- Revolcados -->
                <MiniRow
                  label="Revolcados"
                  :value="revolcados"
                  :read-only="readOnly"
                  @change="(v) => emitInput('revolcados', v)"
                />
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
import { computed, defineComponent, h, ref } from 'vue';

interface Props {
  impurezas: number;
  r1: number;
  r2: number;
  cafesLisos: number;
  manchados: number;
  quebMxc: number;
  helados: number;
  alimonados: number;
  revolcados: number;
  sumaR2: number;
  totalDanos: number | string;
  exportacion: number;
  calibre?: string;
  readOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  calibre: undefined,
  readOnly: false
});

const emit = defineEmits<{
  (e: 'input-change', campo: string, valor: string): void;
}>();

const expandidoTotalDanos = ref(true);
const expandidoSumaR2 = ref(true);

const totalDanosNum = computed(() => {
  const v = props.totalDanos;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
});

function emitInput(campo: string, v: unknown) {
  emit('input-change', campo, String(v ?? ''));
}

function displayNumber(n: number) {
  return n === 0 ? '' : String(n);
}

/**
 * MiniRow (subcomponente local) para filas compactas en Suma de R2
 * Mantiene inputs pequeños como en el TSX.
 */
const MiniRow = defineComponent({
  name: 'MiniRow',
  props: {
    label: { type: String, required: true },
    value: { type: Number, required: true },
    readOnly: { type: Boolean, default: false }
  },
  emits: ['change'],
  setup(p, { emit }) {
    const modelValue = computed(() => (p.value === 0 ? '' : String(p.value)));

    return () =>
      h(
        'div',
        { class: 'row items-center justify-between' },
        [
          h('div', { class: 'text-caption text-grey-8' }, p.label),
          h('div', { class: 'row items-center q-gutter-xs' }, [
            h(
              // q-input compacto
              // Nota: aquí usamos render function para no depender de registro global en TS.
              // En runtime, QInput está disponible por auto-import de Quasar en tu build.
              'q-input',
              {
                dense: true,
                outlined: true,
                type: 'number',
                step: '0.01',
                modelValue: modelValue.value,
                'onUpdate:modelValue': (v: unknown) => emit('change', String(v ?? '')),
                readonly: p.readOnly,
                inputClass: 'text-right',
                style: 'width: 95px;'
              }
            ),
            h('div', { class: 'text-caption text-grey-7' }, '%')
          ])
        ]
      );
  }
});
</script>
