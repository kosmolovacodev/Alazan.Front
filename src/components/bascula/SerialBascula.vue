<template>
  <!-- Componente de display industrial para lectura serial de báscula REVUELTA ERCC -->
  <div class="bascula-display">
    <!-- Encabezado del panel -->
    <div class="bascula-header">
      <q-icon name="scale" size="sm" />
      <span class="text-weight-bold q-ml-xs">Báscula REVUELTA ERCC</span>
      <q-space />
      <!-- Indicador de estado de conexión -->
      <q-chip
        :color="chipColor"
        text-color="white"
        dense
        :icon="chipIcon"
        class="q-ma-none"
        size="sm"
      >
        {{ chipLabel }}
      </q-chip>
    </div>

    <!-- Pantalla principal de peso (estilo display 7 segmentos) -->
    <div class="bascula-screen">
      <div class="bascula-peso" :class="{ 'peso-estable': isStable, 'peso-inestable': conectado && !isStable }">
        {{ pesoFormateado }}
      </div>
      <div class="bascula-unidad">kg</div>
    </div>

    <!-- Indicadores de estado -->
    <div class="bascula-indicadores row items-center q-gutter-sm q-px-md q-pb-sm">
      <q-badge
        :color="isStable ? 'green' : 'orange'"
        :label="isStable ? 'ESTABLE' : 'INESTABLE'"
        class="text-weight-bold"
      />
      <q-badge
        v-if="conectado"
        color="blue-grey"
        :label="`RAW: ${pesoTextoRaw || '---'}`"
        class="text-caption"
        style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;"
      />
      <q-space />
      <span class="text-caption text-grey-5">
        {{ fechaHora }}
      </span>
    </div>

    <!-- Mensaje de error -->
    <transition name="fade">
      <div v-if="error" class="bascula-error row items-center q-px-md q-py-xs q-gutter-xs">
        <q-icon name="warning" color="negative" size="xs" />
        <span class="text-caption text-negative">{{ error }}</span>
      </div>
    </transition>

    <!-- Alerta si Web Serial no está disponible -->
    <div v-if="!serialDisponible" class="bascula-no-api q-pa-sm">
      <q-icon name="info" color="amber" size="xs" class="q-mr-xs" />
      <span class="text-caption text-amber-9">
        Requiere Chrome/Edge en escritorio y HTTPS o localhost.
      </span>
    </div>

    <!-- Botones de control -->
    <div class="bascula-controles row q-gutter-sm q-pa-md justify-center">
      <q-btn
        v-if="!conectado"
        :loading="cargando"
        :disable="!serialDisponible"
        color="primary"
        unelevated
        icon="usb"
        label="Conectar Báscula"
        @click="conectar"
        class="col-grow"
      >
        <template #loading>
          <q-spinner-dots />
          <span class="q-ml-xs">Conectando...</span>
        </template>
      </q-btn>

      <q-btn
        v-else
        :loading="cargando"
        color="negative"
        flat
        bordered
        icon="power_settings_new"
        label="Desconectar"
        @click="cerrarConexion"
        class="col-grow"
      />

      <!-- Botón de captura rápida del peso actual -->
      <q-btn
        v-if="conectado"
        :disable="!isStable || peso === 0"
        color="positive"
        unelevated
        icon="check_circle"
        label="Capturar Peso"
        @click="emitirPeso"
        class="col-grow"
      >
        <q-tooltip v-if="!isStable">Espera a que el peso se estabilice</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useBascula } from 'src/composables/useBascula';

// ─── Props ────────────────────────────────────────────────────────────────────

const props = defineProps({
  /** Si es true, se intenta conectar automáticamente al montar el componente */
  autoConectar: {
    type: Boolean,
    default: false,
  },
});

// ─── Emits ────────────────────────────────────────────────────────────────────

const emit = defineEmits([
  /** Se emite cuando el usuario presiona "Capturar Peso" con el peso estabilizado */
  'peso-capturado',
]);

// ─── Composable ───────────────────────────────────────────────────────────────

const {
  peso,
  pesoFormateado,
  pesoTextoRaw,
  conectado,
  cargando,
  error,
  isStable,
  serialDisponible,
  conectar,
  cerrarConexion,
} = useBascula();

