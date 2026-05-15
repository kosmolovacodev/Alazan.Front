<template>
  <q-page padding class="bg-grey-2">
    <q-banner v-if="!isOnline" class="bg-red-2 text-red-9 q-mb-sm" dense>
      <template #avatar><q-icon name="cloud_off" color="red-9" /></template>
      Modo sin conexión — los datos se guardarán localmente y se sincronizarán al volver la red.
    </q-banner>
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
              <div class="text-caption text-purple-9 text-weight-medium">Total Neto</div>
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
            @click="abrirPreliquidacionGuardada"
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
            <q-chip
              v-if="divisionConfirmada"
              color="teal-1"
              text-color="teal-9"
              icon="call_split"
              dense
              class="q-mt-xs"
            >
              Dividido entre {{ divisionConfirmada.length }} productores
            </q-chip>
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

        <!-- A Liquidar con descuento IPRM -->
        <div v-if="aLiquidarIPRM" class="row q-mb-lg">
          <div class="col-12 col-md-4">
            <q-input
              :model-value="fmtMoney(aLiquidarIPRM)"
              label="A Liquidar (con descuento IPRM)"
              outlined
              dense
              readonly
              bg-color="green-1"
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

        <!-- Botones: Generar Pre-Liquidación / Dividir entre Productores -->
        <div v-if="!preliquidacionGuardada" class="row justify-center q-gutter-md">
          <q-btn
            unelevated
            color="orange-7"
            label="Generar Pre-Liquidación"
            size="lg"
            @click="handleGenerarPreliquidacion"
          />
          <q-btn
            v-if="pesoNeto && Number(pesoNeto) > 0"
            unelevated
            color="teal-7"
            icon="call_split"
            label="Dividir entre Productores"
            size="lg"
            @click="abrirModalDivision"
          />
        </div>
      </q-card>
    </template>

    <!-- ==================== VISTA PRE-LIQUIDACIÓN DOCUMENTO ==================== -->
    <template v-if="showPreliquidacion && selectedRegistro && docActual">
      <!-- Encabezado con navegación -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <q-btn flat round icon="arrow_back" @click="showPreliquidacion = false" />
          <div class="text-h5 text-grey-8 text-weight-bold">Pre-Liquidación</div>
        </div>
        <!-- Navegación entre documentos (solo si hay más de uno) -->
        <div v-if="preliquidacionDocumentos.length > 1" class="row items-center q-gutter-xs">
          <q-btn
            flat
            round
            dense
            icon="chevron_left"
            :disable="docActualIdx === 0"
            @click="docAnterior"
          />
          <span class="text-body2 text-grey-7 q-px-xs">
            {{ docActualIdx + 1 }} / {{ preliquidacionDocumentos.length }}
          </span>
          <q-btn
            flat
            round
            dense
            icon="chevron_right"
            :disable="docActualIdx === preliquidacionDocumentos.length - 1"
            @click="docSiguiente"
          />
        </div>
        <div class="row q-gutter-sm">
          <q-btn flat round icon="print" size="lg" @click="imprimirPantalla" />
          <q-btn flat round icon="download" size="lg" :loading="descargandoPDF" @click="descargarPreliquidacion" />
        </div>
      </div>

      <q-card id="preliquidacion-print-area" bordered flat style="max-width: 900px; margin: 0 auto">
        <!-- Header profesional -->
        <div style="border-bottom: 2px solid #1a1a1a; padding: 10px 20px">
          <div class="row items-start">
            <div class="col">
              <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; line-height: 1.4">
                {{ configSistema.nombre_empresa || 'BODEGA DE GRANOS EL ALAZÁN Y EL ROCÍO S.A. DE C.V.' }}
              </div>
              <div style="font-size: 11px; margin-top: 2px">RFC: {{ configSistema.rfc || '—' }}</div>
              <div style="font-size: 11px">SUCURSAL: {{ authStore.nombreSedeActiva }}</div>
              <div style="font-size: 10px; color: #b91c1c; font-weight: 600; margin-top: 6px">
                *NOTA: EL PRECIO A LIQUIDAR ES EL ESTIPULADO EN ESTA BOLETA.
              </div>
            </div>
            <div class="col-auto" style="text-align: right; min-width: 130px">
              <img
                v-if="configSistema.logo_url"
                :src="configSistema.logo_url"
                style="max-width: 120px; max-height: 70px; object-fit: contain; margin-left: auto; display: block"
              />
              <div style="font-size: 17px; font-weight: 700; margin-top: 4px">PRE-LIQUIDACIÓN</div>
              <div v-if="preliquidacionDocumentos.length > 1" style="font-size: 10px; color: #555">
                Documento {{ docActualIdx + 1 }} de {{ preliquidacionDocumentos.length }}
              </div>
              <div class="no-print row q-gutter-xs justify-end q-mt-xs">
                <q-btn flat dense icon="print" size="xs" color="primary" @click="imprimirPantalla">
                  <q-tooltip>Imprimir</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
        <div class="q-pa-lg">

        <!-- Fila de Boleta / Ticket -->
        <div
          class="row q-mb-lg q-px-md q-py-sm"
          style="border: 1px solid #1565c0; border-radius: 4px"
        >
          <div class="col-6 text-primary text-body2">
            <span class="text-weight-medium">Boleta:</span> {{ docActual.boleta }}
          </div>
          <div class="col-6 text-primary text-body2">
            <span class="text-weight-medium">Ticket:</span> {{ docActual.ticket }}
          </div>
        </div>

        <!-- Campos dinámicos de preliquidación -->
        <div class="row q-col-gutter-sm q-mb-lg">
          <div
            v-for="campo in camposPLVisibles"
            :key="campo.claveCampo"
            class="col-12 col-sm-6"
          >
            <q-input
              :model-value="getCampoValor(campo.claveCampo)"
              :label="campo.nombreMostrar"
              outlined
              dense
              readonly
              class="q-mb-sm"
              :label-color="campo.claveCampo === 'kg_liquidar' ? 'orange-8' : undefined"
              :input-class="campo.claveCampo === 'kg_liquidar' ? 'text-orange-8 text-weight-bold' : undefined"
            />
          </div>
        </div>

        <!-- Monto a Liquidar -->
        <div
          class="q-pa-md q-mb-lg text-center"
          style="border: 1px solid #4caf50; border-radius: 8px; background: #f1f8e9"
        >
          <div class="text-subtitle1 text-weight-bold text-uppercase text-grey-8 q-mb-xs">
            Monto a Liquidar
          </div>
          <div class="text-h3 text-weight-bold text-green-8">
            {{ fmtMoney(docActual.montoIPRM !== null ? docActual.montoIPRM : docActual.monto) }}
          </div>
          <div
            v-if="docActual.montoIPRM !== null && docActual.iprmPorcentaje !== null"
            class="text-caption text-grey-6"
          >
            (Incluye descuento IPRM del {{ Number(docActual.iprmPorcentaje).toFixed(4) }}%)
          </div>
        </div>

        <!-- Observaciones -->
        <div v-if="campoPLVisible('observaciones')" class="q-mb-lg">
          <div class="text-subtitle1 text-weight-bold text-uppercase text-grey-8 q-mb-xs">
            Observaciones
          </div>
          <div class="text-body1" style="white-space: pre-wrap">{{ docActual?.observaciones || observaciones }}</div>
        </div>

        <!-- Documentación requerida -->
        <div class="q-mb-lg">
          <div class="text-subtitle1 text-weight-bold text-center q-mb-md">
            Documentación requerida para alta
          </div>
          <ol class="text-body2" style="line-height: 2">
            <li>Identificación oficial (INE)</li>
            <li>Documento fiscal Actualizado (Con vigencia no mayor a 90 días)</li>
            <li>Opinión de cumplimiento 32D (Positivo, Con vigencia no mayor a 90 días)</li>
            <li>Carátula bancaria (Con vigencia no mayor a 90 días)</li>
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

        <!-- Botón Guardar (solo cuando aún no está guardada) -->
        <div v-if="!preliquidacionGuardada" class="row justify-center">
          <q-btn
            unelevated
            color="orange-7"
            :label="
              preliquidacionDocumentos.length > 1
                ? `Guardar ${preliquidacionDocumentos.length} Pre-liquidaciones`
                : 'Guardar'
            "
            size="lg"
            class="q-px-xl"
            @click="handleGuardarPreliquidacion"
          />
        </div>
        </div><!-- /q-pa-lg -->
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

      <q-card id="boleta-print-area" bordered flat style="max-width: 900px; margin: 0 auto">
        <!-- Header profesional -->
        <div style="border-bottom: 2px solid #1a1a1a; padding: 10px 16px">
          <div class="row items-start">
            <div class="col">
              <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; line-height: 1.4">
                {{ configSistema.nombre_empresa || 'BODEGA DE GRANOS EL ALAZÁN Y EL ROCÍO S.A. DE C.V.' }}
              </div>
              <div style="font-size: 11px; margin-top: 2px">RFC: {{ configSistema.rfc || '—' }}</div>
              <div style="font-size: 11px">SUCURSAL: {{ authStore.nombreSedeActiva }}</div>
              <div style="font-size: 10px; color: #b91c1c; font-weight: 600; margin-top: 6px">
                *NOTA: EL PRECIO A LIQUIDAR ES EL ESTIPULADO EN ESTA BOLETA.
              </div>
            </div>
            <div class="col-auto" style="text-align: right; min-width: 130px">
              <img
                v-if="configSistema.logo_url"
                :src="configSistema.logo_url"
                style="max-width: 120px; max-height: 70px; object-fit: contain; margin-left: auto; display: block"
              />
              <div style="font-size: 17px; font-weight: 700; margin-top: 4px">BOLETA</div>
              <div class="no-print row q-gutter-xs justify-end q-mt-xs">
                <q-btn flat dense icon="print" size="xs" color="primary" @click="imprimir">
                  <q-tooltip>Imprimir</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="download" size="xs" color="primary"
                  :loading="descargandoPDF" @click="descargar">
                  <q-tooltip>Descargar PDF</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </div>

        <q-card-section>
          <!-- Datos de la Boleta — visibilidad controlada por configuración Boleta Grid -->
          <div class="row q-col-gutter-sm">
            <div v-if="campoBOLETAGridVisible('noBoleta')" class="col-6 col-md-4">
              <div class="text-caption text-grey-7">FOLIO / BOLETA</div>
              <div class="text-weight-bold">{{ detalle.noBoleta || selectedRegistro.noBoleta }}</div>
            </div>
            <div v-if="campoBOLETAGridVisible('productor')" class="col-6 col-md-4">
              <div class="text-caption text-grey-7">PRODUCTOR</div>
              <div class="text-weight-bold">{{ detalle.productor || selectedRegistro.productor }}</div>
            </div>
            <div v-if="campoBOLETAGridVisible('fecha')" class="col-6 col-md-4">
              <div class="text-caption text-grey-7">FECHA Y HORA</div>
              <div class="text-weight-bold">{{ detalle.fecha || selectedRegistro.fecha }}</div>
            </div>
            <div v-if="campoBOLETAGridVisible('telefono')" class="col-6 col-md-4">
              <div class="text-caption text-grey-7">TELÉFONO</div>
              <div class="text-weight-bold">{{ detalle.telefono || selectedRegistro.telefono || 'N/A' }}</div>
            </div>
            <div v-if="campoBOLETAGridVisible('comprador')" class="col-6 col-md-4">
              <div class="text-caption text-grey-7">COMPRADOR</div>
              <div class="text-weight-bold">{{ detalle.comprador || selectedRegistro.comprador || 'N/A' }}</div>
            </div>
            <div v-if="campoBOLETAGridVisible('origen')" class="col-6 col-md-4">
              <div class="text-caption text-grey-7">ORIGEN</div>
              <div class="text-weight-bold">{{ detalle.origen || selectedRegistro.origen || 'N/A' }}</div>
            </div>
            <div v-if="campoBOLETAGridVisible('calibre')" class="col-6 col-md-4">
              <div class="text-caption text-grey-7">CALIBRE</div>
              <div class="text-weight-bold text-blue-9">{{ detalle.calibre || '-' }}</div>
            </div>
            <div v-if="campoBOLETAGridVisible('humedad')" class="col-6 col-md-4">
              <div class="text-caption text-grey-7">HUMEDAD</div>
              <div class="text-weight-bold">{{ detalle.humedad || 0 }}%</div>
            </div>
            <div v-if="campoBOLETAGridVisible('precio')" class="col-6 col-md-4">
              <div class="text-caption text-grey-7">PRECIO / KG</div>
              <div class="text-weight-bold text-green-9 text-h6">{{ fmtMoney(detalle.precio || 0) }}</div>
            </div>
            <div v-if="campoBOLETAGridVisible('pesoBruto')" class="col-6 col-md-4">
              <div class="text-caption text-grey-7">PESO BRUTO</div>
              <div class="text-weight-bold">{{ fmtNum(detalle.pesoBruto || selectedRegistro.pesoBruto) }} kg</div>
            </div>
            <div v-if="campoBOLETAGridVisible('descuento')" class="col-6 col-md-4">
              <div class="text-caption text-grey-7">DESCUENTO (KG/TON)</div>
              <div class="text-weight-bold">{{ Math.round(detalle.descuento || 0) }}</div>
            </div>
            <div v-if="campoBOLETAGridVisible('tonsAprox')" class="col-6 col-md-4">
              <div class="text-caption text-grey-7">TON. APROX</div>
              <div class="text-weight-bold">{{ detalle.tonsAprox || selectedRegistro.tonsAprox }}</div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Analisis de Calidad -->
          <div class="analisis-calidad-print q-mb-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">ANALISIS DE CALIDAD</div>
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
                  <div class="col text-body2 text-grey-8 text-weight-medium">{{ campo.nombreMostrar }}</div>
                  <div class="col-auto text-weight-bold">{{ datosPersonalizados[campo.claveCampo] || '-' }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <q-separator class="q-my-md" />

          <!-- Firmas -->
          <div class="row q-col-gutter-md">
            <div class="col-4 text-center">
              <div style="border: 1px solid #555; height: 72px; border-radius: 4px; margin-bottom: 6px"></div>
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; border-top: 1px solid #555; padding-top: 3px">ANALISTA</div>
            </div>
            <div class="col-4 text-center">
              <div style="border: 1px solid #555; height: 72px; border-radius: 4px; margin-bottom: 6px"></div>
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; border-top: 1px solid #555; padding-top: 3px">RECEPCIONISTA</div>
            </div>
            <div class="col-4 text-center">
              <div style="border: 1px solid #555; height: 72px; border-radius: 4px; margin-bottom: 6px"></div>
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; border-top: 1px solid #555; padding-top: 3px">AUTORIZACIÓN</div>
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

  <!-- ==================== MODAL DIVIDIR ENTRE PRODUCTORES ==================== -->
  <q-dialog v-model="modalDivision" persistent>
    <q-card
      style="max-width: 860px; width: 100%; max-height: 92vh; display: flex; flex-direction: column"
    >
      <!-- Header -->
      <q-toolbar class="bg-blue-8 text-white">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">Dividir Kilogramos entre Productores</div>
          <div class="text-caption">Ticket: {{ selectedRegistro?.ticket }}</div>
        </q-toolbar-title>
        <q-btn flat round dense icon="close" @click="modalDivision = false" />
      </q-toolbar>

      <q-card-section style="overflow-y: auto; flex: 1" class="q-pa-md">
        <!-- Info -->
        <q-banner class="bg-blue-1 q-mb-md" rounded>
          <template #avatar><q-icon name="info" color="blue-7" size="sm" /></template>
          <div class="text-weight-medium text-blue-9 q-mb-xs">¿Cómo dividir el ticket?</div>
          <ul class="q-ma-none q-pl-md text-blue-9 text-caption">
            <li>
              <strong>Opción 1:</strong> Usa los botones de "División Rápida" para dividir en partes
              iguales automáticamente
            </li>
            <li>
              <strong>Opción 2:</strong> Haz clic en "+ Agregar Productor" y asigna los kg
              manualmente a cada uno
            </li>
            <li>La suma de todos los kg debe ser exactamente igual al total disponible</li>
          </ul>
        </q-banner>

        <!-- Resumen -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6 col-sm-3">
            <q-card flat bordered class="q-pa-sm text-center">
              <div class="text-caption text-grey-6">Total Kg a Liquidar</div>
              <div class="text-h6 text-blue-9 text-weight-bold">{{ fmtNum(kgALiquidar) }} kg</div>
            </q-card>
          </div>
          <div class="col-6 col-sm-3">
            <q-card flat bordered class="q-pa-sm text-center">
              <div class="text-caption text-grey-6">Precio por Kg</div>
              <div class="text-h6 text-green-8 text-weight-bold">
                {{ fmtMoney(detalle.precio || 0) }}
              </div>
            </q-card>
          </div>
          <div class="col-6 col-sm-3">
            <q-card flat bordered class="q-pa-sm text-center">
              <div class="text-caption text-grey-6">Total Asignado</div>
              <div
                class="text-h6 text-weight-bold"
                :class="pendientePorAsignar < 0.001 ? 'text-positive' : 'text-orange-8'"
              >
                {{ fmtNum(totalKgAsignado) }} kg
              </div>
            </q-card>
          </div>
          <div class="col-6 col-sm-3">
            <q-card flat bordered class="q-pa-sm text-center">
              <div class="text-caption text-grey-6">Pendiente por Asignar</div>
              <div
                class="text-h6 text-weight-bold"
                :class="pendientePorAsignar < 0.001 ? 'text-grey-5' : 'text-negative'"
              >
                {{ fmtNum(pendientePorAsignar) }} kg
              </div>
            </q-card>
          </div>
        </div>

        <!-- División Rápida -->
        <q-card flat bordered class="q-pa-md q-mb-md bg-purple-1">
          <div class="row items-center q-mb-sm">
            <q-icon name="bolt" color="purple-7" class="q-mr-xs" />
            <span class="text-weight-bold text-purple-9">División Rápida (Partes Iguales):</span>
          </div>
          <div class="row q-gutter-sm q-mb-sm">
            <q-btn
              v-for="n in [2, 3, 4, 5]"
              :key="n"
              unelevated
              color="purple-7"
              icon="call_split"
              size="sm"
              :label="`${n} Productores`"
              @click="divisionRapida(n)"
            />
          </div>
          <div class="text-caption text-purple-8">
            <q-icon name="lightbulb" size="xs" />
            Estos botones dividen automáticamente los kilogramos en partes iguales. Puedes ajustar
            manualmente después.
          </div>
        </q-card>

        <!-- Botón Agregar Productor -->
        <div class="row justify-end q-mb-sm">
          <q-btn
            unelevated
            color="green-7"
            icon="add"
            label="Agregar Productor"
            @click="agregarProductorDivision"
          />
        </div>

        <!-- Tabla de productores -->
        <q-markup-table flat bordered separator="cell" class="q-mb-md">
          <thead>
            <tr class="bg-grey-3">
              <th class="text-center" style="width: 40px">#</th>
              <th class="text-left">Nombre del Productor</th>
              <th class="text-center" style="width: 180px">Kg Asignados</th>
              <th class="text-center" style="width: 160px">Monto a Liquidar</th>
              <th class="text-center" style="width: 56px">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(prod, idx) in divisionProductores" :key="idx">
              <td class="text-center">{{ idx + 1 }}</td>
              <td>
                <span v-if="prod.esPrincipal" class="text-weight-medium">{{ prod.nombre }}</span>
                <q-select
                  v-else
                  :model-value="productoresCatalogo.find((x) => x.id === prod.productorId) || null"
                  :options="opcionesProductoresFiltradas"
                  option-label="nombre"
                  use-input
                  input-debounce="200"
                  dense
                  outlined
                  style="min-width: 220px"
                  @filter="filtrarProductoresCatalogo"
                  @update:model-value="seleccionarProductorDivision(idx, $event)"
                >
                  <template #no-option>
                    <q-item>
                      <q-item-section class="text-grey text-caption"
                        >Productor no encontrado</q-item-section
                      >
                    </q-item>
                    <q-item clickable @click="abrirModalNuevoProductorDivision">
                      <q-item-section class="text-primary text-caption">
                        + Registrar nuevo productor
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </td>
              <td class="text-center">
                <q-input
                  :model-value="prod.kgAsignados"
                  type="number"
                  dense
                  outlined
                  style="width: 150px"
                  min="0"
                  @update:model-value="onKgDivisionChange(idx, $event)"
                />
              </td>
              <td class="text-center text-green-8 text-weight-medium">
                {{ fmtMoney((Number(prod.kgAsignados) || 0) * (detalle.precio || 0)) }}
              </td>
              <td class="text-center">
                <q-btn
                  v-if="!prod.esPrincipal"
                  flat
                  round
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="eliminarProductorDivision(idx)"
                />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-blue-1">
              <td colspan="2" class="text-right text-weight-bold q-pr-md">TOTALES:</td>
              <td class="text-center text-weight-bold text-blue-8">
                {{ fmtNum(totalKgAsignado) }} kg
              </td>
              <td class="text-center text-weight-bold text-green-8">
                {{ fmtMoney(totalImporteDivision) }}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </q-markup-table>

        <!-- Advertencia -->
        <q-banner v-if="pendientePorAsignar > 0.001" class="bg-amber-1 text-orange-9" rounded>
          <template #avatar><q-icon name="warning" color="orange-7" /></template>
          La suma de kilogramos asignados debe ser exactamente igual al total de
          <strong>{{ fmtNum(kgALiquidar) }} kg</strong>
        </q-banner>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md bg-grey-1">
        <q-btn flat label="Cancelar" @click="modalDivision = false" />
        <q-btn unelevated color="blue-8" label="Confirmar División" @click="confirmarDivision" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- ==================== MODAL NUEVO PRODUCTOR (desde división) ==================== -->
  <q-dialog v-model="modalProductor" persistent>
    <q-card style="min-width: 420px; max-width: 95vw">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Agregar nuevo Productor</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <div class="row q-gutter-md">
          <q-radio v-model="nuevoProd.tipo" val="Fisica" label="Física" />
          <q-radio v-model="nuevoProd.tipo" val="Moral" label="Moral" />
        </div>

        <template v-if="nuevoProd.tipo === 'Fisica'">
          <q-input
            v-model="nuevoProd.nombre"
            label="Nombre del productor"
            placeholder="Ing. Luis Perez"
            outlined
            dense
          />
        </template>
        <template v-else>
          <q-input
            v-model="nuevoProd.nombre"
            label="Razón Social"
            placeholder="Agronegocios SA DE CV"
            outlined
            dense
          />
          <q-input
            v-model="nuevoProd.atiende"
            label="Nombre de quien atiende"
            placeholder="Ing. Carlos Ramírez"
            outlined
            dense
          />
        </template>

        <q-input
          v-model="nuevoProd.telefono"
          label="Teléfono"
          placeholder="6441234567"
          outlined
          dense
          mask="##########"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cerrar" flat v-close-popup />
        <q-btn label="Registrar Productor" color="primary" @click="guardarNuevoProductorDivision" />
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
import { usePdfDescarga, boletaPrintCSS, buildPrintContent } from 'src/composables/usePdfDescarga';

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

function abrirVentanaImpresion(elementId: string, zoom = 0.65, titulo = 'Boleta') {
  const el = document.getElementById(elementId);
  if (!el) return;
  const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((l) => `<link rel="stylesheet" href="${(l as HTMLLinkElement).href}">`)
    .join('');
  const styleTags = Array.from(document.querySelectorAll('style'))
    .map((s) => s.outerHTML).join('');
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.documentElement.innerHTML = `<head>
  <meta charset="utf-8">
  <title>${titulo}</title>
  ${linkTags}
  ${styleTags}
  ${boletaPrintCSS(elementId, zoom)}
</head>
<body>${el.outerHTML}</body>`;
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 900);
}

