<template>
  <q-page padding class="bg-grey-2">

    <!-- ══════════════════════════════════════════════════
         VISTA: HISTORIAL
    ═══════════════════════════════════════════════════ -->
    <template v-if="vista === 'historial'">

      <!-- Encabezado -->
      <div class="row items-center q-mb-lg">
        <q-btn flat round dense icon="arrow_back" color="grey-7"
          @click="router.back()" class="q-mr-sm" />
        <div class="text-h5 text-weight-bold text-grey-9">Instrucciones de Embarque</div>
      </div>

      <!-- KPI Cards -->
      <div class="ie-kpi-row q-mb-lg">
        <div class="ie-kpi2">
          <div class="ie-kpi2-icon" style="background:#f1f5f9">
            <q-icon name="local_shipping" size="22px" color="blue-grey-5" />
          </div>
          <div class="ie-kpi2-body">
            <div class="ie-kpi2-label">TOTAL</div>
            <div class="ie-kpi2-value">{{ stats.totalTons }} T</div>
            <div class="ie-kpi2-sub">{{ stats.total }} instrucciones</div>
          </div>
        </div>

        <div class="ie-kpi2">
          <div class="ie-kpi2-icon" style="background:#fef9c3">
            <q-icon name="schedule" size="22px" style="color:#d97706" />
          </div>
          <div class="ie-kpi2-body">
            <div class="ie-kpi2-label">PENDI...</div>
            <div class="ie-kpi2-value">{{ stats.pendiente }}</div>
            <div class="ie-kpi2-sub">{{ stats.tonsPendiente }} T</div>
          </div>
        </div>

        <div class="ie-kpi2">
          <div class="ie-kpi2-icon" style="background:#dbeafe">
            <q-icon name="directions_boat" size="22px" style="color:#2563eb" />
          </div>
          <div class="ie-kpi2-body">
            <div class="ie-kpi2-label">EN TR...</div>
            <div class="ie-kpi2-value">{{ stats.enTransito }}</div>
            <div class="ie-kpi2-sub">{{ stats.tonsTransito }} T</div>
          </div>
        </div>

        <div class="ie-kpi2">
          <div class="ie-kpi2-icon" style="background:#dcfce7">
            <q-icon name="check_circle_outline" size="22px" style="color:#16a34a" />
          </div>
          <div class="ie-kpi2-body">
            <div class="ie-kpi2-label">EMBA...</div>
            <div class="ie-kpi2-value">{{ stats.embarcado }}</div>
            <div class="ie-kpi2-sub">{{ stats.tonsEmbarcado }} T</div>
          </div>
        </div>

        <div class="ie-kpi2">
          <div class="ie-kpi2-icon" style="background:#fee2e2">
            <q-icon name="cancel" size="22px" style="color:#dc2626" />
          </div>
          <div class="ie-kpi2-body">
            <div class="ie-kpi2-label">CANC...</div>
            <div class="ie-kpi2-value">{{ stats.cancelado }}</div>
            <div class="ie-kpi2-sub">{{ stats.tonsCancelado }} T</div>
          </div>
        </div>

        <div class="ie-kpi2">
          <div class="ie-kpi2-icon" style="background:#fef3c7">
            <q-icon name="grain" size="22px" style="color:#d97706" />
          </div>
          <div class="ie-kpi2-body">
            <div class="ie-kpi2-label">GARB...</div>
            <div class="ie-kpi2-value">{{ stats.tonsGarbanzo }}</div>
            <div class="ie-kpi2-sub">{{ stats.garbanzo }} instrucciones</div>
          </div>
        </div>

        <div class="ie-kpi2">
          <div class="ie-kpi2-icon" style="background:#fde8d0">
            <q-icon name="spa" size="22px" style="color:#78350f" />
          </div>
          <div class="ie-kpi2-body">
            <div class="ie-kpi2-label">FRIJOL</div>
            <div class="ie-kpi2-value">{{ stats.tonsFrijol }}</div>
            <div class="ie-kpi2-sub">{{ stats.frijol }} instrucciones</div>
          </div>
        </div>
      </div>

      <!-- Tabla Card -->
      <div class="bg-white rounded-borders shadow-1" style="border:1px solid #e8e8e8">

        <!-- Barra de controles -->
        <div class="row items-center q-pa-md" style="gap:12px; flex-wrap:wrap">
          <div class="text-subtitle1 text-weight-bold text-grey-9">Historial</div>
          <q-space />
          <q-input v-model="buscar" dense outlined placeholder="Buscar contrato, cliente..."
            style="min-width:260px" clearable>
            <template v-slot:prepend><q-icon name="search" /></template>
          </q-input>
          <q-btn unelevated outline icon="tune" label="Filtros" color="grey-7"
            style="border-radius:8px; border:1px solid #d0d0d0"
            @click="mostrarFiltros = !mostrarFiltros" />
          <q-btn unelevated color="orange-7" icon="add" label="Nueva"
            style="border-radius:8px" @click="abrirNueva" />
        </div>

        <!-- Panel de filtros (desplegable) -->
        <div v-if="mostrarFiltros" class="row q-px-md q-pb-md q-gutter-sm items-center">
          <q-select v-model="filtroProducto" :options="['Garbanzo','Frijol']" dense outlined
            label="Producto" clearable style="min-width:130px" />
          <q-select v-model="filtroStatusEmbarque" :options="statusEmbarqueOpts" dense outlined
            label="Status Embarque" clearable style="min-width:160px" />
          <q-select v-model="filtroStatusDoc" :options="statusDocOpts" dense outlined
            label="Status Doc." clearable style="min-width:160px" />
          <q-btn v-if="filtrosActivos" flat dense icon="filter_alt_off" color="grey-6"
            @click="limpiarFiltros">
            <q-tooltip>Limpiar filtros</q-tooltip>
          </q-btn>
        </div>

        <q-separator />

        <!-- Tabla personalizada -->
        <div class="overflow-auto">
          <table class="ie-table">
            <thead>
              <tr>
                <th>#</th>
                <th>FECHA</th>
                <th>CONTRATO</th>
                <th>CLIENTE</th>
                <th>PRODUCTO</th>
                <th>CALIBRE</th>
                <th style="text-align:right">TONS</th>
                <th>EMBARQUE</th>
                <th>DOCUMENTACIÓN</th>
                <th>VER</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="cargando">
                <td colspan="10" class="text-center q-py-xl">
                  <q-spinner color="orange-6" size="36px" />
                </td>
              </tr>
              <tr v-else-if="historialFiltrado.length === 0">
                <td colspan="10" class="text-center text-grey-5 q-py-xl" style="font-size:13px">
                  Sin registros
                </td>
              </tr>
              <template v-else>
                <tr v-for="(row, idx) in historialFiltrado" :key="row.id">
                  <td class="ie-td-num">{{ idx + 1 }}</td>
                  <td>{{ formatFecha(row.fecha) }}</td>
                  <td><span class="ie-td-contrato">{{ row.contrato || '—' }}</span></td>
                  <td class="ie-td-cliente">{{ row.cliente || '—' }}</td>
                  <td>
                    <span class="ie-chip-producto"
                      :class="row.producto === 'Garbanzo' ? 'ie-chip-g' : 'ie-chip-f'">
                      {{ row.producto }}
                    </span>
                  </td>
                  <td>
                    <span v-if="row.calibre" class="ie-calibre-badge">{{ row.calibre }}</span>
                    <span v-else class="text-grey-4">—</span>
                  </td>
                  <td style="text-align:right; font-weight:600; padding-right:20px">{{ row.tons }}</td>
                  <td>
                    <span class="ie-dot-badge" :class="dotBadgeEmbarque(row.statusEmbarque)">
                      <span class="ie-dot"
                        :style="{ background: dotColorEmbarque(row.statusEmbarque, true) }"></span>
                      {{ row.statusEmbarque }}
                    </span>
                  </td>
                  <td>
                    <span class="ie-dot-badge" :class="dotBadgeDoc(row.statusDocumentacion)">
                      <span class="ie-dot"
                        :style="{ background: dotColorDoc(row.statusDocumentacion, true) }"></span>
                      {{ row.statusDocumentacion }}
                    </span>
                  </td>
                  <td class="text-center">
                    <q-btn flat round dense icon="visibility" color="blue-grey-5" size="sm"
                      @click="verDetalle(row)">
                      <q-tooltip>Ver detalle</q-tooltip>
                    </q-btn>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <q-separator />

        <!-- Footer -->
        <div class="row items-center justify-between q-px-md q-py-sm">
          <span class="text-caption text-grey-6">{{ totalTonsHistorial }} Tons totales</span>
          <span class="text-caption text-grey-6">
            {{ historialFiltrado.length }} de {{ historial.length }} registros
          </span>
        </div>
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
            <div class="row justify-between items-center">
              <q-btn unelevated icon="arrow_back" label="Regresar" color="grey-3"
                text-color="grey-8" style="border-radius:8px" @click="vista = 'historial'" />
              <div class="row q-gutter-sm">
                <q-btn unelevated color="orange-7" icon="print" label="Reporte"
                  style="border-radius:8px" @click="imprimir" />
                <q-btn unelevated color="teal-7" icon="edit" label="Editar"
                  style="border-radius:8px" @click="abrirEditar(detalle)" />
              </div>
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

    <!-- ══════════════════════════════════════════════════
         MODAL: REPORTE DE EMBARQUE
    ═══════════════════════════════════════════════════ -->
    <q-dialog v-model="modalReporte">
      <q-card style="width:520px; max-width:95vw; border-radius:16px; overflow:hidden">
        <!-- Header naranja -->
        <q-toolbar style="background:#f97316; color:#fff; padding:16px 20px">
          <q-icon name="description" size="sm" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-bold">Reporte de Embarque</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pt-lg q-pb-sm text-center">
          <div class="q-mb-md">
            <q-avatar size="72px" style="background:#fff3e0">
              <q-icon name="description" size="36px" color="orange-6" />
            </q-avatar>
          </div>
          <div class="text-h6 text-weight-bolder q-mb-sm">REPORTE DE EMBARQUE</div>
          <div class="text-body2 text-grey-6" style="max-width:380px; margin:0 auto">
            En este reporte se mostrará la información previamente capturada, incluyendo el cliente,
            producto, cantidad, número de contrato, así como la existencia actual y su ubicación correspondiente.
          </div>
        </q-card-section>

        <q-card-section class="q-px-lg q-pb-md">
          <div class="rounded-borders q-pa-md" style="background:#f9fafb; border:1px solid #e5e7eb">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Contrato</div>
                <div class="text-body2 text-weight-medium">{{ detalle?.contrato || '—' }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Ref. Alazán</div>
                <div class="text-body2 text-weight-medium">{{ detalle?.referenciaAlazan || '—' }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Cliente</div>
                <div class="text-body2 text-weight-medium" style="word-break:break-word">{{ detalle?.cliente || '—' }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Producto</div>
                <div class="text-body2 text-weight-medium">{{ detalle?.producto || '—' }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Calibre</div>
                <div class="text-body2 text-weight-medium">{{ detalle?.calibre || '—' }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Cantidad</div>
                <div class="text-body2 text-weight-medium">{{ detalle?.tons ? detalle.tons + ' Tons' : '—' }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Lugar Embarque</div>
                <div class="text-body2 text-weight-medium">{{ detalle?.lugarEmbarque || '—' }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Fecha Embarque</div>
                <div class="text-body2 text-weight-medium">{{ detalle?.fechaEmbarque || '—' }}</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-lg q-gutter-md">
          <q-btn unelevated label="Cancelar" color="grey-3" text-color="grey-8"
            style="border-radius:8px; min-width:120px" v-close-popup />
          <q-btn unelevated icon="print" label="Imprimir" style="background:#f97316; color:#fff; border-radius:8px; min-width:140px"
            @click="ejecutarImpresion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();
const router    = useRouter();
const sedeId    = computed(() => authStore.sedeActivaId ?? 0);

// ── Vistas ───────────────────────────────────────────────────
const vista          = ref<'historial' | 'detalle' | 'form'>('historial');
const modalReporte   = ref(false);
const mostrarFiltros = ref(false);

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

const totalTonsHistorial = computed(() =>
  historialFiltrado.value.reduce((s, r) => s + (r.tons || 0), 0));


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
    'Incompleto': 'ie-status-default', 'Completo': 'ie-status-orange', 'Enviado': 'ie-status-success',
  };
  return m[s] ?? 'ie-status-default';
}

function dotBadgeEmbarque(s: string) {
  const m: Record<string, string> = {
    'Pendiente': 'ie-dot-warning', 'En Tránsito': 'ie-dot-info',
    'Embarcado': 'ie-dot-success', 'Cancelado': 'ie-dot-error',
  };
  return m[s] ?? 'ie-dot-default';
}
function dotBadgeDoc(s: string) {
  const m: Record<string, string> = {
    'Incompleto': 'ie-dot-default', 'Completo': 'ie-dot-orange', 'Enviado': 'ie-dot-success',
  };
  return m[s] ?? 'ie-dot-default';
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
    'Incompleto': '#9e9e9e', 'Completo': '#f97316', 'Enviado': '#10b981',
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
  modalReporte.value = true;
}

function ejecutarImpresion() {
  window.print();
}

onMounted(async () => {
  await Promise.all([cargar(), cargarCatalogos()]);
});
</script>

<style scoped>
/* ── KPI v2 ──────────────────────────────────────────────── */
.ie-kpi-row {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 4px;
}
.ie-kpi2 {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px 16px;
  min-width: 120px;
  flex: 1;
  box-shadow: 0 1px 4px rgba(0,0,0,.05);
}
.ie-kpi2-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ie-kpi2-body { min-width: 0; }
.ie-kpi2-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .7px;
  color: #9e9e9e;
  margin-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ie-kpi2-value {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.1;
}
.ie-kpi2-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
  white-space: nowrap;
}

/* ── Chips / Badges ──────────────────────────────────────── */
.ie-chip-producto { display:inline-block; font-size:11px; font-weight:700; padding:3px 12px; border-radius:20px; color:#fff; }
.ie-chip-g        { background:#d97706; }
.ie-chip-f        { background:#78350f; }

.ie-badge-status   { display:inline-block; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; color:#fff; }
.ie-status-warning { background:#f59e0b; }
.ie-status-info    { background:#3b82f6; }
.ie-status-success { background:#10b981; }
.ie-status-error   { background:#ef4444; }
.ie-status-orange  { background:#f97316; }
.ie-status-default { background:#9e9e9e; }

/* ── Tabla personalizada ─────────────────────────────────── */
.ie-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.ie-table thead tr {
  border-bottom: 2px solid #f1f5f9;
}
.ie-table th {
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .6px;
  color: #94a3b8;
  text-align: left;
  white-space: nowrap;
}
.ie-table tbody tr {
  border-bottom: 1px solid #f8fafc;
  transition: background .1s;
}
.ie-table tbody tr:hover { background: #f8fafc; }
.ie-table td {
  padding: 12px 14px;
  color: #374151;
  vertical-align: middle;
}
.ie-td-num      { color: #9ca3af; font-weight: 600; width: 40px; }
.ie-td-contrato { color: #f97316; font-weight: 700; }
.ie-td-cliente  { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ie-calibre-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 6px;
  border: 1.5px solid #475569;
  color: #334155;
  background: transparent;
}

/* ── Dot badges ──────────────────────────────────────────── */
.ie-dot-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
}
.ie-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ie-dot-warning { background: #fef9c3; color: #a16207; }
.ie-dot-info    { background: #dbeafe; color: #1d4ed8; }
.ie-dot-success { background: #dcfce7; color: #166534; }
.ie-dot-error   { background: #fee2e2; color: #991b1b; }
.ie-dot-orange  { background: #fff7ed; color: #c2410c; }
.ie-dot-default { background: #f3f4f6; color: #6b7280; }

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
