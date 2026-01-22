<template>
  <div class="q-pa-md">

    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-grey-9">Reglas de Precio</div>
        <div class="text-caption text-grey-7">
          Configura parámetros base, calibres y niveles de exportación
        </div>
      </div>

      <q-btn
        color="green-7"
        unelevated
        icon="save"
        label="Guardar"
        @click="notifyOk('✅ Configuración guardada correctamente.')"
      />
    </div>

    <!-- Grid -->
    <div class="row q-col-gutter-md">

      <!-- Card 1: Parámetros Base -->
      <div class="col-12 col-lg-6">
        <q-card bordered>
          <q-card-section>
            <div class="text-subtitle2 text-grey-8 q-mb-md">💰 Parámetros Base</div>

            <div class="q-gutter-md">

              <!-- Precio base USD -->
              <div>
                <div class="text-caption text-grey-7 q-mb-xs">Precio BASE USD/TON</div>
                <q-input
                  dense
                  outlined
                  :model-value="precioBaseUSD"
                  @update:model-value="onPrecioBaseUSDInput"
                  @blur="onPrecioBaseUSDBlur"
                  placeholder="2100.00"
                >
                  <template #prepend>
                    <div class="text-grey-6">$</div>
                  </template>
                  <template #append>
                    <div class="text-grey-6 text-caption">USD</div>
                  </template>
                </q-input>
              </div>

              <!-- Tipo de cambio FIX -->
              <div>
                <div class="text-caption text-grey-7 q-mb-xs">Tipo de Cambio FIX</div>
                <q-input
                  dense
                  outlined
                  :model-value="tipoCambioFIX"
                  @update:model-value="onTipoCambioInput"
                  @blur="onTipoCambioBlur"
                  placeholder="20.50"
                >
                  <template #prepend>
                    <div class="text-grey-6">$</div>
                  </template>

                  <template #append>
                    <div class="row items-center no-wrap q-gutter-xs">
                      <q-btn
                        flat
                        round
                        size="sm"
                        icon="refresh"
                        :loading="cargandoTC"
                        @click="obtenerTipoCambio"
                      />
                      <div class="text-grey-6 text-caption">MXN</div>
                    </div>
                  </template>
                </q-input>

                <div v-if="ultimaActualizacionTC" class="text-caption text-grey-7 q-mt-xs">
                  Última actualización: {{ ultimaActualizacionTC }}
                </div>
              </div>

              <!-- URL API -->
              <div>
                <div class="text-caption text-grey-7 q-mb-xs">URL API de Tipo de Cambio</div>
                <q-input
                  dense
                  outlined
                  :model-value="urlTipoCambio"
                  @update:model-value="(v) => emit('update:urlTipoCambio', String(v || ''))"
                  placeholder="https://api.example.com/rates"
                />
                <div class="text-caption text-grey-6 q-mt-xs">
                  💡 La API debe retornar JSON con formato: <span class="text-mono">{ rates: { MXN: 20.50 } }</span>
                </div>
              </div>

              <!-- Fecha -->
              <div>
                <div class="text-caption text-grey-7 q-mb-xs">Fecha de Vigencia</div>
                <q-input
                  dense
                  outlined
                  type="date"
                  :model-value="fechaFIX"
                  @update:model-value="(v) => emit('update:fechaFIX', String(v || ''))"
                >
                  <template #prepend>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </div>

              <!-- Precio base MXN calculado -->
              <q-card flat bordered class="bg-green-1">
                <q-card-section>
                  <div class="text-caption text-grey-7">Precio BASE MXN/TON</div>
                  <div class="text-h5 text-green-9 text-weight-bold">
                    ${{ calcularPrecioBaseMXN() }}
                  </div>
                  <div class="text-caption text-grey-7">USD × TC FIX</div>
                </q-card-section>
              </q-card>

            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Card 2: Descuentos por Calibre -->
      <div class="col-12 col-lg-6">
        <q-card bordered>
          <q-card-section>
            <div class="text-subtitle2 text-grey-8 q-mb-md">📏 Descuentos por Calibre</div>

            <q-table
              flat
              bordered
              dense
              :rows="tablaCalibre"
              :columns="columnsCalibre"
              row-key="codigo"
              :rows-per-page-options="[0]"
              class="q-mb-md"
              style="max-height: 320px;"
              virtual-scroll
            >
              <template #body-cell-codigo="p">
                <q-td :props="p">
                  <q-badge color="blue-2" text-color="blue-10">{{ p.row.codigo }}</q-badge>
                </q-td>
              </template>

              <template #body-cell-descuento="p">
                <q-td :props="p" class="text-right">
                  <template v-if="editandoCalibre === p.rowIndex">
                    <q-input
                      dense
                      outlined
                      autofocus
                      class="text-right"
                      style="width: 140px; margin-left: auto;"
                      :model-value="String(p.row.descuento)"
                      @update:model-value="(v) => actualizarDescuentoCalibre(p.rowIndex, String(v || ''))"
                      @blur="editandoCalibre = null"
                      @keyup.enter="editandoCalibre = null"
                    />
                  </template>
                  <template v-else>
                    <q-btn
                      flat
                      dense
                      class="text-weight-medium"
                      @click="editandoCalibre = p.rowIndex"
                      :label="`$${Number(p.row.descuento).toLocaleString('en-US')}`"
                    />
                  </template>
                </q-td>
              </template>

              <template #body-cell-acciones="p">
                <q-td :props="p" class="text-center">
                  <q-btn
                    flat
                    round
                    color="red-6"
                    icon="delete"
                    @click="eliminarCalibre(p.rowIndex)"
                  />
                </q-td>
              </template>
            </q-table>

            <div class="row q-col-gutter-sm items-center">
              <div class="col-12 col-sm-3">
                <q-input
                  dense
                  outlined
                  v-model="nuevoCalibre"
                  placeholder="54-56"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  dense
                  outlined
                  v-model="nuevoDescuentoCalibre"
                  placeholder="Descuento"
                  @update:model-value="(v) => (nuevoDescuentoCalibre = sanitizeNumeric(String(v ?? '')))"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-btn
                  color="orange-6"
                  unelevated
                  icon="add"
                  label="Agregar"
                  class="full-width"
                  @click="agregarCalibre"
                />
              </div>
            </div>

          </q-card-section>
        </q-card>
      </div>

      <!-- Card 3: Descuentos por Precio -->
      <div class="col-12 col-lg-6">
        <q-card bordered>
          <q-card-section>
            <div class="text-subtitle2 text-grey-8 q-mb-md">💵 Descuentos por Precio</div>

            <q-table
              flat
              bordered
              dense
              :rows="tablaPrecio"
              :columns="columnsPrecio"
              row-key="codigo"
              :rows-per-page-options="[0]"
              class="q-mb-md"
              style="max-height: 320px;"
              virtual-scroll
            >
              <template #body-cell-codigo="p">
                <q-td :props="p">
                  <q-badge color="purple-2" text-color="purple-10">{{ p.row.codigo }}</q-badge>
                </q-td>
              </template>

              <template #body-cell-descuento="p">
                <q-td :props="p" class="text-right">
                  <template v-if="editandoPrecio === p.rowIndex">
                    <q-input
                      dense
                      outlined
                      autofocus
                      class="text-right"
                      style="width: 140px; margin-left: auto;"
                      :model-value="String(p.row.descuento)"
                      @update:model-value="(v) => actualizarDescuentoPrecio(p.rowIndex, String(v || ''))"
                      @blur="editandoPrecio = null"
                      @keyup.enter="editandoPrecio = null"
                    />
                  </template>
                  <template v-else>
                    <q-btn
                      flat
                      dense
                      class="text-weight-medium"
                      @click="editandoPrecio = p.rowIndex"
                      :label="`$${Number(p.row.descuento).toLocaleString('en-US')}`"
                    />
                  </template>
                </q-td>
              </template>

              <template #body-cell-acciones="p">
                <q-td :props="p" class="text-center">
                  <q-btn
                    flat
                    round
                    color="red-6"
                    icon="delete"
                    @click="eliminarPrecio(p.rowIndex)"
                  />
                </q-td>
              </template>
            </q-table>

            <div class="row q-col-gutter-sm items-center">
              <div class="col-12 col-sm-9">
                <q-input
                  dense
                  outlined
                  v-model="nuevoDescuentoPrecio"
                  placeholder="Descuento"
                  @update:model-value="(v) => (nuevoDescuentoPrecio = sanitizeNumeric(String(v ?? '')))"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-btn
                  color="orange-6"
                  unelevated
                  icon="add"
                  label="Agregar"
                  class="full-width"
                  @click="agregarPrecio"
                />
              </div>
            </div>

          </q-card-section>
        </q-card>
      </div>

      <!-- Tabla Exportación (full width) -->
      <div class="col-12">
        <q-card bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle2 text-grey-8">📊 Niveles de Precio por % Exportación</div>
              <div class="text-caption text-grey-7">{{ tablaExportacion.length }} niveles</div>
            </div>

            <q-table
              flat
              bordered
              dense
              :rows="tablaExportacion"
              :columns="columnsExport"
              row-key="nivel"
              :rows-per-page-options="[0]"
              style="max-height: 420px;"
              virtual-scroll
            >
              <template #body="p">
                <q-tr
                  :props="p"
                  :class="p.row.vigente === 'NO' ? 'opacity-40' : ''"
                >
                  <q-td key="nivel" :props="p">
                    <q-badge color="orange-2" text-color="orange-10">{{ p.row.nivel }}</q-badge>
                  </q-td>

                  <q-td key="porcentaje" :props="p">
                    <span class="text-weight-medium">
                      {{ typeof p.row.porcentaje === 'number' ? `${p.row.porcentaje}%` : p.row.porcentaje }}
                    </span>
                  </q-td>

                  <q-td key="precio" :props="p" class="text-right">
                    <span class="text-green-9 text-weight-bold">
                      ${{ money(calcularPrecioNivel(p.row.descuento)) }}
                    </span>
                  </q-td>

                  <q-td key="formula" :props="p">
                    <span class="text-mono text-grey-8">
                      {{ p.rowIndex === 0 ? 'Precio Base - DC' : `Precio Base - ${p.row.descuento || 'DP?'}` }}
                    </span>
                  </q-td>

                  <q-td key="descuento" :props="p">
                    <q-select
                      dense
                      outlined
                      :model-value="p.row.descuento"
                      :options="opcionesDescuentosPrecio"
                      emit-value
                      map-options
                      clearable
                      @update:model-value="(v) => actualizarCodigoDescuentoExportacion(p.rowIndex, String(v || ''))"
                      style="min-width: 220px;"
                    />
                  </q-td>

                  <q-td key="precioTope" :props="p" class="text-center">
                    <q-badge
                      :color="p.row.precioTope === 'SÍ' ? 'blue-2' : 'grey-3'"
                      :text-color="p.row.precioTope === 'SÍ' ? 'blue-10' : 'grey-9'"
                    >
                      {{ p.row.precioTope }}
                    </q-badge>
                  </q-td>

                  <q-td key="vigente" :props="p" class="text-center">
                    <q-btn
                      dense
                      unelevated
                      :color="p.row.vigente === 'SÍ' ? 'green-2' : 'red-2'"
                      :text-color="p.row.vigente === 'SÍ' ? 'green-10' : 'red-10'"
                      :label="p.row.vigente"
                      @click="toggleVigencia(p.rowIndex)"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>

          </q-card-section>
        </q-card>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';

