<template>
  <q-page padding class="bg-grey-2">
    <q-banner v-if="!isOnline" class="bg-red-2 text-red-9 q-mb-sm" dense>
      <template #avatar><q-icon name="cloud_off" color="red-9" /></template>
      Modo sin conexión — las órdenes y resultados se guardarán localmente y se sincronizarán al volver la red.
    </q-banner>

    <!-- ==================== HISTORIAL ==================== -->
    <template v-if="vista === 'historial'">

      <!-- ── KPIs ── -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered style="border-radius:12px">
            <q-card-section class="row items-center q-gutter-md">
              <div class="kpi-icon bg-orange-1">
                <q-icon name="assignment" color="orange-7" size="sm" />
              </div>
              <div>
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Total Órdenes</div>
                <div class="text-h5 text-weight-bold text-grey-9">{{ kpis.total }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered style="border-radius:12px">
            <q-card-section class="row items-center q-gutter-md">
              <div class="kpi-icon bg-yellow-1">
                <q-icon name="schedule" color="yellow-8" size="sm" />
              </div>
              <div>
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">En Proceso</div>
                <div class="text-h5 text-weight-bold text-grey-9">{{ kpis.enProceso }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered style="border-radius:12px">
            <q-card-section class="row items-center q-gutter-md">
              <div class="kpi-icon bg-green-1">
                <q-icon name="check_circle" color="green-7" size="sm" />
              </div>
              <div>
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Terminadas</div>
                <div class="text-h5 text-weight-bold text-grey-9">{{ kpis.terminadas }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered style="border-radius:12px">
            <q-card-section class="row items-center q-gutter-md">
              <div class="kpi-icon bg-blue-1">
                <q-icon name="layers" color="blue-7" size="sm" />
              </div>
              <div>
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Total Tons</div>
                <div class="text-h5 text-weight-bold text-grey-9">{{ kpis.totalTons.toFixed(1) }} T</div>
                <div class="text-caption text-grey-5">producidas</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered style="border-radius:12px">
            <q-card-section class="row items-center q-gutter-md">
              <div class="kpi-icon bg-orange-1">
                <q-icon name="grain" color="orange-7" size="sm" />
              </div>
              <div>
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Garbanzo</div>
                <div class="text-h5 text-weight-bold text-grey-9">{{ kpis.garbanzo }}</div>
                <div class="text-caption text-grey-5">órdenes</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered style="border-radius:12px">
            <q-card-section class="row items-center q-gutter-md">
              <div class="kpi-icon bg-purple-1">
                <q-icon name="inventory_2" color="purple-7" size="sm" />
              </div>
              <div>
                <div class="text-caption text-uppercase text-grey-5 text-weight-bold">Frijol</div>
                <div class="text-h5 text-weight-bold text-grey-9">{{ kpis.frijol }}</div>
                <div class="text-caption text-grey-5">órdenes</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ── Historial header ── -->
      <q-card flat bordered style="border-radius:12px" class="shadow-1">
        <q-card-section class="row items-center justify-between q-pb-sm">
          <div class="text-h6 text-weight-bold text-grey-9">Historial</div>
          <div class="row q-gutter-sm items-center">
            <q-input
              v-model="busqueda" dense outlined clearable
              placeholder="Buscar orden, producto, calibre..."
              style="min-width:260px"
            >
              <template #prepend><q-icon name="search" size="xs" /></template>
            </q-input>
            <q-btn
              unelevated outline color="grey-7" icon="tune" label="Filtros"
              style="border-radius:8px"
              @click="panelFiltros = true"
            />
            <q-btn
              unelevated color="orange-7" icon="add" label="Nueva Orden"
              style="border-radius:8px"
              @click="irNuevaOrden"
            />
          </div>
        </q-card-section>

        <!-- Tabla -->
        <q-table
          :rows="ordenesFiltradas"
          :columns="columnaOrdenes"
          row-key="id"
          flat
          :loading="loading"
          :rows-per-page-options="[10, 20, 50]"
          hide-bottom
        >
          <!-- Índice # -->
          <template #body-cell-idx="props">
            <q-td align="center" class="text-grey-5 text-caption">{{ props.rowIndex + 1 }}</q-td>
          </template>

          <!-- No. Orden en naranja -->
          <template #body-cell-noOrden="props">
            <q-td>
              <span class="text-orange-7 text-weight-bold">{{ props.row.noOrden }}</span>
            </q-td>
          </template>

          <!-- Producto badge -->
          <template #body-cell-producto="props">
            <q-td>
              <q-badge
                :color="props.row.producto === 'Garbanzo' ? 'orange-2' : 'purple-2'"
                :text-color="props.row.producto === 'Garbanzo' ? 'orange-9' : 'purple-9'"
                :label="props.row.producto ?? '—'"
                style="border-radius:6px; padding:3px 8px; font-size:12px"
              />
            </q-td>
          </template>

          <!-- Calibre chip -->
          <template #body-cell-calibre="props">
            <q-td>
              <q-chip
                v-if="primerCalibre(props.row.calibreTipo)"
                dense size="sm" color="grey-2" text-color="grey-8"
                :label="primerCalibre(props.row.calibreTipo)"
                style="font-size:12px"
              />
              <span v-else class="text-grey-4 text-caption">—</span>
            </q-td>
          </template>

          <!-- KG / Tons -->
          <template #body-cell-kg="props">
            <q-td align="right">
              <div class="text-weight-medium">{{ fmtNum(props.row.kg) }} kg</div>
              <div class="text-caption text-grey-5">{{ (props.row.kg / 1000).toFixed(1) }} Tons</div>
            </q-td>
          </template>

          <!-- Status badge -->
          <template #body-cell-status="props">
            <q-td align="center">
              <div class="row items-center q-gutter-xs justify-center">
                <q-icon
                  name="circle"
                  size="8px"
                  :color="statusColor(props.row.status)"
                />
                <span :class="`text-${statusColor(props.row.status)}`" style="font-size:13px">
                  {{ statusLabel(props.row.status) }}
                </span>
              </div>
            </q-td>
          </template>

          <!-- Acciones -->
          <template #body-cell-acciones="props">
            <q-td align="center">
              <q-btn flat dense round icon="visibility" color="grey-5" size="sm"
                @click="irResultado(props.row)" />
              <q-btn flat dense round icon="edit_note" color="orange-6" size="sm"
                @click="irEditarOrden(props.row)" />
            </q-td>
          </template>
        </q-table>

        <!-- Footer leyenda -->
        <div class="row q-px-md q-py-sm items-center justify-between"
          style="border-top:1px solid #f0f0f0">
          <div class="row q-gutter-md">
            <span class="text-caption">
              <q-badge color="orange-2" text-color="orange-9" label="Garbanzo" class="q-mr-xs" />
              con calibre OZ
            </span>
            <span class="text-caption">
              <q-badge color="purple-2" text-color="purple-9" label="Frijol" class="q-mr-xs" />
              sin calibre
            </span>
          </div>
          <span class="text-caption text-grey-5">{{ ordenesFiltradas.length }} de {{ ordenes.length }} órdenes</span>
        </div>
      </q-card>

      <!-- ── Panel Filtros ── -->
      <q-dialog v-model="panelFiltros" position="right">
        <q-card style="width:360px; max-width:95vw; border-radius:12px 0 0 12px; height:100vh; max-height:100vh">
          <q-card-section class="row items-center justify-between q-pb-sm">
            <div class="text-subtitle1 text-weight-bold">Filtros</div>
            <q-btn flat round dense icon="close" @click="panelFiltros = false" />
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-md" style="overflow-y:auto">

            <!-- Producto -->
            <div>
              <div class="text-caption text-uppercase text-grey-5 text-weight-bold q-mb-xs">Producto</div>
              <div class="row q-gutter-sm">
                <q-btn
                  v-for="p in ['Garbanzo','Frijol']" :key="p" :label="p"
                  :color="filtros.producto === p ? 'blue-grey-9' : 'white'"
                  :text-color="filtros.producto === p ? 'white' : 'grey-8'"
                  :outline="filtros.producto !== p"
                  unelevated dense style="border-radius:8px; flex:1"
                  @click="filtros.producto = filtros.producto === p ? '' : p"
                />
              </div>
            </div>

            <!-- Calibre Garbanzo OZ -->
            <div>
              <div class="text-caption text-uppercase text-grey-5 text-weight-bold q-mb-xs">Calibre</div>
              <div class="text-caption text-grey-6 q-mb-xs">Garbanzo (OZ)</div>
              <div class="row q-gutter-xs q-mb-sm">
                <q-btn
                  v-for="c in todosCalibresGarbanzo" :key="c"
                  :label="c" dense unelevated
                  :color="filtros.calibres.includes(c) ? 'orange-7' : 'white'"
                  :text-color="filtros.calibres.includes(c) ? 'white' : 'grey-8'"
                  :outline="!filtros.calibres.includes(c)"
                  style="border-radius:16px; min-width:52px; font-size:12px"
                  @click="toggleFiltroCalibres(c)"
                />
              </div>
              <div class="text-caption text-grey-6 q-mb-xs">Frijol (granos/100g)</div>
              <div class="row q-gutter-xs">
                <q-btn
                  v-for="c in cats.calibreFrijol.map(x => x.nombre)" :key="c"
                  :label="c" dense unelevated
                  :color="filtros.calibres.includes(c) ? 'purple-7' : 'white'"
                  :text-color="filtros.calibres.includes(c) ? 'white' : 'grey-8'"
                  :outline="!filtros.calibres.includes(c)"
                  style="border-radius:16px; min-width:52px; font-size:12px"
                  @click="toggleFiltroCalibres(c)"
                />
              </div>
            </div>

            <!-- Status -->
            <div>
              <div class="text-caption text-uppercase text-grey-5 text-weight-bold q-mb-xs">Status</div>
              <div class="row q-gutter-sm">
                <q-btn
                  v-for="s in STATUSES" :key="s.value"
                  :label="s.label" dense unelevated
                  :color="filtros.status === s.value ? 'blue-grey-9' : 'white'"
                  :text-color="filtros.status === s.value ? 'white' : 'grey-8'"
                  :outline="filtros.status !== s.value"
                  style="border-radius:8px"
                  @click="filtros.status = filtros.status === s.value ? '' : s.value"
                />
              </div>
            </div>

            <!-- Rango Fechas -->
            <div>
              <div class="text-caption text-uppercase text-grey-5 text-weight-bold q-mb-xs">Rango de Fechas</div>
              <div class="row q-gutter-sm">
                <q-input v-model="filtros.fechaDesde" outlined dense type="date" class="col" />
                <q-input v-model="filtros.fechaHasta" outlined dense type="date" class="col" />
              </div>
            </div>

          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat color="grey-7" label="Cancelar" @click="panelFiltros = false" />
            <q-btn unelevated color="orange-7" label="Aplicar" style="border-radius:8px"
              @click="panelFiltros = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </template>

    <!-- ==================== REGISTRO DE ORDEN ==================== -->
    <template v-else-if="vista === 'registro'">
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-btn flat round icon="arrow_back" @click="vista = 'historial'" />
        <div class="text-h5 text-grey-8 text-weight-bold">
          {{ ordenEditandoId ? 'Editar Orden' : 'Nueva Orden de Producción' }}
        </div>
      </div>

      <!-- ── 1. ENCABEZADO DE ORDEN ── -->
      <q-card bordered flat class="q-pa-lg shadow-1 q-mb-lg" style="border-radius:12px">
        <!-- título + badge -->
        <div class="row items-center justify-between q-mb-lg">
          <div class="text-h6 text-weight-bold text-grey-9">Encabezado de Orden</div>
          <q-badge color="grey-4" text-color="grey-7" label="Configuración global" class="q-pa-xs text-caption" />
        </div>

        <!-- Fila 1: No. Orden + Fecha -->
        <div class="row q-col-gutter-lg q-mb-lg">
          <div class="col-12 col-md-6">
            <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
              Orden de Producción <span class="text-red-5">*</span>
            </div>
            <q-input v-model="formOrden.noOrden" outlined dense placeholder="Ej. OP-2025-001" />
          </div>
          <div class="col-12 col-md-6">
            <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
              Fecha de Producción <span class="text-red-5">*</span>
            </div>
            <q-input v-model="formOrden.fechaProduccion" outlined dense type="date" />
          </div>
        </div>

        <!-- Fila 2: Producto + Presentación -->
        <div class="row q-col-gutter-lg q-mb-lg">
          <div class="col-12 col-md-6">
            <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
              Producto <span class="text-red-5">*</span>
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                v-for="prod in ['Garbanzo', 'Frijol']" :key="prod"
                :label="prod"
                :color="formOrden.producto === prod ? 'orange-7' : 'white'"
                :text-color="formOrden.producto === prod ? 'white' : 'grey-8'"
                :outline="formOrden.producto !== prod"
                unelevated
                class="col"
                style="border-radius:8px; font-weight:600"
                @click="formOrden.producto = prod; formOrden.calibresSeleccionados = {}; resetOrigenesTrenes()"
              />
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
              Presentación <span class="text-red-5">*</span>
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                v-for="pres in cats.presentacion" :key="pres.id"
                :label="pres.nombre"
                :color="formOrden.presentacionId === pres.id ? 'blue-grey-9' : 'white'"
                :text-color="formOrden.presentacionId === pres.id ? 'white' : 'grey-8'"
                :outline="formOrden.presentacionId !== pres.id"
                unelevated dense
                style="border-radius:8px; flex:1 1 calc(50% - 8px); min-width:80px"
                @click="formOrden.presentacionId = pres.id"
              />
            </div>
          </div>
        </div>

        <!-- Fila 3: Tipo de Calibre -->
        <div class="q-mb-lg">
          <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
            Tipo de Calibre
            <span class="text-grey-5 q-ml-xs" style="font-weight:400">
              (puedes combinar OZ AM + OZ ESP como equivalencias)
            </span>
          </div>
          <div class="row q-gutter-md q-mb-sm">
            <div
              v-for="grupo in calibreGruposActivos" :key="grupo.tipo"
              class="col-12 col-md-auto"
              style="min-width:260px"
            >
              <q-card flat bordered style="border-radius:10px; border:1px solid #e0e0e0" class="q-pa-md">
                <!-- cabecera: badge tipo + contador -->
                <div class="row items-center q-gutter-sm q-mb-sm">
                  <q-badge
                    :color="grupo.color"
                    :label="grupo.tipo"
                  />
                  <span
                    v-if="(formOrden.calibresSeleccionados[grupo.tipo] ?? []).length > 0"
                    class="text-caption text-grey-6"
                  >
                    {{ (formOrden.calibresSeleccionados[grupo.tipo] ?? []).length }} seleccionado(s)
                  </span>
                </div>
                <!-- chips individuales seleccionables -->
                <div class="row q-gutter-xs">
                  <q-btn
                    v-for="cal in grupo.calibres" :key="cal"
                    :label="cal"
                    :color="(formOrden.calibresSeleccionados[grupo.tipo] ?? []).includes(cal)
                      ? grupo.color
                      : 'white'"
                    :text-color="(formOrden.calibresSeleccionados[grupo.tipo] ?? []).includes(cal)
                      ? 'white' : 'grey-8'"
                    :outline="!(formOrden.calibresSeleccionados[grupo.tipo] ?? []).includes(cal)"
                    unelevated dense
                    style="border-radius:20px; min-width:56px; font-size:12px"
                    @click="toggleCalibresSeleccionado(grupo.tipo, cal)"
                  />
                </div>
              </q-card>
            </div>
          </div>

          <!-- Barra resumen de calibres seleccionados -->
          <div
            v-if="resumenCalibres.length > 0"
            class="q-pa-sm rounded-borders text-caption"
            style="background:#fff3e0; border:1px solid #ffe0b2"
          >
            <span v-for="item in resumenCalibres" :key="item.tipo">
              <span :class="item.tipo === 'OZ AM' ? 'text-orange-8' : 'text-blue-grey-8'" class="text-weight-bold">
                {{ item.tipo }}:
              </span>
              <span class="text-grey-8 q-mr-md">{{ item.calibres.join(', ') }}</span>
            </span>
          </div>
        </div>

        <!-- Fila 4: Tipo de Proceso -->
        <div>
          <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
            Tipo de Proceso <span class="text-red-5">*</span>
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              v-for="proc in cats.tipoProceso" :key="proc.id"
              :label="proc.nombre"
              :color="formOrden.tipoprocesoId === proc.id ? 'blue-grey-9' : 'white'"
              :text-color="formOrden.tipoprocesoId === proc.id ? 'white' : 'grey-8'"
              :outline="formOrden.tipoprocesoId !== proc.id"
              unelevated dense
              style="border-radius:8px"
              @click="formOrden.tipoprocesoId = proc.id"
            />
          </div>
        </div>
      </q-card>

      <!-- ── 2. DEFINICIÓN DE TRENES ── -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-weight-bold text-grey-9">Definición de Trenes</div>
        <q-btn
          :disable="trenes.length >= 4"
          unelevated color="orange-7"
          icon="add" label="Agregar Tren"
          style="border-radius:8px"
          @click="agregarTren"
        />
      </div>

      <!-- Tarjetas de Trenes -->
      <div v-for="(tren, idx) in trenes" :key="idx" class="q-mb-md">
        <q-card bordered flat style="border-radius:12px" class="bg-white">
          <!-- Header tren -->
          <q-card-section class="q-py-sm q-px-md" style="background:#fafafa; border-bottom:1px solid #f0f0f0">
            <div class="row items-center justify-between">
              <div class="row items-center q-gutter-sm">
                <span class="text-caption text-weight-bold text-grey-7 text-uppercase">Tren</span>
                <select
                  v-model="tren.trenId"
                  class="orden-tren-select"
                >
                  <option :value="null" disabled>— elige —</option>
                  <option
                    v-for="t in trenesDisponibles(idx)" :key="t.id"
                    :value="t.id"
                  >{{ t.nombre }}</option>
                </select>
              </div>
              <q-btn v-if="trenes.length > 1" flat round dense icon="delete" color="negative"
                @click="eliminarTren(idx)" />
            </div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-lg">
              <!-- Maniobra -->
              <div class="col-12 col-md-4">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">Maniobra</div>
                <div class="row q-gutter-sm">
                  <q-btn
                    v-for="m in ['Interna', 'Externa']" :key="m"
                    :label="m"
                    :color="tren.maniobra === m ? 'orange-7' : 'white'"
                    :text-color="tren.maniobra === m ? 'white' : 'grey-8'"
                    :outline="tren.maniobra !== m"
                    unelevated class="col"
                    style="border-radius:8px; font-weight:600"
                    @click="tren.maniobra = m"
                  />
                </div>
              </div>

              <!-- Origen tipo + sub-select -->
              <div class="col-12 col-md-4">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">Origen</div>
                <div class="row q-gutter-sm q-mb-sm">
                  <q-btn
                    v-for="o in ['Silo', 'Bodega']" :key="o"
                    :label="o"
                    :color="tren.origenTipo === o ? 'blue-grey-9' : 'white'"
                    :text-color="tren.origenTipo === o ? 'white' : 'grey-8'"
                    :outline="tren.origenTipo !== o"
                    unelevated class="col"
                    style="border-radius:8px; font-weight:600"
                    @click="tren.origenTipo = (o as 'Silo'|'Bodega'); tren.origenId = null"
                  />
                </div>
                <q-select
                  v-if="tren.origenTipo === 'Silo'"
                  v-model="tren.origenId"
                  :options="cats.silos"
                  option-value="id" option-label="nombre"
                  emit-value map-options
                  dense outlined
                  label="Selecciona un silo"
                />
                <q-select
                  v-else-if="tren.origenTipo === 'Bodega'"
                  v-model="tren.origenId"
                  :options="cats.bodegas"
                  option-value="id" option-label="nombre"
                  emit-value map-options
                  dense outlined
                  label="Selecciona una bodega"
                />
              </div>

              <!-- Total MP -->
              <div class="col-12 col-md-4">
                <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">Total MP Suministrada</div>
                <q-input
                  v-model.number="tren.totalMp"
                  outlined dense type="number" :max="50" min="0"
                  input-class="text-right"
                >
                  <template #append>
                    <span class="text-caption text-grey-6">Tons</span>
                  </template>
                  <template v-if="tren.totalMp > 50" #hint>
                    <span class="text-negative">Límite: 50</span>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- ── 3. INSUMOS ── -->
            <q-separator class="q-my-md" />
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-7 text-uppercase">Insumos</div>
              <q-btn unelevated color="orange-7" icon="add" label="Agregar Insumo" size="sm"
                style="border-radius:8px" @click="agregarInsumo(idx)" />
            </div>
            <!-- cabecera columnas -->
            <div class="row q-col-gutter-sm q-mb-xs">
              <div class="col text-caption text-grey-5 text-uppercase q-pl-xs">Insumo</div>
              <div class="col-3 text-caption text-grey-5 text-uppercase">Cantidad</div>
              <div class="col-auto" style="width:36px"></div>
            </div>
            <div v-for="(ins, iIdx) in tren.insumos" :key="iIdx" class="row q-col-gutter-sm q-mb-xs items-center">
              <div class="col">
                <q-select v-model="ins.insumoId" :options="cats.bloqueInsumos" option-value="id"
                  option-label="nombre" emit-value map-options dense outlined label="" />
              </div>
              <div class="col-3">
                <q-input v-model.number="ins.cantidad" outlined dense label="" placeholder="Cantidad"
                  type="number" min="1" />
              </div>
              <div class="col-auto">
                <q-btn v-if="tren.insumos.length > 1" flat dense round icon="close" color="negative"
                  @click="eliminarInsumo(idx, iIdx)" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Botones -->
      <div class="row q-gutter-sm justify-end q-mt-md">
        <q-btn flat color="grey-7" label="Cancelar" @click="vista = 'historial'" />
        <q-btn unelevated color="orange-7" icon="save" label="Guardar" @click="guardarOrden" />
      </div>
    </template>

    <!-- ==================== RESULTADO DE PRODUCCIÓN ==================== -->
    <template v-else-if="vista === 'resultado'">
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-btn flat round icon="arrow_back" @click="vista = 'historial'" />
        <div class="text-h5 text-grey-8 text-weight-bold">Resultado de Producción</div>
      </div>

      <!-- ── ENCABEZADO ── -->
      <q-card bordered flat class="q-mb-lg shadow-1" style="border-radius:12px">
        <q-card-section class="row items-center justify-between q-pb-sm">
          <div class="text-h6 text-weight-bold text-grey-9">
            Orden de Producción: <span class="text-orange-7">{{ ordenActual?.noOrden }}</span>
          </div>
          <q-badge v-if="resultadoReadonly" color="positive" text-color="white"
            label="Resultado Registrado" class="q-pa-xs text-caption" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6 col-md-3">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">Fecha Inicio <span class="text-red-5">*</span></div>
              <q-input v-model="resultado.fechaInicio" outlined dense type="date" :disable="resultadoReadonly" />
            </div>
            <div class="col-6 col-md-3">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">Hora Inicio <span class="text-red-5">*</span></div>
              <q-input v-model="resultado.horaInicio" outlined dense type="time" :disable="resultadoReadonly" />
            </div>
            <div class="col-6 col-md-3">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">Fecha Fin <span class="text-red-5">*</span></div>
              <q-input v-model="resultado.fechaFin" outlined dense type="date" :disable="resultadoReadonly" />
            </div>
            <div class="col-6 col-md-3">
              <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">Hora Fin <span class="text-red-5">*</span></div>
              <q-input v-model="resultado.horaFin" outlined dense type="time" :disable="resultadoReadonly" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ── BLOQUE 1: PRODUCTO CLASIFICADO ── -->
      <q-card bordered flat class="q-mb-lg shadow-1" style="border-radius:12px; overflow:hidden">
        <div class="q-px-md q-py-sm text-white text-weight-bold" style="background:#e65100; letter-spacing:.5px">
          PRODUCTO CLASIFICADO
        </div>
        <div style="overflow-x:auto">
          <q-markup-table flat bordered separator="cell">
            <thead>
              <tr style="background:#fff3e0">
                <th class="text-left text-orange-9">TREN</th>
                <th class="text-right">SACOS 25KG</th>
                <th class="text-right">SACOS 50KG</th>
                <th class="text-right">POLIBOLSA (KG)</th>
                <th class="text-left">CALIBRE</th>
                <th class="text-right text-weight-bold text-orange-9">KG X TREN</th>
                <th class="text-left">OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tr, idx) in resultado.trenResultados" :key="idx">
                <td class="text-weight-medium text-grey-8">{{ tr.trenNombre }}</td>
                <td>
                  <q-input v-model.number="tr.sacos25" type="number" min="0" dense borderless
                    input-class="text-right" :disable="resultadoReadonly" @update:model-value="calcularKg(idx)" />
                </td>
                <td>
                  <q-input v-model.number="tr.sacos50" type="number" min="0" dense borderless
                    input-class="text-right" :disable="resultadoReadonly" @update:model-value="calcularKg(idx)" />
                </td>
                <td>
                  <q-input v-model.number="tr.polibolsa" type="number" min="0" dense borderless
                    input-class="text-right" :disable="resultadoReadonly" @update:model-value="calcularKg(idx)" />
                </td>
                <td>
                  <q-input v-model="tr.calibre" dense borderless
                    placeholder="Ej. 42/44" :disable="resultadoReadonly" />
                </td>
                <td style="background:#fff3e0">
                  <div class="text-right text-weight-bold text-orange-8">{{ fmtNum(tr.kgXTren) }}</div>
                </td>
                <td>
                  <q-input v-model="tr.observaciones" dense borderless :disable="resultadoReadonly" />
                </td>
              </tr>
              <tr style="background:#fff3e0">
                <td class="text-weight-bold text-orange-9">TOTAL</td>
                <td class="text-right text-weight-bold">{{ totalClasificado.sacos25 }}</td>
                <td class="text-right text-weight-bold">{{ totalClasificado.sacos50 }}</td>
                <td class="text-right text-weight-bold">{{ fmtNum(totalClasificado.polibolsa) }}</td>
                <td>—</td>
                <td class="text-right text-weight-bold text-orange-9">{{ fmtNum(totalClasificado.kg) }}</td>
                <td>—</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </q-card>

      <!-- ── BLOQUE 2: SUB PRODUCTO / REZAGA ── -->
      <q-card bordered flat class="q-mb-lg shadow-1" style="border-radius:12px; overflow:hidden">
        <div class="q-px-md q-py-sm text-white text-weight-bold" style="background:#1565c0; letter-spacing:.5px">
          SUB PRODUCTO / REZAGA
        </div>
        <div style="overflow-x:auto">
          <q-markup-table flat bordered separator="cell">
            <thead>
              <tr class="bg-grey-2">
                <th class="text-left">TREN</th>
                <th class="text-left">TIPO SUB PRODUCTO</th>
                <th class="text-right">SACOS</th>
                <th class="text-right">POLIBOLSA (KG)</th>
                <th class="text-right">PESO (KG)</th>
                <th class="text-left">OBSERVACIONES</th>
                <th style="width:48px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, idx) in resultado.subproductos" :key="idx">
                <td>
                  <q-select v-model="s.trenNombre" :options="trenesActuales.map(t => t.trenNombre)"
                    dense borderless :disable="resultadoReadonly" />
                </td>
                <td>
                  <q-select v-model="s.tipo" :options="cats.subproductos.map(x => x.nombre)"
                    dense borderless :disable="resultadoReadonly" />
                </td>
                <td><q-input v-model.number="s.sacos" type="number" min="0" dense borderless input-class="text-right" :disable="resultadoReadonly" /></td>
                <td><q-input v-model.number="s.polibolsa" type="number" min="0" dense borderless input-class="text-right" :disable="resultadoReadonly" /></td>
                <td><q-input v-model.number="s.peso" type="number" min="0" dense borderless input-class="text-right" :disable="resultadoReadonly" /></td>
                <td><q-input v-model="s.observaciones" dense borderless :disable="resultadoReadonly" /></td>
                <td align="center">
                  <q-btn v-if="!resultadoReadonly" flat dense round icon="delete" color="negative" size="xs"
                    @click="resultado.subproductos.splice(idx, 1)" />
                </td>
              </tr>
              <tr v-if="!resultado.subproductos.length">
                <td colspan="7" class="text-center text-grey-4 q-pa-md text-caption">Sin líneas</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
        <div v-if="!resultadoReadonly" class="q-pa-sm row justify-end" style="border-top:1px solid #e3f2fd">
          <q-btn flat dense color="blue-8" icon="add" label="Agregar Sub Producto"
            style="font-weight:600; border-radius:8px" @click="agregarSubproducto" />
        </div>
      </q-card>

      <!-- ── BLOQUE 3: DESECHO ── -->
      <q-card bordered flat class="q-mb-lg shadow-1" style="border-radius:12px; overflow:hidden">
        <div class="q-px-md q-py-sm text-white text-weight-bold" style="background:#c62828; letter-spacing:.5px">
          DESECHO
        </div>
        <div style="overflow-x:auto">
          <q-markup-table flat bordered separator="cell">
            <thead>
              <tr class="bg-grey-2">
                <th class="text-left">TREN</th>
                <th class="text-left">TIPO DESECHO</th>
                <th class="text-right">SACOS</th>
                <th class="text-right">POLIBOLSA (KG)</th>
                <th class="text-right">PESO (KG)</th>
                <th class="text-left">OBSERVACIONES</th>
                <th style="width:48px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, idx) in resultado.desechos" :key="idx">
                <td>
                  <q-select v-model="d.trenNombre" :options="trenesActuales.map(t => t.trenNombre)"
                    dense borderless :disable="resultadoReadonly" />
                </td>
                <td>
                  <q-select v-model="d.tipo" :options="cats.desechos.map(x => x.nombre)"
                    dense borderless :disable="resultadoReadonly" />
                </td>
                <td><q-input v-model.number="d.sacos" type="number" min="0" dense borderless input-class="text-right" :disable="resultadoReadonly" /></td>
                <td><q-input v-model.number="d.polibolsa" type="number" min="0" dense borderless input-class="text-right" :disable="resultadoReadonly" /></td>
                <td><q-input v-model.number="d.peso" type="number" min="0" dense borderless input-class="text-right" :disable="resultadoReadonly" /></td>
                <td><q-input v-model="d.observaciones" dense borderless :disable="resultadoReadonly" /></td>
                <td align="center">
                  <q-btn v-if="!resultadoReadonly" flat dense round icon="delete" color="negative" size="xs"
                    @click="resultado.desechos.splice(idx, 1)" />
                </td>
              </tr>
              <tr v-if="!resultado.desechos.length">
                <td colspan="7" class="text-center text-grey-4 q-pa-md text-caption">Sin líneas</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
        <div v-if="!resultadoReadonly" class="q-pa-sm row justify-end" style="border-top:1px solid #ffebee">
          <q-btn flat dense color="red-8" icon="add" label="Agregar Desecho"
            style="font-weight:600; border-radius:8px" @click="agregarDesecho" />
        </div>
      </q-card>

      <!-- ── BLOQUE 4: RENDIMIENTO DE PRODUCCIÓN ── -->
      <q-card bordered flat class="q-mb-lg shadow-1" style="border-radius:12px; overflow:hidden">
        <div class="q-px-md q-py-sm row items-center justify-between" style="background:#37474f">
          <span class="text-white text-weight-bold" style="letter-spacing:.5px">RENDIMIENTO DE PRODUCCIÓN</span>
          <div class="row items-center q-gutter-xs">
            <q-icon name="lock" color="blue-grey-4" size="14px" />
            <span class="text-blue-grey-4 text-caption">Solo lectura · Calculado automáticamente</span>
          </div>
        </div>
        <div style="overflow-x:auto">
          <table style="width:100%; border-collapse:collapse; min-width:680px">
            <thead>
              <tr style="background:#eceff1">
                <th class="rend-th text-left">TREN</th>
                <th class="rend-th text-right">TONS ENTRADA</th>
                <th class="rend-th text-right" style="color:#e65100">PROD. CLASIFICADO</th>
                <th class="rend-th text-right" style="color:#1565c0">GRANILLO</th>
                <th class="rend-th text-right" style="color:#f57f17">REZAGA</th>
                <th class="rend-th text-right" style="color:#c62828">DESECHO</th>
                <th class="rend-th text-left" style="min-width:200px">RENDIMIENTO</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rendimientoPorTren" :key="r.trenNombre"
                style="border-bottom:1px solid #f0f0f0">
                <td class="rend-td text-weight-medium text-grey-8">{{ r.trenNombre }}</td>
                <td class="rend-td text-right text-grey-6">{{ r.entradaTons.toFixed(2) }} T</td>
                <td class="rend-td text-right text-weight-bold" style="color:#e65100">{{ r.prodPct.toFixed(1) }}%</td>
                <td class="rend-td text-right text-weight-bold" style="color:#1565c0">{{ r.granilloPct.toFixed(1) }}%</td>
                <td class="rend-td text-right text-weight-bold" style="color:#f57f17">{{ r.rezagaPct.toFixed(1) }}%</td>
                <td class="rend-td text-right text-weight-bold" style="color:#c62828">
                  {{ r.desechoPct.toFixed(1) }}%
                  <div class="text-caption" style="color:#b0bec5; font-weight:400; font-size:10px; white-space:nowrap">excluye rendimiento</div>
                </td>
                <td class="rend-td">
                  <div class="row items-center no-wrap q-gutter-xs">
                    <div style="flex:1; height:14px; border-radius:7px; overflow:hidden; background:#f5f5f5; display:flex">
                      <div :style="{ width: Math.min(r.prodPct,100) + '%', background:'#e65100', transition:'width .3s' }"></div>
                      <div :style="{ width: Math.min(r.granilloPct,100) + '%', background:'#1565c0', transition:'width .3s' }"></div>
                      <div :style="{ width: Math.min(r.rezagaPct,100) + '%', background:'#f9a825', transition:'width .3s' }"></div>
                      <div :style="{ width: Math.min(r.desechoPct,100) + '%', background:'#c62828', opacity:'0.45', transition:'width .3s' }"></div>
                    </div>
                    <span class="text-weight-bold" style="min-width:44px; text-align:right; color:#37474f; font-size:14px">
                      {{ r.rendPct.toFixed(1) }}%
                    </span>
                  </div>
                  <div style="font-size:10px; color:#b0bec5; white-space:nowrap; margin-top:2px">
                    Prod. + Granillo + Rezaga
                  </div>
                </td>
              </tr>
              <!-- TOTAL GENERAL -->
              <tr style="background:#455a64; border-top:2px solid #37474f">
                <td class="rend-td text-weight-bold" style="color:#eceff1; font-size:13px; letter-spacing:.3px">TOTAL GENERAL</td>
                <td class="rend-td text-right text-weight-bold" style="color:#cfd8dc">{{ rendimientoTotal.entradaTons.toFixed(2) }} T</td>
                <td class="rend-td text-right text-weight-bold" style="color:#ffab91">{{ rendimientoTotal.prodPct.toFixed(1) }}%</td>
                <td class="rend-td text-right text-weight-bold" style="color:#90caf9">{{ rendimientoTotal.granilloPct.toFixed(1) }}%</td>
                <td class="rend-td text-right text-weight-bold" style="color:#ffe082">{{ rendimientoTotal.rezagaPct.toFixed(1) }}%</td>
                <td class="rend-td text-right text-weight-bold" style="color:#ef9a9a">{{ rendimientoTotal.desechoPct.toFixed(1) }}%</td>
                <td class="rend-td">
                  <div class="row items-center no-wrap q-gutter-xs">
                    <div style="flex:1; height:16px; border-radius:8px; overflow:hidden; background:#546e7a; display:flex">
                      <div :style="{ width: Math.min(rendimientoTotal.prodPct,100) + '%', background:'#e65100' }"></div>
                      <div :style="{ width: Math.min(rendimientoTotal.granilloPct,100) + '%', background:'#1565c0' }"></div>
                      <div :style="{ width: Math.min(rendimientoTotal.rezagaPct,100) + '%', background:'#f9a825' }"></div>
                      <div :style="{ width: Math.min(rendimientoTotal.desechoPct,100) + '%', background:'#c62828', opacity:'0.55' }"></div>
                    </div>
                    <span class="text-weight-bold" style="min-width:48px; text-align:right; color:#ffffff; font-size:15px">
                      {{ rendimientoTotal.rendPct.toFixed(1) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Leyenda + nota fórmula -->
        <div class="q-px-md q-py-sm" style="border-top:1px solid #eceff1; background:#fafafa">
          <div class="row q-gutter-md items-center q-mb-xs">
            <div class="row items-center q-gutter-xs">
              <div style="width:12px; height:12px; border-radius:3px; background:#e65100; flex-shrink:0"></div>
              <span class="text-caption text-grey-7">Producto Clasificado</span>
            </div>
            <div class="row items-center q-gutter-xs">
              <div style="width:12px; height:12px; border-radius:3px; background:#1565c0; flex-shrink:0"></div>
              <span class="text-caption text-grey-7">Granillo</span>
            </div>
            <div class="row items-center q-gutter-xs">
              <div style="width:12px; height:12px; border-radius:3px; background:#f9a825; flex-shrink:0"></div>
              <span class="text-caption text-grey-7">Rezaga</span>
            </div>
            <div class="row items-center q-gutter-xs">
              <div style="width:12px; height:12px; border-radius:3px; background:#c62828; opacity:.45; flex-shrink:0"></div>
              <span class="text-caption text-grey-7">Desecho</span>
            </div>
          </div>
          <div class="row items-center q-gutter-xs">
            <q-icon name="info" color="blue-grey-4" size="14px" />
            <span class="text-caption text-grey-5">
              <strong class="text-grey-7">Rendimiento</strong> = Producto Clasificado + Granillo + Rezaga
              <span class="text-grey-4">(Excluye Desecho)</span>
            </span>
          </div>
        </div>
      </q-card>

      <!-- ── BOTONES ── -->
      <div class="row q-gutter-sm justify-end q-mt-md q-mb-xl">
        <q-btn flat color="grey-7" label="Cancelar" @click="vista = 'historial'" />
        <q-btn v-if="!resultadoReadonly" unelevated color="orange-7" icon="save" label="Guardar Resultado"
          style="border-radius:8px" @click="guardarResultado" />
      </div>
    </template>

    <!-- ==================== ANÁLISIS CALIDAD — HISTORIAL ==================== -->
    <template v-else-if="vista === 'analisis-historial'">
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-btn flat round icon="arrow_back" @click="vista = 'historial'" />
          <div class="text-h5 text-grey-8 text-weight-bold">
            <q-icon name="science" class="q-mr-sm" />Análisis de Calidad
          </div>
        </div>
        <q-btn unelevated color="deep-purple-7" icon="add" label="Nuevo Análisis"
          @click="abrirModalNuevoAnalisis" />
      </div>

      <q-card bordered flat class="shadow-1">
        <!-- Filtro de fecha -->
        <q-card-section class="row items-center q-gutter-md q-pb-sm" style="border-bottom:1px solid #f0f0f0">
          <q-icon name="calendar_today" color="grey-5" />
          <span class="text-caption text-grey-6 text-weight-bold text-uppercase">Filtrar por fecha</span>
          <q-input
            v-model="filtroAnalisisFecha.desde"
            dense outlined clearable
            label="Desde" mask="##/##/####" placeholder="dd/mm/aaaa"
            style="width:150px"
          >
            <template #append><q-icon name="event" size="xs" color="grey-5" /></template>
          </q-input>
          <q-input
            v-model="filtroAnalisisFecha.hasta"
            dense outlined clearable
            label="Hasta" mask="##/##/####" placeholder="dd/mm/aaaa"
            style="width:150px"
          >
            <template #append><q-icon name="event" size="xs" color="grey-5" /></template>
          </q-input>
          <span class="text-caption text-grey-5">{{ listaAnalisisFiltrada.length }} de {{ listaAnalisis.length }}</span>
        </q-card-section>

        <q-table
          :rows="listaAnalisisFiltrada"
          :columns="columnasAnalisis"
          row-key="id"
          flat
          :loading="loadingAnalisis"
          dense
          :rows-per-page-options="[10, 20, 50]"
        >
          <template #body-cell-finalizado="props">
            <q-td align="center">
              <q-badge v-if="props.row.finalizado" color="positive" label="Guardado" class="text-caption" />
              <q-badge v-else color="orange-3" text-color="orange-9" label="Borrador" class="text-caption" />
            </q-td>
          </template>
          <template #body-cell-acciones="props">
            <q-td align="center">
              <q-btn flat dense round icon="visibility" color="deep-purple-7"
                @click="verAnalisis(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </template>

    <!-- ==================== ANÁLISIS CALIDAD — CAPTURA ==================== -->
    <template v-else-if="vista === 'analisis-captura'">
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-btn flat round icon="arrow_back" @click="vista = 'analisis-historial'" />
        <div class="text-h5 text-grey-8 text-weight-bold">Captura de Análisis de Calidad</div>
        <q-space />
        <q-badge v-if="analisisReadonly" color="positive" label="Guardado · Solo lectura"
          class="text-subtitle2 q-px-md q-py-sm" style="border-radius:6px" />
        <q-btn v-else unelevated color="green-7" icon="save" label="Guardar Análisis"
          @click="guardarAnalisis" />
      </div>

      <!-- Banner solo lectura -->
      <q-banner v-if="analisisReadonly" class="bg-green-1 text-green-9 q-mb-md" dense rounded>
        <template #avatar><q-icon name="lock" color="green-7" /></template>
        Este análisis ya fue guardado y no puede modificarse.
      </q-banner>

      <!-- BLOQUE 1: Datos Generales (solo lectura) -->
      <q-card bordered flat class="q-mb-md shadow-1">
        <q-card-section class="bg-blue-7 text-white text-weight-bold q-py-sm">
          Datos Generales
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6 col-md-2">
              <q-input :model-value="analisisActual.noOrden" dense outlined label="Orden" readonly bg-color="grey-2" />
            </div>
            <div class="col-6 col-md-2">
              <q-input :model-value="analisisActual.fecha" dense outlined label="Fecha" readonly bg-color="grey-2" />
            </div>
            <div class="col-6 col-md-2">
              <q-input :model-value="analisisActual.envasado" dense outlined label="Envasado" readonly bg-color="grey-2" />
            </div>
            <div class="col-6 col-md-2">
              <q-input :model-value="analisisActual.producto" dense outlined label="Producto" readonly bg-color="grey-2" />
            </div>
            <div class="col-6 col-md-2">
              <q-input :model-value="analisisActual.cosecha" dense outlined label="Cosecha" readonly bg-color="grey-2" />
            </div>
            <div class="col-6 col-md-2">
              <q-input :model-value="analisisActual.proceso" dense outlined label="Proceso" readonly bg-color="grey-2" />
            </div>
            <div class="col-6 col-md-2">
              <q-input :model-value="analisisActual.silo" dense outlined label="Silo" readonly bg-color="grey-2" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- BLOQUE 2: Análisis Detallado (tabla dinámica de parrillas) -->
      <q-card bordered flat class="q-mb-md shadow-1">
        <q-card-section class="bg-green-7 text-white text-weight-bold q-py-sm row items-center justify-between">
          <span>Análisis de Calidad Detallado</span>
          <q-btn unelevated color="white" text-color="green-9" icon="add" label="Agregar Línea" size="sm"
            :disable="analisisReadonly || parrillasDetallado.length >= 50"
            @click="agregarParrilla" />
        </q-card-section>
        <q-card-section class="q-pa-sm overflow-auto">
          <q-markup-table flat bordered separator="cell" style="min-width: 1200px">
            <thead>
              <tr class="bg-grey-3 text-caption">
                <th style="width:80px"># PARRILLA</th>
                <th style="width:110px">CALIBRE</th>
                <th>VERDES</th><th>LISOS</th><th>MANCHADOS</th><th>MITADES</th>
                <th>MORD. GUSANO</th><th>PELADOS</th><th>QUEBRADOS</th>
                <th>GERMINADOS</th><th>PICADOS</th><th>REVOLCADOS</th><th>OTROS</th>
                <th class="bg-yellow-2 text-weight-bold">DAÑO TOTAL</th>
                <th class="bg-blue-2 text-weight-bold">% EXP</th>
                <th style="width:48px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, idx) in parrillasDetallado" :key="idx">
                <td class="bg-teal-1">
                  <q-input :model-value="idx + 1" dense borderless readonly class="text-center" />
                </td>
                <td class="bg-teal-1">
                  <q-select v-model="p.calibre" :options="calibresAnalisis" dense borderless
                    :disable="analisisReadonly" />
                </td>
                <td v-for="col in campoDanoAnalisis" :key="col">
                  <q-input v-model.number="p[col]" type="number" min="0" step="0.01" dense borderless
                    class="text-right" :disable="analisisReadonly"
                    @update:model-value="calcularDano(idx)" />
                </td>
                <td class="bg-yellow-2 text-right text-weight-bold">{{ fmtNum(p.danoTotal) }}</td>
                <td class="bg-blue-2 text-right text-weight-bold">{{ fmtNum(p.pctExp) }}</td>
                <td align="center">
                  <q-btn v-if="!analisisReadonly" flat dense round icon="delete" color="negative"
                    @click="parrillasDetallado.splice(idx, 1)" />
                </td>
              </tr>
              <tr v-if="!parrillasDetallado.length">
                <td colspan="17" class="text-center text-grey-5 q-pa-md">
                  Sin líneas — haz clic en "Agregar Línea"
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>

      <!-- BLOQUE 3: Parrillas -->
      <q-card bordered flat class="shadow-1">
        <q-card-section class="bg-purple-7 text-white text-weight-bold q-py-sm">
          Parrillas
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-lg">
            <!-- Completas -->
            <div class="col-12 col-md-6">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-blue-9 text-weight-bold">Completas</div>
                <q-btn unelevated color="blue-7" icon="add" size="sm" label="Agregar"
                  :disable="analisisReadonly"
                  @click="parrillaCompletas.push({ calibre: '', cantidad: 0, kg: 0 })" />
              </div>
              <div v-for="(c, idx) in parrillaCompletas" :key="idx"
                class="row q-col-gutter-sm q-mb-xs items-center bg-blue-1 rounded-borders q-pa-xs">
                <div class="col">
                  <q-input v-model="c.calibre" dense outlined label="Calibre" placeholder="Ej. 7-8 mm"
                    :disable="analisisReadonly" />
                </div>
                <div class="col-3">
                  <q-input v-model.number="c.cantidad" type="number" min="0" dense outlined label="Cantidad"
                    :disable="analisisReadonly" />
                </div>
                <div class="col-3">
                  <q-input v-model.number="c.kg" type="number" min="0" dense outlined label="KG"
                    :disable="analisisReadonly" />
                </div>
                <div class="col-auto">
                  <q-btn v-if="!analisisReadonly" flat dense round icon="delete" color="negative"
                    @click="parrillaCompletas.splice(idx, 1)" />
                </div>
              </div>
            </div>
            <!-- Incompletas -->
            <div class="col-12 col-md-6">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-orange-9 text-weight-bold">Incompletas</div>
                <q-btn unelevated color="orange-7" icon="add" size="sm" label="Agregar"
                  :disable="analisisReadonly"
                  @click="parrillaIncompletas.push({ calibre: '', cantidad: 0, kg: 0 })" />
              </div>
              <div v-for="(c, idx) in parrillaIncompletas" :key="idx"
                class="row q-col-gutter-sm q-mb-xs items-center bg-orange-1 rounded-borders q-pa-xs">
                <div class="col">
                  <q-input v-model="c.calibre" dense outlined label="Calibre" placeholder="Ej. 7-8 mm"
                    :disable="analisisReadonly" />
                </div>
                <div class="col-3">
                  <q-input v-model.number="c.cantidad" type="number" min="0" dense outlined label="Cantidad"
                    :disable="analisisReadonly" />
                </div>
                <div class="col-3">
                  <q-input v-model.number="c.kg" type="number" min="0" dense outlined label="KG"
                    :disable="analisisReadonly" />
                </div>
                <div class="col-auto">
                  <q-btn v-if="!analisisReadonly" flat dense round icon="delete" color="negative"
                    @click="parrillaIncompletas.splice(idx, 1)" />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </template>

    <!-- ==================== MODAL NUEVO ANÁLISIS ==================== -->
    <q-dialog v-model="modalNuevoAnalisis" persistent>
      <q-card style="width: 560px; max-width: 95vw">
        <q-toolbar class="bg-deep-purple-7 text-white">
          <q-toolbar-title>Crear Nuevo Análisis de Calidad</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-select
                v-model="formAnalisis.noOrden"
                :options="ordenesConResultadoFiltradas"
                use-input
                input-debounce="0"
                outlined dense label="Orden"
                clearable
                @filter="(val, update) => { filtroOrden = val; update(() => {}) }"
              />
            </div>
            <div class="col-6">
              <q-input v-model="formAnalisis.fecha" outlined dense label="Fecha *" type="date" />
            </div>
            <div class="col-6">
              <q-select v-model="formAnalisis.envasado" :options="['25 Kg', '50 Kg', 'Polibolsa']"
                outlined dense label="Envasado *" />
            </div>
            <div class="col-6">
              <q-select v-model="formAnalisis.producto" :options="['Garbanzo', 'Frijol']"
                outlined dense label="Producto *"
                @update:model-value="(v) => { formAnalisis.granoId = granoIdPorNombre(v) }" />
            </div>
            <div class="col-6">
              <q-input v-model="formAnalisis.cosecha" outlined dense label="Cosecha" />
            </div>
            <div class="col-6">
              <q-select v-model="formAnalisis.proceso"
                :options="cats.trenes.map(t => t.nombre)"
                outlined dense label="Proceso (Tren)" />
            </div>
            <div class="col-6">
              <q-select v-model="formAnalisis.silo"
                :options="(formAnalisis.producto === 'Frijol' ? cats.bodegas : cats.silos).map((o: { nombre: string }) => o.nombre)"
                outlined dense label="Silo / Almacén" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn flat color="grey-7" label="Cancelar" v-close-popup />
          <q-btn unelevated color="deep-purple-7" label="Crear Análisis" @click="crearAnalisis" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ==================== MODAL JUSTIFICACIÓN EDICIÓN ==================== -->
    <q-dialog v-model="modalJustificacion" persistent>
      <q-card style="width: 480px; max-width: 95vw">
        <q-card-section class="bg-orange-7 text-white">
          <div class="text-h6">Justificación de Edición</div>
        </q-card-section>
        <q-card-section>
          <p class="text-body2 text-grey-7 q-mb-sm">
            Por favor, indica el motivo de la edición de esta orden de producción.
          </p>
          <q-input v-model="justificacionEdicion" type="textarea" outlined
            label="Justificación *" rows="4" />
        </q-card-section>
        <q-card-actions align="right" class="q-pb-md q-pr-md">
          <q-btn flat color="grey-7" label="Cancelar" @click="modalJustificacion = false" />
          <q-btn unelevated color="orange-7" label="Confirmar y Guardar" @click="confirmarEdicion" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { api } from 'src/boot/axios';
import { Notify, useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { useOfflineStore } from 'src/stores/offlineStore';

const $q = useQuasar();
const authStore = useAuthStore();
const offlineStore = useOfflineStore();
const isOnline = ref(window.navigator.onLine);
const _syncOnline = () => { isOnline.value = window.navigator.onLine; };
const route = useRoute();

function fechaHoy(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ─── VISTAS ────────────────────────────────────────────────────────────────
type Vista = 'historial' | 'registro' | 'resultado' | 'analisis-historial' | 'analisis-captura';
const vista = ref<Vista>('historial');

function aplicarSeccionRuta() {
  if (route.query.seccion === 'analisis') {
    void cargarAnalisis().then(() => { vista.value = 'analisis-historial'; });
  } else {
    vista.value = 'historial';
  }
}

watch(() => route.query, () => aplicarSeccionRuta(), { deep: true });

// ─── CALIBRE GRUPOS (dinámicos desde catálogo) ─────────────────────────────
const calibreGruposActivos = computed(() => {
  if (formOrden.value.producto === 'Frijol') {
    return [
      { tipo: 'FRIJOL', color: 'blue-grey-9', calibres: cats.value.calibreFrijol.map(c => c.nombre) },
    ];
  }
  return [
    { tipo: 'OZ AM',  color: 'orange-7',   calibres: cats.value.calibreOzAm.map(c => c.nombre) },
    { tipo: 'OZ ESP', color: 'blue-grey-9', calibres: cats.value.calibreOzEsp.map(c => c.nombre) },
  ];
});

// Serializa { 'OZ AM': ['34/36','40/42'], 'OZ ESP': ['36/38'] }
// → "OZ AM:34/36,40/42|OZ ESP:36/38"
function serializeCalibreTipo(sel: Record<string, string[]>): string {
  return Object.entries(sel)
    .filter(([, cals]) => cals.length > 0)
    .map(([tipo, cals]) => `${tipo}:${cals.join(',')}`)
    .join('|');
}

// Inverso: "OZ AM:34/36,40/42|OZ ESP:36/38" → { 'OZ AM': ['34/36','40/42'], 'OZ ESP': ['36/38'] }
function parseCalibreTipo(raw: string): Record<string, string[]> {
  if (!raw) return {};
  const result: Record<string, string[]> = {};
  for (const part of raw.split('|')) {
    const [tipo, cals] = part.split(':');
    if (tipo && cals) result[tipo.trim()] = cals.split(',').map(c => c.trim());
  }
  return result;
}

function toggleCalibresSeleccionado(tipo: string, cal: string) {
  if (!formOrden.value.calibresSeleccionados[tipo]) {
    formOrden.value.calibresSeleccionados[tipo] = [];
  }
  const lista = formOrden.value.calibresSeleccionados[tipo];
  const idx = lista.indexOf(cal);
  if (idx === -1) lista.push(cal);
  else lista.splice(idx, 1);
}

// ─── CATÁLOGOS ─────────────────────────────────────────────────────────────
const cats = ref<{
  trenes: { id: number; nombre: string }[];
  tipoProceso: { id: number; nombre: string }[];
  presentacion: { id: number; nombre: string }[];
  bloqueInsumos: { id: number; nombre: string }[];
  subproductos: { id: number; nombre: string }[];
  desechos: { id: number; nombre: string }[];
  silos: { id: number; nombre: string }[];
  bodegas: { id: number; nombre: string }[];
  calibres: { id: number; nombre: string; granoId: number }[];
  calibreOzAm: { id: number; nombre: string }[];
  calibreOzEsp: { id: number; nombre: string }[];
  calibreFrijol: { id: number; nombre: string }[];
  calibresAnalisis: { id: number; nombre: string }[];
}>({
  trenes: [], tipoProceso: [], presentacion: [], bloqueInsumos: [],
  subproductos: [], desechos: [], silos: [], bodegas: [], calibres: [],
  calibreOzAm: [], calibreOzEsp: [], calibreFrijol: [], calibresAnalisis: [],
});

const listaGranos = ref<{ id: number; nombre: string }[]>([]);

async function cargarCatalogos() {
  try {
    const sedeId = authStore.sedeActivaId ?? 0;
    const [catRes, granosRes] = await Promise.all([
      api.get('/api/produccion/catalogos', { params: { sedeId } }),
      api.get('/api/catalogos/granos', { params: { sede_id: sedeId } }),
    ]);
    const catData = catRes.data as typeof cats.value;
    cats.value = {
      ...catData,
      calibreOzAm:      catData.calibreOzAm      ?? [],
      calibreOzEsp:     catData.calibreOzEsp     ?? [],
      calibreFrijol:    catData.calibreFrijol    ?? [],
      calibresAnalisis: catData.calibresAnalisis ?? [],
    };
    listaGranos.value = (granosRes.data as { id: number; nombre: string; activo: boolean }[]).filter(g => g.activo);
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar catálogos' });
  }
}

function granoIdPorNombre(nombre: string): number | null {
  const g = listaGranos.value.find(g => g.nombre.toLowerCase().includes(nombre?.toLowerCase() ?? ''));
  return g?.id ?? null;
}

function buildOrigen(tren: TrenForm): string {
  if (tren.origenTipo === 'Silo') {
    return cats.value.silos.find(s => s.id === tren.origenId)?.nombre ?? '';
  }
  if (tren.origenTipo === 'Bodega') {
    return cats.value.bodegas.find(b => b.id === tren.origenId)?.nombre ?? '';
  }
  return '';
}

function detectarOrigenTipo(origen: string): 'Silo' | 'Bodega' | '' {
  if (cats.value.silos.some(s => s.nombre === origen)) return 'Silo';
  if (cats.value.bodegas.some(b => b.nombre === origen)) return 'Bodega';
  return '';
}

function detectarOrigenId(origen: string, tipo: 'Silo' | 'Bodega' | ''): number | null {
  if (tipo === 'Silo') return cats.value.silos.find(s => s.nombre === origen)?.id ?? null;
  if (tipo === 'Bodega') return cats.value.bodegas.find(b => b.nombre === origen)?.id ?? null;
  return null;
}

function resetOrigenesTrenes() {
  trenes.value.forEach(t => { t.origenTipo = ''; t.origenId = null; });
}

// calibresParaTren ya no se usa — calibre es texto libre en el resultado

const calibresAnalisis = computed(() => cats.value.calibresAnalisis.map(c => c.nombre));

// ─── HISTORIAL DE ÓRDENES ─────────────────────────────────────────────────
const loading = ref(false);
const ordenes = ref<OrdenResumen[]>([]);
const busqueda = ref('');
const panelFiltros = ref(false);

interface OrdenResumen {
  id: number;
  noOrden: string;
  fechaOrden: string;
  producto: string;
  calibreTipo: string;
  numTrenes: number;
  kg: number;
  status: string;
}

const STATUSES = [
  { value: 'Pendiente',            label: 'En Proceso' },
  { value: 'Resultado Registrado', label: 'Terminado' },
  { value: 'Pausado',              label: 'Pausado' },
];

const filtros = ref({
  producto: '',
  calibres: [] as string[],
  status: '',
  fechaDesde: '',
  fechaHasta: '',
});

function toggleFiltroCalibres(c: string) {
  const idx = filtros.value.calibres.indexOf(c);
  if (idx === -1) filtros.value.calibres.push(c);
  else filtros.value.calibres.splice(idx, 1);
}

// Todos los calibres Garbanzo (OZ AM + OZ ESP sin duplicados)
const todosCalibresGarbanzo = computed(() => {
  const set = new Set([
    ...cats.value.calibreOzAm.map(c => c.nombre),
    ...cats.value.calibreOzEsp.map(c => c.nombre),
  ]);
  return [...set];
});

// Extrae el primer calibre individual del string serializado
function primerCalibre(calibreTipo: string): string {
  if (!calibreTipo) return '';
  // formato: "OZ AM:34/36,40/42|OZ ESP:42/44"
  const match = calibreTipo.match(/:([\w/>]+)/);
  return match?.[1] ?? '';
}

// Todos los calibres individuales del string serializado
function calibresDeOrden(calibreTipo: string): string[] {
  if (!calibreTipo) return [];
  return calibreTipo
    .split('|')
    .flatMap(g => g.split(':')[1]?.split(',') ?? []);
}

function statusColor(status: string): string {
  if (status === 'Resultado Registrado') return 'positive';
  if (status === 'Pausado') return 'grey-5';
  return 'orange-7';
}

function statusLabel(status: string): string {
  if (status === 'Resultado Registrado') return 'Terminado';
  if (status === 'Pausado') return 'Pausado';
  return 'En Proceso';
}

const columnaOrdenes: QTableColumn[] = [
  { name: 'idx',        label: '#',        field: 'id',          align: 'center', style: 'width:40px' },
  { name: 'noOrden',    label: 'No. Orden', field: 'noOrden',    align: 'left',  sortable: true },
  { name: 'fechaOrden', label: 'Fecha',    field: 'fechaOrden',  align: 'left',  sortable: true, format: (val: string) => val?.substring(0, 10) ?? '' },
  { name: 'producto',   label: 'Producto', field: 'producto',    align: 'left' },
  { name: 'calibre',    label: 'Calibre',  field: 'calibreTipo', align: 'center' },
  { name: 'trenes',     label: 'Trenes',   field: 'numTrenes',   align: 'center' },
  { name: 'kg',         label: 'KG / Tons', field: 'kg',         align: 'right' },
  { name: 'status',     label: 'Status',   field: 'status',      align: 'center' },
  { name: 'acciones',   label: 'Acción',   field: 'id',          align: 'center' },
];

const ordenesFiltradas = computed(() => {
  const q = busqueda.value.toLowerCase();
  return ordenes.value.filter(o => {
    if (q && !o.noOrden.toLowerCase().includes(q) &&
            !o.producto?.toLowerCase().includes(q) &&
            !(o.calibreTipo ?? '').toLowerCase().includes(q)) return false;
    if (filtros.value.producto && o.producto !== filtros.value.producto) return false;
    if (filtros.value.status && o.status !== filtros.value.status) return false;
    if (filtros.value.calibres.length) {
      const cals = calibresDeOrden(o.calibreTipo);
      if (!filtros.value.calibres.some(c => cals.includes(c))) return false;
    }
    if (filtros.value.fechaDesde && o.fechaOrden < filtros.value.fechaDesde) return false;
    if (filtros.value.fechaHasta && o.fechaOrden > filtros.value.fechaHasta) return false;
    return true;
  });
});

// ─── KPIs ──────────────────────────────────────────────────────────────────
const kpis = computed(() => ({
  total:      ordenes.value.length,
  enProceso:  ordenes.value.filter(o => o.status === 'Pendiente').length,
  terminadas: ordenes.value.filter(o => o.status === 'Resultado Registrado').length,
  totalTons:  ordenes.value.reduce((s, o) => s + (o.kg ?? 0), 0) / 1000,
  garbanzo:   ordenes.value.filter(o => o.producto === 'Garbanzo').length,
  frijol:     ordenes.value.filter(o => o.producto === 'Frijol').length,
}));

async function cargarOrdenes() {
  loading.value = true;
  try {
    const { data } = await api.get('/api/produccion/ordenes', {
      params: { sedeId: authStore.sedeActivaId ?? 0 }
    });
    ordenes.value = data as OrdenResumen[];
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar órdenes' });
  } finally {
    loading.value = false;
  }
}

// ─── REGISTRO DE ORDEN ────────────────────────────────────────────────────
interface TrenForm {
  trenId: number | null;
  maniobra: string;
  origenTipo: 'Silo' | 'Bodega' | '';
  origenId: number | null;
  totalMp: number;
  insumos: { insumoId: number | null; cantidad: number }[];
}

interface TrenApiResponse {
  trenId: number | null;
  fecha?: string;
  maniobra?: string;
  tipoprocesoId: number | null;
  presentacionId: number | null;
  producto?: string;
  granoId: number | null;
  origen?: string;
  totalMpSuministrada?: number;
  bloqueInsumos?: string;
}

const formOrden = ref({
  noOrden: '',
  fechaProduccion: fechaHoy(),
  producto: '',
  tipoprocesoId: null as number | null,
  presentacionId: null as number | null,
  calibresSeleccionados: {} as Record<string, string[]>,
});

const resumenCalibres = computed(() =>
  calibreGruposActivos.value
    .map(g => ({ tipo: g.tipo, calibres: formOrden.value.calibresSeleccionados[g.tipo] ?? [] }))
    .filter(g => g.calibres.length > 0)
);
const trenes = ref<TrenForm[]>([]);
const ordenEditandoId = ref<number | null>(null);

function trenVacio(): TrenForm {
  return {
    trenId: null,
    maniobra: 'Externa',
    origenTipo: '',
    origenId: null,
    totalMp: 0,
    insumos: [{ insumoId: null, cantidad: 0 }],
  };
}

function trenesDisponibles(idxActual: number) {
  const usados = trenes.value
    .filter((_, i) => i !== idxActual)
    .map(t => t.trenId);
  return cats.value.trenes.filter(t => !usados.includes(t.id));
}

function agregarTren() {
  if (trenes.value.length < 4) trenes.value.push(trenVacio());
}
function eliminarTren(idx: number) {
  trenes.value.splice(idx, 1);
}
function agregarInsumo(idx: number) {
  trenes.value[idx]?.insumos.push({ insumoId: null, cantidad: 0 });
}
function eliminarInsumo(trenIdx: number, insIdx: number) {
  trenes.value[trenIdx]?.insumos.splice(insIdx, 1);
}

function irNuevaOrden() {
  ordenEditandoId.value = null;
  formOrden.value = {
    noOrden: '',
    fechaProduccion: fechaHoy(),
    producto: '',
    tipoprocesoId: null,
    presentacionId: null,
    calibresSeleccionados: {},
  };
  trenes.value = [trenVacio()];
  vista.value = 'registro';
}

async function irEditarOrden(row: OrdenResumen) {
  try {
    $q.loading.show();
    const { data } = await api.get(`/api/produccion/ordenes/${row.id}`);
    const d = data as {
      orden: { noOrden: string; fechaOrden?: string; calibreTipo?: string };
      trenes: TrenApiResponse[];
    };
    ordenEditandoId.value = row.id;

    // Extraer campos globales del primer tren (todos los trenes comparten los mismos)
    const primerTren = d.trenes[0];
    formOrden.value = {
      noOrden: d.orden.noOrden,
      fechaProduccion: d.orden.fechaOrden?.substring(0, 10) ?? fechaHoy(),
      producto: primerTren?.producto ?? '',
      tipoprocesoId: primerTren?.tipoprocesoId ?? null,
      presentacionId: primerTren?.presentacionId ?? null,
      calibresSeleccionados: parseCalibreTipo(d.orden.calibreTipo ?? ''),
    };

    trenes.value = d.trenes.map(t => {
      const tipo = detectarOrigenTipo(t.origen ?? '');
      return {
        trenId: t.trenId,
        maniobra: t.maniobra ?? 'Externa',
        origenTipo: tipo,
        origenId: detectarOrigenId(t.origen ?? '', tipo),
        totalMp: Number(t.totalMpSuministrada ?? 0),
        insumos: t.bloqueInsumos
          ? (JSON.parse(t.bloqueInsumos as unknown as string) as { insumoId: number; cantidad: number }[])
          : [{ insumoId: null, cantidad: 0 }],
      };
    });
    vista.value = 'registro';
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar la orden' });
  } finally {
    $q.loading.hide();
  }
}

// Justificación de edición
const modalJustificacion = ref(false);
const justificacionEdicion = ref('');

async function guardarOrden() {
  if (!formOrden.value.noOrden.trim()) {
    Notify.create({ type: 'warning', message: 'El No. de Orden es requerido' });
    return;
  }
  if (!formOrden.value.fechaProduccion) {
    Notify.create({ type: 'warning', message: 'La Fecha de Producción es requerida' });
    return;
  }
  if (!formOrden.value.producto) {
    Notify.create({ type: 'warning', message: 'El Producto es requerido' });
    return;
  }
  if (!formOrden.value.tipoprocesoId) {
    Notify.create({ type: 'warning', message: 'El Tipo de Proceso es requerido' });
    return;
  }
  if (!formOrden.value.presentacionId) {
    Notify.create({ type: 'warning', message: 'La Presentación es requerida' });
    return;
  }
  if (!trenes.value.length) {
    Notify.create({ type: 'warning', message: 'Debe agregar al menos un tren' });
    return;
  }
  for (const t of trenes.value) {
    if (!t.trenId || !t.maniobra || !t.origenTipo || !t.origenId) {
      Notify.create({ type: 'warning', message: 'Complete el Tren, Maniobra y Origen de cada tren' });
      return;
    }
    if (t.totalMp > 50) {
      Notify.create({ type: 'warning', message: 'Total MP Suministrada no puede exceder 50' });
      return;
    }
    if (!t.insumos.length) {
      Notify.create({ type: 'warning', message: 'Debe agregar al menos un insumo por tren' });
      return;
    }
  }

  if (ordenEditandoId.value) {
    justificacionEdicion.value = '';
    modalJustificacion.value = true;
    return;
  }

  await enviarOrden();
}

async function confirmarEdicion() {
  if (!justificacionEdicion.value.trim()) {
    Notify.create({ type: 'warning', message: 'La justificación no puede estar vacía' });
    return;
  }
  modalJustificacion.value = false;
  await enviarOrden();
}

async function enviarOrden() {
  const granoId = granoIdPorNombre(formOrden.value.producto);
  const payload = {
    noOrden: formOrden.value.noOrden,
    fechaOrden: formOrden.value.fechaProduccion,
    calibreTipo: serializeCalibreTipo(formOrden.value.calibresSeleccionados),
    justificacionEdicion: justificacionEdicion.value || null,
    trenes: trenes.value.map(t => ({
      trenId: t.trenId,
      fecha: formOrden.value.fechaProduccion,
      maniobra: t.maniobra,
      tipoprocesoId: formOrden.value.tipoprocesoId,
      presentacionId: formOrden.value.presentacionId,
      producto: formOrden.value.producto,
      granoId,
      origen: buildOrigen(t),
      totalMpSuministrada: t.totalMp,
      bloqueInsumos: JSON.stringify(t.insumos),
    })),
  };
  const sedeId = authStore.sedeActivaId ?? 0;

  if (!window.navigator.onLine) {
    const esEdicion = !!ordenEditandoId.value;
    offlineStore.agregarProduccion({
      tipo: esEdicion ? 'actualizar-orden' : 'crear-orden',
      sedeId,
      ordenPayload: payload,
      ...(esEdicion && ordenEditandoId.value ? { ordenId: ordenEditandoId.value } : {}),
      _localId: 'LOCAL_PROD_' + Date.now(),
      _syncStatus: 'pending',
      _descripcion: `${esEdicion ? 'Actualizar' : 'Crear'} orden ${payload.noOrden}`,
    });
    Notify.create({ type: 'warning', icon: 'cloud_off', message: `Sin conexión — orden "${payload.noOrden}" guardada localmente. Se sincronizará al volver la red.`, timeout: 4000 });
    vista.value = 'historial';
    return;
  }

  try {
    $q.loading.show({ message: 'Guardando orden...' });
    if (ordenEditandoId.value) {
      await api.put(`/api/produccion/ordenes/${ordenEditandoId.value}`, payload, { params: { sedeId } });
      Notify.create({ type: 'positive', message: 'Orden actualizada correctamente' });
    } else {
      await api.post('/api/produccion/ordenes', payload, { params: { sedeId } });
      Notify.create({ type: 'positive', message: 'Orden creada correctamente' });
    }
    vista.value = 'historial';
    await cargarOrdenes();
  } catch {
    Notify.create({ type: 'negative', message: 'Error al guardar la orden' });
  } finally {
    $q.loading.hide();
  }
}

// ─── RESULTADO ────────────────────────────────────────────────────────────
interface TrenResultado {
  trenId: number;
  trenNombre: string;
  granoId: number | null;
  totalMpKg: number;
  sacos25: number;
  sacos50: number;
  polibolsa: number;
  calibre: string;
  kgXTren: number;
  observaciones: string;
}
interface LineaSubprod {
  trenNombre: string; tipo: string; sacos: number; polibolsa: number; peso: number; observaciones: string;
}

const ordenActual = ref<OrdenResumen | null>(null);
const trenesActuales = ref<TrenResultado[]>([]);
const resultadoReadonly = computed(() => ordenActual.value?.status === 'Resultado Registrado');
const filtroOrden = ref('');
const ordenesConResultado = computed(() => {
  const yaAnalizados = new Set(listaAnalisis.value.map(a => a.noOrden));
  return ordenes.value
    .filter(o => o.status === 'Pendiente' && !yaAnalizados.has(o.noOrden))
    .map(o => o.noOrden);
});
const ordenesConResultadoFiltradas = computed(() => {
  const q = filtroOrden.value.toLowerCase();
  return q ? ordenesConResultado.value.filter(n => n.toLowerCase().includes(q)) : ordenesConResultado.value;
});

const resultado = ref<{
  fechaInicio: string; horaInicio: string;
  fechaFin: string;   horaFin: string;
  trenResultados: TrenResultado[];
  subproductos: LineaSubprod[];
  desechos: LineaSubprod[];
}>({ fechaInicio: '', horaInicio: '', fechaFin: '', horaFin: '', trenResultados: [], subproductos: [], desechos: [] });

const totalClasificado = computed(() => ({
  sacos25:   resultado.value.trenResultados.reduce((s, t) => s + (t.sacos25 ?? 0), 0),
  sacos50:   resultado.value.trenResultados.reduce((s, t) => s + (t.sacos50 ?? 0), 0),
  polibolsa: resultado.value.trenResultados.reduce((s, t) => s + (t.polibolsa ?? 0), 0),
  kg:        resultado.value.trenResultados.reduce((s, t) => s + t.kgXTren, 0),
}));

function calcularKg(idx: number) {
  const t = resultado.value.trenResultados[idx];
  if (!t) return;
  t.kgXTren = (t.sacos25 ?? 0) * 25 + (t.sacos50 ?? 0) * 50 + (t.polibolsa ?? 0);
}

interface RendimientoRow {
  trenNombre: string;
  entradaTons: number;
  prodPct: number;
  granilloPct: number;
  rezagaPct: number;
  desechoPct: number;
  rendPct: number;
}

const rendimientoPorTren = computed<RendimientoRow[]>(() => {
  return resultado.value.trenResultados.map(tr => {
    const prodKg = tr.kgXTren ?? 0;
    const granilloKg = resultado.value.subproductos
      .filter(s => s.trenNombre === tr.trenNombre && s.tipo.toLowerCase().includes('granillo'))
      .reduce((sum, s) => sum + (s.peso ?? 0), 0);
    const rezagaKg = resultado.value.subproductos
      .filter(s => s.trenNombre === tr.trenNombre && !s.tipo.toLowerCase().includes('granillo'))
      .reduce((sum, s) => sum + (s.peso ?? 0), 0);
    const desechoKg = resultado.value.desechos
      .filter(d => d.trenNombre === tr.trenNombre)
      .reduce((sum, d) => sum + (d.peso ?? 0), 0);
    // Tons entrada = suma de todas las salidas del tren
    const entradaKg = prodKg + granilloKg + rezagaKg + desechoKg;
    const pct = (kg: number) => entradaKg > 0 ? Math.round((kg / entradaKg) * 1000) / 10 : 0;
    const prodPct     = pct(prodKg);
    const granilloPct = pct(granilloKg);
    const rezagaPct   = pct(rezagaKg);
    const desechoPct  = pct(desechoKg);
    return {
      trenNombre: tr.trenNombre,
      entradaTons: entradaKg / 1000,
      prodPct, granilloPct, rezagaPct, desechoPct,
      rendPct: prodPct + granilloPct + rezagaPct,
    };
  });
});

const rendimientoTotal = computed<RendimientoRow>(() => {
  const rows = rendimientoPorTren.value;
  if (rows.length === 0) return { trenNombre: '', entradaTons: 0, prodPct: 0, granilloPct: 0, rezagaPct: 0, desechoPct: 0, rendPct: 0 };
  const totalProdKg    = resultado.value.trenResultados.reduce((s, t) => s + (t.kgXTren ?? 0), 0);
  const totalGranKg    = resultado.value.subproductos
    .filter(s => s.tipo.toLowerCase().includes('granillo'))
    .reduce((sum, s) => sum + (s.peso ?? 0), 0);
  const totalRezagaKg  = resultado.value.subproductos
    .filter(s => !s.tipo.toLowerCase().includes('granillo'))
    .reduce((sum, s) => sum + (s.peso ?? 0), 0);
  const totalDesechoKg = resultado.value.desechos.reduce((sum, d) => sum + (d.peso ?? 0), 0);
  const totalEntradaKg = totalProdKg + totalGranKg + totalRezagaKg + totalDesechoKg;
  const pct = (kg: number) => totalEntradaKg > 0 ? Math.round((kg / totalEntradaKg) * 1000) / 10 : 0;
  const prodPct     = pct(totalProdKg);
  const granilloPct = pct(totalGranKg);
  const rezagaPct   = pct(totalRezagaKg);
  const desechoPct  = pct(totalDesechoKg);
  return {
    trenNombre: 'TOTAL GENERAL',
    entradaTons: totalEntradaKg / 1000,
    prodPct, granilloPct, rezagaPct, desechoPct,
    rendPct: prodPct + granilloPct + rezagaPct,
  };
});

function agregarSubproducto() {
  resultado.value.subproductos.push({
    trenNombre: trenesActuales.value[0]?.trenNombre ?? '',
    tipo: '', sacos: 0, polibolsa: 0, peso: 0, observaciones: '',
  });
}
function agregarDesecho() {
  resultado.value.desechos.push({
    trenNombre: trenesActuales.value[0]?.trenNombre ?? '',
    tipo: '', sacos: 0, polibolsa: 0, peso: 0, observaciones: '',
  });
}

async function irResultado(row: OrdenResumen) {
  try {
    $q.loading.show();
    ordenActual.value = row;
    const { data } = await api.get(`/api/produccion/ordenes/${row.id}`);
    const d = data as {
      trenes: { trenId: number; trenNombre: string; producto: string; granoId: number | null; totalMpSuministrada?: number }[];
      resultado: {
        fechaInicio: string; horaInicio: string; fechaFin: string; horaFin: string;
        productoClasificado: string; subproducto: string; desecho: string;
      } | null;
    };

    trenesActuales.value = d.trenes.map(t => ({
      trenId: t.trenId,
      trenNombre: t.trenNombre,
      granoId: t.granoId ?? null,
      totalMpKg: (t.totalMpSuministrada ?? 0) * 1000,
      sacos25: 0, sacos50: 0, polibolsa: 0, calibre: '', kgXTren: 0, observaciones: '',
    }));

    if (d.resultado) {
      resultado.value.fechaInicio = d.resultado.fechaInicio?.substring?.(0, 10) ?? '';
      resultado.value.horaInicio = d.resultado.horaInicio ?? '';
      resultado.value.fechaFin = d.resultado.fechaFin?.substring?.(0, 10) ?? '';
      resultado.value.horaFin = d.resultado.horaFin ?? '';
      try {
        if (d.resultado.productoClasificado) {
          const parsed = JSON.parse(d.resultado.productoClasificado) as TrenResultado[];
          // Merge totalMpKg from live tren data (not persisted in resultado JSON)
          resultado.value.trenResultados = parsed.map(p => ({
            ...p,
            totalMpKg: trenesActuales.value.find(t => t.trenId === p.trenId)?.totalMpKg ?? p.totalMpKg ?? 0,
          }));
        } else {
          resultado.value.trenResultados = trenesActuales.value;
        }
        resultado.value.subproductos = d.resultado.subproducto
          ? (JSON.parse(d.resultado.subproducto) as LineaSubprod[])
          : [];
        resultado.value.desechos = d.resultado.desecho
          ? (JSON.parse(d.resultado.desecho) as LineaSubprod[])
          : [];
      } catch {
        resultado.value.trenResultados = trenesActuales.value;
        resultado.value.subproductos = [];
        resultado.value.desechos = [];
      }
    } else {
      resultado.value = {
        fechaInicio: '', horaInicio: '', fechaFin: '', horaFin: '',
        trenResultados: trenesActuales.value,
        subproductos: [{ trenNombre: trenesActuales.value[0]?.trenNombre ?? '', tipo: '', sacos: 0, polibolsa: 0, peso: 0, observaciones: '' }],
        desechos: [{ trenNombre: trenesActuales.value[0]?.trenNombre ?? '', tipo: '', sacos: 0, polibolsa: 0, peso: 0, observaciones: '' }],
      };
    }
    vista.value = 'resultado';
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar resultado' });
  } finally {
    $q.loading.hide();
  }
}

async function guardarResultado() {
  if (!resultado.value.fechaInicio || !resultado.value.horaInicio ||
      !resultado.value.fechaFin || !resultado.value.horaFin) {
    Notify.create({ type: 'warning', message: 'Complete fecha y hora de inicio y fin' });
    return;
  }

  const resultadoPayload = {
    ordenId: ordenActual.value?.id,
    fechaInicio: resultado.value.fechaInicio,
    horaInicio:  resultado.value.horaInicio,
    fechaFin:    resultado.value.fechaFin,
    horaFin:     resultado.value.horaFin,
    productoClasificado: JSON.stringify(resultado.value.trenResultados),
    subproducto: JSON.stringify(resultado.value.subproductos),
    desecho:     JSON.stringify(resultado.value.desechos),
  };

  if (!window.navigator.onLine) {
    offlineStore.agregarProduccion({
      tipo: 'guardar-resultado',
      sedeId: authStore.sedeActivaId ?? 0,
      resultadoPayload,
      _localId: 'LOCAL_PROD_' + Date.now(),
      _syncStatus: 'pending',
      _descripcion: `Resultado orden ${ordenActual.value?.noOrden ?? ''}`,
    });
    Notify.create({ type: 'warning', icon: 'cloud_off', message: 'Sin conexión — resultado guardado localmente. Se sincronizará al volver la red.', timeout: 4000 });
    vista.value = 'historial';
    return;
  }

  try {
    $q.loading.show({ message: 'Guardando resultado...' });
    await api.post('/api/produccion/resultado', resultadoPayload);
    Notify.create({ type: 'positive', message: 'Resultado guardado correctamente' });
    vista.value = 'historial';
    await cargarOrdenes();
  } catch {
    Notify.create({ type: 'negative', message: 'Error al guardar resultado' });
  } finally {
    $q.loading.hide();
  }
}

// ─── ANÁLISIS DE CALIDAD ──────────────────────────────────────────────────
const loadingAnalisis = ref(false);
const listaAnalisis = ref<AnalisisResumen[]>([]);
const modalNuevoAnalisis = ref(false);

interface AnalisisResumen {
  id: number; noOrden: string; fecha: string;
  envasado: string; producto: string; cosecha: string; proceso: string; silo: string;
  finalizado: boolean;
}

// Convierte "dd/mm/yyyy" → "yyyy-mm-dd" para comparar con fechas ISO del backend
function dmyToIso(dmy: string): string {
  const parts = dmy.replace(/_/g, '').split('/');
  if (parts.length !== 3 || (parts[2] ?? '').length < 4) return '';
  return `${parts[2]}-${(parts[1] ?? '').padStart(2,'0')}-${(parts[0] ?? '').padStart(2,'0')}`;
}

const filtroAnalisisFecha = ref({ desde: '', hasta: '' });

const listaAnalisisFiltrada = computed(() => {
  const desde = dmyToIso(filtroAnalisisFecha.value.desde);
  const hasta  = dmyToIso(filtroAnalisisFecha.value.hasta);
  return listaAnalisis.value.filter(a => {
    const f = (a.fecha ?? '').substring(0, 10);
    if (desde && f < desde) return false;
    if (hasta  && f > hasta)  return false;
    return true;
  });
});

const columnasAnalisis: QTableColumn[] = [
  { name: 'noOrden',  label: 'Orden',    field: 'noOrden',  align: 'left'  },
  { name: 'fecha',    label: 'Fecha',    field: 'fecha',    align: 'left',
    format: (val: string) => {
      if (!val) return '';
      const d = (val ?? '').substring(0, 10);
      return `${d.substring(8,10)}/${d.substring(5,7)}/${d.substring(0,4)}`;
    }
  },
  { name: 'envasado', label: 'Envasado', field: 'envasado', align: 'left'  },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left'  },
  { name: 'cosecha',  label: 'Cosecha',  field: 'cosecha',  align: 'left'  },
  { name: 'proceso',  label: 'Proceso',  field: 'proceso',  align: 'left'  },
  { name: 'silo',       label: 'Silo',    field: 'silo',       align: 'left'   },
  { name: 'finalizado', label: 'Estado',  field: 'finalizado', align: 'center' },
  { name: 'acciones',   label: 'Ver',     field: 'id',         align: 'center' },
];

const formAnalisis = ref({
  noOrden: '', fecha: fechaHoy(),
  envasado: '', producto: '', granoId: null as number | null,
  cosecha: '', proceso: '', silo: '',
});

const analisisActual = ref<AnalisisResumen & { granoId: number | null; detallado: string; parrillas: string }>({
  id: 0, noOrden: '', fecha: '', envasado: '', producto: '',
  granoId: null, cosecha: '', proceso: '', silo: '', finalizado: false,
  detallado: '', parrillas: '',
});
const analisisReadonly = computed(() => !!analisisActual.value.finalizado);

async function cargarAnalisis() {
  loadingAnalisis.value = true;
  try {
    const { data } = await api.get('/api/produccion/analisis', {
      params: { sedeId: authStore.sedeActivaId ?? 0 }
    });
    listaAnalisis.value = data as AnalisisResumen[];
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar análisis' });
  } finally {
    loadingAnalisis.value = false;
  }
}

function abrirModalNuevoAnalisis() {
  formAnalisis.value = {
    noOrden: '', fecha: fechaHoy(),
    envasado: '', producto: '', granoId: null,
    cosecha: '', proceso: '', silo: '',
  };
  modalNuevoAnalisis.value = true;
}

async function crearAnalisis() {
  if (!formAnalisis.value.fecha || !formAnalisis.value.envasado || !formAnalisis.value.producto) {
    Notify.create({ type: 'warning', message: 'Complete los campos obligatorios: Fecha, Envasado y Producto' });
    return;
  }
  try {
    const sedeId = authStore.sedeActivaId ?? 0;
    const { data } = await api.post<{ id: number }>(
      '/api/produccion/analisis',
      { ...formAnalisis.value, detallado: '[]', parrillas: '{}' },
      { params: { sedeId } }
    );
    modalNuevoAnalisis.value = false;
    analisisActual.value = { ...formAnalisis.value, id: data.id, finalizado: false, detallado: '[]', parrillas: '{}' };
    resetearCaptura();
    vista.value = 'analisis-captura';
  } catch {
    Notify.create({ type: 'negative', message: 'Error al crear análisis' });
  }
}

async function verAnalisis(row: AnalisisResumen) {
  try {
    $q.loading.show();
    const { data } = await api.get(`/api/produccion/analisis/${row.id}`);
    const d = data as typeof analisisActual.value;
    analisisActual.value = d;
    resetearCaptura();
    if (d.detallado) {
      try { parrillasDetallado.value = JSON.parse(d.detallado) as ParrillaRow[]; } catch { /* */ }
    }
    if (d.parrillas) {
      try {
        const p = JSON.parse(d.parrillas) as { completas: ParrillaSimple[]; incompletas: ParrillaSimple[] };
        parrillaCompletas.value = p.completas ?? [];
        parrillaIncompletas.value = p.incompletas ?? [];
      } catch { /* */ }
    }
    vista.value = 'analisis-captura';
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar análisis' });
  } finally {
    $q.loading.hide();
  }
}

// Parrillas
interface ParrillaRow {
  calibre: string;
  verdes: number; lisos: number; manchados: number; mitades: number;
  mordGusano: number; pelados: number; quebrados: number;
  germinados: number; picados: number; revolcados: number; otros: number;
  danoTotal: number; pctExp: number;
  [key: string]: string | number;
}
interface ParrillaSimple { calibre: string; cantidad: number; kg: number }

const campoDanoAnalisis = [
  'verdes','lisos','manchados','mitades','mordGusano',
  'pelados','quebrados','germinados','picados','revolcados','otros'
];

const parrillasDetallado = ref<ParrillaRow[]>([]);
const parrillaCompletas   = ref<ParrillaSimple[]>([]);
const parrillaIncompletas = ref<ParrillaSimple[]>([]);

function resetearCaptura() {
  parrillasDetallado.value = [];
  parrillaCompletas.value  = [];
  parrillaIncompletas.value = [];
}

function parrillaVacia(): ParrillaRow {
  return {
    calibre: '', verdes: 0, lisos: 0, manchados: 0, mitades: 0,
    mordGusano: 0, pelados: 0, quebrados: 0, germinados: 0,
    picados: 0, revolcados: 0, otros: 0, danoTotal: 0, pctExp: 0,
  };
}

function agregarParrilla() {
  if (parrillasDetallado.value.length < 50)
    parrillasDetallado.value.push(parrillaVacia());
}

function calcularDano(idx: number) {
  const p = parrillasDetallado.value[idx];
  if (!p) return;
  const total = campoDanoAnalisis.reduce((s, k) => s + (Number(p[k]) || 0), 0);
  p.danoTotal = parseFloat(total.toFixed(2));
  p.pctExp    = parseFloat((100 - total).toFixed(2));
}

async function guardarAnalisis() {
  if (!parrillasDetallado.value.length) {
    Notify.create({ type: 'warning', message: 'Debe agregar al menos una línea de análisis' });
    return;
  }
  try {
    $q.loading.show({ message: 'Guardando análisis...' });
    await api.put(`/api/produccion/analisis/${analisisActual.value.id}`, {
      detallado: JSON.stringify(parrillasDetallado.value),
      parrillas: JSON.stringify({
        completas:   parrillaCompletas.value,
        incompletas: parrillaIncompletas.value,
      }),
    });
    Notify.create({ type: 'positive', message: 'Análisis guardado correctamente' });
    await cargarAnalisis();
    vista.value = 'analisis-historial';
  } catch {
    Notify.create({ type: 'negative', message: 'Error al guardar análisis' });
  } finally {
    $q.loading.hide();
  }
}


// ─── UTILIDADES ───────────────────────────────────────────────────────────
function fmtNum(val: number | undefined | null): string {
  const n = Number(val ?? 0);
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

onMounted(async () => {
  window.addEventListener('online', _syncOnline);
  window.addEventListener('offline', _syncOnline);
  await cargarCatalogos();
  await cargarOrdenes();
  if (route.query.seccion === 'analisis') {
    await cargarAnalisis();
    vista.value = 'analisis-historial';
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('online', _syncOnline);
  window.removeEventListener('offline', _syncOnline);
});
</script>

<style scoped>
/* KPI icon circle */
.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Select nativo para el selector de tren en el encabezado de cada tarjeta */
.orden-tren-select {
  appearance: auto;
  border: 1px solid #bdbdbd;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 600;
  color: #424242;
  background: #fff;
  cursor: pointer;
  min-width: 110px;
}
.orden-tren-select:focus {
  outline: 2px solid #e65100;
  border-color: #e65100;
}

/* Rendimiento table */
.rend-th {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .4px;
  border-bottom: 2px solid #cfd8dc;
  white-space: nowrap;
}
.rend-td {
  padding: 8px 12px;
  font-size: 13px;
  vertical-align: middle;
}
</style>
