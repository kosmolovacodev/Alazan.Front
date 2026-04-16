<template>
  <div>
    <q-tabs
      v-model="tab"
      dense
      class="text-grey-7"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="secciones" label="Secciones" icon="view_list" />
      <q-tab name="estado" label="Estado del Día" icon="today" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>

      <!-- ══════════════════════════════════════════════════
           TAB 1 — SECCIONES
      ══════════════════════════════════════════════════ -->
      <q-tab-panel name="secciones" class="q-pa-none">
        <div class="row items-center justify-between q-pa-md q-pb-sm">
          <div class="text-body2 text-weight-bold text-grey-8">
            Secciones configuradas para el Inicio del Día
          </div>
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Nueva Sección"
            dense
            @click="abrirDialogNueva"
          />
        </div>

        <q-table
          :rows="secciones"
          :columns="columnasSecciones"
          row-key="codigo"
          flat
          dense
          :loading="cargandoSecciones"
          no-data-label="Sin secciones registradas"
        >
          <!-- Ícono + nombre -->
          <template #body-cell-nombre="{ row }">
            <q-td>
              <div class="row items-center q-gutter-sm">
                <q-icon :name="row.icono" size="20px" :style="{ color: row.color }" />
                {{ row.nombre }}
              </div>
            </q-td>
          </template>

          <!-- Color chip -->
          <template #body-cell-color="{ row }">
            <q-td>
              <div class="row items-center q-gutter-xs">
                <div :style="{ width: '16px', height: '16px', borderRadius: '3px', background: row.color }" />
                <span class="text-caption text-grey-6">{{ row.color }}</span>
              </div>
            </q-td>
          </template>

          <!-- Activo chip -->
          <template #body-cell-activo="{ row }">
            <q-td class="text-center">
              <q-chip dense :color="row.activo ? 'positive' : 'grey-4'" :text-color="row.activo ? 'white' : 'grey-7'" size="sm">
                {{ row.activo ? 'Activa' : 'Inactiva' }}
              </q-chip>
            </q-td>
          </template>

          <!-- Acciones -->
          <template #body-cell-acciones="{ row }">
            <q-td class="text-right">
              <q-btn flat round dense icon="edit" color="primary" @click="abrirDialogEditar(row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="delete" color="negative" @click="abrirDialogEliminar(row)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- ══════════════════════════════════════════════════
           TAB 2 — ESTADO DEL DÍA
      ══════════════════════════════════════════════════ -->
      <q-tab-panel name="estado" class="q-pa-md">
        <div class="row items-center justify-between q-mb-md">
          <div class="row items-center q-gutter-md">
            <q-input
              v-model="fechaEstado"
              type="date"
              dense
              outlined
              style="width: 180px"
              label="Fecha"
              @update:model-value="cargarEstado"
            />
            <q-btn
              flat
              dense
              icon="refresh"
              color="grey-7"
              label="Actualizar"
              @click="cargarEstado"
            />
          </div>

          <q-btn
            unelevated
            color="negative"
            icon="restart_alt"
            label="Reiniciar Día"
            :loading="reiniciando"
            :disable="!estadoFecha?.secciones?.length"
            @click="confirmarReinicio"
          />
        </div>

        <div v-if="cargandoEstado" class="text-center q-pa-xl">
          <q-spinner color="primary" size="40px" />
        </div>

        <div v-else-if="estadoFecha">
          <!-- Tarjetas de secciones -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div
              v-for="sec in estadoFecha.secciones"
              :key="sec.codigo"
              class="col-12 col-sm-6 col-md-3"
            >
              <q-card flat bordered>
                <q-card-section class="q-pa-sm">
                  <div class="row items-center q-gutter-sm q-mb-xs">
                    <q-icon :name="sec.icono" :style="{ color: sec.color }" size="24px" />
                    <span class="text-body2 text-weight-bold">{{ sec.nombre }}</span>
                    <q-space />
                    <q-chip
                      dense
                      :color="sec.completo ? 'positive' : 'grey-4'"
                      :text-color="sec.completo ? 'white' : 'grey-7'"
                      size="sm"
                    >
                      {{ sec.completo ? 'Iniciado' : 'Pendiente' }}
                    </q-chip>
                  </div>

                  <template v-if="sec.completo">
                    <div class="text-caption text-grey-6">
                      <q-icon name="person" size="12px" class="q-mr-xs" />
                      {{ sec.iniciado_por_nombre ?? '—' }}
                    </div>
                    <div class="text-caption text-grey-5">
                      <q-icon name="schedule" size="12px" class="q-mr-xs" />
                      {{ formatHora(sec.hora_inicio) }}
                    </div>
                  </template>
                  <div v-else class="text-caption text-grey-5 text-italic">Sin iniciar</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Tabla de asistencias -->
          <div class="text-body2 text-weight-bold text-grey-8 q-mb-sm">
            Asistencias registradas ({{ estadoFecha.asistencias.length }})
          </div>
          <q-table
            :rows="estadoFecha.asistencias"
            :columns="columnasAsistencias"
            row-key="usuario_id"
            flat
            dense
            :pagination="{ rowsPerPage: 20 }"
            no-data-label="Sin asistencias para esta fecha"
          >
            <template #body-cell-asistio="{ row }">
              <q-td class="text-center">
                <q-chip
                  dense
                  :color="row.asistio ? 'positive' : 'negative'"
                  text-color="white"
                  size="sm"
                >
                  {{ row.asistio ? 'Sí' : 'No' }}
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </div>

        <div v-else class="text-center text-grey-5 q-pa-xl">
          Sin datos para esta fecha
        </div>
      </q-tab-panel>

    </q-tab-panels>

    <!-- Diálogo nueva sección -->
    <q-dialog v-model="dialogNueva" persistent>
      <q-card style="min-width: 380px">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="add_circle" color="primary" size="26px" class="q-mr-sm" />
          <span class="text-h6">Nueva Sección</span>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <q-input
            v-model="nueva.codigo"
            label="Código *"
            outlined
            dense
            hint="Ej: PRELIQUIDACION — solo mayúsculas/guion bajo"
            :rules="[v => !!v || 'Requerido', v => /^[A-Z0-9_]+$/.test(v) || 'Solo mayúsculas, números y _']"
            @update:model-value="nueva.codigo = nueva.codigo.toUpperCase()"
          />
          <q-input v-model="nueva.nombre" label="Nombre *" outlined dense :rules="[v => !!v || 'Requerido']" />

          <div class="row q-gutter-sm">
            <q-input
              v-model="nueva.icono"
              label="Ícono (Material Icons)"
              outlined
              dense
              class="col"
              hint="Ej: scale, warehouse, payments"
            >
              <template #prepend>
                <q-icon :name="nueva.icono || 'place'" :style="{ color: nueva.color }" />
              </template>
            </q-input>
            <div class="column items-center">
              <div class="text-caption text-grey-6 q-mb-xs">Color</div>
              <input
                type="color"
                v-model="nueva.color"
                style="width: 48px; height: 40px; border: none; cursor: pointer; border-radius: 6px"
              />
            </div>
          </div>

          <q-input
            v-model.number="nueva.orden"
            type="number"
            label="Orden"
            outlined
            dense
            style="width: 100px"
          />

          <q-toggle v-model="nueva.activo" label="Activa" color="positive" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Crear Sección"
            color="primary"
            :loading="creandoSeccion"
            :disable="!nueva.codigo || !nueva.nombre"
            @click="crearSeccion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo editar sección -->
    <q-dialog v-model="dialogEditar" persistent>
      <q-card style="min-width: 380px">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="edit" color="primary" size="26px" class="q-mr-sm" />
          <span class="text-h6">Editar Sección</span>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <q-input
            v-model="editando.codigo"
            label="Código *"
            outlined
            dense
            hint="Cambiar el código renombra la sección"
            :rules="[v => !!v || 'Requerido', v => /^[A-Z0-9_]+$/.test(v) || 'Solo mayúsculas, números y _']"
            @update:model-value="editando.codigo = editando.codigo.toUpperCase()"
          />
          <q-input v-model="editando.nombre" label="Nombre *" outlined dense :rules="[v => !!v || 'Requerido']" />

          <div class="row q-gutter-sm">
            <q-input
              v-model="editando.icono"
              label="Ícono (Material Icons)"
              outlined
              dense
              class="col"
              hint="Ej: scale, warehouse, payments"
            >
              <template #prepend>
                <q-icon :name="editando.icono || 'place'" :style="{ color: editando.color }" />
              </template>
            </q-input>
            <div class="column items-center">
              <div class="text-caption text-grey-6 q-mb-xs">Color</div>
              <input
                type="color"
                v-model="editando.color"
                style="width: 48px; height: 40px; border: none; cursor: pointer; border-radius: 6px"
              />
            </div>
          </div>

          <q-input
            v-model.number="editando.orden"
            type="number"
            label="Orden"
            outlined
            dense
            style="width: 100px"
          />

          <q-toggle v-model="editando.activo" label="Activa" color="positive" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Guardar"
            color="primary"
            :loading="guardandoSeccion !== null"
            :disable="!editando.codigo || !editando.nombre"
            @click="guardarEdicion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo confirmar eliminar sección -->
    <q-dialog v-model="dialogEliminar">
      <q-card style="min-width: 320px">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="warning" color="negative" size="28px" class="q-mr-sm" />
          <span class="text-h6">Eliminar Sección</span>
        </q-card-section>
        <q-card-section>
          ¿Eliminar la sección <strong>{{ seccionAEliminar?.nombre }}</strong> ({{ seccionAEliminar?.codigo }})?
          Esta acción no se puede deshacer.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Eliminar"
            color="negative"
            :loading="eliminandoSeccion"
            @click="eliminarSeccion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo confirmación reinicio -->
    <q-dialog v-model="dialogReinicio">
      <q-card style="min-width: 320px">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="warning" color="negative" size="28px" class="q-mr-sm" />
          <span class="text-h6">Reiniciar Día</span>
        </q-card-section>
        <q-card-section>
          Se eliminarán todos los registros de inicio de día y asistencias para el
          <strong>{{ fechaEstado }}</strong> en esta sede. Esta acción no se puede deshacer.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Reiniciar"
            color="negative"
            :loading="reiniciando"
            @click="ejecutarReinicio"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';

