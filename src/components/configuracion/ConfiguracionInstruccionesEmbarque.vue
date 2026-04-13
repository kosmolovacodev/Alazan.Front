<template>
  <div>
    <!-- ── Sección catálogos simples ─────────────────────── -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-md-4">
        <CatalogCard
          title="Presentaciones de Exportación"
          subtitle="Tipos de empaque / presentación"
          placeholder="Ej. Bolsa 25 kg"
          titleColor="primary"
          apiBase="/api/ie-catalogos/presentacion"
        />
      </div>
      <div class="col-12 col-md-4">
        <CatalogCard
          title="Brokers / Intermediarios"
          subtitle="Agentes de exportación"
          placeholder="Ej. Nombre del broker"
          titleColor="orange"
          apiBase="/api/ie-catalogos/broker"
        />
      </div>
      <div class="col-12 col-md-4">
        <CatalogCard
          title="Lugares de Embarque"
          subtitle="Puertos y puntos de salida"
          placeholder="Ej. Puerto de Guaymas"
          titleColor="default"
          apiBase="/api/ie-catalogos/lugar"
        />
      </div>
    </div>

    <!-- ── Plantillas de Condiciones ─────────────────────── -->
    <div class="bg-white rounded-borders shadow-1" style="border:1px solid #e8e8e8; overflow:hidden">

      <!-- Encabezado plantillas -->
      <div class="row items-center justify-between q-pa-md" style="border-bottom:1px solid #f0f0f0">
        <div>
          <div class="text-subtitle2 text-weight-bold text-primary">Plantillas de Condiciones</div>
          <div class="text-caption text-grey-5 q-mt-xs">Textos estándar para instrucciones de embarque</div>
        </div>
        <q-btn unelevated color="primary" icon="add" label="Nueva Plantilla"
          style="border-radius:8px" @click="abrirNueva" />
      </div>

      <!-- Lista plantillas -->
      <div style="max-height:440px; overflow-y:auto">
        <div v-if="cargando" class="flex flex-center q-pa-lg">
          <q-spinner color="primary" size="sm" />
        </div>
        <template v-else>
          <div v-for="pl in plantillas" :key="pl.id"
            style="border-bottom:1px solid #f5f5f5">

            <!-- Vista normal -->
            <template v-if="editandoId !== pl.id">
              <div class="row items-start q-px-md q-py-sm">
                <div class="col">
                  <div class="text-body2 text-weight-bold text-grey-8">{{ pl.titulo }}</div>
                  <div class="text-caption text-grey-5 q-mt-xs" style="white-space:pre-wrap; max-height:60px; overflow:hidden">
                    {{ pl.cuerpo }}
                  </div>
                </div>
                <div class="col-auto q-pl-sm">
                  <q-btn flat round dense icon="edit_note" size="xs" color="grey-5"
                    class="q-mr-xs" @click="iniciarEdicion(pl)" />
                  <q-btn flat round dense icon="close" size="xs" color="grey-5"
                    @click="confirmarEliminar(pl.id)" />
                </div>
              </div>
            </template>

            <!-- Vista edición -->
            <template v-else>
              <div class="q-pa-md q-gutter-y-sm">
                <q-input v-model="editTitulo" label="Título" dense outlined />
                <q-input v-model="editCuerpo" label="Contenido" type="textarea" dense outlined
                  rows="4" />
                <div class="row justify-end q-gutter-sm">
                  <q-btn flat label="Cancelar" size="sm" color="grey" @click="cancelarEdicion" />
                  <q-btn unelevated label="Guardar" size="sm" color="positive"
                    @click="guardarEdicion" />
                </div>
              </div>
            </template>
          </div>

          <div v-if="!plantillas.length && !cargando"
            class="text-caption text-grey-4 text-center q-pa-lg">
            Sin plantillas registradas
          </div>
        </template>
      </div>
    </div>

    <!-- ── Diálogo nueva plantilla ────────────────────────── -->
    <q-dialog v-model="modalNueva" persistent>
      <q-card style="width:560px; max-width:95vw">
        <q-card-section>
          <div class="text-h6">Nueva Plantilla de Condiciones</div>
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-md">
          <q-input v-model="nuevaTitulo" label="Título *" outlined dense />
          <q-input v-model="nuevaCuerpo" label="Contenido *" type="textarea" outlined dense rows="5" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn unelevated color="primary" label="Agregar" @click="agregarPlantilla" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { Notify, useQuasar } from 'quasar';
import CatalogCard from './CatalogCard.vue';

const $q = useQuasar();

interface Plantilla {
  id: number;
  titulo: string;
  cuerpo: string;
}

const plantillas   = ref<Plantilla[]>([]);
const cargando     = ref(false);
const modalNueva   = ref(false);
const nuevaTitulo  = ref('');
const nuevaCuerpo  = ref('');
const editandoId   = ref<number | null>(null);
const editTitulo   = ref('');
const editCuerpo   = ref('');

async function cargarPlantillas() {
  cargando.value = true;
  try {
    const { data } = await api.get<Plantilla[]>('/api/ie-catalogos/plantilla');
    plantillas.value = Array.isArray(data) ? data : [];
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar plantillas' });
  } finally {
    cargando.value = false;
  }
}

function abrirNueva() {
  nuevaTitulo.value = '';
  nuevaCuerpo.value = '';
  modalNueva.value = true;
}

async function agregarPlantilla() {
  if (!nuevaTitulo.value.trim() || !nuevaCuerpo.value.trim()) {
    Notify.create({ type: 'warning', message: 'Título y contenido son obligatorios' });
    return;
  }
  try {
    await api.post('/api/ie-catalogos/plantilla', {
      titulo: nuevaTitulo.value.trim(),
      cuerpo: nuevaCuerpo.value.trim(),
    });
    modalNueva.value = false;
    await cargarPlantillas();
    Notify.create({ type: 'positive', message: 'Plantilla agregada', timeout: 1500 });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al agregar plantilla' });
  }
}

function iniciarEdicion(pl: Plantilla) {
  editandoId.value = pl.id;
  editTitulo.value = pl.titulo;
  editCuerpo.value = pl.cuerpo;
}

async function guardarEdicion() {
  if (!editTitulo.value.trim() || editandoId.value === null) return;
  try {
    await api.put(`/api/ie-catalogos/plantilla/${editandoId.value}`, {
      titulo: editTitulo.value.trim(),
      cuerpo: editCuerpo.value.trim(),
    });
    cancelarEdicion();
    await cargarPlantillas();
    Notify.create({ type: 'positive', message: 'Plantilla actualizada', timeout: 1500 });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al actualizar plantilla' });
  }
}

function cancelarEdicion() {
  editandoId.value = null;
  editTitulo.value = '';
  editCuerpo.value = '';
}

async function eliminarPlantilla(id: number) {
  try {
    await api.delete(`/api/ie-catalogos/plantilla/${id}`);
    await cargarPlantillas();
    Notify.create({ type: 'positive', message: 'Plantilla eliminada', timeout: 1500 });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al eliminar plantilla' });
  }
}

function confirmarEliminar(id: number) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar esta plantilla?',
    cancel: { flat: true, label: 'Cancelar' },
    ok: { unelevated: true, color: 'negative', label: 'Eliminar' },
  }).onOk(() => void eliminarPlantilla(id));
}

onMounted(() => void cargarPlantillas());
</script>
