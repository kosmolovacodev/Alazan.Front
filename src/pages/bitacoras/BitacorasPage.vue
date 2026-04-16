<template>
  <q-page padding class="bg-grey-2">

    <!-- ══════════════════════════════════════════════════
         NIVEL 1 — Grid de secciones
    ═══════════════════════════════════════════════════ -->
    <template v-if="nivel === 1">
      <div class="q-mb-lg">
        <div class="text-h5 text-weight-bold text-grey-9">Bitácoras de Control</div>
        <div class="text-caption text-grey-6 q-mt-xs">Selecciona una sección para ver sus bitácoras</div>
      </div>

      <div class="row q-col-gutter-md">
        <div v-for="sec in secciones" :key="sec.codigo" class="col-12 col-sm-6 col-md-4">
          <div class="bit-sec-card" @click="entrarSeccion(sec)">
            <div class="row items-center no-wrap q-gutter-md">

              <!-- Ícono circular -->
              <div class="bit-sec-icon-wrap" :style="{ background: sec.color + '1A' }">
                <q-icon :name="sec.icono" :style="{ color: sec.color }" size="24px" />
              </div>

              <!-- Contenido -->
              <div class="col">
                <div class="row items-center q-gutter-xs no-wrap">
                  <span class="text-subtitle2 text-weight-bold text-grey-9">{{ sec.nombre }}</span>
                  <span class="bit-sec-badge-inline" :style="{ color: sec.color, borderColor: sec.color }">
                    {{ sec.codigo }}
                  </span>
                </div>
                <div class="text-caption text-grey-6 q-mt-xs" style="line-height:1.4">
                  {{ sec.descripcion || '&nbsp;' }}
                </div>
                <div class="q-mt-sm">
                  <span v-if="(sec.totalBitacoras ?? 0) > 0"
                    class="text-caption text-grey-7 text-weight-medium">
                    {{ sec.totalBitacoras }} bitácora{{ (sec.totalBitacoras ?? 0) !== 1 ? 's' : '' }}
                  </span>
                  <span v-else class="text-caption text-weight-bold text-grey-5">Por definir</span>
                </div>
              </div>

              <!-- Flecha -->
              <q-icon name="chevron_right" color="grey-4" size="20px" class="q-mr-xs" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════
         NIVEL 2 — Bitácoras de la sección
    ═══════════════════════════════════════════════════ -->
    <template v-else-if="nivel === 2 && seccionActiva">

      <!-- Breadcrumb -->
      <div class="row items-center q-mb-sm q-gutter-xs">
        <q-btn flat dense no-caps label="Bitácoras" color="grey-6" padding="0"
          @click="nivel = 1; seccionActiva = null" />
        <q-icon name="chevron_right" color="grey-5" size="14px" />
        <span class="text-caption text-weight-bold" :style="{ color: seccionActiva.color }">
          {{ seccionActiva.nombre }}
        </span>
      </div>

      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <q-btn flat round dense icon="arrow_back" color="grey-7" class="q-mr-sm"
          @click="nivel = 1; seccionActiva = null" />
        <div class="bit-sec-badge-lg q-mr-sm" :style="{ background: seccionActiva.color }">
          {{ seccionActiva.codigo }}
        </div>
        <div class="text-h6 text-weight-bold" :style="{ color: seccionActiva.color }">
          {{ seccionActiva.nombre }}
        </div>
      </div>

      <!-- Lista de bitácoras -->
      <div class="bg-white rounded-borders shadow-1" style="border:1px solid #e8e8e8; overflow:hidden">

        <!-- Inocuidad: por definir -->
        <div v-if="seccionActiva.bitacoras.length === 0"
          class="q-pa-xl text-center text-grey-5 text-caption">
          Las bitácoras de esta sección están por definir
        </div>

        <div v-for="(bit, idx) in seccionActiva.bitacoras" :key="bit.codigo"
          class="bit-row"
          :class="{ 'bit-row-border': idx < seccionActiva.bitacoras.length - 1 }"
          @click="entrarBitacora(bit)"
        >
          <div class="bit-row-stripe" :style="{ background: seccionActiva.color }"></div>
          <div class="row items-center col no-wrap q-gutter-sm">
            <span class="bit-code-chip" :style="{ borderColor: seccionActiva.color, color: seccionActiva.color }">
              {{ bit.codigo }}
            </span>
            <span class="text-body2 text-grey-8 text-weight-medium col">{{ bit.nombre }}</span>
          </div>
          <div class="row items-center q-gutter-xs q-mr-sm">
            <span v-if="(bit.pendiente ?? 0) > 0"
              class="bit-kpi-mini bit-kpi-pendiente">
              {{ bit.pendiente }} pend.
            </span>
          </div>
          <q-icon name="chevron_right" color="grey-4" size="20px" />
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════
         NIVEL 3 — Registros de una bitácora
    ═══════════════════════════════════════════════════ -->
    <template v-else-if="nivel === 3 && seccionActiva && bitacoraActiva">

      <!-- Breadcrumb tipo "← Báscula / FO-HC-IMP-002" -->
      <div class="row items-center q-mb-md q-gutter-xs no-print">
        <q-btn flat round dense icon="arrow_back" color="grey-7" size="sm"
          @click="nivel = 2; bitacoraActiva = null" />
        <q-btn flat dense no-caps :label="seccionActiva.nombre" color="grey-7" padding="0 4px"
          @click="nivel = 2; bitacoraActiva = null" />
        <span class="text-grey-5" style="font-size:14px">/</span>
        <span class="text-weight-bold" :style="{ color: seccionActiva.color, fontSize:'13px' }">
          {{ bitacoraActiva.codigo }}
        </span>
      </div>

      <!-- Banner de encabezado -->
      <div class="bit-detail-banner q-mb-md print-banner">
        <!-- Caja de código -->
        <div class="bit-detail-code-box" :style="{ borderColor: seccionActiva.color + '66' }">
          <div class="bit-detail-code-label">BITÁCORA</div>
          <div class="bit-detail-code-value" :style="{ color: seccionActiva.color }">
            {{ bitacoraActiva.codigo }}
          </div>
        </div>
        <!-- Título y subtítulo -->
        <div class="col q-px-md">
          <div class="text-h6 text-weight-bold text-grey-9" style="line-height:1.3">
            {{ bitacoraActiva.nombre }}
          </div>
          <div class="text-caption text-grey-5 q-mt-xs">
            {{ seccionActiva.nombre }} &mdash; {{ seccionActiva.codigo }}
          </div>
        </div>
        <!-- Botón Imprimir (oculto al imprimir) -->
        <q-btn unelevated icon="print" label="Imprimir"
          class="no-print"
          style="background:#1a2233; color:#fff; border-radius:8px; flex-shrink:0"
          @click="imprimirBitacora" />
      </div>

      <!-- Sin columnas definidas -->
      <div v-if="!bitacoraActiva.columnas"
        class="bg-white rounded-borders shadow-1 flex flex-center"
        style="border:1px solid #e8e8e8; min-height:220px">
        <div class="text-center q-pa-xl">
          <q-icon name="construction" size="52px" color="grey-4" class="q-mb-md" />
          <div class="text-h6 text-grey-5">Por configurar</div>
          <div class="text-caption text-grey-4 q-mt-xs">
            Los campos de esta bitácora están pendientes de definir
          </div>
        </div>
      </div>

      <template v-else>
        <!-- Tarjeta de tabla -->
        <div class="bg-white rounded-borders shadow-1" style="border:1px solid #e8e8e8; overflow:hidden">

          <!-- Barra superior: buscador -->
          <div class="row items-center q-pa-md q-gutter-sm no-print">
            <q-space />
            <q-input v-model="buscar" dense outlined placeholder="Buscar..."
              style="min-width:220px; max-width:300px" clearable>
              <template v-slot:append><q-icon name="search" color="grey-5" /></template>
            </q-input>
          </div>

          <!-- Tabla personalizada -->
          <div style="overflow-x:auto">
            <table class="bit-custom-table" v-if="!cargandoRegistros">
              <thead>
                <tr>
                  <th class="bit-th-no">No.</th>
                  <th v-for="col in columnasVis" :key="col.campo" class="bit-th">
                    {{ col.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="registrosFiltrados.length === 0">
                  <td :colspan="columnasVis.length + 1" class="bit-td-empty">
                    Sin registros
                  </td>
                </tr>
                <tr v-for="(row, idx) in registrosFiltrados" :key="row.id" class="bit-tr">
                  <td class="bit-td-no">{{ idx + 1 }}</td>
                  <td v-for="col in columnasVis" :key="col.campo" class="bit-td">

                    <!-- Fecha -->
                    <template v-if="col.campo === 'fecha'">
                      {{ formatFecha(row.fecha) }}
                    </template>

                    <!-- Badge: tipo_grano, resultado_final → fondo de color -->
                    <template v-else-if="col.tipoDato === 'badge' && esBadgeFondo(col.campo)">
                      <span v-if="row.datos[col.campo]"
                        class="bit-badge-fondo"
                        :class="badgeGranoClass(String(row.datos[col.campo]))">
                        {{ row.datos[col.campo] }}
                      </span>
                      <span v-else class="text-grey-4">—</span>
                    </template>

                    <!-- Badge: ticket, lote, folio → texto con color de sección -->
                    <template v-else-if="col.tipoDato === 'badge'">
                      <span v-if="row.datos[col.campo]"
                        class="bit-badge-ticket"
                        :style="{ color: seccionActiva.color, borderColor: seccionActiva.color + '55' }">
                        {{ row.datos[col.campo] }}
                      </span>
                      <span v-else class="text-grey-4">—</span>
                    </template>

                    <!-- Número -->
                    <template v-else-if="col.tipoDato === 'numero'">
                      <span :class="col.campo === 'peso_neto' ? 'text-weight-bold' : ''">
                        {{ formatNum(row.datos[col.campo]) }}
                      </span>
                    </template>

                    <!-- Si/No -->
                    <template v-else-if="col.tipoDato === 'si_no'">
                      <span v-if="row.datos[col.campo] === 'S' || row.datos[col.campo] === true"
                        class="bit-badge-fondo bit-badge-aprobado">S</span>
                      <span v-else-if="row.datos[col.campo] === 'N' || row.datos[col.campo] === false"
                        class="bit-badge-fondo bit-badge-frijol">N</span>
                      <span v-else class="text-grey-4">—</span>
                    </template>

                    <!-- Texto con color de sección (sin borde) — condicion, accion_correctiva -->
                    <template v-else-if="col.tipoDato === 'texto_color'">
                      <span v-if="row.datos[col.campo]"
                        :style="{ color: seccionActiva.color, fontWeight: '600', fontSize: '13px' }">
                        {{ row.datos[col.campo] }}
                      </span>
                      <span v-else class="text-grey-4">—</span>
                    </template>

                    <!-- Texto / observaciones -->
                    <template v-else>
                      <span v-if="row.datos[col.campo]"
                        :class="col.campo === 'observaciones' ? 'text-grey-6 text-italic' : ''">
                        {{ row.datos[col.campo] }}
                      </span>
                      <span v-else class="text-grey-4">—</span>
                    </template>

                  </td>
                </tr>

                <!-- Fila de totales -->
                <tr v-if="registrosFiltrados.length > 0 && hayColumnasNumericas" class="bit-tr-totals">
                  <td></td>
                  <td v-for="col in columnasVis" :key="col.campo" class="bit-td">
                    <template v-if="col.campo === 'fecha'">
                      <span class="text-caption text-weight-bold" :style="{ color: seccionActiva.color }">
                        TOTALES &middot; {{ registrosFiltrados.length }} REGISTROS
                      </span>
                    </template>
                    <template v-else-if="col.tipoDato === 'numero'">
                      <span class="text-weight-bold">{{ formatNum(sumarCol(col.campo)) }}</span>
                    </template>
                    <template v-else></template>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Spinner carga -->
            <div v-if="cargandoRegistros" class="flex flex-center q-pa-xl">
              <q-spinner size="36px" :color="seccionActiva.color" />
            </div>
          </div>
        </div>

        <!-- Pie: conteo + peso neto total -->
        <div class="row justify-between items-center q-mt-sm q-px-xs no-print">
          <span class="text-caption text-grey-5">
            {{ registrosFiltrados.length }} de {{ registros.length }} registros
          </span>
          <span v-if="pesoNetoTotal > 0" class="text-caption text-grey-5">
            Peso neto total: <strong class="text-grey-8">{{ formatNum(pesoNetoTotal) }} kg</strong>
          </span>
        </div>
      </template>
    </template>

    <!-- ══════════════════════════════════════════════════
         MODAL — Nuevo Registro
    ═══════════════════════════════════════════════════ -->
    <q-dialog v-model="modalNuevo" persistent>
      <q-card style="width:760px; max-width:96vw" v-if="bitacoraActiva && seccionActiva">
        <!-- Header -->
        <div class="q-pa-md" :style="{ background: seccionActiva.color }">
          <div class="text-caption text-white" style="opacity:.75">Nuevo Registro</div>
          <div class="text-subtitle1 text-white text-weight-bold">{{ bitacoraActiva.nombre }}</div>
        </div>

        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-md">
            <div v-for="col in columnasSinMeta" :key="col.campo"
              :class="col.campo === 'observaciones' ? 'col-12' : 'col-12 col-md-6'">

              <!-- Textarea -->
              <q-input
                v-if="col.campo === 'observaciones'"
                v-model="nuevoForm[col.campo]"
                :label="col.label"
                type="textarea" rows="3" outlined dense
              />
              <!-- Fecha → date picker nativo -->
              <q-input
                v-else-if="col.tipoDato === 'fecha'"
                v-model="nuevoForm[col.campo]"
                :label="col.label"
                type="date" outlined dense
              />
              <!-- Hora → máscara HH:MM -->
              <q-input
                v-else-if="col.campo === 'hora'"
                v-model="nuevoForm[col.campo]"
                :label="col.label"
                mask="##:##" placeholder="HH:MM"
                outlined dense
              />
              <!-- Número -->
              <q-input
                v-else-if="col.tipoDato === 'numero'"
                v-model.number="nuevoForm[col.campo]"
                :label="col.label"
                type="number" outlined dense
              />
              <!-- Texto genérico -->
              <q-input
                v-else
                v-model="nuevoForm[col.campo]"
                :label="col.label"
                outlined dense
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn unelevated label="Guardar"
            :style="{ background: seccionActiva.color, color: '#fff', borderRadius: '6px' }"
            :loading="guardandoRegistro" @click="guardarRegistro" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();
const sedeId = computed(() => authStore.sedeActivaId ?? 0);

// ── Interfaces ────────────────────────────────────────────────
interface ColumnaDef {
  campo: string;
  label: string;
  tipoDato?: string;   // 'texto' | 'numero' | 'fecha' | 'badge' | 'si_no'
  esMeta?: boolean;    // true = campo de metadatos (fecha, status), no va en el form
}

interface BitacoraDef {
  codigo: string;
  nombre: string;
  tipo: string;          // 'linked' | 'manual'
  fuenteQuery?: string;
  columnas: ColumnaDef[] | null;  // null = por configurar
  pendiente?: number;
}

interface SeccionDef {
  codigo: string;
  nombre: string;
  descripcion?: string;
  color: string;
  icono: string;
  bitacoras: BitacoraDef[];
  totalBitacoras?: number;
  pendiente?: number;
}

interface BitacoraRegistro {
  id: number;
  codigoBitacora: string;
  seccionCodigo?: string;
  fecha: string;
  status: string;
  datos: Record<string, unknown>;
  sedeId: number;
}

// ── Estado de secciones (cargado desde API) ───────────────────
const secciones = ref<SeccionDef[]>([]);

// ── Estado de navegación ──────────────────────────────────────
const nivel          = ref<1 | 2 | 3>(1);
const seccionActiva  = ref<SeccionDef | null>(null);
const bitacoraActiva = ref<BitacoraDef | null>(null);

// ── Registros (Level 3) ───────────────────────────────────────
const registros          = ref<BitacoraRegistro[]>([]);
const cargandoRegistros  = ref(false);
const buscar             = ref('');
const filtroStatus       = ref('');

const registrosFiltrados = computed(() => {
  let lista = registros.value;
  const q = buscar.value.toLowerCase();
  if (q) lista = lista.filter(r =>
    r.fecha.toLowerCase().includes(q) ||
    Object.values(r.datos).some(v => (v == null ? '' : typeof v === 'string' ? v : JSON.stringify(v)).toLowerCase().includes(q)));
  if (filtroStatus.value) lista = lista.filter(r => r.status === filtroStatus.value);
  return lista;
});


// ── Columnas ───────────────────────────────────────────────────
// Sin meta, para el formulario de nuevo registro
const columnasSinMeta = computed(() =>
  (bitacoraActiva.value?.columnas ?? []).filter(c => !c.esMeta && c.campo !== 'acciones'));

// Con fecha incluida, para la tabla visual
const columnasVis = computed(() =>
  (bitacoraActiva.value?.columnas ?? []).filter(c => c.campo !== 'acciones'));

// Solo mostrar totales en bitácoras de pesaje/cantidades (no en análisis de calidad)
const CAMPOS_TOTALIZABLES = new Set([
  'peso_bruto', 'peso_neto', 'tara', 'cantidad', 'cantidad_peso',
  'cant_procesada', 'prod_clasificado', 'subproducto', 'desecho',
]);
const hayColumnasNumericas = computed(() =>
  columnasVis.value.some(c => c.tipoDato === 'numero' && CAMPOS_TOTALIZABLES.has(c.campo)));

// ── Helpers de renderizado ────────────────────────────────────
// Campos que muestran badge con fondo de color (tipo_grano, resultado_final)
const CAMPOS_BADGE_FONDO = new Set(['tipo_grano', 'resultado_final', 'condicion_grano',
  'condicion_tolva', 'cond_vehiculo', 'resultado_verif']);

function esBadgeFondo(campo: string): boolean {
  return CAMPOS_BADGE_FONDO.has(campo);
}

function badgeGranoClass(val: string): string {
  const v = val.toUpperCase();
  if (v.includes('GARBANZO'))  return 'bit-badge-garbanzo';
  if (v.includes('FRIJOL'))    return 'bit-badge-frijol';
  if (v.includes('APROBADO'))  return 'bit-badge-aprobado';
  if (v.includes('RECHAZADO')) return 'bit-badge-rechazado';
  return 'bit-badge-default';
}

function formatNum(val: unknown): string {
  const n = Number(val);
  if (isNaN(n) || val === null || val === undefined || val === '') return '—';
  return n.toLocaleString('es-MX');
}

function formatFecha(val: unknown): string {
  if (!val) return '—';
  if (typeof val !== 'string' && typeof val !== 'number') return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function sumarCol(campo: string): number {
  return registrosFiltrados.value.reduce((acc, row) => acc + (Number(row.datos[campo]) || 0), 0);
}

const pesoNetoTotal = computed(() => {
  if (!bitacoraActiva.value?.columnas) return 0;
  const tienePN = bitacoraActiva.value.columnas.some(c => c.campo === 'peso_neto');
  if (!tienePN) return 0;
  return sumarCol('peso_neto');
});

function imprimirBitacora() {
  window.print();
}

// ── Modales ───────────────────────────────────────────────────
const modalNuevo      = ref(false);
const nuevoForm       = ref<Record<string, string>>({});
const guardandoRegistro = ref(false);

// ── API — Secciones ───────────────────────────────────────────
async function cargarSecciones() {
  try {
    const { data } = await api.get<SeccionDef[]>('/api/bitacoras/secciones', {
      params: { sedeId: sedeId.value },
    });
    secciones.value = (Array.isArray(data) ? data : []).map(s => ({
      ...s,
      bitacoras: [],   // se cargan lazy al entrar a la sección
    }));
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar secciones' });
  }
}

// ── Navegación ────────────────────────────────────────────────
async function entrarSeccion(sec: SeccionDef) {
  seccionActiva.value = sec;
  bitacoraActiva.value = null;
  registros.value = [];
  buscar.value = '';
  filtroStatus.value = '';
  nivel.value = 2;

  // Cargar bitácoras de la sección desde la API
  try {
    const { data } = await api.get<BitacoraDef[]>(`/api/bitacoras/definicion/${sec.codigo}`, {
      params: { sedeId: sedeId.value },
    });
    const bitacoras = Array.isArray(data) ? data : [];
    // Las columnas se cargan lazy; inicializar como null por configurar
    seccionActiva.value = { ...sec, bitacoras: bitacoras.map(b => ({ ...b, columnas: null })) };
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar bitácoras' });
  }
}

async function entrarBitacora(bit: BitacoraDef) {
  registros.value = [];
  buscar.value = '';
  filtroStatus.value = '';
  nivel.value = 3;

  // Cargar columnas desde la API
  try {
    const { data } = await api.get<ColumnaDef[]>(`/api/bitacoras/columnas/${bit.codigo}`);
    const columnas = Array.isArray(data) && data.length > 0 ? data : null;
    bitacoraActiva.value = { ...bit, columnas };
  } catch {
    bitacoraActiva.value = { ...bit, columnas: null };
  }

  if (bitacoraActiva.value?.columnas) await cargarRegistros(bit.codigo);
}

// ── API — Registros ───────────────────────────────────────────
async function cargarRegistros(codigo: string) {
  cargandoRegistros.value = true;
  try {
    const { data } = await api.get<BitacoraRegistro[]>(`/api/bitacoras/${codigo}`, {
      params: { sedeId: sedeId.value },
    });
    registros.value = Array.isArray(data) ? data : [];
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar registros' });
  } finally {
    cargandoRegistros.value = false;
  }
}


async function guardarRegistro() {
  if (!bitacoraActiva.value || !seccionActiva.value) return;
  guardandoRegistro.value = true;
  try {
    const { fecha, ...datos } = nuevoForm.value;
    await api.post(`/api/bitacoras/${bitacoraActiva.value.codigo}`, {
      fecha: fecha || new Date().toISOString().split('T')[0],
      seccionCodigo: seccionActiva.value.codigo,
      datos,
      sedeId: sedeId.value,
    });
    modalNuevo.value = false;
    await cargarRegistros(bitacoraActiva.value.codigo);
    Notify.create({ type: 'positive', message: 'Registro guardado', timeout: 1800 });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al guardar registro' });
  } finally {
    guardandoRegistro.value = false;
  }
}



onMounted(() => void cargarSecciones());

</script>

<style scoped>
/* ── Tarjetas de sección ─────────────────────────────────── */
.bit-sec-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 18px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  cursor: pointer;
  transition: box-shadow .15s, transform .1s;
}
.bit-sec-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,.12);
  transform: translateY(-2px);
}