const $q = useQuasar();
const auth = useAuthStore();

// ── Tabs ──────────────────────────────────────────────────────────
const tab = ref('secciones');

// ── Secciones ─────────────────────────────────────────────────────
interface Seccion {
  codigo: string;
  nombre: string;
  icono: string;
  color: string;
  activo: boolean;
  orden: number;
}

const secciones = ref<Seccion[]>([]);
const cargandoSecciones = ref(false);
const guardandoSeccion = ref<string | null>(null);

// ── Nueva sección ─────────────────────────────────────────────────
const dialogNueva = ref(false);
const creandoSeccion = ref(false);

const nuevaVacio = () => ({ codigo: '', nombre: '', icono: 'place', color: '#607D8B', activo: true, orden: 0 });
const nueva = ref(nuevaVacio());

function abrirDialogNueva() {
  nueva.value = nuevaVacio();
  dialogNueva.value = true;
}

async function crearSeccion() {
  creandoSeccion.value = true;
  try {
    await api.post('/api/inicio-dia/secciones', nueva.value);
    $q.notify({ type: 'positive', message: `Sección "${nueva.value.nombre}" creada` });
    dialogNueva.value = false;
    await cargarSecciones();
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al crear la sección';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    creandoSeccion.value = false;
  }
}

const columnasSecciones = [
  { name: 'codigo',   label: 'Código',  field: 'codigo',  align: 'left'   as const, sortable: true },
  { name: 'nombre',   label: 'Nombre',  field: 'nombre',  align: 'left'   as const },
  { name: 'icono',    label: 'Ícono',   field: 'icono',   align: 'left'   as const },
  { name: 'color',    label: 'Color',   field: 'color',   align: 'left'   as const },
  { name: 'orden',    label: 'Orden',   field: 'orden',   align: 'center' as const, sortable: true },
  { name: 'activo',   label: 'Estado',  field: 'activo',  align: 'center' as const },
  { name: 'acciones', label: '',        field: 'acciones',align: 'right'  as const },
];

