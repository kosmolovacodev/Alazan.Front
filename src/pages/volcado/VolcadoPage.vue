<template>
  <q-page padding class="bg-grey-2">
    <q-banner v-if="!isOnline" class="bg-red-2 text-red-9 q-mb-sm" dense>
      <template #avatar><q-icon name="cloud_off" color="red-9" /></template>
      Modo sin conexión — las asignaciones y rechazos se guardarán localmente y se sincronizarán al volver la red.
    </q-banner>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-grey-8 text-weight-bold">
        <q-icon name="warehouse" class="q-mr-sm" size="md" />
        Volcado a Almacen / Silo
      </div>
      <q-btn
        color="primary"
        unelevated
        icon="filter_alt"
        :label="mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'"
        @click="mostrarFiltros = !mostrarFiltros"
      >
        <q-icon
          :name="mostrarFiltros ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          class="q-ml-sm"
        />
      </q-btn>
    </div>

    <!-- Dashboard KPIs -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered flat class="bg-blue-1 border-blue">
          <q-card-section class="q-py-sm">
            <div class="text-caption text-blue-9 text-weight-medium">Total del Dia</div>
            <div class="text-h4 text-weight-bold text-blue-9">{{ resumen.totalDelDia }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered flat class="bg-green-1 border-green">
          <q-card-section class="q-py-sm">
            <div class="text-caption text-green-9 text-weight-medium">Con Silo Asignado</div>
            <div class="text-h4 text-weight-bold text-green-9">{{ resumen.conSiloAsignado }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered flat class="bg-orange-1 border-orange">
          <q-card-section class="q-py-sm">
            <div class="text-caption text-orange-9 text-weight-medium">Sin Silo Asignado</div>
            <div class="text-h4 text-weight-bold text-orange-9">{{ resumen.sinSiloAsignado }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered flat class="bg-purple-1 border-purple">
          <q-card-section class="q-py-sm">
            <div class="text-caption text-purple-9 text-weight-medium">Total Bruto</div>
            <div class="text-h4 text-weight-bold text-purple-9">
              {{ formatNumber(resumen.totalToneladas) }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filtros -->
    <q-card v-show="mostrarFiltros" bordered flat class="q-pa-md q-mb-md shadow-1 border-grey">
      <div class="text-subtitle2 q-mb-md text-grey-8 text-center text-uppercase">
        Filtros de Busqueda
      </div>
      <div class="row q-col-gutter-md q-mb-sm">
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.ticket" outlined dense label="Ticket" clearable>
            <template #prepend><q-icon name="confirmation_number" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.boleta" outlined dense label="Boleta" clearable>
            <template #prepend><q-icon name="receipt" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.placas" outlined dense label="Placas" clearable>
            <template #prepend><q-icon name="directions_car" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtros.silo"
            :options="opcionesSilos"
            outlined
            dense
            label="Silo"
            emit-value
            map-options
            clearable
          />
        </div>
        <div class="col-12 col-md-2">
          <q-input
            v-model.number="filtros.toneladas"
            type="number"
            outlined
            dense
            label="Toneladas"
            clearable
          />
        </div>
        <div class="col-12 col-md-2">
          <q-checkbox v-model="filtros.hoy" label="Solo hoy" />
        </div>
      </div>
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-3">
          <q-input v-model="filtros.fechaInicio" outlined dense type="date" label="Fecha Inicio" />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="filtros.fechaFin" outlined dense type="date" label="Fecha Fin" />
        </div>
        <div class="col row justify-end q-gutter-sm">
          <q-btn
            outline
            color="grey-8"
            icon="filter_alt_off"
            label="Limpiar"
            @click="limpiarFiltros"
          />
          <q-btn
            color="positive"
            unelevated
            icon="description"
            label="Exportar Excel"
            @click="exportarExcel"
          />
        </div>
      </div>
    </q-card>

    <!-- Tabla de Volcado -->
    <q-card bordered flat class="shadow-1 border-grey">
      <q-table
        :rows="registrosFiltrados"
        :columns="columns"
        row-key="boletaId"
        flat
        :pagination="{ rowsPerPage: 0 }"
        :loading="loading"
      >
        <template v-slot:body-cell-estatusSilo="props">
          <q-td :props="props">
            <q-badge
              :color="
                props.value === 'Con Silo Asignado' || props.value === 'Con Almacen Asignado'
                  ? 'green-2'
                  : props.value === 'Rechazado'
                    ? 'red-2'
                    : 'orange-2'
              "
              :text-color="
                props.value === 'Con Silo Asignado' || props.value === 'Con Almacen Asignado'
                  ? 'green-10'
                  : props.value === 'Rechazado'
                    ? 'red-10'
                    : 'orange-10'
              "
            >
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-silo="props">
          <q-td :props="props">
            <span v-if="props.row.siloNombre">
              {{ props.row.siloNombre }}
              <!-- {{ props.row.siloNombre }} - {{ props.row.siloNumero }} -->
            </span>
            <span v-else class="text-grey-6">Sin asignar</span>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="primary"
              @click="verDetalleBoleta(props.row)"
            >
              <q-tooltip>Ver Detalle</q-tooltip>
            </q-btn>
            <!-- <q-btn
              flat
              round
              dense
              :icon="props.row.volcadoId ? 'edit' : 'add_circle'"
              :color="props.row.volcadoId ? 'blue' : 'positive'"
              @click="abrirAsignarSilo(props.row)"
            >
              <q-tooltip>{{ props.row.volcadoId ? 'Editar Silo' : 'Asignar Silo' }}</q-tooltip>
            </q-btn> -->
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-6">
            <q-icon name="warehouse" size="md" class="q-mr-sm" />
            No hay registros listos para volcado.
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Modal de Detalle de Boleta -->
    <q-dialog v-model="mostrarModalDetalle" persistent maximized>
      <q-card class="bg-grey-1">
        <!-- Header -->
        <q-toolbar
          :class="
            registroDetalleSeleccionado?.estatusSilo === 'Rechazado'
              ? 'bg-red-7 text-white'
              : 'bg-orange-7 text-white'
          "
        >
          <q-toolbar-title class="text-weight-bold">
            Volcado - Detalle de Boleta {{ detalleData?.noBoleta }}
            <q-badge
              v-if="registroDetalleSeleccionado?.estatusSilo === 'Rechazado'"
              color="white"
              text-color="red-9"
              class="q-ml-sm"
            >
              RECHAZADO
            </q-badge>
          </q-toolbar-title>
          <q-btn flat round dense icon="close" @click="cerrarDetalle" />
        </q-toolbar>

        <q-separator />

        <!-- Contenido principal -->
        <q-card-section class="scroll" style="max-height: calc(100vh - 64px)">
          <div class="row q-col-gutter-md" style="max-width: 1200px; margin: 0 auto">
            <!-- Panel Izquierdo: BOLETA -->
            <div class="col-12 col-md-7">
              <q-card bordered>
                <q-card-section class="bg-green-7 text-white">
                  <div class="text-h6 text-weight-bold text-center">BOLETA</div>
                  <div class="text-caption text-center">Precio aceptado por productor</div>
                </q-card-section>

                <q-card-section>
                  <!-- Datos de la Boleta -->
                  <div class="row q-col-gutter-sm">
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">FOLIO / BOLETA</div>
                      <div class="text-weight-bold">{{ detalleData?.noBoleta }}</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">PRODUCTOR</div>
                      <div class="text-weight-bold">{{ detalleData?.productor || '-' }}</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">FECHA Y HORA</div>
                      <div class="text-weight-bold">{{ detalleData?.fecha || '-' }}</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">TELEFONO</div>
                      <div class="text-weight-bold">{{ detalleData?.telefono || 'N/A' }}</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">COMPRADOR</div>
                      <div class="text-weight-bold">{{ detalleData?.comprador || '-' }}</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">ORIGEN</div>
                      <div class="text-weight-bold">{{ detalleData?.origen || '-' }}</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">PRECIO / KG</div>
                      <div class="text-weight-bold text-green-9 text-h6">
                        <!-- ${{ formatPrecio(detalleData?.precio) }} -->
                        ${{ formatPrecio(detalleData?.precio) }}
                      </div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">DESCUENTO (KG/TON)</div>
                      <div class="text-weight-bold">{{ formatNumber(detalleData?.descuento) }}</div>
                    </div>
                    <div v-if="campoPantallaVisible('calibre')" class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">CALIBRE</div>
                      <div class="text-weight-bold text-blue-9">
                        {{ detalleData?.calibre || '-' }}
                      </div>
                    </div>
                    <div v-if="campoPantallaVisible('humedad')" class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">HUMEDAD</div>
                      <div class="text-weight-bold">{{ detalleData?.humedad || 0 }}%</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">PESO BRUTO</div>
                      <div class="text-weight-bold">
                        {{ formatNumber(detalleData?.pesoBruto) }} kg
                      </div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">TON. APROX</div>
                      <div class="text-weight-bold">{{ formatNumber(detalleData?.tonsAprox) }}</div>
                    </div>
                  </div>

                  <q-separator class="q-my-md" />

                  <!-- Analisis de Calidad -->
                  <div class="text-subtitle2 text-weight-bold q-mb-sm">ANALISIS DE CALIDAD</div>
                  <TablaAnalisisDesplegable
                    :tipo-grano-id="detalleData?.granoId || 0"
                    :impurezas="detalleData?.impurezas || 0"
                    :r1="detalleData?.r1 || 0"
                    :r2="detalleData?.r2 || 0"
                    :cafes-lisos="detalleData?.cafesLisos || 0"
                    :manchados="detalleData?.manchados || 0"
                    :queb-mxc="detalleData?.quebMxc || 0"
                    :helados="detalleData?.helados || 0"
                    :alimonados="detalleData?.alimonados || 0"
                    :revolcados="detalleData?.revolcados || 0"
                    :suma-r2="detalleData?.sumaR2 || 0"
                    :total-danos-num="Number(detalleTotalDanos)"
                    :exportacion="detalleData?.exportacion || 0"
                    :calibre="detalleData?.calibre || ''"
                    :read-only="true"
                    :frijol-data-inicial="frijolDataInicial"
                    :camposConfig="camposConfigActual"
                  />

                  <!-- CAMPOS PERSONALIZADOS -->
                  <q-card v-if="camposPersonalizadosVisibles.length > 0" bordered class="bg-white q-mt-sm">
                    <q-card-section class="q-gutter-sm">
                      <div
                        v-for="campo in camposPersonalizadosVisibles"
                        :key="campo.claveCampo"
                        class="row items-center justify-between"
                      >
                        <div class="col text-body2 text-grey-8 text-weight-medium">
                          {{ campo.nombreMostrar }}
                        </div>
                        <div class="col-auto">
                          <q-input
                            :model-value="datosPersonalizados[campo.claveCampo] || ''"
                            dense
                            outlined
                            readonly
                            bg-color="grey-2"
                            input-class="text-right"
                            style="width: 160px"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- Fotos del Analisis -->
                  <div class="q-mt-md">
                    <div class="text-subtitle2 text-weight-bold q-mb-sm">
                      <q-icon name="photo_camera" class="q-mr-xs" />
                      FOTOS DEL ANALISIS
                    </div>
                    <div v-if="detalleFotos.length > 0" class="row q-col-gutter-sm">
                      <div v-for="(foto, idx) in detalleFotos" :key="idx" class="col-4 col-md-2">
                        <div
                          class="rounded-borders cursor-pointer overflow-hidden bg-grey-3"
                          style="width: 100%; height: 120px; position: relative"
                          @click="verFotoDetalle(foto)"
                        >
                          <img
                            :src="foto"
                            style="width: 100%; height: 100%; object-fit: cover; display: block"
                          />
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-grey-6 text-center q-pa-md bg-grey-3 rounded-borders">
                      Sin fotos disponibles
                    </div>
                  </div>

                  <!-- Firmas -->
                  <q-separator class="q-my-md" />
                  <div class="row q-col-gutter-md">
                    <div class="col-4 text-center">
                      <div class="bg-grey-3 q-pa-md rounded-borders" style="min-height: 80px">
                        <q-icon name="draw" size="md" color="grey-5" />
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">Analista</div>
                    </div>
                    <div class="col-4 text-center">
                      <div class="bg-grey-3 q-pa-md rounded-borders" style="min-height: 80px">
                        <q-icon name="draw" size="md" color="grey-5" />
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">Recepcionista</div>
                    </div>
                    <div class="col-4 text-center">
                      <div class="bg-grey-3 q-pa-md rounded-borders" style="min-height: 80px">
                        <q-icon name="draw" size="md" color="grey-5" />
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">Autorizo</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Panel Derecho: BODEGA (frijol) o SILO/PRODUCCIÓN (garbanzo) -->
            <div class="col-12 col-md-5">
              <!-- ═══ FRIJOL: Selección de BODEGA ═══ -->
              <template v-if="esFrijol">
                <q-card bordered class="q-mb-md">
                  <q-card-section class="bg-brown-8 text-white">
                    <div class="text-h6 text-weight-bold">ALMACÉN</div>
                    <div
                      class="text-caption"
                      v-if="registroDetalleSeleccionado?.estatusSilo === 'Sin Silo Asignado'"
                    >
                      Asignación de almacén para frijol
                    </div>
                  </q-card-section>
                  <q-card-section>
                    <!-- Bodega actualmente asignada -->
                    <div
                      v-if="registroDetalleSeleccionado?.siloNombre"
                      class="q-mb-md bg-green-1 q-pa-md rounded-borders"
                    >
                      <div class="text-caption text-grey-7">Almacén Asignado:</div>
                      <div class="text-weight-bold text-green-9 text-h6">
                        {{ registroDetalleSeleccionado.siloNombre }}
                      </div>
                    </div>

                    <template
                      v-if="registroDetalleSeleccionado?.estatusSilo === 'Sin Silo Asignado'"
                    >
                      <q-select
                        v-model="detalleBodegaSeleccionada"
                        :options="bodegas.filter((b) => b.activo)"
                        option-value="id"
                        option-label="nombre"
                        outlined
                        label="Seleccionar Almacén para Frijol"
                        emit-value
                        map-options
                      />
                    </template>

                    <!-- Motivo de Rechazo (solo si fue rechazado) -->
                    <template v-if="detalleData?.volcadoStatus === 'Rechazado'">
                      <q-separator class="q-my-md" />
                      <div
                        class="bg-red-1 q-pa-md rounded-borders"
                        style="border: 1px solid #fca5a5"
                      >
                        <div class="text-subtitle2 text-weight-bold text-red-9 q-mb-sm">
                          <q-icon name="report_problem" class="q-mr-xs" />
                          ¡VOLCADO FUE RECHAZADO!
                        </div>
                        <div class="text-body2 text-grey-9">
                          {{ detalleData?.volcadoObservaciones || 'Sin observaciones' }}
                        </div>
                        <div v-if="detalleData?.volcadoDatosAdicionales" class="q-mt-md">
                          <div class="text-caption text-weight-bold text-grey-7 q-mb-sm">
                            <q-icon name="photo_camera" class="q-mr-xs" />
                            EVIDENCIA FOTOGRAFICA
                          </div>
                          <div
                            class="rounded-borders cursor-pointer overflow-hidden bg-grey-3"
                            style="max-width: 300px; position: relative"
                            @click="verFotoDetalle(detalleData.volcadoDatosAdicionales)"
                          >
                            <img
                              :src="detalleData.volcadoDatosAdicionales"
                              style="width: 100%; height: auto; display: block; border-radius: 8px"
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                  </q-card-section>
                </q-card>

                <!-- Botones frijol -->
                <div
                  v-if="registroDetalleSeleccionado?.estatusSilo === 'Sin Silo Asignado'"
                  class="row justify-center q-gutter-md"
                >
                  <q-btn
                    color="positive"
                    unelevated
                    size="lg"
                    icon="check"
                    label="Aceptar Volcado"
                    class="q-px-xl"
                    :disable="!detalleBodegaSeleccionada"
                    @click="aceptarVolcado"
                  />
                  <q-btn
                    color="negative"
                    unelevated
                    size="lg"
                    icon="close"
                    label="Rechazar"
                    class="q-px-xl"
                    @click="abrirModalRechazo"
                  />
                </div>
              </template>

              <!-- ═══ GARBANZO / OTROS: Selección de SILO y PRODUCCIÓN ═══ -->
              <template v-else>
                <!-- Seccion SILO (por calibre) -->
                <q-card bordered class="q-mb-md">
                  <q-card-section class="bg-deep-purple-9 text-white">
                    <div class="text-h6 text-weight-bold">SILO</div>
                    <div
                      class="text-caption"
                      v-if="registroDetalleSeleccionado?.estatusSilo === 'Sin Silo Asignado'"
                    >
                      Asignación por calibre
                    </div>
                  </q-card-section>
                  <q-card-section>
                    <!-- Silo actualmente asignado -->
                    <div
                      v-if="registroDetalleSeleccionado?.siloNombre"
                      class="q-mb-md bg-green-1 q-pa-md rounded-borders"
                    >
                      <div class="text-caption text-grey-7">Silo Asignado:</div>
                      <div class="text-weight-bold text-green-9 text-h6">
                        {{ registroDetalleSeleccionado.siloNombre }}
                      </div>
                    </div>

                    <template
                      v-if="registroDetalleSeleccionado?.estatusSilo === 'Sin Silo Asignado'"
                    >
                      <q-select
                        v-model="detalleSiloCalibreSeleccionado"
                        :options="silosCalibre.filter((s) => s.activo)"
                        option-value="id"
                        :option-label="
                          (s: SiloCalibre) => `${s.nombre} (${s.capacidad_toneladas} ton)`
                        "
                        outlined
                        label="Seleccionar Silo por Calibre"
                        emit-value
                        map-options
                      >
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section>
                              <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                              <q-item-label caption>
                                Capacidad: {{ scope.opt.capacidad_toneladas }} ton
                                <span v-if="scope.opt.descripcion">
                                  - {{ scope.opt.descripcion }}</span
                                >
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </template>

                    <!-- Motivo de Rechazo (solo si fue rechazado) -->
                    <template v-if="detalleData?.volcadoStatus === 'Rechazado'">
                      <q-separator class="q-my-md" />
                      <div
                        class="bg-red-1 q-pa-md rounded-borders"
                        style="border: 1px solid #fca5a5"
                      >
                        <div class="text-subtitle2 text-weight-bold text-red-9 q-mb-sm">
                          <q-icon name="report_problem" class="q-mr-xs" />
                          ¡VOLCADO FUE RECHAZADO!
                        </div>
                        <div class="text-body2 text-grey-9">
                          {{ detalleData?.volcadoObservaciones || 'Sin observaciones' }}
                        </div>
                        <div v-if="detalleData?.volcadoDatosAdicionales" class="q-mt-md">
                          <div class="text-caption text-weight-bold text-grey-7 q-mb-sm">
                            <q-icon name="photo_camera" class="q-mr-xs" />
                            EVIDENCIA FOTOGRAFICA
                          </div>
                          <div
                            class="rounded-borders cursor-pointer overflow-hidden bg-grey-3"
                            style="max-width: 300px; position: relative"
                            @click="verFotoDetalle(detalleData.volcadoDatosAdicionales)"
                          >
                            <img
                              :src="detalleData.volcadoDatosAdicionales"
                              style="width: 100%; height: auto; display: block; border-radius: 8px"
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                  </q-card-section>
                </q-card>

                <!-- Seccion PRODUCCIÓN (silo pulmón) - solo si no tiene silo asignado -->
                <q-card
                  v-if="registroDetalleSeleccionado?.estatusSilo === 'Sin Silo Asignado'"
                  bordered
                  class="q-mb-md"
                >
                  <q-card-section class="bg-teal-9 text-white">
                    <div class="text-h6 text-weight-bold">PRODUCCIÓN</div>
                    <div class="text-caption">Silo pulmón / tren de limpia</div>
                  </q-card-section>
                  <q-card-section>
                    <q-select
                      v-model="detalleSiloPulmonSeleccionado"
                      :options="silosPulmon.filter((s) => s.activo)"
                      option-value="id"
                      :option-label="
                        (s: SiloPulmon) => `${s.nombre} - ${s.tipo} (${s.capacidad_toneladas} ton)`
                      "
                      outlined
                      label="Seleccionar Silo Pulmón"
                      emit-value
                      map-options
                    >
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                            <q-item-label caption>
                              Tipo: {{ scope.opt.tipo }} | Capacidad:
                              {{ scope.opt.capacidad_toneladas }} ton
                              <span v-if="scope.opt.descripcion">
                                - {{ scope.opt.descripcion }}</span
                              >
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>

                    <div class="q-mt-md bg-blue-1 q-pa-sm rounded-borders">
                      <div class="text-caption text-blue-9">
                        <q-icon name="info" size="xs" class="q-mr-xs" />
                        Los silos pulmón son utilizados como paso intermedio antes de entrar al tren
                        de limpia o producción.
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Botones garbanzo -->
                <div
                  v-if="registroDetalleSeleccionado?.estatusSilo === 'Sin Silo Asignado'"
                  class="row justify-center q-gutter-md"
                >
                  <q-btn
                    color="positive"
                    unelevated
                    size="lg"
                    icon="check"
                    label="Aceptar Volcado"
                    class="q-px-xl"
                    :disable="!detalleSiloCalibreSeleccionado && !detalleSiloPulmonSeleccionado"
                    @click="aceptarVolcado"
                  />
                  <q-btn
                    color="negative"
                    unelevated
                    size="lg"
                    icon="close"
                    label="Rechazar"
                    class="q-px-xl"
                    @click="abrirModalRechazo"
                  />
                </div>
              </template>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal de Asignar Silo (simple) -->
    <q-dialog v-model="mostrarModalSilo">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="warehouse" class="q-mr-sm" />
            Asignar Silo / Almacén
          </div>
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            <div class="text-body2 text-grey-7">
              Ticket: <span class="text-weight-bold">{{ registroSeleccionado?.ticket }}</span>
            </div>
            <div class="text-body2 text-grey-7">
              Boleta: <span class="text-weight-bold">{{ registroSeleccionado?.noBoleta }}</span>
            </div>
            <div class="text-body2 text-grey-7">
              Toneladas:
              <span class="text-weight-bold">{{
                formatNumber(registroSeleccionado?.tonsAprox)
              }}</span>
            </div>
          </div>

          <q-select
            v-model="siloSeleccionado"
            :options="listaSilos"
            option-value="id"
            option-label="displayName"
            outlined
            label="Seleccionar Silo / Almacen"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Debe seleccionar un silo']"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label
                    >{{ scope.opt.nombreBodega }} - Silo {{ scope.opt.numeroSilo }}</q-item-label
                  >
                  <q-item-label caption>Capacidad: {{ scope.opt.capacidadTon }} ton</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            label="Asignar"
            @click="confirmarAsignacion"
            :disable="!siloSeleccionado"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de Rechazo de Volcado -->
    <q-dialog v-model="mostrarModalRechazo" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-negative text-white">
          <div class="text-h6">
            <q-icon name="report_problem" class="q-mr-sm" />
            Rechazar Volcado - Boleta {{ registroDetalleSeleccionado?.noBoleta }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle2 text-weight-bold q-mb-md">Motivos del Rechazo</div>

          <div class="q-gutter-sm q-mb-md">
            <q-checkbox v-model="rechazoMotivos.plaga" label="Plaga detectada" color="negative" />
            <q-checkbox
              v-model="rechazoMotivos.humedad"
              label="Humedad fuera de rango"
              color="negative"
            />
            <q-checkbox
              v-model="rechazoMotivos.calidad"
              label="Calidad insuficiente"
              color="negative"
            />
            <q-checkbox
              v-model="rechazoMotivos.contaminacion"
              label="Contaminación"
              color="negative"
            />
          </div>

          <q-input
            v-model="rechazoMotivos.otros"
            outlined
            type="textarea"
            label="Otros motivos / Observaciones"
            :rows="3"
            placeholder="Describa el motivo del rechazo..."
          />

          <div class="q-mt-md">
            <div class="text-caption text-grey-7 q-mb-sm">Evidencia fotográfica (OBLIGATORIO)</div>
            <!-- Area de captura de foto -->

            <div v-if="rechazoFotoBase64" class="q-mb-md">
              <q-img
                :src="rechazoFotoBase64"
                spinner-color="white"
                style="height: 200px; max-width: 100%; border-radius: 8px"
                class="shadow-2"
              >
                <div class="absolute-top-right">
                  <q-btn
                    round
                    dense
                    color="negative"
                    icon="delete"
                    @click="rechazoFotoBase64 = null"
                  />
                </div>
              </q-img>
            </div>

            <q-btn
              unelevated
              color="deep-purple-9"
              icon="photo_camera"
              label="Tomar Foto"
              @click="handleTakePhoto"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-8" @click="mostrarModalRechazo = false" />
          <q-btn
            color="negative"
            unelevated
            label="Confirmar Rechazo"
            icon="close"
            :disable="!tieneMotivosRechazo"
            @click="confirmarRechazoVolcado"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>

  <q-dialog v-model="cameraDialog" persistent>
    <q-card style="width: 400px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Tomar Fotografía</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup @click="stopCamera" />
      </q-card-section>

      <q-card-section>
        <video
          ref="videoRef"
          autoplay
          playsinline
          style="width: 100%; border-radius: 8px; background: #000"
        ></video>
        <canvas ref="canvasRef" v-show="false"></canvas>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-md">
        <q-btn color="primary" icon="photo_camera" label="Capturar" @click="captureImage" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, reactive, watch } from 'vue';
import { api } from 'src/boot/axios';
import { Notify, useQuasar, exportFile } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { useOfflineStore } from 'src/stores/offlineStore';
import type { QTableColumn } from 'quasar';
import TablaAnalisisDesplegable from 'src/pages/analisis/TablaAnalisisDesplegable.vue';
// --- DEFINIR INTERFACES ---
interface RegistroVolcado {
  numero: number;
  ticket: string | number;
  noBoleta: string;
  fecha: string;
  tonsAprox: number;
  chofer: string;
  placas: string;
  siloNombre?: string;
  siloNumero?: string;
  siloId?: number;
  estatusSilo: string;
  boletaId: number;
  volcadoId?: number;
  granoId?: number;
}

interface DetalleBoletaData {
  noBoleta: string;
  productor?: string;
  fecha?: string;
  telefono?: string;
  comprador?: string;
  origen?: string;
  precio?: number;
  descuento?: number;
  calibre?: string;
  humedad?: number;
  pesoBruto?: number;
  tonsAprox?: number;
  impurezas?: number;
  r1?: number;
  sumaR2?: number;
  r2?: number;
  cafesLisos?: number;
  manchados?: number;
  quebMxc?: number;
  helados?: number;
  alimonados?: number;
  revolcados?: number;
  exportacion?: number;
  datosAdicionales?: string;
  granoId?: number;
  tipoGrano?: string;
  volcadoStatus?: string;
  volcadoObservaciones?: string;
  volcadoDatosAdicionales?: string;
}

interface Silo {
  id: number;
  nombreBodega: string;
  numeroSilo: string | number;
  capacidadTon: number;
  displayName?: string;
}

interface SiloCalibre {
  id: number;
  nombre: string;
  calibre_id: number;
  capacidad_toneladas: number;
  descripcion?: string;
  activo: boolean;
  sede_id: number;
}

interface SiloPulmon {
  id: number;
  nombre: string;
  capacidad_toneladas: number;
  descripcion?: string;
  tipo: 'ENTRADA' | 'TEMPORAL' | 'SALIDA';
  activo: boolean;
  sede_id: number;
}

interface Bodega {
  id: number;
  nombre: string;
  activo: boolean;
}

const $q = useQuasar();
const authStore = useAuthStore();
const offlineStore = useOfflineStore();
const isOnline = ref(window.navigator.onLine);
const _syncOnline = () => { isOnline.value = window.navigator.onLine; };

// Estado
const registros = ref<RegistroVolcado[]>([]);
const listaSilos = ref<Silo[]>([]);
const loading = ref(false);
const mostrarFiltros = ref(true);
const mostrarModalSilo = ref(false);
const registroSeleccionado = ref<RegistroVolcado | null>(null);
const siloSeleccionado = ref<number | null>(null);

const resumen = ref({
  totalDelDia: 0,
  conSiloAsignado: 0,
  sinSiloAsignado: 0,
  totalToneladas: 0,
});
const uploadedPhotos = ref<string[]>([]);
function captureImage() {
  if (videoRef.value && canvasRef.value) {
    const video = videoRef.value;
    const canvas = canvasRef.value;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 1. Convertir a Base64
      const fotoBase64 = canvas.toDataURL('image/jpeg', 0.8);

      // 2. ASIGNAR A LA VARIABLE DE RECHAZO (Esto es lo que falta)
      rechazoFotoBase64.value = fotoBase64;

      // Opcional: si quieres mantener el histórico
      uploadedPhotos.value.push(fotoBase64);

      stopCamera();
      cameraDialog.value = false;

      Notify.create({ type: 'positive', message: 'Foto capturada.' });
    }
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
    stream.value = null;
  }
}

const cameraDialog = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);

async function handleTakePhoto() {
  try {
    // Abrir el diálogo
    cameraDialog.value = true;

    // Pedir permiso para la cámara
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }, // 'environment' usa la cámara trasera en celulares
      audio: false,
    });

    // Asignar el stream al elemento video
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value;
    }
  } catch (err) {
    console.error('Error al acceder a la cámara:', err);
    Notify.create({ type: 'negative', message: 'No se pudo acceder a la cámara.' });
    cameraDialog.value = false;
  }
}

