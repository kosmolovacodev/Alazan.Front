<template>
  <q-page class="q-pa-md">

    <!-- Header -->
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-btn flat round icon="arrow_back" @click="props.onBack()" />
      <div class="text-h6">RENEGOCIAR PRECIO</div>
    </div>

    <div class="q-px-none">

      <!-- Tabla superior -->
      <q-card bordered class="q-mb-md">
        <q-markup-table dense separator="horizontal">
          <thead class="bg-grey-2">
            <tr>
              <th class="text-left">No. Ticket</th>
              <th class="text-left">Fecha</th>
              <th class="text-left">Comprador</th>
              <th class="text-left">Peso Bruto</th>
              <th class="text-left">Descuento (kg/ton)</th>
              <th class="text-left">Precio Sugerido</th>
              <th class="text-left">Estatus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ registroTicket }}</td>
              <td>{{ registroFecha }}</td>
              <td>Abelardo</td>
              <td>{{ registroPesoBruto }}</td>
              <td>25</td>
              <td>18.85</td>
              <td>
                <span class="text-orange-8 text-weight-medium">Pendiente por negociar</span>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>

      <!-- Sección principal (Boleta / Precio) -->
      <div class="row q-col-gutter-md q-mb-md">

        <!-- BOLETA -->
        <div class="col-12 col-md-6">
          <q-card bordered>
            <q-card-section class="bg-orange-6 text-white text-center">
              <div class="text-h6">BOLETA</div>
            </q-card-section>

            <q-card-section>

              <div class="row justify-end q-mb-md">
                <div style="width: 160px;">
                  <div class="text-caption text-grey-7 q-mb-xs">FOLIO</div>
                  <q-input dense outlined disable />
                </div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">PRODUCTOR</div>
                  <q-input dense outlined :model-value="props.registro?.productor || ''" disable />
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">FECHA Y HR.</div>
                  <q-input dense outlined :model-value="props.registro?.fechaHora || ''" disable />
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">TELÉFONO</div>
                  <q-input dense outlined :model-value="props.registro?.telefono || ''" disable />
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">T. PRODUCTOR</div>
                  <q-input dense outlined :model-value="props.registro?.tProductor || ''" disable />
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">COMPRADOR</div>
                  <q-input dense outlined disable />
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">PRECIO</div>
                  <q-input dense outlined disable />
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">ORIGEN</div>
                  <q-input dense outlined :model-value="props.registro?.origen || ''" disable />
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">DESCUENTO</div>
                  <q-input dense outlined disable />
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">RENDIMIENTO</div>
                  <q-input dense outlined disable />
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">HUMEDAD</div>
                  <q-input dense outlined disable />
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">COSECHA</div>
                  <q-input dense outlined disable />
                </div>

                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 q-mb-xs">TON. APROX.</div>
                  <q-input dense outlined :model-value="props.registro?.pesoBruto || ''" disable />
                </div>
              </div>

              <!-- Tabla análisis -->
              <div class="q-mt-md">
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section>
                    <div class="text-caption text-grey-8 q-mb-sm">TOTAL DE GRANOS</div>

                    <div class="q-gutter-xs">
                      <div
                        v-for="(item, idx) in itemsAnalisis"
                        :key="idx"
                        class="row items-center justify-between q-py-xs"
                        style="border-bottom: 1px solid #e5e7eb;"
                      >
                        <div class="text-caption text-grey-8">{{ item }}</div>
                        <div class="text-caption text-grey-7"></div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

            </q-card-section>
          </q-card>
        </div>

        <!-- PRECIO -->
        <div class="col-12 col-md-6">
          <q-card bordered>
            <q-card-section class="bg-orange-6 text-white text-center">
              <div class="text-h6">PRECIO</div>
            </q-card-section>

            <q-card-section>
              <div class="row text-weight-bold text-grey-8 q-pb-sm" style="border-bottom: 2px solid #d1d5db;">
                <div class="col-6 q-pl-md">Nivel</div>
                <div class="col-6 q-pl-md">Precio Base ($/Kg)</div>
              </div>

              <div class="q-mt-sm" style="max-height: 420px; overflow-y: auto;">
                <q-card
                  v-for="p in props.preciosDisponibles"
                  :key="p.codigo"
                  flat
                  bordered
                  class="q-mb-sm"
                  :class="isPrecioSugerido(p) ? 'bg-orange-1' : ''"
                >
                  <q-card-section class="row items-center justify-between">
                    <div class="row items-center q-gutter-sm">
                      <q-radio
                        v-model="precioSeleccionado"
                        :val="String(p.valor)"
                        name="precio"
                      />
                      <div class="text-body2">{{ p.codigo }}</div>
                    </div>

                    <q-badge
                      v-if="isPrecioSugerido(p)"
                      color="orange-6"
                      text-color="white"
                      class="q-pa-sm"
                    >
                      {{ p.codigo === 'Otro' ? '' : p.valor.toFixed(2) }}
                    </q-badge>
                    <div v-else class="text-body2">
                      {{ p.codigo === 'Otro' ? '' : p.valor.toFixed(2) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Justificación -->
      <q-card bordered class="q-mb-md">
        <q-card-section>
          <div class="text-caption text-grey-8 q-mb-sm">JUSTIFICACIÓN</div>
          <q-input
            v-model="justificacion"
            outlined
            type="textarea"
            :rows="4"
            placeholder="Ingrese la justificación para el cambio de precio..."
          />
        </q-card-section>
      </q-card>

      <!-- Botones -->
      <div class="row justify-center q-gutter-md q-mb-md">
        <q-btn color="orange-6" label="Autorizar" @click="handleAutorizar" />
        <q-btn color="orange-6" label="Rechazar" @click="props.onRechazar()" />
      </div>

      <!-- Tabla inferior (histórico mock, igual TSX) -->
      <q-card bordered>
        <q-markup-table dense separator="horizontal">
          <tbody>
            <tr class="bg-grey-1">
              <td>4164</td>
              <td>27/08/25</td>
              <td>Abelardo</td>
              <td>5</td>
              <td>30</td>
              <td>17.50</td>
              <td>Autorizado GC</td>
            </tr>
            <tr>
              <td>4163</td>
              <td>26/08/25</td>
              <td>Abelardo</td>
              <td>10</td>
              <td>20</td>
              <td>19</td>
              <td>Autorizado GC</td>
            </tr>
            <tr class="bg-grey-1">
              <td>4162</td>
              <td>26/08/25</td>
              <td>Abelardo</td>
              <td>8</td>
              <td>20</td>
              <td>18.50</td>
              <td>Autorizado GC</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import PantallaDetalleFacturacion from './PantallaDetalleFacturacion.vue'; // (no se usa aquí, pero lo dejo fuera)
                                                          // si tu linter se queja, borra este import

interface RenegociarPrecioProps {
  registro: any;
  preciosDisponibles: Array<{ codigo: string; valor: number }>;
  onAutorizar: (nuevoPrecio: string, justificacion: string) => void;
  onRechazar: () => void;
  onBack: () => void;
}

const props = defineProps<RenegociarPrecioProps>();
const $q = useQuasar();

/* Estado reactivo (reemplaza document.querySelector / getElementById) */
const precioSeleccionado = ref<string>('');
const justificacion = ref<string>('');

/* Valores de fallback como TSX */
const registroTicket = computed(() => props.registro?.ticket || '4165');
const registroFecha = computed(() => props.registro?.fechaHora || '29/08/25');
const registroPesoBruto = computed(() => props.registro?.pesoBruto || '3');

/* Items de análisis (igual lista TSX) */
const itemsAnalisis = [
  'IMPUREZA',
  'R1',
  'R2',
  'CAFÉS/LISOS',
  'MANCHADOS',
  'QUEB/MXC/MITD/CAM',
  'HELADOS',
  'ALIMONADOS',
  'REVOCADOS',
  'SUMA R2',
  'EXPORTACIÓN',
  'CALIBRE'
];

function isPrecioSugerido(p: { codigo: string; valor: number }) {
  return p.codigo === props.registro?.precioSugeridoCodigo;
}

function handleAutorizar() {
  if (!precioSeleccionado.value) {
    $q.notify({ type: 'warning', message: 'Por favor seleccione un precio', position: 'top' });
    return;
  }
  if (!justificacion.value || justificacion.value.trim() === '') {
    $q.notify({ type: 'warning', message: 'Por favor ingrese una justificación', position: 'top' });
    return;
  }
  props.onAutorizar(precioSeleccionado.value, justificacion.value.trim());
}
</script>

<style scoped>
/* Nada crítico, Quasar ya resuelve la UI */
</style>