const imprimir = () => {
  const folio = selectedRegistro.value?.noBoleta ?? 'boleta';
  abrirVentanaImpresion('boleta-print-area', 0.68, `Boleta-${folio}`);
};

function buildPrintHTML(elementId: string, zoom: number) {
  const el = document.getElementById(elementId);
  if (!el) return null;
  const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((l) => `<link rel="stylesheet" href="${(l as HTMLLinkElement).href}">`)
    .join('');
  const styleTags = Array.from(document.querySelectorAll('style'))
    .map((s) => s.outerHTML)
    .join('');
  return `<html><head><meta charset="utf-8">${linkTags}${styleTags}${boletaPrintCSS(elementId, zoom)}</head><body>${buildPrintContent(el)}</body></html>`;
}

const descargar = () => {
  const folio = selectedRegistro.value?.noBoleta ?? 'boleta';
  // zoom=1: html2canvas ignores CSS zoom; page height computed dynamically from scrollHeight
  const html = buildPrintHTML('boleta-print-area', 1);
  if (html) void descargarDesdeHTML(html, `Boleta-${folio}`);
};

const imprimirPantalla = () => {
  const folio = selectedRegistro.value?.noBoleta ?? 'preliquidacion';
  abrirVentanaImpresion('preliquidacion-print-area', 0.65, `Preliquidacion-${folio}`);
};

