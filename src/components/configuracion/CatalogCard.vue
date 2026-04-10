<template>
  <div class="catalog-card bg-white" style="border:1px solid #e8e8e8; border-radius:12px; overflow:hidden; display:flex; flex-direction:column">

    <!-- ── Encabezado ── -->
    <div class="q-pa-md row items-start justify-between" style="border-bottom:1px solid #f0f0f0">
      <div class="col">
        <div class="text-subtitle2 text-weight-bold" :style="{ color: titleColorHex }">{{ title }}</div>
        <div v-if="subtitle" class="text-caption text-grey-5 q-mt-xs">{{ subtitle }}</div>
      </div>
      <div
        class="text-caption text-weight-bold text-grey-6 flex flex-center"
        style="background:#f0f0f0; border-radius:50%; min-width:28px; height:28px; margin-left:8px"
      >
        {{ items.length }}
      </div>
    </div>

    <!-- ── Lista de ítems ── -->
    <div class="col" style="overflow-y:auto; max-height:320px">
      <div v-if="loading" class="flex flex-center q-pa-lg">
        <q-spinner color="orange-7" size="sm" />
      </div>
      <template v-else>
        <div
          v-for="item in items"
          :key="item.id"
          class="row items-center q-px-md"
          style="min-height:44px; border-bottom:1px solid #f5f5f5"
        >
          <!-- Modo vista -->
          <template v-if="editingId !== item.id">
            <span class="col text-body2 text-grey-8">{{ item.nombre }}</span>
            <q-btn
              flat round dense icon="edit_note" size="xs" color="grey-4"
              class="q-mr-xs"
              @click="iniciarEdicion(item)"
            />
            <q-btn
              flat round dense icon="close" size="xs" color="grey-4"
              @click="confirmarEliminar(item.id)"
            />
          </template>
          <!-- Modo edición -->
          <template v-else>
            <q-input
              v-model="editNombre"
              dense borderless
              class="col"
              input-style="font-size:14px"
              @keyup.enter="guardarEdicion"
              @keyup.escape="cancelar"
            />
            <q-btn flat round dense icon="check" size="xs" color="positive"
              class="q-mr-xs" @click="guardarEdicion" />
            <q-btn flat round dense icon="close" size="xs" color="negative"
              @click="cancelar" />
          </template>
        </div>
        <div v-if="!items.length && !loading"
          class="text-caption text-grey-4 text-center q-pa-md"
        >
          Sin registros
        </div>
      </template>
    </div>

    <!-- ── Agregar nuevo ── -->
    <div class="q-pa-md row q-gutter-sm items-center" style="border-top:1px solid #f0f0f0">
      <q-input
        v-model="newNombre"
        dense outlined
        :placeholder="placeholder || 'Ej. Nuevo...'"
        class="col"
        style="font-size:13px"
        @keyup.enter="agregar"
      />
      <q-btn
        unelevated color="orange-7" icon="add" label="Agregar"
        style="border-radius:8px; white-space:nowrap"
        @click="agregar"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { api } from 'src/boot/axios';
import { Notify, useQuasar } from 'quasar';

interface Props {
  title: string;
  subtitle?: string;
  placeholder?: string;
  titleColor?: 'primary' | 'orange' | 'default';
  /** URL base para GET, POST, DELETE /{id}  */
  apiBase: string;
  /** URL base para PUT /{id} — si difiere de apiBase (ej. trenes usa /api/catalogos/editar/trenes) */
  putBase?: string;
  /** Query params para GET */
  getParams?: Record<string, unknown>;
  /** Query params para POST, PUT, DELETE */
  mutateParams?: Record<string, unknown>;
}

const props = withDefaults(defineProps<Props>(), {
  titleColor: 'primary',
});

const $q = useQuasar();

const titleColorHex = computed(() => {
  if (props.titleColor === 'orange') return '#e65100';
  if (props.titleColor === 'default') return '#424242';
  return '#1565c0'; // primary
});

interface Item { id: number; nombre: string }

const items     = ref<Item[]>([]);
const loading   = ref(false);
const editingId = ref<number | null>(null);
const editNombre = ref('');
const newNombre  = ref('');

async function cargar() {
  loading.value = true;
  try {
    const { data } = await api.get(props.apiBase, props.getParams ? { params: props.getParams } : undefined);
    items.value = (data as { id: number; nombre: string }[]).map(d => ({ id: d.id, nombre: d.nombre }));
  } catch {
    Notify.create({ type: 'negative', message: `Error al cargar ${props.title}` });
  } finally {
    loading.value = false;
  }
}

async function agregar() {
  const nombre = newNombre.value.trim();
  if (!nombre) return;
  try {
    await api.post(
      props.apiBase,
      { nombre },
      props.mutateParams ? { params: props.mutateParams } : undefined,
    );
    newNombre.value = '';
    await cargar();
    Notify.create({ type: 'positive', message: 'Agregado correctamente', timeout: 1500 });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al agregar' });
  }
}

function iniciarEdicion(item: Item) {
  editingId.value = item.id;
  editNombre.value = item.nombre;
}

async function guardarEdicion() {
  if (!editNombre.value.trim() || editingId.value === null) return;
  const base = props.putBase ?? props.apiBase;
  try {
    await api.put(
      `${base}/${editingId.value}`,
      { nombre: editNombre.value.trim(), activo: true },
      props.mutateParams ? { params: props.mutateParams } : undefined,
    );
    cancelar();
    await cargar();
  } catch {
    Notify.create({ type: 'negative', message: 'Error al actualizar' });
  }
}

function cancelar() {
  editingId.value = null;
  editNombre.value = '';
}

function confirmarEliminar(id: number) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar este registro?',
    cancel: { flat: true, label: 'Cancelar' },
    ok: { unelevated: true, color: 'negative', label: 'Eliminar' },
  }).onOk(() => void eliminar(id));
}

async function eliminar(id: number) {
  try {
    await api.delete(
      `${props.apiBase}/${id}`,
      props.mutateParams ? { params: props.mutateParams } : undefined,
    );
    await cargar();
    Notify.create({ type: 'positive', message: 'Eliminado correctamente', timeout: 1500 });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al eliminar' });
  }
}

onMounted(() => void cargar());
</script>
