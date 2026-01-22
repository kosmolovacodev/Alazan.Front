<!-- src/app/components/CatalogosMaestros.vue -->
<template>
  <div class="q-gutter-md">
    <!-- Encabezado -->
    <q-card class="bg-gradient text-white" flat>
      <q-card-section class="row items-center q-gutter-sm">
        <q-icon name="database" size="32px" />
        <div>
          <div class="text-h6 text-weight-bold">Catálogos Maestros</div>
          <div class="text-caption opacity-80">Administra los catálogos base del sistema</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabs -->
    <q-tabs
      v-model="catalogoActivo"
      dense
      align="left"
      narrow-indicator
      active-color="white"
      indicator-color="white"
      class="bg-primary text-white rounded-borders"
    >
      <q-tab name="granos" label="🌾 Granos" />
      <q-tab name="calibres" label="📏 Calibres" />
      <q-tab name="compradores" label="🏢 Compradores" />
      <q-tab name="origenes" label="📍 Orígenes" />
      <q-tab name="bancos" label="🏦 Bancos" />
      <q-tab name="sedes" label="📍 Sedes" />
    </q-tabs>

    <!-- Loading global -->
    <div v-if="cargando" class="row items-center q-gutter-sm">
      <q-spinner />
      <div class="text-caption">Cargando catálogos...</div>
    </div>

    <!-- CALIBRES -->
    <q-card v-if="catalogoActivo === 'calibres'" bordered>
      <q-card-section class="text-subtitle2">📏 Calibres Garbanzo</q-card-section>

      <q-card-section class="bg-green-1">
        <div class="row q-col-gutter-sm items-center">
          <div class="col">
            <q-input
              v-model="nuevoCalibre.calibre"
              dense
              outlined
              label="Calibre"
              placeholder="Ej: 44.01-46.00"
            />
          </div>
          <div class="col-auto">
            <q-btn color="positive" icon="add" label="Agregar" @click="agregarCalibre" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="calibres"
          :columns="columnsCalibres"
          row-key="id"
          dense
          flat
          bordered
          :rows-per-page-options="[0]"
        >
          <template #body-cell-activo="props">
            <q-td align="center">
              <q-toggle
                :model-value="props.row.activo"
                @update:model-value="() => toggleCalibreActivo(props.row.id)"
                dense
              />
            </q-td>
          </template>

          <template #body-cell_acciones="props">
            <q-td align="center">
              <q-btn
                flat
                dense
                round
                color="negative"
                icon="delete"
                @click="eliminarCalibre(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- ORIGENES -->
    <q-card v-if="catalogoActivo === 'origenes'" bordered>
      <q-card-section class="text-subtitle2">📍 Catálogo de Orígenes</q-card-section>

      <q-card-section class="bg-green-1">
        <div class="row q-col-gutter-sm items-end">
          <div class="col-12 col-md-3">
            <q-input
              v-model="nuevoOrigen.municipio"
              dense
              outlined
              label="Municipio"
              placeholder="Navojoa"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="nuevoOrigen.estado"
              dense
              outlined
              label="Estado"
              placeholder="Sonora"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="nuevoOrigen.region"
              dense
              outlined
              label="Región (Opcional)"
              placeholder="Sur"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-btn
              color="positive"
              icon="add"
              label="Agregar"
              class="full-width"
              @click="agregarOrigen"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="origenes"
          :columns="columnsOrigenes"
          row-key="id"
          dense
          flat
          bordered
          :rows-per-page-options="[0]"
        >
          <template #body-cell_activo="props">
            <q-td align="center">
              <q-toggle
                :model-value="props.row.activo"
                @update:model-value="() => toggleOrigenActivo(props.row.id)"
                dense
              />
            </q-td>
          </template>

          <template #body-cell_acciones="props">
            <q-td align="center">
              <q-btn
                flat
                dense
                round
                color="negative"
                icon="delete"
                @click="eliminarOrigen(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- COMPRADORES -->
    <q-card v-if="catalogoActivo === 'compradores'" bordered>
      <q-card-section class="text-subtitle2">🏢 Catálogo de Compradores</q-card-section>

      <q-card-section class="bg-green-1">
        <div class="row q-col-gutter-sm items-end">
          <div class="col-12 col-md-4">
            <q-input
              v-model="nuevoComprador.nombre"
              dense
              outlined
              label="Nombre"
              placeholder="Exportadora del Norte"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="nuevoComprador.telefono"
              dense
              outlined
              label="Teléfono"
              placeholder="667-123-4567"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-btn
              color="positive"
              icon="add"
              label="Agregar"
              class="full-width"
              @click="agregarComprador"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="compradores"
          :columns="columnsCompradores"
          row-key="id"
          dense
          flat
          bordered
          :rows-per-page-options="[0]"
        >
          <template #body-cell_activo="props">
            <q-td align="center">
              <q-toggle
                :model-value="props.row.activo"
                @update:model-value="() => toggleCompradorActivo(props.row.id)"
                dense
              />
            </q-td>
          </template>

          <template #body-cell_acciones="props">
            <q-td align="center">
              <q-btn
                flat
                dense
                round
                color="negative"
                icon="delete"
                @click="eliminarComprador(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- GRANOS -->
    <q-card v-if="catalogoActivo === 'granos'" bordered class="q-pa-sm">
      <q-card-section class="text-subtitle2">🌾 Granos</q-card-section>

      <q-card-section class="bg-green-1">
        <div class="row q-col-gutter-sm items-center">
          <div class="col">
            <q-input
              v-model="nuevoGrano.nombre"
              dense
              outlined
              label="Grano"
              placeholder="Ej: GARBANZO"
              @update:model-value="(v) => (nuevoGrano.nombre = (v || '').toUpperCase())"
            />
          </div>

          <div class="col-auto row items-center q-gutter-xs">
            <q-toggle v-model="nuevoGrano.requiere_analisis" dense />
            <div class="text-caption">Análisis</div>
          </div>

          <div class="col-auto">
            <q-btn color="positive" icon="add" label="Agregar" @click="agregarGrano" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="granos"
          :columns="columnsGranos"
          row-key="id"
          dense
          flat
          bordered
          :rows-per-page-options="[0]"
        >
          <template #body-cell_requiere_analisis="props">
            <q-td align="center">
              <q-badge :label="props.row.requiere_analisis ? '✅ Sí' : '❌ No'" />
            </q-td>
          </template>

          <template #body-cell_activo="props">
            <q-td align="center">
              <q-toggle
                :model-value="props.row.activo"
                @update:model-value="() => toggleGranoActivo(props.row.id)"
                dense
              />
            </q-td>
          </template>

          <template #body-cell_acciones="props">
            <q-td align="center">
              <q-btn
                flat
                dense
                round
                color="negative"
                icon="delete"
                @click="eliminarGrano(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- BANCOS -->
    <q-card v-if="catalogoActivo === 'bancos'" bordered>
      <q-card-section class="text-subtitle2">🏦 Catálogo de Bancos</q-card-section>

      <q-card-section class="bg-green-1">
        <div class="row q-col-gutter-sm items-end">
          <div class="col-12 col-md-4">
            <q-input
              v-model="nuevoBanco.nombre_banco"
              dense
              outlined
              label="Banco"
              placeholder="BBVA"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="nuevoBanco.codigo_banco"
              dense
              outlined
              label="Código"
              placeholder="012"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-btn
              color="positive"
              icon="add"
              label="Agregar"
              class="full-width"
              @click="agregarBanco"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="bancos"
          :columns="columnsBancos"
          row-key="id"
          dense
          flat
          bordered
          :rows-per-page-options="[0]"
        >
          <template #body-cell_codigo_banco="props">
            <q-td align="center">
              <q-badge :label="props.row.codigo_banco" class="text-mono" />
            </q-td>
          </template>

          <template #body-cell_activo="props">
            <q-td align="center">
              <q-toggle
                :model-value="props.row.activo"
                @update:model-value="() => toggleBancoActivo(props.row.id)"
                dense
              />
            </q-td>
          </template>

          <template #body-cell_acciones="props">
            <q-td align="center">
              <q-btn
                flat
                dense
                round
                color="negative"
                icon="delete"
                @click="eliminarBanco(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- SEDES -->
    <q-card v-if="catalogoActivo === 'sedes'" bordered>
      <q-card-section class="text-subtitle2">📍 Catálogo de Sedes</q-card-section>

      <q-card-section v-if="errorSedes">
        <q-banner class="bg-red-1 text-red-10" rounded>
          <template #avatar>
            <q-icon name="warning" />
          </template>

          <div class="text-weight-bold">⚠️ Tabla de Sedes no encontrada</div>
          <div class="q-mt-sm">
            La tabla <q-badge label="sedes_catalogo" class="text-mono" /> no existe en tu base de
            datos de Supabase.
          </div>

          <q-separator class="q-my-md" />

          <div class="text-weight-bold q-mb-sm">🔧 Solución:</div>
          <ol class="q-pl-md q-mb-md">
            <li>Abre tu proyecto en Supabase Dashboard</li>
            <li>Ve a la sección SQL Editor</li>
            <li>
              Ejecuta el script <q-badge label="/database/add_sedes_table.sql" class="text-mono" />
            </li>
            <li>Recarga esta página</li>
          </ol>

          <div class="row q-col-gutter-sm">
            <div class="col-auto">
              <q-btn
                color="negative"
                icon="refresh"
                label="Recargar Página"
                @click="recargarPagina"
              />
            </div>
            <div class="col-auto">
              <q-btn
                color="grey-8"
                icon="content_copy"
                label="Ver Documentación"
                @click="copiarRutaDocSedes"
              />
            </div>
          </div>
        </q-banner>
      </q-card-section>

      <template v-else>
        <q-card-section class="bg-green-1">
          <div class="row q-col-gutter-sm items-end">
            <div class="col-12 col-md-3">
              <q-input
                v-model="nuevaSede.nombre_sede"
                dense
                outlined
                label="Nombre"
                placeholder="Sede Central"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="nuevaSede.ciudad"
                dense
                outlined
                label="Ciudad"
                placeholder="Navojoa"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="nuevaSede.estado"
                dense
                outlined
                label="Estado"
                placeholder="Sonora"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                v-model.number="nuevaSede.tope_diario"
                type="number"
                dense
                outlined
                label="Tope Diario"
                placeholder="10000"
              />
            </div>
            <div class="col-12 col-md-1">
              <q-btn
                color="positive"
                icon="add"
                label="Agregar"
                class="full-width"
                @click="agregarSede"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-table
            :rows="sedes"
            :columns="columnsSedes"
            row-key="id"
            dense
            flat
            bordered
            :rows-per-page-options="[0]"
          >
            <template #body-cell_tope_diario="props">
              <q-td align="center">
                <q-badge :label="formatMX(props.row.tope_diario)" class="text-mono" />
              </q-td>
            </template>

            <template #body-cell_activo="props">
              <q-td align="center">
                <q-toggle
                  :model-value="props.row.activo"
                  @update:model-value="() => toggleSedeActivo(props.row.id)"
                  dense
                />
              </q-td>
            </template>

            <template #body-cell_acciones="props">
              <q-td align="center">
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  icon="delete"
                  @click="eliminarSede(props.row.id)"
                />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </template>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Dialog, Notify } from 'quasar';

