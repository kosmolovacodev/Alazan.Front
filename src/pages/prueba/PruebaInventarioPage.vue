<template>
  <q-page padding>
    <!-- Encabezado -->
    <div class="row items-center q-mb-md q-gutter-sm">
      <div>
        <div class="text-h5">Prueba: Recepción de Inventario MBA3</div>
        <div class="text-caption text-grey">
          POST {{ MBA3_BASE_URL }}/mba3api/recepcion_inventario
        </div>
      </div>
      <q-space />
      <q-chip :color="tokenColor" text-color="white" :icon="tokenIcon" :label="tokenLabel" />
      <span v-if="tokenInfo.status === 'activo'" class="text-caption text-grey">
        Renueva en {{ tokenInfo.segundosRestantes }}s
      </span>
      <q-btn
        outline size="sm" color="orange" icon="refresh" label="Nuevo token"
        :loading="refreshing" @click="forzarNuevoToken"
      />
    </div>

    <div class="row q-col-gutter-md">
      <!-- ═══════════ FORMULARIO ═══════════ -->
      <div class="col-12 col-md-7">

        <!-- Datos principales -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Datos principales</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6 col-sm-3">
                <q-input :model-value="form.codigo_empresa" dense outlined readonly
                  label="Empresa" bg-color="grey-2" />
              </div>
              <div class="col-6 col-sm-2">
                <q-select
                  v-model="form.operacion"
                  :options="opcionesOperacion"
                  option-value="value" option-label="label"
                  emit-value map-options
                  dense outlined
                  label="Operación *"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input v-model="form.codigo_sucursal" dense outlined
                  label="Cód. Sucursal" hint="Se llena al elegir sede" />
              </div>
              <div class="col-12 col-sm-4">
                <q-input v-model="form.numero_documento" dense outlined
                  label="Núm. Documento (opcional)" />
              </div>

              <!-- Sede → sucursal_origen -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="sedeSeleccionada"
                  :options="listaSedes"
                  option-value="id" option-label="nombre"
                  emit-value map-options dense outlined clearable
                  label="Sede (sucursal_origen) *"
                  @update:model-value="onSedeChange"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                        <q-item-label caption>Cód: {{ scope.opt.codigo || '(sin código)' }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.sucursal_origen" dense outlined
                  label="sucursal_origen *" hint="Auto-llena con cód. sede" />
              </div>

              <!-- Silo → codigo_bodega -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="siloSeleccionado"
                  :options="listaSilos"
                  option-value="uid" option-label="nombre"
                  emit-value map-options dense outlined clearable
                  label="Silo / Bodega (codigo_bodega) *"
                  @update:model-value="onSiloChange"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                        <q-item-label caption>
                          Cód: {{ scope.opt.codigo || '(sin código)' }} — {{ scope.opt.tipo_silo }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model="form.codigo_bodega" dense outlined
                  label="codigo_bodega *" hint="Auto-llena con cód. silo" />
              </div>

              <!-- codigo_proveedor -->
              <div class="col-12 col-sm-6">
                <q-input v-model="form.codigo_proveedor" dense outlined
                  label="Cód. Proveedor *" />
              </div>

              <!-- fechas -->
              <div class="col-6 col-sm-3">
                <q-input v-model="form.fecha_recepcion" dense outlined
                  label="Fecha recepción *" hint="DD-MM-YYYY" />
              </div>
              <div class="col-6 col-sm-3">
                <q-input v-model="form.hora_recepcion" dense outlined
                  label="Hora recepción" hint="HH:MM:SS" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Campos adicionales -->
        <q-expansion-item icon="expand_more" label="Campos adicionales (opcional)"
          class="q-mb-md bg-grey-1 rounded-borders" dense>
          <q-card flat>
            <q-card-section>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.memo" dense outlined label="Memo" autogrow />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.nombre_embarcacion" dense outlined label="Nombre Embarcación" />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input v-model="form.procedencia" dense outlined label="Procedencia" />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input v-model="form.codigo_calificador" dense outlined label="Cód. Calificador" />
                </div>
                <div class="col-12 col-sm-4">
                  <q-input v-model="form.recepcion_externa" dense outlined label="Recepción Externa" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.chofer" dense outlined label="Chofer" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="form.codigo_supervisor" dense outlined label="Cód. Supervisor" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <!-- Detalle de productos -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle2">Detalle de productos *</div>
              <q-space />
              <q-btn size="sm" color="green-7" icon="add" label="Agregar ítem"
                @click="agregarDetalle" />
            </div>

            <div v-for="(item, idx) in form.detalle" :key="idx"
              class="row q-col-gutter-sm q-mb-sm items-center">
              <div class="col-12 col-sm-3">
                <q-input v-model="item.codigo_producto" dense outlined
                  :label="`Cód. Producto ${idx + 1} *`" />
              </div>
              <div class="col-6 col-sm-2">
                <q-input v-model.number="item.cantidad" dense outlined
                  label="Cantidad *" type="number" />
              </div>
              <div class="col-6 col-sm-2">
                <q-input v-model="item.serial" dense outlined label="Serial" />
              </div>
              <div class="col-6 col-sm-2">
                <q-input v-model="item.datos_lote" dense outlined label="Lote" />
              </div>
              <div class="col-6 col-sm-2">
                <q-input v-model="item.datos_peso_embarque_memo" dense outlined label="Peso/Memo" />
              </div>
              <div class="col-6 col-sm-2">
                <q-input v-model="item.datos_estado_calificacion" dense outlined label="Estado/Calificación" />
              </div>
              <div class="col-auto">
                <q-btn flat round dense color="negative" icon="delete"
                  :disable="form.detalle.length <= 1"
                  @click="quitarDetalle(idx)" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Opciones de envío -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-col-gutter-md">
              <div class="col-auto">
                <div class="text-caption text-grey q-mb-xs">Authorization MBA3:</div>
                <q-btn-toggle v-model="useBearerPrefix" dense unelevated
                  :options="[{ label: 'JWT directo', value: false }, { label: 'Bearer JWT', value: true }]"
                  size="sm" />
              </div>
              <div class="col-auto">
                <q-checkbox v-model="guardarInterno" label="Guardar también en BD Alazan" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-gutter-sm">
          <q-btn color="primary" icon="send" label="Enviar a MBA3"
            :loading="enviando" size="md" @click="enviar" />
          <q-btn flat color="grey-7" icon="restart_alt" label="Limpiar"
            @click="limpiarForm" />
        </div>
      </div>

      <!-- ═══════════ RESULTADOS ═══════════ -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle2 q-mb-xs">JSON que se enviará</div>
            <pre class="json-preview">{{ JSON.stringify(payloadPreview, null, 2) }}</pre>
          </q-card-section>
        </q-card>

        <q-card v-if="respMba3 !== null || errorMba3" flat bordered class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-xs">
              <div class="text-subtitle2">Respuesta MBA3</div>
              <q-space />
              <q-badge :color="errorMba3 ? 'negative' : 'positive'">
                {{ errorMba3 ? 'ERROR' : 'OK' }}
              </q-badge>
            </div>
            <pre v-if="errorMba3" class="json-preview text-negative">{{ errorMba3 }}</pre>
            <pre v-else class="json-preview">{{ JSON.stringify(respMba3, null, 2) }}</pre>
          </q-card-section>
        </q-card>

        <q-card v-if="respInterno !== null || errorInterno" flat bordered>
          <q-card-section>
            <div class="row items-center q-mb-xs">
              <div class="text-subtitle2">Respuesta BD Alazan</div>
              <q-space />
              <q-badge :color="errorInterno ? 'negative' : 'positive'">
                {{ errorInterno ? 'ERROR' : 'OK' }}
              </q-badge>
            </div>
            <pre v-if="errorInterno" class="json-preview text-negative">{{ errorInterno }}</pre>
            <pre v-else class="json-preview">{{ JSON.stringify(respInterno, null, 2) }}</pre>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Notify } from 'quasar';
import { api } from 'src/boot/axios';
import { mba3Request } from 'src/services/mba3Api';
import { useMba3Store } from 'src/stores/mba3Store';

// ── Credenciales MBA3 ────────────────────────────────────────────────────────
const MBA3_CODIGO    = 'API101';        // credencial de escritura
const MBA3_PWD       = 'zaqxsw97531';
const MBA3_BASE_URL  = process.env.DEV ? '/mba3' : 'http://201.148.25.52:8443';

const opcionesOperacion = [
  { value: 0, label: '0 — Recepción Factura Proveedores' },
  { value: 1, label: '1 — Recepción Órdenes de Compra' },
  { value: 2, label: '2 — Recepción sin Documento Específico' },
];

// ── Estado del token ─────────────────────────────────────────────────────────
const mba3Store  = useMba3Store();
const tokenInfo  = computed(() => mba3Store.tokenInfo(MBA3_CODIGO));
const tokenColor = computed(() => {
  if (tokenInfo.value.status === 'activo')   return 'green';
  if (tokenInfo.value.status === 'expirado') return 'orange';
  return 'grey';
});
const tokenIcon  = computed(() =>
  tokenInfo.value.status === 'activo' ? 'check_circle' : 'warning',
);
const tokenLabel = computed(() => {
  if (tokenInfo.value.status === 'activo')   return 'Token activo';
  if (tokenInfo.value.status === 'expirado') return 'Token expirado';
  return 'Sin token';
});
const refreshing = ref(false);
async function forzarNuevoToken() {
  refreshing.value = true;
  try {
    await mba3Store.forceRefresh(MBA3_CODIGO, MBA3_PWD);
    Notify.create({ type: 'positive', message: 'Token renovado' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al renovar token' });
  } finally {
    refreshing.value = false;
  }
}

// ── Catálogos ────────────────────────────────────────────────────────────────
interface Sede {
  id: number;
  nombre: string;
  codigo: string | null;
}
interface SiloItem {
  uid: string;          // 'calibre-{id}' | 'pulmon-{id}' | 'almacen-{id}'
  id: number;
  nombre: string;
  codigo: string | null;
  tipo_silo: string;
}

const listaSedes        = ref<Sede[]>([]);
const listaSilos        = ref<SiloItem[]>([]);
const sedeSeleccionada  = ref<number | null>(null);
const siloSeleccionado  = ref<string | null>(null);

async function cargarCatalogos() {
  try {
    const [{ data: sedes }, { data: silosCal }, { data: silosPul }, { data: almacenes }] = await Promise.all([
      api.get('/api/catalogos/sedes'),
      api.get('/api/catalogos/silos-calibre', { params: { sedeId: 0 } }),
      api.get('/api/catalogos/silos-pulmon',  { params: { sedeId: 0 } }),
      api.get('/api/catalogos/bodegas',       { params: { sede_id: 0 } }),
    ]);

    listaSedes.value = sedes as Sede[];

    type RawItem = { id: number; nombre: string; codigo: string | null; activo: boolean };

    const calibre = (silosCal as RawItem[])
      .filter((s) => s.activo)
      .map((s) => ({ uid: `calibre-${s.id}`, id: s.id, nombre: s.nombre, codigo: s.codigo, tipo_silo: 'Silo Calibre' }));

    const pulmon = (silosPul as RawItem[])
      .filter((s) => s.activo)
      .map((s) => ({ uid: `pulmon-${s.id}`, id: s.id, nombre: s.nombre, codigo: s.codigo, tipo_silo: 'Silo Pulmón/Tolva' }));

    const bodega = (almacenes as RawItem[])
      .filter((s) => s.activo)
      .map((s) => ({ uid: `almacen-${s.id}`, id: s.id, nombre: s.nombre, codigo: s.codigo, tipo_silo: 'Almacén/Bodega' }));

    listaSilos.value = [...calibre, ...pulmon, ...bodega];
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar catálogos de sedes/silos' });
  }
}

function onSedeChange(idSede: number | null) {
  if (!idSede) {
    form.value.sucursal_origen = '';
    form.value.codigo_sucursal = '';
    return;
  }
  const sede = listaSedes.value.find((s) => s.id === idSede);
  if (sede) {
    form.value.sucursal_origen = sede.codigo ?? '';
    form.value.codigo_sucursal = sede.codigo ?? '';
  }
}

function onSiloChange(uid: string | null) {
  if (!uid) { form.value.codigo_bodega = ''; return; }
  const silo = listaSilos.value.find((s) => s.uid === uid);
  if (silo) form.value.codigo_bodega = silo.codigo ?? '';
}

// ── Helpers de fecha/hora ────────────────────────────────────────────────────
function hoyStr() {
  const d  = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()}`;
}
function ahoraStr() {
  return new Date().toTimeString().slice(0, 8);
}

// ── Formulario ───────────────────────────────────────────────────────────────
interface DetalleItem {
  codigo_producto:            string;
  cantidad:                   number;
  serial:                     string;
  datos_lote:                 string;
  datos_pedimento:            string;
  datos_estado_calificacion:  string;
  datos_peso_embarque_memo:   string;
}

function nuevoDetalle(): DetalleItem {
  return {
    codigo_producto:           '',
    cantidad:                  1,
    serial:                    '',
    datos_lote:                '',
    datos_pedimento:           '',
    datos_estado_calificacion: '',
    datos_peso_embarque_memo:  '',
  };
}

const form = ref({
  operacion:           0,
  codigo_empresa:      'BGAR1',
  codigo_sucursal:     '',
  numero_documento:    '',
  codigo_proveedor:    '',
  fecha_recepcion:     hoyStr(),
  sucursal_origen:     '',
  codigo_bodega:       '',
  memo:                '',
  hora_recepcion:      ahoraStr(),
  nombre_embarcacion:  '',
  procedencia:         '',
  codigo_calificador:  '',
  recepcion_externa:   '',
  chofer:              '',
  codigo_supervisor:   '',
  detalle:             [nuevoDetalle()] as DetalleItem[],
});

function agregarDetalle() { form.value.detalle.push(nuevoDetalle()); }
function quitarDetalle(idx: number) { form.value.detalle.splice(idx, 1); }

function limpiarForm() {
  sedeSeleccionada.value  = null;
  siloSeleccionado.value  = null;
  respMba3.value          = null;
  respInterno.value       = null;
  errorMba3.value         = '';
  errorInterno.value      = '';
  form.value = {
    operacion:           0,
    codigo_empresa:      'BGAR1',
    codigo_sucursal:     '',
    numero_documento:    '',
    codigo_proveedor:    '',
    fecha_recepcion:     hoyStr(),
    sucursal_origen:     '',
    codigo_bodega:       '',
    memo:                '',
    hora_recepcion:      ahoraStr(),
    nombre_embarcacion:  '',
    procedencia:         '',
    codigo_calificador:  '',
    recepcion_externa:   '',
    chofer:              '',
    codigo_supervisor:   '',
    detalle:             [nuevoDetalle()],
  };
}

// ── Preview ──────────────────────────────────────────────────────────────────
// Preview muestra el payload tal como se enviará a MBA3 (operacion y cantidad como strings)
const payloadPreview = computed(() => ({
  operacion:                      String(form.value.operacion),
  codigo_empresa:                 form.value.codigo_empresa,
  codigo_sucursal:                form.value.codigo_sucursal,
  numero_documento:               form.value.numero_documento || undefined,
  codigo_proveedor:               form.value.codigo_proveedor,
  fecha_recepcion:                form.value.fecha_recepcion,
  sucursal_origen:                form.value.sucursal_origen,
  codigo_bodega:                  form.value.codigo_bodega,
  memo:                           form.value.memo || undefined,
  hora_recepcion:                 form.value.hora_recepcion,
  nombre_embarcacion:             form.value.nombre_embarcacion || undefined,
  procedencia:                    form.value.procedencia || undefined,
  codigo_calificador:             form.value.codigo_calificador || undefined,
  recepcion_externa:              form.value.recepcion_externa || undefined,
  chofer:                         form.value.chofer || undefined,
  codigo_supervisor:              form.value.codigo_supervisor || undefined,
  cinco_campos_adicionales_alpha: '',
  cinco_campos_adicionales_date:  '',
  cinco_campos_adicionales_real:  '',
  detalle:                        form.value.detalle.map((d) => ({ ...d, cantidad: String(d.cantidad) })),
}));

// ── Envío ────────────────────────────────────────────────────────────────────
const useBearerPrefix  = ref(false);
const guardarInterno   = ref(true);
const enviando         = ref(false);
const respMba3         = ref<unknown>(null);
const respInterno      = ref<unknown>(null);
const errorMba3        = ref('');
const errorInterno     = ref('');

async function enviar() {
  if (!form.value.codigo_proveedor) {
    Notify.create({ type: 'warning', message: 'El código de proveedor es requerido' });
    return;
  }
  if (!form.value.sucursal_origen) {
    Notify.create({ type: 'warning', message: 'Selecciona una sede (sucursal_origen)' });
    return;
  }
  if (!form.value.codigo_bodega) {
    Notify.create({ type: 'warning', message: 'Selecciona un silo (codigo_bodega)' });
    return;
  }
  if (form.value.detalle.some((d) => !d.codigo_producto || d.cantidad <= 0)) {
    Notify.create({ type: 'warning', message: 'Todos los ítems deben tener código de producto y cantidad > 0' });
    return;
  }

  enviando.value     = true;
  respMba3.value     = null;
  respInterno.value  = null;
  errorMba3.value    = '';
  errorInterno.value = '';

  // Payload para MBA3 externo: se envía como multipart/form-data
  // operacion y cantidad como strings, detalle como JSON-string (campo único)
  const fd = new FormData();
  fd.append('operacion',                      String(form.value.operacion));
  fd.append('codigo_empresa',                 form.value.codigo_empresa);
  fd.append('codigo_sucursal',                form.value.codigo_sucursal);
  fd.append('numero_documento',               form.value.numero_documento || '');
  fd.append('codigo_proveedor',               form.value.codigo_proveedor);
  fd.append('fecha_recepcion',                form.value.fecha_recepcion);
  fd.append('sucursal_origen',                form.value.sucursal_origen);
  fd.append('codigo_bodega',                  form.value.codigo_bodega);
  fd.append('memo',                           form.value.memo || '');
  fd.append('hora_recepcion',                 form.value.hora_recepcion);
  fd.append('nombre_embarcacion',             form.value.nombre_embarcacion || '');
  fd.append('procedencia',                    form.value.procedencia || '');
  fd.append('codigo_calificador',             form.value.codigo_calificador || '');
  fd.append('recepcion_externa',              form.value.recepcion_externa || '');
  fd.append('chofer',                         form.value.chofer || '');
  fd.append('codigo_supervisor',              form.value.codigo_supervisor || '');
  fd.append('cinco_campos_adicionales_alpha', '');
  fd.append('cinco_campos_adicionales_date',  '');
  fd.append('cinco_campos_adicionales_real',  '');
  // detalle como JSON string dentro del form-data
  fd.append('detalle', JSON.stringify(
    form.value.detalle.map((d) => ({ ...d, cantidad: String(d.cantidad) }))
  ));

  // Payload para BD interna: operacion es int y cantidad es number (según DTO .NET)
  const payload = {
    operacion:                      form.value.operacion,
    codigo_empresa:                 form.value.codigo_empresa,
    codigo_sucursal:                form.value.codigo_sucursal,
    numero_documento:               form.value.numero_documento || '',
    codigo_proveedor:               form.value.codigo_proveedor,
    fecha_recepcion:                form.value.fecha_recepcion,
    sucursal_origen:                form.value.sucursal_origen,
    codigo_bodega:                  form.value.codigo_bodega,
    memo:                           form.value.memo || '',
    hora_recepcion:                 form.value.hora_recepcion,
    nombre_embarcacion:             form.value.nombre_embarcacion || '',
    procedencia:                    form.value.procedencia || '',
    codigo_calificador:             form.value.codigo_calificador || '',
    recepcion_externa:              form.value.recepcion_externa || '',
    chofer:                         form.value.chofer || '',
    codigo_supervisor:              form.value.codigo_supervisor || '',
    cinco_campos_adicionales_alpha: '',
    cinco_campos_adicionales_date:  '',
    cinco_campos_adicionales_real:  '',
    detalle:                        form.value.detalle,
  };

  // 1. Llamada MBA3 externo (multipart/form-data)
  try {
    const resp = await mba3Request({
      method:          'post',
      endpoint:        '/mba3api/recepcion_inventario',
      codigo:          MBA3_CODIGO,
      pwd:             MBA3_PWD,
      multipartData:   fd,
      useBearerPrefix: useBearerPrefix.value,
    });
    respMba3.value = resp;
    Notify.create({ type: 'positive', message: 'MBA3: Recepción enviada correctamente' });
  } catch (err: unknown) {
    const msg = formatError(err);
    errorMba3.value = msg;
    Notify.create({ type: 'negative', message: `MBA3: ${msg}` });
  }

  // 2. Guardar en BD interna (independiente del resultado de MBA3)
  if (guardarInterno.value) {
    try {
      const { data } = await api.post('/api/v1/reE', payload);
      respInterno.value = data;
      Notify.create({ type: 'positive', message: 'BD Alazan: Recepción guardada' });
    } catch (err: unknown) {
      const msg = formatError(err);
      errorInterno.value = msg;
      Notify.create({ type: 'negative', message: `BD Alazan: ${msg}` });
    }
  }

  enviando.value = false;
}

function formatError(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (e['response'] && typeof e['response'] === 'object') {
      const r = e['response'] as Record<string, unknown>;
      return JSON.stringify(r['data'] ?? r);
    }
    if (typeof e['message'] === 'string') return e['message'];
  }
  return String(err);
}

onMounted(() => { void cargarCatalogos(); });
</script>

<style scoped>
.json-preview {
  font-size: 11px;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 8px;
  overflow: auto;
  max-height: 400px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