interface TablaCalibre {
  codigo: string;
  calibre: string;
  descuento: number;
}
interface TablaPrecio {
  codigo: string;
  descuento: number;
}
interface TablaExportacion {
  nivel: string;
  porcentaje: number | string;
  descuento: string; // DP1, DP2... o "" (equivalente a no seleccionado)
  precioTope: string; // "SÍ" | "NO"
  vigente: string; // "SÍ" | "NO"
}

interface Props {
  precioBaseUSD: string;
  tipoCambioFIX: string;
  fechaFIX: string;
  urlTipoCambio: string;
  tablaCalibre: TablaCalibre[];
  tablaPrecio: TablaPrecio[];
  tablaExportacion: TablaExportacion[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:precioBaseUSD', v: string): void;
  (e: 'update:tipoCambioFIX', v: string): void;
  (e: 'update:fechaFIX', v: string): void;
  (e: 'update:urlTipoCambio', v: string): void;
  (e: 'update:tablaCalibre', v: TablaCalibre[]): void;
  (e: 'update:tablaPrecio', v: TablaPrecio[]): void;
  (e: 'update:tablaExportacion', v: TablaExportacion[]): void;
}>();

const $q = useQuasar();

/* -------------------------
   Estado local (igual TSX)
------------------------- */
const nuevoCalibre = ref('');
const nuevoDescuentoCalibre = ref('');
const nuevoDescuentoPrecio = ref('');

const editandoCalibre = ref<number | null>(null);
const editandoPrecio = ref<number | null>(null);

const cargandoTC = ref(false);
const ultimaActualizacionTC = ref<string | null>(null);

/* -------------------------
   Columnas
------------------------- */
const columnsCalibre = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const },
  { name: 'calibre', label: 'Calibre', field: 'calibre', align: 'left' as const },
  { name: 'descuento', label: 'Descuento', field: 'descuento', align: 'right' as const },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' as const }
];

