<template>
  <q-page padding>
    <div class="q-mb-md">
      <div class="text-h5 q-mb-xs">Prueba Conexión MBA3</div>
    </div>

    <!-- Token status (compartido por ambas pestañas) -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-gutter-md">
          <div class="text-subtitle2">Token MBA3:</div>
          <q-chip :color="tokenColor" text-color="white" :icon="tokenIcon" :label="tokenLabel" />
          <div v-if="tokenInfo.status === 'activo'" class="text-caption text-grey">
            Renueva en {{ tokenInfo.segundosRestantes }}s
          </div>
          <q-btn
            color="orange"
            icon="refresh"
            label="Forzar nuevo token"
            outline
            size="sm"
            :loading="refreshing"
            @click="forzarNuevoToken"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabs -->
    <q-tabs v-model="activeTab" align="left" class="q-mb-md" dense>
      <q-tab name="consultar" icon="search" label="Consultar" />
      <q-tab name="guardar" icon="save" label="Guardar Proveedor" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <!-- ═══════════════════════════════════════════════════════════ CONSULTAR -->
      <q-tab-panel name="consultar" class="q-pa-none">
        <!-- Parámetros dinámicos -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2">Parámetros de consulta</div>
              <div class="row q-gutter-sm items-center">
                <div class="text-caption text-grey">Authorization:</div>
                <q-btn-toggle
                  v-model="authFormat"
                  dense
                  unelevated
                  :options="[
                    { label: 'JWT directo', value: 'direct' },
                    { label: 'Bearer JWT', value: 'bearer' },
                  ]"
                  size="sm"
                />
                <q-btn
                  flat
                  dense
                  size="sm"
                  icon="restart_alt"
                  label="Restablecer"
                  @click="restablecerDefaults"
                />
              </div>
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-2">
                <q-input v-model="querySelect" dense outlined label="SELECT" hint="Columnas o *" />
              </div>
              <div class="col-12 col-sm-3">
                <q-input v-model="queryFrom" dense outlined label="FROM (tabla)" />
              </div>
              <div class="col-12 col-sm-5">
                <q-input v-model="queryWhere" dense outlined label="WHERE (opcional)" autogrow />
              </div>
              <div class="col-12 col-sm-1">
                <q-input v-model="queryGroupBy" dense outlined label="GROUP BY" />
              </div>
              <div class="col-12 col-sm-1">
                <q-input v-model="queryLimit" dense outlined label="LIMIT" type="number" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Acciones consulta -->
        <div class="row q-gutter-sm q-mb-md">
          <q-btn
            color="primary"
            icon="search"
            label="Consultar Registros"
            :loading="loading"
            @click="consultarEndpointExterno"
          />
          <q-btn
            color="green-7"
            icon="file_download"
            label="Exportar Excel"
            :disable="!resultado || !Array.isArray(resultado) || resultado.length === 0"
            @click="exportarAExcel"
          />
          <q-btn
            color="grey"
            icon="delete"
            label="Limpiar"
            flat
            @click="
              resultado = null;
              error = null;
            "
          />
        </div>

        <q-banner v-if="error" class="bg-red-1 text-red-9 q-mb-md" rounded>
          <template #avatar><q-icon name="error" color="red" /></template>
          <div class="text-subtitle2">Error en la petición</div>
          <div class="text-caption">{{ error }}</div>
        </q-banner>

        <q-card v-if="resultado !== null" flat bordered>
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2">
                Resultado
                <q-badge
                  v-if="totalRegistros > 0"
                  color="green"
                  :label="`${totalRegistros} registros`"
                  class="q-ml-sm"
                />
              </div>
              <q-btn-toggle
                v-model="vistaResultado"
                dense
                unelevated
                :options="[
                  { label: 'Tabla', value: 'tabla' },
                  { label: 'JSON', value: 'json' },
                ]"
                size="sm"
              />
            </div>
            <div v-if="vistaResultado === 'tabla' && Array.isArray(resultado)">
              <q-table
                :rows="resultado"
                :columns="columnasAuto"
                row-key="index"
                dense
                flat
                :rows-per-page-options="[10, 25, 50]"
                rows-per-page-label="Filas"
              />
            </div>
            <div v-else>
              <pre class="json-output">{{ JSON.stringify(resultado, null, 2) }}</pre>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- ════════════════════════════════════════════════════ GUARDAR PROVEEDOR -->
      <q-tab-panel name="guardar" class="q-pa-none">
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2">
                Endpoint: POST {{ PROV_BASE_URL }}/mba3api/proveedores
              </div>
              <div class="row q-gutter-sm items-center">
                <div class="text-caption text-grey">Authorization:</div>
                <q-btn-toggle
                  v-model="authFormatGuardar"
                  dense
                  unelevated
                  :options="[
                    { label: 'JWT directo', value: 'direct' },
                    { label: 'Bearer JWT', value: 'bearer' },
                  ]"
                  size="sm"
                />
              </div>
            </div>

            <!-- Sección: Operación -->
            <div class="text-caption text-grey q-mb-xs q-mt-sm">Operación</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-sm-3">
                <q-select
                  v-model="proveedorForm.operacion"
                  dense
                  outlined
                  label="Operación"
                  :options="[
                    { label: '0 — Crear', value: '0' },
                    { label: '1 — Actualizar', value: '1' },
                    { label: '2 — Eliminar', value: '2' },
                  ]"
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.codigo_empresa"
                  dense
                  outlined
                  label="Código Empresa"
                />
              </div>
            </div>

            <!-- Sección: Identificación -->
            <div class="text-caption text-grey q-mb-xs">Identificación</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.codigo_proveedor"
                  dense
                  outlined
                  label="Código Proveedor"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="proveedorForm.nombre_proveedor"
                  dense
                  outlined
                  label="Nombre Proveedor"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.rfc_ruc_ci_proveedor"
                  dense
                  outlined
                  label="RFC / RUC / CI"
                />
              </div>
              <div class="col-12 col-sm-5">
                <q-input
                  v-model="proveedorForm.nombre_extenso_razon_social"
                  dense
                  outlined
                  label="Razón Social (extenso)"
                />
              </div>
            </div>

            <!-- Sección: Contacto -->
            <div class="text-caption text-grey q-mb-xs">Contacto</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.contacto"
                  dense
                  outlined
                  label="Contacto / Tel principal"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="proveedorForm.correo_electronico"
                  dense
                  outlined
                  label="Correo Electrónico"
                />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.telefono_1" dense outlined label="Teléfono 1" />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.telefono_2" dense outlined label="Teléfono 2" />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.fax" dense outlined label="Fax" />
              </div>
            </div>

            <!-- Sección: Dirección -->
            <div class="text-caption text-grey q-mb-xs">Dirección</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-sm-4">
                <q-input v-model="proveedorForm.direccion_1" dense outlined label="Dirección 1" />
              </div>
              <div class="col-12 col-sm-4">
                <q-input v-model="proveedorForm.direccion_2" dense outlined label="Dirección 2" />
              </div>
              <div class="col-12 col-sm-2">
                <q-input
                  v-model="proveedorForm.numero_exterior"
                  dense
                  outlined
                  label="No. Exterior"
                />
              </div>
              <div class="col-12 col-sm-2">
                <q-input
                  v-model="proveedorForm.numero_interior"
                  dense
                  outlined
                  label="No. Interior"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input v-model="proveedorForm.nombre_colonia" dense outlined label="Colonia" />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.nombre_localizacion"
                  dense
                  outlined
                  label="Localización (nombre)"
                />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.codigo_ciudad" dense outlined label="Ciudad" />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.codigo_estado" dense outlined label="Estado" />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.codigo_pais" dense outlined label="País" />
              </div>
              <div class="col-12 col-sm-2">
                <q-input
                  v-model="proveedorForm.codigo_postal_zip"
                  dense
                  outlined
                  label="C.P. / ZIP"
                />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.codigo_sector" dense outlined label="Sector" />
              </div>
            </div>

            <!-- Sección: Configuración -->
            <div class="text-caption text-grey q-mb-xs">Configuración</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-sm-2">
                <q-input
                  v-model="proveedorForm.localizacion"
                  dense
                  outlined
                  label="Localización (L)"
                />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.codigo_sucursal" dense outlined label="Sucursal" />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.proveedor_global"
                  dense
                  outlined
                  label="Proveedor Global"
                />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.moneda_unica" dense outlined label="Moneda Única" />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.codigo_moneda" dense outlined label="Cód. Moneda" />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.codigo_zona" dense outlined label="Zona" />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.codigo_tipo_proveedor"
                  dense
                  outlined
                  label="Tipo Proveedor"
                />
              </div>
            </div>

            <!-- Sección: Datos Fiscales -->
            <div class="text-caption text-grey q-mb-xs">Datos Fiscales</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.terminos_de_pago"
                  dense
                  outlined
                  label="Términos de Pago"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.grupo_impuestos"
                  dense
                  outlined
                  label="Grupo Impuestos"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.codigo_regimen_fiscal"
                  dense
                  outlined
                  label="Régimen Fiscal"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.codigo_retenciones"
                  dense
                  outlined
                  label="Retenciones"
                />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.impuestos" dense outlined label="Impuestos" />
              </div>
              <div class="col-12 col-sm-2">
                <q-input v-model="proveedorForm.relacionada" dense outlined label="Relacionada" />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.usar_nombre_alterno_en_impresion"
                  dense
                  outlined
                  label="Nombre Alterno Impresión"
                />
              </div>
            </div>

            <!-- Sección: Bancario -->
            <div class="text-caption text-grey q-mb-xs">Datos Bancarios</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-sm-4">
                <q-input v-model="proveedorForm.nombre_del_banco" dense outlined label="Banco" />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.cuenta_bancaria_1"
                  dense
                  outlined
                  label="Cuenta Bancaria 1"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.cuenta_bancaria_2"
                  dense
                  outlined
                  label="Cuenta Bancaria 2"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.cuenta_confiable_x_pagar"
                  dense
                  outlined
                  label="Cuenta Confiable x Pagar"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input v-model="proveedorForm.aba_swif" dense outlined label="ABA / SWIFT" />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.nombre_beneficiario"
                  dense
                  outlined
                  label="Beneficiario"
                />
              </div>
              <div class="col-12 col-sm-2">
                <q-input
                  v-model="proveedorForm.codigo_transferencias"
                  dense
                  outlined
                  label="Cód. Transferencias"
                />
              </div>
              <div class="col-12 col-sm-2">
                <q-input
                  v-model="proveedorForm.codigo_transaccion"
                  dense
                  outlined
                  label="Cód. Transacción"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.definible_transferencia_1"
                  dense
                  outlined
                  label="Def. Transferencia 1"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.definible_transferencia_2"
                  dense
                  outlined
                  label="Def. Transferencia 2"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.definible_transferencia_3"
                  dense
                  outlined
                  label="Def. Transferencia 3"
                />
              </div>
            </div>

            <!-- Sección: Crédito / Otros -->
            <div class="text-caption text-grey q-mb-xs">Crédito / Otros</div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.limite_credito_1"
                  dense
                  outlined
                  label="Límite Crédito 1"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.limite_credito_2"
                  dense
                  outlined
                  label="Límite Crédito 2"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.cuenta_contable_reserva"
                  dense
                  outlined
                  label="Cta. Contable Reserva"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-input
                  v-model="proveedorForm.fecha_de_creacion_del_registro"
                  dense
                  outlined
                  label="Fecha Creación"
                  type="date"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="proveedorForm.notas_memo"
                  dense
                  outlined
                  label="Notas / Memo"
                  type="textarea"
                  autogrow
                />
              </div>
            </div>

            <!-- Botones -->
            <div class="row q-gutter-sm q-mt-sm">
              <q-btn
                color="primary"
                icon="save"
                label="Guardar Proveedor"
                :loading="loadingGuardar"
                @click="guardarProveedor"
              />
              <q-btn
                flat
                color="grey"
                icon="delete"
                label="Limpiar"
                @click="
                  errorGuardar = null;
                  resultadoGuardar = null;
                "
              />
            </div>
          </q-card-section>
        </q-card>

        <q-banner v-if="errorGuardar" class="bg-red-1 text-red-9 q-mb-md" rounded>
          <template #avatar><q-icon name="error" color="red" /></template>
          <div class="text-subtitle2">Error al guardar</div>
          <div class="text-caption">{{ errorGuardar }}</div>
        </q-banner>

        <q-card v-if="resultadoGuardar !== null" flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Respuesta del servidor</div>
            <pre class="json-output">{{ JSON.stringify(resultadoGuardar, null, 2) }}</pre>
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Log compartido -->
    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="text-subtitle2">Log de peticiones</div>
          <q-btn flat dense icon="delete" size="sm" @click="logs = []" />
        </div>
        <div v-if="logs.length === 0" class="text-caption text-grey q-mt-sm">Sin registros aún</div>
        <q-list dense separator v-else>
          <q-item v-for="(log, i) in logs" :key="i">
            <q-item-section avatar>
              <q-icon
                :name="log.ok ? 'check_circle' : 'cancel'"
                :color="log.ok ? 'green' : 'red'"
                size="xs"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-caption">{{ log.hora }} — {{ log.mensaje }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { mba3Request } from 'src/services/mba3Api';
