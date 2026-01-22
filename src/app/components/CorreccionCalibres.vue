<!-- src/app/components/CorreccionCalibres.vue -->
<template>
  <div class="q-gutter-lg">
    <!-- Encabezado -->
    <q-card class="bg-orange-8 text-white" bordered>
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <q-icon name="warning_amber" size="32px" />
          <div>
            <div class="text-h6">Corrección de Calibres de Garbanzo</div>
            <div class="text-body2 text-orange-1">
              Los calibres deben usar el formato de GRANOS POR ONZA (g/oz)
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Explicación -->
    <q-card bordered class="bg-blue-1">
      <q-card-section>
        <div class="row items-center q-gutter-sm q-mb-sm">
          <q-icon name="database" color="blue-8" />
          <div class="text-subtitle1 text-blue-10">¿Por qué esta corrección?</div>
        </div>

        <div class="text-body2 text-blue-10 q-gutter-sm">
          <div>
            ❌ <span class="text-weight-bold">Formato incorrecto:</span>
            12mm, 11mm, 10mm, 9mm, 8mm, 7mm
          </div>
          <div>
            ✅ <span class="text-weight-bold">Formato correcto:</span>
            44.01-46.00, 46.01-48.00, 48.01-50.00, 50.01-52.00, 52.01-54.00
          </div>

          <q-banner rounded class="bg-white text-blue-10 q-mt-md">
            <span class="text-weight-bold">Nota técnica:</span>
            Los calibres representan cuántos granos de garbanzo entran en una onza (peso). A menor
            número = granos más grandes = mejor calidad = menos descuento.
          </q-banner>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla calibres correctos -->
    <q-card bordered>
      <q-card-section>
        <div class="text-subtitle1 text-grey-9 q-mb-md">
          📏 Calibres Correctos (GRANOS POR ONZA)
        </div>

        <q-markup-table flat bordered dense wrap-cells>
          <thead>
            <tr class="bg-green-8 text-white">
              <th class="text-left">Calibre</th>
              <th class="text-left">Descripción</th>
              <th class="text-right">Descuento (kg/ton)</th>
              <th class="text-center">Código</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, idx) in calibresCorrectos" :key="c.calibre" class="hover-row">
              <td class="text-left text-green-9 text-weight-bold">{{ c.calibre }}</td>
              <td class="text-left">{{ c.descripcion }}</td>
              <td class="text-right">
                <span class="text-mono">{{ c.descuento.toLocaleString('es-MX') }}</span>
              </td>
              <td class="text-center">
                <q-badge color="blue-2" text-color="blue-10" :label="`DC${idx + 1}`" />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <!-- Script SQL -->
    <q-card bordered class="bg-grey-10 text-grey-2">
      <q-card-section>
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-white">📜 Script SQL de Corrección</div>

          <q-btn
            color="grey-8"
            text-color="white"
            icon="content_copy"
            label="Copiar"
            dense
            unelevated
            @click="copiarScript"
          />
        </div>

        <q-card flat class="bg-black text-grey-2">
          <q-card-section class="q-pa-sm">
            <pre id="sql-script-text" class="sql-pre">{{ scriptSQL }}</pre>
          </q-card-section>
        </q-card>
      </q-card-section>
    </q-card>

    <!-- Ejecutar -->
    <q-card bordered class="bg-green-8 text-white">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold q-mb-xs">🚀 Ejecutar Corrección Automática</div>
        <div class="text-body2 text-green-1 q-mb-md">
          Esto eliminará los calibres incorrectos e insertará los correctos directamente en Supabase
        </div>

        <q-btn
          color="white"
          text-color="green-9"
          icon="database"
          :label="ejecutando ? 'Ejecutando...' : 'Ejecutar Corrección Ahora'"
          unelevated
          :disable="ejecutando"
          @click="ejecutarCorreccion"
        />
      </q-card-section>
    </q-card>

    <!-- Resultado -->
    <q-card v-if="resultado" bordered :class="resultado.exito ? 'bg-green-1' : 'bg-red-1'">
      <q-card-section>
        <div class="row items-start q-gutter-md">
          <q-icon
            :name="resultado.exito ? 'check_circle' : 'warning_amber'"
            :color="resultado.exito ? 'green-8' : 'red-8'"
            size="28px"
            class="q-mt-xs"
          />

          <div class="col">
            <div
              class="text-subtitle1 text-weight-bold"
              :class="resultado.exito ? 'text-green-10' : 'text-red-10'"
            >
              {{ resultado.exito ? 'Corrección Exitosa' : 'Error en la Corrección' }}
            </div>

            <div class="text-body2" :class="resultado.exito ? 'text-green-10' : 'text-red-10'">
              {{ resultado.mensaje }}
            </div>

            <q-banner v-if="resultado.exito" rounded class="bg-white text-grey-9 q-mt-md">
              <div class="text-body2">
                <span class="text-weight-bold">Próximos pasos:</span>
              </div>
              <ul class="q-mt-sm q-pl-md">
                <li>Ve a "Análisis de Alineación" para verificar</li>
                <li>Revisa "Parámetros Generales → Calibres"</li>
                <li>Los nuevos calibres ya están disponibles en toda la aplicación</li>
              </ul>
            </q-banner>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Notify } from 'quasar';
