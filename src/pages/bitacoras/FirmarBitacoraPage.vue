<template>
  <q-page class="flex flex-center bg-grey-2" style="min-height:100vh">
    <div style="width:100%;max-width:480px;padding:24px 16px">

      <!-- Logo / Header -->
      <div class="text-center q-mb-xl">
        <div style="font-size:28px;font-weight:800;color:#1a2233;letter-spacing:1px">
          SISTEMA ALAZAN
        </div>
        <div class="text-caption text-grey-5 q-mt-xs">Firma Digital de Bitácoras</div>
      </div>

      <!-- Cargando info del token -->
      <div v-if="cargando" class="flex flex-center q-pa-xl">
        <q-spinner size="48px" color="primary" />
      </div>

      <!-- Token inválido -->
      <q-card v-else-if="errorToken" flat bordered class="q-pa-xl text-center">
        <q-icon name="error_outline" size="56px" color="red-4" />
        <div class="text-h6 q-mt-md text-grey-8">Enlace inválido</div>
        <div class="text-body2 text-grey-5 q-mt-sm">{{ errorToken }}</div>
      </q-card>

      <!-- Token expirado -->
      <q-card v-else-if="info?.expirado" flat bordered class="q-pa-xl text-center">
        <q-icon name="schedule" size="56px" color="orange-4" />
        <div class="text-h6 q-mt-md text-grey-8">Enlace expirado</div>
        <div class="text-body2 text-grey-5 q-mt-sm">
          Este enlace de firma ya no es válido. Solicita uno nuevo al administrador.
        </div>
      </q-card>

      <!-- Ya firmado -->
      <q-card v-else-if="info?.tokenUsado" flat bordered class="q-pa-xl text-center">
        <q-icon name="check_circle" size="56px" color="green-5" />
        <div class="text-h6 q-mt-md text-grey-8">Ya firmaste este documento</div>
        <div class="text-body2 text-grey-5 q-mt-sm">
          Tu firma fue registrada el {{ formatFecha(info.firmadoEn) }}.
        </div>
      </q-card>

      <!-- Firma exitosa -->
      <q-card v-else-if="firmaExitosa" flat bordered class="q-pa-xl text-center">
        <q-icon name="verified" size="72px" color="green-6" />
        <div class="text-h5 text-weight-bold q-mt-lg text-grey-9">¡Firma registrada!</div>
        <div class="text-body2 text-grey-6 q-mt-sm">
          Tu firma digital ha sido registrada exitosamente en el sistema.
        </div>
        <div class="q-mt-md text-caption text-grey-5">
          Bitácora: {{ info?.nombreBitacora }}<br>
          Fecha: {{ formatFecha(info?.fecha) }}
        </div>
      </q-card>

      <!-- Formulario de firma -->
      <q-card v-else-if="info" flat bordered>
        <!-- Header de la bitácora -->
        <div class="q-pa-lg" style="background:#1a2233">
          <div class="text-caption text-white" style="opacity:.6;letter-spacing:.5px">
            SOLICITUD DE FIRMA DIGITAL
          </div>
          <div class="text-h6 text-white text-weight-bold q-mt-xs">
            {{ info.nombreBitacora }}
          </div>
        </div>

        <q-card-section class="q-pt-lg">
          <!-- Info del documento -->
          <div class="q-mb-lg" style="border-left:4px solid #1a2233;padding-left:14px">
            <div class="text-body2 text-grey-8">
              <strong>Sección:</strong> {{ info.seccion }}
            </div>
            <div class="text-body2 text-grey-8 q-mt-xs">
              <strong>Fecha:</strong> {{ formatFecha(info.fecha) }}
            </div>
            <div class="text-body2 text-grey-8 q-mt-xs">
              <strong>Firmante:</strong> {{ info.nombreFirmante }}
            </div>
            <div class="text-caption text-grey-5 q-mt-xs">
              Cargo: {{ capitalizarRol(info.rolRequerido) }}
            </div>
          </div>

          <q-separator class="q-mb-lg" />

          <!-- Indicador de intentos -->
          <div v-if="intentosFallidos > 0"
            class="q-mb-md text-caption text-red-6 text-center">
            NIP incorrecto. Intento {{ intentosFallidos }} de {{ nipConfig.intentos }}.
          </div>

          <!-- Input NIP -->
          <div class="text-body2 text-grey-7 q-mb-sm text-weight-medium">
            Ingresa tu NIP personal para firmar:
          </div>
          <q-input
            v-model="nip"
            :type="mostrarNip ? 'text' : 'password'"
            :label="`NIP (${nipConfig.longitud} dígitos)`"
            outlined
            dense
            :maxlength="nipConfig.longitud"
            class="q-mb-md"
            @keyup.enter="firmar"
          >
            <template v-slot:append>
              <q-icon
                :name="mostrarNip ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="mostrarNip = !mostrarNip"
              />
            </template>
          </q-input>

          <!-- Error bloqueado -->
          <q-banner v-if="bloqueado" class="bg-red-1 text-red-8 q-mb-md" rounded>
            <template v-slot:avatar>
              <q-icon name="lock" color="red-6" />
            </template>
            Tu acceso está bloqueado temporalmente por demasiados intentos fallidos.
            Inténtalo en {{ nipConfig.tiempoBloqueo }} minutos.
          </q-banner>

          <!-- Error de firma -->
          <q-banner v-if="errorFirma" class="bg-red-1 text-red-8 q-mb-md" rounded>
            <template v-slot:avatar>
              <q-icon name="error" color="red-6" />
            </template>
            {{ errorFirma }}
          </q-banner>

          <q-btn
            unelevated
            label="Confirmar Firma"
            icon="draw"
            class="full-width"
            style="background:#1a2233;color:#fff;border-radius:8px;height:48px;font-size:15px"
            :loading="firmando"
            :disable="!nip || nip.length < 4 || bloqueado"
            @click="firmar"
          />

          <div class="text-caption text-grey-4 text-center q-mt-md">
            Tu firma tiene validez legal en el sistema.
          </div>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from 'src/boot/axios';

