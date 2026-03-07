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
                    <q-item-section side>
                      <q-badge
                        :color="
                          scope.opt.origen === 'MBA3+LOCAL'
                            ? 'deep-purple'
                            : scope.opt.origen === 'MBA3'
                              ? 'blue-7'
                              : 'green-7'
                        "
                        :label="
                          scope.opt.origen === 'MBA3+LOCAL'
                            ? 'MBA3/INT'
                            : scope.opt.origen === 'MBA3'
                              ? 'MBA3'
                              : 'INT'
                        "
                      />
                    </q-item-section>
                  </q-item>
                </template>
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey text-caption">Sin resultados</q-item-section>
                  </q-item>
                  <q-item clickable @click="modalProductor = true">
                    <q-item-section class="text-primary text-caption">
                      + Registrar nuevo productor
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:after>
                  <q-btn round dense color="primary" icon="add" @click="modalProductor = true" />
                </template>
              </q-select>

              <q-banner
                v-if="infoProductor"
                dense
                class="bg-blue-1 text-blue-9 q-mt-xs rounded-borders"
              >
                <template v-slot:avatar>
                  <q-icon name="info" color="blue-9" size="xs" />
                </template>
                {{ infoProductor }}
              </q-banner>
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

            <div class="col-12 col-md-4" v-if="campoVisible('celular')">
              <q-input
                v-model="form.celular"
                :label="campoLabel('celular', 'Celular')"
                outlined
                dense
                bg-color="grey-2"
                readonly
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

          <template v-if="nuevoProd.tipo === 'Fisica'">
            <q-input
              v-model="nuevoProd.nombre"
              label="Nombre del productor"
              placeholder="Ing. Luis Perez"
              outlined
              dense
            />
          </template>
          <template v-else>
            <!-- <q-input v-model="nuevoProd.rfc" label="Razón Social" outlined dense /> -->
            <q-input
              v-model="nuevoProd.nombre"
              label="Razón Social"
              placeholder="Agronegocios SA DE CV"
              outlined
              dense
            />
            <q-input
              v-model="nuevoProd.atiende"
              label="Nombre de quien atiende"
              placeholder="Ing. Carlos Ramírez"
              outlined
              dense
            />
          </template>
          <q-input
            v-model="nuevoProd.telefono"
            label="Teléfono"
            placeholder="6441234567"
            outlined
            dense
            mask="##########"
          />
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
import { mba3Request } from 'src/services/mba3Api';

const authStore = useAuthStore(); // Instanciamos el store de Pinia
const usuarioDbId = ref<number | null>(null); // Aquí guardaremos el '3'

async function cargarIdRealDeUsuario() {
  const uuid = authStore.user?.id; // Este es el "483381cb..."

  if (!uuid) return;

  try {
    const res = await api.get(`/api/usuarios/perfil/${uuid}`);
    usuarioDbId.value = res.data.id; // Guardamos el '3' (o el que corresponda)
    console.log('ID de auditoría cargado:', usuarioDbId.value);
  } catch (error) {
    console.error('No se pudo traducir el UUID a ID numérico', error);
  }
}

