<template>
  <!-- Modal -->
  <q-dialog v-model="isOpen" persistent maximized transition-show="fade" transition-hide="fade">
    <q-card class="column full-height">
      <!-- Header -->
      <q-toolbar class="bg-primary text-white">
        <q-icon name="database" size="24px" class="q-mr-sm" />
        <q-toolbar-title class="text-weight-bold"> Gestión de Base de Datos </q-toolbar-title>

        <q-btn flat round dense icon="close" aria-label="Cerrar" @click="close" />
      </q-toolbar>

      <!-- Tabs -->
      <q-tabs
        v-model="activeTab"
        dense
        align="left"
        class="bg-grey-2 text-grey-8"
        active-color="primary"
        indicator-color="primary"
        inline-label
        narrow-indicator
      >
        <q-tab v-for="tab in bdTabs" :key="tab.name" :name="tab.name" :label="tab.label" />
      </q-tabs>

      <q-separator />

      <!-- Content -->
      <q-tab-panels v-model="activeTab" animated class="col">
        <q-tab-panel name="inicializar" class="q-pa-md">
          <!-- Mantengo tu isEmbedded=true; onClose no se usa aquí -->
          <InicializarBD :isEmbedded="true" :onClose="noop" />
        </q-tab-panel>

        <q-tab-panel name="scripts" class="q-pa-md">
          <ScriptsSQL />
        </q-tab-panel>

        <q-tab-panel name="diagnostico" class="q-pa-md">
          <DiagnosticoSupabase />
        </q-tab-panel>

        <q-tab-panel name="alineacion" class="q-pa-md">
          <AnalisisAlineacion />
        </q-tab-panel>

        <q-tab-panel name="calibres" class="q-pa-md">
          <CorreccionCalibres />
        </q-tab-panel>
      </q-tab-panels>

      <q-separator />

      <!-- Footer -->
      <q-card-actions align="right" class="bg-grey-2 q-pa-md">
        <q-btn color="grey-7" unelevated label="Cerrar" @click="close" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// Ajusta rutas según tu estructura real:
import InicializarBD from './InicializarBD.vue';
import ScriptsSQL from './ScriptsSQL.vue';
import DiagnosticoSupabase from './DiagnosticoSupabase.vue';
import AnalisisAlineacion from './AnalisisAlineacion.vue';
import CorreccionCalibres from './CorreccionCalibres.vue';

type TabName = 'inicializar' | 'scripts' | 'diagnostico' | 'alineacion' | 'calibres';

interface GestionBDProps {
  /**
   * Controla apertura/cierre del modal desde el padre (v-model).
   * Si no lo usas, puedes quitarlo y dejar "isOpen" interno.
   */
  modelValue: boolean;
}

const props = defineProps<GestionBDProps>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

const bdTabs: Array<{ name: TabName; label: string }> = [
  { name: 'inicializar', label: 'Inicializar BD' },
  { name: 'scripts', label: 'Scripts SQL' },
  { name: 'diagnostico', label: 'Diagnóstico BD' },
  { name: 'alineacion', label: 'Análisis de Alineación' },
  { name: 'calibres', label: 'Corrección Calibres' },
];

const activeTab = ref<TabName>('inicializar');

const isOpen = computed<boolean>({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

function close(): void {
  emit('update:modelValue', false);
  emit('close');
}

function noop(): void {
  // usado para compatibilidad con props heredadas (onClose) del componente InicializarBD
}
</script>

<style scoped>
/* No necesitas overlay manual: QDialog maneja backdrop, z-index y scroll */
</style>
