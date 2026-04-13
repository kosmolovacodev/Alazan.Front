<template>
  <q-page padding class="bg-grey-2">

    <!-- ══════════════════════════════════════════════════
         NIVEL 1 — Grid de secciones
    ═══════════════════════════════════════════════════ -->
    <template v-if="nivel === 1">
      <div class="row items-center q-mb-lg">
        <q-icon name="menu_book" size="md" color="grey-8" class="q-mr-sm" />
        <div>
          <div class="text-h6 text-weight-bold text-grey-9">Bitácoras Operativas</div>
          <div class="text-caption text-grey-6">Selecciona una sección para ver sus bitácoras</div>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div v-for="sec in SECCIONES" :key="sec.codigo" class="col-12 col-md-4">
          <div class="bit-sec-card" @click="entrarSeccion(sec)">

            <!-- Header de la tarjeta -->
            <div class="bit-sec-header" :style="{ background: sec.color }">
              <div class="row items-center q-gutter-sm no-wrap">
                <span class="bit-sec-badge-sm">{{ sec.codigo }}</span>
                <q-icon :name="sec.icono" color="white" size="18px" />
                <span class="text-white text-subtitle2 text-weight-bold">{{ sec.nombre }}</span>
              </div>
            </div>

            <!-- Lista primeras 3 bitácoras -->
            <div class="q-pa-md">
              <div v-for="bit in sec.bitacoras.slice(0, 3)" :key="bit.codigo"
                class="row items-center no-wrap q-mb-xs">
                <span class="bit-code-chip" :style="{ borderColor: sec.color, color: sec.color }">
                  {{ bit.codigo }}
                </span>
                <span class="text-caption text-grey-7 q-ml-xs col ellipsis">{{ bit.nombre }}</span>
              </div>
              <div v-if="sec.bitacoras.length > 3" class="text-caption text-grey-4 q-mt-xs">
                +{{ sec.bitacoras.length - 3 }} más...
              </div>
              <div v-if="sec.bitacoras.length === 0" class="text-caption text-grey-4 q-mt-xs">
                Por definir
              </div>
            </div>

            <!-- Footer con contador y stats -->
            <div class="bit-sec-footer">
              <span class="text-caption text-grey-6">{{ sec.bitacoras.length }} bitácoras</span>
              <div class="row q-gutter-xs items-center">
                <span v-if="statsPorSeccion(sec.codigo).pendiente > 0"
                  class="bit-kpi-mini bit-kpi-pendiente">
                  {{ statsPorSeccion(sec.codigo).pendiente }} pend.
                </span>
                <q-icon name="chevron_right" color="grey-4" size="18px" />
              </div>
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
            <span v-if="statsPorBitacora(bit.codigo).pendiente > 0"
              class="bit-kpi-mini bit-kpi-pendiente">
              {{ statsPorBitacora(bit.codigo).pendiente }} pend.
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

      <!-- Breadcrumb -->
      <div class="row items-center q-mb-sm q-gutter-xs">
        <q-btn flat dense no-caps label="Bitácoras" color="grey-6" padding="0"
          @click="nivel = 1; seccionActiva = null; bitacoraActiva = null" />
        <q-icon name="chevron_right" color="grey-5" size="14px" />
        <q-btn flat dense no-caps :label="seccionActiva.nombre" padding="0"
          :style="{ color: seccionActiva.color }"
          @click="nivel = 2; bitacoraActiva = null" />
        <q-icon name="chevron_right" color="grey-5" size="14px" />
        <span class="text-caption text-weight-bold text-grey-8">{{ bitacoraActiva.codigo }}</span>
      </div>

      <!-- Header bitácora -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-btn flat round dense icon="arrow_back" color="grey-7"
            @click="nivel = 2; bitacoraActiva = null" />
          <div>
            <span class="bit-code-chip-lg" :style="{ borderColor: seccionActiva.color, color: seccionActiva.color }">
              {{ bitacoraActiva.codigo }}
            </span>
            <div class="text-subtitle1 text-weight-bold text-grey-9 q-mt-xs">
              {{ bitacoraActiva.nombre }}
            </div>
          </div>
        </div>
        <q-btn v-if="bitacoraActiva.columnas" unelevated icon="add" label="Nuevo Registro"
          :style="{ background: seccionActiva.color, color: '#fff', borderRadius: '8px' }"
          @click="abrirNuevoRegistro" />
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

      <!-- Tabla de registros -->
      <div v-else class="bg-white rounded-borders shadow-1" style="border:1px solid #e8e8e8">

        <!-- Barra de filtros -->
        <div class="q-pa-md row items-center q-gutter-sm">
          <q-input v-model="buscar" dense outlined placeholder="Buscar..."
            style="min-width:200px" clearable>
            <template v-slot:prepend><q-icon name="search" /></template>
          </q-input>
          <q-space />
          <!-- KPIs clicables -->
          <div
            v-for="s in ['Pendiente','Firmada','Impresa']" :key="s"
            class="bit-kpi-btn"
            :class="filtroStatus === s ? 'bit-kpi-btn-active-' + s.toLowerCase() : ''"
            @click="filtroStatus = filtroStatus === s ? '' : s"
          >
            <span class="bit-kpi-btn-count">{{ contarStatus(s) }}</span>
            <span class="bit-kpi-btn-label">{{ s }}</span>
          </div>
        </div>

        <q-separator />

        <q-table
          :rows="registrosFiltrados"
          :columns="columnasTabla"
          row-key="id"
          flat
          :loading="cargandoRegistros"
          :rows-per-page-options="[15, 25, 50]"
        >
          <!-- Status -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <span class="bit-status-badge"
                :class="'bit-status-' + props.row.status.toLowerCase().replace(' ','')">
                {{ props.row.status }}
              </span>
            </q-td>
          </template>

          <!-- Acciones -->
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-right">
              <q-btn flat round dense icon="visibility" color="grey-7" size="sm"
                @click="verRegistro(props.row)">
                <q-tooltip>Ver</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="draw" size="sm"
                :color="props.row.status === 'Pendiente' ? 'grey-7' : 'grey-3'"
                :disable="props.row.status !== 'Pendiente'"
                @click="notificarProximamente('Firma')">
                <q-tooltip>Firmar</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="print" color="grey-7" size="sm"
                @click="notificarProximamente('Impresión')">
                <q-tooltip>Imprimir</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════
         MODAL — Ver registro
    ═══════════════════════════════════════════════════ -->
    <q-dialog v-model="modalVer">
      <q-card style="width:760px; max-width:96vw" v-if="registroVer && bitacoraActiva && seccionActiva">
        <!-- Header -->
        <div class="q-pa-md" :style="{ background: seccionActiva.color }">
          <div class="text-caption text-white" style="opacity:.75">{{ bitacoraActiva.codigo }}</div>
          <div class="text-subtitle1 text-white text-weight-bold">{{ bitacoraActiva.nombre }}</div>
        </div>

        <q-card-section>
          <!-- Fecha + Status -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <div class="bit-det-label">Fecha</div>
              <div class="bit-det-value">{{ registroVer.fecha }}</div>
            </div>
            <div class="col-6">
              <div class="bit-det-label">Status</div>
              <span class="bit-status-badge"
                :class="'bit-status-' + registroVer.status.toLowerCase().replace(' ','')">
                {{ registroVer.status }}
              </span>
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <!-- Campos del registro -->
          <div class="row q-col-gutter-md">
            <template v-for="col in columnasSinMeta" :key="col.campo">
              <div class="col-12 col-md-6">
                <div class="bit-det-label">{{ col.label }}</div>
                <div class="bit-det-value">
                  {{ (registroVer.datos as Record<string, unknown>)[col.campo] ?? '—' }}
                </div>
              </div>
            </template>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="grey" v-close-popup />
          <q-btn unelevated icon="print" label="Imprimir" color="grey-8"
            style="border-radius:6px" @click="notificarProximamente('Impresión')" />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
              <q-input
                v-if="col.campo === 'observaciones'"
                v-model="nuevoForm[col.campo]"
                :label="col.label"
                type="textarea" rows="3" outlined dense
              />
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
interface ColumnaDef { campo: string; label: string }

