<template>
  <q-card flat class="full-width bg-grey-1">
    <q-card-section class="row items-center bg-white q-pb-none">
      <q-btn flat round icon="arrow_back" color="grey-7" @click="$emit('close')" />
      <div class="text-h6 q-ml-sm">Nuevo Registro - Báscula Recepción</div>
      <q-space />
      <div v-if="campoVisible('ticket')" class="text-h6 text-weight-bolder text-primary">
        TICKET: {{ form.ticket_numero }}
      </div>
    </q-card-section>

    <q-card-section class="q-pa-md">
      <q-form @submit.prevent="onSubmit" class="row q-col-gutter-md">
        <div class="col-12 col-md-8">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-4" v-if="campoVisible('fechaHora')">
              <q-input
                v-model="fechaDisplay"
                label="Fecha y Hora"
                readonly
                outlined
                dense
                bg-color="white"
              />
            </div>
            <div class="col-12 col-md-4" v-if="campoVisible('grano')">
              <q-select
                v-model="form.grano_id"
                :options="catalogoGranos"
                option-value="id"
                option-label="nombre"
                emit-value
                map-options
                :label="campoLabel('grano', 'Grano')"
                outlined
                dense
                bg-color="white"
                :rules="campoObligatorio('grano') ? [(v: unknown) => !!v || 'Campo requerido'] : []"
              />
            </div>

            <div class="col-12 col-md-8" v-if="campoVisible('productor')">
              <q-select
                v-model="productorSeleccionado"
                :options="opcionesProductores"
                option-label="nombre"
                :label="campoLabel('productor', 'Productor')"
                outlined
                dense
                bg-color="white"
                use-input
                input-debounce="0"
                clearable
                :loading="buscandoProductores"
                :rules="
                  campoObligatorio('productor') ? [(v: unknown) => !!v || 'Campo requerido'] : []
                "
                @filter="filtrarProductores"
                @update:model-value="onProductorSelected"
              >
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                      <q-item-label caption v-if="scope.opt.rfc">{{ scope.opt.rfc }}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="scope.opt.origenDb === 'registro'">
                      <q-badge color="green-7" label="INT" />
                    </q-item-section>
                  </q-item>
                </template>
                <template #no-option="scope">
                  <q-item>
                    <q-item-section class="text-grey text-caption">Sin resultados</q-item-section>
                  </q-item>
                  <q-item clickable @click="iniciarNuevoProductor(scope.inputValue)">
                    <q-item-section class="text-primary text-caption">
                      + Registrar nuevo productor
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:after>
                  <q-btn round dense color="primary" icon="add" @click="modalProductor = true" />
                </template>
              </q-select>

              <!-- Datos del productor (siempre visibles) -->
              <div class="q-mt-xs">
                <q-banner
                  v-if="camposProductor.tipo_persona === 'Moral' && camposProductor.atiende"
                  dense
                  class="bg-blue-1 text-blue-9 q-mb-xs rounded-borders"
                >
                  <template v-slot:avatar>
                    <q-icon name="info" color="blue-9" size="xs" />
                  </template>
                  Atiende: {{ camposProductor.atiende }}
                </q-banner>
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-md-6">
                    <q-input v-model="camposProductor.telefono" label="Teléfono" outlined dense bg-color="white" mask="##########" />
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-4" v-if="campoVisible('tProductor')">
              <q-select
                v-model="form.tipo_productor"
                :options="['Ejidal', 'Pequeña Propiedad']"
                :label="campoLabel('tProductor', 'T. Productor')"
                outlined
                dense
                bg-color="white"
              />
            </div>

            <div class="col-12 col-md-4" v-if="campoVisible('origen')">
              <q-select
                v-model="form.origen_id"
                :options="catalogoOrigenes"
                option-value="id"
                option-label="municipio"
                emit-value
                map-options
                :label="campoLabel('origen', 'Origen')"
                outlined
                dense
                bg-color="white"
                :rules="
                  campoObligatorio('origen') ? [(v: unknown) => !!v || 'Campo requerido'] : []
                "
              />
            </div>
            <div class="col-12 col-md-4" v-if="campoVisible('comprador')">
              <q-select
                v-model="form.comprador_id"
                :options="catalogoCompradores"
                option-value="id"
                option-label="nombre"
                emit-value
                map-options
                :label="campoLabel('comprador', 'Comprador')"
                outlined
                dense
                bg-color="white"
                :rules="
                  campoObligatorio('comprador') ? [(v: unknown) => !!v || 'Campo requerido'] : []
                "
              />
            </div>

            <div class="col-12 col-md-4" v-if="campoVisible('chofer')">
              <q-select
                v-model="form.chofer"
                :options="opcionesChofer"
                :label="campoLabel('chofer', 'Chofer')"
                outlined
                dense
                bg-color="white"
                use-input
                fill-input
                hide-selected
                @filter="filtrarChoferes"
                @update:model-value="onChoferSelectedObjeto"
                @input-value="
                  (val) => {
                    form.chofer = val;
                  }
                "
              />
            </div>
            <div class="col-12 col-md-4" v-if="campoVisible('placas')">
              <q-select
                v-model="form.placas"
                :options="opcionesPlacas"
                :label="campoLabel('placas', 'Placas')"
                outlined
                dense
                bg-color="white"
                use-input
                fill-input
                hide-selected
                mask="XXX-XXX-XXX"
                new-value-mode="add-unique"
                @filter="filtrarPlacas"
                @input-value="
                  (val) => {
                    form.placas = val.toUpperCase();
                  }
                "
                style="text-transform: uppercase"
              />
            </div>
            <div class="col-12 col-md-4" v-if="campoVisible('tonAprox')">
              <q-input
                v-model.number="form.ton_aprox"
                type="number"
                step="0.01"
                :label="campoLabel('tonAprox', 'Ton. Aprox')"
                outlined
                dense
                bg-color="white"
                :rules="
                  campoObligatorio('tonAprox') ? [(v: unknown) => !!v || 'Campo requerido'] : []
                "
              />
            </div>
            <div class="col-12 col-md-4" v-if="campoVisible('has')">
              <q-input
                v-model.number="form.has"
                type="number"
                step="0.01"
                :label="campoLabel('has', 'HAS')"
                outlined
                dense
                bg-color="white"
                :rules="
                  campoObligatorio('has') ? [(v: unknown) => !!v || 'Campo requerido'] : []
                "
              />
            </div>
            <div class="col-12" v-if="campoVisible('observaciones')">
              <q-input
                v-model="form.observaciones"
                :label="campoLabel('observaciones', 'Observaciones')"
                outlined
                dense
                bg-color="white"
                type="textarea"
                :rows="2"
              />
            </div>

            <!-- Campos personalizados (creados desde Configuración de Campos) -->
            <div
              v-for="campo in camposPersonalizadosVisibles"
              :key="campo.claveCampo"
              class="col-12 col-md-4"
            >
              <q-input
                v-model="valoresCamposPersonalizados[campo.claveCampo]"
                :label="campo.obligatorio ? `${campo.nombreMostrar} *` : campo.nombreMostrar"
                outlined
                dense
                bg-color="white"
                :rules="campo.obligatorio ? [(v: unknown) => !!v || 'Campo requerido'] : []"
              />
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4" v-if="campoVisible('pesoBruto')">
          <q-card bordered flat class="bg-amber-1" style="border: 2px solid #f2c037">
            <q-card-section class="text-center">
              <div class="text-subtitle2 text-weight-bold q-mb-sm text-uppercase">
                Peso Bruto (kg)
              </div>
              <div class="text-h2 text-weight-bolder text-primary q-mb-md">
                {{ form.peso_bruto_kg.toLocaleString() }}
              </div>

              <div class="row q-gutter-sm">
                <q-btn
                  color="positive"
                  icon="scale"
                  label="Leer Báscula"
                  class="col"
                  size="lg"
                  disable
                />
                <q-btn
                  color="black"
                  icon="edit"
                  label="Captura Manual"
                  class="col"
                  outline
                  @click="abrirCapturaManual"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 row justify-end q-gutter-sm q-mt-lg">
          <q-btn label="Cancelar" color="grey-8" flat @click="$emit('close')" />
          <q-btn
            label="Generar Ticket de Entrada"
            type="submit"
            color="primary"
            icon="save"
            unelevated
          />
        </div>
      </q-form>
    </q-card-section>

    <q-dialog v-model="modalProductor" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Agregar nuevo Productor</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div class="row q-gutter-md">
            <q-radio v-model="nuevoProd.tipo" val="Fisica" label="Física" />
            <q-radio v-model="nuevoProd.tipo" val="Moral" label="Moral" />
          </div>
          <q-input v-model="nuevoProd.nombre"
            :label="nuevoProd.tipo === 'Moral' ? 'Razón Social' : 'Nombre del productor'"
            outlined dense />
          <q-input v-if="nuevoProd.tipo === 'Moral'"
            v-model="nuevoProd.atiende" label="Nombre de quien atiende"
            outlined dense />
          <q-input v-model="nuevoProd.telefono" label="Teléfono"
            outlined dense mask="##########" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cerrar" flat v-close-popup />
          <q-btn label="Registrar Productor" color="primary" @click="guardarNuevoProductor" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth'; // Asegúrate de que la ruta sea correcta