const columnsPrecio = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const },
  { name: 'descuento', label: 'Descuento', field: 'descuento', align: 'right' as const },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' as const }
];

const columnsExport = [
  { name: 'nivel', label: 'Nivel', field: 'nivel', align: 'left' as const },
  { name: 'porcentaje', label: '% Export.', field: 'porcentaje', align: 'left' as const },
  { name: 'precio', label: 'Precio (MXN/TON)', field: 'precio', align: 'right' as const },
  { name: 'formula', label: 'Fórmula de Precio', field: 'formula', align: 'left' as const },
  { name: 'descuento', label: 'Descuento (MXN)', field: 'descuento', align: 'left' as const },
  { name: 'precioTope', label: 'P. Tope', field: 'precioTope', align: 'center' as const },
  { name: 'vigente', label: 'Vigente', field: 'vigente', align: 'center' as const }
];

/* -------------------------
   Opciones select exportación
------------------------- */
const opcionesDescuentosPrecio = computed(() => {
  return [
    { label: 'Seleccionar...', value: '' },
    ...props.tablaPrecio.map(p => ({
      label: `${p.codigo} ($${Number(p.descuento).toLocaleString('en-US')})`,
      value: p.codigo
    }))
  ];
});

/* -------------------------
   Utilidades numéricas (igual TSX)
------------------------- */
function sanitizeNumeric(v: string): string {
  return v.replace(/,/g, '').trim();
}

