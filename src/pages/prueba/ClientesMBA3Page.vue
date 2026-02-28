<template>
  <q-page padding>
    <div class="q-mb-lg">
      <div class="text-h5 q-mb-xs">Prueba Conexión MBA3</div>
      <div class="text-caption text-grey">
        Endpoint: POST /ws_Consulta_externa_MBA3/ — Clientes BGAR1
      </div>
    </div>

    <!-- Estado del token -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <div class="text-subtitle2">Token MBA3 (CON003):</div>

          <q-chip :color="tokenColor" text-color="white" :icon="tokenIcon" :label="tokenLabel" />

          <div v-if="tokenInfo.status === 'activo'" class="text-caption text-grey">
            Renueva en {{ tokenInfo.segundosRestantes }}s
          </div>
        </div>

        <!-- Selector de formato Authorization (para debugging) -->
        <div class="q-mt-sm row items-center q-gutter-sm">
          <div class="text-caption text-grey">Formato Authorization:</div>
          <q-btn-toggle
            v-model="authFormat"
            dense
            unelevated
            :options="[
              { label: 'JWT directo', value: 'direct' },
              { label: 'Bearer JWT', value: 'bearer' },
            ]"
            size="sm"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Controles -->
    <div class="row q-gutter-sm q-mb-md">
      <q-btn
        color="primary"
        icon="search"
        label="Consultar Clientes"
        :loading="loading"
        @click="consultarClientes"
      />
      <q-btn
        color="orange"
        icon="refresh"
        label="Forzar nuevo token"
        outline
        :loading="refreshing"
        @click="forzarNuevoToken"
      />
      <q-btn
        color="grey"
        icon="delete"
        label="Limpiar resultado"
        flat
        @click="
          resultado = null;
          error = null;
        "
      />
    </div>

    <!-- Error -->
    <q-banner v-if="error" class="bg-red-1 text-red-9 q-mb-md" rounded>
      <template #avatar>
        <q-icon name="error" color="red" />
      </template>
      <div class="text-subtitle2">Error en la petición</div>
      <div class="text-caption">{{ error }}</div>
      <div v-if="error.includes('authorization')" class="q-mt-sm text-caption">
        <strong>Sugerencia:</strong> Prueba cambiar el formato Authorization a "Bearer JWT"
      </div>
    </q-banner>

    <!-- Resultado -->
    <q-card v-if="resultado !== null" flat bordered>
      <q-card-section>
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle2">
            Resultado
            <q-badge
              v-if="totalRegistros > 0"
              color="green"
              :label="`${totalRegistros} registros`"
              class="q-ml-sm"
            />
          </div>
          <q-btn-toggle
            v-model="vistaResultado"
            dense
            unelevated
            :options="[
              { label: 'Tabla', value: 'tabla' },
              { label: 'JSON', value: 'json' },
            ]"
            size="sm"
          />
        </div>

        <!-- Vista Tabla -->
        <div v-if="vistaResultado === 'tabla' && Array.isArray(resultado)">
          <q-table
            :rows="resultado"
            :columns="columnasAuto"
            row-key="index"
            dense
            flat
            :rows-per-page-options="[10, 25, 50]"
            rows-per-page-label="Filas"
          />
        </div>

        <!-- Vista JSON -->
        <div v-else>
          <pre class="json-output">{{ JSON.stringify(resultado, null, 2) }}</pre>
        </div>
      </q-card-section>
    </q-card>

    <!-- Log de peticiones -->
    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="text-subtitle2">Log de peticiones</div>
          <q-btn flat dense icon="delete" size="sm" @click="logs = []" />
        </div>
        <div v-if="logs.length === 0" class="text-caption text-grey q-mt-sm">Sin registros aún</div>
        <q-list dense separator v-else>
          <q-item v-for="(log, i) in logs" :key="i">
            <q-item-section avatar>
              <q-icon
                :name="log.ok ? 'check_circle' : 'cancel'"
                :color="log.ok ? 'green' : 'red'"
                size="xs"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-caption">{{ log.hora }} — {{ log.mensaje }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { mba3Request } from 'src/services/mba3Api';