import { useMba3Store } from 'src/stores/mba3Store';
import * as XLSX from 'xlsx';

// ── Credenciales ──────────────────────────────────────────────────────────────
const CODIGO = 'CON100'; // consulta
const CODIGO_GUARDAR = 'API101'; // guardado/escritura
const PWD = 'zaqxsw97531';

// Mismo servidor que la pestaña Consultar: 201.148.25.52:8443
const PROV_BASE_URL = process.env.DEV ? '/mba3' : 'http://201.148.25.52:8443';

// ── Tab activo ────────────────────────────────────────────────────────────────
const activeTab = ref<'consultar' | 'guardar'>('consultar');

// ── Parámetros de consulta dinámicos ─────────────────────────────────────────
const DEFAULT_SELECT = '*';
const DEFAULT_FROM = 'PROV_Ficha_Principal';
const DEFAULT_WHERE = "CORP='BGAR1' and RECORD_DATE > '2025-01-01'";

const querySelect = ref(DEFAULT_SELECT);
const queryFrom = ref(DEFAULT_FROM);
const queryWhere = ref(DEFAULT_WHERE);
const queryGroupBy = ref('');
const queryLimit = ref('');

function restablecerDefaults() {
  querySelect.value = DEFAULT_SELECT;
  queryFrom.value = DEFAULT_FROM;
  queryWhere.value = DEFAULT_WHERE;
  queryGroupBy.value = '';
  queryLimit.value = '';
}

