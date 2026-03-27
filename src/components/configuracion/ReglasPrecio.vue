<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h6 text-grey-9">Reglas de Precio</div>
        <div class="text-caption text-grey-7">
          Configura Parámetros base, calibres y niveles de exportación
        </div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-select
          v-model="granoSeleccionado"
          :options="listaGranos"
          option-value="id"
          option-label="nombre"
          emit-value
          map-options
          dense
          outlined
          label="Tipo de Grano"
          style="min-width: 200px"
          @update:model-value="cargarDatos"
        />
        <q-btn
          color="green-7"
          unelevated
          icon="save"
          label="Guardar"
          :loading="loading"
          @click="guardarConfigBase"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-4">
        <q-card bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md">💰 Parámetros Base</div>
            <div class="q-gutter-sm">
              <q-input
                v-model.number="formBase.precioBaseUsd"
                label="Precio Base USD"
                dense
                outlined
                type="number"
                prefix="$"
              />
              <q-input
                v-model.number="formBase.tipoCambio"
                label="Tipo de Cambio"
                dense
                outlined
                type="number"
                prefix="$"
              >
                <template #append>
                  <q-btn flat round icon="refresh" size="sm" @click="consultarAPI" />
                </template>
              </q-input>
              <q-card flat bordered class="bg-green-1 q-mt-md">
                <q-card-section class="q-pa-sm text-center">
                  <div class="text-caption">Precio Base MXN</div>
                  <div class="text-h6 text-green-9">${{ precioBaseMXN.toLocaleString() }}</div>
                </q-card-section>
              </q-card>

              <q-btn
                color="primary"
                icon="sync"
                label="Actualizar Precios en Tabla"
                class="full-width q-mt-md"
                :loading="loading"
                @click="ejecutarActualizacionMasiva"
              >
                <q-tooltip>Aplica el Precio Base actual a los niveles de exportación</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md">📏 Calibres (DC)</div>
            <div class="row q-gutter-xs q-mb-sm">
              <q-input
                v-model="nuevoCalibre.calibre"
                label="Rango"
                dense
                outlined
                class="col"
                placeholder="44-46"
              />
              <q-input
                v-model.number="nuevoCalibre.descuento_kg_ton"
                label="Desc"
                dense
                outlined
                class="col"
                type="number"
              />
              <q-btn color="orange" icon="add" unelevated @click="agregarCalibre" />
            </div>
            <q-table
              flat
              bordered
              dense
              :rows="listaCalibres"
              :columns="[
                { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
                { name: 'calibre', label: 'Calibre', field: 'calibre', align: 'left' },
                { name: 'descuento', label: 'Desc', field: 'descuento_kg_ton', align: 'right' },
                { name: 'acciones', label: '', field: 'id' },
              ]"
              row-key="id"
              hide-pagination
              :pagination="{ rowsPerPage: 0 }"
            >
              <template #body-cell-calibre="p">
                <q-td :props="p">
                  <div v-if="editandoCalibreNombre === p.row.id">
                    <q-input
                      v-model="p.row.calibre"
                      dense
                      outlined
                      autofocus
                      @blur="guardarEdicionCalibre(p.row); editandoCalibreNombre = null"
                      @keyup.enter="guardarEdicionCalibre(p.row); editandoCalibreNombre = null"
                      @keyup.escape="editandoCalibreNombre = null"
                    />
                  </div>
                  <div
                    v-else
                    @click="editandoCalibreNombre = p.row.id"
                    class="cursor-pointer text-grey-9"
                  >
                    {{ p.row.calibre }}
                    <q-tooltip>Clic para editar nombre</q-tooltip>
                  </div>
                </q-td>
              </template>
              <template #body-cell-descuento="p">
                <q-td :props="p">
                  <div v-if="editandoCalibre === p.row.id">
                    <q-input
                      v-model.number="p.row.descuento_kg_ton"
                      dense
                      outlined
                      autofocus
                      type="number"
                      @blur="guardarEdicionCalibre(p.row)"
                      @keyup.enter="guardarEdicionCalibre(p.row)"
                    />
                  </div>
                  <div
                    v-else
                    @click="editandoCalibre = p.row.id"
                    class="cursor-pointer text-blue text-weight-bold"
                  >
                    $ {{ (p.row.descuento_kg_ton || 0).toLocaleString() }}
                    <q-tooltip>Clic para editar</q-tooltip>
                  </div>
                </q-td>
              </template>
              <template #body-cell-acciones="p">
                <q-td :props="p"
                  ><q-btn
                    flat
                    round
                    color="red"
                    icon="delete"
                    size="xs"
                    @click="eliminarCalibre(p.row.id)"
                /></q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card bordered>
          <q-card-section>
            <div class="text-subtitle2 q-mb-md">💵 Descuentos Precio (DP)</div>
            <div class="row q-gutter-xs q-mb-sm">
              <q-input
                v-model.number="nuevoDescuentoPrecio"
                label="Monto MXN"
                dense
                outlined
                class="col"
                type="number"
              />
              <q-btn color="purple" icon="add" unelevated @click="agregarDescuentoPrecio" />
            </div>
            <q-table
              flat
              bordered
              dense
              :rows="listaDescuentosPrecio"
              :columns="[
                { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
                { name: 'monto', label: 'Monto', field: 'descuento_mxn', align: 'center' },
                { name: 'acciones', label: '', field: 'id' },
              ]"
              row-key="id"
              hide-pagination
            >
              <template #body-cell-monto="p">
                <q-td :props="p">
                  <div v-if="editandoPrecio === p.row.id">
                    <q-input
                      v-model.number="p.row.descuento_mxn"
                      dense
                      outlined
                      autofocus
                      type="number"
                      prefix="$"
                      @blur="guardarEdicionPrecio(p.row)"
                      @keyup.enter="guardarEdicionPrecio(p.row)"
                    />
                  </div>
                  <div
                    v-else
                    @click="editandoPrecio = p.row.id"
                    class="cursor-pointer text-purple text-weight-bold"
                  >
                    $ {{ (p.row.descuento_mxn || 0).toLocaleString() }}
                  </div>
                </q-td>
              </template>
              <template #body-cell-acciones="p">
                <q-td :props="p"
                  ><q-btn
                    flat
                    round
                    color="red"
                    icon="delete"
                    size="xs"
                    @click="eliminarDescuentoPrecio(p.row.id)"
                /></q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle2">📊 Niveles de Precio por % Exportación</div>
              <div class="row items-center q-gutter-sm bg-blue-1 q-pa-sm rounded-borders">
                <div class="text-caption text-weight-bold text-blue-9">Simular Calibre:</div>
                <q-select
                  v-model="calibreSimulacion"
                  :options="listaCalibres"
                  option-value="id"
                  option-label="calibre"
                  emit-value
                  map-options
                  dense
                  outlined
                  bg-color="white"
                  style="min-width: 180px"
                  clearable
                >
                  <template v-slot:selected-item="scope">
                    <div v-if="scope.opt" class="text-weight-bold text-primary">
                      {{ scope.opt.calibre }}
                      <span class="text-caption text-grey-8 q-ml-xs"
                        >(-${{ scope.opt.descuento_kg_ton }})</span
                      >
                    </div>
                  </template>

                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.calibre }}</q-item-label>
                        <q-item-label caption class="text-orange-9 text-weight-medium">
                          Desc: ${{ scope.opt.descuento_kg_ton.toLocaleString() }} / Ton
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>

            <q-table
              flat
              bordered
              dense
              :rows="nivelesProcesados"
              :columns="[
                { name: 'codigo', label: 'Nivel', field: 'codigo', align: 'left' },
                {
                  name: 'porcentaje',
                  label: '% Export',
                  field: 'porcentaje_export_label',
                  align: 'left',
                },
                {
                  name: 'precio',
                  label: 'Precio (MXN/TON)',
                  field: 'precioCalculado',
                  align: 'center',
                },
                { name: 'formula', label: 'Fórmula', field: 'codigoDescuento', align: 'left' },
                {
                  name: 'descuento',
                  label: 'Descuento (MXN)',
                  field: 'descuento_precio_id',
                  align: 'left',
                },
              ]"
              row-key="id"
              :rows-per-page-options="[0]"
            >
              <!-- Sección Precio (MXN/TON) -->
              <template #body-cell-precio="p">
                <q-td :props="p" class="text-center">
                  <div class="text-weight-bold text-green-9">
                    ${{ p.row.precioCalculado.toLocaleString() }}
                  </div>
                </q-td>
              </template>

              <!-- Sección Fórmula -->
              <template #body-cell-formula="p">
                <q-td :props="p" class="text-caption text-grey-8">
                  <span v-if="p.rowIndex === 0">
                    ${{ precioBaseMXN.toLocaleString() }}
                    <span class="text-orange-9 text-weight-bold">
                      -
                      {{
                        listaCalibres.find((c) => c.id === calibreSimulacion)?.descuento_kg_ton ||
                        '$ 0'
                      }}
                    </span>
                    <span class="text-purple-9 text-weight-bold">
                      - {{ p.row.codigoDescuento || 'DP' }}
                    </span>
                  </span>

                  <span v-else>
                    Precio P{{ p.rowIndex }}
                    <span class="text-purple-9 text-weight-bold">
                      - ${{ p.row.montoDescuento.toLocaleString() }}
                      <span class="text-caption text-grey-6">({{ p.row.codigoDescuento }})</span>
                    </span>
                  </span>
                </q-td>
              </template>

              <!-- Sección Descuento (MXN) -->
              <template #body-cell-descuento="p">
                <q-td :props="p">
                  <q-select
                    v-model="p.row.descuento_precio_id"
                    :options="listaDescuentosPrecio"
                    option-value="id"
                    option-label="codigo"
                    emit-value
                    map-options
                    dense
                    outlined
                    style="width: 150px"
                    @update:model-value="actualizarNivel(p.row, p.rowIndex)"
                  >
                    <template #option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label
                            >{{ scope.opt.codigo }} (- ${{ scope.opt.descuento_mxn }})</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