// Estado del modal de detalle
const mostrarModalDetalle = ref(false);
const detalleData = ref<DetalleBoletaData | null>(null);
const registroDetalleSeleccionado = ref<RegistroVolcado | null>(null);
const detalleSiloSeleccionado = ref<number | null>(null);
const detallePhotoRechazo = ref<string | null>(null);
const detalleMotivos = reactive({
  plaga: false,
  humedad: false,
  otros: '',
});

// Estado del modal de rechazo
const mostrarModalRechazo = ref(false);
const rechazoMotivos = reactive({
  plaga: false,
  humedad: false,
  calidad: false,
  contaminacion: false,
  otros: '',
});
const rechazoArchivo = ref<File | null>(null);
const rechazoFotoBase64 = ref<string | null>(null);
// const rechazoFileInputRef = ref<HTMLInputElement | null>(null);

const tieneMotivosRechazo = computed(() => {
  return (
    rechazoMotivos.plaga ||
    rechazoMotivos.humedad ||
    rechazoMotivos.calidad ||
    rechazoMotivos.contaminacion ||
    (rechazoMotivos.otros && rechazoMotivos.otros.trim().length > 0)
  );
});

// Catálogos de silos por calibre, pulmón y bodegas
const silosCalibre = ref<SiloCalibre[]>([]);
const silosPulmon = ref<SiloPulmon[]>([]);
const bodegas = ref<Bodega[]>([]);
const detalleSiloCalibreSeleccionado = ref<number | null>(null);
const detalleSiloPulmonSeleccionado = ref<number | null>(null);
const detalleBodegaSeleccionada = ref<number | null>(null);