// ─── Reloj en tiempo real ─────────────────────────────────────────────────────

const fechaHora = ref('');
let timerReloj: ReturnType<typeof setInterval> | null = null;

function actualizarReloj() {
  fechaHora.value = new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

onMounted(() => {
  actualizarReloj();
  timerReloj = setInterval(actualizarReloj, 1000);

  if (props.autoConectar) {
    void conectar();
  }
});

onUnmounted(() => {
  if (timerReloj) clearInterval(timerReloj);
});

// ─── Computed para el chip de estado ─────────────────────────────────────────

const chipColor = computed(() => {
  if (cargando.value) return 'amber';
  if (conectado.value) return 'positive';
  if (error.value) return 'negative';
  return 'grey-6';
});

const chipIcon = computed(() => {
  if (cargando.value) return 'sync';
  if (conectado.value) return 'wifi';
  return 'wifi_off';
});

const chipLabel = computed(() => {
  if (cargando.value) return 'Conectando...';
  if (conectado.value) return 'Conectado';
  if (error.value) return 'Error';
  return 'Desconectado';
});

// ─── Captura manual del peso ──────────────────────────────────────────────────

function emitirPeso() {
  if (!isStable.value || peso.value === 0) return;
  emit('peso-capturado', peso.value);
}
</script>

<style scoped>
/* ── Contenedor principal ─────────────────────────────────────────── */
.bascula-display {
  background: #1a1a2e;
  border-radius: 12px;
  border: 2px solid #2d2d4e;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
  min-width: 280px;
  max-width: 420px;
}

/* ── Encabezado ───────────────────────────────────────────────────── */
.bascula-header {
  display: flex;
  align-items: center;
  background: #16213e;
  color: #94a3b8;
  padding: 8px 12px;
  font-size: 0.8rem;
  border-bottom: 1px solid #2d2d4e;
}

/* ── Pantalla principal ───────────────────────────────────────────── */
.bascula-screen {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  background: #0f0f1a;
  padding: 20px 24px 12px 24px;
  gap: 8px;
  min-height: 100px;
}

/* Números de peso: fuente digital de 7 segmentos */
.bascula-peso {
  font-family: 'Courier New', 'Lucida Console', monospace;
  font-size: 3.5rem;
  font-weight: bold;
  letter-spacing: 0.05em;
  transition: color 0.3s ease;
  color: #4a5568; /* Apagado cuando no está conectado */
  text-shadow: none;
  min-width: 180px;
  text-align: right;
}

.bascula-peso.peso-estable {
  color: #48bb78;
  text-shadow: 0 0 20px rgba(72, 187, 120, 0.6), 0 0 40px rgba(72, 187, 120, 0.3);
}

.bascula-peso.peso-inestable {
  color: #ed8936;
  text-shadow: 0 0 16px rgba(237, 137, 54, 0.5);
  animation: parpadeo 0.8s ease-in-out infinite alternate;
}

@keyframes parpadeo {
  from { opacity: 1; }
  to   { opacity: 0.7; }
}

.bascula-unidad {
  font-family: 'Courier New', 'Lucida Console', monospace;
  font-size: 1.5rem;
  color: #718096;
  font-weight: bold;
  padding-bottom: 4px;
}

/* ── Indicadores ──────────────────────────────────────────────────── */
.bascula-indicadores {
  background: #12122a;
  border-top: 1px solid #2d2d4e;
  padding: 6px 12px;
  min-height: 32px;
}

/* ── Error ────────────────────────────────────────────────────────── */
.bascula-error {
  background: rgba(254, 68, 68, 0.1);
  border-top: 1px solid rgba(254, 68, 68, 0.3);
}

/* ── Sin API Serial ───────────────────────────────────────────────── */
.bascula-no-api {
  background: rgba(251, 191, 36, 0.1);
  border-top: 1px solid rgba(251, 191, 36, 0.3);
  display: flex;
  align-items: center;
}

/* ── Controles ────────────────────────────────────────────────────── */
.bascula-controles {
  background: #16213e;
  border-top: 1px solid #2d2d4e;
}

/* ── Transición fade para errores ─────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
