<template>
  <q-page padding class="bg-grey-2">

    <!-- ══════════════════════════════════════════════════
         VISTA: HISTORIAL
    ═══════════════════════════════════════════════════ -->
    <template v-if="vista === 'historial'">

      <!-- Encabezado -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-icon name="local_shipping" size="md" color="teal-7" />
          <div>
            <div class="text-h6 text-weight-bold text-grey-9">Instrucciones de Embarque</div>
            <div class="text-caption text-grey-6">Historial y gestión de instrucciones</div>
          </div>
        </div>
        <q-btn unelevated color="teal-7" icon="add" label="Nueva Instrucción"
          style="border-radius:8px" @click="abrirNueva" />
      </div>

      <!-- KPI Cards -->
      <div class="row q-gutter-md q-mb-md">
        <div class="col">
          <div class="ie-kpi-card">
            <div class="ie-kpi-label">Total</div>
            <div class="ie-kpi-value">{{ stats.totalTons }}T</div>
            <div class="ie-kpi-sub">{{ stats.total }} instrucciones</div>
          </div>
        </div>
        <div class="col">
          <div class="ie-kpi-card ie-kpi-warning">
            <div class="ie-kpi-label">Pendiente</div>
            <div class="ie-kpi-value">{{ stats.pendiente }}</div>
            <div class="ie-kpi-sub">{{ stats.tonsPendiente }}T</div>
          </div>
        </div>
        <div class="col">
          <div class="ie-kpi-card ie-kpi-info">
            <div class="ie-kpi-label">En Tránsito</div>
            <div class="ie-kpi-value">{{ stats.enTransito }}</div>
            <div class="ie-kpi-sub">{{ stats.tonsTransito }}T</div>
          </div>
        </div>
        <div class="col">
          <div class="ie-kpi-card ie-kpi-success">
            <div class="ie-kpi-label">Embarcado</div>
            <div class="ie-kpi-value">{{ stats.embarcado }}</div>
            <div class="ie-kpi-sub">{{ stats.tonsEmbarcado }}T</div>
          </div>
        </div>
        <div class="col">
          <div class="ie-kpi-card ie-kpi-error">
            <div class="ie-kpi-label">Cancelado</div>
            <div class="ie-kpi-value">{{ stats.cancelado }}</div>
            <div class="ie-kpi-sub">{{ stats.tonsCancelado }}T</div>
          </div>
        </div>
        <div class="col">
          <div class="ie-kpi-card ie-kpi-garbanzo">
            <div class="ie-kpi-label">Garbanzo</div>
            <div class="ie-kpi-value">{{ stats.tonsGarbanzo }}T</div>
            <div class="ie-kpi-sub">{{ stats.garbanzo }} instrucciones</div>
          </div>
        </div>
        <div class="col">
          <div class="ie-kpi-card ie-kpi-frijol">
            <div class="ie-kpi-label">Frijol</div>
            <div class="ie-kpi-value">{{ stats.tonsFrijol }}T</div>
            <div class="ie-kpi-sub">{{ stats.frijol }} instrucciones</div>
          </div>
        </div>
      </div>

      <!-- Filtros + Tabla -->
      <div class="bg-white rounded-borders shadow-1" style="border:1px solid #e8e8e8">
        <div class="row items-center q-pa-md q-gutter-sm">
          <q-input v-model="buscar" dense outlined placeholder="Buscar contrato, cliente..." class="col"
            clearable>
            <template v-slot:prepend><q-icon name="search" /></template>
          </q-input>
          <q-select v-model="filtroProducto" :options="['Garbanzo','Frijol']" dense outlined
            placeholder="Producto" clearable style="min-width:130px" />
          <q-select v-model="filtroStatusEmbarque" :options="statusEmbarqueOpts" dense outlined
            placeholder="Status Embarque" clearable style="min-width:160px" />
          <q-select v-model="filtroStatusDoc" :options="statusDocOpts" dense outlined
            placeholder="Status Doc." clearable style="min-width:160px" />
          <q-btn v-if="filtrosActivos" flat dense icon="filter_alt_off" color="grey-6"
            @click="limpiarFiltros">
            <q-tooltip>Limpiar filtros</q-tooltip>
          </q-btn>
        </div>

        <q-separator />

        <q-table :rows="historialFiltrado" :columns="columnas" row-key="id" flat
          :loading="cargando" :rows-per-page-options="[15, 25, 50]">

          <template v-slot:body-cell-producto="props">
            <q-td :props="props">
              <span class="ie-chip-producto" :class="props.row.producto === 'Garbanzo' ? 'ie-chip-g' : 'ie-chip-f'">
                {{ props.row.producto }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-calibre="props">
            <q-td :props="props">
              <q-badge v-if="props.row.calibre" color="blue-grey-7" outline>{{ props.row.calibre }}</q-badge>
              <span v-else class="text-grey-4">—</span>
            </q-td>
          </template>

          <template v-slot:body-cell-statusEmbarque="props">
            <q-td :props="props">
              <span class="ie-badge-status" :class="colorEmbarque(props.row.statusEmbarque)">
                {{ props.row.statusEmbarque }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-statusDocumentacion="props">
            <q-td :props="props">
              <span class="ie-badge-status" :class="colorDoc(props.row.statusDocumentacion)">
                {{ props.row.statusDocumentacion }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-right">
              <q-btn flat round dense icon="visibility" color="teal-7" size="sm"
                @click="verDetalle(props.row)">
                <q-tooltip>Ver detalle</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="edit_note" color="blue-7" size="sm"
                @click="abrirEditar(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════
         VISTA: DETALLE
    ═══════════════════════════════════════════════════ -->
    <template v-else-if="vista === 'detalle' && detalle">
      <div class="row justify-center">
        <div style="width:100%; max-width:820px">
          <div class="row items-center q-mb-md q-gutter-sm">
            <q-btn flat round dense icon="arrow_back" color="grey-7" @click="vista = 'historial'" />
            <div class="text-h6 text-weight-bold text-grey-9">Detalle de Instrucción</div>
            <q-space />
            <q-btn unelevated color="orange-7" icon="print" label="Reporte"
              style="border-radius:8px" @click="imprimir" />
          </div>

          <div class="bg-white rounded-borders shadow-2" style="border:1px solid #e8e8e8; padding:32px">
            <div class="row items-start q-mb-lg">
              <div class="col">
                <div class="ie-det-label">No. Instrucción</div>
                <div class="ie-det-value text-h5">{{ detalle.noInstruccion }}</div>
              </div>
              <div class="col-auto text-right">
                <div class="ie-det-label">Fecha</div>
                <div class="ie-det-value">{{ formatFecha(detalle.fecha) }}</div>
              </div>
            </div>
            <q-separator class="q-mb-lg" />

            <div class="row q-col-gutter-lg q-mb-lg">
              <div class="col-12 col-md-4">
                <div class="ie-det-label">Contrato</div>
                <div class="ie-det-value">{{ detalle.contrato || '—' }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="ie-det-label">Referencia Alazán</div>
                <div class="ie-det-value">{{ detalle.referenciaAlazan || '—' }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="ie-det-label">Broker</div>
                <div class="ie-det-value">{{ detalle.broker || '—' }}</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="ie-det-label">Cliente</div>
                <div class="ie-det-value">{{ detalle.cliente || '—' }}</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="ie-det-label">Domicilio</div>
                <div class="ie-det-value">{{ detalle.domicilio || '—' }}</div>
              </div>
              <div class="col-12 col-md-3">
                <div class="ie-det-label">Producto</div>
                <span class="ie-chip-producto" :class="detalle.producto === 'Garbanzo' ? 'ie-chip-g' : 'ie-chip-f'">
                  {{ detalle.producto }}
                </span>
              </div>
              <div class="col-12 col-md-3">
                <div class="ie-det-label">Calibre</div>
                <div class="ie-det-value">{{ detalle.calibre || '—' }}</div>
              </div>
              <div class="col-12 col-md-3">
                <div class="ie-det-label">Toneladas</div>
                <div class="ie-det-value text-weight-bold">{{ detalle.tons }} T</div>
              </div>
              <div class="col-12 col-md-3">
                <div class="ie-det-label">Precio Unitario</div>
                <div class="ie-det-value">{{ detalle.precioUnitario || '—' }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="ie-det-label">Presentación</div>
                <div class="ie-det-value">{{ detalle.presentacion || '—' }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="ie-det-label">Fecha de Embarque</div>
                <div class="ie-det-value">{{ detalle.fechaEmbarque || '—' }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="ie-det-label">Lugar de Embarque</div>
                <div class="ie-det-value">{{ detalle.lugarEmbarque || '—' }}</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="ie-det-label">Status Embarque</div>
                <span class="ie-badge-status" :class="colorEmbarque(detalle.statusEmbarque)">
                  {{ detalle.statusEmbarque }}
                </span>
              </div>
              <div class="col-12 col-md-6">
                <div class="ie-det-label">Status Documentación</div>
                <span class="ie-badge-status" :class="colorDoc(detalle.statusDocumentacion)">
                  {{ detalle.statusDocumentacion }}
                </span>
              </div>
              <div v-if="detalle.condicionesGenerales" class="col-12">
                <div class="ie-det-label">Condiciones Generales</div>
                <div class="ie-det-value">{{ detalle.condicionesGenerales }}</div>
              </div>
              <div v-if="detalle.condicionesEspeciales" class="col-12">
                <div class="ie-det-label">Condiciones Especiales</div>
                <div class="ie-det-value" style="white-space:pre-wrap">{{ detalle.condicionesEspeciales }}</div>
              </div>
            </div>

            <q-separator class="q-mb-md" />
            <div class="row justify-between">
              <q-btn flat label="Regresar" icon="arrow_back" color="grey-7"
                @click="vista = 'historial'" />
              <q-btn unelevated color="teal-7" icon="edit" label="Editar"
                style="border-radius:8px" @click="abrirEditar(detalle)" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════
         VISTA: FORMULARIO (nueva / editar)
    ═══════════════════════════════════════════════════ -->
    <template v-else-if="vista === 'form'">
      <div class="row justify-center">
        <div style="width:100%; max-width:860px">

          <!-- Header form -->
          <div class="row items-center q-mb-md">
            <q-btn flat round dense icon="arrow_back" color="grey-7"
              @click="vista = 'historial'" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bold text-grey-9">
              Instrucciones de Embarque
            </div>
          </div>

          <div class="bg-white rounded-borders shadow-1" style="border:1px solid #e8e8e8">

            <!-- Título de sección -->
            <div class="q-px-lg q-pt-lg q-pb-sm">
              <div class="text-subtitle1 text-weight-bold text-grey-9">
                {{ form.id ? 'Editar Instrucción de Embarque' : 'Nueva Instrucción de Embarque' }}
              </div>
            </div>

            <div class="q-pa-lg q-gutter-y-md">

              <!-- Fila 1: Contrato | Referencia Alazán | Fecha -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input v-model="form.contrato" label="Contrato *" outlined dense
                    placeholder="Ej. 2183" />
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="form.referenciaAlazan" label="Referencia Alazán" outlined dense
                    placeholder="ALZ-XXXX-25" />
                </div>
                <div class="col-12 col-md-4">
                  <!-- Fecha con q-dialog para evitar overflow: hidden -->
                  <div style="position:relative">
                    <div class="ie-field-label">Fecha</div>
                    <div class="ie-fecha-display" @click="popupFecha = true">
                      <span :style="{ color: form.fecha ? '#424242' : '#bdbdbd', fontSize:'13px' }">
                        {{ form.fecha || 'dd/mm/aaaa' }}
                      </span>
                      <q-icon name="event" size="16px" color="grey-5" />
                      <q-btn v-if="form.fecha" flat round dense icon="close" size="xs"
                        color="grey-4" @click.stop="form.fecha = ''" style="margin-left:2px" />
                    </div>
                    <q-dialog v-model="popupFecha">
                      <q-date v-model="form.fecha" mask="DD/MM/YYYY" :locale="localeEs" today-btn
                        @update:model-value="popupFecha = false">
                        <div class="row items-center justify-between q-px-md q-pb-sm">
                          <q-btn flat dense size="sm" color="grey-6" label="Limpiar"
                            @click="form.fecha = ''; popupFecha = false" />
                          <q-btn v-close-popup flat label="Listo" color="teal-7" />
                        </div>
                      </q-date>
                    </q-dialog>
                  </div>
                </div>
              </div>

              <!-- Cliente -->
              <div class="row">
                <div class="col-12">
                  <q-input v-model="form.cliente" label="Cliente" outlined dense
                    placeholder="Nombre completo del cliente" />
                </div>
              </div>

              <!-- Domicilio -->
              <div class="row">
                <div class="col-12">
                  <q-input v-model="form.domicilio" label="Domicilio" outlined dense
                    placeholder="Ciudad, País" />
                </div>
              </div>

              <!-- Broker -->
              <div class="row">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.broker"
                    :options="catalogos.brokers"
                    option-value="nombre" option-label="nombre"
                    label="Broker / Intermediario"
                    outlined dense clearable emit-value map-options
                    use-input input-debounce="0"
                    new-value-mode="add"
                    placeholder="Selecciona o escribe un broker"
                  />
                </div>
              </div>

              <!-- Producto toggle + Calibre -->
              <div class="row q-col-gutter-md items-end">
                <div class="col-12 col-md-6">
                  <div class="ie-field-label q-mb-xs">Producto</div>
                  <div class="row" style="gap:0">
                    <q-btn
                      v-for="p in ['Garbanzo','Frijol']" :key="p"
                      unelevated :label="p"
                      :style="{
                        background: form.producto === p ? '#e65100' : '#fff',
                        color: form.producto === p ? '#fff' : '#424242',
                        border: form.producto === p ? '1.5px solid #e65100' : '1.5px solid #d0d0d0',
                        borderRadius: p === 'Garbanzo' ? '6px 0 0 6px' : '0 6px 6px 0',
                        fontWeight: 700, minWidth: '110px', padding: '8px 0'
                      }"
                      @click="form.producto = p; form.calibre = ''"
                    />
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.calibre"
                    :options="calibresDisponibles"
                    label="Calibre"
                    outlined dense clearable
                    placeholder="Selecciona calibre"
                  />
                </div>
              </div>

              <!-- Cantidad (Tons) + Precio Unitario -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input v-model.number="form.tons" label="Cantidad (Tons)" type="number"
                    outlined dense min="0" step="0.01" placeholder="96" />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="form.precioUnitario" label="Precio Unitario" outlined dense
                    placeholder="1500 USD" />
                </div>
              </div>

              <!-- Presentación -->
              <div class="row">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.presentacionId"
                    :options="catalogos.presentaciones"
                    option-value="id" option-label="nombre"
                    label="Presentación"
                    outlined dense clearable emit-value map-options
                    placeholder="25 kg Marco Alazán"
                  />
                </div>
              </div>

              <!-- Fecha de Embarque + Lugar de Embarque -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input v-model="form.fechaEmbarque" label="Fecha de Embarque" outlined dense
                    placeholder="Octubre" />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.lugarEmbarque"
                    :options="catalogos.lugares"
                    option-value="nombre" option-label="nombre"
                    label="Lugar de Embarque"
                    outlined dense clearable emit-value map-options
                    use-input input-debounce="0"
                    new-value-mode="add"
                    placeholder="Selecciona o escribe un lugar"
                  />
                </div>
              </div>

              <!-- Status Embarque + Status Documentación -->
              <div class="row q-col-gutter-md">
                <!-- Status Embarque -->
                <div class="col-12 col-md-6">
                  <div class="ie-field-label q-mb-xs">Status Embarque</div>
                  <div class="ie-status-grid">
                    <div
                      v-for="s in statusEmbarqueOpts" :key="s"
                      class="ie-status-option"
                      :class="form.statusEmbarque === s ? 'ie-status-selected-' + statusEmbarqueKey(s) : ''"
                      @click="form.statusEmbarque = s"
                    >
                      <span class="ie-status-dot" :style="{ background: dotColorEmbarque(s, form.statusEmbarque === s) }"></span>
                      <span class="ie-status-text">{{ s }}</span>
                    </div>
                  </div>
                </div>

                <!-- Status Documentación -->
                <div class="col-12 col-md-6">
                  <div class="ie-field-label q-mb-xs">Status Documentación</div>
                  <div class="ie-status-grid">
                    <div
                      v-for="s in statusDocOpts" :key="s"
                      class="ie-status-option"
                      :class="form.statusDocumentacion === s ? 'ie-status-selected-' + statusDocKey(s) : ''"
                      @click="form.statusDocumentacion = s"
                    >
                      <span class="ie-status-dot" :style="{ background: dotColorDoc(s, form.statusDocumentacion === s) }"></span>
                      <span class="ie-status-text">{{ s }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Condiciones Generales -->
              <div class="row">
                <div class="col-12">
                  <q-input v-model="form.condicionesGenerales" label="Condiciones Generales"
                    outlined dense placeholder="Ej. GAFTA 24/BBA/25 - Arbitration - London" />
                </div>
              </div>

              <!-- Condiciones Especiales -->
              <div class="row">
                <div class="col-12">
                  <q-input v-model="form.condicionesEspeciales" label="Condiciones Especiales"
                    type="textarea" outlined dense rows="4"
                    placeholder="Una condición por línea..." />
                </div>
              </div>

              <!-- ── Plantillas reutilizables ─────────────────────── -->
              <div v-if="catalogos.plantillas.length" class="ie-plantillas-panel">
                <div class="row items-center q-mb-sm">
                  <q-icon name="library_books" color="grey-6" size="16px" class="q-mr-xs" />
                  <span class="ie-plantillas-title">Plantillas reutilizables</span>
                  <q-space />
                  <span class="text-caption text-grey-5">Haz clic en una para insertarla</span>
                </div>
                <div class="row q-gutter-sm">
                  <div
                    v-for="pl in catalogos.plantillas" :key="pl.id"
                    class="ie-plantilla-card col-12 col-md-5"
                  >
                    <div class="ie-plantilla-titulo">{{ pl.titulo }}</div>
                    <div class="ie-plantilla-preview">{{ pl.cuerpo }}</div>
                    <div class="row q-gutter-xs q-mt-xs">
                      <q-btn flat dense size="xs" color="teal-7" no-caps
                        icon="arrow_forward" label="→ Generales"
                        @click="form.condicionesGenerales = pl.cuerpo" />
                      <q-btn flat dense size="xs" color="blue-7" no-caps
                        icon="add" label="+ Especiales"
                        @click="form.condicionesEspeciales = (form.condicionesEspeciales ? form.condicionesEspeciales + '\n' : '') + pl.cuerpo" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botones -->
              <div class="row justify-center q-gutter-md q-pt-sm">
                <q-btn unelevated color="orange-7" label="Guardar"
                  style="border-radius:8px; min-width:120px"
                  :loading="guardando" @click="guardar" />
                <q-btn unelevated color="grey-9" icon="print" label="Reporte"
                  style="border-radius:8px; min-width:120px" @click="imprimir" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </template>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();
const sedeId = computed(() => authStore.sedeActivaId ?? 0);

// ── Vistas ───────────────────────────────────────────────────
const vista = ref<'historial' | 'detalle' | 'form'>('historial');

// ── Tipos ────────────────────────────────────────────────────
interface Instruccion {
  id: number;
  noInstruccion: string;
  referenciaAlazan: string | null;
  fecha: string;
  cliente: string | null;
  domicilio: string | null;
  contrato: string | null;
  broker: string | null;
  producto: string;
  calibre: string | null;
  tons: number;
  precioUnitario: string | null;
  presentacion: string | null;
  fechaEmbarque: string | null;
  lugarEmbarque: string | null;
  statusEmbarque: string;
  statusDocumentacion: string;
  condicionesGenerales: string | null;
  condicionesEspeciales: string | null;
  presentacionId: number | null;
  plantillaId: number | null;
  sedeId: number;
}

interface Stats {
  total: number; totalTons: number;
  pendiente: number; tonsPendiente: number;
  enTransito: number; tonsTransito: number;
  embarcado: number; tonsEmbarcado: number;
  cancelado: number; tonsCancelado: number;
  garbanzo: number; tonsGarbanzo: number;
  frijol: number; tonsFrijol: number;
}

const historial = ref<Instruccion[]>([]);
const detalle   = ref<Instruccion | null>(null);
const cargando  = ref(false);
const guardando = ref(false);
const stats     = ref<Stats>({
  total: 0, totalTons: 0,
  pendiente: 0, tonsPendiente: 0,
  enTransito: 0, tonsTransito: 0,
  embarcado: 0, tonsEmbarcado: 0,
  cancelado: 0, tonsCancelado: 0,
  garbanzo: 0, tonsGarbanzo: 0,
  frijol: 0, tonsFrijol: 0,
});

// ── Catálogos ────────────────────────────────────────────────
interface CatItem { id: number; nombre: string }
interface CatPlantilla { id: number; titulo: string; cuerpo: string }
const catalogos = ref<{
  presentaciones: CatItem[];
  brokers: CatItem[];
  lugares: CatItem[];
  plantillas: CatPlantilla[];
}>({ presentaciones: [], brokers: [], lugares: [], plantillas: [] });

// ── Status opciones ───────────────────────────────────────────
const statusEmbarqueOpts = ['Pendiente', 'En Tránsito', 'Embarcado', 'Cancelado'];
const statusDocOpts      = ['Incompleto', 'Completo', 'Enviado'];

// ── Calibres ──────────────────────────────────────────────────
const calibresGarbanzo = ['34/36','36/38','40/42','42/44','44/46','46/48','48/50','48/52'];
const calibresFrijol   = ['Hasta 70','71-75','76-80','81-85','86-90','91-95','>96'];

// ── Filtros ───────────────────────────────────────────────────
const buscar              = ref('');
const filtroProducto      = ref('');
const filtroStatusEmbarque = ref('');
const filtroStatusDoc     = ref('');

const filtrosActivos = computed(() =>
  [buscar.value, filtroProducto.value, filtroStatusEmbarque.value, filtroStatusDoc.value]
    .filter(Boolean).length > 0);

function limpiarFiltros() {
  buscar.value = filtroProducto.value = filtroStatusEmbarque.value = filtroStatusDoc.value = '';
}

const historialFiltrado = computed(() => {
  let lista = historial.value;
  const q = buscar.value.toLowerCase();
  if (q) lista = lista.filter(r =>
    (r.contrato ?? '').toLowerCase().includes(q) ||
    (r.cliente ?? '').toLowerCase().includes(q) ||
    r.noInstruccion.toLowerCase().includes(q));
  if (filtroProducto.value)       lista = lista.filter(r => r.producto === filtroProducto.value);
  if (filtroStatusEmbarque.value) lista = lista.filter(r => r.statusEmbarque === filtroStatusEmbarque.value);
  if (filtroStatusDoc.value)      lista = lista.filter(r => r.statusDocumentacion === filtroStatusDoc.value);
  return lista;
});

// ── Columnas ──────────────────────────────────────────────────
const columnas = [
  { name: 'noInstruccion',       label: '#',           field: 'noInstruccion',       align: 'left'   as const, sortable: true },
  { name: 'fecha',               label: 'Fecha',       field: 'fecha',               align: 'left'   as const, sortable: true },
  { name: 'contrato',            label: 'Contrato',    field: 'contrato',            align: 'left'   as const },
  { name: 'cliente',             label: 'Cliente',     field: 'cliente',             align: 'left'   as const },
  { name: 'producto',            label: 'Producto',    field: 'producto',            align: 'left'   as const },
  { name: 'calibre',             label: 'Calibre',     field: 'calibre',             align: 'center' as const },
  { name: 'tons',                label: 'Tons',        field: 'tons',                align: 'right'  as const },
  { name: 'statusEmbarque',      label: 'Embarque',    field: 'statusEmbarque',      align: 'center' as const },
  { name: 'statusDocumentacion', label: 'Doc.',        field: 'statusDocumentacion', align: 'center' as const },
  { name: 'acciones',            label: 'Ver',         field: 'id',                  align: 'right'  as const },
];

// ── Form ──────────────────────────────────────────────────────
const formInicial = () => ({
  id: null as number | null,
  noInstruccion: '',
  referenciaAlazan: '',
  fecha: '',
  cliente: '',
  domicilio: '',
  contrato: '',
  broker: '',
  producto: 'Garbanzo',
  calibre: '',
  tons: 0 as number,
  precioUnitario: '',
  presentacionId: null as number | null,
  fechaEmbarque: '',
  lugarEmbarque: '',
  statusEmbarque: 'Pendiente',
  statusDocumentacion: 'Incompleto',
  condicionesGenerales: '',
  condicionesEspeciales: '',
  plantillaId: null as number | null,
  sedeId: sedeId.value,
});

const form      = ref(formInicial());
const popupFecha = ref(false);

const calibresDisponibles = computed(() =>
  form.value.producto === 'Frijol' ? calibresFrijol : calibresGarbanzo);

// ── Locale ────────────────────────────────────────────────────
const localeEs = {
  days:        ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  daysShort:   ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  months:      ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthsShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  firstDayOfWeek: 1,
};

// ── Helpers colores ───────────────────────────────────────────
function colorEmbarque(s: string) {
  const m: Record<string, string> = {
    'Pendiente': 'ie-status-warning', 'En Tránsito': 'ie-status-info',
    'Embarcado': 'ie-status-success', 'Cancelado': 'ie-status-error',
  };
  return m[s] ?? 'ie-status-default';
}
function colorDoc(s: string) {
  const m: Record<string, string> = {
    'Incompleto': 'ie-status-default', 'Completo': 'ie-status-success', 'Enviado': 'ie-status-info',
  };
  return m[s] ?? 'ie-status-default';
}

function statusEmbarqueKey(s: string) {
  const m: Record<string, string> = {
    'Pendiente': 'warning', 'En Tránsito': 'info', 'Embarcado': 'success', 'Cancelado': 'error',
  };
  return m[s] ?? 'default';
}
function statusDocKey(s: string) {
  const m: Record<string, string> = {
    'Incompleto': 'grey', 'Completo': 'success', 'Enviado': 'info',
  };
  return m[s] ?? 'grey';
}

function dotColorEmbarque(s: string, selected: boolean) {
  if (!selected) return '#d0d0d0';
  const m: Record<string, string> = {
    'Pendiente': '#f59e0b', 'En Tránsito': '#3b82f6',
    'Embarcado': '#10b981', 'Cancelado': '#ef4444',
  };
  return m[s] ?? '#9e9e9e';
}
function dotColorDoc(s: string, selected: boolean) {
  if (!selected) return '#d0d0d0';
  const m: Record<string, string> = {
    'Incompleto': '#9e9e9e', 'Completo': '#10b981', 'Enviado': '#f59e0b',
  };
  return m[s] ?? '#9e9e9e';
}

function formatFecha(f: string | null) {
  if (!f) return '—';
  const d = new Date(f);
  return isNaN(d.getTime()) ? f : d.toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' });
}

// ── Datos ─────────────────────────────────────────────────────
async function cargar() {
  cargando.value = true;
  try {
    const [resH, resS] = await Promise.all([
      api.get<Instruccion[]>('/api/instrucciones-embarque/historial', { params: { sedeId: sedeId.value } }),
      api.get<Stats>('/api/instrucciones-embarque/stats', { params: { sedeId: sedeId.value } }),
    ]);
    historial.value = Array.isArray(resH.data) ? resH.data : [];
    if (resS.data) stats.value = resS.data;
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar historial' });
  } finally {
    cargando.value = false;
  }
}

async function cargarCatalogos() {
  try {
    const { data } = await api.get<{
      presentaciones: CatItem[];
      brokers: CatItem[];
      lugares: CatItem[];
      plantillas: CatPlantilla[];
    }>('/api/instrucciones-embarque/catalogos');
    catalogos.value.presentaciones = data.presentaciones ?? [];
    catalogos.value.brokers        = data.brokers        ?? [];
    catalogos.value.lugares        = data.lugares        ?? [];
    catalogos.value.plantillas     = data.plantillas     ?? [];
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar catálogos' });
  }
}

// ── Acciones ──────────────────────────────────────────────────
function verDetalle(row: Instruccion) {
  detalle.value = row;
  vista.value = 'detalle';
}

function abrirNueva() {
  form.value = formInicial();
  vista.value = 'form';
}

function abrirEditar(row: Instruccion) {
  form.value = {
    id: row.id,
    noInstruccion: row.noInstruccion,
    referenciaAlazan: row.referenciaAlazan ?? '',
    fecha: row.fecha,
    cliente: row.cliente ?? '',
    domicilio: row.domicilio ?? '',
    contrato: row.contrato ?? '',
    broker: row.broker ?? '',
    producto: row.producto,
    calibre: row.calibre ?? '',
    tons: row.tons,
    precioUnitario: row.precioUnitario ?? '',
    presentacionId: row.presentacionId,
    fechaEmbarque: row.fechaEmbarque ?? '',
    lugarEmbarque: row.lugarEmbarque ?? '',
    statusEmbarque: row.statusEmbarque,
    statusDocumentacion: row.statusDocumentacion,
    condicionesGenerales: row.condicionesGenerales ?? '',
    condicionesEspeciales: row.condicionesEspeciales ?? '',
    plantillaId: row.plantillaId,
    sedeId: row.sedeId,
  };
  vista.value = 'form';
}

async function guardar() {
  if (!form.value.contrato && !form.value.noInstruccion) {
    Notify.create({ type: 'warning', message: 'Ingresa al menos el contrato o número de instrucción' });
    return;
  }
  guardando.value = true;
  try {
    const payload = {
      ...form.value,
      noInstruccion: form.value.noInstruccion || form.value.contrato,
      sedeId: sedeId.value,
    };
    if (form.value.id) {
      await api.put(`/api/instrucciones-embarque/${form.value.id}`, payload);
      Notify.create({ type: 'positive', message: 'Instrucción actualizada', timeout: 2000 });
    } else {
      await api.post('/api/instrucciones-embarque', payload);
      Notify.create({ type: 'positive', message: 'Instrucción creada', timeout: 2000 });
    }
    await cargar();
    vista.value = 'historial';
  } catch {
    Notify.create({ type: 'negative', message: 'Error al guardar' });
  } finally {
    guardando.value = false;
  }
}

function imprimir() {
  Notify.create({ type: 'info', message: 'Módulo de reporte en desarrollo', timeout: 2000 });
}

onMounted(async () => {
  await Promise.all([cargar(), cargarCatalogos()]);
});
</script>

<style scoped>
/* ── KPI ────────────────────────────────────────────────── */
.ie-kpi-card     { background:#fff; border:1px solid #e8e8e8; border-radius:12px; padding:16px 18px; text-align:center; box-shadow:0 1px 4px rgba(0,0,0,.06); }
.ie-kpi-label    { font-size:11px; font-weight:700; letter-spacing:.8px; color:#9e9e9e; margin-bottom:4px; }
.ie-kpi-value    { font-size:22px; font-weight:800; color:#424242; }
.ie-kpi-sub      { font-size:11px; color:#9e9e9e; margin-top:2px; }
.ie-kpi-warning  { border-left:4px solid #f59e0b; }
.ie-kpi-info     { border-left:4px solid #3b82f6; }
.ie-kpi-success  { border-left:4px solid #10b981; }
.ie-kpi-error    { border-left:4px solid #ef4444; }
.ie-kpi-garbanzo { border-left:4px solid #d97706; }
.ie-kpi-frijol   { border-left:4px solid #78350f; }

/* ── Chips / Badges ──────────────────────────────────────── */
.ie-chip-producto { display:inline-block; font-size:11px; font-weight:700; padding:3px 12px; border-radius:20px; color:#fff; }
.ie-chip-g        { background:#d97706; }
.ie-chip-f        { background:#78350f; }

.ie-badge-status  { display:inline-block; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; color:#fff; }
.ie-status-warning { background:#f59e0b; }
.ie-status-info    { background:#3b82f6; }
.ie-status-success { background:#10b981; }
.ie-status-error   { background:#ef4444; }
.ie-status-default { background:#9e9e9e; }

/* ── Detalle ─────────────────────────────────────────────── */
.ie-det-label { font-size:11px; font-weight:700; letter-spacing:.6px; color:#9e9e9e; margin-bottom:4px; }
.ie-det-value { font-size:15px; color:#424242; }

/* ── Form labels ─────────────────────────────────────────── */
.ie-field-label { font-size:12px; color:#757575; }

/* ── Fecha display ───────────────────────────────────────── */
.ie-fecha-display {
  display:inline-flex; align-items:center; justify-content:space-between;
  gap:8px; border:1px solid #d0d0d0; border-radius:4px;
  padding:7px 12px; width:100%; cursor:pointer; background:#fff;
  transition: border-color .2s;
}
.ie-fecha-display:hover { border-color:#9e9e9e; }

/* ── Status radio grid ───────────────────────────────────── */
.ie-status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.ie-status-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  transition: all .15s;
  user-select: none;
}
.ie-status-option:hover { border-color: #bdbdbd; background: #fafafa; }

.ie-status-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background .15s;
}

.ie-status-text { font-size: 13px; color: #424242; }

/* Selected states */
.ie-status-selected-warning { background: #fffbeb; border-color: #f59e0b; }
.ie-status-selected-info    { background: #eff6ff; border-color: #3b82f6; }
.ie-status-selected-success { background: #f0fdf4; border-color: #10b981; }
.ie-status-selected-error   { background: #fef2f2; border-color: #ef4444; }
.ie-status-selected-grey    { background: #f5f5f5; border-color: #9e9e9e; }

/* ── Plantillas panel ────────────────────────────────────── */
.ie-plantillas-panel {
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 10px;
  padding: 14px 16px;
}
.ie-plantillas-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .6px;
  color: #64748b;
}
.ie-plantilla-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: default;
  transition: box-shadow .15s;
}
.ie-plantilla-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.ie-plantilla-titulo {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 4px;
}
.ie-plantilla-preview {
  font-size: 11px;
  color: #94a3b8;
  white-space: pre-wrap;
  max-height: 48px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