const esFrijol = computed(() => detalleData.value?.tipoGrano === 'Frijol');

const filtros = reactive({
  ticket: '',
  boleta: '',
  placas: '',
  silo: '',
  toneladas: null as number | null,
  hoy: false,
  fechaInicio: '',
  fechaFin: '',
});

// Columnas de la tabla
const columns: QTableColumn[] = [
  { name: 'numero', label: 'No', field: 'numero', align: 'left' },
  { name: 'ticket', label: 'Ticket', field: 'ticket', align: 'left', sortable: true },
  { name: 'noBoleta', label: 'Boleta', field: 'noBoleta', align: 'left', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  {
    name: 'tonsAprox',
    label: 'Ton. Aprox',
    field: (row: RegistroVolcado) => formatNumber(row.tonsAprox), // Cambiado any
    align: 'right',
  },
  { name: 'chofer', label: 'Chofer', field: 'chofer', align: 'left' },
  { name: 'placas', label: 'Placas', field: 'placas', align: 'left' },
  { name: 'silo', label: 'Silo / Almacen', field: 'siloNombre', align: 'left' },
  { name: 'estatusSilo', label: 'Estatus', field: 'estatusSilo', align: 'center' },
  { name: 'acciones', label: 'Accion', field: 'boletaId', align: 'center' },
];

// Opciones de silos para filtro
const opcionesSilos = computed(() => {
  const opciones = [{ label: 'Todos', value: '' }];
  listaSilos.value.forEach((s) => {
    opciones.push({
      label: `${s.nombreBodega} - ${s.numeroSilo}`,
      value: String(s.id), // Convertir el número a string
    });
  });
  return opciones;
});

// Filtrado de registros
const registrosFiltrados = computed(() => {
  let lista = registros.value;

  if (filtros.ticket) {
    lista = lista.filter((r) => r.ticket?.toString().includes(filtros.ticket));
  }

  if (filtros.boleta) {
    lista = lista.filter((r) => r.noBoleta?.toString().includes(filtros.boleta));
  }

  if (filtros.placas) {
    lista = lista.filter((r) => r.placas?.toLowerCase().includes(filtros.placas.toLowerCase()));
  }

  if (filtros.silo) {
    lista = lista.filter((r) => r.siloId === Number(filtros.silo));
  }

  if (filtros.toneladas !== null && filtros.toneladas > 0) {
    lista = lista.filter((r) => r.tonsAprox >= filtros.toneladas!);
  }

  if (filtros.hoy) {
    const hoy = new Date().toLocaleDateString();
    lista = lista.filter((r) => new Date(r.fecha).toLocaleDateString() === hoy);
  } else if (filtros.fechaInicio || filtros.fechaFin) {
    const inicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
    const fin = filtros.fechaFin ? new Date(filtros.fechaFin + 'T23:59:59') : null;
    lista = lista.filter((r) => {
      const fechaReg = new Date(r.fecha);
      if (inicio && fechaReg < inicio) return false;
      if (fin && fechaReg > fin) return false;
      return true;
    });
  }

  return lista;
});

// Funciones de carga
async function cargarRegistros() {
  loading.value = true;
  try {
    const { data } = await api.get('/api/volcado', {
      params: { sedeId: authStore.sedeActivaId || 0 },
    });
    registros.value = data;
  } catch (error) {
    console.error('Error al cargar registros:', error);
    Notify.create({ type: 'negative', message: 'Error al cargar registros de volcado' });
  } finally {
    loading.value = false;
  }
}

async function cargarResumen() {
  try {
    const { data } = await api.get('/api/volcado/resumen', {
      params: { sedeId: authStore.sedeActivaId || 0 },
    });
    resumen.value = data;
  } catch (error) {
    console.error('Error al cargar resumen:', error);
  }
}

// --- CORREGIR CARGA DE SILOS (map) ---
async function cargarSilos() {
  try {
    const { data } = await api.get('/api/volcado/silos', {
      params: { sedeId: authStore.sedeActivaId || 0 },
    });
    // Tipamos el parámetro 's' como Silo
    listaSilos.value = data.map((s: Silo) => ({
      ...s,
      displayName: `${s.nombreBodega} - Silo ${s.numeroSilo} (${s.capacidadTon} ton)`,
    }));
  } catch (error) {
    console.error('Error al cargar silos:', error);
  }
}
// Funciones de UI
function formatNumber(val: number | string | undefined | null): string {
  const num = Number(val);
  if (!Number.isFinite(num)) return '0.00';
  return num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function limpiarFiltros() {
  filtros.ticket = '';
  filtros.boleta = '';
  filtros.placas = '';
  filtros.silo = '';
  filtros.toneladas = null;
  filtros.hoy = false;
  filtros.fechaInicio = '';
  filtros.fechaFin = '';
}

// function abrirAsignarSilo(registro: RegistroVolcado) {
//   // Cambiado any
//   registroSeleccionado.value = registro;
//   siloSeleccionado.value = registro.siloId || null;
//   mostrarModalSilo.value = true;
// }

async function confirmarAsignacion() {
  if (!registroSeleccionado.value || !siloSeleccionado.value) return;

  if (!window.navigator.onLine) {
    offlineStore.agregarVolcado({
      tipo: 'asignar-silo',
      boletaId: registroSeleccionado.value.boletaId,
      sedeId: authStore.sedeActivaId || 0,
      siloId: siloSeleccionado.value,
      _localId: 'LOCAL_VOLC_' + Date.now(),
      _syncStatus: 'pending',
      _descripcion: `Asignar silo boleta #${registroSeleccionado.value.boletaId}`,
    });
    Notify.create({ type: 'warning', icon: 'cloud_off', message: 'Sin conexión — asignación guardada localmente. Se sincronizará al volver la red.', timeout: 4000 });
    mostrarModalSilo.value = false;
    return;
  }

  $q.loading.show({ message: 'Asignando silo...' });
  try {
    await api.post(
      '/api/volcado/asignar-silo',
      {
        boletaId: registroSeleccionado.value.boletaId,
        siloId: siloSeleccionado.value,
      },
      { params: { sedeId: authStore.sedeActivaId || 0 } },
    );

    Notify.create({ type: 'positive', message: 'Silo asignado correctamente' });
    mostrarModalSilo.value = false;
    registroSeleccionado.value = null;
    siloSeleccionado.value = null;
    await cargarRegistros();
    await cargarResumen();
  } catch (error) {
    console.error('Error al asignar silo:', error);
    Notify.create({ type: 'negative', message: 'Error al asignar silo' });
  } finally {
    $q.loading.hide();
  }
}

// Cargar catálogos de silos por calibre y pulmón
async function cargarSilosCalibre() {
  try {
    const { data } = await api.get('/api/volcado/silos-calibre', {
      params: { sedeId: authStore.sedeActivaId || 0 },
    });
    silosCalibre.value = data;
  } catch (error) {
    console.error('Error al cargar silos por calibre:', error);
  }
}

async function cargarSilosPulmon() {
  try {
    const { data } = await api.get('/api/volcado/silos-pulmon', {
      params: { sedeId: authStore.sedeActivaId || 0 },
    });
    silosPulmon.value = data;
  } catch (error) {
    console.error('Error al cargar silos pulmón:', error);
  }
}

async function cargarBodegas() {
  try {
    const { data } = await api.get('/api/catalogos/bodegas', {
      params: { sede_id: authStore.sedeActivaId || 0 },
    });
    bodegas.value = data;
  } catch (error) {
    console.error('Error al cargar bodegas:', error);
  }
}

// --- Funciones del modal de detalle ---
function formatPrecio(v: number | string | null | undefined): string {
  if (v === null || v === undefined) return '0.00';
  const num = Number(v);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}

const detalleTotalDanos = computed(() => {
  if (!detalleData.value) return '0.00';
  const imp = Number(detalleData.value.impurezas || 0);
  const r1 = Number(detalleData.value.r1 || 0);
  const sumaR2 = Number(detalleData.value.sumaR2 || 0);
  return (imp + r1 + sumaR2).toFixed(2);
});

const detalleFotos = computed(() => {
  if (!detalleData.value?.datosAdicionales) return [];
  try {
    const datos = JSON.parse(detalleData.value.datosAdicionales);
    return datos.fotos || [];
  } catch {
    return [];
  }
});

const frijolDataInicial = computed(() => {
  if (!detalleData.value?.datosAdicionales) return undefined;
  try {
    const datos = JSON.parse(detalleData.value.datosAdicionales);
    return datos.frijol_datos || undefined;
  } catch {
    return undefined;
  }
});

interface CampoConfig {
  claveCampo: string;
  visible: boolean;
  nombreMostrar?: string;
  granoId: number | null;
}

const camposAnalisisConfig = ref<CampoConfig[]>([]);

const camposConfigActual = computed(() => {
  const granoId = detalleData.value?.granoId ?? null;
  return camposAnalisisConfig.value.filter(c => c.granoId === granoId);
});

function campoPantallaVisible(clave: string): boolean {
  if (camposConfigActual.value.length === 0) return true;
  const cfg = camposConfigActual.value.find(c => c.claveCampo === clave);
  return !cfg || cfg.visible;
}

const CAMPOS_PREDEFINIDOS = new Set([
  'calibre', 'humedad', 'impurezas', 'r1', 'r2', 'cafesLisos', 'manchados',
  'quebMxc', 'helados', 'alimonados', 'revolcados', 'exportacion',
  'frijol_impurezas', 'frijol_piedras', 'frijol_mitades', 'frijol_oscuros',
  'frijol_arrugados', 'frijol_manchados', 'frijol_verdes', 'frijol_tierra',
  'frijol_otras_variedades', 'frijol_granos_pequenos', 'frijol_danos_campo',
  'frijol_plaga_viva', 'frijol_plaga_muerta',
]);

const camposPersonalizadosVisibles = computed(() =>
  camposConfigActual.value.filter(c => c.visible && !CAMPOS_PREDEFINIDOS.has(c.claveCampo))
);

const datosPersonalizados = computed<Record<string, string>>(() => {
  const raw = detalleData.value?.datosAdicionales;
  if (!raw) return {};
  try {
    const datos = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return datos as Record<string, string>;
  } catch {
    return {};
  }
});

async function cargarConfigCampos() {
  try {
    const sedeId = authStore.sedeActivaId ?? 0;
    const { data } = await api.get<{ campos: (CampoConfig & { pantalla: string })[] }>(
      '/api/configuracion-recepcion',
      { params: { sedeId } },
    );
    camposAnalisisConfig.value = (data.campos ?? [])
      .filter(c => c.pantalla === 'ANALISIS')
      .map(c => ({ ...c, visible: !!c.visible, granoId: c.granoId ?? null }));
  } catch {
    // Si falla, se muestran todos los campos
  }
}

async function verDetalleBoleta(registro: RegistroVolcado) {
  registroDetalleSeleccionado.value = registro;
  detalleSiloSeleccionado.value = registro.siloId || null;

  // Cargar detalle de la boleta desde el API
  try {
    $q.loading.show({ message: 'Cargando detalle...' });
    const { data } = await api.get(`/api/volcado/detalle/${registro.boletaId}`, {
      params: { sedeId: authStore.sedeActivaId || 0 },
    });
    detalleData.value = data;
  } catch (error) {
    console.error('Error al cargar detalle:', error);
    // Usar datos básicos del registro si falla el API
    detalleData.value = {
      noBoleta: registro.noBoleta,
      fecha: registro.fecha,
      tonsAprox: registro.tonsAprox,
    };
  } finally {
    $q.loading.hide();
  }

  // Reset selections
  detalleSiloCalibreSeleccionado.value = null;
  detalleSiloPulmonSeleccionado.value = null;
  detalleBodegaSeleccionada.value = null;
  detalleMotivos.plaga = false;
  detalleMotivos.humedad = false;
  detalleMotivos.otros = '';
  detallePhotoRechazo.value = null;

  mostrarModalDetalle.value = true;
}

function cerrarDetalle() {
  mostrarModalDetalle.value = false;
  detalleData.value = null;
  registroDetalleSeleccionado.value = null;
  detalleSiloSeleccionado.value = null;
  detalleSiloCalibreSeleccionado.value = null;
  detalleSiloPulmonSeleccionado.value = null;
  detalleBodegaSeleccionada.value = null;
}

function verFotoDetalle(url: string) {
  $q.dialog({
    title: 'Foto del Analisis',
    message: `<div style="text-align: center;"><img src="${url}" style="max-width: 100%; max-height: 70vh; border-radius: 8px;" /></div>`,
    html: true,
    fullWidth: true,
    ok: { label: 'Cerrar', color: 'primary', flat: true },
  });
}

async function aceptarVolcado() {
  if (!registroDetalleSeleccionado.value) return;

  if (esFrijol.value) {
    if (!detalleBodegaSeleccionada.value) {
      Notify.create({ type: 'warning', message: 'Debe seleccionar una bodega antes de aceptar' });
      return;
    }
  } else {
    if (!detalleSiloCalibreSeleccionado.value && !detalleSiloPulmonSeleccionado.value) {
      Notify.create({
        type: 'warning',
        message: 'Debe seleccionar al menos un silo (calibre o pulmón) antes de aceptar',
      });
      return;
    }
  }

  if (!window.navigator.onLine) {
    offlineStore.agregarVolcado({
      tipo: 'asignar-silo',
      boletaId: registroDetalleSeleccionado.value.boletaId,
      sedeId: authStore.sedeActivaId || 0,
      siloCalibreId: esFrijol.value ? null : detalleSiloCalibreSeleccionado.value,
      siloPulmonId: esFrijol.value ? null : detalleSiloPulmonSeleccionado.value,
      bodegaId: esFrijol.value ? detalleBodegaSeleccionada.value : null,
      _localId: 'LOCAL_VOLC_' + Date.now(),
      _syncStatus: 'pending',
      _descripcion: `Asignar silo detalle boleta #${registroDetalleSeleccionado.value.boletaId}`,
    });
    Notify.create({ type: 'warning', icon: 'cloud_off', message: 'Sin conexión — asignación guardada localmente. Se sincronizará al volver la red.', timeout: 4000 });
    cerrarDetalle();
    return;
  }

  $q.loading.show({ message: 'Asignando...' });
  try {
    await api.post(
      '/api/volcado/asignar-silo',
      {
        boletaId: registroDetalleSeleccionado.value.boletaId,
        siloCalibreId: esFrijol.value ? null : detalleSiloCalibreSeleccionado.value,
        siloPulmonId: esFrijol.value ? null : detalleSiloPulmonSeleccionado.value,
        bodegaId: esFrijol.value ? detalleBodegaSeleccionada.value : null,
      },
      { params: { sedeId: authStore.sedeActivaId || 0 } },
    );

    Notify.create({ type: 'positive', message: 'Volcado aceptado correctamente.' });
    cerrarDetalle();
    await cargarRegistros();
    await cargarResumen();
  } catch (error) {
    console.error('Error al aceptar volcado:', error);
    Notify.create({ type: 'negative', message: 'Error al asignar' });
  } finally {
    $q.loading.hide();
  }
}

function abrirModalRechazo() {
  rechazoMotivos.plaga = false;
  rechazoMotivos.humedad = false;
  rechazoMotivos.calidad = false;
  rechazoMotivos.contaminacion = false;
  rechazoMotivos.otros = '';
  rechazoArchivo.value = null;
  rechazoFotoBase64.value = null;
  mostrarModalRechazo.value = true;
}

// function onRechazoFileSelected(event: Event) {
//   const input = event.target as HTMLInputElement;
//   const file = input.files?.[0] || null;
//   if (!file) {
//     rechazoFotoBase64.value = null;
//     return;
//   }
//   const reader = new FileReader();
//   reader.onload = (e) => {
//     rechazoFotoBase64.value = e.target?.result as string;
//   };
//   reader.readAsDataURL(file);
//   // Reset input para permitir tomar otra foto
//   input.value = '';
// }

async function confirmarRechazoVolcado() {
  if (!registroDetalleSeleccionado.value) return;

  const motivos: string[] = [];
  if (rechazoMotivos.plaga) motivos.push('Plaga detectada');
  if (rechazoMotivos.humedad) motivos.push('Humedad fuera de rango');
  if (rechazoMotivos.calidad) motivos.push('Calidad insuficiente');
  if (rechazoMotivos.contaminacion) motivos.push('Contaminación');
  if (rechazoMotivos.otros) motivos.push(`Otros: ${rechazoMotivos.otros}`);

  if (!window.navigator.onLine) {
    offlineStore.agregarVolcado({
      tipo: 'rechazar',
      boletaId: registroDetalleSeleccionado.value.boletaId,
      sedeId: authStore.sedeActivaId || 0,
      motivos: motivos.join(', '),
      evidencia: rechazoFotoBase64.value,
      _localId: 'LOCAL_VOLC_' + Date.now(),
      _syncStatus: 'pending',
      _descripcion: `Rechazar volcado boleta #${registroDetalleSeleccionado.value.boletaId}`,
    });
    Notify.create({ type: 'warning', icon: 'cloud_off', message: 'Sin conexión — rechazo guardado localmente. Se sincronizará al volver la red.', timeout: 4000 });
    mostrarModalRechazo.value = false;
    cerrarDetalle();
    return;
  }

  $q.loading.show({ message: 'Procesando rechazo...' });
  try {
    await api.post(
      '/api/volcado/rechazar',
      {
        boletaId: registroDetalleSeleccionado.value.boletaId,
        motivos: motivos.join(', '),
        evidencia: rechazoFotoBase64.value,
      },
      { params: { sedeId: authStore.sedeActivaId || 0 } },
    );

    Notify.create({ type: 'info', message: 'Volcado rechazado correctamente.' });
    mostrarModalRechazo.value = false;
    cerrarDetalle();
    await cargarRegistros();
    await cargarResumen();
  } catch (error) {
    console.error('Error al rechazar volcado:', error);
    Notify.create({ type: 'negative', message: 'Error al rechazar volcado' });
  } finally {
    $q.loading.hide();
  }
}

function exportarExcel() {
  const header = [
    'No',
    'Ticket',
    'Boleta',
    'Fecha',
    'Ton. Aprox',
    'Chofer',
    'Placas',
    'Silo',
    'Estatus',
  ];
  const rows = registrosFiltrados.value.map((row) => [
    row.numero,
    row.ticket,
    row.noBoleta,
    row.fecha,
    row.tonsAprox,
    row.chofer,
    row.placas,
    row.siloNombre || 'Sin asignar',
    row.estatusSilo,
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const status = exportFile(
    `Volcado_${new Date().toISOString().slice(0, 10)}.csv`,
    '\ufeff' + csvContent,
    'text/csv',
  );

  if (status !== true) {
    Notify.create({ type: 'negative', message: 'Error al generar el archivo' });
  }
}

// Lifecycle
onMounted(async () => {
  window.addEventListener('online', _syncOnline);
  window.addEventListener('offline', _syncOnline);
  await Promise.all([cargarSilos(), cargarSilosCalibre(), cargarSilosPulmon(), cargarBodegas(), cargarRegistros(), cargarResumen(), cargarConfigCampos()]);
});

onBeforeUnmount(() => {
  window.removeEventListener('online', _syncOnline);
  window.removeEventListener('offline', _syncOnline);
});

// Watcher para cambio de sede
watch(
  () => authStore.sedeActivaId,
  async () => {
    await Promise.all([cargarSilos(), cargarSilosCalibre(), cargarSilosPulmon(), cargarBodegas(), cargarRegistros(), cargarResumen(), cargarConfigCampos()]);
  },
);
</script>

<style scoped>
.border-blue {
  border: 1px solid #bfdbfe !important;
}
.border-green {
  border: 1px solid #bbf7d0 !important;
}
.border-orange {
  border: 1px solid #fed7aa !important;
}
.border-purple {
  border: 1px solid #e9d5ff !important;
}
.border-grey {
  border: 1px solid #d1d5db !important;
}
.boder-red {
  border: 1px solid #d1d5db !important;
}
</style>
