<template>
  <div class="q-pa-md">

    <div class="q-mb-md">
      <div class="text-h6">Parámetros Generales</div>
      <div class="text-body2 text-grey-7">
        Gobierno transversal del sistema - Define reglas que aplican a todo el sistema.
      </div>
    </div>

    <!-- equivalente a overflow-y-auto max-h-[calc(100vh-240px)] -->
    <q-scroll-area style="height: calc(100vh - 240px);">
      <div class="q-pr-sm">
        <q-list bordered class="rounded-borders">

          <!-- Gestión de Usuarios -->
          <q-expansion-item
            v-model="expanded.usuarios"
            label="Gestión de Usuarios"
            header-class="bg-purple-1"
            expand-icon-class="text-purple-8"
            class="q-mb-sm"
          >
            <q-card flat>
              <q-card-section>
                <GestionUsuarios />
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Gestión de Roles -->
          <q-expansion-item
            v-model="expanded.roles"
            label="Gestión de Roles"
            header-class="bg-purple-1"
            expand-icon-class="text-purple-8"
            class="q-mb-sm"
          >
            <q-card flat>
              <q-card-section>
                <GestionRoles />
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Permisos de Acceso a Pantallas -->
          <q-expansion-item
            v-model="expanded.permisos"
            label="Permisos de Acceso a Pantallas"
            header-class="bg-purple-1"
            expand-icon-class="text-purple-8"
            class="q-mb-sm"
          >
            <q-card flat>
              <q-card-section>
                <GestionPermisosPantallas />
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Catálogos Maestros -->
          <q-expansion-item
            v-model="expanded.catalogos"
            label="Catálogos Maestros"
            header-class="bg-grey-2"
            expand-icon-class="text-grey-8"
            class="q-mb-sm"
          >
            <q-card flat>
              <q-card-section>
                <CatalogosMaestros />
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Configuración del Sistema -->
          <q-expansion-item
            v-model="expanded.sistema"
            label="Configuración del Sistema"
            header-class="bg-grey-2"
            expand-icon-class="text-grey-8"
            class="q-mb-sm"
          >
            <q-card flat>
              <q-card-section class="q-gutter-md">

                <!-- Información de la Empresa -->
                <q-card flat bordered class="bg-blue-1">
                  <q-card-section>
                    <div class="text-subtitle1 text-blue-10 text-weight-medium">
                      Información de la Empresa
                    </div>

                    <div class="row q-col-gutter-md q-mt-sm">
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="form.nombreEmpresa"
                          dense
                          outlined
                          label="Nombre de la Empresa"
                        />
                      </div>

                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="form.rfc"
                          dense
                          outlined
                          label="RFC"
                        />
                      </div>

                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="form.email"
                          dense
                          outlined
                          type="email"
                          label="Email"
                        />
                      </div>

                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="form.telefono"
                          dense
                          outlined
                          type="tel"
                          label="Teléfono"
                        />
                      </div>

                      <div class="col-12">
                        <q-input
                          v-model="form.direccion"
                          dense
                          outlined
                          label="Dirección"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Catálogo de Sedes -->
                <q-card flat bordered class="bg-blue-1">
                  <q-card-section>
                    <div class="text-subtitle1 text-blue-10 text-weight-medium">
                      Catálogo de Sedes
                    </div>

                    <div class="row q-col-gutter-md q-mt-sm items-end">
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="nuevaSede"
                          dense
                          outlined
                          label="Nombre de la Sede"
                        />
                      </div>

                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="nuevoEstado"
                          dense
                          outlined
                          label="Estado"
                        />
                      </div>

                      <div class="col-12">
                        <q-btn
                          color="green-7"
                          icon="add"
                          label="Agregar Sede"
                          class="full-width"
                          @click="agregarSede"
                        />
                      </div>
                    </div>

                    <q-separator class="q-my-md" />

                    <q-table
                      flat
                      bordered
                      :rows="sedes"
                      :columns="columnsSedes"
                      row-key="id"
                      hide-pagination
                      :rows-per-page-options="[0]"
                      class="bg-white"
                    >
                      <template #body-cell-activa="slotProps">
                        <q-td :props="slotProps">
                          <q-toggle
                            v-model="slotProps.row.activa"
                            @update:model-value="() => toggleSedeActiva(slotProps.row.id)"
                          />
                        </q-td>
                      </template>

                      <template #body-cell-acciones="slotProps">
                        <q-td :props="slotProps">
                          <q-btn
                            dense
                            flat
                            round
                            color="red-6"
                            icon="delete"
                            @click="eliminarSede(slotProps.row.id)"
                          />
                        </q-td>
                      </template>
                    </q-table>
                  </q-card-section>
                </q-card>

                <!-- Unidades de Medida -->
                <q-card flat bordered class="bg-blue-1">
                  <q-card-section>
                    <div class="text-subtitle2 text-blue-10 text-weight-medium q-mb-sm">
                      Unidades de Medida
                    </div>

                    <div class="row q-col-gutter-sm">
                      <div
                        v-for="u in unidadesMedida"
                        :key="u.id"
                        class="col-12 col-sm-6 col-md-4"
                      >
                        <q-item dense clickable class="rounded-borders bg-white">
                          <q-item-section avatar>
                            <q-toggle
                              v-model="u.activa"
                              @update:model-value="() => toggleUnidadActiva(u.id)"
                            />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>
                              {{ u.unidad }} ({{ u.simbolo }})
                            </q-item-label>
                            <q-item-label caption>
                              {{ u.tipo }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Configuración Regional -->
                <q-card flat bordered class="bg-blue-1">
                  <q-card-section>
                    <div class="text-subtitle1 text-blue-10 text-weight-medium">
                      Configuración Regional
                    </div>

                    <div class="row q-col-gutter-md q-mt-sm">
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="form.zonaHoraria"
                          dense
                          outlined
                          label="Zona Horaria"
                        />
                      </div>

                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="form.formatoFecha"
                          dense
                          outlined
                          label="Formato de Fecha"
                        />
                      </div>

                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="form.formatoHora"
                          dense
                          outlined
                          label="Formato de Hora"
                        />
                      </div>

                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="form.idioma"
                          dense
                          outlined
                          label="Idioma"
                        />
                      </div>

                      <div class="col-12 col-md-6">
                        <q-input
                          v-model="form.moneda"
                          dense
                          outlined
                          label="Moneda"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Guardar -->
                <div>
                  <q-btn
                    color="blue-7"
                    icon="save"
                    label="Guardar Configuración"
                    class="full-width"
                    @click="guardarConfiguracion"
                  />
                </div>

              </q-card-section>
            </q-card>
          </q-expansion-item>

        </q-list>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';

// Ajusta extensiones/rutas si tus hijos ya están convertidos a Vue
import GestionUsuarios from './GestionUsuarios.vue';
import GestionRoles from './GestionRoles.vue';
import GestionPermisosPantallas from './GestionPermisosPantallas.vue';
import CatalogosMaestros from './CatalogosMaestros.vue';

type Seccion = 'usuarios' | 'roles' | 'permisos' | 'catalogos' | 'sistema';

interface Sede {
  id: number;
  nombre: string;
  estado: string;
  activa: boolean;
}

interface UnidadMedida {
  id: number;
  tipo: string;
  unidad: string;
  simbolo: string;
  activa: boolean;
}

const $q = useQuasar();

/**
 * En TSX: seccionExpandida inicia en 'usuarios' (una sola abierta).
 * En Quasar: mantenemos el mismo comportamiento: sólo una sección abierta a la vez.
 */
const seccionExpandida = ref<Seccion | ''>('usuarios');

const expanded = computed({
  get() {
    return {
      usuarios: seccionExpandida.value === 'usuarios',
      roles: seccionExpandida.value === 'roles',
      permisos: seccionExpandida.value === 'permisos',
      catalogos: seccionExpandida.value === 'catalogos',
      sistema: seccionExpandida.value === 'sistema'
    };
  },
  set(v: Record<Seccion, boolean>) {
    // Al cambiar cualquier v-model de q-expansion-item, detectamos cuál está true
    const abierta = (Object.keys(v) as Seccion[]).find(k => v[k]);
    seccionExpandida.value = abierta ?? '';
  }
});

/** Estados (equivalentes a useState) */
const form = reactive({
  nombreEmpresa: 'Alazán Granos SA de CV',
  rfc: 'AGR123456ABC',
  email: 'contacto@alazan.com',
  telefono: '667-123-4567',
  direccion: 'Av. Principal 123, Navojoa, Sonora',

  zonaHoraria: 'America/Hermosillo',
  formatoFecha: 'DD/MM/YYYY',
  formatoHora: '24 horas',
  idioma: 'Español',
  moneda: 'MXN - Peso Mexicano'
});

// Catálogo de Sedes
const sedes = ref<Sede[]>([
  { id: 1, nombre: 'Guamuchil', estado: 'Sinaloa', activa: true }
]);
const nuevaSede = ref('');
const nuevoEstado = ref('Sinaloa');

// Unidades de Medida
const unidadesMedida = ref<UnidadMedida[]>([
  { id: 1, tipo: 'Peso', unidad: 'Kilogramo', simbolo: 'kg', activa: true },
  { id: 2, tipo: 'Peso', unidad: 'Tonelada', simbolo: 'ton', activa: true },
  { id: 3, tipo: 'Peso', unidad: 'Libra', simbolo: 'lb', activa: false },
  { id: 4, tipo: 'Volumen', unidad: 'Litro', simbolo: 'L', activa: true },
  { id: 5, tipo: 'Temperatura', unidad: 'Celsius', simbolo: '°C', activa: true }
]);

/** Tabla sedes (QTable) */
const columnsSedes = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' as const, sortable: true },
  { name: 'activa', label: 'Activa', field: 'activa', align: 'left' as const },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'left' as const }
];