const descargarPreliquidacion = () => {
  const folio = selectedRegistro.value?.noBoleta ?? 'preliquidacion';
  // zoom=1: same reason as descargar
  const html = buildPrintHTML('preliquidacion-print-area', 1);
  if (html) void descargarDesdeHTML(html, `Preliquidacion-${folio}`);
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
  productorId?: number;
  divisiones?: { productorId: number; nombre: string; kgAsignados: number; importeTotal: number }[];
  divisionesJson?: string;
  rfc?: string;
  atiende?: string;
  razonSocial?: string;
}

interface ProductorDivision {
  productorId: number;
  nombre: string;
  kgAsignados: number;
  rfc: string;
  esPrincipal: boolean;
}

interface ProductorCatalogo {
  id: number;
  nombre: string;
  rfc: string;
}

interface PreliquidacionDoc {
  productor: string;
  tProductor: string;
  boleta: string;
  ticket: string;
  kgALiquidar: number;
  monto: number;
  montoIPRM: number | null;
  iprmPorcentaje: number | null;
  descuento: number;
  observaciones: string;
}

const opcionesRT = ['Riego', 'Temporal'];

const $q = useQuasar();
const authStore  = useAuthStore();
const offlineStore = useOfflineStore();
const { descargarDesdeHTML, descargando: descargandoPDF } = usePdfDescarga();
const isOnline = ref(window.navigator.onLine);
const _syncOnline = () => { isOnline.value = window.navigator.onLine; };