const authStore = useAuthStore();

// --- Interfaces (Corregidas según JSON del API) ---
interface Grano {
  id: number;
  nombre: string;
  activo: boolean;
}
interface DescuentoCalibre {
  id: number;
  codigo: string;
  calibre: string;
  descuento_kg_ton: number;
}
interface DescuentoPrecio {
  id: number;
  codigo: string;
  descuento_mxn: number;
}
interface NivelExport {
  id: number;
  codigo: string;
  porcentaje_export_label: string; // Coincidir con JSON
  descuento_precio_id: number | null; // Coincidir con JSON
  vigente: boolean;
}

// --- Estado ---
const loading = ref(false);
const editandoCalibre = ref<number | null>(null);
const editandoCalibreNombre = ref<number | null>(null);
const editandoPrecio = ref<number | null>(null);
const calibreSimulacion = ref<number | null>(null);
const nombreUsuarioReal = ref('Cargando...');
const listaGranos = ref<Grano[]>([]);
const granoSeleccionado = ref<number | null>(null);

const formBase = ref({
  precioBaseUsd: 0,
  precioBaseMxn: 0,
  tipoCambio: 0,
  urlApi: 'https://api.exchangerate-api.com/v4/latest/USD',
  usuarioRegistro: '',
  fechaRegistro: null as string | null,
  sede_id: null as number | null,
});