/** Acciones (equivalentes a las funciones TSX) */
function agregarSede() {
  const nombre = (nuevaSede.value || '').trim();
  const estado = (nuevoEstado.value || '').trim();

  if (!nombre || !estado) return;

  const nextId = sedes.value.length ? Math.max(...sedes.value.map(s => s.id)) + 1 : 1;

  sedes.value = [
    ...sedes.value,
    { id: nextId, nombre, estado, activa: true }
  ];

  nuevaSede.value = '';
  // En TSX lo resetea a 'Sonora'
  nuevoEstado.value = 'Sonora';
}

function toggleSedeActiva(id: number) {
  sedes.value = sedes.value.map(s =>
    s.id === id ? { ...s, activa: !s.activa } : s
  );
}

function eliminarSede(id: number) {
  $q.dialog({
    title: 'Confirmación',
    message: '¿Está seguro de eliminar esta sede?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    sedes.value = sedes.value.filter(s => s.id !== id);
  });
}

function toggleUnidadActiva(id: number) {
  unidadesMedida.value = unidadesMedida.value.map(u =>
    u.id === id ? { ...u, activa: !u.activa } : u
  );
}

function guardarConfiguracion() {
  // Equivalente al console.log + alert del TSX
  // Aquí sólo lo dejamos listo para mandar a API si lo conectas después.
  // eslint-disable-next-line no-console
  console.log('Guardando configuración del sistema:', {
    ...form,
    sedes: sedes.value,
    unidadesMedida: unidadesMedida.value
  });

  $q.notify({
    type: 'positive',
    message: '✅ Configuración guardada correctamente',
    position: 'top'
  });
}
</script>