const route = useRoute();

interface TokenInfo {
  id: number;
  nombreFirmante: string;
  rolRequerido: string;
  tokenUsado: boolean;
  firmadoEn: string | null;
  expirado: boolean;
  nombreBitacora: string;
  codigoBitacora: string;
  seccion: string;
  fecha: string;
}

interface NipConfig {
  longitud: number;
  intentos: number;
  tiempoBloqueo: number;
}

const cargando      = ref(true);
const info          = ref<TokenInfo | null>(null);
const errorToken    = ref('');
const nip           = ref('');
const mostrarNip    = ref(false);
const firmando      = ref(false);
const firmaExitosa  = ref(false);
const errorFirma    = ref('');
const intentosFallidos = ref(0);
const bloqueado     = ref(false);
const nipConfig     = ref<NipConfig>({ longitud: 4, intentos: 3, tiempoBloqueo: 15 });

const token = route.query.token as string || '';

onMounted(async () => {
  if (!token) {
    errorToken.value = 'No se proporcionó un token de firma válido.';
    cargando.value = false;
    return;
  }

  try {
    const [resInfo, resNip] = await Promise.allSettled([
      api.get(`/api/bitacoras/token/${token}`),
      api.get('/api/bitacoras-config/nip-global'),
    ]);

    if (resInfo.status === 'fulfilled') {
      info.value = resInfo.value.data;
    } else {
      errorToken.value = 'Este enlace de firma no es válido o no fue encontrado.';
    }

    if (resNip.status === 'fulfilled') {
      const cfg = resNip.value.data;
      nipConfig.value = {
        longitud: cfg.longitudNip ?? 4,
        intentos: cfg.intentos ?? 3,
        tiempoBloqueo: cfg.tiempoBloqueo ?? 15,
      };
    }
  } finally {
    cargando.value = false;
  }
});

async function firmar() {
  if (!nip.value || nip.value.length < 4 || bloqueado.value) return;
  errorFirma.value = '';
  firmando.value = true;

  try {
    await api.post('/api/bitacoras/firmar', { token, nip: nip.value });
    firmaExitosa.value = true;
  } catch (err: unknown) {
    const errData = (err as { response?: { data?: { message?: string; nipInvalido?: boolean } } })?.response?.data;
    const msg = errData?.message ?? 'Error al registrar firma';

    if (errData?.nipInvalido) {
      intentosFallidos.value++;
      errorFirma.value = msg;
      nip.value = '';

      if (intentosFallidos.value >= nipConfig.value.intentos) {
        bloqueado.value = true;
        errorFirma.value = '';
      }
    } else {
      errorFirma.value = msg;
    }
  } finally {
    firmando.value = false;
  }
}

function formatFecha(val: string | null | undefined): string {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function capitalizarRol(rol: string): string {
  const map: Record<string, string> = {
    operativo: 'Operativo', supervisor: 'Supervisor',
    gerente: 'Gerente', recepcion: 'Recepción',
  };
  return map[rol] ?? rol;
}
</script>