interface Calibre {
  id: number;
  calibre: string;
  activo: boolean;
}

interface Origen {
  id: number;
  municipio: string;
  estado: string;
  region: string;
  activo: boolean;
}

interface Comprador {
  id: number;
  nombre: string;
  telefono: string;
  activo: boolean;
}

interface Grano {
  id: number;
  nombre: string;
  requiere_analisis: boolean;
  activo: boolean;
}

interface Banco {
  id: number;
  nombre_banco: string;
  codigo_banco: string;
  activo: boolean;
}

interface Sede {
  id: number;
  nombre_sede: string;
  ciudad: string;
  estado: string;
  tope_diario: number;
  activo: boolean;
}

type CatalogoKey = 'granos' | 'calibres' | 'compradores' | 'origenes' | 'bancos' | 'sedes';

const catalogoActivo = ref<CatalogoKey>('granos');
const cargando = ref(false);
const errorSedes = ref(false);

// Data
const calibres = ref<Calibre[]>([]);
const origenes = ref<Origen[]>([]);
const compradores = ref<Comprador[]>([]);
const granos = ref<Grano[]>([]);
const bancos = ref<Banco[]>([]);
const sedes = ref<Sede[]>([]);

// Nuevos
const nuevoCalibre = reactive({ calibre: '' });
const nuevoOrigen = reactive({ municipio: '', estado: '', region: '' });
const nuevoComprador = reactive({ nombre: '', telefono: '' });
const nuevoGrano = reactive({ nombre: '', requiere_analisis: true });
const nuevoBanco = reactive({ nombre_banco: '', codigo_banco: '' });
const nuevaSede = reactive({ nombre_sede: '', ciudad: '', estado: '', tope_diario: 0 });