// import { supabase } from '@/lib/supabase'

type Resultado = { exito: boolean; mensaje: string } | null;

const ejecutando = ref(false);
const resultado = ref<Resultado>(null);

const scriptSQL = `-- Eliminar calibres incorrectos
DELETE FROM calibres_catalogo;

-- Insertar calibres CORRECTOS para garbanzo (GRANOS POR ONZA)
INSERT INTO calibres_catalogo (calibre, activo) VALUES
('44.01-46.00', true),
('46.01-48.00', true),
('48.01-50.00', true),
('50.01-52.00', true),
('52.01-54.00', true);`;

const calibresCorrectos = [
  { calibre: '44.01-46.00', descripcion: 'Extra Grande', descuento: 0 },
  { calibre: '46.01-48.00', descripcion: 'Grande', descuento: 500 },
  { calibre: '48.01-50.00', descripcion: 'Mediano-Grande', descuento: 2000 },
  { calibre: '50.01-52.00', descripcion: 'Mediano', descuento: 3000 },
  { calibre: '52.01-54.00', descripcion: 'Chico', descuento: 3500 },
];

async function copiarScript() {
  try {
    await navigator.clipboard.writeText(scriptSQL);
    Notify.create({ type: 'positive', message: 'Script copiado al portapapeles' });
  } catch {
    // fallback: seleccionar texto en el <pre>
    const el = document.getElementById('sql-script-text');
    if (!el) {
      Notify.create({
        type: 'negative',
        message: 'No se pudo copiar. Selecciona el texto manualmente.',
      });
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
      Notify.create({ type: 'info', message: 'Texto seleccionado - Usa Ctrl+C para copiar' });
    } else {
      Notify.create({ type: 'negative', message: 'No se pudo seleccionar el texto.' });
    }
  }
}

async function ejecutarCorreccion() {
  ejecutando.value = true;
  resultado.value = null;

  // try {
  // 1) eliminar todos
  // const { error: deleteError } = await supabase
  //   .from('calibres_catalogo')
  //   .delete()
  //   .neq('id', 0)

  // if (deleteError) {
  //   resultado.value = { exito: false, mensaje: `Error al eliminar calibres: ${deleteError.message}` }
  //   return
  //}

  // 2) insertar
  // const payload = calibresCorrectos.map((c) => ({ calibre: c.calibre, activo: true }))
  // const { data, error: insertError } = await supabase
  //   .from('calibres_catalogo')
  //   .insert(payload)
  //   .select()

  // if (insertError) {
  //   resultado.value = { exito: false, mensaje: `Error al insertar calibres: ${insertError.message}` }
  //   return
  // }

  //     const count = Array.isArray(data) ? data.length : payload.length
  //     resultado.value = { exito: true, mensaje: `✅ Calibres actualizados correctamente. Se insertaron ${count} registros.` }
  //     Notify.create({ type: 'positive', message: 'Calibres corregidos exitosamente' })
  //   } catch (e: unknown) {
  //     const msg = e instanceof Error ? e.message : 'Error inesperado'
  //     resultado.value = { exito: false, mensaje: `Error inesperado: ${msg}` }
  //   } finally {
  //     ejecutando.value = false
  //   }
}
</script>

<style scoped>
.sql-pre {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  white-space: pre;
  overflow-x: auto;
}

.text-mono {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}

.hover-row:hover {
  background: rgba(22, 163, 74, 0.08);
}
</style>