interface BitacoraDef {
  codigo: string;
  nombre: string;
  columnas: ColumnaDef[] | null;  // null = por configurar
}

interface SeccionDef {
  codigo: string;
  nombre: string;
  color: string;
  icono: string;
  bitacoras: BitacoraDef[];
}

interface BitacoraRegistro {
  id: number;
  codigoBitacora: string;
  seccionCodigo: string;
  fecha: string;
  status: string;
  datos: Record<string, unknown>;
  sedeId: number;
}

interface StatRow {
  codigoBitacora: string;
  seccionCodigo: string;
  total: number;
  pendiente: number;
  firmada: number;
  impresa: number;
}

// ── Catálogo fijo de secciones y bitácoras ────────────────────
const COLUMNAS: Record<string, ColumnaDef[]> = {
  'FO-HC-IMP-002': [
    { campo: 'fecha',             label: 'Fecha' },
    { campo: 'productor_cliente', label: 'Productor/Cliente' },
    { campo: 'placas',            label: 'Placas de Camión' },
    { campo: 'tipo_grano',        label: 'Tipo de Grano' },
    { campo: 'ticket',            label: '# Ticket o Boleta' },
    { campo: 'peso_bruto',        label: 'Peso Bruto (kg)' },
    { campo: 'tara',              label: 'Tara (kg)' },
    { campo: 'peso_neto',         label: 'Peso Neto (kg)' },
    { campo: 'observaciones',     label: 'Observaciones' },
  ],
  'FO-HC-IMP-003': [
    { campo: 'ticket',            label: 'Ticket/No. Boleta' },
    { campo: 'placas',            label: 'Placas de Camión' },
    { campo: 'color_apariencia',  label: 'Color/Apariencia' },
    { campo: 'olor',              label: 'Olor' },
    { campo: 'humedad',           label: 'Humedad del Grano (%)' },
    { campo: 'impurezas',         label: 'Impurezas (%)' },
    { campo: 'infestacion_moho',  label: 'Infestación/Moho (S/N)' },
    { campo: 'resultado_final',   label: 'Resultado Final' },
    { campo: 'observaciones',     label: 'Observaciones' },
  ],
  'FO-HC-IMP-011': [
    { campo: 'fecha',             label: 'Fecha' },
    { campo: 'ticket_folio',      label: 'Ticket/Folio' },
    { campo: 'producto',          label: 'Producto' },
    { campo: 'lote',              label: 'Lote' },
    { campo: 'peso_bruto',        label: 'Peso Bruto (kg)' },
    { campo: 'tara',              label: 'Tara (kg)' },
    { campo: 'peso_neto',         label: 'Peso Neto (kg)' },
    { campo: 'cliente_destino',   label: 'Cliente/Destino' },
    { campo: 'observaciones',     label: 'Observaciones' },
  ],
  'FO-HC-IMP-004': [
    { campo: 'fecha',             label: 'Fecha' },
    { campo: 'ticket',            label: 'Ticket/No. Boleta' },
    { campo: 'condicion_tolva',   label: 'Condición de Tolva antes de Volcado' },
    { campo: 'condicion_grano',   label: 'Condición del Grano Descargado' },
    { campo: 'silo_asignado',     label: 'Silo Asignado' },
    { campo: 'observaciones',     label: 'Observaciones' },
  ],
  'FO-HC-IMP-009': [
    { campo: 'fecha',             label: 'Fecha' },
    { campo: 'hora',              label: 'Hora' },
    { campo: 'area_silo',         label: 'Área o Silo Monitoreado' },
    { campo: 'temperatura',       label: 'Temperatura (°C)' },
    { campo: 'humedad_relativa',  label: 'Humedad Relativa (%)' },
    { campo: 'condicion',         label: 'Condición del Grano / Observación Visual' },
    { campo: 'accion_correctiva', label: 'Acción Correctiva Aplicada' },
    { campo: 'responsable',       label: 'Nombre del Responsable' },
  ],
  'FO-HC-IMP-005': [
    { campo: 'fecha',             label: 'Fecha' },
    { campo: 'orden_lote',        label: 'Orden de Producción / Lote' },
    { campo: 'producto',          label: 'Producto' },
    { campo: 'num_tren',          label: '# Tren' },
    { campo: 'silo_origen',       label: 'Silo Origen' },
    { campo: 'cant_procesada',    label: 'Cantidad Procesada (kg)' },
    { campo: 'prod_clasificado',  label: 'Producto Clasificado (kg)' },
    { campo: 'subproducto',       label: 'Subproducto / Rezaga (kg)' },
    { campo: 'desecho',           label: 'Desecho (kg)' },
    { campo: 'rendimiento',       label: 'Rendimiento (%)' },
    { campo: 'observaciones',     label: 'Observaciones' },
  ],
  'FO-HC-IMP-006': [
    { campo: 'fecha',               label: 'Fecha' },
    { campo: 'envasado',            label: 'Envasado' },
    { campo: 'producto',            label: 'Producto' },
    { campo: 'cosecha',             label: 'Cosecha' },
    { campo: 'proceso',             label: 'Proceso' },
    { campo: 'silos',               label: 'Silos' },
    { campo: 'variedad',            label: 'Variedad' },
    { campo: 'parrillas_completas', label: 'Parrillas Completas' },
    { campo: 'parrillas_comenzadas',label: 'Parrillas Comenzadas' },
  ],
  'FO-HC-IMP-007': [
    { campo: 'fecha',             label: 'Fecha' },
    { campo: 'ticket',            label: 'Ticket / Boleta No.' },
    { campo: 'condicion_camion',  label: 'Condición de Camión Antes de Descarga' },
    { campo: 'condicion_grano',   label: 'Condición del Grano Descargado' },
    { campo: 'almacen_asignado',  label: 'Almacén Asignado' },
    { campo: 'observaciones',     label: 'Observaciones' },
    { campo: 'resultado_accion',  label: 'Resultado / Acción Tomada' },
  ],
  'FO-HC-IMP-008': [
    { campo: 'fecha',             label: 'Fecha' },
    { campo: 'producto',          label: 'Producto' },
    { campo: 'presentacion',      label: 'Presentación' },
    { campo: 'variedad',          label: 'Variedad' },
    { campo: 'ubicacion',         label: 'Ubicación' },
    { campo: 'lote',              label: 'Lote' },
    { campo: 'cantidad',          label: 'Cantidad Almacenada (kg / sacos)' },
    { campo: 'cond_producto',     label: 'Condición del Producto' },
    { campo: 'cond_area',         label: 'Condición del Área' },
    { campo: 'marbete_colocado',  label: 'Marbete Colocado' },
    { campo: 'codigo_marbete',    label: 'Código del Marbete' },
    { campo: 'movimiento',        label: 'Movimiento' },
    { campo: 'observaciones',     label: 'Observaciones' },
  ],
  'FO-HC-IMP-010': [
    { campo: 'fecha',             label: 'Fecha' },
    { campo: 'unidad_placas',     label: 'Unidad / Placas' },
    { campo: 'conductor',         label: 'Conductor / Transportista' },
    { campo: 'producto_despachado',label: 'Producto Despachado' },
    { campo: 'lote',              label: 'Lote de Producto' },
    { campo: 'cantidad_peso',     label: 'Cantidad / Peso (kg)' },
    { campo: 'cond_vehiculo',     label: 'Condición del Vehículo' },
    { campo: 'resultado_verif',   label: 'Resultado de Verificación' },
    { campo: 'observaciones',     label: 'Observaciones / Acción Correctiva' },
  ],
};