// ── Formulario proveedor ──────────────────────────────────────────────────────
const proveedorForm = ref({
  operacion: '0',
  codigo_empresa: 'BGAR1',
  codigo_proveedor: '',
  nombre_proveedor: '',
  rfc_ruc_ci_proveedor: '',
  contacto: '',
  direccion_1: '',
  direccion_2: '',
  codigo_pais: '',
  codigo_estado: '',
  codigo_ciudad: '',
  codigo_sector: '',
  codigo_postal_zip: '',
  telefono_1: '',
  telefono_2: '',
  correo_electronico: '',
  fax: '',
  terminos_de_pago: '',
  limite_credito_1: '',
  limite_credito_2: '',
  codigo_tipo_proveedor: '',
  codigo_moneda: '',
  codigo_zona: '',
  notas_memo: '',
  localizacion: 'L',
  nombre_extenso_razon_social: '',
  codigo_sucursal: '',
  cuenta_confiable_x_pagar: '',
  nombre_del_banco: '',
  cuenta_bancaria_1: '',
  cuenta_bancaria_2: '',
  aba_swif: '',
  nombre_beneficiario: '',
  codigo_transferencias: '',
  codigo_transaccion: '',
  definible_transferencia_1: '',
  definible_transferencia_2: '',
  definible_transferencia_3: '',
  codigo_retenciones: '',
  impuestos: '',
  relacionada: '',
  usar_nombre_alterno_en_impresion: '',
  numero_exterior: '',
  numero_interior: '',
  nombre_colonia: '',
  nombre_localizacion: '',
  moneda_unica: 'True',
  proveedor_global: 'CONSUL-TEK',
  grupo_impuestos: '',
  codigo_regimen_fiscal: '',
  fecha_de_creacion_del_registro: new Date().toISOString().slice(0, 10),
  cuenta_contable_reserva: '',
});

