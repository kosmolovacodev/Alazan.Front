<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-start justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-grey-9">Configuración de Precios por Clasificación</div>
        <div class="text-caption text-grey-6">Configura los precios base para cada nivel de clasificación del grano</div>
      </div>
      <q-btn
        color="primary"
        icon="save"
        label="Guardar Cambios"
        unelevated
        :loading="loading"
        @click="guardarCambios"
      />
    </div>

    <!-- Cards de clasificaciones -->
    <div class="row q-gutter-md q-mb-lg">
      <q-card
        v-for="cls in clasificaciones"
        :key="cls.codigo"
        class="col clasificacion-card"
        bordered
        :style="{ borderTop: `4px solid ${colorPorCodigo(cls.codigo)}` }"
      >
        <q-card-section
          class="text-white q-py-sm q-px-md row items-center justify-between"
          :style="{ backgroundColor: colorPorCodigo(cls.codigo) }"
        >
          <div class="text-h6 text-weight-bold">{{ cls.nombre }}</div>
          <div class="row items-center q-gutter-xs">
            <div class="text-caption">Activo</div>
            <q-toggle v-model="cls.activo" color="white" dense />
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-caption text-grey-6 q-mb-xs">Precio Base</div>
          <div class="row items-center q-gutter-sm">
            <div class="text-h6 text-grey-7">$</div>
            <q-input
              v-model.number="cls.precioKg"
              type="number"
              step="0.01"
              min="0"
              outlined
              dense
              class="col"
              input-class="text-right text-h6 text-weight-bold"
            />
            <div class="text-body2 text-grey-6">/kg</div>
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">Unidad: <strong>Pesos Mexicanos / kg</strong></div>
        </q-card-section>

        <q-separator />

        <q-card-section class="bg-grey-1">
          <div class="text-caption text-grey-6">Precio por Tonelada</div>
          <div class="text-h6 text-weight-bold text-grey-8">
            {{ formatPrecio(cls.precioKg * 1000) }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Info importante -->
    <q-banner rounded class="bg-blue-1 text-blue-9 q-mb-md">
      <template #avatar>
        <q-icon name="info" color="blue-8" />
      </template>
      <div class="text-subtitle2 q-mb-xs">Información Importante</div>
      <ul class="q-ma-none q-pl-md">
        <li>Los precios se utilizan internamente para el cálculo del precio final del grano</li>
        <li><strong>CAL. EXP:</strong> Clasificación de Exportación (calidad premium)</li>
        <li><strong>CAL 1:</strong> Clasificación de Primera (calidad estándar)</li>
        <li><strong>CAL 2:</strong> Clasificación de Segunda (calidad básica)</li>
        <li>Puedes desactivar clasificaciones que no estén en uso actualmente</li>
      </ul>
    </q-banner>

    <!-- Ejemplo ilustrativo -->
    <q-card bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-md">
          <q-icon name="bar_chart" color="purple" class="q-mr-sm" />
          Ejemplo Ilustrativo
        </div>
        <div class="row q-gutter-md">
          <div class="col">
            <div class="text-caption text-grey-6 q-mb-sm">Si el análisis de calidad determina:</div>
            <div v-for="(ej, i) in ejemplos" :key="i" class="row justify-between q-mb-xs">
              <div class="row items-center q-gutter-xs">
                <q-icon name="circle" size="10px" :color="['blue-9','green-8','orange-8'][i]" />
                <span class="text-body2">{{ ej.nombre }}:</span>
              </div>
              <span class="text-body2 text-weight-medium">{{ ej.pct }}%</span>
            </div>
          </div>
          <q-separator vertical />
          <div class="col">
            <div class="text-caption text-grey-6 q-mb-sm" style="color:#7c3aed">Cálculo aplicado:</div>
            <div v-for="(ej, i) in ejemplos" :key="i" class="text-body2 text-grey-7 q-mb-xs">
              ({{ ej.pct / 100 }} × {{ formatPrecio(precioEjemplo(i)) }}) = {{ formatPrecio(ej.pct / 100 * precioEjemplo(i)) }}
            </div>
            <q-separator class="q-my-xs" />
            <div class="text-body2 text-weight-bold" style="color:#7c3aed">
              Precio Final = {{ formatPrecio(precioFinalEjemplo) }}/kg
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Notas del sistema -->
    <q-banner rounded class="bg-orange-1 q-mb-md" style="border-left: 4px solid #f59e0b">
      <div class="text-subtitle2 text-orange-9 q-mb-xs">
        <q-icon name="warning" color="orange-8" class="q-mr-xs" />
        Notas Importantes del Sistema
      </div>
      <ul class="q-ma-none q-pl-md text-orange-9">
        <li>Los porcentajes provienen del análisis de calidad del grano realizado en el módulo de Análisis</li>
        <li>La configuración de esta pantalla define los valores base por bloque ($/kg por clasificación)</li>
        <li>El cálculo final se ejecuta dentro del sistema en los módulos operativos (Precio, Boleta, Pre-liquidación)</li>
        <li>Esta pantalla <strong>NO</strong> realiza el cálculo operativo por boleta, solo administra los valores de referencia</li>
        <li>Esta pantalla solo administra los <strong>valores base de referencia</strong> para la gestión de precio del sistema</li>
      </ul>
    </q-banner>

    <!-- Flujo del sistema -->
    <q-card bordered>
      <q-card-section>
        <div class="text-subtitle2 text-weight-bold q-mb-md">
          <q-icon name="table_chart" color="blue-grey" class="q-mr-sm" />
          Flujo del Sistema
        </div>
        <div class="row items-center justify-center q-gutter-md">
          <div class="text-center paso-card">
            <div class="text-caption text-grey-6">PASO 1</div>
            <div class="text-body2 text-weight-bold text-primary">Análisis de Calidad</div>
            <div class="text-caption text-grey-5">(Determina % por clasificación)</div>
          </div>
          <q-icon name="arrow_forward" color="grey-5" size="sm" />
          <div class="text-center paso-card">
            <div class="text-caption text-grey-6">PASO 2</div>
            <div class="text-body2 text-weight-bold text-purple">Configuración de Precios</div>
            <div class="text-caption text-grey-5">(Define $/kg por clasificación)</div>
          </div>
          <q-icon name="arrow_forward" color="grey-5" size="sm" />
          <div class="text-center paso-card">
            <div class="text-caption text-grey-6">PASO 3</div>
            <div class="text-body2 text-weight-bold text-positive">Cálculo Automático</div>
            <div class="text-caption text-grey-5">(Sistema calcula precio final)</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resumen -->
    <q-card bordered class="q-mt-md">
      <q-card-section>
        <div class="text-subtitle2 text-weight-bold q-mb-sm">Resumen de Configuración</div>
        <q-table
          :rows="clasificaciones"
          :columns="columnasResumen"
          row-key="codigo"
          flat
          dense
          hide-bottom
          :pagination="{ rowsPerPage: 0 }"
        >
          <template #body-cell-nombre="props">
            <q-td :props="props">
              <q-icon name="circle" size="12px" :color="colorQPorCodigo(props.row.codigo)" class="q-mr-xs" />
              {{ props.row.nombre }}
            </q-td>
          </template>
          <template #body-cell-precioKg="props">
            <q-td :props="props">{{ formatPrecio(props.row.precioKg) }}</q-td>
          </template>
          <template #body-cell-precioTon="props">
            <q-td :props="props">{{ formatPrecio(props.row.precioKg * 1000) }}</q-td>
          </template>
          <template #body-cell-activo="props">
            <q-td :props="props">
              <q-badge :color="props.row.activo ? 'positive' : 'grey'" :label="props.row.activo ? 'Activo' : 'Inactivo'" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';

const $q = useQuasar();
const auth = useAuthStore();
const loading = ref(false);

interface ClasificacionPrecio {
  id: number;
  sedeId: number;
  granoId: number;
  nombre: string;
  codigo: string;
  precioKg: number;
  activo: boolean;
  orden: number;
}

const GARBANZO_ID = 4;

const clasificaciones = ref<ClasificacionPrecio[]>([]);

const ejemplos = [
  { nombre: 'CAL. EXP', pct: 60 },
  { nombre: 'CAL 1',    pct: 30 },
  { nombre: 'CAL 2',    pct: 10 },
];

const precioEjemplo = (i: number) =>
  clasificaciones.value[i]?.precioKg ?? 0;

const precioFinalEjemplo = computed(() =>
  ejemplos.reduce((sum, ej, i) => sum + (ej.pct / 100) * precioEjemplo(i), 0)
);

const columnasResumen = [
  { name: 'nombre',    label: 'CLASIFICACIÓN',    field: 'nombre',    align: 'left'  as const },
  { name: 'precioKg',  label: 'PRECIO/KG',        field: 'precioKg',  align: 'right' as const },
  { name: 'precioTon', label: 'PRECIO/TONELADA',  field: 'precioKg',  align: 'right' as const },
  { name: 'activo',    label: 'ESTADO',           field: 'activo',    align: 'center' as const },
];

function colorPorCodigo(codigo: string): string {
  if (codigo === 'CAL_EXP') return '#1e3a8a';
  if (codigo === 'CAL_1')   return '#16a34a';
  return '#ea580c';
}

function colorQPorCodigo(codigo: string): string {
  if (codigo === 'CAL_EXP') return 'blue-9';
  if (codigo === 'CAL_1')   return 'green-8';
  return 'orange-8';
}

function formatPrecio(val: number): string {
  return `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function cargarClasificaciones() {
  try {
    const sedeId = auth.sedeActivaId ?? 0;
    const { data } = await api.get('/api/precios-clasificacion', {
      params: { sedeId, granoId: GARBANZO_ID },
    });

    if (Array.isArray(data) && data.length > 0) {
      clasificaciones.value = data.map((c: ClasificacionPrecio) => ({
        id: c.id,
        sedeId: c.sedeId,
        granoId: c.granoId,
        nombre: c.nombre,
        codigo: c.codigo,
        precioKg: c.precioKg ?? 0,
        activo: !!c.activo,
        orden: c.orden,
      }));
    } else {
      // Sin configuración guardada — mostrar las 3 clasificaciones en blanco
      clasificaciones.value = [
        { id: 0, sedeId, granoId: GARBANZO_ID, nombre: 'CAL. EXP', codigo: 'CAL_EXP', precioKg: 0, activo: true, orden: 1 },
        { id: 0, sedeId, granoId: GARBANZO_ID, nombre: 'CAL 1',    codigo: 'CAL_1',   precioKg: 0, activo: true, orden: 2 },
        { id: 0, sedeId, granoId: GARBANZO_ID, nombre: 'CAL 2',    codigo: 'CAL_2',   precioKg: 0, activo: true, orden: 3 },
      ];
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar precios de clasificación' });
  }
}

async function guardarCambios() {
  loading.value = true;
  try {
    const sedeId = auth.sedeActivaId ?? 0;
    await api.put('/api/precios-clasificacion', clasificaciones.value, {
      params: { sedeId, granoId: GARBANZO_ID },
    });
    $q.notify({ type: 'positive', message: 'Precios guardados correctamente' });
    await cargarClasificaciones();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar precios' });
  } finally {
    loading.value = false;
  }
}

onMounted(cargarClasificaciones);
</script>

<style scoped>
.clasificacion-card { min-width: 220px; }
.paso-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 20px;
  min-width: 160px;
}
</style>
