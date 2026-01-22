<template>
  <div class="q-pa-md" style="display: grid; gap: 16px">
    <!-- Header -->
    <q-card
      class="text-white"
      bordered
      flat
      style="background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)"
    >
      <q-card-section class="row items-center justify-between">
        <div class="row items-center q-gutter-md">
          <q-icon name="database" size="32px" />
          <div>
            <div class="text-h5 text-weight-bold">Análisis de Alineación</div>
            <div class="text-body2" style="opacity: 0.9">
              Verificación de estructura y datos entre Supabase y la aplicación
            </div>
          </div>
        </div>

        <q-btn
          color="white"
          text-color="indigo-7"
          unelevated
          :loading="analizando"
          icon="refresh"
          :label="analizando ? 'Analizando...' : 'Analizar'"
          @click="analizarAlineacion"
        />
      </q-card-section>
    </q-card>

    <!-- Resumen -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-card bordered flat class="bg-green-1" style="border: 2px solid #bbf7d0">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="check_circle" color="positive" size="32px" />
            <div>
              <div class="text-h4 text-weight-bold text-green-8">{{ catalogosOk }}</div>
              <div class="text-body2 text-green-7">Catálogos OK</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card bordered flat class="bg-yellow-1" style="border: 2px solid #fde68a">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="warning" color="warning" size="32px" />
            <div>
              <div class="text-h4 text-weight-bold text-yellow-9">{{ catalogosWarning }}</div>
              <div class="text-body2 text-yellow-9">Advertencias</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card bordered flat class="bg-red-1" style="border: 2px solid #fecaca">
          <q-card-section class="row items-center q-gutter-md">
            <q-icon name="cancel" color="negative" size="32px" />
            <div>
              <div class="text-h4 text-weight-bold text-red-8">{{ catalogosError }}</div>
              <div class="text-body2 text-red-7">Errores</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Resultados Detallados -->
    <div style="display: grid; gap: 12px">
      <q-card
        v-for="(r, idx) in resultados"
        :key="idx"
        bordered
        flat
        :class="estadoCardClass(r.estado)"
        :style="estadoCardStyle(r.estado)"
      >
        <q-card-section>
          <div class="row items-start justify-between q-mb-sm">
            <div class="row items-center q-gutter-md">
              <q-icon v-if="r.estado === 'ok'" name="check_circle" color="positive" size="24px" />
              <q-icon
                v-else-if="r.estado === 'warning'"
                name="warning"
                color="warning"
                size="24px"
              />
              <q-icon v-else name="cancel" color="negative" size="24px" />

              <div>
                <div class="text-subtitle1 text-weight-bold">{{ r.catalogo }}</div>
                <div class="text-caption text-grey-7">Tabla: {{ r.tabla }}</div>
              </div>
            </div>

            <q-badge color="white" text-color="grey-9" outline class="text-mono">
              {{ r.registros_bd }} registros
            </q-badge>
          </div>

          <div :class="estadoMensajeClass(r.estado)" class="text-body2 q-mb-md">
            {{ r.mensaje }}
          </div>

          <div v-if="r.campos_verificados.length" class="q-mb-md">
            <div class="text-caption text-grey-8 text-weight-bold q-mb-xs">Campos verificados:</div>
            <div class="row q-gutter-xs">
              <q-badge
                v-for="c in r.campos_verificados"
                :key="c"
                color="white"
                text-color="grey-9"
                outline
                class="text-mono"
              >
                {{ c }}
              </q-badge>
            </div>
          </div>

          <div v-if="r.datos_ejemplo.length">
            <div class="text-caption text-grey-8 text-weight-bold q-mb-xs">Datos de ejemplo:</div>
            <q-card bordered flat class="bg-white">
              <q-card-section class="q-pa-sm">
                <pre class="text-caption text-mono" style="margin: 0; overflow-x: auto">{{
                  prettyJson(r.datos_ejemplo)
                }}</pre>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Último análisis -->
    <div v-if="ultimoAnalisis" class="text-center text-caption text-grey-7">
      Último análisis: {{ ultimoAnalisisStr }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
// import { supabase } from '@/lib/supabase' // mismo import que en tu TSX :contentReference[oaicite:1]{index=1}

type Estado = 'ok' | 'error' | 'warning';

interface ResultadoAnalisis {
  catalogo: string;
  tabla: string;
  estado: Estado;
  mensaje: string;
  registros_bd: number;
  campos_verificados: string[];
  datos_ejemplo: any[];
}

const resultados = ref<ResultadoAnalisis[]>([]);
const analizando = ref(false);
const ultimoAnalisis = ref<Date | null>(null);

function prettyJson(v: any) {
  return JSON.stringify(v, null, 2);
}

function estadoCardClass(estado: Estado) {
  if (estado === 'ok') return 'bg-green-1';
  if (estado === 'warning') return 'bg-yellow-1';
  return 'bg-red-1';
}

function estadoCardStyle(estado: Estado) {
  if (estado === 'ok') return { border: '2px solid #86efac' };
  if (estado === 'warning') return { border: '2px solid #fcd34d' };
  return { border: '2px solid #fca5a5' };
}

function estadoMensajeClass(estado: Estado) {
  if (estado === 'ok') return 'text-green-8';
  if (estado === 'warning') return 'text-yellow-9';
  return 'text-red-8';
}

async function analizarCatalogo(
  label: string,
  tabla: string,
  camposEsperados: string[],
  sliceN: number,
): Promise<ResultadoAnalisis> {
  // const { data, error } = await supabase.from(tabla).select('*');

  // if (error) {
  //   return {
  //     catalogo: label,
  //     tabla,
  //     estado: 'error',
  //     mensaje: `Error al conectar: ${error.message}`,
  //     registros_bd: 0,
  //     campos_verificados: [],
  //     datos_ejemplo: [],
  //   };
  // }

  const rows = Array.isArray(data) ? data : [];
  const camposActuales = rows.length > 0 ? Object.keys(rows[0] as any) : [];
  const camposCorrectos = camposEsperados.every((c) => camposActuales.includes(c));

  return {
    catalogo: label,
    tabla,
    estado: camposCorrectos ? 'ok' : 'warning',
    mensaje: camposCorrectos
      ? `✅ Estructura correcta | ${rows.length} registros encontrados`
      : `⚠️ Faltan campos: ${camposEsperados.filter((c) => !camposActuales.includes(c)).join(', ') || 'Estructura incorrecta'}`,
    registros_bd: rows.length,
    campos_verificados: camposEsperados,
    datos_ejemplo: rows.slice(0, sliceN),
  };
}

async function analizarAlineacion() {
  analizando.value = true;
  const nuevos: ResultadoAnalisis[] = [];

  try {
    // 1. Granos
    nuevos.push(
      await analizarCatalogo(
        '🌾 Granos',
        'granos_catalogo',
        ['id', 'nombre', 'requiere_analisis', 'activo'],
        3,
      ),
    );

    // 2. Calibres
    nuevos.push(
      await analizarCatalogo('📏 Calibres', 'calibres_catalogo', ['id', 'calibre', 'activo'], 6),
    );

    // 3. Compradores
    nuevos.push(
      await analizarCatalogo(
        '🏢 Compradores',
        'compradores_catalogo',
        ['id', 'nombre', 'telefono', 'activo'],
        3,
      ),
    );

    // 4. Orígenes
    nuevos.push(
      await analizarCatalogo(
        '📍 Orígenes',
        'origenes_catalogo',
        ['id', 'municipio', 'estado', 'region', 'activo'],
        3,
      ),
    );

    // 5. Bancos
    nuevos.push(
      await analizarCatalogo(
        '🏦 Bancos',
        'bancos_catalogo',
        ['id', 'nombre_banco', 'codigo_banco', 'activo'],
        5,
      ),
    );
  } catch (e) {
    // TSX original solo logueaba el error general :contentReference[oaicite:2]{index=2}
    // aquí lo mantenemos sin romper UI
    // eslint-disable-next-line no-console
    console.error('Error general en análisis:', e);
  } finally {
    resultados.value = nuevos;
    ultimoAnalisis.value = new Date();
    analizando.value = false;
  }
}

onMounted(() => {
  analizarAlineacion();
});

const catalogosOk = computed(() => resultados.value.filter((r) => r.estado === 'ok').length);
const catalogosError = computed(() => resultados.value.filter((r) => r.estado === 'error').length);
const catalogosWarning = computed(
  () => resultados.value.filter((r) => r.estado === 'warning').length,
);

const ultimoAnalisisStr = computed(() => {
  if (!ultimoAnalisis.value) return '';
  return ultimoAnalisis.value.toLocaleString('es-MX');
});
</script>

<style scoped>
.text-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