const configSistema = ref({
  rfc: '',
  nombre_empresa: '',
  logo_url: '',
  direccion: '',
  telefono: '',
  correo: '',
  color_primario: '',
  mensaje_ticket: '',
  tiempo_autorizacion_auto: 30,
});

async function cargarConfigSistema() {
  try {
    const sedeId = authStore.sedeActivaId ?? 0;
    const { data } = await api.get('/api/configuracion', { params: { sedeId } });
    configSistema.value = {
      rfc: data.rfc || '',
      nombre_empresa: data.nombre_empresa || '',
      logo_url: data.logo_url || '',
      direccion: data.direccion || '',
      telefono: data.telefono || '',
      correo: data.correo || '',
      color_primario: data.color_primario || '',
      mensaje_ticket: data.mensaje_ticket || '',
      tiempo_autorizacion_auto: data.tiempo_autorizacion_auto ?? 30,
    };
  } catch {
    // Si falla, usa valores vacíos
  }
}

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

// IPRM
const iprmCatalogo = ref<{ tipoProductorNombre: string; porcentaje: number }[]>([]);

// División entre productores
const modalDivision = ref(false);
const productoresCatalogo = ref<ProductorCatalogo[]>([]);
const opcionesProductoresFiltradas = ref<ProductorCatalogo[]>([]);
const productoresCargados = ref(false);
const divisionProductores = ref<ProductorDivision[]>([]);
const divisionConfirmada = ref<ProductorDivision[] | null>(null);

// Modal nuevo productor (desde división)
const modalProductor = ref(false);
const nuevoProd = reactive({ tipo: 'Fisica', nombre: '', atiende: '', telefono: '' });
// Índice del productor en la tabla de división que abrió el modal (para auto-seleccionar al registrar)
const idxProductorPendiente = ref<number | null>(null);

// Documentos de pre-liquidación (uno por productor cuando hay división)
const preliquidacionDocumentos = ref<PreliquidacionDoc[]>([]);
const docActualIdx = ref(0);
const docActual = computed(() => preliquidacionDocumentos.value[docActualIdx.value] || null);

// Filtros — por defecto muestra solo el día de hoy
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

const kgALiquidarNum = computed(() => parseFloat(kgALiquidar.value.replace(/,/g, '')) || 0);

const aLiquidarIPRM = computed(() => {
  const importe = parseFloat(aLiquidar.value) || 0;
  if (importe <= 0) return '';
  const tProductor = (
    detalle.value.tProductor ||
    selectedRegistro.value?.tProductor ||
    ''
  ).toLowerCase();
  const regla = iprmCatalogo.value.find((r) => r.tipoProductorNombre?.toLowerCase() === tProductor);
  if (!regla) return '';
  const descuento = importe * (Number(regla.porcentaje) / 100);
  return (importe - descuento).toFixed(2);
});

// Monto con el IPRM del tipo ALTERNATIVO (para interpolar plantillas que muestran el escenario contrario)
const TIPO_ALTERNATIVO: Record<string, string> = {
  'ejidal': 'pequeña propiedad',
  'pequeña propiedad': 'ejidal',
};