// Columns (Quasar)
const columnsCalibres = [
  { name: 'calibre', label: 'Calibre', field: 'calibre', align: 'left' as const },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center' as const },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' as const },
];

const columnsOrigenes = [
  { name: 'municipio', label: 'Municipio', field: 'municipio', align: 'left' as const },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' as const },
  {
    name: 'region',
    label: 'Región',
    field: 'region',
    align: 'left' as const,
    format: (v: string) => v || '-',
  },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center' as const },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' as const },
];

const columnsCompradores = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const },
  {
    name: 'telefono',
    label: 'Teléfono',
    field: 'telefono',
    align: 'left' as const,
    format: (v: string) => v || '-',
  },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center' as const },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' as const },
];

const columnsGranos = [
  { name: 'nombre', label: 'Grano', field: 'nombre', align: 'left' as const },
  {
    name: 'requiere_analisis',
    label: 'Análisis',
    field: 'requiere_analisis',
    align: 'center' as const,
  },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center' as const },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' as const },
];

const columnsBancos = [
  { name: 'nombre_banco', label: 'Banco', field: 'nombre_banco', align: 'left' as const },
  { name: 'codigo_banco', label: 'Código', field: 'codigo_banco', align: 'center' as const },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center' as const },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' as const },
];

const columnsSedes = [
  { name: 'nombre_sede', label: 'Sede', field: 'nombre_sede', align: 'left' as const },
  { name: 'ciudad', label: 'Ciudad', field: 'ciudad', align: 'left' as const },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' as const },
  { name: 'tope_diario', label: 'Tope Diario', field: 'tope_diario', align: 'center' as const },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center' as const },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' as const },
];

