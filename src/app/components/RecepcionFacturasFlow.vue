<template>
  <!-- =========================
       DETALLE (PantallaDetalleFacturacion)
       ========================= -->
  <template v-if="mostrarDetalle && detalleFactura">
    <PantallaDetalleFacturacion
      :productor="detalleFactura.productor"
      :rfc="detalleFactura.rfc"
      :entregas="entregasDetalle"
      :onBack="handleBackFromDetalle"
      :onUpdateRfc="(tickets, nuevoRfc) => emitUpdateRfc(tickets, nuevoRfc)"
      :onUpdateDocumentosStatus="(tickets, tieneDocumentos, tieneFacturaXML) => emitUpdateDocsStatus(tickets, tieneDocumentos, tieneFacturaXML)"
    />
  </template>

  <!-- =========================
       HISTORIAL
       ========================= -->
  <q-page v-else class="q-pa-lg bg-grey-2">

    <!-- Header -->
    <div class="row items-center q-gutter-md q-mb-lg">
      <q-btn flat round icon="arrow_back" @click="props.onBack?.()" />
      <div class="text-h6 text-grey-8">Recepción de Facturas</div>
    </div>

    <div class="text-subtitle1 text-grey-7 q-mb-md">Historial</div>

    <!-- KPIs -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-blue-1">
          <q-card-section>
            <div class="text-caption text-grey-7">Total del Día</div>
            <div class="text-h5 text-blue-10">{{ totalDelDia }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-green-1">
          <q-card-section>
            <div class="text-caption text-grey-7">Con RFC</div>
            <div class="text-h5 text-green-10">{{ conRFC }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-yellow-1">
          <q-card-section>
            <div class="text-caption text-grey-7">Sin RFC (Nuevos)</div>
            <div class="text-h5 text-yellow-10">{{ sinRFC }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-purple-1">
          <q-card-section>
            <div class="text-caption text-grey-7">Total Toneladas</div>
            <div class="text-h5 text-purple-10">{{ totalToneladas.toFixed(2) }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-md bg-white">
      <q-card-section>
        <div class="text-center text-subtitle2 q-mb-md">Filtros</div>

        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-2">
            <q-input v-model="filtros.ticket" dense outlined placeholder="Captura Ticket" />
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="filtros.productor" dense outlined placeholder="Captura Productor" />
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="filtros.rfc" dense outlined placeholder="Captura RFC" />
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="filtros.fecha" dense outlined placeholder="Captura Fecha" />
          </div>
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtros.status"
              dense
              outlined
              label="Status"
              :options="statusOptions"
              emit-value
              map-options
              clearable
            />
          </div>
        </div>

        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-2">
            <q-checkbox v-model="filtros.hoy" label="Hoy" />
          </div>

          <div class="col-12 col-md-6">
            <div class="row items-center q-gutter-sm">
              <div class="text-body2">Fecha:</div>
              <q-input v-model="filtros.fechaInicio" dense outlined type="date" style="max-width: 220px;" />
              <div class="text-body2">:</div>
              <q-input v-model="filtros.fechaFin" dense outlined type="date" style="max-width: 220px;" />
            </div>
          </div>

          <div class="col-12 col-md-4 row justify-end">
            <q-btn
              color="green-7"
              icon="table_view"
              label="Exportar Excel"
              @click="handleExportExcel"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Total a pagar -->
    <div class="row justify-end q-mb-md">
      <q-card flat bordered class="bg-white">
        <q-card-section class="q-py-sm q-px-md">
          <span class="text-caption text-grey-7">TOTAL A PAGAR: </span>
          <span class="text-subtitle1 text-weight-medium">
            ${{ money(totalAPagar) }}
          </span>
        </q-card-section>
      </q-card>
    </div>

    <!-- Acciones sobre selección -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <q-btn
          v-if="selectedIds.length > 0 && todosListosParaPago"
          color="green-7"
          icon="send"
          :label="`ENVIAR A PAGOS (${selectedIds.length})`"
          @click="handleEnviarAPagos"
        />
        <q-btn
          v-else-if="selectedIds.length > 0"
          color="deep-purple-7"
          icon="visibility"
          :label="`Ver Seleccionados (${selectedIds.length})`"
          @click="handleVerSeleccionados"
        />
      </div>

      <q-btn round color="black" icon="add" @click="notifyInfo('Acción + (pendiente)')" />
    </div>

    <!-- Tabla -->
    <q-card flat bordered class="bg-white">
      <q-table
        :rows="facturasFiltradas"
        :columns="columns"
        row-key="id"
        flat
        bordered
        separator="horizontal"
        selection="multiple"
        v-model:selected="selectedRowsProxy"
        :rows-per-page-options="[10, 25, 50, 0]"
        no-data-label="Sin resultados"
      >
        <!-- checkbox header (select all, pero respetando “solo listos”) -->
        <template #header-selection="scope">
          <q-checkbox
            :model-value="allSelectableChecked"
            :indeterminate="someSelectableChecked"
            @update:model-value="handleSelectAll"
          />
        </template>

        <!-- checkbox row (solo si puede seleccionar) -->
        <template #body-selection="scope">
          <q-checkbox
            :model-value="selectedIds.includes(scope.row.id)"
            :disable="!puedeSeleccionar(scope.row)"
            @update:model-value="() => handleSelectRecord(scope.row.id)"
          />
        </template>

        <template #body-cell-rfc="p">
          <q-td :props="p">
            <span :class="p.row.rfc === 'Pendiente RFC' ? 'text-negative text-weight-medium' : ''">
              {{ p.row.rfc }}
            </span>
          </q-td>
        </template>

        <template #body-cell-importe="p">
          <q-td :props="p">
            ${{ money(p.row.importe) }}
          </q-td>
        </template>

        <template #body-cell-aPagar="p">
          <q-td :props="p">
            ${{ money(p.row.aPagar) }}
          </q-td>
        </template>

        <template #body-cell-status="p">
          <q-td :props="p">
            <span :class="obtenerStatus(p.row).clase">
              {{ obtenerStatus(p.row).texto }}
            </span>
          </q-td>
        </template>

        <template #body-cell-ver="p">
          <q-td :props="p">
            <q-btn
              dense
              flat
              round
              icon="visibility"
              color="blue-7"
              @click="handleVerFactura(p.row.productor, p.row.rfc, p.row.ticket)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import PantallaDetalleFacturacion from './PantallaDetalleFacturacion.vue';

interface RecepcionFacturasFlowProps {
  onBack?: () => void;
  onNavigateToPagos?: (tickets: string[]) => void;
  boletasPrecios?: any[];
  registrosBascula?: any[];
  onUpdateRfc?: (tickets: string[], nuevoRfc: string) => void;
  onUpdateDocumentosStatus?: (tickets: string[], tieneDocumentos: boolean, tieneFacturaXML: boolean) => void;
  onActualizarStatusDocumentos?: (tickets: string[], tieneDocumentos: boolean, tieneFacturaXML: boolean) => void;
}

interface FacturaRecord {
  id: number;
  ticket: string;
  fecha: string;
  rfc: string;
  productor: string;
  toneladas: number;
  netoAPagar: number;
  precio: number;
  importe: number;
  aPagar: number;
  tieneDocumentos: boolean;
  tieneFacturaXML: boolean;
}

const props = withDefaults(defineProps<RecepcionFacturasFlowProps>(), {
  onBack: () => {},
  onNavigateToPagos: () => {},
  boletasPrecios: () => [],
  registrosBascula: () => [],
  onUpdateRfc: () => {},
  onUpdateDocumentosStatus: () => {},
  onActualizarStatusDocumentos: () => {}
});

const $q = useQuasar();

/* =========================
   Estado UI
========================= */
const selectedIds = ref<number[]>([]);
const mostrarDetalle = ref(false);
const detalleFactura = ref<{ productor: string; rfc: string; tickets: string[] } | null>(null);

const filtros = ref({
  ticket: '',
  productor: '',
  rfc: '',
  fecha: '',
  status: '',
  hoy: false,
  fechaInicio: '',
  fechaFin: ''
});

const statusOptions = [
  { label: 'PENDIENTE RFC', value: 'PENDIENTE RFC' },
  { label: 'PENDIENTE DOCUMENTOS', value: 'PENDIENTE DOCUMENTOS' },
  { label: 'PENDIENTE FACTURA XML', value: 'PENDIENTE FACTURA XML' },
  { label: 'LISTO PARA SOLICITAR PAGO', value: 'LISTO PARA SOLICITAR PAGO' }
];

/* =========================
   Fuente: facturas (igual TSX)
========================= */
const boletasConPreliquidacion = computed(() => {
  return props.boletasPrecios.filter((boleta: any) => {
    const registroBascula = props.registrosBascula.find((r: any) => r.ticket === boleta.ticket);
    return registroBascula?.pesoNeto && registroBascula.pesoNeto !== '-';
  });
});

const facturas = computed<FacturaRecord[]>(() => {
  const productoresConRFC: Record<string, string> = {
    'Juan Pérez García': 'PEGJ850101ABC',
    'María López Martínez': 'LOMM900215XYZ',
    'Pedro Ramírez Torres': 'RATP750520DEF',
    'Ana González Ruiz': 'GORA880310GHI',
    'Carlos Hernández Silva': 'HESC920705JKL',
    'Rosa Martínez Flores': 'MAFR870825MNO',
    'Luis Torres Méndez': 'TOML810618PQR',
    'Elena Sánchez Cruz': 'SACE930420STU'
  };

  return boletasConPreliquidacion.value.map((boleta: any, index: number) => {
    const registroBascula = props.registrosBascula.find((r: any) => r.ticket === boleta.ticket);
    const pesoNetoKg = parseFloat(String(registroBascula?.pesoNeto || '0').replace(/,/g, ''));

    const impurezasPorcentaje = parseFloat(String(boleta.impurezas || '0'));
    const descuentoKgPorTon = impurezasPorcentaje * 10;

    const toneladasPesoNeto = pesoNetoKg / 1000;
    const descuentoTotal = descuentoKgPorTon * toneladasPesoNeto;
    const kgALiquidar = Math.round(pesoNetoKg - descuentoTotal);

    const toneladas = kgALiquidar / 1000;
    const precioBase = parseFloat(String(boleta.precioSugerido || '0'));
    const importe = toneladas * precioBase * 1000;
    const aPagar = importe * 0.987;

    let rfc = boleta.rfc;
    if (!rfc) {
      const nombreProductor = boleta.productor || '';
      rfc = productoresConRFC[nombreProductor] || 'Pendiente RFC';
    }

    return {
      id: index + 1,
      ticket: boleta.ticket || '',
      fecha: boleta.fecha ? String(boleta.fecha).split(' ')[0] : '',
      rfc,
      productor: boleta.productor || '',
      toneladas: parseFloat(toneladas.toFixed(3)),
      netoAPagar: kgALiquidar,
      precio: precioBase,
      importe: Math.round(importe * 100) / 100,
      aPagar: Math.round(aPagar * 100) / 100,
      tieneDocumentos: !!boleta.tieneDocumentos,
      tieneFacturaXML: !!boleta.tieneFacturaXML
    };
  });
});

function obtenerStatus(factura: FacturaRecord) {
  if (factura.rfc === 'Pendiente RFC') {
    return { texto: 'PENDIENTE RFC', clase: 'text-negative text-weight-bold' };
  }
  if (!factura.tieneDocumentos) {
    return { texto: 'PENDIENTE DOCUMENTOS', clase: 'text-warning text-weight-bold' };
  }
  if (!factura.tieneFacturaXML) {
    return { texto: 'PENDIENTE FACTURA XML', clase: 'text-orange text-weight-bold' };
  }
  return { texto: 'LISTO PARA SOLICITAR PAGO', clase: 'text-positive text-weight-bold' };
}

const facturasFiltradas = computed(() => {
  const f = filtros.value;

  return facturas.value.filter((factura) => {
    if (f.ticket && !factura.ticket.toLowerCase().includes(f.ticket.toLowerCase())) return false;
    if (f.productor && !factura.productor.toLowerCase().includes(f.productor.toLowerCase())) return false;
    if (f.rfc && !factura.rfc.toLowerCase().includes(f.rfc.toLowerCase())) return false;

    if (f.status) {
      const status = obtenerStatus(factura).texto;
      if (!status.toLowerCase().includes(f.status.toLowerCase())) return false;
    }
    return true;
  });
});

/* =========================
   Métricas (igual TSX)
========================= */
const totalAPagar = computed(() => facturasFiltradas.value.reduce((sum, x) => sum + x.aPagar, 0));
const totalToneladas = computed(() => facturasFiltradas.value.reduce((sum, x) => sum + x.toneladas, 0));
const totalDelDia = computed(() => facturasFiltradas.value.filter(f => f.fecha === '06/01/2026').length);
const conRFC = computed(() => facturasFiltradas.value.filter(f => f.rfc !== 'Pendiente RFC').length);
const sinRFC = computed(() => facturasFiltradas.value.filter(f => f.rfc === 'Pendiente RFC').length);

/* =========================
   Selección (solo listos)
========================= */
function puedeSeleccionar(f: FacturaRecord) {
  return obtenerStatus(f).texto === 'LISTO PARA SOLICITAR PAGO';
}

function handleSelectRecord(id: number) {
  const factura = facturas.value.find(f => f.id === id);
  if (!factura) return;

  if (!puedeSeleccionar(factura)) return;

  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(x => x !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
}

function handleSelectAll() {
  const listos = facturasFiltradas.value.filter(puedeSeleccionar);
  const listosIds = listos.map(x => x.id);

  const allSelected = listosIds.length > 0 && listosIds.every(id => selectedIds.value.includes(id));
  selectedIds.value = allSelected ? [] : listosIds;
}

const todosListosParaPago = computed(() => {
  if (selectedIds.value.length === 0) return false;
  const sel = facturas.value.filter(f => selectedIds.value.includes(f.id));
  return sel.every(f => obtenerStatus(f).texto === 'LISTO PARA SOLICITAR PAGO');
});

// Proxy para que QTable “selection=multiple” no se pelee con nuestra regla de “solo listos”
const selectedRowsProxy = computed({
  get() {
    return facturasFiltradas.value.filter(r => selectedIds.value.includes(r.id));
  },
  set(rows: FacturaRecord[]) {
    // Solo aceptamos rows que sean seleccionables
    const filtered = rows.filter(puedeSeleccionar).map(r => r.id);
    selectedIds.value = Array.from(new Set(filtered));
  }
});

const selectableIds = computed(() => facturasFiltradas.value.filter(puedeSeleccionar).map(r => r.id));

const allSelectableChecked = computed(() => {
  const ids = selectableIds.value;
  return ids.length > 0 && ids.every(id => selectedIds.value.includes(id));
});
const someSelectableChecked = computed(() => {
  const ids = selectableIds.value;
  const selectedInSelectable = ids.filter(id => selectedIds.value.includes(id));
  return selectedInSelectable.length > 0 && selectedInSelectable.length < ids.length;
});

/* =========================
   Export/acciones
========================= */
function handleExportExcel() {
  notifyInfo('Exportando a Excel...');
}

function handleEnviarAPagos() {
  if (selectedIds.value.length === 0) return notifyWarn('⚠️ Debe seleccionar al menos una factura para enviar a pagos');

  const ticketsSeleccionados = facturas.value
    .filter(f => selectedIds.value.includes(f.id))
    .map(f => f.ticket);

  $q.dialog({
    title: 'Confirmación',
    message: `¿Desea enviar ${selectedIds.value.length} factura(s) a Pagos/Productores?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    props.onNavigateToPagos?.(ticketsSeleccionados);
    const n = selectedIds.value.length;
    selectedIds.value = [];
    notifyOk(`✅ ${n} factura(s) enviada(s) a Pagos/Productores`);
  });
}

function handleVerFactura(productor: string, rfc: string, ticket: string) {
  detalleFactura.value = { productor, rfc, tickets: [ticket] };
  mostrarDetalle.value = true;
}

function handleVerSeleccionados() {
  if (selectedIds.value.length === 0) return notifyWarn('Por favor seleccione al menos un ticket');

  const primera = facturas.value.find(f => f.id === selectedIds.value[0]);
  if (!primera) return;

  const ticketsSeleccionados = facturas.value
    .filter(f => selectedIds.value.includes(f.id))
    .map(f => f.ticket);

  detalleFactura.value = { productor: primera.productor, rfc: primera.rfc, tickets: ticketsSeleccionados };
  mostrarDetalle.value = true;
}

/* =========================
   Construcción de entregas (igual TSX)
========================= */
function obtenerEntregaPorTicket(ticket: string) {
  const entrega = facturas.value.find(f => f.ticket === ticket);
  if (!entrega) return [];

  const boletaCorrespondiente = props.boletasPrecios.find((b: any) => b.ticket === ticket);
  const registroBascula = props.registrosBascula.find((r: any) => r.ticket === ticket);

  const descuentoKgPorTon = parseFloat(String(boletaCorrespondiente?.descuento || '35'));
  const pesoNetoOriginal = Math.round(entrega.netoAPagar / (1 - descuentoKgPorTon / 1000));

  const esPersonaMoral = entrega.rfc !== 'Pendiente RFC' && entrega.rfc.length === 12;
  const atiende = esPersonaMoral ? 'Ing. Carlos Ramírez López' : undefined;

  return [{
    ticket: entrega.ticket,
    fecha: entrega.fecha,
    boleta: {
      folio: entrega.ticket,
      productor: entrega.productor,
      fechaHora: boletaCorrespondiente?.fecha || `${entrega.fecha} 08:30`,
      telefono: boletaCorrespondiente?.telefono || registroBascula?.celular || '667-123-4567',
      tProductor: boletaCorrespondiente?.tProductor || 'Ejidal',
      comprador: boletaCorrespondiente?.comprador || 'Abelardo',
      origen: boletaCorrespondiente?.origen || 'Mocorito',
      precio: entrega.precio.toString(),
      descuento: boletaCorrespondiente?.descuento || '35.00',
      calibre: boletaCorrespondiente?.calibre || '44-46',
      humedad: boletaCorrespondiente?.humedad || '12.5',
      atiende: boletaCorrespondiente?.atiende || atiende,

      impurezas: boletaCorrespondiente?.impurezas || '3.5',
      r1: boletaCorrespondiente?.r1 || '1.4',
      r2: boletaCorrespondiente?.r2 || '0.9',
      cafesLisos: boletaCorrespondiente?.cafesLisos || '2.1',
      manchados: boletaCorrespondiente?.manchados || '1.9',
      quebMxc: boletaCorrespondiente?.quebMxc || '2.3',
      helados: boletaCorrespondiente?.helados || '0.8',
      alimonados: boletaCorrespondiente?.alimonados || '0.5',
      revolcados: boletaCorrespondiente?.revolcados || '0.2',
      sumaR2: boletaCorrespondiente?.sumaR2 || '7.8',
      totalDanos: boletaCorrespondiente?.totalDanos || '12.7',
      exportacion: boletaCorrespondiente?.exportacion || '87.3'
    },
    preliquidacion: {
      productor: entrega.productor,
      tProductor: boletaCorrespondiente?.tProductor || 'Ejidal',
      producto: boletaCorrespondiente?.producto || 'Garbanzo',
      camion: registroBascula?.productor || 'José García',
      placas: registroBascula?.placas || boletaCorrespondiente?.placas || 'ABC-123',
      chofer: registroBascula?.chofer || boletaCorrespondiente?.chofer || 'José García',
      rt: '',
      fecha: entrega.fecha,
      precio: entrega.precio.toString(),
      descuento: boletaCorrespondiente?.descuento || '35.00',
      kgLiquidar: entrega.netoAPagar.toLocaleString('en-US'),
      pesoBruto: `${(pesoNetoOriginal + 8000).toLocaleString('en-US')} kg`,
      tara: '8,000 kg',
      pesoNeto: `${pesoNetoOriginal.toLocaleString('en-US')} kg`,
      observaciones: 'Sin observaciones'
    },
    pago: {
      nombre: entrega.productor,
      banco_recoge: 'BBVA Bancomer',
      desc_federal: '1.25%',
      folio_fiscal_pago: 'A1B2C3D4-E5F6-7890',
      a_pagar: '$' + money(entrega.aPagar),
      folio_pago_productor: `FPP-${entrega.ticket}-2026`
    },
    facturacion: {
      importe: entrega.netoAPagar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      descPredial: (entrega.netoAPagar * 0.02).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      pagoPredial: (entrega.netoAPagar * 0.03).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      descISR: (entrega.netoAPagar * 0.10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      aPagar: (entrega.aPagar * 0.85).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      diasHabilesPago: '15'
    }
  }];
}

function obtenerEntregasPorTickets(ids: number[]) {
  const seleccionadas = facturas.value.filter(f => ids.includes(f.id));
  return seleccionadas.flatMap(ent => obtenerEntregaPorTicket(ent.ticket));
}

const entregasDetalle = computed(() => {
  if (!detalleFactura.value) return [];
  return detalleFactura.value.tickets.length > 1
    ? obtenerEntregasPorTickets(selectedIds.value)
    : obtenerEntregaPorTicket(detalleFactura.value.tickets[0]);
});

function handleBackFromDetalle() {
  mostrarDetalle.value = false;
  selectedIds.value = [];
}

/* =========================
   Emits / callbacks
========================= */
function emitUpdateRfc(tickets: string[], nuevoRfc: string) {
  props.onUpdateRfc?.(tickets, nuevoRfc);
}
function emitUpdateDocsStatus(tickets: string[], tieneDocumentos: boolean, tieneFacturaXML: boolean) {
  props.onUpdateDocumentosStatus?.(tickets, tieneDocumentos, tieneFacturaXML);
}

/* =========================
   Tabla columns
========================= */
const columns = [
  { name: 'sel', label: '', field: 'sel', align: 'left' as const },
  { name: 'idx', label: '#', field: 'id', align: 'left' as const },
  { name: 'ticket', label: 'No. Ticket', field: 'ticket', align: 'left' as const, sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' as const, sortable: true },
  { name: 'rfc', label: 'RFC', field: 'rfc', align: 'left' as const, sortable: true },
  { name: 'productor', label: 'Productor', field: 'productor', align: 'left' as const, sortable: true },
  { name: 'toneladas', label: 'Toneladas', field: 'toneladas', align: 'left' as const, sortable: true },
  { name: 'netoAPagar', label: 'Neto a pagar (KG)', field: 'netoAPagar', align: 'left' as const, sortable: true },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'left' as const, sortable: true },
  { name: 'importe', label: 'Importe', field: 'importe', align: 'left' as const, sortable: true },
  { name: 'aPagar', label: 'A pagar', field: 'aPagar', align: 'left' as const, sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
  { name: 'ver', label: 'Ver', field: 'ver', align: 'left' as const }
];

/* =========================
   Utils
========================= */
function money(v: number) {
  return Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function notifyInfo(message: string) {
  $q.notify({ type: 'info', message, position: 'top' });
}
function notifyOk(message: string) {
  $q.notify({ type: 'positive', message, position: 'top' });
}
function notifyWarn(message: string) {
  $q.notify({ type: 'warning', message, position: 'top' });
}
</script>