const SECCIONES: SeccionDef[] = [
  {
    codigo: 'SEC-01', nombre: 'Báscula', color: '#e65100', icono: 'scale',
    bitacoras: [
      { codigo: 'FO-HC-IMP-002', nombre: 'BITÁCORA DE REGISTRO DE RECEPCIÓN DE GRANO', columnas: COLUMNAS['FO-HC-IMP-002'] ?? null },
      { codigo: 'FO-HC-IMP-003', nombre: 'BITÁCORA DE ANÁLISIS DE GRANO',               columnas: COLUMNAS['FO-HC-IMP-003'] ?? null },
      { codigo: 'FO-HC-IMP-011', nombre: 'BITÁCORA DE BÁSCULA – SALIDA',                columnas: COLUMNAS['FO-HC-IMP-011'] ?? null },
      { codigo: 'FO-HC-IMP-014', nombre: 'BITÁCORA DE HIGIENE PERSONAL Y USO DE EPP',  columnas: null },
      { codigo: 'FO-HC-IMP-019', nombre: 'BITÁCORA DE LIMPIEZA DE BÁSCULA Y ZONA DE MUESTREO', columnas: null },
      { codigo: 'FO-HC-IMP-020', nombre: 'BITÁCORA DE LIMPIEZA DE SANITARIOS Y COMEDOR', columnas: null },
      { codigo: 'FO-HC-IMP-023', nombre: 'BITÁCORA DE RECOLECCIÓN Y DISPOSICIÓN DE RESIDUOS', columnas: null },
    ],
  },
  {
    codigo: 'SEC-02', nombre: 'Volcado', color: '#f59e0b', icono: 'move_to_inbox',
    bitacoras: [
      { codigo: 'FO-HC-IMP-004', nombre: 'BITÁCORA DE VOLCADO Y EVALUACIÓN VISUAL DEL GRANO', columnas: COLUMNAS['FO-HC-IMP-004'] ?? null },
      { codigo: 'FO-HC-IMP-009', nombre: 'BITÁCORA DE MONITOREO DE TEMPERATURA Y HUMEDAD', columnas: COLUMNAS['FO-HC-IMP-009'] ?? null },
      { codigo: 'FO-HC-IMP-014', nombre: 'BITÁCORA DE HIGIENE PERSONAL Y USO DE EPP',  columnas: null },
      { codigo: 'FO-HC-IMP-015', nombre: 'BITÁCORA DE LIMPIEZA DE TOLVA, ELEVADORES Y VOLCADOR', columnas: null },
      { codigo: 'FO-HC-IMP-016', nombre: 'BITÁCORA DE LIMPIEZA DE SILOS METÁLICOS',    columnas: null },
      { codigo: 'FO-HC-IMP-020', nombre: 'BITÁCORA DE LIMPIEZA DE SANITARIOS Y COMEDOR', columnas: null },
      { codigo: 'FO-HC-IMP-021', nombre: 'BITÁCORA DE CONTROL Y APLICACIÓN DE PLAGUICIDAS', columnas: null },
    ],
  },
  {
    codigo: 'SEC-03', nombre: 'Proceso', color: '#3b82f6', icono: 'precision_manufacturing',
    bitacoras: [
      { codigo: 'FO-HC-IMP-005', nombre: 'BITÁCORA DE PRODUCCIÓN Y CLASIFICACIÓN (GARBANZO / FRIJOL)', columnas: COLUMNAS['FO-HC-IMP-005'] ?? null },
      { codigo: 'FO-HC-IMP-006', nombre: 'BITÁCORA DE CONTROL DE CALIDAD DEL PRODUCTO TERMINADO',     columnas: COLUMNAS['FO-HC-IMP-006'] ?? null },
      { codigo: 'FO-HC-IMP-014', nombre: 'BITÁCORA DE HIGIENE PERSONAL Y USO DE EPP',  columnas: null },
      { codigo: 'FO-HC-IMP-017', nombre: 'BITÁCORA DE VERIFICACIÓN DE EQUIPOS Y ÁREAS DE PROCESO LIMPIAS', columnas: null },
    ],
  },
  {
    codigo: 'SEC-04', nombre: 'Almacén', color: '#14b8a6', icono: 'warehouse',
    bitacoras: [
      { codigo: 'FO-HC-IMP-007', nombre: 'BITÁCORA DE DESCARGA MANUAL Y ALMACENAMIENTO DE FRIJOL', columnas: COLUMNAS['FO-HC-IMP-007'] ?? null },
      { codigo: 'FO-HC-IMP-008', nombre: 'BITÁCORA DE ALMACENAMIENTO FINAL DE PRODUCTO',          columnas: COLUMNAS['FO-HC-IMP-008'] ?? null },
      { codigo: 'FO-HC-IMP-009', nombre: 'BITÁCORA DE MONITOREO DE TEMPERATURA Y HUMEDAD',       columnas: COLUMNAS['FO-HC-IMP-009'] ?? null },
      { codigo: 'FO-HC-IMP-014', nombre: 'BITÁCORA DE HIGIENE PERSONAL Y USO DE EPP', columnas: null },
      { codigo: 'FO-HC-IMP-018', nombre: 'BITÁCORA DE LIMPIEZA DEL ALMACÉN',          columnas: null },
    ],
  },
  {
    codigo: 'SEC-05', nombre: 'Despacho', color: '#8b5cf6', icono: 'local_shipping',
    bitacoras: [
      { codigo: 'FO-HC-IMP-010', nombre: 'BITÁCORA DE DESPACHO Y VERIFICACIÓN DE UNIDADES LIMPIAS',   columnas: COLUMNAS['FO-HC-IMP-010'] ?? null },
      { codigo: 'FO-HC-IMP-021', nombre: 'BITÁCORA DE CONTROL Y APLICACIÓN DE PLAGUICIDAS',            columnas: null },
      { codigo: 'FO-HC-IMP-022', nombre: 'BITÁCORA DE LIMPIEZA DE UNIDADES DE CARGA (CAMIONES Y PLATAFORMAS)', columnas: null },
    ],
  },
  {
    codigo: 'SEC-06', nombre: 'Inocuidad', color: '#22c55e', icono: 'health_and_safety',
    bitacoras: [],  // Por definir
  },
];