async function cargarSecciones() {
  cargandoSecciones.value = true;
  try {
    const { data } = await api.get('/api/inicio-dia/secciones');
    secciones.value = data;
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar secciones' });
  } finally {
    cargandoSecciones.value = false;
  }
}

// ── Editar sección ────────────────────────────────────────────────
const dialogEditar = ref(false);
const codigoOriginal = ref('');
const editando = ref<Seccion & { codigo: string }>({ codigo: '', nombre: '', icono: 'place', color: '#607D8B', activo: true, orden: 0 });

function abrirDialogEditar(sec: Seccion) {
  codigoOriginal.value = sec.codigo;
  editando.value = { ...sec };
  dialogEditar.value = true;
}

async function guardarEdicion() {
  guardandoSeccion.value = codigoOriginal.value;
  try {
    await api.put(`/api/inicio-dia/secciones/${codigoOriginal.value}`, {
      nuevoCodigo: editando.value.codigo !== codigoOriginal.value ? editando.value.codigo : undefined,
      nombre: editando.value.nombre,
      icono: editando.value.icono,
      color: editando.value.color,
      activo: editando.value.activo,
      orden: editando.value.orden,
    });
    $q.notify({ type: 'positive', message: `Sección "${editando.value.nombre}" actualizada` });
    dialogEditar.value = false;
    await cargarSecciones();
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al guardar';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    guardandoSeccion.value = null;
  }
}