import { useMba3Store } from 'src/stores/mba3Store';

// ── Credenciales de este módulo ──────────────────────────────────────────────
const CODIGO = 'CON003';
const PWD = 'zaqxsw97531';

// ── Estado ───────────────────────────────────────────────────────────────────
const loading = ref(false);
const refreshing = ref(false);
const error = ref<string | null>(null);
const resultado = ref<unknown>(null);
const vistaResultado = ref<'tabla' | 'json'>('json');
const authFormat = ref<'direct' | 'bearer'>('direct');

interface LogEntry {
  hora: string;
  mensaje: string;
  ok: boolean;
}
const logs = ref<LogEntry[]>([]);

const mba3Store = useMba3Store();

// ── Token status reactivo ────────────────────────────────────────────────────
const tokenInfo = computed(() => mba3Store.tokenInfo(CODIGO));

const tokenColor = computed(() => {
  const s = tokenInfo.value.status;
  if (s === 'activo') return 'green';
  if (s === 'expirado') return 'red';
  return 'grey';
});

const tokenIcon = computed(() => {
  const s = tokenInfo.value.status;
  if (s === 'activo') return 'check_circle';
  if (s === 'expirado') return 'warning';
  return 'radio_button_unchecked';
});

const tokenLabel = computed(() => {
  const s = tokenInfo.value.status;
  if (s === 'activo') return `Activo (${tokenInfo.value.segundosRestantes}s)`;
  if (s === 'expirado') return 'Expirado';
  return 'Sin token';
});

// ── Resultado en tabla ───────────────────────────────────────────────────────
const totalRegistros = computed(() => {
  if (Array.isArray(resultado.value)) return resultado.value.length;
  return 0;
});

const columnasAuto = computed(() => {
  if (!Array.isArray(resultado.value) || resultado.value.length === 0) return [];
  const firstRow = resultado.value[0] as Record<string, unknown>;
  return Object.keys(firstRow).map((key) => ({
    name: key,
    label: key,
    field: key,
    align: 'left' as const,
    sortable: true,
  }));
});

// ── Actualización visual del contador ────────────────────────────────────────
let tickInterval: ReturnType<typeof setInterval> | null = null;
const _tick = ref(0); // reactivo para forzar recalculo del computed cada segundo

onMounted(() => {
  tickInterval = setInterval(() => {
    _tick.value++;
  }, 1000);
});

onUnmounted(() => {
  if (tickInterval) clearInterval(tickInterval);
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function addLog(mensaje: string, ok: boolean) {
  const hora = new Date().toLocaleTimeString('es-MX');
  logs.value.unshift({ hora, mensaje, ok });
  if (logs.value.length > 20) logs.value.pop();
}

// ── Acciones ─────────────────────────────────────────────────────────────────
async function consultarClientes() {
  loading.value = true;
  error.value = null;

  try {
    const usarBearer = authFormat.value === 'bearer';

    const data = await mba3Request({
      method: 'post',
      endpoint: '/ws_Consulta_externa_MBA3/',
      codigo: CODIGO,
      pwd: PWD,
      useBearerPrefix: usarBearer,
      formData: {
        select: '*',
        from: 'CLNT_Ficha_Principal',
        where: "EMPRESA='BGAR1'",
        limit: '1',
      },
    });

    resultado.value = data;
    addLog(`Clientes consultados: ${Array.isArray(data) ? data.length : '?'} registros`, true);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    error.value = msg;
    addLog(`Error: ${msg}`, false);
  } finally {
    loading.value = false;
  }
}

async function forzarNuevoToken() {
  refreshing.value = true;
  error.value = null;
  try {
    await mba3Store.forceRefresh(CODIGO, PWD);
    addLog('Token renovado manualmente', true);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    error.value = msg;
    addLog(`Error al renovar token: ${msg}`, false);
  } finally {
    refreshing.value = false;
  }
}
</script>

<style scoped>
.json-output {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