// ── Estado de navegación ──────────────────────────────────────
const nivel          = ref<1 | 2 | 3>(1);
const seccionActiva  = ref<SeccionDef | null>(null);
const bitacoraActiva = ref<BitacoraDef | null>(null);

// ── Stats (para Level 1 y 2) ──────────────────────────────────
const stats = ref<StatRow[]>([]);

function statsPorSeccion(secCodigo: string) {
  const filas = stats.value.filter(s => s.seccionCodigo === secCodigo);
  return { pendiente: filas.reduce((a, s) => a + s.pendiente, 0) };
}
function statsPorBitacora(codigo: string) {
  const fila = stats.value.find(s => s.codigoBitacora === codigo);
  return { pendiente: fila?.pendiente ?? 0, firmada: fila?.firmada ?? 0, impresa: fila?.impresa ?? 0 };
}

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

function contarStatus(s: string) {
  return registros.value.filter(r => r.status === s).length;
}

// ── Columnas de tabla (q-table) ───────────────────────────────
const columnasSinMeta = computed(() =>
  (bitacoraActiva.value?.columnas ?? []).filter(c => c.campo !== 'status' && c.campo !== 'acciones'));

const columnasTabla = computed(() => {
  if (!bitacoraActiva.value?.columnas) return [];
  const cols = bitacoraActiva.value.columnas.map(col => ({
    name: col.campo,
    label: col.label,
    field: col.campo === 'fecha'
      ? 'fecha'
      : (row: BitacoraRegistro) => row.datos[col.campo] ?? '',
    align: 'left' as const,
    sortable: col.campo === 'fecha',
  }));
  return [
    ...cols,
    { name: 'status',   label: 'Status',   field: 'status', align: 'center' as const },
    { name: 'acciones', label: 'Acciones', field: 'id',     align: 'right'  as const },
  ];
});

