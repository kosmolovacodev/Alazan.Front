<template>
  <div class="column bg-grey-2" style="min-height: 100%;">
    <!-- Header -->
    <q-card flat bordered class="q-px-md q-py-sm">
      <div class="row items-center q-gutter-md">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="orange-7"
          @click="emit('volver')"
        />
        <div class="text-h5 text-weight-medium text-grey-8">AUTORIZAR PRECIO</div>
      </div>
    </q-card>

    <!-- Contenido -->
    <div class="q-pa-md" style="flex: 1; overflow: auto;">
      <div class="q-mx-auto" style="max-width: 980px; display: grid; gap: 16px;">

        <!-- Tarjetas superiores (3 columnas) -->
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-card bordered class="text-center">
              <q-card-section>
                <div class="text-h3 text-weight-bold text-grey-8">{{ topCards.a }}</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card bordered class="text-center">
              <q-card-section>
                <div class="text-h3 text-weight-bold text-grey-8">{{ topCards.b }}</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card bordered class="text-center">
              <q-card-section>
                <div class="text-h3 text-weight-bold text-grey-8">{{ topCards.c }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Total Daños -->
        <q-card bordered class="text-center">
          <q-card-section>
            <div class="text-caption text-grey-7 q-mb-xs">Total Daños</div>
            <div class="text-h4 text-weight-bold text-negative">{{ totalDanosStr }}</div>
          </q-card-section>
        </q-card>

        <!-- PRECIO CALCULADO -->
        <q-card bordered class="bg-green-1">
          <q-card-section>
            <!-- Título -->
            <div class="row justify-center q-mb-md">
              <q-chip color="white" text-color="grey-9" square class="q-pa-sm">
                <span class="q-mr-sm">💰</span>
                <span class="text-weight-bold">PRECIO CALCULADO</span>
              </q-chip>
            </div>

            <!-- Grid 3 columnas -->
            <div class="row q-col-gutter-md q-mb-md">
              <!-- Nivel -->
              <div class="col-12 col-md-4">
                <div class="text-caption text-grey-7 q-mb-sm text-center">Nivel de Precio</div>
                <q-card bordered class="bg-orange-7 text-white text-center">
                  <q-card-section>
                    <div class="text-h4 text-weight-bold">{{ nivelPrecio }}</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Precio sugerido -->
              <div class="col-12 col-md-4">
                <div class="text-caption text-grey-7 q-mb-sm text-center">Precio Sugerido</div>
                <q-card bordered class="bg-white text-center">
                  <q-card-section>
                    <div class="text-h4 text-weight-bold text-positive">{{ precioSugeridoStr }}</div>
                    <div class="text-caption text-grey-6">por Kilograma (MXN)</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Descuento -->
              <div class="col-12 col-md-4">
                <div class="text-caption text-grey-7 q-mb-sm text-center">Descuento Aplicado</div>
                <q-card bordered class="bg-white text-center">
                  <q-card-section>
                    <div class="text-h4 text-weight-bold text-negative">{{ descuentoStr }}</div>
                    <div class="text-caption text-grey-6">MXN/TON</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Grid 2 columnas -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-7 q-mb-sm">Toneladas Aproximadas</div>
                <q-card bordered class="bg-white">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold text-grey-8">
                      {{ toneladasStr }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-caption text-grey-7 q-mb-sm">Valor Total Estimado</div>
                <q-card bordered class="bg-white">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold text-positive">
                      {{ valorTotalStr }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Seleccionar Precio (opcional) -->
            <div class="q-mb-md">
              <div class="text-caption text-grey-8 text-weight-bold q-mb-xs">
                Seleccionar Precio (opcional)
              </div>
              <q-select
                v-model="precioSeleccionado"
                :options="opcionesPrecio"
                outlined
                dense
              />
            </div>

            <!-- Justificación (opcional) -->
            <div>
              <div class="text-caption text-grey-8 text-weight-bold q-mb-xs">
                Justificación (opcional)
              </div>
              <q-input
                v-model="justificacion"
                type="textarea"
                outlined
                :rows="4"
                placeholder="Escriba una justificación si modifica el precio sugerido..."
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Botón Autorizar -->
        <div class="row justify-center q-pb-md">
          <q-btn
            color="orange-7"
            unelevated
            size="lg"
            label="Autorizar"
            @click="autorizar"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Notify } from 'quasar'

/**
 * En TSX solo recibía onVolver. Aquí lo convertimos a evento.
 */
const emit = defineEmits<{
  (e: 'volver'): void
  (e: 'autorizar', payload: { precioSeleccionado: string | null; justificacion: string }): void
}>()

// Valores estáticos tal como aparecen en el TSX (puedes luego pasarlos por props)
const topCards = {
  a: '11.8',
  b: '3.4',
  c: '8.6'
}

const totalDanosStr = '23.8%'

// En TSX están hardcodeados y aparecen como NaN. Aquí lo dejo igual pero controlable.
const nivelPrecio = 'P3'

const precioSugerido = ref<number | null>(null) // en TSX se veía $NaN
const descuento = ref<number | null>(null)
const toneladas = ref({ ton: 38.14, kg: 38140 })
const valorTotal = ref<number | null>(null)

const precioSeleccionado = ref<string | null>('P5 - $NaN/kg')
const opcionesPrecio = [
  'P5 - $NaN/kg',
  'P1 - $NaN/kg',
  'P2 - $NaN/kg',
  'P3 - $NaN/kg',
  'P4 - $NaN/kg',
  'P6 - $NaN/kg',
  'P7 - $NaN/kg',
  'P8 - $NaN/kg',
  'P9 - $NaN/kg',
  'P10 - $NaN/kg'
]

const justificacion = ref('')

function moneyOrNaN(v: number | null) {
  return v === null || !Number.isFinite(v) ? '$NaN' : v.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

const precioSugeridoStr = computed(() => moneyOrNaN(precioSugerido.value))
const descuentoStr = computed(() => moneyOrNaN(descuento.value))
const valorTotalStr = computed(() => (valorTotal.value === null || !Number.isFinite(valorTotal.value) ? '$NaN MXN' : `${moneyOrNaN(valorTotal.value)} MXN`))
const toneladasStr = computed(() => `${toneladas.value.ton.toFixed(2)} TON (${toneladas.value.kg} kg)`)

function autorizar() {
  emit('autorizar', {
    precioSeleccionado: precioSeleccionado.value,
    justificacion: justificacion.value
  })

  Notify.create({
    type: 'positive',
    message: 'Precio autorizado (pendiente de integrar lógica de cálculo).'
  })
}
</script>
