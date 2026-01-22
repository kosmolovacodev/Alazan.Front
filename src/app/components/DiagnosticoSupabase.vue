<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="q-mb-md">
      <div class="text-h6 text-weight-bold">🔍 Diagnóstico de Conexión Supabase</div>
      <div class="text-body2 text-grey-7 q-mt-xs">
        Ejecuta este diagnóstico para verificar que la conexión a Supabase funciona correctamente.
      </div>

      <q-btn
        class="q-mt-md"
        color="purple"
        :disable="loading"
        :loading="loading"
        @click="ejecutarDiagnostico"
        :label="loading ? '🔄 Ejecutando diagnóstico...' : '▶️ Ejecutar Diagnóstico'"
      />
    </div>

    <!-- Guía rápida (siempre visible) -->
    <q-card flat bordered class="bg-purple-1 q-mb-md">
      <q-card-section>
        <div class="row items-center q-col-gutter-sm">
          <div class="text-h5">📚</div>
          <div class="text-subtitle1 text-weight-bold text-purple-10">
            Guía Rápida de Configuración
          </div>
        </div>

        <div class="q-mt-md column q-gutter-md">
          <!-- Paso 1 -->
          <q-card flat bordered class="bg-white">
            <q-card-section>
              <div class="text-subtitle2 text-weight-bold text-purple-9">
                🔗 Paso 1: Abrir Supabase SQL Editor
              </div>
              <div class="text-body2 text-grey-8 q-mt-sm">
                Abre el SQL Editor de tu proyecto de Supabase:
              </div>

              <q-btn
                class="q-mt-md"
                color="purple"
                :href="sqlEditorUrl"
                target="_blank"
                rel="noopener noreferrer"
                icon="open_in_new"
                label="Abrir SQL Editor en Supabase"
              />
            </q-card-section>
          </q-card>

          <!-- Paso 2 -->
          <q-card flat bordered class="bg-white">
            <q-card-section>
              <div class="text-subtitle2 text-weight-bold text-purple-9">
                📝 Paso 2: Ejecutar Scripts
              </div>
              <div class="text-body2 text-grey-8 q-mt-sm">
                Ve a la pestaña <span class="text-weight-bold">"Scripts SQL"</span> en el menú de
                Configuración y ejecuta los scripts en orden.
              </div>

              <div class="q-mt-md column q-gutter-sm">
                <div class="row items-center q-gutter-sm">
                  <q-badge color="green" rounded>1</q-badge>
                  <div class="text-body2">
                    <span class="text-weight-bold">Script 1: Crear Tablas</span> - Ejecutar PRIMERO
                  </div>
                </div>
                <div class="row items-center q-gutter-sm">
                  <q-badge color="orange" rounded>2</q-badge>
                  <div class="text-body2">
                    <span class="text-weight-bold">Script 2: Desactivar RLS</span> - Ejecutar
                    SEGUNDO
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Paso 3 -->
          <q-card flat bordered class="bg-white">
            <q-card-section>
              <div class="text-subtitle2 text-weight-bold text-purple-9">✅ Paso 3: Verificar</div>
              <div class="text-body2 text-grey-8 q-mt-sm">
                Después de ejecutar los scripts, haz click en "▶️ Ejecutar Diagnóstico" arriba para
                verificar que todo funcione.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resultado -->
    <div v-if="diagnostico" class="column q-gutter-md">
      <!-- Configuración -->
      <q-card flat bordered class="bg-blue-1">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-blue-10 q-mb-sm">📊 Configuración</div>

          <div class="column q-gutter-xs text-body2">
            <div class="row items-center q-gutter-sm">
              <div class="text-weight-bold">Project ID:</div>
              <q-chip dense color="white" text-color="black">{{
                diagnostico.config.projectId
              }}</q-chip>
              <q-btn
                flat
                dense
                icon="content_copy"
                @click="copiarAlPortapapeles(String(diagnostico.config.projectId))"
                aria-label="Copiar Project ID"
              />
            </div>

            <div class="row items-center q-gutter-sm">
              <div class="text-weight-bold">URL:</div>
              <q-chip dense color="white" text-color="black">{{
                diagnostico.config.supabaseUrl
              }}</q-chip>
              <q-btn
                flat
                dense
                icon="content_copy"
                @click="copiarAlPortapapeles(String(diagnostico.config.supabaseUrl))"
                aria-label="Copiar URL"
              />
            </div>

            <div class="row items-center q-gutter-sm">
              <div class="text-weight-bold">API Key:</div>
              <div v-if="diagnostico.config.hasApiKey" class="text-green-8">
                ✅ Configurada ({{ diagnostico.config.apiKeyLength }} caracteres)
              </div>
              <div v-else class="text-red-8">❌ No configurada</div>
            </div>

            <div class="text-caption text-grey-7 q-mt-sm">
              Ejecutado: {{ diagnostico.timestamp }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tests -->
      <div class="column q-gutter-sm">
        <q-card
          v-for="entry in testsEntries"
          :key="entry.key"
          flat
          bordered
          :class="statusBgClass(entry.test.status)"
        >
          <q-card-section>
            <div class="row no-wrap items-start q-gutter-sm">
              <div class="text-h6">{{ statusIcon(entry.test.status) }}</div>

              <div class="col">
                <div class="text-weight-bold">{{ entry.test.nombre }}</div>

                <div v-if="entry.test.detalles" class="text-body2 text-grey-8 q-mt-xs">
                  {{ entry.test.detalles }}
                </div>

                <div v-if="entry.test.code" class="text-caption text-grey-7 q-mt-xs">
                  Código: {{ entry.test.code }}
                </div>

                <div v-if="entry.test.hint" class="text-caption text-grey-7 q-mt-xs">
                  Sugerencia: {{ entry.test.hint }}
                </div>

                <q-card v-if="entry.test.solucion" flat bordered class="q-mt-sm bg-white">
                  <q-card-section class="q-pa-sm">
                    <div class="text-body2 text-weight-bold">💡 Solución:</div>
                    <div class="text-body2 text-grey-8">
                      {{ entry.test.solucion }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Resumen -->
      <q-card flat bordered class="bg-grey-1">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-sm">📝 Resumen</div>

          <div v-if="allSuccess" class="row items-center q-gutter-sm text-green-9">
            <div class="text-h5">🎉</div>
            <div class="text-body2">
              <span class="text-weight-bold">¡Todo funciona correctamente!</span>
              La conexión a Supabase está configurada y las tablas son accesibles.
            </div>
          </div>

          <div v-else class="text-red-9">
            <div class="row items-start q-gutter-sm">
              <div class="text-h5">⚠️</div>
              <div class="col">
                <div class="text-weight-bold q-mb-sm">Hay problemas que necesitan resolverse:</div>

                <ol class="q-pl-md">
                  <li v-for="(t, idx) in errorTests" :key="idx">
                    {{ t.nombre }}
                  </li>
                </ol>

                <q-card flat bordered class="bg-yellow-1 q-mt-md">
                  <q-card-section>
                    <div class="text-weight-bold text-yellow-10 q-mb-sm">🔧 Pasos sugeridos:</div>
                    <ol class="q-pl-md text-body2 text-yellow-10">
                      <li>
                        Ejecuta el script
                        <q-chip dense color="white" text-color="black"
                          >/database/quick_init.sql</q-chip
                        >
                        para crear las tablas
                      </li>
                      <li>
                        Ejecuta el script
                        <q-chip dense color="white" text-color="black"
                          >/database/EJECUTAR_PRIMERO.sql</q-chip
                        >
                        para desactivar RLS
                      </li>
                      <li>Recarga esta página y ejecuta el diagnóstico de nuevo</li>
                    </ol>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Notify, copyToClipboard } from 'quasar';

// import { supabase } from '@/lib/supabase';
// import { projectId, publicAnonKey } from '/utils/supabase/info.tsx';

type TestStatus = 'pending' | 'success' | 'error' | 'warning';

type DiagnosticoTest = {
  nombre: string;
  status: TestStatus;
  detalles?: string;
  code?: string;
  hint?: string;
  solucion?: string;
};

type DiagnosticoResultado = {
  timestamp: string;
  config: {
    projectId: string;
    supabaseUrl: string;
    hasApiKey: boolean;
    apiKeyLength: number;
  };
  tests: Record<string, DiagnosticoTest>;
};

const diagnostico = ref<DiagnosticoResultado | null>(null);
const loading = ref<boolean>(false);

const sqlEditorUrl = computed(() => `https://supabase.com/dashboard/project/${projectId}/sql/new`);

const testsEntries = computed(() => {
  const d = diagnostico.value;
  if (!d) return [];
  return Object.entries(d.tests).map(([key, test]) => ({ key, test }));
});

const allSuccess = computed(() => {
  const d = diagnostico.value;
  if (!d) return false;
  return Object.values(d.tests).every((t) => t.status === 'success');
});

const errorTests = computed(() => {
  const d = diagnostico.value;
  if (!d) return [];
  return Object.values(d.tests).filter((t) => t.status === 'error');
});

function statusIcon(status: TestStatus): string {
  switch (status) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    default:
      return '⏳';
  }
}