// Utils
function formatMX(n: number): string {
  try {
    return Number(n || 0).toLocaleString('es-MX');
  } catch {
    return String(n ?? 0);
  }
}

function notifyOk(message: string) {
  Notify.create({ type: 'positive', message });
}

function notifyErr(message: string) {
  Notify.create({ type: 'negative', message });
}

async function confirmar(mensaje: string): Promise<boolean> {
  return new Promise((resolve) => {
    Dialog.create({
      title: 'Confirmación',
      message: mensaje,
      cancel: true,
      persistent: true,
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false));
  });
}

// Carga inicial
onMounted(() => {
  void cargarTodosLosCatalogos();
});

async function cargarTodosLosCatalogos() {
  cargando.value = true;
  try {
    await Promise.all([
      cargarGranos(),
      cargarCalibres(),
      cargarOrigenes(),
      cargarCompradores(),
      cargarBancos(),
      cargarSedes(),
    ]);
  } catch (e) {
    // Si falla algo no controlado aquí
    // (las funciones individuales ya hacen console.error)
    notifyErr('Error al cargar los catálogos');
  } finally {
    cargando.value = false;
  }
}

// Loads
async function cargarGranos() {
  // const { data, error } = await supabase.from('granos_catalogo').select('*').order('id');
  // if (error) {
  //   console.error('Error cargando granos:', error);
  //   return;
  // }
  // granos.value = (data || []) as Grano[];
}

async function cargarCalibres() {
  const { data, error } = await supabase.from('calibres_catalogo').select('*').order('id');
  if (error) {
    console.error('Error cargando calibres:', error);
    return;
  }
  calibres.value = (data || []) as Calibre[];
}

async function cargarOrigenes() {
  // const { data, error } = await supabase.from('origenes_catalogo').select('*').order('municipio');
  // if (error) {
  //   console.error('Error cargando orígenes:', error);
  //   return;
  // }
  // origenes.value = (data || []) as Origen[];
}

async function cargarCompradores() {
  // const { data, error } = await supabase.from('compradores_catalogo').select('*').order('nombre');
  // if (error) {
  //   console.error('Error cargando compradores:', error);
  //   return;
  // }
  // compradores.value = (data || []) as Comprador[];
}

async function cargarBancos() {
  // const { data, error } = await supabase.from('bancos_catalogo').select('*').order('nombre_banco');
  // if (error) {
  //   console.error('Error cargando bancos:', error);
  //   return;
  // }
  // bancos.value = (data || []) as Banco[];
}

async function cargarSedes() {
  // const { data, error } = await supabase.from('sedes_catalogo').select('*').order('nombre_sede');
  // if (error) {
  //   console.error('Error cargando sedes:', error);
  //   errorSedes.value = true;
  //   return;
  // }
  // errorSedes.value = false;
  // sedes.value = (data || []) as Sede[];
}

// CRUD: Calibres
async function agregarCalibre() {
  if (!nuevoCalibre.calibre) return notifyErr('Por favor completa todos los campos');

  const { error } = await supabase
    .from('calibres_catalogo')
    .insert([{ calibre: nuevoCalibre.calibre, activo: true }])
    .select();
  if (error) {
    console.error(error);
    return notifyErr('Error al agregar calibre');
  }

  await cargarCalibres();
  nuevoCalibre.calibre = '';
  notifyOk('Calibre agregado correctamente');
}