onMounted(async () => {
  await cargarIdRealDeUsuario();
  // Pre-cargar la lista inicial de MBA3 en background para que el dropdown sea instantáneo
  void executeMba3Search('');
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
  }>(),
  {
    catalogoChoferes: () => [],
    camposConfig: () => [],
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

interface Productor {
  id: number | null; // null = existe solo en MBA3, pendiente de alta local
  nombre: string;
  telefono: string;
  telefono2?: string; // de TELEPHONE_PM
  atiende?: string;
  rfc?: string;
  correo?: string; // de E_MAIL
  origen: 'LOCAL' | 'MBA3' | 'MBA3+LOCAL';
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
  celular: '',
  telefono2: '',
  origen_id: null,
  comprador_id: null,
  chofer: '',
  placas: '',
  ton_aprox: 0,
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

const nuevoProd = reactive({ tipo: 'Fisica', nombre: '', atiende: '', telefono: '', rfc: '' });
const infoProductor = ref('');
const opcionesProductores = ref<Productor[]>([]);
const productorSeleccionado = ref<Productor | null>(null);
const buscandoProductores = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const mba3Disponible = ref(true); // se vuelve false la primera vez que MBA3 falla en esta sesión
const mba3InFlight = ref(false); // hay una petición MBA3 activa
let latestPendingVal: string | null = null; // última búsqueda encolada mientras había vuelo
// Caché de resultados MBA3 por prefijo — evita re-consultas dentro de 5 minutos
const mba3Cache = new Map<string, { productores: Productor[]; ts: number }>();
const MBA3_CACHE_TTL = 5 * 60 * 1000; // 5 minutos en ms

function mapMba3Items(
  mba3Items: Record<string, unknown>[],
  localList: Pick<Productor, 'id' | 'rfc'>[],
): Productor[] {
  return mba3Items.map((m) => {
    const rfc = ((m['RUC_or_FED_ID'] as string) ?? '').replace(/\s/g, '');
    const esMoral = rfc.length === 12;
    const atiende = esMoral ? (m['ACCOUNT_MNGR'] as string) || null : null;
    const telMain = ((m['TELEPHONE_MAIN'] as string) ?? '').replace(/\s/g, '');
    const telPm = ((m['TELEPHONE_PM'] as string) ?? '').replace(/\s/g, '');
    const correo = ((m['E_MAIL'] as string) ?? '').trim() || undefined;
    const localMatch = rfc ? localList.find((p) => p.rfc === rfc) : undefined;
    return {
      id: localMatch?.id ?? null,
      nombre: (m['VENDOR_NAME'] as string) ?? '',
      telefono: telMain,
      ...(telPm ? { telefono2: telPm } : {}),
      ...(rfc ? { rfc } : {}),
      ...(atiende ? { atiende } : {}),
      ...(correo ? { correo } : {}),
      origen: (localMatch ? 'MBA3+LOCAL' : 'MBA3') as Productor['origen'],
      mba3Raw: m,
    };
  });
}

/**
 * Ejecuta UNA petición MBA3 para buscar productores.
 * Si ya hay una en vuelo, encola esta como la siguiente a ejecutar.
 * Esto garantiza que nunca haya dos peticiones simultáneas → sin race condition de tokens.
 */
async function executeMba3Search(val: string) {
  // Si MBA3 ya falló antes en esta sesión, usar directamente la lista local
  if (!mba3Disponible.value) {
    const localList = props.listaProductores ?? [];
    const filtered = val
      ? localList.filter((p) => p.nombre.toUpperCase().includes(val.toUpperCase()))
      : localList;
    opcionesProductores.value = filtered;
    buscandoProductores.value = false;
    return;
  }

  // Verificar caché primero — si el prefijo ya fue consultado recientemente, usarlo al instante
  const cacheKey = val.toLowerCase();
  const cached = mba3Cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < MBA3_CACHE_TTL) {
    opcionesProductores.value = cached.productores;
    buscandoProductores.value = false;
    return;
  }

  // Para carga inicial (val vacío), intentar localStorage precargado desde BasculaPage
  if (val === '') {
    const raw = localStorage.getItem('mba3_productores_init');
    if (raw) {
      try {
        const { data, ts, sedeId } = JSON.parse(raw) as {
          data: unknown;
          ts: number;
          sedeId: number;
        };
        const esFresco = Date.now() - ts < MBA3_CACHE_TTL;
        const esMiSede = sedeId === (authStore.sedeActivaId ?? 0);
        if (esFresco && esMiSede && Array.isArray(data)) {
          const productores = mapMba3Items(
            data as Record<string, unknown>[],
            props.listaProductores ?? [],
          );
          opcionesProductores.value = productores;
          mba3Cache.set(cacheKey, { productores, ts });
          buscandoProductores.value = false;
          return;
        }
      } catch {
        /* JSON corrupto, continuar con petición normal */
      }
    }
  }

  // Si el usuario está filtrando y ya tenemos el catálogo completo en caché, filtrar client-side
  if (val.length >= 1) {
    const fullCache = mba3Cache.get('');
    if (fullCache && Date.now() - fullCache.ts < MBA3_CACHE_TTL) {
      const valUpper = val.toUpperCase();
      const filtrados = fullCache.productores.filter((p) =>
        p.nombre.toUpperCase().includes(valUpper),
      );
      const mba3Rfcs = new Set(filtrados.map((p) => p.rfc).filter(Boolean));
      const localList = props.listaProductores ?? [];
      localList
        .filter(
          (p) => p.nombre.toUpperCase().includes(valUpper) && (!p.rfc || !mba3Rfcs.has(p.rfc)),
        )
        .forEach((p) => filtrados.push({ ...p, origen: 'LOCAL' }));
      opcionesProductores.value = filtrados;
      mba3Cache.set(cacheKey, { productores: filtrados, ts: Date.now() });
      buscandoProductores.value = false;
      return;
    }
  }

  // Si ya hay petición en vuelo, encolar y salir (la petición activa la retomará al terminar)
  if (mba3InFlight.value) {
    latestPendingVal = val;
    return;
  }

  const MBA3_CODIGO = 'CON100';
  const MBA3_PWD = 'zaqxsw97531';

  mba3InFlight.value = true;
  buscandoProductores.value = true;

  try {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 3);
    const fecha3 = d.toISOString().split('T')[0]; // 3 años atrás

    // Sin BETWEEN ni limit — se trae todo el catálogo (~200 registros) y se filtra client-side
    const data = await mba3Request<unknown>({
      method: 'post',
      endpoint: '/ws_Consulta_externa_MBA3/',
      codigo: MBA3_CODIGO,
      pwd: MBA3_PWD,
      formData: {
        select:
          'VENDOR_NAME,RECORD_DATE,RUC_or_FED_ID,FIRST_NAME,ACCOUNT_MNGR,TELEPHONE_MAIN,TELEPHONE_PM,ACCT_CODE,ADDRESS_1,ADDRESS_2,CITY,STATE,ZIP,COUNTRY,NAME_RAZON_SOCIAL,FACSIMILE,E_MAIL',
        from: 'PROV_Ficha_Principal',
        where: `CORP='BGAR1' AND RECORD_DATE > '${fecha3}'`,
        limit: '9999',
      },
    });

    const localList = props.listaProductores ?? [];
    const mba3Items = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
    const todosProductores: Productor[] = mapMba3Items(mba3Items, localList);

    // Guardar catálogo completo bajo clave '' para filtrado client-side posterior
    mba3Cache.set('', { productores: todosProductores, ts: Date.now() });

    if (val.length >= 1) {
      // Petición disparada antes de que el caché estuviera listo — filtrar ahora
      const valUpper = val.toUpperCase();
      const filtrados = todosProductores.filter((p) => p.nombre.toUpperCase().includes(valUpper));
      const mba3Rfcs = new Set(filtrados.map((p) => p.rfc).filter(Boolean));
      localList
        .filter(
          (p) => p.nombre.toUpperCase().includes(valUpper) && (!p.rfc || !mba3Rfcs.has(p.rfc)),
        )
        .forEach((p) => filtrados.push({ ...p, origen: 'LOCAL' }));
      opcionesProductores.value = filtrados;
      mba3Cache.set(cacheKey, { productores: filtrados, ts: Date.now() });
    } else {
      opcionesProductores.value = todosProductores;
    }
  } catch {
    mba3Disponible.value = false; // marcar caído para evitar reintentos lentos
    const localList = props.listaProductores ?? [];
    const filtered = val
      ? localList.filter((p) => p.nombre.toUpperCase().includes(val.toUpperCase()))
      : localList;
    opcionesProductores.value = filtered;
  } finally {
    buscandoProductores.value = false;
    mba3InFlight.value = false;
    // Si llegó una nueva búsqueda mientras estábamos en vuelo, ejecutarla ahora
    if (latestPendingVal !== null) {
      const nextVal = latestPendingVal;
      latestPendingVal = null;
      void executeMba3Search(nextVal);
    }
  }
}

function filtrarProductores(val: string, update: (fn: () => void) => void) {
  if (debounceTimer) clearTimeout(debounceTimer);

  // Llamar update() inmediatamente para que Quasar no quede sin respuesta.
  // Las opciones se actualizan reactivamente cuando executeMba3Search() termina.
  update(() => {});

  buscandoProductores.value = true;

  // Debounce: 0ms al abrir dropdown (val=''), 400ms al escribir (busca al dejar de teclear)
  debounceTimer = setTimeout(
    () => {
      void executeMba3Search(val);
    },
    val ? 400 : 0,
  );
}

function onProductorSelected(prod: Productor | null) {
  if (!prod) {
    form.productor_id = null;
    form.celular = '';
    form.telefono2 = '';
    infoProductor.value = '';
    return;
  }
  form.productor_id = prod.id;
  form.celular = prod.telefono ?? '';
  form.telefono2 = prod.telefono2 ?? '';
  infoProductor.value = prod.atiende ? `Atiende: ${prod.atiende}` : '';

  // Sync silencioso: si el productor existe en ambos sistemas, actualizar BD local si cambió
  if (prod.origen === 'MBA3+LOCAL' && prod.id) {
    void actualizarProductorLocalSilencioso(prod);
  }
}

async function actualizarProductorLocalSilencioso(prod: Productor) {
  if (!prod.id) return;
  const localList = props.listaProductores ?? [];
  const local = localList.find((p) => p.id === prod.id);
  if (!local) return;

  const telefonoNuevo = prod.telefono || null;
  const atiendeNuevo = prod.atiende || null;
  const correoNuevo = prod.correo || null;
  // Solo llamar PUT si algún campo relevante cambió
  if (
    telefonoNuevo === (local.telefono || null) &&
    atiendeNuevo === (local.atiende || null) &&
    correoNuevo === (local.correo || null)
  )
    return;

  try {
    await api.put(`/api/catalogos/editar/productores/${prod.id}`, {
      Nombre: local.nombre,
      Telefono: telefonoNuevo ?? local.telefono,
      Telefono2: prod.telefono2 ?? null,
      Rfc: prod.rfc ?? local.rfc ?? null,
      Correo: correoNuevo ?? local.correo ?? null,
      Tipo_persona: null,
      Banco_id: null,
      Cuenta_clabe: null,
      Atiende: atiendeNuevo ?? local.atiende ?? null,
    });
    emit('refresh-productores');
  } catch {
    // Fallo silencioso — no interrumpir el flujo del usuario
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

// 3. Registro rápido de productor
async function guardarNuevoProductor() {
  try {
    // Preparamos el objeto según el tipo de persona
    const payload = {
      nombre: nuevoProd.nombre, // En el modal es Razón Social si es Moral
      telefono: nuevoProd.telefono,
      // rfc: nuevoProd.tipo === 'Moral' ? nuevoProd.rfc : null,
      tipo_persona: nuevoProd.tipo,
      atiende: nuevoProd.tipo === 'Moral' ? nuevoProd.atiende : null,
    };

    const res = await api.post('/api/catalogos/productores', payload);

    const recienCreado: Productor = {
      id: res.data.id,
      nombre: payload.nombre,
      telefono: payload.telefono,
      ...(payload.atiende ? { atiende: payload.atiende } : {}),
      origen: 'LOCAL',
    };
    opcionesProductores.value = [recienCreado, ...opcionesProductores.value];

    form.productor_id = res.data.id;
    form.celular = nuevoProd.telefono;
    infoProductor.value = nuevoProd.tipo === 'Moral' ? `Atiende: ${nuevoProd.atiende}` : '';

    modalProductor.value = false;
    nuevoProd.tipo = '';
    nuevoProd.nombre = '';
    nuevoProd.atiende = '';
    nuevoProd.telefono = '';
    // nuevoProd.rfc = '';
    $q.notify({ type: 'positive', message: 'Productor registrado con éxito' });
  } catch {
    $q.notify({ type: 'negative', message: 'Error al registrar productor' });
  }
}

async function onSubmit() {
  if (form.peso_bruto_kg <= 0) {
    return $q.notify({ type: 'warning', message: 'Debe capturar el peso bruto' });
  }

  // Validamos que tengamos el ID numérico antes de enviar
  if (!usuarioDbId.value) {
    return $q.notify({
      type: 'negative',
      message: 'Error de integridad: No se pudo verificar tu ID de usuario.',
    });
  }

  // Si el productor seleccionado viene de MBA3 y no tiene ID local (id: null),
  // buscar si ya existe en SQL Server (por RFC o nombre) antes de crear uno nuevo.
  if (productorSeleccionado.value && !productorSeleccionado.value.id) {
    const prod = productorSeleccionado.value;
    const localList = props.listaProductores ?? [];

    // 1. Buscar por RFC
    let match = prod.rfc ? localList.find((p) => p.rfc === prod.rfc) : undefined;
    // 2. Fallback: buscar por nombre exacto
    if (!match) match = localList.find((p) => p.nombre.toLowerCase() === prod.nombre.toLowerCase());

    if (match?.id) {
      // Ya existe en SQL Server — reutilizar ID sin crear duplicado
      form.productor_id = match.id;
      productorSeleccionado.value = { ...prod, id: match.id, origen: 'MBA3+LOCAL' };
    } else {
      // No existe — registrar nuevo en SQL Server con todos los datos disponibles de MBA3
      try {
        const esMoral = prod.rfc ? prod.rfc.length === 12 : !!prod.atiende;
        const raw = prod.mba3Raw ?? {};
        const strOf = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
        const res = await api.post('/api/catalogos/productores', {
          // Datos básicos
          nombre: prod.nombre,
          rfc: prod.rfc || null,
          tipo_persona: esMoral ? 'Moral' : 'Fisica',
          atiende: prod.atiende || null,
          // Teléfonos (sin espacios — MBA3 los incluye formateados)
          telefono: (prod.telefono || '').replace(/\s/g, '') || null,
          telefono2: (prod.telefono2 || '').replace(/\s/g, '') || null,
          fax: strOf(raw['FACSIMILE']),
          // Identificador ERP
          codigo_proveedor: strOf(raw['ACCT_CODE']),
          // Dirección
          direccion1: strOf(raw['ADDRESS_1']),
          direccion2: strOf(raw['ADDRESS_2']),
          ciudad: strOf(raw['CITY']),
          estado: strOf(raw['STATE']),
          codigo_postal: strOf(raw['ZIP']),
          pais: strOf(raw['COUNTRY']),
          // Nombre legal completo (razón social)
          nombre_alterno: strOf(raw['NAME_RAZON_SOCIAL']),
          correo: strOf(raw['E_MAIL']),
        });
        form.productor_id = res.data.id;
        productorSeleccionado.value = { ...prod, id: res.data.id, origen: 'MBA3+LOCAL' };
        emit('refresh-productores');
      } catch {
        return $q.notify({
          type: 'negative',
          message: 'No se pudo registrar el productor en el sistema local.',
        });
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
    grano_id: form.grano_id ? Number(form.grano_id) : null,
    origen_id: form.origen_id ? Number(form.origen_id) : null,
    comprador_id: form.comprador_id,
    status: form.status,
    datos_adicionales: JSON.stringify({
      tipo_productor: form.tipo_productor,
      observaciones: form.observaciones,
      celular: form.celular,
      telefono2: form.telefono2,
      atiende: infoProductor.value,
      ...valoresCamposPersonalizados,
    }),
    boleta_numero: null,
    // AQUÍ ESTÁ LA MAGIA: Mandamos el número (3), no el UUID
    usuario_registro_id: usuarioDbId.value,
  };

  emit('save', registroParaGuardar);
}
</script>