import { useOfflineStore } from 'src/stores/offlineStore';
import type { ProductorPendiente } from 'src/stores/offlineStore';

const authStore = useAuthStore(); // Instanciamos el store de Pinia
const offlineStore = useOfflineStore();
const usuarioDbId = ref<number | null>(null); // Aquí guardaremos el '3'

async function cargarIdRealDeUsuario() {
  const uuid = authStore.user?.id; // Este es el "483381cb..."

  if (!uuid) return;

  // Fallback desde caché si no hay red
  const cached = Number(localStorage.getItem('alazan_usuario_db_id'));
  if (cached) usuarioDbId.value = cached;

  try {
    const res = await api.get(`/api/usuarios/perfil/${uuid}`);
    usuarioDbId.value = res.data.id; // Guardamos el '3' (o el que corresponda)
    localStorage.setItem('alazan_usuario_db_id', String(res.data.id));
    console.log('ID de auditoría cargado:', usuarioDbId.value);
  } catch (error) {
    console.error('No se pudo traducir el UUID a ID numérico', error);
  }
}

onMounted(async () => {
  await cargarIdRealDeUsuario();
});

const $q = useQuasar();
interface ChoferCatalogo {
  id?: number;
  chofer: string;
  placas: string;
}

interface SelectOption {
  label: string;
  value: ChoferCatalogo | string;
}