// ── Modales ───────────────────────────────────────────────────
const modalVer        = ref(false);
const registroVer     = ref<BitacoraRegistro | null>(null);
const modalNuevo      = ref(false);
const nuevoForm       = ref<Record<string, string>>({});
const guardandoRegistro = ref(false);

// ── Navegación ────────────────────────────────────────────────
function entrarSeccion(sec: SeccionDef) {
  seccionActiva.value = sec;
  bitacoraActiva.value = null;
  registros.value = [];
  buscar.value = '';
  filtroStatus.value = '';
  nivel.value = 2;
}

async function entrarBitacora(bit: BitacoraDef) {
  bitacoraActiva.value = bit;
  registros.value = [];
  buscar.value = '';
  filtroStatus.value = '';
  nivel.value = 3;
  if (bit.columnas) await cargarRegistros(bit.codigo);
}

// ── API ───────────────────────────────────────────────────────
async function cargarStats() {
  try {
    const { data } = await api.get<StatRow[]>('/api/bitacoras/stats', { params: { sedeId: sedeId.value } });
    stats.value = Array.isArray(data) ? data : [];
  } catch { /* silencioso */ }
}

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

function abrirNuevoRegistro() {
  nuevoForm.value = {};
  for (const col of columnasSinMeta.value) {
    nuevoForm.value[col.campo] = '';
  }
  modalNuevo.value = true;
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
    await cargarStats();
    Notify.create({ type: 'positive', message: 'Registro guardado', timeout: 1800 });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al guardar registro' });
  } finally {
    guardandoRegistro.value = false;
  }
}

function verRegistro(row: BitacoraRegistro) {
  registroVer.value = row;
  modalVer.value = true;
}

function notificarProximamente(modulo: string) {
  Notify.create({ type: 'info', message: `${modulo}: próximamente disponible`, timeout: 2000 });
}

onMounted(() => void cargarStats());
</script>

<style scoped>
/* ── Tarjetas de sección ─────────────────────────────────── */
.bit-sec-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  cursor: pointer;
  transition: box-shadow .15s, transform .1s;
}
.bit-sec-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,.12);
  transform: translateY(-1px);
}
.bit-sec-header { padding: 14px 16px; }

.bit-sec-badge-sm {
  font-size: 10px; font-weight: 800; letter-spacing: .6px;
  background: rgba(255,255,255,.22); color: #fff;
  border-radius: 4px; padding: 2px 7px;
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

/* ── Detalle modal ───────────────────────────────────────── */
.bit-det-label { font-size: 11px; font-weight: 700; letter-spacing: .6px; color: #9e9e9e; margin-bottom: 4px; }
.bit-det-value { font-size: 14px; color: #424242; }
</style>
