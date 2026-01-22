<template>
  <q-card bordered class="shadow-10" style="border: 2px solid #ef4444">
    <!-- Header -->
    <div
      class="q-pa-md text-white"
      style="background: linear-gradient(90deg, #dc2626 0%, #ea580c 100%)"
    >
      <div class="row items-center q-gutter-md">
        <q-icon name="warning" size="40px" />
        <div>
          <div class="text-h5 text-weight-bold">⚠️ Base de Datos No Configurada</div>
          <div class="text-body2" style="opacity: 0.9">
            No se puede conectar a Supabase. Sigue estos pasos para configurar la base de datos.
          </div>
        </div>
      </div>
    </div>

    <q-card-section class="q-pa-md" style="display: grid; gap: 16px">
      <!-- Error message -->
      <q-banner v-if="error" rounded class="bg-red-1 text-red-10" style="border: 2px solid #fca5a5">
        <template #avatar>
          <q-icon name="error" />
        </template>

        <div class="text-weight-bold q-mb-xs">🔴 Error detectado:</div>
        <div
          class="bg-white q-pa-sm rounded-borders text-body2"
          style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        >
          {{ error }}
        </div>
      </q-banner>

      <!-- Explicación del problema -->
      <q-banner rounded class="bg-red-1 text-red-10" style="border: 2px solid #fca5a5">
        <template #avatar>
          <q-icon name="info" />
        </template>

        <div class="text-weight-bold q-mb-xs">🔴 ¿Por qué veo este mensaje?</div>
        <div class="text-body2">
          La aplicación no puede acceder a la base de datos porque:
          <ul class="q-mt-sm q-pl-md">
            <li>Las tablas aún no han sido creadas en Supabase</li>
            <li>Las políticas de seguridad (RLS) están bloqueando el acceso</li>
          </ul>
        </div>
      </q-banner>

      <!-- Paso 1 -->
      <q-card flat bordered class="bg-purple-1" style="border: 2px solid #d8b4fe">
        <q-card-section>
          <div class="row items-center q-gutter-sm q-mb-sm">
            <div
              class="row items-center justify-center text-white text-weight-bold"
              style="width: 32px; height: 32px; border-radius: 999px; background: #7c3aed"
            >
              1
            </div>
            <div class="text-subtitle1 text-weight-bold" style="color: #4c1d95">
              Abre el SQL Editor de Supabase
            </div>
          </div>

          <div class="text-body2" style="color: #5b21b6">
            Haz clic en este botón para abrir el SQL Editor en una nueva pestaña:
          </div>

          <div class="q-mt-md">
            <q-btn
              color="deep-purple-7"
              unelevated
              icon-right="open_in_new"
              label="Abrir SQL Editor en Supabase"
              :href="sqlEditorUrl"
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Paso 2 -->
      <q-card flat bordered class="bg-green-1" style="border: 2px solid #86efac">
        <q-card-section>
          <div class="row items-center q-gutter-sm q-mb-sm">
            <div
              class="row items-center justify-center text-white text-weight-bold"
              style="width: 32px; height: 32px; border-radius: 999px; background: #16a34a"
            >
              2
            </div>
            <div class="text-subtitle1 text-weight-bold" style="color: #14532d">
              Copia y ejecuta el Script 1 (Crear Tablas)
            </div>
          </div>

          <div class="text-body2" style="color: #166534">En tu aplicación:</div>

          <ol class="q-mt-sm q-pl-md" style="color: #166534">
            <li>Ve a <strong>Configuración → Scripts SQL</strong></li>
            <li>Haz clic en <strong>"Copiar Script"</strong> del Script 1</li>
            <li>Pega el script en el SQL Editor de Supabase</li>
            <li>
              Presiona <strong>"RUN"</strong> o
              <code class="bg-white q-px-sm q-py-xs rounded-borders">Ctrl + Enter</code>
            </li>
            <li>Espera a que termine (verás "Tablas creadas correctamente")</li>
          </ol>
        </q-card-section>
      </q-card>

      <!-- Paso 3 -->
      <q-card flat bordered class="bg-orange-1" style="border: 2px solid #fdba74">
        <q-card-section>
          <div class="row items-center q-gutter-sm q-mb-sm">
            <div
              class="row items-center justify-center text-white text-weight-bold"
              style="width: 32px; height: 32px; border-radius: 999px; background: #ea580c"
            >
              3
            </div>
            <div class="text-subtitle1 text-weight-bold" style="color: #7c2d12">
              Copia y ejecuta el Script 2 (Desactivar RLS)
            </div>
          </div>

          <div class="text-body2 q-mb-sm" style="color: #9a3412">
            <strong>MUY IMPORTANTE:</strong> Este paso es OBLIGATORIO
          </div>

          <ol class="q-pl-md" style="color: #9a3412">
            <li>En <strong>Configuración → Scripts SQL</strong></li>
            <li>Haz clic en <strong>"Copiar Script"</strong> del Script 2</li>
            <li>Pega el script en una <strong>nueva query</strong> en Supabase</li>
            <li>Presiona <strong>"RUN"</strong></li>
            <li>Deberías ver "✅ RLS DESACTIVADO" en todas las tablas</li>
          </ol>
        </q-card-section>
      </q-card>

      <!-- Paso 4 -->
      <q-card flat bordered class="bg-blue-1" style="border: 2px solid #93c5fd">
        <q-card-section>
          <div class="row items-center q-gutter-sm q-mb-sm">
            <div
              class="row items-center justify-center text-white text-weight-bold"
              style="width: 32px; height: 32px; border-radius: 999px; background: #2563eb"
            >
              4
            </div>
            <div class="text-subtitle1 text-weight-bold" style="color: #1e3a8a">
              Recarga la aplicación
            </div>
          </div>

          <div class="text-body2" style="color: #1d4ed8">Después de ejecutar ambos scripts:</div>

          <ol class="q-mt-sm q-pl-md" style="color: #1d4ed8">
            <li>
              Presiona <code class="bg-white q-px-sm q-py-xs rounded-borders">F5</code> para
              recargar
            </li>
            <li>Ve a <strong>Configuración → Diagnóstico BD</strong></li>
            <li>Ejecuta el diagnóstico para verificar que todo funcione</li>
          </ol>
        </q-card-section>
      </q-card>

      <!-- Ayuda visual -->
      <q-banner rounded class="bg-grey-2 text-grey-9" style="border: 1px solid #d1d5db">
        <template #avatar>
          <q-icon name="check_circle" color="positive" />
        </template>
        <div>
          <div class="text-weight-bold">¿Necesitas ayuda visual?</div>
          <div class="text-body2">
            Si prefieres, puedes ir a <strong>Configuración → Scripts SQL</strong> donde encontrarás
            instrucciones detalladas con los scripts listos para copiar.
          </div>
        </div>
      </q-banner>

      <!-- Warning -->
      <q-banner rounded class="bg-yellow-1 text-yellow-10" style="border-left: 4px solid #eab308">
        <template #avatar>
          <q-icon name="warning" color="warning" />
        </template>
        <div>
          <div class="text-weight-bold">⚠️ IMPORTANTE: No omitas el Script 2</div>
          <div class="text-body2">
            Muchos usuarios olvidan ejecutar el Script 2 (Desactivar RLS) y por eso la aplicación no
            funciona. Asegúrate de ejecutar <strong>AMBOS</strong> scripts en orden.
          </div>
        </div>
      </q-banner>
    </q-card-section>

    <q-separator />

    <!-- Footer -->
    <q-card-section class="row items-center justify-between bg-grey-2">
      <div class="text-body2 text-grey-7">💡 Tiempo estimado: 2-3 minutos</div>

      <q-btn v-if="hasRetry" flat color="grey-8" label="Reintentar" @click="emit('retry')" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// import { projectId } from '@/utils/supabase/info' // ajusta ruta según tu proyecto real
// En TSX venía como: /utils/supabase/info.tsx  :contentReference[oaicite:1]{index=1}

const props = defineProps<{
  error?: string;
  onRetry?: () => void;
}>();

const emit = defineEmits<{
  (e: 'retry'): void;
}>();

/**
 * En React el botón solo aparece si onRetry existe.
 */
const hasRetry = computed(() => typeof props.onRetry === 'function');

/**
 * URL equivalente:
 * https://supabase.com/dashboard/project/${projectId}/sql/new
 */
const sqlEditorUrl = computed(() => `https://supabase.com/dashboard/project/${projectId}/sql/new`);
</script>