interface CampoConfigItem {
  id: number;
  pantalla: string;
  claveCampo: string;
  nombreMostrar: string;
  orden: number;
  visible: boolean;
  obligatorio: boolean;
  esSistema: boolean;
}

const props = withDefaults(
  defineProps<{
    ultimoTicket: number;
    catalogoGranos: Grano[];
    catalogoOrigenes: Origen[];
    catalogoCompradores: Comprador[];
    listaProductores?: Productor[];
    catalogoChoferes?: ChoferCatalogo[];
    ultimoGranoId?: number | null;
    camposConfig?: CampoConfigItem[];
    isOnline?: boolean;
  }>(),
  {
    catalogoChoferes: () => [],
    camposConfig: () => [],
    isOnline: true,
  },
);

// Mapa de configuración de campos: claveCampo -> { visible, obligatorio }
const camposMap = computed(() => {
  const map = new Map<string, { visible: boolean; obligatorio: boolean }>();
  for (const c of props.camposConfig) {
    map.set(c.claveCampo, { visible: c.visible, obligatorio: c.obligatorio });
  }
  return map;
});

// Si hay configuración cargada, solo mostrar campos explícitamente marcados como visibles
// Si NO hay configuración (array vacío), mostrar todo por defecto
function campoVisible(clave: string): boolean {
  if (props.camposConfig.length === 0) return true; // Sin configuración = mostrar todo
  const cfg = camposMap.value.get(clave);
  if (!cfg) return false; // Campo no está en la config = oculto
  return cfg.visible;
}

function campoObligatorio(clave: string): boolean {
  const cfg = camposMap.value.get(clave);
  if (!cfg) return false;
  return cfg.obligatorio;
}

function campoLabel(clave: string, labelBase: string): string {
  return campoObligatorio(clave) ? `${labelBase} *` : labelBase;
}