async function eliminarCalibre(id: number) {
  const ok = await confirmar('¿Está seguro de eliminar este calibre?');
  if (!ok) return;

  const { error } = await supabase.from('calibres_catalogo').delete().eq('id', id);
  if (error) {
    console.error(error);
    return notifyErr('Error al eliminar calibre');
  }

  await cargarCalibres();
  notifyOk('Calibre eliminado');
}

async function toggleCalibreActivo(id: number) {
  const item = calibres.value.find((c) => c.id === id);
  if (!item) return;

  const { error } = await supabase
    .from('calibres_catalogo')
    .update({ activo: !item.activo })
    .eq('id', id);
  if (error) {
    console.error(error);
    return notifyErr('Error al actualizar calibre');
  }

  await cargarCalibres();
}

// CRUD: Orígenes
async function agregarOrigen() {
  if (!nuevoOrigen.municipio || !nuevoOrigen.estado)
    return notifyErr('Por favor completa municipio y estado');

  const payload = {
    municipio: nuevoOrigen.municipio,
    estado: nuevoOrigen.estado,
    region: nuevoOrigen.region,
    activo: true,
  };

  const { error } = await supabase.from('origenes_catalogo').insert([payload]).select();
  if (error) {
    console.error(error);
    return notifyErr('Error al agregar origen');
  }

  await cargarOrigenes();
  nuevoOrigen.municipio = '';
  nuevoOrigen.estado = '';
  nuevoOrigen.region = '';
  notifyOk('Origen agregado correctamente');
}

async function eliminarOrigen(id: number) {
  const ok = await confirmar('¿Está seguro de eliminar este origen?');
  if (!ok) return;

  const { error } = await supabase.from('origenes_catalogo').delete().eq('id', id);
  if (error) {
    console.error(error);
    return notifyErr('Error al eliminar origen');
  }

  await cargarOrigenes();
  notifyOk('Origen eliminado');
}

async function toggleOrigenActivo(id: number) {
  const item = origenes.value.find((o) => o.id === id);
  if (!item) return;

  const { error } = await supabase
    .from('origenes_catalogo')
    .update({ activo: !item.activo })
    .eq('id', id);
  if (error) {
    console.error(error);
    return notifyErr('Error al actualizar origen');
  }

  await cargarOrigenes();
}

// CRUD: Compradores
async function agregarComprador() {
  if (!nuevoComprador.nombre) return notifyErr('Por favor ingresa el nombre del comprador');

  const payload = {
    nombre: nuevoComprador.nombre,
    telefono: nuevoComprador.telefono,
    activo: true,
  };

  const { error } = await supabase.from('compradores_catalogo').insert([payload]).select();
  if (error) {
    console.error(error);
    return notifyErr('Error al agregar comprador');
  }

  await cargarCompradores();
  nuevoComprador.nombre = '';
  nuevoComprador.telefono = '';
  notifyOk('Comprador agregado correctamente');
}

async function eliminarComprador(id: number) {
  const ok = await confirmar('¿Está seguro de eliminar este comprador?');
  if (!ok) return;

  const { error } = await supabase.from('compradores_catalogo').delete().eq('id', id);
  if (error) {
    console.error(error);
    return notifyErr('Error al eliminar comprador');
  }

  await cargarCompradores();
  notifyOk('Comprador eliminado');
}

async function toggleCompradorActivo(id: number) {
  const item = compradores.value.find((c) => c.id === id);
  if (!item) return;

  const { error } = await supabase
    .from('compradores_catalogo')
    .update({ activo: !item.activo })
    .eq('id', id);
  if (error) {
    console.error(error);
    return notifyErr('Error al actualizar comprador');
  }

  await cargarCompradores();
}

// CRUD: Granos
async function agregarGrano() {
  if (!nuevoGrano.nombre) return notifyErr('Por favor ingresa el nombre del grano');

  const payload = {
    nombre: nuevoGrano.nombre,
    requiere_analisis: nuevoGrano.requiere_analisis,
    activo: true,
  };
  const { error } = await supabase.from('granos_catalogo').insert([payload]).select();
  if (error) {
    console.error(error);
    return notifyErr('Error al agregar grano');
  }

  await cargarGranos();
  nuevoGrano.nombre = '';
  nuevoGrano.requiere_analisis = true;
  notifyOk('Grano agregado correctamente');
}

