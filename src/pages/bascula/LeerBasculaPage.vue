<template>
  <q-page padding class="bg-grey-2">
    <!-- Encabezado de la página -->
    <div class="row items-center q-mb-lg">
      <div class="text-h5 text-grey-8 text-weight-bold">
        <q-icon name="scale" class="q-mr-sm" size="md" />
        Leer Báscula
      </div>
      <q-space />
      <q-badge color="blue-grey-7" class="text-caption q-pa-xs">
        <q-icon name="usb" size="xs" class="q-mr-xs" />
        RS-232 · 9600 baud
      </q-badge>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- ── Columna izquierda: Display de la báscula ── -->
      <div class="col-12 col-md-5 flex flex-center column q-gutter-md">
        <SerialBascula @peso-capturado="onPesoCapturado" />
      </div>

      <!-- ── Columna derecha: Historial de lecturas ── -->
      <div class="col-12 col-md-7">
        <q-card bordered flat class="shadow-1" style="border: 1px solid #d1d5db">
          <q-card-section class="q-py-sm q-px-md bg-grey-3 row items-center">
            <div class="text-subtitle2 text-grey-8 text-weight-bold">
              <q-icon name="history" class="q-mr-xs" />
              Historial de Capturas
            </div>
            <q-space />
            <q-btn
              v-if="historial.length"
              flat
              dense
              icon="delete_sweep"
              label="Limpiar"
              color="grey-7"
              size="sm"
              @click="limpiarHistorial"
            />
          </q-card-section>

          <q-card-section class="q-pa-none">
            <div v-if="!historial.length" class="text-center q-pa-xl text-grey-5">
              <q-icon name="scale" size="lg" class="q-mb-sm" />
              <div class="text-subtitle2">Sin lecturas aún</div>
              <div class="text-caption">Conecta la báscula y presiona "Capturar Peso"</div>
            </div>

            <q-list v-else separator>
              <q-item v-for="(lectura, idx) in historialOrdenado" :key="lectura.id" class="q-py-sm">
                <q-item-section avatar>
                  <q-avatar
                    :color="idx === 0 ? 'green-2' : 'grey-3'"
                    :text-color="idx === 0 ? 'green-9' : 'grey-7'"
                    size="36px"
                    font-size="0.75rem"
                  >
                    {{ historial.length - idx }}
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label
                    class="text-h6 text-weight-bold"
                    :class="idx === 0 ? 'text-green-9' : 'text-grey-8'"
                  >
                    {{ lectura.peso.toFixed(2) }} kg
                  </q-item-label>
                  <q-item-label caption class="text-grey-6">
                    {{ lectura.hora }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-badge v-if="idx === 0" color="green" label="ÚLTIMO" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <!-- Resumen estadístico de las capturas -->
          <q-card-section v-if="historial.length > 1" class="bg-grey-1 q-pa-sm border-top-grey">
            <div class="row text-center q-col-gutter-sm">
              <div class="col-4">
                <div class="text-caption text-grey-6">Promedio</div>
                <div class="text-subtitle2 text-weight-bold text-blue-9">{{ promedioKg }} kg</div>
              </div>
              <div class="col-4">
                <div class="text-caption text-grey-6">Máximo</div>
                <div class="text-subtitle2 text-weight-bold text-green-9">{{ maximoKg }} kg</div>
              </div>
              <div class="col-4">
                <div class="text-caption text-grey-6">Mínimo</div>
                <div class="text-subtitle2 text-weight-bold text-orange-9">{{ minimoKg }} kg</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Sección de integración: muestra cómo se usa en otros módulos -->
        <q-card bordered flat class="shadow-1 q-mt-md" style="border: 1px solid #d1d5db">
          <q-card-section class="q-py-sm q-px-md bg-grey-3">
            <div class="text-subtitle2 text-grey-8 text-weight-bold">
              <q-icon name="integration_instructions" class="q-mr-xs" />
              Integración en Módulos
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <!-- Card: Recepciones -->
              <div class="col-12 col-sm-6">
                <q-card
                  bordered
                  flat
                  class="bg-blue-1 cursor-pointer integration-card"
                  @click="irABascula"
                >
                  <q-card-section class="q-py-sm">
                    <div class="row items-center q-gutter-sm">
                      <q-icon name="scale" color="blue-9" size="sm" />
                      <div>
                        <div class="text-caption text-weight-bold text-blue-9">
                          Recepción - Báscula
                        </div>
                        <div class="text-caption text-blue-7">Usar en formulario de ingreso</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Card: Preliquidaciones -->
              <div class="col-12 col-sm-6">
                <q-card
                  bordered
                  flat
                  class="bg-purple-1 cursor-pointer integration-card"
                  @click="irAPreliquidacion"
                >
                  <q-card-section class="q-py-sm">
                    <div class="row items-center q-gutter-sm">
                      <q-icon name="calculate" color="purple-9" size="sm" />
                      <div>
                        <div class="text-caption text-weight-bold text-purple-9">
                          Preliquidación
                        </div>
                        <div class="text-caption text-purple-7">Calcular peso neto</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import SerialBascula from 'src/components/bascula/SerialBascula.vue';

const router = useRouter();

// ─── Historial de capturas ────────────────────────────────────────────────────

interface LecturaBascula {
  id: number;
  peso: number;
  hora: string;
  timestamp: number;
}

let contadorId = 0;

const historial = ref<LecturaBascula[]>([]);

function onPesoCapturado(pesoKg: number) {
  const ahora = new Date();
  historial.value.push({
    id: ++contadorId,
    peso: pesoKg,
    hora: ahora.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    timestamp: ahora.getTime(),
  });

  Notify.create({
    type: 'positive',
    icon: 'check_circle',
    message: `Peso capturado: ${pesoKg.toFixed(2)} kg`,
    position: 'top-right',
    timeout: 2000,
  });
}

function limpiarHistorial() {
  historial.value = [];
}

// Más reciente primero
const historialOrdenado = computed(() =>
  [...historial.value].sort((a, b) => b.timestamp - a.timestamp),
);

// ─── Estadísticas ─────────────────────────────────────────────────────────────

const promedioKg = computed(() => {
  if (!historial.value.length) return '0.00';
  const suma = historial.value.reduce((acc, l) => acc + l.peso, 0);
  return (suma / historial.value.length).toFixed(2);
});

const maximoKg = computed(() => {
  if (!historial.value.length) return '0.00';
  return Math.max(...historial.value.map((l) => l.peso)).toFixed(2);
});

const minimoKg = computed(() => {
  if (!historial.value.length) return '0.00';
  return Math.min(...historial.value.map((l) => l.peso)).toFixed(2);
});

// ─── Navegación ───────────────────────────────────────────────────────────────

function irABascula() {
  void router.push('/bascula');
}

function irAPreliquidacion() {
  void router.push('/preliquidacion');
}
</script>

<style scoped>
.border-top-grey {
  border-top: 1px solid #e5e7eb;
}

.integration-card {
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.integration-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