// ── Estado ────────────────────────────────────────────────────────────────────
const loading = ref(false);
const refreshing = ref(false);
const loadingGuardar = ref(false);
const error = ref<string | null>(null);
const errorGuardar = ref<string | null>(null);
const resultado = ref<unknown>(null);
const resultadoGuardar = ref<unknown>(null);
const vistaResultado = ref<'tabla' | 'json'>('json');
const authFormat = ref<'direct' | 'bearer'>('direct');
const authFormatGuardar = ref<'direct' | 'bearer'>('bearer');

interface LogEntry {
  hora: string;
  mensaje: string;
  ok: boolean;
}
const logs = ref<LogEntry[]>([]);

const mba3Store = useMba3Store();

// ── Token status ──────────────────────────────────────────────────────────────
const tokenInfo = computed(() => mba3Store.tokenInfo(CODIGO));

const tokenColor = computed(() => {
  const s = tokenInfo.value.status;
  if (s === 'activo') return 'green';
  if (s === 'expirado') return 'red';
  return 'grey';
});

const tokenIcon = computed(() => {
  const s = tokenInfo.value.status;
  if (s === 'activo') return 'check_circle';
  if (s === 'expirado') return 'warning';
  return 'radio_button_unchecked';
});

const tokenLabel = computed(() => {
  const s = tokenInfo.value.status;
  if (s === 'activo') return `Activo (${tokenInfo.value.segundosRestantes}s)`;
  if (s === 'expirado') return 'Expirado';
  return 'Sin token';
});