async function eliminarGrano(id: number) {
  const ok = await confirmar('¿Está seguro de eliminar este grano?');
  if (!ok) return;

  const { error } = await supabase.from('granos_catalogo').delete().eq('id', id);
  if (error) {
    console.error(error);
    return notifyErr('Error al eliminar grano');
  }

  await cargarGranos();
  notifyOk('Grano eliminado');
}

async function toggleGranoActivo(id: number) {
  const item = granos.value.find((g) => g.id === id);
  if (!item) return;

  const { error } = await supabase
    .from('granos_catalogo')
    .update({ activo: !item.activo })
    .eq('id', id);
  if (error) {
    console.error(error);
    return notifyErr('Error al actualizar grano');
  }

  await cargarGranos();
}

// CRUD: Bancos
async function agregarBanco() {
  if (!nuevoBanco.nombre_banco || !nuevoBanco.codigo_banco)
    return notifyErr('Por favor completa todos los campos');

  const payload = {
    nombre_banco: nuevoBanco.nombre_banco,
    codigo_banco: nuevoBanco.codigo_banco,
    activo: true,
  };
  const { error } = await supabase.from('bancos_catalogo').insert([payload]).select();
  if (error) {
    console.error(error);
    return notifyErr('Error al agregar banco');
  }

  await cargarBancos();
  nuevoBanco.nombre_banco = '';
  nuevoBanco.codigo_banco = '';
  notifyOk('Banco agregado correctamente');
}

async function eliminarBanco(id: number) {
  const ok = await confirmar('¿Está seguro de eliminar este banco?');
  if (!ok) return;

  const { error } = await supabase.from('bancos_catalogo').delete().eq('id', id);
  if (error) {
    console.error(error);
    return notifyErr('Error al eliminar banco');
  }

  await cargarBancos();
  notifyOk('Banco eliminado');
}

async function toggleBancoActivo(id: number) {
  const item = bancos.value.find((b) => b.id === id);
  if (!item) return;

  const { error } = await supabase
    .from('bancos_catalogo')
    .update({ activo: !item.activo })
    .eq('id', id);
  if (error) {
    console.error(error);
    return notifyErr('Error al actualizar banco');
  }

  await cargarBancos();
}

// CRUD: Sedes
async function agregarSede() {
  if (!nuevaSede.nombre_sede || !nuevaSede.ciudad || !nuevaSede.estado || !nuevaSede.tope_diario) {
    return notifyErr('Por favor completa todos los campos');
  }

  const payload = {
    nombre_sede: nuevaSede.nombre_sede,
    ciudad: nuevaSede.ciudad,
    estado: nuevaSede.estado,
    tope_diario: nuevaSede.tope_diario,
    activo: true,
  };

  const { error } = await supabase.from('sedes_catalogo').insert([payload]).select();
  if (error) {
    console.error(error);
    return notifyErr('Error al agregar sede');
  }

  await cargarSedes();
  nuevaSede.nombre_sede = '';
  nuevaSede.ciudad = '';
  nuevaSede.estado = '';
  nuevaSede.tope_diario = 0;
  notifyOk('Sede agregada correctamente');
}

async function eliminarSede(id: number) {
  const ok = await confirmar('¿Está seguro de eliminar esta sede?');
  if (!ok) return;

  const { error } = await supabase.from('sedes_catalogo').delete().eq('id', id);
  if (error) {
    console.error(error);
    return notifyErr('Error al eliminar sede');
  }

  await cargarSedes();
  notifyOk('Sede eliminada');
}

async function toggleSedeActivo(id: number) {
  const item = sedes.value.find((s) => s.id === id);
  if (!item) return;

  const { error } = await supabase
    .from('sedes_catalogo')
    .update({ activo: !item.activo })
    .eq('id', id);
  if (error) {
    console.error(error);
    return notifyErr('Error al actualizar sede');
  }

  await cargarSedes();
}

// UI helpers (Sedes error panel)
function recargarPagina() {
  window.location.reload();
}

async function copiarRutaDocSedes() {
  try {
    const sqlContent = `-- Ver documentación en /database/README_SEDES.md`;
    await navigator.clipboard.writeText(sqlContent);
    notifyOk('Ruta del script copiada');
  } catch (e) {
    notifyErr('No se pudo copiar al portapapeles');
  }
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(90deg, #1976d2, #7b1fa2);
}
.text-mono {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}
</style>