/* Ícono circular con fondo suave */
.bit-sec-icon-wrap {
  width: 52px; height: 52px; flex-shrink: 0;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}

/* Badge SEC-XX inline */
.bit-sec-badge-inline {
  font-size: 10px; font-weight: 800; letter-spacing: .5px;
  border: 1.5px solid; border-radius: 4px;
  padding: 1px 6px; white-space: nowrap; flex-shrink: 0;
}

.bit-sec-badge-lg {
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; letter-spacing: .6px;
  color: #fff; border-radius: 6px; padding: 3px 10px;
}

.bit-sec-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid #f5f5f5;
}

/* ── Código chip ─────────────────────────────────────────── */
.bit-code-chip {
  display: inline-block;
  font-size: 10px; font-weight: 700; letter-spacing: .3px;
  border: 1.5px solid; border-radius: 4px;
  padding: 1px 6px; white-space: nowrap; flex-shrink: 0;
}
.bit-code-chip-lg {
  display: inline-block;
  font-size: 11px; font-weight: 800; letter-spacing: .4px;
  border: 2px solid; border-radius: 6px;
  padding: 3px 10px; white-space: nowrap;
}

/* ── Fila de bitácora (Level 2) ──────────────────────────── */
.bit-row {
  display: flex; align-items: center;
  padding: 12px 16px 12px 0;
  cursor: pointer; transition: background .1s;
  gap: 12px;
}
.bit-row:hover { background: #fafafa; }
.bit-row-border { border-bottom: 1px solid #f5f5f5; }
.bit-row-stripe { width: 4px; min-height: 44px; border-radius: 0 3px 3px 0; flex-shrink: 0; }

/* ── KPIs mini ───────────────────────────────────────────── */
.bit-kpi-mini {
  font-size: 10px; font-weight: 700; border-radius: 10px; padding: 2px 8px;
}
.bit-kpi-pendiente { background: #fff3e0; color: #e65100; }

/* ── KPI buttons (Level 3) ───────────────────────────────── */
.bit-kpi-btn {
  display: flex; flex-direction: column; align-items: center;
  padding: 6px 16px; border-radius: 8px;
  border: 1.5px solid #e0e0e0; background: #fff;
  cursor: pointer; transition: all .15s;
  min-width: 80px;
}
.bit-kpi-btn:hover { border-color: #bdbdbd; }
.bit-kpi-btn-count { font-size: 18px; font-weight: 800; color: #424242; }
.bit-kpi-btn-label { font-size: 10px; color: #9e9e9e; font-weight: 600; letter-spacing: .5px; }
.bit-kpi-btn-active-pendiente { background: #fff3e0; border-color: #f59e0b; }
.bit-kpi-btn-active-pendiente .bit-kpi-btn-count { color: #e65100; }
.bit-kpi-btn-active-firmada  { background: #f0fdf4; border-color: #10b981; }
.bit-kpi-btn-active-firmada  .bit-kpi-btn-count { color: #059669; }
.bit-kpi-btn-active-impresa  { background: #eff6ff; border-color: #3b82f6; }
.bit-kpi-btn-active-impresa  .bit-kpi-btn-count { color: #2563eb; }

/* ── Status badges ───────────────────────────────────────── */
.bit-status-badge {
  display: inline-block; font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 20px; color: #fff;
}
.bit-status-pendiente { background: #f59e0b; }
.bit-status-firmada   { background: #10b981; }
.bit-status-impresa   { background: #3b82f6; }

/* ── Banner de detalle (Nivel 3) ─────────────────────────── */
.bit-detail-banner {
  display: flex; align-items: center;
  background: #fff8f0;
  border: 1px solid #ffe0b2;
  border-radius: 10px;
  padding: 16px 20px;
  gap: 0;
}
.bit-detail-code-box {
  display: flex; flex-direction: column; align-items: flex-start;
  border-right: 2px solid;
  padding-right: 18px;
  min-width: 130px;
  flex-shrink: 0;
}
.bit-detail-code-label {
  font-size: 10px; font-weight: 800; letter-spacing: 1.2px;
  color: #9e9e9e; margin-bottom: 4px;
}
.bit-detail-code-value {
  font-size: 15px; font-weight: 800; letter-spacing: .5px;
}

/* ── Tabla personalizada (Nivel 3) ───────────────────────── */
.bit-custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.bit-th-no, .bit-th {
  background: #1a2233;
  color: #fff;
  font-size: 12px; font-weight: 700;
  padding: 10px 14px;
  text-align: left;
  white-space: nowrap;
}
.bit-th-no { width: 48px; text-align: center; }

.bit-tr:nth-child(even) { background: #fafafa; }
.bit-tr:hover           { background: #f0f4ff; }

.bit-td-no {
  text-align: center; color: #bdbdbd;
  font-size: 11px; font-weight: 600;
  padding: 10px 8px;
}
.bit-td {
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
  color: #424242;
}
.bit-td-empty {
  text-align: center; padding: 40px; color: #bdbdbd; font-size: 13px;
}

/* Fila de totales */
.bit-tr-totals td {
  background: #f5f7fa;
  border-top: 2px solid #e0e0e0;
  padding: 10px 14px;
  font-size: 12px;
}

/* ── Badges de datos ─────────────────────────────────────── */
.bit-badge-fondo {
  display: inline-block;
  font-size: 11px; font-weight: 700; letter-spacing: .3px;
  padding: 2px 10px; border-radius: 4px;
}
.bit-badge-garbanzo  { background: #fff3cd; color: #7d5a00; }
.bit-badge-frijol    { background: #ffe0e0; color: #c00000; }
.bit-badge-aprobado  { background: #d4edda; color: #155724; }
.bit-badge-rechazado { background: #f8d7da; color: #721c24; }
.bit-badge-default   { background: #e8eaf6; color: #3949ab; }

.bit-badge-ticket {
  display: inline-block;
  font-size: 12px; font-weight: 600;
  padding: 2px 8px; border-radius: 4px;
  border: 1px solid;
  background: transparent;
}

/* ── Detalle modal ───────────────────────────────────────── */
.bit-det-label { font-size: 11px; font-weight: 700; letter-spacing: .6px; color: #9e9e9e; margin-bottom: 4px; }
.bit-det-value { font-size: 14px; color: #424242; }
</style>

<!-- Estilos globales de impresión (sin scoped para afectar el layout de Quasar) -->
<style>
@media print {
  /* ── Página ────────────────────────────────────────────── */
  @page {
    size: A4 landscape;
    margin: 8mm 10mm;
  }

  /* ── Ocultar chrome de Quasar ──────────────────────────── */
  .q-drawer,
  .q-drawer-container,
  .q-header,
  .q-footer,
  .q-page-sticky,
  .q-layout__shadow { display: none !important; }

  .q-page-container {
    padding-left: 0 !important;
    padding-top:  0 !important;
  }
  .q-page {
    padding:    4px 0 !important;
    background: #fff !important;
    min-height: unset !important;
  }

  /* ── Ocultar elementos marcados ────────────────────────── */
  .no-print { display: none !important; }

  /* ── Banner ────────────────────────────────────────────── */
  .print-banner {
    border:        1px solid #ddd !important;
    background:    #fff !important;
    padding:       8px 12px !important;
    margin-bottom: 8px !important;
    border-radius: 6px !important;
    page-break-inside: avoid;
  }
  .print-banner .text-h6 { font-size: 13px !important; }
  .print-banner .text-caption { font-size: 10px !important; }
  .bit-detail-code-value { font-size: 12px !important; }

  /* ── Contenedor de tarjeta de tabla ────────────────────── */
  .bg-white.rounded-borders.shadow-1 {
    border:     none !important;
    box-shadow: none !important;
  }

  /* ── Tabla ──────────────────────────────────────────────── */
  .bit-custom-table {
    width:       100% !important;
    font-size:   9px !important;
    table-layout: auto !important;
  }

  .bit-th-no,
  .bit-th {
    font-size:   8px !important;
    padding:     5px 6px !important;
    white-space: normal !important;
    background:  #1a2233 !important;
    color:       #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bit-th-no { width: 30px !important; }

  .bit-td-no {
    padding:   5px 4px !important;
    font-size: 8px !important;
  }
  .bit-td {
    padding:     5px 6px !important;
    font-size:   9px !important;
    white-space: normal !important;
    word-break:  break-word;
  }

  /* ── Fila de totales ──────────────────────────────────── */
  .bit-tr-totals td {
    padding:   5px 6px !important;
    font-size: 9px !important;
    page-break-inside: avoid;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Badges con color ─────────────────────────────────── */
  .bit-badge-fondo,
  .bit-badge-garbanzo,
  .bit-badge-frijol,
  .bit-badge-aprobado,
  .bit-badge-rechazado,
  .bit-badge-default,
  .bit-badge-ticket {
    font-size:  8px !important;
    padding:    1px 5px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Evitar cortes de fila ─────────────────────────────── */
  .bit-tr      { page-break-inside: avoid; }
  .bit-tr-totals { page-break-inside: avoid; }
}
</style>