// Claves de campos predefinidos (tienen HTML propio en el template)
const CAMPOS_PREDEFINIDOS = new Set([
  'ticket',
  'fechaHora',
  'grano',
  'productor',
  'tProductor',
  'atienda',
  'celular',
  'origen',
  'comprador',
  'chofer',
  'placas',
  'tonAprox',
  'has',
  'observaciones',
  'pesoBruto',
]);

// Campos personalizados visibles: los que NO son predefinidos y están marcados como visibles
const camposPersonalizadosVisibles = computed(() => {
  return props.camposConfig
    .filter((c) => !CAMPOS_PREDEFINIDOS.has(c.claveCampo) && c.visible)
    .sort((a, b) => a.orden - b.orden);
});

// Valores reactivos para campos personalizados
const valoresCamposPersonalizados = reactive<Record<string, string>>({});

const emit = defineEmits(['save', 'close', 'refresh-productores']);

const fechaDisplay = ref(new Date().toLocaleString());
const modalProductor = ref(false);
const nuevoProd = reactive({ tipo: 'Fisica', nombre: '', atiende: '', telefono: '' });

interface Productor {
  id: number | null; // null = existe solo en MBA3, pendiente de alta local
  nombre: string;
  telefono: string;
  telefono2?: string; // de TELEPHONE_PM
  atiende?: string;
  rfc?: string;
  correo?: string; // de E_MAIL
  origen: 'LOCAL' | 'MBA3' | 'MBA3+LOCAL';
  origenDb?: string;
  mba3Raw?: Record<string, unknown>;
}

interface Grano {
  id: number;
  nombre: string;
}

interface Origen {
  id: number;
  municipio: string;
  estado: string;
}

interface Comprador {
  id: string; // Es string porque es un GUID
  nombre: string;
}

const form = reactive({
  ticket_numero: props.ultimoTicket,
  fecha_hora: new Date().toISOString(),
  grano_id:
    props.ultimoGranoId ??
    (authStore.sedeActivaId === 8 ? 4 : authStore.sedeActivaId === 9 ? 5 : (null as number | null)),
  productor_id: null as number | null,
  tipo_productor: 'Ejidal',
  telefono2: '',
  origen_id: null,
  comprador_id: null,
  chofer: '',
  placas: '',
  ton_aprox: 0,
  has: null as number | null,
  peso_bruto_kg: 0,
  status: 'PENDIENTE',
  observaciones: '',
});

// Establecer valores por defecto cuando se cargan los catálogos
watch(
  () => props.catalogoOrigenes,
  (origenes) => {
    if (origenes.length > 0 && form.origen_id === null) {
      const defOrigen = origenes.find((o) =>
        o.municipio.toLowerCase().includes('salvador alvarado'),
      );
      if (defOrigen) form.origen_id = defOrigen.id as never;
    }
  },
  { immediate: true },
);

watch(
  () => props.catalogoCompradores,
  (compradores) => {
    if (compradores.length > 0 && form.comprador_id === null) {
      const defComprador = compradores.find((c) => c.nombre.toLowerCase().includes('edgar soto'));
      if (defComprador) form.comprador_id = defComprador.id as never;
    }
  },
  { immediate: true },
);

// Referencia al chofer seleccionado del catálogo (para filtrar placas exactas)
const selectedChoferId = ref<number | null>(null);

// Opciones filtradas para chofer y placas
const opcionesChofer = ref<SelectOption[]>([]);
const opcionesPlacas = ref<string[]>([]);

// Filtrar choferes (Permite escribir nombres nuevos gracias a use-input)
function filtrarChoferes(val: string, update: (cb: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase();

    // Mapeamos el catálogo a nuestro nuevo tipo SelectOption
    const opciones: SelectOption[] = (props.catalogoChoferes ?? []).map((c) => ({
      label: `${c.chofer} | Placas: ${c.placas || 'N/A'}`,
      value: c, // Aquí value es de tipo ChoferCatalogo
    }));

    opcionesChofer.value = needle
      ? opciones.filter((v) => v.label.toLowerCase().includes(needle))
      : opciones;
  });
}

