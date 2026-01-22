<template>
  <!-- Si NO es embebido => Modal -->
  <q-dialog
    v-if="!isEmbedded"
    v-model="dialogOpen"
    persistent
    transition-show="fade"
    transition-hide="fade"
    maximized
  >
    <q-card class="column full-height">
      <q-toolbar class="bg-primary text-white">
        <q-icon name="database" size="24px" class="q-mr-sm" />
        <q-toolbar-title class="text-weight-bold">
          Inicialización de Base de Datos
        </q-toolbar-title>

        <q-btn flat round dense icon="close" aria-label="Cerrar" @click="close" />
      </q-toolbar>

      <q-separator />

      <q-card-section class="q-pa-md col scroll">
        <Content />
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Si es embebido => Solo contenido -->
  <div v-else class="q-pa-md">
    <Content />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';
// import { projectId } from '/utils/supabase/info';

interface InicializarBDProps {
  /**
   * Si es true, se renderiza SOLO el contenido (sin dialog).
   * Default: false.
   */
  isEmbedded?: boolean;

  /**
   * Compatibilidad con tu API TSX. En Vue lo ideal es usar emit('close')
   * o v-model. Lo dejo para no romper llamadas existentes.
   */
  onClose?: () => void;

  /**
   * Control opcional de apertura si lo usas como modal via v-model.
   * Si no lo pasas, se asume abierto (true) cuando no es embebido.
   */
  modelValue?: boolean;
}

const props = withDefaults(defineProps<InicializarBDProps>(), {
  isEmbedded: false,
  modelValue: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'close'): void;
}>();

const sqlEditorUrl = computed(() => `https://supabase.com/dashboard/project/${projectId}/sql/new`);

const dialogOpen = computed<boolean>({
  get: () => (props.isEmbedded ? false : props.modelValue),
  set: (v) => emit('update:modelValue', v),
});

function close(): void {
  // patrón Vue
  emit('update:modelValue', false);
  emit('close');

  // compatibilidad TSX
  props.onClose?.();
}

/**
 * Componente interno de contenido (para no duplicar markup en embedded vs dialog).
 */