function formatNumber(value: string): string {
  const num = parseFloat(value.replace(/,/g, ''));
  if (Number.isNaN(num)) return '';
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function money(v: number): string {
  return Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* -------------------------
   Inputs: precioBaseUSD / tipoCambioFIX
------------------------- */
function onPrecioBaseUSDInput(v: string | number | null) {
  const raw = sanitizeNumeric(String(v ?? ''));
  if (!Number.isNaN(parseFloat(raw)) || raw === '') {
    emit('update:precioBaseUSD', raw);
  }
}
function onPrecioBaseUSDBlur() {
  const formatted = formatNumber(props.precioBaseUSD);
  if (formatted) emit('update:precioBaseUSD', formatted);
}

function onTipoCambioInput(v: string | number | null) {
  const raw = sanitizeNumeric(String(v ?? ''));
  if (!Number.isNaN(parseFloat(raw)) || raw === '') {
    emit('update:tipoCambioFIX', raw);
  }
}
function onTipoCambioBlur() {
  const formatted = formatNumber(props.tipoCambioFIX);
  if (formatted) emit('update:tipoCambioFIX', formatted);
}

/* -------------------------
   Cálculos
------------------------- */
function getPrecioBaseNumerico(): number {
  const usd = parseFloat(props.precioBaseUSD.replace(/,/g, ''));
  const tc = parseFloat(props.tipoCambioFIX.replace(/,/g, ''));
  if (!Number.isNaN(usd) && !Number.isNaN(tc) && usd > 0 && tc > 0) return usd * tc;
  return 0;
}

function calcularPrecioNivel(codigoDescuento: string): number {
  const base = getPrecioBaseNumerico();
  if (base === 0) return 0;
  if (!codigoDescuento) return base;

  const item = props.tablaPrecio.find(p => p.codigo === codigoDescuento);
  if (!item) return base;

  return base - item.descuento;
}

function calcularPrecioBaseMXN(): string {
  const base = getPrecioBaseNumerico();
  return base > 0 ? money(base) : '0.00';
}

/* -------------------------
   Tipo de cambio (fetch)
------------------------- */
async function obtenerTipoCambio() {
  cargandoTC.value = true;
  try {
    const resp = await fetch(props.urlTipoCambio);
    const data = await resp.json();

    if (data?.rates?.MXN != null) {
      const tc = Number(data.rates.MXN);
      if (!Number.isFinite(tc)) throw new Error('MXN no numérico');

      emit('update:tipoCambioFIX', tc.toFixed(2));

      const ahora = new Date();
      const stamp = ahora.toLocaleString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      ultimaActualizacionTC.value = stamp;

      notifyOk(`✅ Tipo de cambio actualizado: $${tc.toFixed(2)} MXN`);
    } else {
      notifyErr('❌ No se pudo obtener el tipo de cambio. Intente nuevamente.');
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error al obtener tipo de cambio:', e);
    notifyErr('❌ Error al consultar el tipo de cambio. Verifique su conexión a internet.');
  } finally {
    cargandoTC.value = false;
  }
}

/* -------------------------
   Tabla Calibre
------------------------- */
function agregarCalibre() {
  if (!nuevoCalibre.value.trim() || !nuevoDescuentoCalibre.value) return;

  const descuento = parseFloat(nuevoDescuentoCalibre.value.replace(/,/g, ''));
  if (Number.isNaN(descuento)) return;

  const nextNumero = props.tablaCalibre.length + 1;
  const codigo = `DC${nextNumero}`;

  emit('update:tablaCalibre', [
    ...props.tablaCalibre,
    { codigo, calibre: nuevoCalibre.value.trim(), descuento }
  ]);

  nuevoCalibre.value = '';
  nuevoDescuentoCalibre.value = '';
}

function eliminarCalibre(index: number) {
  $q.dialog({
    title: 'Confirmación',
    message: '¿Está seguro de eliminar este calibre?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('update:tablaCalibre', props.tablaCalibre.filter((_, i) => i !== index));
  });
}

function actualizarDescuentoCalibre(index: number, nuevoDes: string) {
  const descuento = parseFloat(nuevoDes.replace(/,/g, ''));
  if (Number.isNaN(descuento) || descuento < 0) return;

  const nueva = [...props.tablaCalibre];
  nueva[index] = { ...nueva[index], descuento };
  emit('update:tablaCalibre', nueva);
}

/* -------------------------
   Tabla Precio
------------------------- */
function agregarPrecio() {
  if (!nuevoDescuentoPrecio.value) return;

  const descuento = parseFloat(nuevoDescuentoPrecio.value.replace(/,/g, ''));
  if (Number.isNaN(descuento)) return;

  const nextNumero = props.tablaPrecio.length + 1;
  const codigo = `DP${nextNumero}`;

  emit('update:tablaPrecio', [
    ...props.tablaPrecio,
    { codigo, descuento }
  ]);

  nuevoDescuentoPrecio.value = '';
}

function eliminarPrecio(index: number) {
  $q.dialog({
    title: 'Confirmación',
    message: '¿Está seguro de eliminar este rango de precio?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('update:tablaPrecio', props.tablaPrecio.filter((_, i) => i !== index));
  });
}

function actualizarDescuentoPrecio(index: number, nuevoDes: string) {
  const descuento = parseFloat(nuevoDes.replace(/,/g, ''));
  if (Number.isNaN(descuento) || descuento < 0) return;

  const nueva = [...props.tablaPrecio];
  nueva[index] = { ...nueva[index], descuento };
  emit('update:tablaPrecio', nueva);
}

/* -------------------------
   Tabla Exportación
------------------------- */
function actualizarCodigoDescuentoExportacion(index: number, codigoDes: string) {
  const nueva = [...props.tablaExportacion];
  nueva[index] = { ...nueva[index], descuento: codigoDes };
  emit('update:tablaExportacion', nueva);
}

function toggleVigencia(index: number) {
  const nueva = [...props.tablaExportacion];
  nueva[index] = { ...nueva[index], vigente: nueva[index].vigente === 'SÍ' ? 'NO' : 'SÍ' };
  emit('update:tablaExportacion', nueva);
}

/* -------------------------
   Notificaciones
------------------------- */
function notifyOk(message: string) {
  $q.notify({ type: 'positive', message, position: 'top' });
}
function notifyErr(message: string) {
  $q.notify({ type: 'negative', message, position: 'top' });
}
</script>

<style scoped>
.text-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.opacity-40 {
  opacity: 0.4;
}
</style>
