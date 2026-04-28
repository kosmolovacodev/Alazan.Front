<template>
  <q-btn flat round dense icon="notifications" color="white" @click="fetchNotificaciones">
    <q-badge v-if="count > 0" color="red" floating>{{ count > 9 ? '9+' : count }}</q-badge>
    <q-tooltip>Firmas de bitácoras pendientes</q-tooltip>

    <q-menu anchor="bottom right" self="top right" :offset="[0, 8]" style="min-width:340px; max-width:440px">
      <q-list>
        <q-item-label header class="row items-center q-pb-xs">
          <q-icon name="draw" size="sm" color="orange-8" class="q-mr-sm" />
          <span class="text-weight-bold text-grey-8">Firmas Pendientes</span>
          <q-space />
          <q-btn flat dense round icon="refresh" size="sm" color="grey-6" @click.stop="fetchNotificaciones" />
        </q-item-label>
        <q-separator />

        <div v-if="cargando" class="flex flex-center q-pa-lg">
          <q-spinner color="orange-8" size="28px" />
        </div>

        <template v-else-if="notificaciones.length === 0">
          <q-item>
            <q-item-section class="text-center q-py-lg">
              <q-icon name="check_circle" size="36px" color="positive" class="q-mb-sm" />
              <div class="text-caption text-grey-6">Sin firmas pendientes</div>
            </q-item-section>
          </q-item>
        </template>

        <q-item
          v-for="n in notificaciones"
          :key="n.firmaId"
          v-close-popup
          clickable
          v-ripple
          class="q-py-sm"
          @click="irAFirmar(n)"
        >
          <q-item-section avatar>
            <div class="notif-icon-wrap" :style="{ background: (n.seccionColor || '#e65100') + '22' }">
              <q-icon
                :name="n.seccionIcono || 'description'"
                size="20px"
                :style="{ color: n.seccionColor || '#e65100' }"
              />
            </div>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold text-grey-9" style="font-size:13px">
              {{ n.nombreBitacora }}
            </q-item-label>
            <q-item-label caption class="text-grey-6">
              {{ n.nombreSeccion }}
            </q-item-label>
            <q-item-label caption>
              <q-chip dense outline color="orange-8" size="xs" icon="draw" :label="n.etiqueta" />
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-icon name="chevron_right" color="grey-4" size="18px" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';
import { useNotificacionesStore } from 'src/stores/notificacionesStore';

interface Notificacion {
  firmaId: number;
  documentoId: number;
  rolRequerido: string;
  etiqueta: string;
  codigoBitacora: string;
  sedeId: number;
  fecha: string;
  status: string;
  nombreBitacora: string;
  seccionCodigo: string;
  nombreSeccion: string;
  seccionColor: string;
  seccionIcono: string;
}

const authStore         = useAuthStore();
const notifStore        = useNotificacionesStore();
const router            = useRouter();
const notificaciones    = ref<Notificacion[]>([]);
const cargando          = ref(false);
let   pollTimer: ReturnType<typeof setInterval> | null = null;

const count = computed(() => notificaciones.value.length);

async function fetchNotificaciones() {
  if (!authStore.isLoggedIn) return;
  cargando.value = true;
  try {
    const { data } = await api.get('/api/bitacoras/mis-notificaciones', {
      params: { sedeId: authStore.sedeActivaId ?? 0 },
    });
    notificaciones.value = Array.isArray(data) ? data : [];
  } catch {
    notificaciones.value = [];
  } finally {
    cargando.value = false;
  }
}

function irAFirmar(n: Notificacion) {
  void router.push({
    path: '/bitacoras',
    query: {
      doc: String(n.documentoId),
      sec: n.seccionCodigo,
      bit: n.codigoBitacora,
    },
  });
}

// Re-fetch cuando cambia sede o cuando BitacorasPage dispara una firma
watch(() => authStore.sedeActivaId, () => void fetchNotificaciones());
watch(() => notifStore.pulso,       () => void fetchNotificaciones());

onMounted(() => {
  void fetchNotificaciones();
  pollTimer = setInterval(() => void fetchNotificaciones(), 30_000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
.notif-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