const Content = defineComponent({
  name: 'InicializarBDContent',
  setup() {
    return () =>
      h('div', { class: 'q-pa-sm' }, [
        // Header
        h('div', { class: 'q-mb-md' }, [
          h(
            'div',
            { class: 'text-h6 text-weight-bold text-grey-9' },
            '📋 Inicialización de Base de Datos',
          ),
          h(
            'div',
            { class: 'text-body2 text-grey-7 q-mt-xs' },
            'Sigue estos pasos en orden para configurar la base de datos:',
          ),
        ]),

        h('div', { class: 'column q-gutter-md' }, [
          // ALERTA IMPORTANTE
          h(
            'div',
            {
              class: 'q-pa-md bg-red-1 text-red-10 rounded-borders',
              style: 'border: 2px solid var(--q-negative);',
            },
            [
              h('div', { class: 'row items-start q-gutter-sm' }, [
                h('div', { class: 'text-h4' }, '⚠️'),
                h('div', {}, [
                  h(
                    'div',
                    { class: 'text-subtitle1 text-weight-bold' },
                    'IMPORTANTE - Lee esto primero',
                  ),
                  h('div', { class: 'text-body2 q-mt-xs' }, [
                    'Si ves errores ',
                    h('strong', {}, '"Failed to fetch"'),
                    ', ejecuta primero el ',
                    h('strong', {}, 'Paso 4'),
                    ' para desactivar RLS.',
                  ]),
                ]),
              ]),
            ],
          ),

          // Paso 1
          stepCard({
            n: 1,
            color: 'blue',
            title: 'Ir a Supabase SQL Editor',
            body: [
              h(
                'div',
                {},
                h(
                  'a',
                  {
                    href: sqlEditorUrl.value,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    style: 'text-decoration: none;',
                  },
                  h(
                    'span',
                    {
                      class: 'inline-block',
                    },
                    h(
                      // botón quasar en render function
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (resolveComponent as any)('q-btn'),
                      {
                        color: 'primary',
                        unelevated: true,
                        icon: 'open_in_new',
                        label: 'Abrir SQL Editor',
                      },
                    ),
                  ),
                ),
              ),
            ],
          }),

          // Paso 2
          stepCard({
            n: 2,
            color: 'purple',
            title: 'Copiar el Script SQL',
            body: [
              h('div', { class: 'text-body2 text-grey-8' }, [
                'El script está en el archivo: ',
                h(
                  'code',
                  { class: 'q-pa-xs bg-white rounded-borders text-caption' },
                  '/database/quick_init.sql',
                ),
              ]),
              h(
                'div',
                { class: 'text-body2 text-grey-7 q-mt-sm' },
                'O copia todo el script desde el proyecto en Figma Make.',
              ),
            ],
          }),

          // Paso 3
          stepCard({
            n: 3,
            color: 'green',
            title: 'Ejecutar el Script',
            body: [
              h('ol', { class: 'q-pl-md text-body2 text-grey-8' }, [
                h('li', {}, 'Pega el script completo en el SQL Editor'),
                h('li', {}, [
                  'Click en el botón ',
                  h('strong', {}, '"Run"'),
                  ' o presiona ',
                  h(
                    'span',
                    { class: 'q-pa-xs bg-white rounded-borders text-caption' },
                    'Ctrl + Enter',
                  ),
                ]),
                h('li', {}, 'Espera 30-60 segundos a que termine'),
              ]),
            ],
          }),

          // Paso 4
          stepCard({
            n: 4,
            color: 'orange',
            title: 'Ejecutar Script de Políticas RLS',
            body: [
              h(
                'div',
                { class: 'text-body2 text-grey-8' },
                'Ejecuta el script para desactivar RLS (solo para desarrollo):',
              ),
              h('div', { class: 'text-body2 text-grey-7 q-mt-sm' }, [
                'Archivo: ',
                h(
                  'code',
                  { class: 'q-pa-xs bg-white rounded-borders text-caption' },
                  '/database/fix_rls_policies.sql',
                ),
              ]),
              h(
                'div',
                { class: 'q-mt-md' },
                h(
                  'a',
                  {
                    href: sqlEditorUrl.value,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    style: 'text-decoration: none;',
                  },
                  h(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (resolveComponent as any)('q-btn'),
                    {
                      color: 'orange',
                      unelevated: true,
                      icon: 'open_in_new',
                      label: 'Ejecutar Script RLS',
                    },
                  ),
                ),
              ),
            ],
          }),

          // Paso 5
          stepCard({
            n: 5,
            color: 'green',
            title: 'Insertar Datos Iniciales (Superusuario y Roles)',
            body: [
              h(
                'div',
                { class: 'text-body2 text-grey-8' },
                'Ejecuta el script para crear el superusuario y roles del sistema:',
              ),
              h('div', { class: 'text-body2 text-grey-7 q-mt-sm' }, [
                'Archivo: ',
                h(
                  'code',
                  { class: 'q-pa-xs bg-white rounded-borders text-caption' },
                  '/database/insert_superusuario.sql',
                ),
              ]),
              h(
                'div',
                { class: 'q-mt-md' },
                h(
                  'a',
                  {
                    href: sqlEditorUrl.value,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    style: 'text-decoration: none;',
                  },
                  h(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (resolveComponent as any)('q-btn'),
                    {
                      color: 'positive',
                      unelevated: true,
                      icon: 'open_in_new',
                      label: 'Insertar Datos Iniciales',
                    },
                  ),
                ),
              ),
            ],
          }),

          // Paso 6
          stepCard({
            n: 6,
            color: 'indigo',
            title: 'Verificar las Tablas',
            body: [
              h('div', { class: 'text-body2 text-grey-8' }, [
                'Ve al ',
                h('strong', {}, 'Table Editor'),
                ' en Supabase y verifica que se crearon estas tablas:',
              ]),
              h(
                'div',
                { class: 'row q-col-gutter-sm q-mt-sm' },
                tablas().map((t) =>
                  h(
                    'div',
                    { class: 'col-6 col-sm-4 col-md-3' },
                    h(
                      'div',
                      { class: 'bg-white q-pa-sm rounded-borders text-caption text-grey-8' },
                      `✓ ${t}`,
                    ),
                  ),
                ),
              ),
            ],
          }),

          // Info adicional
          h('div', { class: 'q-pa-md bg-grey-2 text-grey-9 rounded-borders' }, [
            h(
              'div',
              { class: 'text-subtitle2 text-weight-bold q-mb-sm' },
              '📊 Información del Proyecto',
            ),
            h('div', { class: 'column q-gutter-xs text-body2 text-grey-8' }, [
              h('div', {}, [
                h('strong', {}, 'Project ID: '),
                h(
                  'code',
                  { class: 'q-pa-xs bg-white rounded-borders text-caption' },
                  String(projectId),
                ),
              ]),
              h('div', {}, [h('strong', {}, 'Total de Tablas: '), '18 tablas principales']),
              h('div', {}, [
                h('strong', {}, 'Datos Iniciales: '),
                'Incluye roles, calibres, granos y bancos',
              ]),
            ]),
          ]),

          // Advertencia final
          h('div', { class: 'q-pa-md bg-yellow-1 text-yellow-10 rounded-borders' }, [
            h('div', { class: 'row items-start q-gutter-sm' }, [
              h('div', { class: 'text-h5' }, '⚠️'),
              h('div', { class: 'text-body2' }, [
                h('strong', {}, 'Importante: '),
                'Ejecuta el script solo una vez. Si ya existen las tablas, el script las mantendrá y agregará solo los datos iniciales faltantes.',
              ]),
            ]),
          ]),
        ]),
      ]);
  },
});