function statusBgClass(status: TestStatus): string {
  switch (status) {
    case 'success':
      return 'bg-green-1';
    case 'error':
      return 'bg-red-1';
    case 'warning':
      return 'bg-yellow-1';
    default:
      return 'bg-grey-1';
  }
}

async function copiarAlPortapapeles(texto: string): Promise<void> {
  try {
    await copyToClipboard(texto);
    Notify.create({ type: 'positive', message: 'Copiado al portapapeles' });
  } catch {
    Notify.create({ type: 'negative', message: 'No se pudo copiar' });
  }
}

async function ejecutarDiagnostico(): Promise<void> {
  loading.value = true;

  const resultado: DiagnosticoResultado = {
    timestamp: new Date().toLocaleString(),
    config: {
      projectId: String(projectId),
      supabaseUrl: `https://${projectId}.supabase.co`,
      hasApiKey: !!publicAnonKey,
      apiKeyLength: (publicAnonKey as string | undefined)?.length || 0,
    },
    tests: {},
  };

  // Test 1: Verificar URL
  resultado.tests.urlAccesible = {
    nombre: '🌐 URL de Supabase accesible',
    status: 'pending',
  };

  try {
    const response = await fetch(`https://${projectId}.supabase.co/rest/v1/`, { method: 'HEAD' });
    resultado.tests.urlAccesible.status = response.ok ? 'success' : 'error';
    resultado.tests.urlAccesible.detalles = `Status: ${response.status}`;
  } catch (error: any) {
    resultado.tests.urlAccesible.status = 'error';
    resultado.tests.urlAccesible.detalles = error?.message || 'Error desconocido';
    resultado.tests.urlAccesible.solucion = 'Verifica que tu Project ID sea correcto en Supabase';
  }

  // Test 2: Verificar tabla roles
  resultado.tests.tablaRoles = {
    nombre: '📋 Tabla "roles" existe y es accesible',
    status: 'pending',
  };

  try {
    const { data, error } = await supabase.from('roles').select('*').limit(1);
    if (error) {
      resultado.tests.tablaRoles.status = 'error';
      resultado.tests.tablaRoles.detalles = error.message;
      resultado.tests.tablaRoles.code = (error as any).code;
      resultado.tests.tablaRoles.hint = (error as any).hint;

      // Detectar si es problema de RLS
      const code = (error as any).code as string | undefined;
      const msg = String(error.message || '');

      if (
        code === 'PGRST116' ||
        msg.includes('permission denied') ||
        msg.includes('row-level security')
      ) {
        resultado.tests.tablaRoles.solucion =
          '⚠️ RLS está bloqueando el acceso. Ve a la pestaña "Scripts SQL" y ejecuta el Script 2 (Desactivar RLS)';
      } else if (code === '42P01' || msg.includes('does not exist')) {
        resultado.tests.tablaRoles.solucion =
          '⚠️ La tabla no existe. Ve a la pestaña "Scripts SQL" y ejecuta el Script 1 (Crear Tablas)';
      } else {
        resultado.tests.tablaRoles.solucion =
          'Ve a la pestaña "Scripts SQL" y ejecuta ambos scripts en orden';
      }
    } else {
      resultado.tests.tablaRoles.status = 'success';
      resultado.tests.tablaRoles.detalles = `✅ Tabla accesible. Registros encontrados: ${data?.length || 0}`;
    }
  } catch (error: any) {
    resultado.tests.tablaRoles.status = 'error';
    const msg = error?.message || 'Error desconocido';
    resultado.tests.tablaRoles.detalles = msg;

    if (msg === 'Failed to fetch' || msg.includes('fetch')) {
      resultado.tests.tablaRoles.solucion =
        '🔴 Error de conexión. Posibles causas:\n1. Las tablas no existen (ejecuta Script 1)\n2. RLS está activado (ejecuta Script 2)\n3. Problema de red o CORS';
    }
  }

  // Test 3: Verificar tabla usuarios
  resultado.tests.tablaUsuarios = {
    nombre: '👤 Tabla "usuarios" existe y es accesible',
    status: 'pending',
  };

  try {
    const { data, error } = await supabase.from('usuarios').select('*').limit(1);
    if (error) {
      resultado.tests.tablaUsuarios.status = 'error';
      resultado.tests.tablaUsuarios.detalles = error.message;
      resultado.tests.tablaUsuarios.code = (error as any).code;

      const code = (error as any).code as string | undefined;
      const msg = String(error.message || '');

      if (
        code === 'PGRST116' ||
        msg.includes('permission denied') ||
        msg.includes('row-level security')
      ) {
        resultado.tests.tablaUsuarios.solucion =
          '⚠️ RLS está bloqueando el acceso. Ejecuta el Script 2';
      } else if (code === '42P01' || msg.includes('does not exist')) {
        resultado.tests.tablaUsuarios.solucion = '⚠️ La tabla no existe. Ejecuta el Script 1';
      }
    } else {
      resultado.tests.tablaUsuarios.status = 'success';
      resultado.tests.tablaUsuarios.detalles = `✅ Tabla accesible. Registros encontrados: ${data?.length || 0}`;
    }
  } catch (error: any) {
    resultado.tests.tablaUsuarios.status = 'error';
    const msg = error?.message || 'Error desconocido';
    resultado.tests.tablaUsuarios.detalles = msg;

    if (msg === 'Failed to fetch' || msg.includes('fetch')) {
      resultado.tests.tablaUsuarios.solucion =
        'Ejecuta los Scripts SQL en la pestaña correspondiente';
    }
  }

  // Test 4: Verificar tabla productores
  resultado.tests.tablaProductores = {
    nombre: '🌾 Tabla "productores" existe y es accesible',
    status: 'pending',
  };

  try {
    const { data, error } = await supabase.from('productores').select('*').limit(1);
    if (error) {
      resultado.tests.tablaProductores.status = 'error';
      resultado.tests.tablaProductores.detalles = error.message;

      const code = (error as any).code as string | undefined;
      const msg = String(error.message || '');

      if (code === 'PGRST116' || msg.includes('permission denied')) {
        resultado.tests.tablaProductores.solucion = 'Ejecuta el Script 2 para desactivar RLS';
      } else if (code === '42P01') {
        resultado.tests.tablaProductores.solucion = 'Ejecuta el Script 1 para crear las tablas';
      }
    } else {
      resultado.tests.tablaProductores.status = 'success';
      resultado.tests.tablaProductores.detalles = `✅ Tabla accesible. Registros: ${data?.length || 0}`;
    }
  } catch (error: any) {
    resultado.tests.tablaProductores.status = 'error';
    resultado.tests.tablaProductores.detalles = error?.message || 'Error desconocido';
  }

  // Test 5: Verificar tabla bascula_recepciones
  resultado.tests.tablaBascula = {
    nombre: '⚖️ Tabla "bascula_recepciones" existe',
    status: 'pending',
  };

  try {
    const { error } = await supabase.from('bascula_recepciones').select('*').limit(1);
    if (error) {
      resultado.tests.tablaBascula.status = 'error';
      resultado.tests.tablaBascula.detalles = error.message;
    } else {
      resultado.tests.tablaBascula.status = 'success';
      resultado.tests.tablaBascula.detalles = '✅ Tabla accesible';
    }
  } catch (error: any) {
    resultado.tests.tablaBascula.status = 'error';
    resultado.tests.tablaBascula.detalles = error?.message || 'Error desconocido';
  }

  diagnostico.value = resultado;
  loading.value = false;

  Notify.create({
    type: allSuccess.value ? 'positive' : 'warning',
    message: allSuccess.value
      ? 'Diagnóstico completado: OK'
      : 'Diagnóstico completado: hay errores',
  });
}
</script>

<style scoped>
/* Sin estilos específicos: Quasar cubre layout/colores con clases */
</style>