function filtrarPlacas(val: string, update: (cb: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase();
    // Si se seleccionó un chofer del catálogo, solo mostrar SUS placas específicas
    let relevantes: ChoferCatalogo[];
    if (selectedChoferId.value) {
      relevantes = props.catalogoChoferes.filter((c) => c.id === selectedChoferId.value);
    } else if (form.chofer) {
      relevantes = props.catalogoChoferes.filter((c) => c.chofer === form.chofer);
    } else {
      relevantes = props.catalogoChoferes;
    }

    const unicos = [...new Set(relevantes.map((c) => c.placas).filter(Boolean))];
    opcionesPlacas.value = needle ? unicos.filter((v) => v.toLowerCase().includes(needle)) : unicos;
  });
}

function onChoferSelectedObjeto(seleccionado: SelectOption | string | null) {
  if (!seleccionado) return;

  // Si el usuario seleccionó una opción de la lista (es el objeto SelectOption)
  if (typeof seleccionado === 'object' && 'value' in seleccionado) {
    const datos = seleccionado.value;
    if (typeof datos === 'object') {
      form.chofer = datos.chofer;
      form.placas = datos.placas || '';
      selectedChoferId.value = datos.id ?? null;
    }
  } else if (typeof seleccionado === 'string') {
    // Si el usuario escribió el nombre y presionó Enter (es un string)
    form.chofer = seleccionado;
    selectedChoferId.value = null;
  }
}

interface CamposProductor {
  nombre: string;
  rfc: string;
  telefono: string;
  tipo_persona: string;
  atiende: string;
}
const camposProductor = reactive<CamposProductor>({ nombre: '', rfc: '', telefono: '', tipo_persona: 'Fisica', atiende: '' });
const snapshotProductor = ref<CamposProductor | null>(null);
const opcionesProductores = ref<Productor[]>([]);
const productorSeleccionado = ref<Productor | null>(null);
const buscandoProductores = ref(false);

function filtrarProductores(val: string, update: (fn: () => void) => void) {
  update(() => {
    const list = props.listaProductores ?? [];
    opcionesProductores.value = val
      ? list.filter((p) => p.nombre.toUpperCase().includes(val.toUpperCase()))
      : list;
  });
}

function onProductorSelected(prod: Productor | null) {
  if (!prod) {
    form.productor_id = null;
    form.telefono2 = '';
    camposProductor.nombre = '';
    camposProductor.rfc = '';
    camposProductor.telefono = '';
    camposProductor.tipo_persona = 'Fisica';
    camposProductor.atiende = '';
    snapshotProductor.value = null;
    return;
  }
  form.productor_id = prod.id;
  form.telefono2 = prod.telefono2 ?? '';
  camposProductor.nombre = prod.nombre ?? '';
  camposProductor.rfc = prod.rfc ?? '';
  camposProductor.telefono = prod.telefono ?? '';
  camposProductor.tipo_persona = (prod.rfc && prod.rfc.length === 12) || prod.atiende ? 'Moral' : 'Fisica';
  camposProductor.atiende = prod.atiende ?? '';
  // Guardar snapshot para detectar cambios al guardar
  snapshotProductor.value = { ...camposProductor };
}

function iniciarNuevoProductor(nombreInicial = '') {
  productorSeleccionado.value = { id: null, nombre: nombreInicial, telefono: '', origen: 'LOCAL' };
  camposProductor.nombre = nombreInicial;
  camposProductor.rfc = '';
  camposProductor.telefono = '';
  camposProductor.tipo_persona = 'Fisica';
  camposProductor.atiende = '';
  snapshotProductor.value = null;
  form.productor_id = null;
}

function camposCambiaron(): boolean {
  if (!snapshotProductor.value) return false;
  const s = snapshotProductor.value;
  return (
    camposProductor.nombre !== s.nombre ||
    camposProductor.rfc !== s.rfc ||
    camposProductor.telefono !== s.telefono ||
    camposProductor.tipo_persona !== s.tipo_persona ||
    camposProductor.atiende !== s.atiende
  );
}