/**
 * Helpers UI (para no repetir markup)
 */
import { resolveComponent } from 'vue';

function stepCard(opts: { n: number; color: string; title: string; body: any[] }) {
  const bgClass =
    opts.color === 'blue'
      ? 'bg-blue-1'
      : opts.color === 'purple'
        ? 'bg-purple-1'
        : opts.color === 'green'
          ? 'bg-green-1'
          : opts.color === 'orange'
            ? 'bg-orange-1'
            : opts.color === 'indigo'
              ? 'bg-indigo-1'
              : 'bg-grey-1';

  const textClass =
    opts.color === 'blue'
      ? 'text-blue-10'
      : opts.color === 'purple'
        ? 'text-purple-10'
        : opts.color === 'green'
          ? 'text-green-10'
          : opts.color === 'orange'
            ? 'text-orange-10'
            : opts.color === 'indigo'
              ? 'text-indigo-10'
              : 'text-grey-9';

  const circleClass =
    opts.color === 'blue'
      ? 'bg-primary'
      : opts.color === 'purple'
        ? 'bg-purple'
        : opts.color === 'green'
          ? 'bg-positive'
          : opts.color === 'orange'
            ? 'bg-orange'
            : opts.color === 'indigo'
              ? 'bg-indigo'
              : 'bg-grey';

  return h('div', { class: `q-pa-md ${bgClass} rounded-borders` }, [
    h('div', { class: 'row items-start q-gutter-md' }, [
      h(
        'div',
        {
          class: `text-white ${circleClass} rounded-borders row items-center justify-center text-weight-bold`,
          style: 'width: 32px; height: 32px; border-radius: 16px;',
        },
        String(opts.n),
      ),
      h('div', { class: 'col' }, [
        h('div', { class: `text-subtitle2 text-weight-bold ${textClass}` }, opts.title),
        h('div', { class: 'q-mt-sm column q-gutter-sm' }, opts.body),
      ]),
    ]),
  ]);
}

function tablas(): string[] {
  return [
    'roles',
    'usuarios',
    'granos_catalogo',
    'calibres_catalogo',
    'origenes_catalogo',
    'bancos_catalogo',
    'bodegas_silos_catalogo',
    'productores',
    'bascula_recepciones',
    'analisis_calidad',
    'precios_configuracion',
    'boletas',
    'preliquidaciones',
    'volcado_bodega',
    'entregas_agrupadas',
    'facturacion_recepciones',
    'documentos_expediente',
    'solicitudes_pago',
  ];
}
</script>

<style scoped>
/* Solo para que el contenido embebido se vea igual de cómodo */
.rounded-borders {
  border-radius: 10px;
}
</style>