function getAltTipo(tProductor: string): string {
  return TIPO_ALTERNATIVO[tProductor.toLowerCase()] ?? tProductor.toLowerCase();
}

const aLiquidarIPRMAlt = computed(() => {
  const importe = parseFloat(aLiquidar.value) || 0;
  if (importe <= 0) return '';
  const tProductor = (
    detalle.value.tProductor ||
    selectedRegistro.value?.tProductor ||
    ''
  ).toLowerCase();
  const altTipo = getAltTipo(tProductor);
  const regla = iprmCatalogo.value.find((r) => r.tipoProductorNombre?.toLowerCase() === altTipo);
  if (!regla) return '';
  const descuento = importe * (Number(regla.porcentaje) / 100);
  return (importe - descuento).toFixed(2);
});

const totalKgAsignado = computed(() =>
  divisionProductores.value.reduce((s, p) => s + (Number(p.kgAsignados) || 0), 0),
);

const pendientePorAsignar = computed(() =>
  Math.max(0, kgALiquidarNum.value - totalKgAsignado.value),
);

const totalImporteDivision = computed(() =>
  divisionProductores.value.reduce(
    (s, p) => s + (Number(p.kgAsignados) || 0) * (detalle.value.precio || 0),
    0,
  ),
);

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

interface CampoConfig {
  claveCampo: string;
  visible: boolean;
  nombreMostrar?: string;
  granoId: number | null;
  orden?: number;
}

const camposAnalisisConfig = ref<CampoConfig[]>([]);
const camposPreliqConfig = ref<CampoConfig[]>([]);
const camposBoletaGridConfig = ref<CampoConfig[]>([]);

const camposConfigActual = computed(() => {
  const granoId = detalle.value.granoId ?? null;
  return camposAnalisisConfig.value.filter((c) => c.granoId === granoId);
});

function campoPLVisible(clave: string): boolean {
  if (camposPreliqConfig.value.length === 0) return true;
  const cfg = camposPreliqConfig.value.find((c) => c.claveCampo === clave);
  return !cfg || cfg.visible;
}

function campoBOLETAGridVisible(clave: string): boolean {
  if (camposBoletaGridConfig.value.length === 0) return true;
  const cfg = camposBoletaGridConfig.value.find((c) => c.claveCampo === clave);
  return !cfg || cfg.visible;
}

const CAMPO_VALOR_MAP: Record<string, () => string> = {
  folio: () => selectedRegistro.value?.noBoleta || detalle.value.noBoleta || '-',
  fecha: () => selectedRegistro.value?.fecha || '-',
  productor: () => docActual.value?.productor || detalle.value.productor || '-',
  rfc: () => detalle.value.rfc || '-',
  producto: () => detalle.value.grano || '-',
  calibre: () => detalle.value.calibre || '-',
  t_productor: () => selectedRegistro.value?.tProductor || detalle.value.tProductor || '-',
  tipoProductor: () => selectedRegistro.value?.tProductor || detalle.value.tProductor || '-',
  camion: () => selectedRegistro.value?.chofer || '-',
  placas: () => selectedRegistro.value?.placas || '-',
  chofer: () => selectedRegistro.value?.chofer || '-',
  rt: () => rt.value || '-',
  riegoTemporal: () => rt.value || '-',
  atiende: () => detalle.value.atiende || '-',
  precio: () => fmtNum(detalle.value.precio || 0),
  descuento: () => fmtNum(docActual.value?.descuento ?? (Number(descuento.value) || 0)),
  descuentoKg: () => fmtNum(docActual.value?.descuento ?? (Number(descuento.value) || 0)),
  kg_liquidar: () => fmtNum(docActual.value?.kgALiquidar),
  peso_bruto: () => fmtNum(selectedRegistro.value?.pesoBruto),
  tara: () => fmtNum(Number(pesoTara.value) || 0),
  peso_neto: () => fmtNum(Number(pesoNeto.value) || 0),
  pesoNeto: () => fmtNum(detalle.value.pesoNeto),
  totalPagar: () => fmtMoney(docActual.value?.montoIPRM ?? docActual.value?.monto),
  observaciones: () => docActual.value?.observaciones || detalle.value.observaciones || '-',
};

function getCampoValor(clave: string): string {
  return CAMPO_VALOR_MAP[clave]?.() ?? '-';
}

const camposPLVisibles = computed(() =>
  [...camposPreliqConfig.value]
    .filter((c) => c.visible && c.claveCampo !== 'observaciones')
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
);

const CAMPOS_PREDEFINIDOS = new Set([
  'calibre',
  'humedad',
  'impurezas',
  'r1',
  'r2',
  'cafesLisos',
  'manchados',
  'quebMxc',
  'helados',
  'alimonados',
  'revolcados',
  'exportacion',
  'frijol_impurezas',
  'frijol_piedras',
  'frijol_mitades',
  'frijol_oscuros',
  'frijol_arrugados',
  'frijol_manchados',
  'frijol_verdes',
  'frijol_tierra',
  'frijol_otras_variedades',
  'frijol_granos_pequenos',
  'frijol_danos_campo',
  'frijol_plaga_viva',
  'frijol_plaga_muerta',
]);

const camposPersonalizadosVisibles = computed(() =>
  camposConfigActual.value.filter((c) => c.visible && !CAMPOS_PREDEFINIDOS.has(c.claveCampo)),
);

const datosPersonalizados = computed<Record<string, string>>(() => {
  const raw = detalle.value.analisisDatosAdicionales || detalle.value.datosAdicionales;
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
    const todos = data.campos ?? [];
    camposAnalisisConfig.value = todos
      .filter((c) => c.pantalla === 'ANALISIS')
      .map((c) => ({ ...c, visible: !!c.visible, granoId: c.granoId ?? null }));
    camposPreliqConfig.value = todos
      .filter((c) => c.pantalla === 'PRELIQUIDACION')
      .map((c) => ({ ...c, visible: !!c.visible, granoId: null }));
    camposBoletaGridConfig.value = todos
      .filter((c) => c.pantalla === 'BOLETA_GRID')
      .map((c) => ({ ...c, visible: !!c.visible, granoId: c.granoId ?? null }));
  } catch {
    // Si falla, se muestran todos los campos
  }
}

// Plantilla cruda de observaciones (sin interpolar); se usa para re-generar cuando cambia el monto
const plantillaObs = ref('');