const listaCalibres = ref<DescuentoCalibre[]>([]);
const listaDescuentosPrecio = ref<DescuentoPrecio[]>([]);
const tablaExportacion = ref<NivelExport[]>([]);
const nuevoCalibre = ref({ calibre: '', descuento_kg_ton: 0 });
const nuevoDescuentoPrecio = ref(0);

// --- Computados ---
const precioBaseMXN = computed(() => formBase.value.precioBaseUsd * formBase.value.tipoCambio);

const eliminarCalibre = async (id: number) => {
  try {
    await api.delete(`/api/reglas-precio/calibres/${id}`);
    await cargarDatos();
    Notify.create({ type: 'positive', message: 'Calibre eliminado' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al eliminar calibre' });
  }
};

const agregarDescuentoPrecio = async () => {
  if (nuevoDescuentoPrecio.value < 0) return;
  const codigo = `DP${listaDescuentosPrecio.value.length + 1}`;
  try {
    await api.post(
      '/api/reglas-precio/descuentos-precio',
      {
        codigo,
        descuento_mxn: nuevoDescuentoPrecio.value,
        sede_id: authStore.sedeActivaId,
      },
      { params: { sedeId: authStore.sedeActivaId, granoId: granoSeleccionado.value } },
    );
    nuevoDescuentoPrecio.value = 0;
    await cargarDatos();
    Notify.create({ type: 'positive', message: 'Descuento agregado' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al agregar descuento' });
  }
};

const eliminarDescuentoPrecio = async (id: number) => {
  try {
    await api.delete(`/api/reglas-precio/descuentos-precio/${id}`);
    await cargarDatos();
    Notify.create({ type: 'positive', message: 'Registro eliminado' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error: El registro podría estar en uso' });
  }
};

const descuentoCalibreSeleccionado = computed(() => {
  const encontrado = listaCalibres.value.find((c) => c.id === calibreSimulacion.value);
  return encontrado ? encontrado.descuento_kg_ton : 0;
});

const nivelesProcesados = computed(() => {
  const montoCalibre = descuentoCalibreSeleccionado.value || 0;
  let precioArrastre = 0;

  return tablaExportacion.value.map((nivel, index) => {
    const descOpt = listaDescuentosPrecio.value.find((d) => d.id === nivel.descuento_precio_id);
    const montoDescuentoNivel = descOpt ? descOpt.descuento_mxn : 0;

    const precioCalculado =
      index === 0
        ? precioBaseMXN.value - montoCalibre - montoDescuentoNivel
        : precioArrastre - montoDescuentoNivel;

    precioArrastre = precioCalculado;

    return {
      ...nivel,
      precioCalculado,
      codigoDescuento: descOpt ? descOpt.codigo : 'DP',
      montoDescuento: montoDescuentoNivel,
    };
  });
});

// --- Funciones de Carga ---
const cargarDatos = async () => {
  const miSede = authStore.sedeActivaId;
  if (miSede === null || miSede === undefined) return;

  loading.value = true;
  try {
    const userId = authStore.user?.id?.toString();
    if (userId) await ObtenerUsuarioActual(userId);

    const [configRes, catsRes] = await Promise.all([
      api.get('/api/reglas-precio/config-actual', { params: { sedeId: miSede } }),
      api.get('/api/reglas-precio/catalogos', {
        params: { sedeId: miSede, granoId: granoSeleccionado.value },
      }),
    ]);

    if (configRes.data) {
      formBase.value = { ...formBase.value, ...configRes.data, sede_id: miSede };
    } else {
      formBase.value = { ...formBase.value, precioBaseUsd: 0, tipoCambio: 0, sede_id: miSede };
    }

    listaCalibres.value = catsRes.data.calibres || [];
    listaDescuentosPrecio.value = catsRes.data.precios || [];
    tablaExportacion.value = catsRes.data.export || [];
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar datos' });
  } finally {
    loading.value = false;
  }
};

const ObtenerUsuarioActual = async (id: string) => {
  try {
    const { data } = await api.get(`/api/reglas-precio/obtener-usuario/${id}`);
    nombreUsuarioReal.value = data.nombre;
  } catch {
    nombreUsuarioReal.value = 'Usuario desconocido';
  }
};

// --- Acciones ---
const guardarConfigBase = async () => {
  try {
    loading.value = true;
    await api.post('/api/reglas-precio/guardar-base', {
      ...formBase.value,
      precioBaseMxn: precioBaseMXN.value,
      UsuarioRegistro: nombreUsuarioReal.value,
      SedeId: authStore.sedeActivaId, // <--- Asegúrate que se llame exactamente así
    });
    Notify.create({ type: 'positive', message: 'Configuración guardada' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al guardar' });
  } finally {
    loading.value = false;
  }
};

const ejecutarActualizacionMasiva = async () => {
  try {
    loading.value = true;
    await api.post('/api/reglas-precio/actualizar-precios-masivo', {
      precioBaseMxn: precioBaseMXN.value,
      SedeId: authStore.sedeActivaId,
    });
    await cargarDatos();
    Notify.create({ type: 'positive', message: 'Precios actualizados masivamente' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error en actualización masiva' });
  } finally {
    loading.value = false;
  }
};

const actualizarNivel = async (nivel: NivelExport, index: number) => {
  try {
    const nivelCalculado = nivelesProcesados.value[index];

    // AGREGA ESTA VALIDACIÓN DE SEGURIDAD:
    if (!nivelCalculado) {
      console.error('No se encontró el nivel calculado para el índice:', index);
      return;
    }

    await api.put(`/api/reglas-precio/niveles-exportacion/${nivel.id}`, {
      id: nivel.id,
      descuentoPrecioId: nivel.descuento_precio_id,
      vigente: nivel.vigente,
      precioFinalMxn: nivelCalculado.precioCalculado,
      grano_id: granoSeleccionado.value,
    });

    await cargarDatos();
    Notify.create({ type: 'positive', message: `Nivel ${nivel.codigo} actualizado`, timeout: 500 });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al actualizar nivel' });
  }
};

// --- Manejo de Calibres y Descuentos ---
const agregarCalibre = async () => {
  const codigo = `DC${listaCalibres.value.length + 1}`;
  try {
    await api.post(
      '/api/reglas-precio/calibres',
      {
        codigo,
        calibre: nuevoCalibre.value.calibre,
        descuento_kg_ton: nuevoCalibre.value.descuento_kg_ton,
        sede_id: authStore.sedeActivaId,
      },
      { params: { sedeId: authStore.sedeActivaId, granoId: granoSeleccionado.value } },
    );
    nuevoCalibre.value = { calibre: '', descuento_kg_ton: 0 };
    await cargarDatos();
  } catch {
    Notify.create({ type: 'negative', message: 'Error al agregar' });
  }
};

const guardarEdicionCalibre = async (row: DescuentoCalibre) => {
  try {
    await api.put(`/api/reglas-precio/calibres/${row.id}`, {
      ...row,
      grano_id: granoSeleccionado.value,
    });
    editandoCalibre.value = null;
    Notify.create({ type: 'positive', message: 'Actualizado' });
  } catch {
    await cargarDatos();
  }
};

const guardarEdicionPrecio = async (row: DescuentoPrecio) => {
  try {
    await api.put(`/api/reglas-precio/descuentos-precio/${row.id}`, {
      ...row,
      grano_id: granoSeleccionado.value,
    });
    editandoPrecio.value = null;
    Notify.create({ type: 'positive', message: 'Actualizado' });
  } catch {
    await cargarDatos();
  }
};

const consultarAPI = async () => {
  try {
    loading.value = true;
    const { data } = await api.get(formBase.value.urlApi);
    if (data.rates?.MXN) formBase.value.tipoCambio = data.rates.MXN;
  } catch {
    Notify.create({ type: 'negative', message: 'Error API Cambio' });
  } finally {
    loading.value = false;
  }
};

// --- Cargar granos del catálogo ---
const cargarGranos = async () => {
  try {
    const { data } = await api.get('/api/catalogos/granos');

    listaGranos.value = data.filter((g: Grano) => g.activo);

    // Seleccionar el primer grano por defecto si no hay ninguno seleccionado en Reglas de Precio
    const primerGrano = listaGranos.value[1];

    if (!granoSeleccionado.value && primerGrano) {
      granoSeleccionado.value = primerGrano.id;
    }
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar granos' });
  }
};

// --- Watcher vital para multisede ---
watch(
  () => authStore.sedeActivaId,
  async () => {
    await cargarGranos();
    await cargarDatos();
  },
);

onMounted(async () => {
  await cargarGranos();
  await cargarDatos();
});
</script>