async function guardarNuevoProductor() {
  if (!props.isOnline) {
    // Guardar localmente
    const localId = 'LOCAL_PROD_' + Date.now();
    const prodLocal: ProductorPendiente = {
      nombre: nuevoProd.nombre,
      telefono: nuevoProd.telefono,
      tipo_persona: nuevoProd.tipo as 'Fisica' | 'Moral',
      atiende: nuevoProd.tipo === 'Moral' ? nuevoProd.atiende : null,
      _localId: localId,
      _syncStatus: 'pending',
    };
    offlineStore.agregarProductor(prodLocal);

    // Agregarlo al selector como si fuera real, marcado con _localId
    const prodEnSelector = {
      id: null,
      _localId: localId,
      nombre: nuevoProd.nombre,
      telefono: nuevoProd.telefono,
      origen: 'LOCAL_OFFLINE',
    } as unknown as Productor;
    opcionesProductores.value = [prodEnSelector, ...opcionesProductores.value];
    productorSeleccionado.value = prodEnSelector;
    onProductorSelected(prodEnSelector);
    modalProductor.value = false;
    nuevoProd.tipo = 'Fisica'; nuevoProd.nombre = ''; nuevoProd.atiende = ''; nuevoProd.telefono = '';
    $q.notify({ type: 'warning', icon: 'cloud_off', message: 'Productor guardado localmente — se registrará al recuperar red' });
    return;
  }

  // Lógica online original
  try {
    const res = await api.post('/api/catalogos/productores', {
      nombre: nuevoProd.nombre,
      telefono: nuevoProd.telefono,
      tipo_persona: nuevoProd.tipo,
      atiende: nuevoProd.tipo === 'Moral' ? nuevoProd.atiende : null,
      origen: 'registro',
    });
    const recienCreado: Productor = {
      id: res.data.id,
      nombre: nuevoProd.nombre,
      telefono: nuevoProd.telefono,
      ...(nuevoProd.atiende ? { atiende: nuevoProd.atiende } : {}),
      origen: 'LOCAL',
    };
    opcionesProductores.value = [recienCreado, ...opcionesProductores.value];
    productorSeleccionado.value = recienCreado;
    onProductorSelected(recienCreado);
    modalProductor.value = false;
    nuevoProd.tipo = 'Fisica';
    nuevoProd.nombre = '';
    nuevoProd.atiende = '';
    nuevoProd.telefono = '';
    emit('refresh-productores');
    $q.notify({ type: 'positive', message: 'Productor registrado con éxito' });
  } catch {
    $q.notify({ type: 'negative', message: 'Error al registrar productor' });
  }
}

// 2. Captura Manual de Peso
function abrirCapturaManual() {
  $q.dialog({
    title: 'Captura Manual',
    message: 'Ingrese los kilogramos actuales en báscula:',
    prompt: { model: '', type: 'number' },
    cancel: true,
    persistent: true,
  }).onOk((data) => {
    form.peso_bruto_kg = parseFloat(data);
  });
}