// ── Eliminar sección ──────────────────────────────────────────────
const dialogEliminar = ref(false);
const seccionAEliminar = ref<Seccion | null>(null);
const eliminandoSeccion = ref(false);

function abrirDialogEliminar(sec: Seccion) {
  seccionAEliminar.value = sec;
  dialogEliminar.value = true;
}

async function eliminarSeccion() {
  if (!seccionAEliminar.value) return;
  eliminandoSeccion.value = true;
  try {
    await api.delete(`/api/inicio-dia/secciones/${seccionAEliminar.value.codigo}`);
    $q.notify({ type: 'positive', message: `Sección "${seccionAEliminar.value.nombre}" eliminada` });
    dialogEliminar.value = false;
    await cargarSecciones();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar la sección' });
  } finally {
    eliminandoSeccion.value = false;
  }
}

// ── Estado del Día ────────────────────────────────────────────────
interface SeccionEstado {
  codigo: string;
  nombre: string;
  icono: string;
  color: string;
  completo: boolean | null;
  iniciado_por: number | null;
  hora_inicio: string | null;
  iniciado_por_nombre: string | null;
}

interface AsistenciaEstado {
  usuario_id: number;
  nombre: string;
  seccion: string;
  tipo_inicio_dia: string;
  asistio: boolean;
  hora: string;
  registrado_por_nombre: string;
}

interface EstadoFecha {
  fecha: string;
  secciones: SeccionEstado[];
  asistencias: AsistenciaEstado[];
}

const fechaEstado = ref(new Date().toISOString().slice(0, 10));
const estadoFecha = ref<EstadoFecha | null>(null);
const cargandoEstado = ref(false);
const reiniciando = ref(false);
const dialogReinicio = ref(false);

const columnasAsistencias = [
  { name: 'seccion',               label: 'Sección',        field: 'seccion',               align: 'left'   as const, sortable: true },
  { name: 'nombre',                label: 'Usuario',        field: 'nombre',                align: 'left'   as const, sortable: true },
  { name: 'tipo_inicio_dia',       label: 'Tipo',           field: 'tipo_inicio_dia',       align: 'center' as const },
  { name: 'asistio',               label: 'Asistió',        field: 'asistio',               align: 'center' as const },
  { name: 'hora',                  label: 'Hora',           field: 'hora',                  align: 'left'   as const },
  { name: 'registrado_por_nombre', label: 'Registrado por', field: 'registrado_por_nombre', align: 'left'   as const },
];

async function cargarEstado() {
  const sedeId = auth.sedeActivaId;
  if (!sedeId) return;
  cargandoEstado.value = true;
  try {
    const { data } = await api.get('/api/inicio-dia/estado', {
      params: { sedeId, fecha: fechaEstado.value },
    });
    estadoFecha.value = data;
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar estado del día' });
  } finally {
    cargandoEstado.value = false;
  }
}

function formatHora(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function confirmarReinicio() {
  dialogReinicio.value = true;
}

async function ejecutarReinicio() {
  const sedeId = auth.sedeActivaId;
  if (!sedeId) return;
  reiniciando.value = true;
  try {
    await api.delete('/api/inicio-dia/reset', {
      params: { sedeId, fecha: fechaEstado.value },
    });
    $q.notify({ type: 'positive', message: 'Día reiniciado correctamente' });
    dialogReinicio.value = false;
    await cargarEstado();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al reiniciar el día' });
  } finally {
    reiniciando.value = false;
  }
}

// ── Init ──────────────────────────────────────────────────────────
onMounted(() => {
  void cargarSecciones();
  void cargarEstado();
});
</script>
