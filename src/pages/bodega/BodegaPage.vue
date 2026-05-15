<template>
  <q-page class="bg-grey-1" style="min-height:100vh">

    <!-- ══════════════════════════════════════════════════
         VISTA: HISTORIAL
    ═══════════════════════════════════════════════════ -->
    <template v-if="vista === 'historial'">

      <!-- Header -->
      <div class="q-px-md q-pt-md q-pb-sm row items-center justify-between">
        <div class="text-h5 text-weight-bold text-grey-9">Bodega</div>
        <div class="row q-gutter-sm items-center">
          <q-input
            v-model="busqueda"
            dense outlined clearable
            placeholder="Buscar folio, producto, calibre, bodega…"
            style="min-width:260px"
          >
            <template #prepend><q-icon name="search" size="xs" color="grey-5" /></template>
          </q-input>
          <q-btn
            unelevated
            :color="filtrosActivos > 0 ? 'orange-7' : 'grey-3'"
            :text-color="filtrosActivos > 0 ? 'white' : 'grey-8'"
            icon="tune"
            label="Filtros"
            style="border-radius:8px"
            @click="panelFiltros = true"
          >
            <q-badge v-if="filtrosActivos > 0" color="white" text-color="orange-9" floating>{{ filtrosActivos }}</q-badge>
          </q-btn>
        </div>
      </div>

      <!-- Chips de filtros activos -->
      <div v-if="filtrosActivos > 0" class="q-px-md q-pb-xs row q-gutter-xs items-center">
        <q-chip v-if="filtroProducto" removable dense color="orange-1" text-color="orange-9" @remove="filtroProducto = ''">
          {{ filtroProducto }}
        </q-chip>
        <q-chip v-if="filtroCalibre" removable dense color="teal-1" text-color="teal-9" @remove="filtroCalibre = ''">
          Calibre: {{ filtroCalibre }}
        </q-chip>
        <q-chip v-if="filtroStatusProd" removable dense color="blue-1" text-color="blue-9" @remove="filtroStatusProd = ''">
          Prod: {{ filtroStatusProd }}
        </q-chip>
        <q-chip v-if="filtroStatusAsig" removable dense color="purple-1" text-color="purple-9" @remove="filtroStatusAsig = ''">
          Asig: {{ filtroStatusAsig }}
        </q-chip>
        <q-chip v-if="filtroBodega" removable dense color="green-1" text-color="green-9" @remove="filtroBodega = ''">
          {{ filtroBodega }}
        </q-chip>
        <q-btn flat dense size="xs" color="grey-6" label="Limpiar todo" @click="limpiarFiltros" />
      </div>

      <!-- KPI Cards -->
      <div class="q-px-md q-pb-sm">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-card flat bordered class="kpi-card">
              <q-card-section class="row items-center q-py-sm">
                <q-icon name="warehouse" size="36px" color="grey-4" class="q-mr-md" />
                <div>
                  <div class="text-caption text-grey-5 text-uppercase text-weight-bold">Total Clasificado</div>
                  <div class="text-h5 text-weight-bold text-grey-9">{{ kpiTotal.toFixed(1) }} T</div>
                  <div class="text-caption text-grey-5">{{ historial.length }} órdenes en bodega</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-4">
            <q-card flat bordered class="kpi-card cursor-pointer" @click="toggleFiltroProducto('Garbanzo')">
              <q-card-section class="q-py-sm">
                <div class="row items-center q-mb-xs">
                  <q-icon name="grain" size="20px" color="orange-4" class="q-mr-sm" />
                  <div class="text-caption text-grey-5 text-uppercase text-weight-bold">Garbanzo</div>
                </div>
                <div class="text-h5 text-weight-bold" style="color:#e65100">{{ kpiGarbanzo.toFixed(1) }} T</div>
                <q-linear-progress
                  :value="kpiTotal > 0 ? kpiGarbanzo / kpiTotal : 0"
                  color="orange-6" track-color="orange-1" class="q-mt-sm" rounded style="height:6px"
                />
                <div class="text-caption text-grey-5 q-mt-xs">{{ kpiTotal > 0 ? ((kpiGarbanzo / kpiTotal) * 100).toFixed(0) : 0 }}% del total</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-4">
            <q-card flat bordered class="kpi-card cursor-pointer" @click="toggleFiltroProducto('Frijol')">
              <q-card-section class="q-py-sm">
                <div class="row items-center q-mb-xs">
                  <q-icon name="spa" size="20px" color="purple-4" class="q-mr-sm" />
                  <div class="text-caption text-grey-5 text-uppercase text-weight-bold">Frijol</div>
                </div>
                <div class="text-h5 text-weight-bold" style="color:#6a1b9a">{{ kpiFrijol.toFixed(1) }} T</div>
                <q-linear-progress
                  :value="kpiTotal > 0 ? kpiFrijol / kpiTotal : 0"
                  color="purple-6" track-color="purple-1" class="q-mt-sm" rounded style="height:6px"
                />
                <div class="text-caption text-grey-5 q-mt-xs">{{ kpiTotal > 0 ? ((kpiFrijol / kpiTotal) * 100).toFixed(0) : 0 }}% del total</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Tarjetas de Bodegas (B1-B6) -->
      <div class="q-px-md q-pb-sm">
        <div class="text-caption text-grey-5 text-uppercase text-weight-bold q-mb-xs">TONELADAS POR BODEGA</div>
        <div class="row q-col-gutter-sm">
          <div
            v-for="b in statsBodegas" :key="b.bodegaId"
            class="col-6 col-sm-4 col-md-2"
          >
            <q-card
              flat bordered
              class="bodega-card text-center cursor-pointer"
              :class="{ 'bodega-card--active': filtroBodega === b.bodegaClave, 'bodega-card--empty': b.totalTons === 0 }"
              @click="toggleFiltroBodega(b.bodegaClave)"
            >
              <q-card-section class="q-py-sm q-px-xs">
                <div class="text-subtitle2 text-weight-bold" :class="b.totalTons > 0 ? 'text-grey-9' : 'text-grey-4'">
                  {{ b.bodegaClave }}
                </div>
                <div v-if="b.totalTons > 0" class="text-caption text-weight-bold text-orange-8">{{ b.totalTons.toFixed(0) }} T</div>
                <div v-else class="text-caption text-grey-4">—</div>
                <q-linear-progress
                  v-if="b.totalTons > 0"
                  :value="maxBodegaTons > 0 ? b.totalTons / maxBodegaTons : 0"
                  color="orange-5" track-color="grey-2" class="q-mt-xs" rounded style="height:4px"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Tabla Historial -->
      <div class="q-px-md q-pb-md">
        <q-card flat bordered>
          <q-table
            :rows="historialFiltrado"
            :columns="columnas"
            row-key="ordenId"
            flat
            :loading="loading"
            :rows-per-page-options="[10, 25, 50]"
            no-data-label="Sin registros"
          >
            <!-- # -->
            <template #body-cell-num="{ rowIndex }">
              <q-td style="width:40px;color:#9e9e9e">{{ rowIndex + 1 }}</q-td>
            </template>

            <!-- Fecha -->
            <template #body-cell-fecha="{ row }">
              <q-td>{{ formatFecha(row.fecha) }}</q-td>
            </template>

            <!-- Folio -->
            <template #body-cell-folio="{ row }">
              <q-td class="text-weight-bold" style="color:#e65100">{{ row.folio }}</q-td>
            </template>

            <!-- Producto -->
            <template #body-cell-producto="{ row }">
              <q-td>
                <q-chip
                  dense
                  :color="row.producto === 'Garbanzo' ? 'orange-2' : 'purple-2'"
                  :text-color="row.producto === 'Garbanzo' ? 'orange-9' : 'purple-9'"
                  class="text-weight-bold"
                  style="font-size:11px"
                >
                  {{ row.producto || '—' }}
                </q-chip>
              </q-td>
            </template>

            <!-- Calibre: solo el valor (sin "QZ AM", "QZ ESP", etc.) -->
            <template #body-cell-calibre="{ row }">
              <q-td>{{ formatCalibre(row.calibre) }}</q-td>
            </template>

            <!-- Cantidad -->
            <template #body-cell-cantidadTons="{ row }">
              <q-td class="text-weight-bold">
                {{ row.cantidadTons > 0 ? `${row.cantidadTons} Tons` : '—' }}
              </q-td>
            </template>

            <!-- Status Producción -->
            <template #body-cell-statusProduccion="{ row }">
              <q-td>
                <q-badge
                  :color="row.statusProduccion === 'Resultado Registrado' ? 'green-1' : 'orange-1'"
                  :text-color="row.statusProduccion === 'Resultado Registrado' ? 'green-9' : 'orange-9'"
                  class="q-px-sm q-py-xs"
                  style="border-radius:20px; font-size:11px"
                >
                  <q-icon
                    :name="row.statusProduccion === 'Resultado Registrado' ? 'circle' : 'circle'"
                    size="8px" class="q-mr-xs"
                    :color="row.statusProduccion === 'Resultado Registrado' ? 'green-7' : 'orange-7'"
                  />
                  {{ row.statusProduccion === 'Resultado Registrado' ? 'Terminado' : 'En Proceso' }}
                </q-badge>
              </q-td>
            </template>

            <!-- Status Asignación -->
            <template #body-cell-statusAsignacion="{ row }">
              <q-td>
                <q-badge
                  :color="badgeColorAsig(row.statusAsignacion).bg"
                  :text-color="badgeColorAsig(row.statusAsignacion).text"
                  class="q-px-sm q-py-xs"
                  style="border-radius:20px; font-size:11px"
                >
                  <q-icon name="circle" size="8px" class="q-mr-xs" :color="badgeColorAsig(row.statusAsignacion).dot" />
                  {{ row.statusAsignacion }}
                </q-badge>
              </q-td>
            </template>

            <!-- Acciones -->
            <template #body-cell-acciones="{ row }">
              <q-td class="text-right">
                <q-btn v-if="row.statusAsignacion !== 'Terminado'" flat round dense icon="edit" size="sm" color="orange-7" @click="abrirAsignacion(row)">
                  <q-tooltip>Asignar ubicación en bodega</q-tooltip>
                </q-btn>
                <q-btn flat round dense icon="visibility" size="sm" color="grey-6" @click="abrirDetalle(row)">
                  <q-tooltip>Ver detalle</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card>
        <div class="text-caption text-grey-5 q-mt-xs q-px-xs">
          {{ historialFiltrado.length }} de {{ historial.length }} registros
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════
         VISTA: ASIGNACIÓN
    ═══════════════════════════════════════════════════ -->
    <template v-else-if="vista === 'asignacion'">

      <!-- Top bar -->
      <div class="row items-center q-px-lg q-pt-lg q-pb-md q-gutter-sm">
        <q-btn flat round dense icon="arrow_back" color="grey-7" @click="vista = 'historial'" />
        <span class="text-h6 text-weight-bold text-grey-9">Bodega</span>
      </div>

      <div class="q-px-lg q-pb-xl">
        <div class="asig-card">

          <!-- ── Card header ── -->
          <div class="asig-card__header">
            <div>
              <div class="text-subtitle1 text-weight-bold text-grey-9">Asignar Ubicación</div>
              <div class="text-body2 q-mt-xs text-grey-7">
                Producción <span class="text-weight-bold text-orange-8">{{ ordenActual?.folio }}</span>
              </div>
              <div class="row q-gutter-md q-mt-xs">
                <div v-if="totalMpOrden > 0" class="text-caption text-grey-6">
                  Total MP: <span class="text-weight-bold text-grey-8">{{ (totalMpOrden * 1000).toLocaleString('es-MX') }} kg</span>
                </div>
                <div v-if="totalMpOrden > 0" class="text-caption"
                  :class="tonsDisponibles <= 0 ? 'text-negative text-weight-bold' : 'text-grey-6'">
                  Disponible: <span class="text-weight-bold">{{ tonsDisponibles.toLocaleString('es-MX') }} kg</span>
                </div>
              </div>
              <div v-if="autosaveStatus" class="text-caption text-grey-5 q-mt-xs">
                <q-icon name="cloud_done" size="12px" class="q-mr-xs" />{{ autosaveStatus }}
              </div>
            </div>

            <!-- Date picker: q-dialog teleporta al body → no le afecta overflow:hidden -->
            <div class="row items-center" style="gap:10px">
              <span class="text-caption text-grey-6" style="font-size:13px">Fecha</span>
              <div class="asig-fecha-display" @click="popupFechaAsig = true">
                <span :style="{ color: asignacionFecha ? '#424242' : '#bdbdbd', fontSize:'13px' }">
                  {{ asignacionFecha || 'dd/mm/aaaa' }}
                </span>
                <q-icon name="event" size="18px" color="grey-5" />
                <q-btn v-if="asignacionFecha" flat round dense icon="close" size="xs" color="grey-4"
                  @click.stop="asignacionFecha = ''" style="margin-left:2px" />
              </div>
            </div>

            <!-- Dialog del calendario (fuera de asig-card para evitar overflow:hidden) -->
            <q-dialog v-model="popupFechaAsig">
              <q-date v-model="asignacionFecha" mask="DD/MM/YYYY" :locale="localeEs" today-btn
                @update:model-value="popupFechaAsig = false">
                <div class="row items-center justify-between q-px-md q-pb-sm">
                  <q-btn flat dense size="sm" color="grey-6" label="Limpiar"
                    @click="asignacionFecha = ''; popupFechaAsig = false" />
                  <q-btn v-close-popup flat label="Listo" color="orange-7" />
                </div>
              </q-date>
            </q-dialog>
          </div>

          <!-- ── Separator ── -->
          <div style="height:1px; background:#f0f0f0" />

          <!-- ── Items ── -->
          <div class="q-pa-lg" style="display:flex; flex-direction:column; gap:16px">
            <div v-for="(item, iIdx) in asignacionItems" :key="iIdx" class="asig-item">

              <!-- Item header row -->
              <div class="asig-item__header"
                :style="{ background: item.tipo === 'producto' ? '#fff3e0' : '#eef0fb' }">

                <div class="asig-tipo-chip"
                  :style="{ background: item.tipo === 'producto' ? '#fb8c00' : '#7986cb' }">
                  {{ item.tipo === 'producto' ? 'Producto' : 'Subproducto' }}
                </div>

                <!-- Nombre -->
                <q-select
                  v-model="item.nombre"
                  :options="item.tipo === 'producto' ? ['Garbanzo','Frijol'] : catalogos.subproductos.map(s => s.nombre)"
                  dense outlined bg-color="white"
                  :label="item.tipo === 'producto' ? 'Producto' : 'Subproducto'"
                  style="min-width:140px; flex:1; max-width:200px"
                />

                <!-- Presentación -->
                <q-select
                  v-model="item.presentacionId"
                  :options="catalogos.presentaciones"
                  option-value="id" option-label="nombre"
                  emit-value map-options
                  dense outlined bg-color="white"
                  label="Presentación"
                  style="min-width:110px; flex:1; max-width:160px"
                />

                <!-- Tipo costal -->
                <q-select
                  v-model="item.tipoCostalId"
                  :options="catalogos.tiposCostal"
                  option-value="id" option-label="nombre"
                  emit-value map-options
                  dense outlined bg-color="white"
                  label="Tipo de costal"
                  style="min-width:150px; flex:2; max-width:260px"
                />

                <div style="margin-left:auto; display:flex; align-items:center; gap:6px; flex-shrink:0">
                  <q-btn v-if="item.tipo === 'subproducto'"
                    flat round dense icon="delete" size="sm" color="red-3"
                    @click="eliminarItem(iIdx)" />
                </div>
              </div>

              <!-- Bodega rows -->
              <div class="q-px-md q-pt-xs q-pb-sm">
                <div v-for="(fila, fIdx) in item.filas" :key="fIdx"
                  class="row items-center q-gutter-sm q-mb-xs">
                  <q-select v-model="fila.bodegaId"
                    :options="catalogos.bodegas" option-value="id" option-label="clave"
                    emit-value map-options dense outlined label="Bodega" style="width:120px" />
                  <q-select v-model="fila.cuadranteId"
                    :options="cuadrantesDisponibles(iIdx, fIdx)" option-value="id" option-label="clave"
                    emit-value map-options dense outlined label="Cuadrante" style="width:110px" />
                  <q-input v-model.number="fila.cantidad"
                    dense outlined type="number" label="Cantidad" class="col"
                    :color="sumaFila(item) > efectivoMax(item) ? 'negative' : 'primary'" />
                  <q-btn flat round dense icon="remove_circle_outline" size="sm" color="grey-4"
                    :disable="item.filas.length <= 1" @click="eliminarFila(iIdx, fIdx)" />
                </div>

                <!-- + btn + asignados counter -->
                <div class="row items-center q-gutter-sm q-mt-sm q-mb-xs">
                  <q-btn round unelevated color="positive" icon="add" size="sm" @click="agregarFila(iIdx)" />
                  <span
                    class="text-caption text-weight-bold"
                    :class="sumaFila(item) > efectivoMax(item) ? 'text-negative' : 'text-grey-6'"
                  >
                    {{ formatNum(sumaFila(item)) }} / {{ formatNum(efectivoMax(item)) }} asignados
                  </span>
                </div>
              </div>

              <!-- Progress bar -->
              <q-linear-progress
                :value="efectivoMax(item) > 0 ? Math.min(sumaFila(item) / efectivoMax(item), 1) : 0"
                :color="sumaFila(item) > efectivoMax(item) ? 'negative' : 'positive'"
                track-color="grey-2"
                style="height:5px"
              />
            </div>
          </div>

          <!-- Agregar subproducto -->
          <div class="q-px-lg q-pb-lg">
            <q-btn outline color="blue-grey-4" no-caps label="+ Agregar Subproducto"
              style="border-radius:8px; border-style:dashed; min-width:220px"
              :disable="tonsDisponibles <= 0"
              @click="agregarSubproducto" />
          </div>
        </div>

        <!-- Guardar -->
        <div class="row justify-center q-mt-lg">
          <q-btn unelevated color="orange-7" label="Guardar" no-caps
            :loading="guardando" @click="guardarAsignacion"
            style="border-radius:10px; font-size:15px; min-width:200px; height:46px; font-weight:700" />
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════
         DIÁLOGO: PANEL DE FILTROS
    ═══════════════════════════════════════════════════ -->
    <q-dialog v-model="panelFiltros" position="right" full-height>
      <q-card style="width:300px; max-width:95vw; border-radius:0; display:flex; flex-direction:column">

        <q-card-section class="row items-center q-pb-sm">
          <div class="text-subtitle1 text-weight-bold">Filtros avanzados</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="col q-gutter-y-md" style="overflow-y:auto">

          <!-- PRODUCTO -->
          <div>
            <div class="filtro-label">PRODUCTO</div>
            <div class="row q-gutter-sm">
              <q-btn v-for="p in ['Garbanzo','Frijol']" :key="p"
                :label="p" dense unelevated
                :color="filtroProducto === p ? 'orange-7' : 'white'"
                :text-color="filtroProducto === p ? 'white' : 'grey-8'"
                :outline="filtroProducto !== p"
                style="border-radius:8px; flex:1"
                @click="filtroProducto = filtroProducto === p ? '' : p"
              />
            </div>
          </div>

          <!-- CALIBRE -->
          <div>
            <div class="filtro-label">CALIBRE</div>

            <!-- Garbanzo OZ -->
            <div class="text-caption text-grey-5 q-mb-xs">Garbanzo (OZ)</div>
            <div class="row q-gutter-xs q-mb-sm">
              <q-btn v-for="c in calibresGarbanzo" :key="c"
                :label="c" dense unelevated
                :color="filtroCalibre === c ? 'orange-7' : 'white'"
                :text-color="filtroCalibre === c ? 'white' : 'grey-8'"
                :outline="filtroCalibre !== c"
                style="border-radius:16px; font-size:12px; min-width:52px"
                @click="filtroCalibre = filtroCalibre === c ? '' : c"
              />
            </div>

            <!-- Frijol granos/100g -->
            <div class="text-caption text-grey-5 q-mb-xs">Frijol (granos/100g)</div>
            <div class="row q-gutter-xs">
              <q-btn v-for="c in calibresFrijol" :key="c"
                :label="c" dense unelevated
                :color="filtroCalibre === c ? 'purple-7' : 'white'"
                :text-color="filtroCalibre === c ? 'white' : 'grey-8'"
                :outline="filtroCalibre !== c"
                style="border-radius:16px; font-size:12px; min-width:52px"
                @click="filtroCalibre = filtroCalibre === c ? '' : c"
              />
            </div>
          </div>

          <!-- STATUS PRODUCCIÓN -->
          <div>
            <div class="filtro-label">STATUS PRODUCCIÓN</div>
            <div class="row q-gutter-sm">
              <q-btn v-for="s in ['En Proceso','Terminado']" :key="s"
                :label="s" dense unelevated
                :color="filtroStatusProd === s ? 'blue-grey-9' : 'white'"
                :text-color="filtroStatusProd === s ? 'white' : 'grey-8'"
                :outline="filtroStatusProd !== s"
                style="border-radius:8px; flex:1"
                @click="filtroStatusProd = filtroStatusProd === s ? '' : s"
              />
            </div>
          </div>

          <!-- STATUS ASIGNACIÓN -->
          <div>
            <div class="filtro-label">STATUS ASIGNACIÓN</div>
            <div class="row q-gutter-sm">
              <q-btn v-for="s in ['No Asignado','Asignado','Terminado']" :key="s"
                :label="s" dense unelevated
                :color="filtroStatusAsig === s ? 'purple-8' : 'white'"
                :text-color="filtroStatusAsig === s ? 'white' : 'grey-8'"
                :outline="filtroStatusAsig !== s"
                style="border-radius:8px"
                @click="filtroStatusAsig = filtroStatusAsig === s ? '' : s"
              />
            </div>
          </div>

        </q-card-section>

        <!-- Botones -->
        <div class="row q-pa-md q-gutter-sm" style="border-top:1px solid #f0f0f0">
          <q-btn flat color="grey-7" label="Cancelar" class="col" v-close-popup
            style="border-radius:8px; border:1px solid #ddd" @click="limpiarFiltros" />
          <q-btn unelevated color="orange-7" label="Aplicar" class="col" v-close-popup
            style="border-radius:8px" />
        </div>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════════════
         DIÁLOGO: DETALLE DE BODEGA
    ═══════════════════════════════════════════════════ -->
    <q-dialog v-model="detalleDialog" persistent>
      <q-card style="min-width:360px; max-width:95vw">
        <q-card-section class="row items-center" style="background:#ff6900">
          <div class="text-h6 text-white text-weight-bold">Detalle de Bodega</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup text-color="white" />
        </q-card-section>

        <q-card-section v-if="ordenDetalle" class="q-pa-md">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <div class="text-caption text-grey-5 text-uppercase">Folio Producción</div>
              <div class="text-subtitle2 text-weight-bold text-orange-8">{{ ordenDetalle.folio }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-5 text-uppercase">Fecha</div>
              <div class="text-subtitle2">{{ formatFecha(ordenDetalle.fecha) }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-5 text-uppercase">Producto</div>
              <div class="text-subtitle2" :class="ordenDetalle.producto === 'Garbanzo' ? 'text-orange-8' : 'text-purple-8'">
                {{ ordenDetalle.producto || '—' }}
              </div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-5 text-uppercase">Calibre</div>
              <div class="text-subtitle2">{{ ordenDetalle.calibre || '—' }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-5 text-uppercase">Cantidad</div>
              <div class="text-subtitle2 text-weight-bold text-blue-8">
                {{ ordenDetalle.cantidadTons > 0 ? `${ordenDetalle.cantidadTons} Tons` : '—' }}
              </div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-5 text-uppercase">Ubicación</div>
              <div class="text-subtitle2">{{ ordenDetalle.ubicacion }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-5 text-uppercase">Status Producción</div>
              <q-badge
                :color="ordenDetalle.statusProduccion === 'Resultado Registrado' ? 'green-1' : 'orange-1'"
                :text-color="ordenDetalle.statusProduccion === 'Resultado Registrado' ? 'green-9' : 'orange-9'"
                class="q-px-sm q-py-xs" style="border-radius:20px"
              >
                {{ ordenDetalle.statusProduccion === 'Resultado Registrado' ? 'Terminado' : 'En Proceso' }}
              </q-badge>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-5 text-uppercase">Status Asignación</div>
              <q-badge
                :color="badgeColorAsig(ordenDetalle.statusAsignacion).bg"
                :text-color="badgeColorAsig(ordenDetalle.statusAsignacion).text"
                class="q-px-sm q-py-xs" style="border-radius:20px"
              >
                {{ ordenDetalle.statusAsignacion }}
              </q-badge>
            </div>
          </div>

          <!-- Mapas de bodega -->
          <template v-if="mapasBodega.length > 0">
            <div v-for="mapa in mapasBodega" :key="mapa.bodegaClave" class="q-mb-md">
              <div class="text-caption text-grey-5 text-uppercase text-weight-bold q-mb-xs">
                MAPA — {{ mapa.bodegaClave }}
              </div>
              <div class="row q-gutter-xs">
                <div
                  v-for="c in catalogos.cuadrantes" :key="c.id"
                  class="mapa-cuadrante flex flex-center text-weight-bold"
                  :class="mapa.cuadrantes.some(q => q.clave === c.clave) ? 'mapa-cuadrante--active' : 'mapa-cuadrante--empty'"
                  style="flex-direction:column; gap:1px"
                >
                  <span>{{ c.clave }}</span>
                  <span v-if="mapa.cuadrantes.some(q => q.clave === c.clave)"
                    class="text-caption" style="font-size:9px; font-weight:400; opacity:.85">
                    {{ (mapa.cuadrantes.find(q => q.clave === c.clave)?.cantidad ?? 0).toLocaleString('es-MX') }} kg
                  </span>
                </div>
              </div>
            </div>
          </template>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn unelevated color="grey-7" label="Cerrar" v-close-popup style="border-radius:8px" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';

const $q        = useQuasar();
const authStore = useAuthStore();
const sedeId    = computed(() => authStore.sedeActivaId ?? 0);

// ─── Tipos ────────────────────────────────────────────────────────
interface HistorialRow {
  ordenId: number; folio: string; fecha: string;
  statusProduccion: string; calibre: string; producto: string;
  asignacionId: number; fechaAsignacion: string | null;
  statusAsignacion: string; cantidadTons: number; ubicacion: string;
  totalMpSuministrada: number; presentacionId: number | null;
}
interface CuadranteEnUso { bodegaId: number; cuadranteId: number }
interface CatItem     { id: number; nombre: string }
interface CatConClave { id: number; clave: string; nombre: string }
interface Catalogos {
  bodegas: CatConClave[]; cuadrantes: CatConClave[];
  presentaciones: CatItem[]; tiposCostal: CatItem[]; subproductos: CatItem[];
}
interface FilaForm   { bodegaId: number | null; cuadranteId: number | null; cantidad: number | null }
interface ItemForm   {
  tipo: 'producto' | 'subproducto'; nombre: string;
  presentacionId: number | null; tipoCostalId: number | null;
  cantidadTotal: number; filas: FilaForm[];
}
interface StatsBodega { bodegaId: number; bodegaClave: string; bodegaNombre: string; totalTons: number }

// ─── Estado ───────────────────────────────────────────────────────
const vista       = ref<'historial' | 'asignacion'>('historial');
const loading     = ref(false);
const guardando   = ref(false);
const historial   = ref<HistorialRow[]>([]);
const statsBodegas = ref<StatsBodega[]>([]);
const catalogos   = ref<Catalogos>({ bodegas: [], cuadrantes: [], presentaciones: [], tiposCostal: [], subproductos: [] });

// Filtros
const busqueda         = ref('');
const filtroProducto   = ref('');
const filtroCalibre    = ref('');
const filtroStatusProd = ref('');
const filtroStatusAsig = ref('');
const filtroBodega     = ref('');
const panelFiltros     = ref(false);

const calibresGarbanzo = ['34/36','36/38','40/42','42/44','44/46','46/48','48/50','48/52'];
const calibresFrijol   = ['Hasta 70','71-75','76-80','81-85','86-90','91-95','>96'];

// Asignación
const ordenActual      = ref<HistorialRow | null>(null);
const asignacionFecha  = ref('');
const asignacionItems  = ref<ItemForm[]>([]);
const popupFechaAsig   = ref(false);

// Detalle
const detalleDialog  = ref(false);
const ordenDetalle   = ref<HistorialRow | null>(null);
const mapasBodega    = ref<{ bodegaClave: string; cuadrantes: { clave: string; cantidad: number }[] }[]>([]);

// Cuadrantes ocupados por otras órdenes (Tarea 18.2)
const cuadrantesEnUso = ref<CuadranteEnUso[]>([]);

// Autoguardado bodega (Tarea 18.2)
const autosaveStatus = ref('');
let autosaveTimeout: ReturnType<typeof setTimeout> | null = null;

const localeEs = {
  days: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  daysShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  months: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthsShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
};

// ─── Computed ─────────────────────────────────────────────────────
const filtrosActivos = computed(() =>
  [filtroProducto.value, filtroCalibre.value, filtroStatusProd.value, filtroStatusAsig.value, filtroBodega.value]
    .filter(Boolean).length);

const historialFiltrado = computed(() => {
  let lista = historial.value;
  const q = busqueda.value.toLowerCase().trim();

  if (q) lista = lista.filter(r =>
    r.folio.toLowerCase().includes(q) ||
    r.producto.toLowerCase().includes(q) ||
    (r.calibre || '').toLowerCase().includes(q) ||
    (r.ubicacion || '').toLowerCase().includes(q));

  if (filtroProducto.value) lista = lista.filter(r => r.producto === filtroProducto.value);

  if (filtroCalibre.value)
    lista = lista.filter(r => formatCalibre(r.calibre) === filtroCalibre.value);

  if (filtroStatusProd.value === 'Terminado')
    lista = lista.filter(r => r.statusProduccion === 'Resultado Registrado');
  else if (filtroStatusProd.value === 'En Proceso')
    lista = lista.filter(r => r.statusProduccion !== 'Resultado Registrado');

  if (filtroStatusAsig.value) lista = lista.filter(r => r.statusAsignacion === filtroStatusAsig.value);

  if (filtroBodega.value) lista = lista.filter(r => (r.ubicacion || '').includes(filtroBodega.value));

  return lista;
});

const kpiTotal    = computed(() => historial.value.reduce((s, r) => s + (r.cantidadTons || 0), 0));
const kpiGarbanzo = computed(() => historial.value.filter(r => r.producto === 'Garbanzo').reduce((s, r) => s + (r.cantidadTons || 0), 0));
const kpiFrijol   = computed(() => historial.value.filter(r => r.producto === 'Frijol').reduce((s, r) => s + (r.cantidadTons || 0), 0));
const maxBodegaTons = computed(() => Math.max(...statsBodegas.value.map(b => b.totalTons), 1));

// ─── Columnas tabla ───────────────────────────────────────────────
const columnas = [
  { name: 'num',            label: '#',              field: 'ordenId',          sortable: false, align: 'left'  as const },
  { name: 'fecha',          label: 'Fecha',          field: 'fecha',            sortable: true,  align: 'left'  as const },
  { name: 'folio',          label: 'Folio Producción', field: 'folio',          sortable: true,  align: 'left'  as const },
  { name: 'producto',       label: 'Producto',       field: 'producto',         sortable: true,  align: 'left'  as const },
  { name: 'calibre',        label: 'Calibre',        field: 'calibre',          sortable: true,  align: 'left'  as const },
  { name: 'cantidadTons',   label: 'Cantidad',       field: 'cantidadTons',     sortable: true,  align: 'left'  as const },
  { name: 'ubicacion',      label: 'Ubicación',      field: 'ubicacion',        sortable: false, align: 'left'  as const },
  { name: 'statusProduccion', label: 'Status Prod.', field: 'statusProduccion', sortable: true,  align: 'left'  as const },
  { name: 'statusAsignacion', label: 'Status Asig.', field: 'statusAsignacion', sortable: true,  align: 'left'  as const },
  { name: 'acciones',       label: 'Ver',            field: 'acciones',         sortable: false, align: 'right' as const },
];

// ─── Helpers ──────────────────────────────────────────────────────
function formatFecha(f: string | null | undefined): string {
  if (!f) return '—';
  try { return new Date(f).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return f; }
}

function badgeColorAsig(status: string) {
  if (status === 'Terminado') return { bg: 'green-1', text: 'green-9', dot: 'green-7' };
  if (status === 'Asignado')  return { bg: 'blue-1',  text: 'blue-9',  dot: 'blue-7'  };
  return { bg: 'grey-2', text: 'grey-7', dot: 'grey-5' };
}

function sumaFila(item: ItemForm): number {
  return item.filas.reduce((s, f) => s + (f.cantidad || 0), 0);
}

function efectivoMax(item: ItemForm): number {
  if (item.tipo === 'producto') return totalMpOrden.value * 1000;
  return tonsDisponibles.value;
}

function formatNum(val: number): string {
  return val.toLocaleString('es-MX');
}

// Tarea 18.1: totalMP de la orden actual y tons disponibles
const totalMpOrden = computed(() => ordenActual.value?.totalMpSuministrada ?? 0);
const tonsAsignadas = computed(() =>
  asignacionItems.value
    .filter(i => i.tipo === 'producto')
    .reduce((s, i) => s + sumaFila(i), 0)
);
const tonsDisponibles = computed(() => Math.max(0, totalMpOrden.value * 1000 - tonsAsignadas.value));

// Tarea 18.2: cuadrantes disponibles para una fila (excluye otras órdenes y otras filas del mismo ítem)
function cuadrantesDisponibles(iIdx: number, fIdx: number): CatConClave[] {
  const item = asignacionItems.value[iIdx];
  const fila = item?.filas[fIdx];
  if (!item || !fila?.bodegaId) return catalogos.value.cuadrantes;

  const usadosOtrasOrdenes = new Set(
    cuadrantesEnUso.value
      .filter(c => c.bodegaId === fila.bodegaId)
      .map(c => c.cuadranteId)
  );
  const usadosEstaOrden = new Set(
    item.filas
      .filter((f, fi) => fi !== fIdx && f.bodegaId === fila.bodegaId && f.cuadranteId)
      .map(f => f.cuadranteId)
  );
  return catalogos.value.cuadrantes.filter(
    c => !usadosOtrasOrdenes.has(c.id) && !usadosEstaOrden.has(c.id)
  );
}

/** Quita prefijos "QZ AM ", "QZ ESP ", "OZ AM:", "OZ ESP:" del calibre */
function formatCalibre(cal: string | undefined | null): string {
  if (!cal) return '—';
  // Formato "QZ AM 44/46" o "OZ AM:34/36,40/42|OZ ESP:42/44"
  const seg   = cal.split('|')[0] ?? '';
  const clean = seg.replace(/^[A-Z]{2}\s+[A-Z]{2,3}[:\s]*/i, '').split(',')[0] ?? '';
  return clean.trim() || '—';
}

function toggleFiltroProducto(p: string) {
  filtroProducto.value = filtroProducto.value === p ? '' : p;
}

function toggleFiltroBodega(clave: string) {
  filtroBodega.value = filtroBodega.value === clave ? '' : clave;
}

function limpiarFiltros() {
  filtroProducto.value   = '';
  filtroCalibre.value    = '';
  filtroStatusProd.value = '';
  filtroStatusAsig.value = '';
  filtroBodega.value     = '';
  busqueda.value         = '';
}

// ─── Carga de datos ───────────────────────────────────────────────
async function cargarHistorial() {
  loading.value = true;
  try {
    const [hist, stats] = await Promise.all([
      api.get('/api/bodega/historial', { params: { sedeId: sedeId.value } }),
      api.get('/api/bodega/stats',     { params: { sedeId: sedeId.value } }),
    ]);
    historial.value    = Array.isArray(hist.data) ? hist.data : [];
    statsBodegas.value = Array.isArray(stats.data?.porBodega) ? stats.data.porBodega : [];
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar historial de bodega' });
  } finally {
    loading.value = false;
  }
}

async function cargarCatalogos() {
  try {
    const { data } = await api.get('/api/bodega/catalogos', { params: { sedeId: sedeId.value } });
    catalogos.value = {
      bodegas:       Array.isArray(data.bodegas)       ? data.bodegas       : [],
      cuadrantes:    Array.isArray(data.cuadrantes)    ? data.cuadrantes    : [],
      presentaciones: Array.isArray(data.presentaciones) ? data.presentaciones : [],
      tiposCostal:   Array.isArray(data.tiposCostal)   ? data.tiposCostal   : [],
      subproductos:  Array.isArray(data.subproductos)  ? data.subproductos  : [],
    };
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar catálogos de bodega' });
  }
}

// ─── Asignación ───────────────────────────────────────────────────
async function abrirAsignacion(row: HistorialRow) {
  ordenActual.value = row;
  asignacionFecha.value = '';
  asignacionItems.value = [];
  autosaveStatus.value = '';

  // Cargar cuadrantes en uso por otras órdenes (Tarea 18.2)
  try {
    const { data } = await api.get<CuadranteEnUso[]>('/api/bodega/cuadrantes-en-uso', {
      params: { sedeId: sedeId.value, excludeOrdenId: row.ordenId }
    });
    cuadrantesEnUso.value = data;
  } catch { cuadrantesEnUso.value = []; }

  // Intentar cargar asignación existente
  try {
    const { data } = await api.get(`/api/bodega/asignacion/${row.ordenId}`);
    if (data) {
      asignacionFecha.value = data.asignacion?.fecha
        ? data.asignacion.fecha.split('-').reverse().join('/')
        : '';

      asignacionItems.value = (data.items || []).map((item: Record<string,unknown>) => ({
        tipo:           item.tipo as 'producto' | 'subproducto',
        nombre:         item.nombre as string,
        presentacionId: item.presentacionId as number | null,
        tipoCostalId:   item.tipoCostalId as number | null,
        cantidadTotal:  item.cantidadTotal as number ?? 0,
        filas: (data.detalle || [])
          .filter((d: Record<string,unknown>) => d.itemId === item.id)
          .map((d: Record<string,unknown>) => ({
            bodegaId:    d.bodegaId as number,
            cuadranteId: d.cuadranteId as number,
            cantidad:    d.cantidad as number,
          })),
      }));
      asignacionItems.value.forEach(it => { if (!it.filas.length) it.filas.push({ bodegaId: null, cuadranteId: null, cantidad: null }); });
    }
  } catch { /* sin asignación previa */ }

  // Si no hay items, inicializar auto-llenando desde la orden de producción (Tarea 18.1)
  if (!asignacionItems.value.length) {
    asignacionItems.value = [{
      tipo: 'producto',
      nombre: row.producto || 'Garbanzo',
      presentacionId: row.presentacionId ?? null,
      tipoCostalId: null,
      cantidadTotal: row.totalMpSuministrada ?? 0,
      filas: [{ bodegaId: null, cuadranteId: null, cantidad: null }],
    }];
  }

  vista.value = 'asignacion';
}

function agregarSubproducto() {
  asignacionItems.value.push({
    tipo: 'subproducto',
    nombre: catalogos.value.subproductos[0]?.nombre ?? '',
    presentacionId: null,
    tipoCostalId: null,
    cantidadTotal: 0,
    filas: [{ bodegaId: null, cuadranteId: null, cantidad: null }],
  });
}

function eliminarItem(idx: number) {
  asignacionItems.value.splice(idx, 1);
}

function agregarFila(iIdx: number) {
  asignacionItems.value[iIdx]?.filas.push({ bodegaId: null, cuadranteId: null, cantidad: null });
}

function eliminarFila(iIdx: number, fIdx: number) {
  asignacionItems.value[iIdx]?.filas.splice(fIdx, 1);
}

// Tarea 18.2: autoguardado bodega (debounce 2 s)
function scheduleAutosave() {
  if (!ordenActual.value) return;
  autosaveStatus.value = 'Guardando…';
  if (autosaveTimeout) clearTimeout(autosaveTimeout);
  autosaveTimeout = setTimeout(() => {
    void (async () => {
      try {
        let fecha: string | undefined;
        if (asignacionFecha.value) {
          const p = asignacionFecha.value.split('/');
          if (p.length === 3) fecha = `${p[2]}-${p[1]}-${p[0]}`;
        }
        await api.patch(`/api/bodega/asignacion/${ordenActual.value!.ordenId}/autosave`, {
          OrdenId: ordenActual.value!.ordenId,
          SedeId:  sedeId.value,
          Fecha:   fecha,
          Items: asignacionItems.value.map(item => ({
            Tipo: item.tipo, Nombre: item.nombre,
            PresentacionId: item.presentacionId, TipoCostalId: item.tipoCostalId,
            CantidadTotal:  item.cantidadTotal || 0,
            Detalle: item.filas.filter(f => f.bodegaId && f.cuadranteId)
              .map(f => ({ BodegaId: f.bodegaId, CuadranteId: f.cuadranteId, Cantidad: f.cantidad || 0 })),
          })),
        });
        const hhmm = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        autosaveStatus.value = `Borrador guardado ${hhmm}`;
      } catch {
        autosaveStatus.value = 'Error al autoguardar';
      }
    })();
  }, 2000);
}

watch([asignacionItems, asignacionFecha], scheduleAutosave, { deep: true });

async function guardarAsignacion() {
  if (!ordenActual.value) return;

  // Validar que ningún ítem exceda su total
  for (const item of asignacionItems.value) {
    const suma = sumaFila(item);
    const max  = efectivoMax(item);
    if (max > 0 && suma > max) {
      $q.notify({
        type: 'warning',
        message: `"${item.nombre}" tiene ${formatNum(suma)} kg asignados pero el máximo es ${formatNum(max)} kg. Ajusta las cantidades.`,
        timeout: 4000,
      });
      return;
    }
  }

  if (autosaveTimeout) { clearTimeout(autosaveTimeout); autosaveTimeout = null; }
  guardando.value = true;
  try {
    // Convertir fecha DD/MM/YYYY → YYYY-MM-DD
    let fecha: string | undefined;
    if (asignacionFecha.value) {
      const partes = asignacionFecha.value.split('/');
      if (partes.length === 3) fecha = `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    await api.post('/api/bodega/asignacion', {
      OrdenId:          ordenActual.value.ordenId,
      SedeId:           sedeId.value,
      Fecha:            fecha,
      StatusAsignacion: 'Asignado',
      Items: asignacionItems.value.map(item => ({
        Tipo:          item.tipo,
        Nombre:        item.nombre,
        PresentacionId: item.presentacionId,
        TipoCostalId:   item.tipoCostalId,
        CantidadTotal:  item.cantidadTotal || 0,
        Detalle: item.filas
          .filter(f => f.bodegaId && f.cuadranteId)
          .map(f => ({ BodegaId: f.bodegaId, CuadranteId: f.cuadranteId, Cantidad: f.cantidad || 0 })),
      })),
    });

    $q.notify({ type: 'positive', message: 'Asignación guardada correctamente' });
    vista.value = 'historial';
    await cargarHistorial();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar la asignación' });
  } finally {
    guardando.value = false;
  }
}

// ─── Detalle ──────────────────────────────────────────────────────
async function abrirDetalle(row: HistorialRow) {
  ordenDetalle.value = row;
  mapasBodega.value  = [];

  if (row.asignacionId) {
    try {
      const { data } = await api.get(`/api/bodega/asignacion/${row.ordenId}`);
      if (data?.detalle?.length) {
        // Agrupar por bodegaClave, acumulando cantidad por cuadrante
        const grupos = new Map<string, Map<string, number>>();
        for (const d of data.detalle as Record<string,unknown>[]) {
          const bClave = d.bodegaClave as string;
          const cClave = d.cuadranteClave as string;
          const cant   = Number(d.cantidad ?? 0);
          if (!grupos.has(bClave)) grupos.set(bClave, new Map());
          const gMap = grupos.get(bClave)!;
          gMap.set(cClave, (gMap.get(cClave) ?? 0) + cant);
        }
        mapasBodega.value = [...grupos.entries()].map(([bodegaClave, cMap]) => ({
          bodegaClave,
          cuadrantes: [...cMap.entries()].map(([clave, cantidad]) => ({ clave, cantidad })),
        }));
      }
    } catch { /* ignorar */ }
  }

  detalleDialog.value = true;
}

// ─── Init ─────────────────────────────────────────────────────────
onBeforeUnmount(() => { if (autosaveTimeout) clearTimeout(autosaveTimeout); });

onMounted(() => {
  void cargarCatalogos();
  void cargarHistorial();
});
</script>

<style scoped>
.filtro-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .8px;
  color: #9e9e9e;
  margin-bottom: 6px;
}
.kpi-card { border-radius: 12px; }
.bodega-card { border-radius: 10px; transition: all 0.15s; }
.bodega-card:hover { border-color: #ff6900; }
.bodega-card--active { border-color: #ff6900 !important; background: #fff3e0; }
.bodega-card--empty { opacity: 0.5; cursor: default; }
.mapa-cuadrante {
  width: calc(50% - 4px);
  height: 48px;
  border-radius: 8px;
  font-size: 13px;
}
.mapa-cuadrante--active { background: #ff6900; color: white; }
.mapa-cuadrante--empty  { background: #f5f5f5; color: #bdbdbd; border: 1px solid #e0e0e0; }

/* ── Asignación ── */
.asig-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.asig-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px 18px;
}
.asig-fecha-display {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  padding: 6px 12px;
  min-width: 155px;
  cursor: pointer;
  background: #fff;
  transition: border-color .15s;
}
.asig-fecha-display:hover { border-color: #888; }
/* Item cards */
.asig-item {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
}
.asig-item__header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 16px 10px 12px;
  border-bottom: 1px solid #ebebeb;
}
.asig-tipo-chip {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .3px;
  padding: 4px 12px;
  border-radius: 20px;
  color: #fff;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