async function onSubmit() {
  if (form.peso_bruto_kg <= 0) {
    return $q.notify({ type: 'warning', message: 'Debe capturar el peso bruto' });
  }

  // Resolver productor: crear si es nuevo, actualizar si cambió algún dato
  if (productorSeleccionado.value) {
    const prod = productorSeleccionado.value;

    if (!prod.id && !(prod as unknown as Record<string, unknown>)['_localId']) {
      // Productor nuevo (viene de MBA3 sin alta local, o fue iniciado manualmente)
      const localList = props.listaProductores ?? [];
      // Intentar encontrar coincidencia por RFC o nombre antes de crear
      let match = camposProductor.rfc
        ? localList.find((p) => p.rfc === camposProductor.rfc)
        : undefined;
      if (!match)
        match = localList.find(
          (p) => p.nombre.toLowerCase() === camposProductor.nombre.toLowerCase(),
        );

      if (match?.id) {
        form.productor_id = match.id;
        productorSeleccionado.value = { ...prod, id: match.id, origen: 'MBA3+LOCAL' };
      } else {
        try {
          const raw = prod.mba3Raw ?? {};
          const strOf = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
          const res = await api.post('/api/catalogos/productores', {
            nombre: camposProductor.nombre,
            rfc: camposProductor.rfc || null,
            tipo_persona: camposProductor.tipo_persona,
            atiende: camposProductor.tipo_persona === 'Moral' ? camposProductor.atiende || null : null,
            telefono: camposProductor.telefono || null,
            telefono2: (prod.telefono2 || '').replace(/\s/g, '') || null,
            fax: strOf(raw['FACSIMILE']),
            codigo_proveedor: strOf(raw['ACCT_CODE']),
            direccion1: strOf(raw['ADDRESS_1']),
            direccion2: strOf(raw['ADDRESS_2']),
            ciudad: strOf(raw['CITY']),
            estado: strOf(raw['STATE']),
            codigo_postal: strOf(raw['ZIP']),
            pais: strOf(raw['COUNTRY']),
            nombre_alterno: strOf(raw['NAME_RAZON_SOCIAL']),
            correo: strOf(raw['E_MAIL']),
            origen: 'mba3',
          });
          form.productor_id = res.data.id;
          productorSeleccionado.value = { ...prod, id: res.data.id, origen: 'MBA3+LOCAL' };
          emit('refresh-productores');
        } catch {
          if (!window.navigator.onLine) {
            // Sin red: guardar productor en cola offline y continuar el registro
            const localId = 'LOCAL_PROD_' + Date.now();
            offlineStore.agregarProductor({
              nombre: camposProductor.nombre,
              telefono: camposProductor.telefono || '',
              tipo_persona: camposProductor.tipo_persona as 'Fisica' | 'Moral',
              atiende: camposProductor.tipo_persona === 'Moral' ? camposProductor.atiende || null : null,
              _localId: localId,
              _syncStatus: 'pending',
            });
            form.productor_id = null;
            // Inyectar _localId en el objeto seleccionado para que onSubmit lo propague
            (productorSeleccionado.value as unknown as Record<string, unknown>)['_localId'] = localId;
          } else {
            return $q.notify({
              type: 'negative',
              message: 'No se pudo registrar el productor en el sistema local.',
            });
          }
        }
      }
    } else if (camposCambiaron()) {
      // Productor existente con datos modificados → actualizar en SQL
      try {
        await api.put(`/api/catalogos/editar/productores/${prod.id}`, {
          Nombre: camposProductor.nombre,
          Telefono: camposProductor.telefono || null,
          Telefono2: prod.telefono2 ?? null,
          Rfc: camposProductor.rfc || null,
          Correo: prod.correo ?? null,
          Tipo_persona: camposProductor.tipo_persona,
          Banco_id: null,
          Cuenta_clabe: null,
          Atiende: camposProductor.tipo_persona === 'Moral' ? camposProductor.atiende || null : null,
        });
        emit('refresh-productores');
      } catch {
        // No cancelar el guardado por un fallo en la actualización del productor
        $q.notify({ type: 'warning', message: 'Registro guardado, pero no se pudo actualizar el productor.' });
      }
    }
  }

  const registroParaGuardar = {
    ticket_numero: String(form.ticket_numero),
    fecha_hora: new Date().toISOString(),
    productor_id: form.productor_id ? Number(form.productor_id) : null,
    chofer: form.chofer,
    placas: form.placas,
    peso_bruto_kg: Number(form.peso_bruto_kg),
    ton_aprox: form.ton_aprox > 0 ? Number(form.ton_aprox) : null,
    grano_id: form.grano_id ? Number(form.grano_id) : null,
    origen_id: form.origen_id ? Number(form.origen_id) : null,
    comprador_id: form.comprador_id,
    status: form.status,
    datos_adicionales: JSON.stringify({
      tipo_productor: form.tipo_productor,
      observaciones: form.observaciones,
      celular: camposProductor.telefono,
      telefono2: form.telefono2,
      atiende: camposProductor.tipo_persona === 'Moral' ? camposProductor.atiende : '',
      ...(form.has !== null ? { has: form.has } : {}),
      ...valoresCamposPersonalizados,
    }),
    boleta_numero: null,
    // AQUÍ ESTÁ LA MAGIA: Mandamos el número (3), no el UUID
    usuario_registro_id: usuarioDbId.value,
    _productor_nombre: productorSeleccionado.value?.nombre ?? '',
    _productor_localId: (productorSeleccionado.value as unknown as Record<string, unknown>)?.['_localId'] as string | undefined ?? undefined,
  };

  emit('save', registroParaGuardar);
}
</script>
