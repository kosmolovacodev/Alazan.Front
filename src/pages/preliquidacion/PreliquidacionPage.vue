<template>
  <q-page padding class="bg-grey-2">
    <!-- ==================== VISTA LISTA ==================== -->
    <template v-if="!showDetail">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-grey-8 text-weight-bold">
          <q-icon name="receipt_long" class="q-mr-sm" size="md" />
          Pre-liquidación
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
              <div class="text-caption text-green-9 text-weight-medium">Con Pre-liquidación</div>
              <div class="text-h4 text-weight-bold text-green-9">
                {{ resumen.conPreliquidacion }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card bordered flat class="bg-orange-1 border-orange">
            <q-card-section class="q-py-sm">
              <div class="text-caption text-orange-9 text-weight-medium">Sin Pre-liquidación</div>
              <div class="text-h4 text-weight-bold text-orange-9">
                {{ resumen.sinPreliquidacion }}
              </div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card bordered flat class="bg-purple-1 border-purple">
            <q-card-section class="q-py-sm">
              <div class="text-caption text-purple-9 text-weight-medium">Total Toneladas</div>
              <div class="text-h4 text-weight-bold text-purple-9">
                {{ fmtNum(resumen.totalToneladas) }}
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
            <q-input v-model="filtros.origen" outlined dense label="Origen" clearable>
              <template #prepend><q-icon name="location_on" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="filtros.productor" outlined dense label="Productor" clearable>
              <template #prepend><q-icon name="person" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-2">
            <q-input v-model="filtros.comprador" outlined dense label="Comprador" clearable>
              <template #prepend><q-icon name="store" /></template>
            </q-input>
          </div>
          <div class="col-12 col-md-2">
            <q-checkbox v-model="filtros.hoy" label="Solo hoy" />
          </div>
        </div>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filtros.fechaInicio"
              outlined
              dense
              type="date"
              label="Fecha Inicio"
            />
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

      <!-- Tabla de Pre-liquidación -->
      <q-card bordered flat class="shadow-1 border-grey">
        <q-table
          :rows="registrosFiltrados"
          :columns="columns"
          row-key="boletaId"
          flat
          :pagination="{ rowsPerPage: 0 }"
          :loading="loading"
        >
          <template v-slot:body-cell-pesoNeto="props">
            <q-td :props="props">
              <span v-if="props.value && props.value > 0">{{ fmtNum(props.value) }} kg</span>
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.status === 'Con Preliquidacion' ? 'green-2' : 'orange-2'"
                :text-color="props.row.status === 'Con Preliquidacion' ? 'green-10' : 'orange-10'"
              >
                {{ props.row.status }}
              </q-badge>
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
                @click="verDetalle(props.row)"
              >
                <q-tooltip>Ver Detalle</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template #no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-6">
              <q-icon name="receipt_long" size="md" class="q-mr-sm" />
              No hay registros pendientes de pre-liquidación.
            </div>
          </template>
        </q-table>
      </q-card>
    </template>

    <!-- ==================== VISTA DETALLE ==================== -->
    <template v-if="showDetail && selectedRegistro && !showPreliquidacion && !showBoleta">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-btn flat round icon="arrow_back" @click="volverALista" />
          <div class="text-h5 text-grey-8 text-weight-bold">Pre-liquidación</div>
        </div>
        <div class="row q-gutter-sm">
          <q-btn color="orange-7" unelevated label="BOLETA" @click="showBoleta = true" />
          <q-btn
            v-if="preliquidacionGuardada"
            color="orange-7"
            unelevated
            label="PRE-LIQUIDACIÓN"
            @click="showPreliquidacion = true"
          />
        </div>
      </div>

      <!-- Información del registro -->
      <q-card bordered flat class="q-pa-lg q-mb-md">
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="selectedRegistro.ticket"
              label="No. Ticket"
              outlined
              dense
              readonly
              bg-color="grey-2"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="selectedRegistro.productor"
              label="Productor"
              outlined
              dense
              readonly
              bg-color="grey-2"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="selectedRegistro.fecha"
              label="Fecha y Hora"
              outlined
              dense
              readonly
              bg-color="grey-2"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              :model-value="selectedRegistro.tProductor || '-'"
              label="T. Productor"
              outlined
              dense
              readonly
              bg-color="grey-2"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              :model-value="selectedRegistro.telefono || '-'"
              label="Teléfono"
              outlined
              dense
              readonly
              bg-color="grey-2"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              :model-value="selectedRegistro.origen || '-'"
              label="Origen"
              outlined
              dense
              readonly
              bg-color="grey-2"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              :model-value="selectedRegistro.chofer || '-'"
              label="Chofer"
              outlined
              dense
              readonly
              bg-color="grey-2"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              :model-value="selectedRegistro.placas || '-'"
              label="Placas"
              outlined
              dense
              readonly
              bg-color="grey-2"
            />
          </div>
        </div>

        <!-- Peso Bruto -->
        <q-card bordered flat class="q-pa-md q-mb-md">
          <div class="row items-center q-gutter-md">
            <div class="text-weight-medium" style="width: 120px">Peso Bruto</div>
            <q-input
              :model-value="fmtNum(selectedRegistro.pesoBruto)"
              outlined
              dense
              readonly
              bg-color="grey-2"
              style="width: 200px"
              suffix="kg"
            />
          </div>
        </q-card>

        <!-- Peso Tara con control de báscula -->
        <q-card bordered flat class="q-pa-md q-mb-md">
          <div class="column q-gutter-sm">
            <!-- Estado de conexión -->
            <div class="row items-center q-gutter-sm">
              <div
                class="rounded-borders"
                :class="basculaConectada ? 'bg-green-5' : 'bg-red-5'"
                style="width: 12px; height: 12px"
              />
              <span :class="basculaConectada ? 'text-green-8' : 'text-red-8'" class="text-caption">
                {{ basculaConectada ? 'Báscula Conectada' : 'Báscula Desconectada' }}
              </span>
              <q-btn
                v-if="!basculaConectada"
                dense
                flat
                size="sm"
                color="primary"
                label="Reconectar"
                @click="reconectarBascula"
              />
            </div>

            <div class="row items-center q-gutter-md">
              <div class="text-weight-medium" style="width: 120px">Peso Tara (kg)</div>
              <q-input
                v-model="pesoTara"
                outlined
                dense
                :readonly="(!modoManual && basculaConectada) || preliquidacionGuardada"
                :bg-color="
                  (!modoManual && basculaConectada) || preliquidacionGuardada ? 'grey-2' : 'white'
                "
                style="width: 200px"
                placeholder="Peso en kilogramos"
                @update:model-value="onPesoTaraChange"
              />
              <template v-if="!preliquidacionGuardada">
                <q-btn
                  unelevated
                  :color="modoManual ? 'grey-5' : 'grey-7'"
                  text-color="white"
                  label="Captura Manual"
                  :disable="modoManual"
                  @click="activarModoManual"
                />
                <q-btn
                  unelevated
                  color="orange-7"
                  text-color="white"
                  label="Leer Báscula"
                  :disable="!basculaConectada"
                  @click="leerBascula"
                />
              </template>
            </div>
          </div>
        </q-card>

        <!-- Peso Neto -->
        <q-card bordered flat class="q-pa-md q-mb-lg">
          <div class="row items-center q-gutter-md">
            <div class="text-weight-medium" style="width: 120px">Peso Neto</div>
            <q-input
              :model-value="fmtNum(pesoNeto)"
              outlined
              dense
              readonly
              bg-color="grey-2"
              style="width: 200px"
              suffix="kg"
            />
          </div>
        </q-card>

        <!-- Sección de Liquidación -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-md">
            <q-input
              :model-value="detalle.impurezas"
              label="Impurezas (%)"
              outlined
              dense
              readonly
              bg-color="grey-2"
              hint="Desde análisis"
            />
          </div>
          <div class="col-12 col-md">
            <q-input
              :model-value="fmtNum(descuento)"
              label="Descuento (Kg)"
              outlined
              dense
              readonly
              bg-color="grey-2"
            />
          </div>
          <div class="col-12 col-md">
            <q-input
              :model-value="fmtNum(kgALiquidar)"
              label="Kg a Liquidar"
              outlined
              dense
              readonly
              bg-color="grey-2"
            />
          </div>
          <div class="col-12 col-md">
            <q-input
              :model-value="fmtMoney(detalle.precio || 0)"
              label="Precio / KG"
              outlined
              dense
              readonly
              bg-color="grey-2"
              hint="Desde autorización"
            />
          </div>
          <div class="col-12 col-md">
            <q-input
              :model-value="fmtMoney(aLiquidar)"
              label="A Liquidar"
              outlined
              dense
              readonly
              bg-color="grey-2"
            />
          </div>
        </div>

        <!-- Datos Adicionales -->
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Datos Adicionales</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-select
              v-model="rt"
              :options="opcionesRT"
              label="R/T (Riego/Temporal)"
              outlined
              dense
              :disable="preliquidacionGuardada"
              class="q-mb-md"
              emit-value
              map-options
            />
          </div>
        </div>

        <!-- Sección de evidencia fotográfica (solo después de guardar pre-liquidación) -->
        <template v-if="preliquidacionGuardada">
          <q-card bordered flat class="q-pa-md q-mb-md">
            <!-- Fotos capturadas -->
            <div v-if="uploadedPhotos.length > 0" class="row q-col-gutter-sm q-mb-md">
              <div v-for="(foto, idx) in uploadedPhotos" :key="idx" class="col-12 col-sm-6">
                <q-card flat bordered class="shadow-1">
                  <q-img
                    :src="foto"
                    style="height: 350px; width: 100%"
                    fit="contain"
                    class="bg-grey-1"
                  >
                    <div class="absolute-bottom text-subtitle2 text-center">
                      Evidencia Fotográfica
                    </div>
                  </q-img>
                  <q-btn
                    v-if="!documentacionFinalizada"
                    round
                    dense
                    flat
                    icon="close"
                    color="negative"
                    class="absolute-top-right q-ma-xs"
                    size="sm"
                    @click="uploadedPhotos.splice(idx, 1)"
                  />
                </q-card>
              </div>
            </div>

            <!-- Area de captura de foto -->
            <div
              class="column items-center q-pa-lg bg-grey-2 rounded-borders"
              style="border: 2px dashed #ccc"
            >
              <q-icon name="photo_camera" size="48px" color="grey-5" class="q-mb-sm" />
              <div class="text-body1 q-mb-xs">Capturar evidencia fotográfica</div>
              <div class="text-caption text-grey-6 q-mb-md">
                Toma una foto desde el dispositivo como evidencia
              </div>
              <q-btn
                unelevated
                color="deep-purple-9"
                icon="photo_camera"
                :disable="documentacionFinalizada"
                label="Tomar Foto"
                @click="handleTakePhoto"
              />
            </div>
          </q-card>

          <!-- Botón guardar documentación -->
          <div class="row justify-center">
            <q-btn
              label="Guardar Documentación"
              color="secondary"
              :loading="guardandoDocumento"
              :disable="documentacionFinalizada"
              @click="handleGuardarDocumentacion"
            />
          </div>
        </template>

        <!-- Botón Generar Pre-Liquidación -->
        <div v-if="!preliquidacionGuardada" class="row justify-center">
          <q-btn
            unelevated
            color="orange-7"
            label="Generar Pre-Liquidación"
            size="lg"
            @click="handleGenerarPreliquidacion"
          />
        </div>
      </q-card>
    </template>

    <!-- ==================== VISTA PRE-LIQUIDACIÓN DOCUMENTO ==================== -->
    <template v-if="showPreliquidacion && selectedRegistro">
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-btn flat round icon="arrow_back" @click="showPreliquidacion = false" />
          <div class="text-h5 text-grey-8 text-weight-bold">Báscula Recepción</div>
        </div>
        <div class="row q-gutter-sm">
          <q-btn flat round icon="print" size="lg" @click="imprimirPantalla" />
          <q-btn flat round icon="download" size="lg" />
        </div>
      </div>

      <q-card bordered flat class="q-pa-lg" style="max-width: 900px; margin: 0 auto">
        <!-- Header naranja -->
        <div class="bg-orange-7 text-white text-center q-pa-md rounded-borders q-mb-lg">
          <div class="text-h4 text-weight-bold">Pre-Liquidación</div>
        </div>

        <!-- Contenido en dos columnas -->
        <div class="row q-col-gutter-lg q-mb-lg">
          <!-- Columna izquierda -->
          <div class="col-12 col-md-6">
            <q-input
              :model-value="selectedRegistro.productor"
              label="PRODUCTOR"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="selectedRegistro.tProductor || '-'"
              label="T. PRODUCTOR"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="detalle.grano || 'Cargando...'"
              label="PRODUCTO"
              outlined
              dense
              readonly
              bg-color="grey-2"
            />
            <q-input
              :model-value="selectedRegistro.chofer || '-'"
              label="CAMIÓN / CHOFER"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="selectedRegistro.placas || '-'"
              label="PLACAS"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input :model-value="rt || '-'" label="R/T" outlined dense readonly class="q-mb-sm" />
          </div>
          <!-- Columna derecha -->
          <div class="col-12 col-md-6">
            <q-input
              :model-value="selectedRegistro.fecha"
              label="FECHA"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="fmtMoney(detalle.precio || 0)"
              label="PRECIO / KG"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="fmtNum(descuento)"
              label="DESCUENTO"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="fmtNum(kgALiquidar)"
              label="KG LIQUIDAR"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="fmtNum(selectedRegistro.pesoBruto)"
              label="PESO BRUTO"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="fmtNum(pesoTara)"
              label="TARA"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
            <q-input
              :model-value="fmtNum(pesoNeto)"
              label="PESO NETO"
              outlined
              dense
              readonly
              class="q-mb-sm"
            />
          </div>
        </div>

        <!-- Observaciones -->
        <q-input
          v-model="observaciones"
          label="OBSERVACIONES"
          type="textarea"
          outlined
          :rows="2"
          readonly
          class="q-mb-lg"
        />

        <!-- Documentación requerida -->
        <div class="q-mb-lg">
          <div class="text-subtitle1 text-weight-bold text-center q-mb-md">
            Documentación requerida para alta
          </div>
          <ol class="text-body2" style="line-height: 2">
            <li>Identificación oficial (INE)</li>
            <li>Constancia de situación fiscal Actualizado (Con vigencia no mayor a 30 días)</li>
            <li>Opinión de cumplimiento 32D (Positivo, Con vigencia no mayor a 30 días)</li>
            <li>Carátula bancaria (Con vigencia no mayor a 30 días)</li>
            <li>Correo electrónico para envío de liquidación</li>
            <li>Nombre y teléfono del contador</li>
            <li>Nombre y teléfono del productor</li>
          </ol>
        </div>

        <!-- Contacto -->
        <div class="text-center q-mb-md text-body2">
          Favor de enviar la documentación completa al correo<br />
          <span class="text-weight-bold">RECEPCIONMINA@ALAZAN.COM.MX</span>
        </div>

        <div class="row items-center justify-center q-gutter-sm q-mb-lg">
          <q-icon name="phone" color="green-8" />
          <span class="text-body2">Dudas Whatsapp 673-163-75-73</span>
        </div>

        <!-- Botón Guardar -->
        <div class="row justify-center">
          <q-btn
            unelevated
            color="orange-7"
            label="Guardar"
            size="lg"
            class="q-px-xl"
            @click="handleGuardarPreliquidacion"
          />
        </div>
      </q-card>
    </template>

    <!-- ==================== VISTA BOLETA ==================== -->
    <template v-if="showBoleta && selectedRegistro">
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-btn flat round icon="arrow_back" @click="showBoleta = false" />
          <div class="text-h5 text-grey-8 text-weight-bold">Boleta - Recepción de Granos</div>
        </div>
        <q-badge color="purple-2" text-color="purple-10" class="q-pa-sm text-body2">
          Ticket: {{ selectedRegistro.ticket }}
        </q-badge>
      </div>

      <!-- Banner estado -->
      <q-banner class="bg-green-1 text-green-9 q-mb-md rounded-borders">
        <q-icon name="check_circle" class="q-mr-sm" />
        Precio Aceptado - Boleta Finalizada
      </q-banner>

      <q-card bordered flat style="max-width: 900px; margin: 0 auto">
        <!-- Header verde -->
        <q-card-section class="bg-green-7 text-white text-center">
          <div class="text-h5 text-weight-bold">BOLETA</div>
          <div class="text-caption">Precio aceptado por productor</div>
        </q-card-section>

        <!-- Iconos imprimir/descargar -->
        <div class="row justify-end q-pa-sm q-gutter-sm">
          <q-btn flat round icon="print" @click="imprimir" />
          <q-btn flat round icon="download" />
        </div>

        <q-card-section>
          <!-- Folio -->
          <div class="row justify-end q-mb-md">
            <q-input
              :model-value="selectedRegistro.noBoleta"
              label="FOLIO / BOLETA"
              outlined
              dense
              readonly
              bg-color="grey-2"
              style="width: 250px"
            />
          </div>

          <!-- Campos grid -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-6">
              <q-input
                :model-value="selectedRegistro.productor"
                label="PRODUCTOR"
                outlined
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
            <div class="col-6">
              <q-input
                :model-value="selectedRegistro.fecha"
                label="FECHA Y HORA"
                outlined
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
            <div class="col-6">
              <q-input
                :model-value="selectedRegistro.telefono || '-'"
                label="TELÉFONO"
                outlined
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
            <div class="col-6">
              <q-input
                :model-value="selectedRegistro.tProductor || '-'"
                label="T. PRODUCTOR"
                outlined
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
            <div class="col-6">
              <q-input
                :model-value="selectedRegistro.comprador || '-'"
                label="COMPRADOR"
                outlined
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
            <div class="col-6">
              <q-input
                :model-value="selectedRegistro.origen || '-'"
                label="ORIGEN"
                outlined
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
            <div class="col-6">
              <q-input
                :model-value="fmtMoney(detalle.precio || 0)"
                label="PRECIO / KG"
                outlined
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
            <div class="col-6">
              <q-input
                :model-value="fmtNum(detalle.descuento) + ' kg/ton'"
                label="DESCUENTO (KG/TON)"
                outlined
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
            <div class="col-6">
              <q-input
                :model-value="detalle.calibre || '-'"
                label="CALIBRE"
                outlined
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
            <div class="col-6">
              <q-input
                :model-value="(detalle.humedad || 0) + '%'"
                label="HUMEDAD"
                outlined
                dense
                readonly
                bg-color="grey-2"
              />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Analisis de Calidad -->
          <div class="text-subtitle2 text-weight-bold q-mb-sm">Resultados de Análisis</div>
          <div class="q-mb-md">
            <TablaAnalisisDesplegable
              :tipo-grano-id="detalle.granoId || 0"
              :impurezas="detalle.impurezas || 0"
              :r1="detalle.r1 || 0"
              :r2="detalle.r2 || 0"
              :cafes-lisos="detalle.cafesLisos || 0"
              :manchados="detalle.manchados || 0"
              :queb-mxc="detalle.quebMxc || 0"
              :helados="detalle.helados || 0"
              :alimonados="detalle.alimonados || 0"
              :revolcados="detalle.revolcados || 0"
              :suma-r2="detalle.sumaR2 || 0"
              :total-danos-num="Number(detalleTotalDanos)"
              :exportacion="detalle.exportacion || 0"
              :calibre="detalle.calibre || ''"
              :read-only="true"
              :frijol-data-inicial="frijolDataInicial"
            />
          </div>

          <q-separator class="q-my-md" />

          <!-- Firmas -->
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
              <div class="text-caption text-grey-7 q-mt-xs">Autorizó</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </template>
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
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { api } from 'src/boot/axios';
import { Notify, useQuasar, exportFile } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import type { QTableColumn } from 'quasar';
import TablaAnalisisDesplegable from 'src/pages/analisis/TablaAnalisisDesplegable.vue';

const guardandoDocumento = ref(false);
// Esta variable ya la tienes, pero asegúrate que se actualice al terminar de guardar
const documentacionFinalizada = ref(false);

function captureImage() {
  if (videoRef.value && canvasRef.value) {
    const video = videoRef.value;
    const canvas = canvasRef.value;

    // Ajustar dimensiones del canvas al video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame en el canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir a Base64
      const fotoBase64 = canvas.toDataURL('image/jpeg', 0.8);

      // Guardar en tu array de fotos
      uploadedPhotos.value.push(fotoBase64);

      // Cerrar y limpiar
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

const imprimir = () => {
  window.print();
};

const preliquidacionDto = ref({
  boletaId: 0,
  pesoTara: 0,
  pesoNeto: 0,
  tipoSiembra: '', // R/T
  descuento: 0,
  kgALiquidar: 0,
  importeTotal: 0,
  observaciones: '',
  rt: '',
});

// --- INTERFACES ---
interface RegistroPreliq {
  numero: number;
  boletaId: number;
  ticket: string;
  noBoleta: string;
  fecha: string;
  productor: string;
  telefono?: string;
  comprador?: string;
  origen?: string;
  pesoBruto?: number;
  pesoTara?: number;
  pesoNeto?: number;
  tonsAprox?: number;
  precio?: number;
  descuento?: number;
  kgALiquidar?: number;
  importeTotal?: number;
  status: string;
  chofer?: string;
  placas?: string;
  tProductor?: string;
  grano?: string;
  siloNombre?: string;
  impurezas?: number;
}

interface DetalleData {
  boletaId?: number;
  noBoleta?: string;
  ticket?: string;
  fecha?: string;
  productor?: string;
  telefono?: string;
  comprador?: string;
  origen?: string;
  calibre?: string;
  humedad?: number;
  pesoBruto?: number;
  pesoTara?: number;
  pesoNeto?: number;
  tonsAprox?: number;
  precio?: number;
  descuento?: number;
  kgALiquidar?: number;
  importeTotal?: number;
  observaciones?: string;
  status?: string;
  chofer?: string;
  placas?: string;
  tProductor?: string;
  grano?: string;
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
  analisisDatosAdicionales?: string;
  granoId?: number;
  siloNombre?: string;
}

const opcionesRT = ['Riego', 'Temporal'];

const $q = useQuasar();
const authStore = useAuthStore();

// --- ESTADO ---
const registros = ref<RegistroPreliq[]>([]);
const loading = ref(false);
const mostrarFiltros = ref(true);
const resumen = ref({
  totalDelDia: 0,
  conPreliquidacion: 0,
  sinPreliquidacion: 0,
  totalToneladas: 0,
});

// Estado de vistas
const showDetail = ref(false);
const showPreliquidacion = ref(false);
const showBoleta = ref(false);
const selectedRegistro = ref<RegistroPreliq | null>(null);
const detalle = ref<DetalleData>({});
const preliquidacionGuardada = ref(false);

// Campos de pre-liquidación
const pesoTara = ref<string>('');
const pesoNeto = ref<string>('');
const descuento = ref<string>('');
const kgALiquidar = ref<string>('');
const aLiquidar = ref<string>('');
const rt = ref<string>('');
const observaciones = ref('');

// Factor de impurezas (desde Configuracion_Recepcion_Reglas)
const factorImpurezas = ref<number>(10); // Default 10, se carga desde la API

// Control de báscula
const basculaConectada = ref(true);
const modoManual = ref(false);

// Upload
const uploadedPhotos = ref<string[]>([]);
// Filtros
const filtros = reactive({
  ticket: '',
  boleta: '',
  origen: '',
  productor: '',
  comprador: '',
  hoy: false,
  fechaInicio: '',
  fechaFin: '',
});

// --- COLUMNAS ---
const columns: QTableColumn[] = [
  { name: 'numero', label: '#', field: 'numero', align: 'left' },
  { name: 'ticket', label: 'No. Ticket', field: 'ticket', align: 'left', sortable: true },
  { name: 'noBoleta', label: 'No. Boleta', field: 'noBoleta', align: 'left', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'origen', label: 'Origen', field: 'origen', align: 'left' },
  { name: 'productor', label: 'Productor', field: 'productor', align: 'left' },
  { name: 'comprador', label: 'Comprador', field: 'comprador', align: 'left' },
  { name: 'pesoNeto', label: 'Peso Neto', field: 'pesoNeto', align: 'center' },
  { name: 'status', label: 'Estatus', field: 'status', align: 'center' },
  { name: 'acciones', label: 'Acción', field: 'boletaId', align: 'center' },
];

// --- COMPUTED ---
const registrosFiltrados = computed(() => {
  let lista = registros.value;
  if (filtros.ticket) lista = lista.filter((r) => r.ticket?.toString().includes(filtros.ticket));
  if (filtros.boleta) lista = lista.filter((r) => r.noBoleta?.toString().includes(filtros.boleta));
  if (filtros.origen)
    lista = lista.filter((r) => r.origen?.toLowerCase().includes(filtros.origen.toLowerCase()));
  if (filtros.productor)
    lista = lista.filter((r) =>
      r.productor?.toLowerCase().includes(filtros.productor.toLowerCase()),
    );
  if (filtros.comprador)
    lista = lista.filter((r) =>
      r.comprador?.toLowerCase().includes(filtros.comprador.toLowerCase()),
    );
  if (filtros.hoy) {
    const hoy = new Date().toLocaleDateString();
    lista = lista.filter((r) => new Date(r.fecha).toLocaleDateString() === hoy);
  } else if (filtros.fechaInicio || filtros.fechaFin) {
    const inicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
    const fin = filtros.fechaFin ? new Date(filtros.fechaFin + 'T23:59:59') : null;
    lista = lista.filter((r) => {
      const f = new Date(r.fecha);
      if (inicio && f < inicio) return false;
      if (fin && f > fin) return false;
      return true;
    });
  }
  return lista;
});

const detalleTotalDanos = computed(() => {
  const imp = Number(detalle.value.impurezas || 0);
  const r1 = Number(detalle.value.r1 || 0);
  const sr2 = Number(detalle.value.sumaR2 || 0);
  return (imp + r1 + sr2).toFixed(2);
});

const frijolDataInicial = computed(() => {
  const raw = detalle.value.analisisDatosAdicionales || detalle.value.datosAdicionales;
  if (!raw) return undefined;
  try {
    const datos = JSON.parse(raw);
    return datos.frijol_datos || undefined;
  } catch {
    return undefined;
  }
});

// --- FUNCIONES UTILITARIAS ---
function fmtNum(val: number | string | undefined | null): string {
  const num = Number(val);
  if (!Number.isFinite(num)) return '0.00';
  return num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtMoney(val: number | string | undefined | null): string {
  const num = Number(val);
  if (!Number.isFinite(num)) return '$0.00';
  return '$' + num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --- CARGA DE DATOS ---
async function cargarRegistros() {
  loading.value = true;
  try {
    const { data } = await api.get('/api/preliquidacion');
    registros.value = data;
  } catch (error) {
    console.error('Error al cargar registros:', error);
    Notify.create({ type: 'negative', message: 'Error al cargar registros de pre-liquidación' });
  } finally {
    loading.value = false;
  }
}

async function cargarResumen() {
  try {
    const { data } = await api.get('/api/preliquidacion/resumen');
    resumen.value = data;
  } catch (error) {
    console.error('Error al cargar resumen:', error);
  }
}

const imprimirPantalla = () => {
  window.print();
};

async function cargarFactorImpurezas() {
  try {
    const { data } = await api.get('/api/configuracion-recepcion');
    if (data.reglas?.factorImpurezas) {
      factorImpurezas.value = parseFloat(data.reglas.factorImpurezas) || 10;
    }
  } catch (error) {
    console.error('Error al cargar factor de impurezas:', error);
  }
}

// --- VER DETALLE ---
async function verDetalle(registro: RegistroPreliq) {
  selectedRegistro.value = registro;

  try {
    $q.loading.show({ message: 'Cargando datos de báscula y volcado...' });

    // 1. Carga el detalle completo desde la API
    const { data } = await api.get(`/api/preliquidacion/detalle/${registro.boletaId}`);
    detalle.value = data;

    // 2. Manejo de Documentación (Fotos/PDF)
    uploadedPhotos.value = [];

    // Buscamos en todas las posibles fuentes de la imagen
    const contenidoDoc = data.datos_adicionales || data.datosAdicionales || data.foto || '';

    if (contenidoDoc && contenidoDoc.length > 50) {
      // Validamos que tenga contenido real
      if (contenidoDoc.startsWith('data:')) {
        uploadedPhotos.value = [contenidoDoc];
      } else {
        // Por si se guardó el base64 puro en la DB
        uploadedPhotos.value = [`data:image/jpeg;base64,${contenidoDoc}`];
      }
    }

    // 3. Verificar si ya existe preliquidación guardada (por preliquidacionId del JOIN)
    const yaEstaFinalizado = !!data.preliquidacionId;

    // 4. LÓGICA DE BLOQUEO DIFERENCIADA
    // Bloqueo de importes y báscula (por estatus)
    preliquidacionGuardada.value = yaEstaFinalizado;

    // Bloqueo de Documentación (SOLO si ya tiene archivo)
    // Esto permite subir fotos aunque el estatus sea Pre-liquidado
    documentacionFinalizada.value = uploadedPhotos.value.length > 0;

    // 5. Asignación de campos de pesaje e importes
    // Calcular descuento desde impurezas (kg/ton = %impurezas × factor_impurezas)
    const imp = parseFloat((data.impurezas || 0).toString());
    descuento.value = !isNaN(imp) && imp > 0 ? (imp * factorImpurezas.value).toString() : '0';

    if (yaEstaFinalizado) {
      // Cargamos valores históricos
      pesoTara.value = data.pesoTara?.toString() || '';
      pesoNeto.value = data.pesoNeto?.toString() || '0.00';
      kgALiquidar.value = data.kgALiquidar?.toString() || '0.00';
      aLiquidar.value = data.importeTotal?.toString() || '0.00';
    } else {
      // Reset para nueva captura de báscula
      pesoTara.value = '';
      pesoNeto.value = '0.00';
      kgALiquidar.value = '0.00';
      aLiquidar.value = '0.00';
    }

    // 6. Datos adicionales
    rt.value = data.tipoSiembra || data.rt || 'Riego';
    observaciones.value = data.observaciones || '';

    const tProd = data.tProductor || registro.tProductor || '';
    if (!observaciones.value) {
      observaciones.value =
        tProd === 'Ejidal'
          ? 'Productor Ejidal - Revisar documentación correspondiente.'
          : 'Pequeña Propiedad - Aplicar retenciones de ley.';
    }

    modoManual.value = false;
  } catch (error) {
    console.error('Error al cargar detalle:', error);
    Notify.create({
      type: 'negative',
      message: 'No se pudieron recuperar los datos del servidor.',
    });
  } finally {
    $q.loading.hide();
  }

  showDetail.value = true;
  showPreliquidacion.value = false;
  showBoleta.value = false;
}

// --- CÁLCULOS ---
function calcularPesoNeto(bruto: string, tara: string) {
  const b = parseFloat(bruto.replace(/,/g, '')) || 0;
  const t = parseFloat(tara.replace(/,/g, '')) || 0;
  //const ton = parseFloat(detalle.value?.tonsAprox?.toString() || '0');

  if (b > 0) {
    const neto = b - t;
    pesoNeto.value = neto.toFixed(2); // Asegura que sea string para el v-model
    calcularDescuento(neto);
  }
}

function calcularDescuento(neto: number) {
  const imp = parseFloat((detalle.value.impurezas || 0).toString());
  if (!isNaN(imp) && imp > 0) {
    // Descuento (kg/ton) = % Impurezas × factor_impurezas (desde configuración)
    const desc = imp * factorImpurezas.value;
    descuento.value = desc.toString();
    calcularKgALiquidar(neto, desc);
  } else {
    descuento.value = '';
    kgALiquidar.value = neto.toString();
    calcularALiquidar(neto);
  }
}

function calcularKgALiquidar(neto: number, descPorTon: number) {
  // Descuento Total = descuento kg/ton × (pesoNeto / 1000)
  // KG A LIQUIDAR = Peso Neto - (Descuento kg/ton × Toneladas) -- Este se esta usando basado en figma.
  const kgALiq = neto - descPorTon * Math.floor(neto / 1000.0);

  //console.log(kgALiq);
  //const descuentoTotal = descPorTon * (neto / 1000);
  //const kgLiq = neto - descuentoTotal;
  kgALiquidar.value = kgALiq.toFixed(2);

  calcularALiquidar(kgALiq);
}

// A LIQUIDAR = (KG A LIQUIDAR / 1000) × Precio × 1000
function calcularALiquidar(kgLiq: number) {
  const precPorTon = parseFloat((detalle.value.precio || 0).toString());
  if (!isNaN(precPorTon) && precPorTon > 0) {
    const total = kgLiq * precPorTon;
    aLiquidar.value = total.toString();
  } else {
    aLiquidar.value = '';
  }
}

// --- HANDLERS ---
function onPesoTaraChange(val: string | number | null) {
  const bruto = parseFloat(detalle.value?.pesoBruto?.toString() || '0');
  const tara = parseFloat(val?.toString() || '0');

  if (bruto > 0) {
    const neto = bruto - tara;
    pesoNeto.value = neto.toFixed(2);
    // Usar la cadena de cálculo correcta: descuento → kgALiquidar → aLiquidar
    calcularDescuento(neto);
  }
}

function activarModoManual() {
  modoManual.value = true;
  pesoTara.value = '';
}

function leerBascula() {
  // Simulación - en producción conectar a báscula real
  const exito = Math.random() > 0.1;

  if (exito) {
    const peso = (Math.random() * 7000 + 8000).toFixed(2);
    pesoTara.value = peso;
    if (selectedRegistro.value?.pesoBruto) {
      calcularPesoNeto(selectedRegistro.value.pesoBruto.toString(), peso);
    }
  } else {
    basculaConectada.value = false;
    modoManual.value = true;
    Notify.create({
      type: 'warning',
      message: 'Conexión con báscula perdida. Modo manual activado.',
    });
  }
}

function reconectarBascula() {
  const exito = Math.random() > 0.3;
  if (exito) {
    basculaConectada.value = true;
    modoManual.value = false;
    Notify.create({ type: 'positive', message: 'Báscula reconectada correctamente' });
  } else {
    Notify.create({ type: 'negative', message: 'No se pudo reconectar con la báscula.' });
  }
}

function handleGenerarPreliquidacion() {
  if (!pesoNeto.value || pesoNeto.value.trim() === '' || Number(pesoNeto.value) === 0) {
    Notify.create({
      type: 'warning',
      message: 'Debe capturar el Peso Neto antes de generar la Pre-liquidación.',
    });
    return;
  }
  if (!detalle.value.precio) {
    Notify.create({ type: 'warning', message: 'El ticket no tiene un Precio autorizado.' });
    return;
  }
  if (!detalle.value.impurezas && detalle.value.impurezas !== 0) {
    Notify.create({ type: 'warning', message: 'El ticket no tiene Impurezas capturadas.' });
    return;
  }
  showPreliquidacion.value = true;
}

async function handleGuardarPreliquidacion() {
  if (!selectedRegistro.value || !detalle.value) return;

  // 1. Validaciones de negocio
  if (!pesoTara.value || parseFloat(pesoTara.value) <= 0) {
    Notify.create({ type: 'warning', message: 'Debe capturar o leer el Peso Tara.' });
    return;
  }

  if (!rt.value) {
    Notify.create({ type: 'warning', message: 'Debe seleccionar el tipo de siembra (R/T).' });
    return;
  }

  if (!aLiquidar.value || parseFloat(aLiquidar.value) <= 0) {
    Notify.create({ type: 'warning', message: 'El monto A Liquidar debe ser mayor a 0.' });
    return;
  }

  $q.loading.show({ message: 'Guardando pre-liquidación...' });

  try {
    // 2. Preparación del Payload (Coincidiendo con PreliquidacionDto.cs)
    preliquidacionDto.value = {
      boletaId: detalle.value?.boletaId || 0,
      pesoTara: parseFloat(pesoTara.value.toString().replace(/,/g, '')) || 0,
      pesoNeto: parseFloat(pesoNeto.value.toString().replace(/,/g, '')) || 0,
      descuento: parseFloat(descuento.value.toString().replace(/,/g, '')) || 0,
      kgALiquidar: parseFloat(kgALiquidar.value.toString().replace(/,/g, '')) || 0,
      importeTotal: parseFloat(aLiquidar.value.toString().replace(/,/g, '')) || 0,
      observaciones: observaciones.value || '',

      // CORRECCIÓN AQUÍ:
      rt: rt.value || '',
      tipoSiembra: rt.value || '', // Agregamos esta línea para que vue-tsc no marque error
    };

    // 3. Envío al servidor (Nota: revisa si tu ruta es /api/preliquidacion o /preliquidacion)
    await api.post('/api/preliquidacion/guardar', preliquidacionDto.value);

    // 4. Actualización de estado de la UI
    preliquidacionGuardada.value = true;

    Notify.create({
      type: 'positive',
      message: 'Pre-liquidación guardada exitosamente.',
      icon: 'check_circle',
    });

    // 5. Volver a la vista detalle (para capturar foto)
    showPreliquidacion.value = false;

    // 6. Refrescar datos en segundo plano
    await cargarRegistros();
    await cargarResumen();
  } catch (err: unknown) {
    console.error('Error al guardar pre-liquidación:', err);
    const error = err as { response?: { data?: { message?: string } } };
    const msg = error.response?.data?.message || 'Error al conectar con el servidor.';
    Notify.create({ type: 'negative', message: msg, position: 'top' });
  } finally {
    $q.loading.hide();
  }
}

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

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

async function handleGuardarDocumentacion() {
  if (!selectedRegistro.value || uploadedPhotos.value.length === 0) return;

  try {
    guardandoDocumento.value = true;
    $q.loading.show({ message: 'Subiendo documento al servidor...' });

    const payload = {
      boletaId: selectedRegistro.value.boletaId,
      foto: uploadedPhotos.value[0], // Aquí va el Base64 (sea foto o PDF)
    };

    await api.post('/api/preliquidacion/guardar-foto', payload);

    // Bloqueo definitivo de la sección
    documentacionFinalizada.value = true;

    Notify.create({
      type: 'positive',
      message: 'Documentación guardada y registro bloqueado.',
      icon: 'lock',
    });
  } catch (error: unknown) {
    const err = error as AxiosErrorResponse;
    Notify.create({
      type: 'negative',
      message: err.response?.data?.message || 'Error al guardar.',
    });
  } finally {
    guardandoDocumento.value = false;
    $q.loading.hide();
  }
}

function volverALista() {
  showDetail.value = false;
  showPreliquidacion.value = false;
  showBoleta.value = false;
  selectedRegistro.value = null;
  detalle.value = {};
  preliquidacionGuardada.value = false;
}

function limpiarFiltros() {
  filtros.ticket = '';
  filtros.boleta = '';
  filtros.origen = '';
  filtros.productor = '';
  filtros.comprador = '';
  filtros.hoy = false;
  filtros.fechaInicio = '';
  filtros.fechaFin = '';
}

function exportarExcel() {
  const header = [
    'No',
    'Ticket',
    'Boleta',
    'Fecha',
    'Origen',
    'Productor',
    'Comprador',
    'Peso Neto',
    'Estatus',
  ];
  const rows = registrosFiltrados.value.map((r) => [
    r.numero,
    r.ticket,
    r.noBoleta,
    r.fecha,
    r.origen,
    r.productor,
    r.comprador,
    r.pesoNeto || '-',
    (r.importeTotal ?? 0) > 0 ? 'Pre-Liquidado' : 'Pendiente',
  ]);
  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const status = exportFile(
    `Preliquidacion_${new Date().toISOString().slice(0, 10)}.csv`,
    '\ufeff' + csvContent,
    'text/csv',
  );
  if (status !== true) {
    Notify.create({ type: 'negative', message: 'Error al generar el archivo' });
  }
}

// --- LIFECYCLE ---
onMounted(async () => {
  await cargarFactorImpurezas();
  await cargarRegistros();
  await cargarResumen();
});

watch(
  () => authStore.sedeActivaId,
  async () => {
    await cargarFactorImpurezas();
    await cargarRegistros();
    await cargarResumen();
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
</style>