// ── Resultado en tabla ────────────────────────────────────────────────────────
const totalRegistros = computed(() => {
  if (Array.isArray(resultado.value)) return resultado.value.length;
  return 0;
});

const columnasAuto = computed(() => {
  if (!Array.isArray(resultado.value) || resultado.value.length === 0) return [];
  const firstRow = resultado.value[0] as Record<string, unknown>;
  return Object.keys(firstRow).map((key) => ({
    name: key,
    label: key,
    field: key,
    align: 'left' as const,
    sortable: true,
  }));
});

// ── Ticker para contador de token ─────────────────────────────────────────────
let tickInterval: ReturnType<typeof setInterval> | null = null;
const _tick = ref(0);

onMounted(() => {
  tickInterval = setInterval(() => {
    _tick.value++;
  }, 1000);
});
onUnmounted(() => {
  if (tickInterval) clearInterval(tickInterval);
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function addLog(mensaje: string, ok: boolean) {
  const hora = new Date().toLocaleTimeString('es-MX');
  logs.value.unshift({ hora, mensaje, ok });
  if (logs.value.length > 20) logs.value.pop();
}

// ── Acciones — Consultar ──────────────────────────────────────────────────────
async function consultarEndpointExterno() {
  loading.value = true;
  error.value = null;

  try {
    const data = await mba3Request({
      method: 'post',
      endpoint: '/ws_Consulta_externa_MBA3/',
      codigo: CODIGO,
      pwd: PWD,
      useBearerPrefix: authFormat.value === 'bearer',
      formData: {
        select: querySelect.value,
        from: queryFrom.value,
        ...(queryWhere.value ? { where: queryWhere.value } : {}),
        ...(queryGroupBy.value ? { groupBy: queryGroupBy.value } : {}),
        ...(queryLimit.value ? { limit: queryLimit.value } : {}),
      },
    });

    console.log(data);

    resultado.value = data;
    addLog(`Consulta OK: ${Array.isArray(data) ? data.length : '?'} registros`, true);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    error.value = msg;
    addLog(`Error consulta: ${msg}`, false);
  } finally {
    loading.value = false;
  }
}

// ── Acciones — Guardar proveedor ──────────────────────────────────────────────
async function guardarProveedor() {
  loadingGuardar.value = true;
  errorGuardar.value = null;
  resultadoGuardar.value = null;

  addLog(`[Guardar] Iniciando — formato auth: ${authFormatGuardar.value}`, true);

  try {
    const data = await mba3Request<{ error?: string; respuesta?: string }>({
      method: 'post',
      endpoint: '/mba3api/proveedores',
      codigo: CODIGO_GUARDAR,
      pwd: PWD,
      useBearerPrefix: authFormatGuardar.value === 'bearer',
      formData: Object.fromEntries(
        Object.entries(proveedorForm.value).map(([k, v]) => {
          if (k === 'moneda_unica') return [k, v === '1' || v === 'True' ? 'True' : 'False'];
          return [k, String(v ?? '')];
        }),
      ) as Record<string, string>,
    });

    // El servidor retorna 200 incluso en errores de negocio — detectarlos aquí
    if (data?.error && data.error !== '000') {
      throw new Error(`[${data.error}] ${data.respuesta ?? 'Error desconocido'}`);
    }

    resultadoGuardar.value = data;
    addLog(`Proveedor guardado: ${proveedorForm.value.codigo_proveedor}`, true);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    errorGuardar.value = msg;
    addLog(`Error guardar proveedor: ${msg}`, false);
  } finally {
    loadingGuardar.value = false;
  }
}

// ── Acciones — Excel ──────────────────────────────────────────────────────────
function exportarAExcel() {
  if (!Array.isArray(resultado.value) || resultado.value.length === 0) {
    addLog('No hay datos para exportar', false);
    return;
  }
  try {
    const worksheet = XLSX.utils.json_to_sheet(resultado.value);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados_Consulta');
    const nombreArchivo = `Consulta_MBA3_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);
    addLog(`Excel exportado: ${nombreArchivo}`, true);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    addLog(`Error al exportar: ${msg}`, false);
  }
}

async function forzarNuevoToken() {
  refreshing.value = true;
  try {
    await mba3Store.forceRefresh(CODIGO, PWD);
    addLog('Token renovado manualmente', true);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    addLog(`Error al renovar token: ${msg}`, false);
  } finally {
    refreshing.value = false;
  }
}
</script>

<style scoped>
.json-output {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