// Sustituye variables {monto}, {tipo_productor}, {fecha}, {razon_social}, {atiende}, {productor}
// con los valores reales del detalle y campos calculados.
// montoOverride / montoIPRMOverride permiten pasar el monto de un productor específico (divisiones).
function interpolarPlantilla(plantilla: string, montoOverride?: number, montoIPRMOverride?: number): string {
  const montoRaw = montoOverride ?? (parseFloat((aLiquidar.value || '0').toString().replace(/,/g, '')) || 0);
  // Usa el IPRM del tipo alternativo porque la plantilla describe el escenario contrario al productor actual
  const montoFinal = montoIPRMOverride ?? montoOverride ?? (parseFloat((aLiquidarIPRMAlt.value || '0').toString().replace(/,/g, '')) || montoRaw);
  const vars: Record<string, string> = {
    monto:          fmtNum(montoFinal),
    monto_bruto:    fmtNum(montoRaw),
    tipo_productor: detalle.value.tProductor || '',
    fecha:          new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
    razon_social:   detalle.value.razonSocial || detalle.value.productor || '',
    productor:      detalle.value.productor || '',
    atiende:        detalle.value.atiende || '',
    calibre:        detalle.value.calibre || '',
    kg_liquidar:    fmtNum(parseFloat((kgALiquidar.value || '0').toString().replace(/,/g, ''))),
  };
  return plantilla.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

// Re-interpolar automáticamente cuando cambia el monto a liquidar
watch(aLiquidar, () => {
  if (plantillaObs.value) observaciones.value = interpolarPlantilla(plantillaObs.value);
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
    const sedeId = authStore.sedeActivaId ?? 0;
    const hoy = new Date().toLocaleDateString('en-CA');
    const params: Record<string, unknown> = { sedeId };

    if (filtros.hoy) {
      params.fecha = hoy;
    } else if (filtros.fechaInicio || filtros.fechaFin) {
      if (filtros.fechaInicio) params.fechaDesde = filtros.fechaInicio;
      if (filtros.fechaFin)    params.fechaHasta = filtros.fechaFin;
    }

    const { data } = await api.get('/api/preliquidacion', { params });
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
    const sedeId = authStore.sedeActivaId ?? 0;
    const hoy = new Date().toLocaleDateString('en-CA');
    const params: Record<string, unknown> = { sedeId };

    if (filtros.hoy) {
      params.fecha = hoy;
    } else if (filtros.fechaInicio || filtros.fechaFin) {
      if (filtros.fechaInicio) params.fechaDesde = filtros.fechaInicio;
      if (filtros.fechaFin)    params.fechaHasta = filtros.fechaFin;
    }

    const { data } = await api.get('/api/preliquidacion/resumen', { params });
    resumen.value = data;
  } catch (error) {
    console.error('Error al cargar resumen:', error);
  }
}

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

async function cargarIPRM() {
  try {
    const sedeId = authStore.sedeActivaId || 0;
    const { data } = await api.get('/api/ConfiguracionFacturacion/iprm', { params: { sedeId } });
    iprmCatalogo.value = data;
  } catch (err) {
    console.error('Error al cargar IPRM:', err);
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

    // Reconstruir divisionConfirmada desde divisiones_json si la preliquidación ya está guardada
    divisionConfirmada.value = null;
    preliquidacionDocumentos.value = [];
    if (data.divisionesJson) {
      try {
        const parsed = JSON.parse(data.divisionesJson);
        const productores = parsed.productores as Array<{
          ProductorId: number;
          Nombre: string;
          KgAsignados: number;
          ImporteTotal: number;
        }>;
        if (productores && productores.length > 1) {
          divisionConfirmada.value = productores.map((p, i) => ({
            productorId: p.ProductorId,
            nombre: p.Nombre,
            kgAsignados: p.KgAsignados,
            rfc: '',
            esPrincipal: i === 0,
          }));
        }
      } catch {
        // JSON inválido, se ignora
      }
    }

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
    // Usar el descuento autorizado desde la API (boleta.descuento_kg_ton actualizado en autorización)
    // Solo calcular desde impurezas si la API no devuelve un descuento
    const apiDescuento = parseFloat((data.descuento || 0).toString());
    const imp = parseFloat((data.impurezas || 0).toString());
    const calculatedDescuento = !isNaN(imp) && imp > 0 ? (imp * factorImpurezas.value).toString() : '0';
    descuento.value = apiDescuento > 0 ? apiDescuento.toString() : calculatedDescuento;

    if (yaEstaFinalizado) {
      // Cargamos valores históricos
      pesoTara.value = data.pesoTara?.toString() || '';
      pesoNeto.value = data.pesoNeto?.toString() || '0.00';
      descuento.value = data.descuento?.toString() || descuento.value;
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

    if (yaEstaFinalizado) {
      // Preliquidación ya guardada: mostrar las observaciones tal como se guardaron (ya interpoladas)
      plantillaObs.value = '';
      observaciones.value = data.observaciones || '';
    } else {
      // Nueva preliquidación: guardar la plantilla cruda e interpolar con los valores actuales
      plantillaObs.value = data.observaciones || '';
      observaciones.value = interpolarPlantilla(plantillaObs.value);
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
  // Usar el descuento ya cargado (valor autorizado desde precio).
  // Solo calcular desde impurezas si no hay descuento establecido.
  const descActual = parseFloat((descuento.value || '').toString().replace(/,/g, ''));
  const desc = !isNaN(descActual) && descActual > 0
    ? descActual
    : (() => {
        const imp = parseFloat((detalle.value.impurezas || 0).toString());
        return !isNaN(imp) && imp > 0 ? imp * factorImpurezas.value : 0;
      })();

  if (desc > 0) {
    calcularKgALiquidar(neto, desc);
  } else {
    kgALiquidar.value = neto.toString();
    calcularALiquidar(neto);
  }
}

function calcularKgALiquidar(neto: number, descPorTon: number) {
  // Descuento Total = descuento kg/ton × (pesoNeto / 1000)
  // KG A LIQUIDAR = Peso Neto - (Descuento kg/ton × Toneladas)
  const kgALiq = neto - descPorTon * (neto / 1000.0);
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

// Abre la vista de pre-liquidación cuando ya está guardada (reconstruye documentos si es necesario)
function abrirPreliquidacionGuardada() {
  // Si ya están populados (misma sesión tras generar y guardar), solo mostrar
  if (preliquidacionDocumentos.value.length > 0) {
    docActualIdx.value = 0;
    showPreliquidacion.value = true;
    return;
  }

  // Calcular factor IPRM
  const precio = detalle.value.precio || 0;
  const tProductor = (
    detalle.value.tProductor ||
    selectedRegistro.value?.tProductor ||
    ''
  ).toLowerCase();
  const regla = iprmCatalogo.value.find((r) => r.tipoProductorNombre?.toLowerCase() === tProductor);
  const iprmPct = regla ? Number(regla.porcentaje) : null;
  const calcMontoIPRM = (monto: number): number | null =>
    iprmPct !== null ? monto * (1 - iprmPct / 100) : null;

  // Reconstruir desde divisionConfirmada (poblada en verDetalle desde divisiones_json)
  // o desde detalle.value.divisiones como fallback
  const divs =
    divisionConfirmada.value ||
    (detalle.value.divisiones && detalle.value.divisiones.length > 1
      ? detalle.value.divisiones.map((d) => ({
          productorId: d.productorId,
          nombre: d.nombre,
          kgAsignados: d.kgAsignados,
          rfc: '',
          esPrincipal: false,
        }))
      : null);

  const descuentoGuardado = parseFloat((detalle.value.descuento || descuento.value || '0').toString()) || 0;

  if (divs && divs.length > 1) {
    preliquidacionDocumentos.value = divs.map((prod, i) => {
      const monto = Number(prod.kgAsignados) * precio;
      const montoIPRM = calcMontoIPRM(monto);
      return {
        productor: prod.nombre,
        tProductor: detalle.value.tProductor || selectedRegistro.value?.tProductor || '',
        boleta: `${selectedRegistro.value?.noBoleta}-P${i + 1}`,
        ticket: `${selectedRegistro.value?.ticket}-P${i + 1}`,
        kgALiquidar: Number(prod.kgAsignados),
        monto,
        montoIPRM,
        iprmPorcentaje: iprmPct,
        descuento: descuentoGuardado,
        observaciones: detalle.value.observaciones || '',
      };
    });
  } else {
    // Documento único desde datos históricos
    const monto = detalle.value.importeTotal || parseFloat(aLiquidar.value) || 0;
    const montoIPRM = calcMontoIPRM(monto);
    preliquidacionDocumentos.value = [
      {
        productor: selectedRegistro.value?.productor || '',
        tProductor: detalle.value.tProductor || selectedRegistro.value?.tProductor || '',
        boleta: selectedRegistro.value?.noBoleta || '',
        ticket: selectedRegistro.value?.ticket || '',
        kgALiquidar: detalle.value.kgALiquidar || parseFloat(kgALiquidar.value) || 0,
        monto,
        montoIPRM,
        iprmPorcentaje: iprmPct,
        descuento: descuentoGuardado,
        observaciones: detalle.value.observaciones || '',
      },
    ];
  }

  docActualIdx.value = 0;
  showPreliquidacion.value = true;
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

  // Calcular factor IPRM para el tipo de productor
  const precio = detalle.value.precio || 0;
  const tProductor = (
    detalle.value.tProductor ||
    selectedRegistro.value?.tProductor ||
    ''
  ).toLowerCase();
  const regla = iprmCatalogo.value.find((r) => r.tipoProductorNombre?.toLowerCase() === tProductor);
  const iprmPct = regla ? Number(regla.porcentaje) : null;
  const calcMontoIPRM = (monto: number): number | null =>
    iprmPct !== null ? monto * (1 - iprmPct / 100) : null;

  // IPRM del tipo alternativo (la plantilla describe el escenario contrario)
  const altTipo = getAltTipo(tProductor);
  const reglaAlt = iprmCatalogo.value.find((r) => r.tipoProductorNombre?.toLowerCase() === altTipo);
  const iprmPctAlt = reglaAlt ? Number(reglaAlt.porcentaje) : null;
  const calcMontoIPRMAlt = (monto: number): number | null =>
    iprmPctAlt !== null ? monto * (1 - iprmPctAlt / 100) : null;

  const descuentoActual = parseFloat(descuento.value) || 0;

  if (divisionConfirmada.value && divisionConfirmada.value.length > 1) {
    // Un documento por productor, boleta/ticket con sufijo -1, -2, etc.
    preliquidacionDocumentos.value = divisionConfirmada.value.map((prod, i) => {
      const monto = Number(prod.kgAsignados) * precio;
      const montoIPRM = calcMontoIPRM(monto);
      const montoIPRMAlt = calcMontoIPRMAlt(monto);
      return {
        productor: prod.nombre,
        tProductor: detalle.value.tProductor || selectedRegistro.value?.tProductor || '',
        boleta: `${selectedRegistro.value?.noBoleta}-P${i + 1}`,
        ticket: `${selectedRegistro.value?.ticket}-P${i + 1}`,
        kgALiquidar: Number(prod.kgAsignados),
        monto,
        montoIPRM,
        iprmPorcentaje: iprmPct,
        descuento: descuentoActual,
        // La plantilla muestra el escenario alternativo → monto con IPRM del tipo contrario
        observaciones: interpolarPlantilla(plantillaObs.value, monto, montoIPRMAlt ?? undefined),
      };
    });
  } else {
    // Documento único
    const monto = parseFloat(aLiquidar.value) || 0;
    const montoIPRM = calcMontoIPRM(monto);
    preliquidacionDocumentos.value = [
      {
        productor: selectedRegistro.value?.productor || '',
        tProductor: detalle.value.tProductor || selectedRegistro.value?.tProductor || '',
        boleta: selectedRegistro.value?.noBoleta || '',
        ticket: selectedRegistro.value?.ticket || '',
        kgALiquidar: parseFloat(kgALiquidar.value) || 0,
        monto,
        montoIPRM,
        iprmPorcentaje: iprmPct,
        descuento: descuentoActual,
        // La plantilla muestra el escenario alternativo → monto con IPRM del tipo contrario
        observaciones: interpolarPlantilla(plantillaObs.value, monto, calcMontoIPRMAlt(monto) ?? undefined),
      },
    ];
  }

  docActualIdx.value = 0;
  showPreliquidacion.value = true;
}

function docAnterior() {
  if (docActualIdx.value > 0) docActualIdx.value--;
}
function docSiguiente() {
  if (docActualIdx.value < preliquidacionDocumentos.value.length - 1) docActualIdx.value++;
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

  // 2. Preparación del Payload
  const precio = detalle.value?.precio || 0;
  preliquidacionDto.value = {
    boletaId: detalle.value?.boletaId || 0,
    pesoTara: parseFloat(pesoTara.value.toString().replace(/,/g, '')) || 0,
    pesoNeto: parseFloat(pesoNeto.value.toString().replace(/,/g, '')) || 0,
    descuento: parseFloat(descuento.value.toString().replace(/,/g, '')) || 0,
    kgALiquidar: parseFloat(kgALiquidar.value.toString().replace(/,/g, '')) || 0,
    importeTotal: parseFloat(aLiquidar.value.toString().replace(/,/g, '')) || 0,
    observaciones: observaciones.value || '',
    rt: rt.value || '',
    tipoSiembra: rt.value || '',
  };

  const payload = {
    ...preliquidacionDto.value,
    divisiones: divisionConfirmada.value
      ? divisionConfirmada.value.map((p) => ({
          productorId: p.productorId,
          nombre: p.nombre,
          kgAsignados: Number(p.kgAsignados),
          importeTotal: Number(p.kgAsignados) * precio,
        }))
      : null,
  };

  // ── OFFLINE PATH ──────────────────────────────────────────────────────────
  if (!window.navigator.onLine) {
    offlineStore.agregarPreliquidacion({
      tipo: 'guardar',
      ...payload,
      divisiones: payload.divisiones,
      _localId: 'LOCAL_PRELIQ_' + Date.now(),
      _syncStatus: 'pending',
      _descripcion: `Pre-liquidación boleta #${payload.boletaId}`,
    });
    Notify.create({ type: 'warning', icon: 'cloud_off', message: 'Sin conexión — pre-liquidación guardada localmente. Se sincronizará al volver la red.', timeout: 4000 });
    return;
  }

  $q.loading.show({ message: 'Guardando pre-liquidación...' });

  try {
    // 3. Envío al servidor
    await api.post('/api/preliquidacion/guardar', payload);

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

  if (!window.navigator.onLine) {
    offlineStore.agregarPreliquidacion({
      tipo: 'guardar-foto',
      boletaId: selectedRegistro.value.boletaId,
      ...(uploadedPhotos.value[0] !== undefined ? { foto: uploadedPhotos.value[0] } : {}),
      _localId: 'LOCAL_PRELIQ_' + Date.now(),
      _syncStatus: 'pending',
      _descripcion: `Documentación boleta #${selectedRegistro.value.boletaId}`,
    });
    Notify.create({ type: 'warning', icon: 'cloud_off', message: 'Sin conexión — documentación guardada localmente. Se sincronizará al volver la red.', timeout: 4000 });
    documentacionFinalizada.value = true;
    return;
  }

  try {
    guardandoDocumento.value = true;
    $q.loading.show({ message: 'Subiendo documento al servidor...' });

    const payload = {
      boletaId: selectedRegistro.value.boletaId,
      foto: uploadedPhotos.value[0],
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

// --- FUNCIONES DE DIVISIÓN ---
async function abrirModalDivision() {
  if (!pesoNeto.value || Number(pesoNeto.value) === 0) {
    Notify.create({ type: 'warning', message: 'Debe capturar el Peso Tara antes de dividir.' });
    return;
  }
  if (!detalle.value.precio) {
    Notify.create({ type: 'warning', message: 'El ticket no tiene un Precio autorizado.' });
    return;
  }
  if (!productoresCargados.value) {
    $q.loading.show({ message: 'Cargando catálogo de productores...' });
    await cargarProductoresCatalogo();
    $q.loading.hide();
  }
  opcionesProductoresFiltradas.value = [...productoresCatalogo.value];
  if (divisionConfirmada.value) {
    divisionProductores.value = divisionConfirmada.value.map((p) => ({ ...p }));
  } else {
    divisionProductores.value = [
      {
        productorId: detalle.value.productorId || 0,
        nombre: selectedRegistro.value?.productor || '',
        kgAsignados: kgALiquidarNum.value,
        rfc: '',
        esPrincipal: true,
      },
    ];
  }
  modalDivision.value = true;
}

async function cargarProductoresCatalogo() {
  try {
    const sedeId = authStore.sedeActivaId || 0;
    const { data } = await api.get('/api/catalogos/productores', {
      params: { sedeId, pageSize: 1000 },
    });
    productoresCatalogo.value = (data.items || data).map((p: Record<string, unknown>) => ({
      id: p.id as number,
      nombre: p.nombre as string,
      rfc: (p.rfc as string) || '',
    }));
    productoresCargados.value = true;
  } catch (err) {
    console.error('Error al cargar productores:', err);
  }
}

function divisionRapida(n: number) {
  const kgTotal = kgALiquidarNum.value;
  const kgBase = Math.floor((kgTotal * 1000) / n) / 1000;
  const kgPrincipal = Math.round((kgTotal - kgBase * (n - 1)) * 1000) / 1000;
  const nuevos: ProductorDivision[] = [];
  for (let i = 0; i < n; i++) {
    const kg = i === 0 ? kgPrincipal : kgBase;
    const existente = divisionProductores.value[i];
    nuevos.push({
      productorId: i === 0 ? detalle.value.productorId || 0 : existente?.productorId || 0,
      nombre: i === 0 ? selectedRegistro.value?.productor || '' : existente?.nombre || '',
      kgAsignados: kg,
      rfc: i === 0 ? '' : existente?.rfc || '',
      esPrincipal: i === 0,
    });
  }
  divisionProductores.value = nuevos;
}

function agregarProductorDivision() {
  divisionProductores.value.push({
    productorId: 0,
    nombre: '',
    kgAsignados: 0,
    rfc: '',
    esPrincipal: false,
  });
}

function eliminarProductorDivision(idx: number) {
  if (idx === 0) return;
  divisionProductores.value.splice(idx, 1);
}

function onKgDivisionChange(idx: number, val: string | number | null) {
  const item = divisionProductores.value[idx];
  if (!item) return;
  const nuevo = Math.max(0, parseFloat(val?.toString() || '0') || 0);
  const sumaOtros = divisionProductores.value
    .filter((_, i) => i !== idx)
    .reduce((s, p) => s + (Number(p.kgAsignados) || 0), 0);
  const maxPermitido = Math.round((kgALiquidarNum.value - sumaOtros) * 1000) / 1000;
  item.kgAsignados = Math.min(nuevo, Math.max(0, maxPermitido));
}

function seleccionarProductorDivision(idx: number, productor: ProductorCatalogo | null) {
  const item = divisionProductores.value[idx];
  if (!item || !productor) return;
  item.productorId = productor.id;
  item.nombre = productor.nombre;
  item.rfc = productor.rfc || '';
}

function filtrarProductoresCatalogo(val: string, update: (fn: () => void) => void) {
  update(() => {
    if (!val) {
      opcionesProductoresFiltradas.value = productoresCatalogo.value;
    } else {
      const needle = val.toLowerCase();
      opcionesProductoresFiltradas.value = productoresCatalogo.value.filter(
        (p) => p.nombre.toLowerCase().includes(needle) || p.rfc?.toLowerCase().includes(needle),
      );
    }
  });
}

function abrirModalNuevoProductorDivision() {
  // Detectar el último productor sin asignar para auto-seleccionarlo tras registrar
  let idx = -1;
  for (let i = divisionProductores.value.length - 1; i >= 0; i--) {
    const p = divisionProductores.value[i];
    if (p && !p.esPrincipal && !p.productorId) {
      idx = i;
      break;
    }
  }
  idxProductorPendiente.value = idx >= 0 ? idx : null;
  nuevoProd.tipo = 'Fisica';
  nuevoProd.nombre = '';
  nuevoProd.atiende = '';
  nuevoProd.telefono = '';
  modalProductor.value = true;
}

async function guardarNuevoProductorDivision() {
  if (!nuevoProd.nombre.trim()) {
    Notify.create({ type: 'warning', message: 'Debe ingresar el nombre del productor.' });
    return;
  }
  try {
    const sedeId = authStore.sedeActivaId || 0;
    const payload = {
      nombre: nuevoProd.nombre,
      telefono: nuevoProd.telefono,
      tipo_persona: nuevoProd.tipo,
      atiende: nuevoProd.tipo === 'Moral' ? nuevoProd.atiende : null,
      sedeId,
    };

    const res = await api.post('/api/catalogos/productores', payload);
    const recienCreado: ProductorCatalogo = {
      id: res.data.id,
      nombre: nuevoProd.nombre,
      rfc: '',
    };

    // Agregar al catálogo local
    productoresCatalogo.value = [recienCreado, ...productoresCatalogo.value];
    opcionesProductoresFiltradas.value = [...productoresCatalogo.value];

    // Auto-asignar al productor pendiente si hay uno
    if (idxProductorPendiente.value !== null) {
      seleccionarProductorDivision(idxProductorPendiente.value, recienCreado);
    }

    modalProductor.value = false;
    Notify.create({ type: 'positive', message: 'Productor registrado con éxito.' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al registrar productor.' });
  }
}

function confirmarDivision() {
  if (divisionProductores.value.length < 2) {
    Notify.create({
      type: 'warning',
      message: 'Debe agregar al menos 2 productores para dividir.',
    });
    return;
  }
  if (Math.abs(pendientePorAsignar.value) > 0.001) {
    Notify.create({
      type: 'warning',
      message: `Pendiente por asignar: ${pendientePorAsignar.value.toFixed(3)} kg. La suma debe ser exactamente ${fmtNum(kgALiquidar.value)} kg.`,
    });
    return;
  }
  const invalido = divisionProductores.value.find((p) => !p.esPrincipal && !p.productorId);
  if (invalido) {
    Notify.create({
      type: 'warning',
      message: 'Debe seleccionar todos los productores de la lista.',
    });
    return;
  }
  divisionConfirmada.value = divisionProductores.value.map((p) => ({ ...p }));
  modalDivision.value = false;
  Notify.create({
    type: 'positive',
    message: `División confirmada entre ${divisionProductores.value.length} productores.`,
  });
}

function volverALista() {
  showDetail.value = false;
  showPreliquidacion.value = false;
  showBoleta.value = false;
  selectedRegistro.value = null;
  detalle.value = {};
  preliquidacionGuardada.value = false;
  divisionConfirmada.value = null;
  divisionProductores.value = [];
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
  void cargarRegistros();
  void cargarResumen();
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
  window.addEventListener('online', _syncOnline);
  window.addEventListener('offline', _syncOnline);
  await Promise.all([
    cargarFactorImpurezas(),
    cargarIPRM(),
    cargarRegistros(),
    cargarResumen(),
    cargarConfigCampos(),
    cargarConfigSistema(),
  ]);
});

onBeforeUnmount(() => {
  window.removeEventListener('online', _syncOnline);
  window.removeEventListener('offline', _syncOnline);
});

watch(
  () => authStore.sedeActivaId,
  async () => {
    await Promise.all([
      cargarFactorImpurezas(),
      cargarIPRM(),
      cargarRegistros(),
      cargarResumen(),
      cargarConfigCampos(),
    ]);
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
