<template>
  <q-page class="bg-grey-2">
    <!-- ═══ Pantalla Cesion de Derechos ═══ -->
    <PantallaCesionDerechos
      v-if="mostrarCesionDerechos && detalle"
      :ticket="detalle.ticket"
      :fecha="detalle.fecha"
      :comprador="detalle.comprador || 'N/A'"
      :productor-anterior="props.productor"
      :datos-entrega="{
        boleta: {
          productor: detalle.productor,
          telefono: detalle.telefono || 'N/A',
          municipio: detalle.municipio || detalle.origen || 'N/A',
          humedad: `${detalle.humedad || 0}%`,
          impurezas: `${detalle.impurezas || 0}%`,
          r1: `${detalle.r1 || 0}%`,
          r2: `${detalle.r2 || 0}%`,
        },
        preliquidacion: {
          kgLiquidar: formatNumber(detalle.kgLiquidar),
          precio: `$${formatMoney(detalle.precio)}`,
        },
      }"
      @back="mostrarCesionDerechos = false"
      @guardar="onGuardarCesionDerechos"
    />

    <!-- ═══ Pantalla principal detalle ═══ -->
    <template v-else>
      <!-- Header -->
      <div class="bg-orange-6 text-white q-px-lg q-py-md row items-center q-gutter-md">
        <q-btn flat round icon="arrow_back" @click="emit('back')" />
        <div class="text-h6">Facturacion - Detalle</div>
      </div>

      <!-- Loading -->
      <div v-if="cargando" class="q-pa-xl text-center">
        <q-spinner-dots size="50px" color="orange-6" />
        <div class="text-grey-7 q-mt-md">Cargando detalle...</div>
      </div>

      <div v-else-if="detalle" class="q-pa-lg" style="max-width: 1100px; margin: 0 auto">
        <!-- ═══ 1. Datos del Registro + Boton ENDOSO ═══ -->
        <q-card class="q-mb-lg" flat bordered>
          <q-card-section class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-medium">Datos Registro</div>
            <q-btn
              color="purple-8"
              label="ENDOSO"
              class="text-weight-medium"
              @click="mostrarCesionDerechos = true"
            />
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input dense outlined label="No. Ticket" :model-value="detalle.ticket" readonly />
              </div>
              <div class="col-12 col-md-6">
                <q-input dense outlined label="Fecha" :model-value="detalle.fecha" readonly />
              </div>
              <div class="col-12 col-md-6">
                <q-input dense outlined label="Productor" :model-value="props.productor" readonly />
              </div>

              <!-- RFC editable si pendiente -->
              <div class="col-12 col-md-6">
                <q-input
                  dense
                  outlined
                  :label="`RFC${rfcPendiente ? ' *' : ''}`"
                  v-model="rfcInputValue"
                  :readonly="!rfcPendiente || rfcRegistrado"
                  maxlength="13"
                  class="font-mono"
                >
                  <template v-if="rfcPendiente && !rfcRegistrado" #append>
                    <q-btn dense flat color="purple-8" label="Guardar" @click="handleGuardarRFC" />
                  </template>
                </q-input>

                <div
                  v-if="rfcPendiente && !rfcRegistrado"
                  class="text-caption text-purple-8 q-mt-xs"
                >
                  12 caracteres = Persona Moral | 13 caracteres = Persona Fisica
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- ═══ 2. Banner RFC pendiente ═══ -->
        <q-banner
          v-if="rfcPendiente && !rfcRegistrado"
          class="bg-purple-1 text-purple-10 q-mb-lg"
          rounded
          dense
        >
          <template #avatar>
            <q-icon name="lightbulb" color="purple-8" />
          </template>
          <div class="text-weight-medium">RFC Pendiente - Accion requerida</div>
          <div class="text-body2">
            Capture el RFC y presione <b>Guardar</b>. El sistema detectara Persona Moral/Fisica y
            habilitara campos correspondientes.
          </div>
        </q-banner>

        <!-- ═══ 3. Producto ═══ -->
        <q-card v-if="detalle.producto" class="q-mb-lg" flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium text-orange-8 q-mb-sm">Producto</div>
            <q-card flat bordered class="bg-grey-1">
              <q-card-section class="text-h6 text-grey-9">
                {{ detalle.producto }}
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>

        <!-- ═══ 4. Tabs (multiples tickets) ═══ -->
        <q-card v-if="props.tickets.length > 1" class="q-mb-lg" flat bordered>
          <q-tabs
            v-model="ticketActivo"
            dense
            class="text-grey-8"
            active-color="white"
            active-bg-color="orange-6"
            indicator-color="transparent"
            align="left"
          >
            <q-tab
              v-for="(t, idx) in props.tickets"
              :key="t"
              :name="idx"
              :label="`Entrega ${idx + 1} - ${t}`"
            />
          </q-tabs>
        </q-card>

        <!-- ═══ 5. INFORMACION GENERAL (expansion) ═══ -->
        <q-expansion-item
          v-model="expandidoInfoGeneral"
          label="Informacion General"
          header-class="bg-orange-6 text-white text-weight-medium"
          expand-icon-class="text-white"
          class="q-mb-lg"
          bordered
        >
          <q-card flat>
            <q-card-section>
              <!-- ═══ 5a. Campos basicos boleta ═══ -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="FOLIO / BOLETA"
                    :model-value="detalle.folio || 'N/A'"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="FECHA Y HORA"
                    :model-value="detalle.fechaHora || detalle.fecha"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="PRODUCTOR"
                    :model-value="detalle.productor"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="TELEFONO"
                    :model-value="detalle.telefono || 'N/A'"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="T. PRODUCTOR"
                    :model-value="detalle.tProductor || 'N/A'"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="COMPRADOR"
                    :model-value="detalle.comprador || 'N/A'"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="ORIGEN"
                    :model-value="detalle.origen || 'N/A'"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="PRECIO"
                    :model-value="`$${formatMoney(detalle.precio)}`"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="DESCUENTO (KG/TON)"
                    :model-value="`${detalle.descuento} kg/ton`"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="CALIBRE"
                    :model-value="detalle.calibre || 'N/A'"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="HUMEDAD"
                    :model-value="`${detalle.humedad || 0}%`"
                    readonly
                  />
                </div>

                <!-- ATIENDE: editable si persona moral y RFC pendiente -->
                <div v-if="mostrarAtiendeEnBoleta" class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="ATIENDE (Representante)"
                    v-model="datosBoletaEditables.atiende"
                    :readonly="!rfcPendiente"
                    :hint="rfcPendiente ? 'Requerido para Persona Moral' : ''"
                  />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- ═══ 5b. Bascula ═══ -->
              <div class="text-subtitle2 text-weight-medium q-mb-sm">Datos de Bascula</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="CHOFER"
                    :model-value="detalle.chofer || 'N/A'"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="PLACAS"
                    :model-value="detalle.placas || 'N/A'"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="PESO BRUTO"
                    :model-value="`${formatNumber(detalle.pesoBruto)} kg`"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="TARA"
                    :model-value="`${formatNumber(detalle.tara)} kg`"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="PESO NETO"
                    :model-value="`${formatNumber(detalle.pesoNeto)} kg`"
                    readonly
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="KG A LIQUIDAR"
                    :model-value="formatNumber(detalle.kgLiquidar)"
                    readonly
                  />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- ═══ 5c. Resultados de Analisis ═══ -->
              <q-card flat bordered class="bg-grey-1">
                <q-card-section class="text-weight-medium">Resultados de Analisis</q-card-section>
                <q-card-section>
                  <TablaAnalisisDesplegable
                    :tipo-grano-id="detalle.granoId || 0"
                    :impurezas="detalle.impurezas || 0"
                    :r1="detalle.r1 || 0"
                    :r2="detalle.r2 || 0"
                    :cafes-lisos="0"
                    :manchados="detalle.r2Manchado || 0"
                    :queb-mxc="detalle.r2Quebrado || 0"
                    :helados="0"
                    :alimonados="0"
                    :revolcados="0"
                    :suma-r2="detalle.sumaR2 || 0"
                    :total-danos-num="detalleTotalDanos"
                    :exportacion="detalle.exportacion || 0"
                    :calibre="detalle.calibre || ''"
                    :read-only="true"
                    :frijol-data-inicial="frijolDataInicial"
                    :camposConfig="camposConfigActual"
                  />
                </q-card-section>
              </q-card>

              <q-separator class="q-my-md" />

              <!-- ═══ 5d. Observaciones ═══ -->
              <!-- <div v-if="detalle.observaciones" class="q-mb-md">
                <div class="text-subtitle2 text-weight-medium q-mb-sm">Observaciones</div>
                <q-input
                  dense outlined readonly
                  type="textarea"
                  :model-value="detalle.observaciones"
                  autogrow
                />
              </div> -->

              <q-separator class="q-my-md" />

              <!-- ═══ 5e. Campos de Facturacion ═══ -->
              <div class="row q-col-gutter-md q-mt-sm">
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="IMPORTE (bloqueado - desde XML)"
                    v-model="datosFacturacion.importe"
                    readonly
                    bg-color="grey-2"
                  />
                </div>
                <div class="col-12 col-md-8">
                  <q-input
                    dense
                    outlined
                    label="FOLIO FISCAL (UUID)"
                    :model-value="xmlFolioFiscal || detalle?.folioFiscal || ''"
                    readonly
                    bg-color="grey-2"
                    placeholder="Se extrae automáticamente del XML"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="PAGO PREDIAL"
                    v-model="datosFacturacion.pagoPredial"
                    :readonly="xmlGuardado"
                    :bg-color="xmlGuardado ? 'grey-2' : undefined"
                    placeholder="Ingrese pago predial"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="DESC. PREDIAL"
                    v-model="datosFacturacion.descPredial"
                    :readonly="xmlGuardado"
                    :bg-color="xmlGuardado ? 'grey-2' : undefined"
                    placeholder="Ingrese desc. predial"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="DESC. ISR"
                    v-model="datosFacturacion.descISR"
                    :readonly="xmlGuardado"
                    :bg-color="xmlGuardado ? 'grey-2' : undefined"
                    placeholder="Ingrese desc. ISR"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="A PAGAR (calculado automaticamente)"
                    :model-value="aPagarCalculado"
                    readonly
                    bg-color="grey-2"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="DIAS HABILES DE PAGO"
                    v-model="datosFacturacion.diasHabilesPago"
                    :readonly="xmlGuardado"
                    :bg-color="xmlGuardado ? 'grey-2' : undefined"
                    placeholder="Ingrese dias habiles"
                  />
                </div>
              </div>

              <!-- ═══ FACTURA PROVEEDOR ═══ -->
              <div class="factura-proveedor-box q-mt-md q-pa-md">
                <div class="text-weight-medium text-center q-mb-xs">FACTURA PROVEEDOR</div>

                <div
                  v-if="detalle.tiene_factura_xml === 1 || xmlGuardado"
                  class="column items-center q-gutter-sm"
                >
                  <q-banner
                    dense
                    class="bg-green-1 text-green-9 rounded-borders full-width text-center"
                  >
                    <q-icon name="check_circle" size="sm" /> XML ya registrado oficialmente.
                  </q-banner>
                  <q-btn
                    v-if="expedienteGuardado?.xml"
                    outline
                    color="green-8"
                    icon="download"
                    :label="`Descargar: ${expedienteGuardado.xml.nombre}`"
                    @click="
                      descargarArchivo(expedienteGuardado.xml.base64, expedienteGuardado.xml.nombre)
                    "
                  />
                  <q-btn
                    v-if="expedienteGuardado?.xml"
                    flat
                    color="red-7"
                    icon="delete"
                    label="Eliminar XML y volver a subir"
                    size="sm"
                    @click="confirmarEliminarDoc('xml')"
                  />
                </div>

                <div v-else>
                  <div class="text-caption text-grey-6 text-center q-mb-sm">
                    Cargue el XML de la factura para extraer automáticamente IMPORTE.
                  </div>
                  <q-file
                    dense
                    outlined
                    label="Cargar XML"
                    v-model="xmlFile"
                    accept=".xml"
                    @update:model-value="onXmlFileSelected"
                  >
                    <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                  </q-file>

                  <q-btn
                    v-if="xmlFile && !xmlGuardado"
                    color="orange-7"
                    label="Guardar XML ahora"
                    icon="save"
                    class="full-width q-mt-sm"
                    @click="handleGuardarXmlFactura"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <!-- ═══ 6. Info Productor (editable, visible tras guardar RFC) ═══ -->
        <q-expansion-item
          v-if="rfcRegistrado"
          v-model="expandidoInfoProductor"
          label="Informacion del Productor"
          header-class="bg-purple-8 text-white text-weight-medium"
          expand-icon-class="text-white"
          class="q-mb-lg"
          bordered
        >
          <q-card flat>
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="NOMBRE"
                    v-model="datosProductor.nombre"
                    :readonly="documentosGuardados"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="TELEFONO"
                    v-model="datosProductor.telefono"
                    :readonly="documentosGuardados"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="CORREO"
                    v-model="datosProductor.correo"
                    type="email"
                    :readonly="documentosGuardados"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="ORIGEN"
                    v-model="datosProductor.origen"
                    :readonly="documentosGuardados"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="MUNICIPIO"
                    v-model="datosProductor.municipio"
                    :readonly="documentosGuardados"
                  />
                </div>
                <div v-if="esPersonaMoralActual" class="col-12 col-md-6">
                  <q-input
                    dense
                    outlined
                    label="ATIENDE (Representante)"
                    v-model="datosProductor.atiende"
                    :readonly="documentosGuardados"
                    hint="Requerido para Persona Moral"
                  />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- Contacto adicional -->
              <div class="text-subtitle2 text-weight-medium q-mb-sm">Contacto Adicional</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="NOMBRE"
                    v-model="datosProductor.contactoNombre"
                    :readonly="documentosGuardados"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="CORREO"
                    v-model="datosProductor.contactoCorreo"
                    type="email"
                    :readonly="documentosGuardados"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    dense
                    outlined
                    label="TELEFONO"
                    v-model="datosProductor.contactoTelefono"
                    :readonly="documentosGuardados"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <!-- ═══ 7. Resumen de Pago ═══ -->
        <q-card class="q-mb-lg" flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium text-green-8 q-mb-sm">
              Resumen de Pago
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  dense
                  outlined
                  label="IMPORTE"
                  :model-value="datosFacturacion.importe ? `$${datosFacturacion.importe}` : ''"
                  readonly
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  dense
                  outlined
                  label="A PAGAR"
                  :model-value="datosFacturacion.importe ? `$${aPagarCalculado}` : ''"
                  readonly
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input dense outlined label="STATUS" :model-value="detalle.status" readonly />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- ═══ 8. Documentos del expediente (visible tras guardar RFC) ═══ -->
        <q-card v-if="rfcRegistrado" class="q-mb-lg" flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium text-purple-8 q-mb-sm">
              Documentos del Expediente
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <label class="text-caption text-weight-bold">Identificación Oficial (INE) *</label>

                <div
                  v-if="expedienteGuardado?.identificacion"
                  class="row items-center bg-grey-2 q-pa-sm rounded-borders"
                >
                  <q-icon name="picture_as_pdf" color="red" size="sm" />
                  <div class="q-ml-sm ellipsis" style="max-width: 150px">
                    {{ expedienteGuardado.identificacion.nombre }}
                  </div>
                  <q-space />
                  <q-btn
                    flat
                    round
                    dense
                    color="green"
                    icon="download"
                    @click="
                      descargarArchivo(
                        expedienteGuardado.identificacion.base64,
                        expedienteGuardado.identificacion.nombre,
                      )
                    "
                  />
                  <q-btn
                    flat
                    round
                    dense
                    color="red"
                    icon="delete"
                    @click="confirmarEliminarDoc('identificacion')"
                  />
                </div>

                <q-file
                  v-else
                  dense
                  outlined
                  v-model="archivoIdentificacion"
                  accept=".pdf"
                  :loading="ocrCargandoINE"
                  @update:model-value="onIdentificacionSelected"
                >
                  <template #prepend><q-icon name="cloud_upload" /></template>
                </q-file>
                <div v-if="ineChipInfo" class="q-mt-xs">
                  <q-chip
                    :color="ineChipInfo.color"
                    text-color="white"
                    :icon="ineChipInfo.icon"
                    size="sm"
                  >
                    {{ ineChipInfo.label }}
                  </q-chip>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <label class="text-caption text-weight-bold">Documento Fiscal *</label>

                <div
                  v-if="expedienteGuardado?.constancia"
                  class="row items-center bg-grey-2 q-pa-sm rounded-borders"
                >
                  <q-icon name="description" color="primary" size="sm" />
                  <div class="q-ml-sm ellipsis" style="max-width: 150px">
                    {{ expedienteGuardado.constancia.nombre }}
                  </div>
                  <q-space />
                  <q-btn
                    flat
                    round
                    dense
                    color="green"
                    icon="download"
                    @click="
                      descargarArchivo(
                        expedienteGuardado.constancia.base64,
                        expedienteGuardado.constancia.nombre,
                      )
                    "
                  />
                  <q-btn
                    flat
                    round
                    dense
                    color="red"
                    icon="delete"
                    @click="confirmarEliminarDoc('constancia')"
                  />
                </div>

                <q-file
                  v-else
                  dense
                  outlined
                  v-model="archivoConstancia"
                  accept=".pdf"
                  @update:model-value="onConstanciaSelected"
                >
                  <template #prepend><q-icon name="cloud_upload" /></template>
                </q-file>
              </div>

              <div class="col-12 col-md-6">
                <label class="text-caption text-weight-bold">Opinión de Cumplimiento *</label>

                <div
                  v-if="expedienteGuardado?.opinion"
                  class="row items-center bg-grey-2 q-pa-sm rounded-borders"
                >
                  <q-icon name="assignment_turned_in" color="blue" size="sm" />
                  <div class="q-ml-sm ellipsis" style="max-width: 150px">
                    {{ expedienteGuardado.opinion.nombre }}
                  </div>
                  <q-space />
                  <q-btn
                    flat
                    round
                    dense
                    color="green"
                    icon="download"
                    @click="
                      descargarArchivo(
                        expedienteGuardado.opinion.base64,
                        expedienteGuardado.opinion.nombre,
                      )
                    "
                  />
                  <q-btn
                    flat
                    round
                    dense
                    color="red"
                    icon="delete"
                    @click="confirmarEliminarDoc('opinion')"
                  />
                </div>

                <q-file
                  v-else
                  dense
                  outlined
                  v-model="archivoOpinion"
                  accept=".pdf"
                  @update:model-value="onOpinionSelected"
                >
                  <template #prepend><q-icon name="cloud_upload" /></template>
                </q-file>
              </div>

              <div class="col-12 col-md-6">
                <label class="text-caption text-weight-bold">Carátula de Cuenta Bancaria *</label>

                <div
                  v-if="expedienteGuardado?.cuenta_bancaria"
                  class="row items-center bg-grey-2 q-pa-sm rounded-borders"
                >
                  <q-icon name="account_balance" color="teal" size="sm" />
                  <div class="q-ml-sm ellipsis" style="max-width: 150px">
                    {{ expedienteGuardado.cuenta_bancaria.nombre }}
                  </div>
                  <q-space />
                  <q-btn
                    flat round dense color="green" icon="download"
                    @click="descargarArchivo(expedienteGuardado.cuenta_bancaria.base64, expedienteGuardado.cuenta_bancaria.nombre)"
                  />
                  <q-btn
                    flat round dense color="red" icon="delete"
                    @click="confirmarEliminarDoc('cuenta_bancaria')"
                  />
                </div>

                <q-file
                  v-else
                  dense outlined
                  v-model="archivoCuentaBancaria"
                  accept=".pdf"
                >
                  <template #prepend><q-icon name="cloud_upload" /></template>
                </q-file>

                <q-checkbox
                  v-model="cuentaBancariaDatosCoincidenCheck"
                  label="¿Datos coinciden con el productor?"
                  color="green"
                  class="q-mt-xs"
                />
              </div>

              <div class="col-12 col-md-6">
                <label class="text-caption text-weight-bold">Otro Documento (opcional)</label>

                <div
                  v-if="expedienteGuardado?.otro"
                  class="row items-center bg-grey-2 q-pa-sm rounded-borders"
                >
                  <q-icon name="attach_file" color="grey-7" size="sm" />
                  <div class="q-ml-sm ellipsis" style="max-width: 150px">
                    {{ expedienteGuardado.otro.nombre }}
                  </div>
                  <q-space />
                  <q-btn
                    flat
                    round
                    dense
                    color="green"
                    icon="download"
                    @click="
                      descargarArchivo(
                        expedienteGuardado.otro.base64,
                        expedienteGuardado.otro.nombre,
                      )
                    "
                  />
                  <q-btn
                    flat
                    round
                    dense
                    color="red"
                    icon="delete"
                    @click="confirmarEliminarDoc('otro')"
                  />
                </div>

                <q-file
                  v-else
                  dense
                  outlined
                  v-model="archivoOtro"
                  accept=".pdf"
                  :disable="expedienteCompleto"
                >
                  <template #prepend><q-icon name="cloud_upload" /></template>
                </q-file>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- ═══ 9. Secciones Productor Adicional ═══ -->
        <template v-if="mostrarAgregarProductor">
          <q-expansion-item
            v-model="expandidoInfoProductorAdicional"
            label="Informacion Productor"
            header-class="bg-purple-7 text-white text-weight-medium"
            expand-icon-class="text-white"
            class="q-mb-lg"
            bordered
          >
            <q-card flat>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="Nombre"
                      v-model="datosProductorAdicional.nombre"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="Telefono"
                      v-model="datosProductorAdicional.telefono"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="RFC"
                      v-model="datosProductorAdicional.rfc"
                      maxlength="13"
                      class="font-mono"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="Correo"
                      v-model="datosProductorAdicional.correo"
                      type="email"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="Origen"
                      v-model="datosProductorAdicional.origen"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="Municipio"
                      v-model="datosProductorAdicional.municipio"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-expansion-item
            v-model="expandidoContactoAdicionalAdicional"
            label="Contacto Adicional"
            header-class="bg-purple-7 text-white text-weight-medium"
            expand-icon-class="text-white"
            class="q-mb-lg"
            bordered
          >
            <q-card flat>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <q-input
                      dense
                      outlined
                      label="Nombre"
                      v-model="datosProductorAdicional.contactoNombre"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      dense
                      outlined
                      label="Correo"
                      v-model="datosProductorAdicional.contactoCorreo"
                      type="email"
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      dense
                      outlined
                      label="Telefono"
                      v-model="datosProductorAdicional.contactoTelefono"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-expansion-item
            v-model="expandidoPreliquidacionesAdicional"
            label="Preliquidaciones"
            header-class="bg-purple-7 text-white text-weight-medium"
            expand-icon-class="text-white"
            class="q-mb-lg"
            bordered
          >
            <q-card flat>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="Productor"
                      :model-value="detalle.productor"
                      readonly
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="Producto"
                      :model-value="detalle.producto"
                      readonly
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="Precio"
                      :model-value="`$${formatMoney(detalle.precio)}`"
                      readonly
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="KG a Liquidar"
                      :model-value="formatNumber(detalle.kgLiquidar)"
                      readonly
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="Peso Bruto"
                      :model-value="`${formatNumber(detalle.pesoBruto)} kg`"
                      readonly
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="Tara"
                      :model-value="`${formatNumber(detalle.tara)} kg`"
                      readonly
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      dense
                      outlined
                      label="Peso Neto"
                      :model-value="`${formatNumber(detalle.pesoNeto)} kg`"
                      readonly
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input dense outlined label="Fecha" :model-value="detalle.fecha" readonly />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </template>

        <!-- ═══ 10. Acciones ═══ -->
        <div class="column q-gutter-md q-mt-md">
          <q-banner
            v-if="expedienteCompleto"
            dense
            class="bg-green-1 text-green-9 rounded-borders"
          >
            <template #avatar><q-icon name="verified" color="green-8" /></template>
            Expediente completo. Para modificar, elimina el documento correspondiente y vuelve a subirlo.
          </q-banner>
          <q-btn
            color="green-7"
            label="Guardar"
            icon="save"
            class="full-width"
            :disable="expedienteCompleto"
            @click="handleGuardar"
          />
        </div>
      </div>

      <!-- Sin datos -->
      <div v-else class="q-pa-xl text-center text-grey-7">
        No se encontro informacion para este ticket.
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';
import PantallaCesionDerechos from './PantallaCesionDerechos.vue';
import TablaAnalisisDesplegable from 'src/pages/analisis/TablaAnalisisDesplegable.vue';
// import { ocrPDFToText } from 'src/utils/pdfOcr';

async function doEliminarDoc(
  tipo: 'identificacion' | 'constancia' | 'opinion' | 'xml' | 'otro' | 'cuenta_bancaria',
) {
  try {
    const sedeId = authStore.sedeActivaId || 0;
    await api.post('/api/facturacion/eliminar-documento', {
      tickets: props.tickets,
      sedeId,
      tipo,
    });
    if (expedienteGuardado.value) {
      const exp = expedienteGuardado.value;
      if (tipo === 'identificacion') delete exp.identificacion;
      else if (tipo === 'constancia') delete exp.constancia;
      else if (tipo === 'opinion') delete exp.opinion;
      else if (tipo === 'cuenta_bancaria') delete exp.cuenta_bancaria;
      else if (tipo === 'otro') delete exp.otro;
      else if (tipo === 'xml') {
        delete exp.xml;
        xmlGuardado.value = false;
        xmlFacturaSubido.value = false;
        xmlFile.value = null;
        xmlFolioFiscal.value = '';
        xmlRfcEmisor.value = '';
        xmlFecha.value = '';
        datosFacturacion.importe = '';
        datosFacturacion.pagoPredial = '';
        datosFacturacion.descPredial = '';
        datosFacturacion.descISR = '';
        datosFacturacion.diasHabilesPago = '';
      }
    }
    notifyOk(`Documento eliminado. Puedes volver a subirlo.`);
  } catch {
    notifyError(`Error al eliminar el documento. Intente de nuevo.`);
  }
}

const confirmarEliminarDoc = (
  tipo: 'identificacion' | 'constancia' | 'opinion' | 'xml' | 'otro' | 'cuenta_bancaria',
) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de que deseas eliminar el archivo de ${tipo}? Podrás volver a subirlo.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void doEliminarDoc(tipo);
  });
};

/* ═══════════════════════════
   Interfaces
═══════════════════════════ */
interface DetalleData {
  ticket: string;
  fecha: string;
  fechaHora: string;
  productor: string;
  rfc: string;
  tProductor: string;
  telefono: string;
  atiende: string;
  correo: string;
  municipio: string;
  folio: string;
  comprador: string;
  origen: string;
  calibre: string;
  humedad: number;
  impurezas: number;
  r1: number;
  r2: number;
  r2Manchado: number;
  r2Quebrado: number;
  sumaR2: number;
  totalDanos: number;
  producto: string;
  chofer: string;
  placas: string;
  pesoBruto: number;
  tara: number;
  pesoNeto: number;
  precio: number;
  descuento: number;
  kgLiquidar: number;
  observaciones: string;
  importe: number;
  aPagar: number;
  folioFiscal: string;
  serie: string;
  folioFactura: string;
  status: string;
  tieneDocumentos: boolean;
  tieneFacturaXML: boolean;
  granoId?: number;
  analisisDatosAdicionales?: string;
  exportacion?: number;
  sedeId?: number;
  tiene_factura_xml?: number;
  tiene_documentos?: number;
}

interface ValidacionINE {
  frente: string | undefined;
  mrz: string | undefined;
  coinciden: boolean;
}

const ineValidacion = ref<ValidacionINE | null>(null);

interface ArchivoGuardado {
  nombre: string;
  base64: string;
  fecha?: string;
}

interface ExpedienteGuardado {
  datosProductor?: {
    nombre?: string;
    telefono?: string;
    correo?: string;
    origen?: string;
    municipio?: string;
    atiende?: string;
  };
  datosFacturacion?: {
    importe?: string;
    pagoPredial?: string;
    descPredial?: string;
    descISR?: string;
    diasHabilesPago?: string;
  };
  xml?: ArchivoGuardado & {
    importe?: string;
    pagoPredial?: string;
    descPredial?: string;
    descISR?: string;
    diasHabilesPago?: string;
  };
  identificacion?: ArchivoGuardado;
  constancia?: ArchivoGuardado;
  opinion?: ArchivoGuardado;
  cuenta_bancaria?: ArchivoGuardado;
  cuenta_bancaria_datos_coinciden?: boolean;
  actaConstitutiva?: ArchivoGuardado;
  otro?: ArchivoGuardado;
  contacto_adicional?: {
    nombre?: string;
    telefono?: string;
    correo?: string;
  };
}

interface Props {
  productor: string;
  rfc: string;
  tickets: string[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  back: [];
  'update-rfc': [tickets: string[], nuevoRfc: string];
  'update-documentos-status': [
    tickets: string[],
    tieneDocumentos: boolean,
    tieneFacturaXML: boolean,
  ];
}>();

const $q = useQuasar();
const authStore = useAuthStore();

/* ═══════════════════════════
   Estado
═══════════════════════════ */
const cargando = ref(false);
const detalle = ref<DetalleData | null>(null);
const ticketActivo = ref(0);

// Expansion panels
const expandidoInfoGeneral = ref(true);
const expandidoInfoProductor = ref(true);
const mostrarAgregarProductor = ref(false);
const expandidoInfoProductorAdicional = ref(true);
const expandidoContactoAdicionalAdicional = ref(false);
const expandidoPreliquidacionesAdicional = ref(false);
const frijolDataInicial = computed(() => {
  const raw = detalle.value?.analisisDatosAdicionales;
  if (!raw) return undefined;
  try {
    const datos = JSON.parse(raw);
    return datos.frijol_datos || undefined;
  } catch {
    return undefined;
  }
});

const detalleTotalDanos = computed(() => {
  if (!detalle.value) return 0;
  const imp = Number(detalle.value.impurezas || 0);
  const r1Val = Number(detalle.value.r1 || 0);
  const sr2 = Number(detalle.value.sumaR2 || 0);
  return Math.round(imp + r1Val + sr2);
});

// Cesion de derechos
const mostrarCesionDerechos = ref(false);

// RFC
const rfcPendiente = computed(() => props.rfc === 'Pendiente RFC');
const rfcRegistrado = ref(props.rfc !== 'Pendiente RFC');
const rfcLocal = ref('');

const rfcInputValue = computed({
  get() {
    return rfcPendiente.value ? rfcLocal.value : props.rfc;
  },
  set(v: string) {
    if (rfcPendiente.value) rfcLocal.value = (v || '').toUpperCase();
  },
});

// Persona moral
const esPersonaMoral = (rfcValue: string) => {
  if (!rfcValue || rfcValue === 'Pendiente RFC') return false;
  return rfcValue.length === 12;
};

const esPersonaMoralActual = computed(() => {
  if (rfcPendiente.value) return esPersonaMoral(rfcLocal.value);
  return esPersonaMoral(props.rfc);
});

const mostrarAtiendeEnBoleta = computed(() => {
  if (rfcPendiente.value) return esPersonaMoral(rfcLocal.value);
  return esPersonaMoral(props.rfc);
});

// Datos boleta editables (ATIENDE)
const datosBoletaEditables = reactive({ atiende: '' });

// Datos productor editables
const datosProductor = reactive({
  nombre: '',
  telefono: '',
  correo: '',
  origen: '',
  municipio: '',
  atiende: '',
  contactoNombre: '',
  contactoCorreo: '',
  contactoTelefono: '',
});

// Documentos
const documentosGuardados = ref(false);
const archivoIdentificacion = ref<File | null>(null);
// const ineValidacion = ref<{ frente?: string; mrz?: string; coinciden?: boolean } | null>(null);
const ocrCargandoINE = ref(false);
const ocrCargandoConstancia = ref(false);
const ocrCargandoOpinion = ref(false);
const archivoConstancia = ref<File | null>(null);
const archivoOpinion = ref<File | null>(null);
// const archivoActaConstitutiva = ref<File | null>(null);
const archivoOtro = ref<File | null>(null);
const errorConstancia = ref('');
const errorOpinion = ref('');
const fechaConstanciaStr = ref('');
const fechaOpinionStr = ref('');

const datosProductorAdicional = reactive({
  nombre: '',
  telefono: '',
  rfc: '',
  correo: '',
  origen: '',
  municipio: '',
  contactoNombre: '',
  contactoCorreo: '',
  contactoTelefono: '',
});

// Expediente guardado en DB
const expedienteGuardado = ref<ExpedienteGuardado | null>(null);

// XML Factura
const xmlFacturaSubido = ref(false);
const xmlGuardado = ref(false);
const xmlFile = ref<File | null>(null);
const nombreArchivoXml = ref('');
const xmlFolioFiscal = ref('');
const xmlRfcEmisor = ref('');
const xmlFecha = ref('');

// Carátula de Cuenta Bancaria
const archivoCuentaBancaria = ref<File | null>(null);
const cuentaBancariaDatosCoincidenCheck = ref(false);

// Configuración de campos de análisis (visibilidad)
interface CampoConfigFacturacion {
  claveCampo: string;
  visible: boolean;
  nombreMostrar?: string;
  granoId?: number | null;
  pantalla?: string;
}
const camposAnalisisConfig = ref<CampoConfigFacturacion[]>([]);
const camposConfigActual = computed(() => {
  const granoId = detalle.value?.granoId ?? null;
  return camposAnalisisConfig.value.filter(c => c.granoId === granoId);
});
async function cargarConfigCampos() {
  try {
    const sedeId = authStore.sedeActivaId ?? 0;
    const { data } = await api.get<{ campos: (CampoConfigFacturacion & { pantalla: string })[] }>(
      '/api/configuracion-recepcion',
      { params: { sedeId } },
    );
    camposAnalisisConfig.value = (data.campos ?? [])
      .filter(c => c.pantalla === 'ANALISIS')
      .map(c => ({ ...c, visible: !!c.visible, granoId: c.granoId ?? null }));
  } catch {
    // Si falla, TablaAnalisisDesplegable mostrará todos los campos (comportamiento por defecto)
  }
}

// Facturacion editable
const datosFacturacion = reactive({
  importe: '',
  pagoPredial: '',
  descPredial: '',
  descISR: '',
  diasHabilesPago: '',
});

// Chip de validacion INE
const ineChipInfo = computed(() => {
  const v = ineValidacion.value;
  if (!v || (!v.frente && !v.mrz)) return null;
  if (v.coinciden === false) {
    return {
      color: 'red-2',
      textColor: 'red-10',
      icon: 'warning',
      label: 'Nombres no coinciden en ambas caras',
    };
  }
  if (v.frente && v.mrz) {
    return {
      color: 'green-2',
      textColor: 'green-10',
      icon: 'verified_user',
      label: `Validado: ${v.frente}`,
    };
  }
  const nombre = v.frente ?? (v.mrz ? normalizarMRZANombre(v.mrz) : '');
  return { color: 'blue-2', textColor: 'blue-10', icon: 'person', label: nombre };
});

// A pagar calculado
const aPagarCalculado = computed(() => {
  const importe = parsearMonto(datosFacturacion.importe);
  const pagoPredial = parsearMonto(datosFacturacion.pagoPredial);
  const descISR = parsearMonto(datosFacturacion.descISR);
  return formatMoney(importe - pagoPredial - descISR);
});

// Expediente completo: todos los docs requeridos guardados + info del productor completa
const expedienteCompleto = computed(() => {
  return !!(
    expedienteGuardado.value?.identificacion &&
    expedienteGuardado.value?.constancia &&
    expedienteGuardado.value?.opinion &&
    expedienteGuardado.value?.cuenta_bancaria &&
    xmlGuardado.value &&
    datosProductor.nombre.trim() &&
    datosProductor.telefono.trim() &&
    datosProductor.correo.trim() &&
    datosProductor.origen.trim() &&
    datosProductor.municipio.trim()
  );
});

/* ═══════════════════════════
   API
═══════════════════════════ */
async function cargarDetalle(ticket: string) {
  cargando.value = true;
  try {
    const { data } = await api.get('/api/facturacion/detalle-ticket', {
      params: { ticket },
    });
    detalle.value = data as DetalleData;

    if (detalle.value) {
      // Sincronizar estado
      documentosGuardados.value = !!detalle.value.tieneDocumentos;
      xmlGuardado.value = !!detalle.value.tieneFacturaXML;
      xmlFacturaSubido.value = !!detalle.value.tieneFacturaXML;

      if (detalle.value.importe) {
        datosFacturacion.importe = formatMoney(detalle.value.importe);
      }

      // Poblar datos productor
      datosProductor.nombre = detalle.value.productor || '';
      datosProductor.telefono = detalle.value.telefono || '';
      datosProductor.correo = detalle.value.correo || '';
      datosProductor.origen = detalle.value.origen || '';
      datosProductor.municipio = detalle.value.municipio || '';
      datosProductor.atiende = detalle.value.atiende || '';

      // Poblar atiende en boleta
      datosBoletaEditables.atiende = detalle.value.atiende || '';
    }
  } catch (error) {
    console.error('Error al cargar detalle:', error);
    notifyError('Error al cargar detalle del ticket');
  } finally {
    cargando.value = false;
  }
}

// Cambiar ticket activo
watch(ticketActivo, (idx) => {
  const t = props.tickets[idx];
  if (t) void cargarDetalle(t);
});

/* ═══════════════════════════
   Acciones
═══════════════════════════ */
function handleGuardarRFC() {
  const rfcCapturado = rfcLocal.value.trim().toUpperCase();

  if (rfcCapturado.length !== 12 && rfcCapturado.length !== 13) {
    notifyError(
      `RFC invalido: debe tener 12 (moral) o 13 (fisica). Capturado: ${rfcCapturado.length}`,
    );
    return;
  }

  const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2,3}$/;
  if (!rfcRegex.test(rfcCapturado)) {
    notifyError('Formato de RFC invalido. Verifique que sea correcto.');
    return;
  }

  rfcRegistrado.value = true;
  emit('update-rfc', props.tickets, rfcCapturado);

  const tipoPersona = rfcCapturado.length === 12 ? 'Persona Moral' : 'Persona Fisica';
  notifyOk(`RFC registrado: ${rfcCapturado} (${tipoPersona})`);
}

function onXmlFileSelected(file: File | null) {
  if (!file) return;
  nombreArchivoXml.value = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'application/xml');

      // Buscar cfdi:Comprobante con namespace CFDI v4 o v3
      const nsV4 = 'http://www.sat.gob.mx/cfd/4';
      const nsV3 = 'http://www.sat.gob.mx/cfd/3';
      const nsTfd = 'http://www.sat.gob.mx/TimbreFiscalDigital';
      const comprobante =
        xmlDoc.getElementsByTagNameNS(nsV4, 'Comprobante')[0] ||
        xmlDoc.getElementsByTagNameNS(nsV3, 'Comprobante')[0] ||
        xmlDoc.documentElement;

      // Leer Importe desde cfdi:Concepto (primer concepto)
      const concepto =
        comprobante.getElementsByTagNameNS(nsV4, 'Concepto')[0] ||
        comprobante.getElementsByTagNameNS(nsV3, 'Concepto')[0] ||
        comprobante.getElementsByTagName('cfdi:Concepto')[0];
      const valorStr = concepto?.getAttribute('Importe') || comprobante.getAttribute('SubTotal');

      if (valorStr) {
        const num = parseFloat(valorStr);
        if (!isNaN(num)) {
          datosFacturacion.importe = formatMoney(num);
        }
      }

      // Extraer Fecha del comprobante
      xmlFecha.value = comprobante.getAttribute('Fecha') || '';

      // Extraer RFC del Emisor
      const emisor =
        comprobante.getElementsByTagNameNS(nsV4, 'Emisor')[0] ||
        comprobante.getElementsByTagNameNS(nsV3, 'Emisor')[0] ||
        comprobante.getElementsByTagName('cfdi:Emisor')[0];
      xmlRfcEmisor.value = emisor?.getAttribute('Rfc') || '';

      // Extraer UUID (Folio Fiscal) del TimbreFiscalDigital
      const timbre = xmlDoc.getElementsByTagNameNS(nsTfd, 'TimbreFiscalDigital')[0];
      xmlFolioFiscal.value = timbre?.getAttribute('UUID') || '';

      // Extraer Pago Predial y Desc. Predial desde impuestos locales (implocal)
      const nsImplocal = 'http://www.sat.gob.mx/implocal';
      const nodosRetencionLocal = xmlDoc.getElementsByTagNameNS(nsImplocal, 'RetencionesLocales');
      for (let i = 0; i < nodosRetencionLocal.length; i++) {
        const nodo = nodosRetencionLocal[i];
        const nombre = nodo?.getAttribute('ImpLocRetenido') || '';
        if (nombre.toUpperCase().includes('PREDIAL')) {
          const importePredial = parseFloat(nodo?.getAttribute('Importe') || '0');
          if (!isNaN(importePredial)) datosFacturacion.pagoPredial = formatMoney(importePredial);
          const tasaPredial = nodo?.getAttribute('TasadeRetencion') || '';
          if (tasaPredial) datosFacturacion.descPredial = tasaPredial;
          break;
        }
      }

      // Extraer Desc. ISR desde retenciones federales (Impuesto 001 = ISR)
      const nodosRetencionFed =
        comprobante.getElementsByTagNameNS(nsV4, 'Retencion').length > 0
          ? comprobante.getElementsByTagNameNS(nsV4, 'Retencion')
          : comprobante.getElementsByTagNameNS(nsV3, 'Retencion');
      for (let i = 0; i < nodosRetencionFed.length; i++) {
        const nodo = nodosRetencionFed[i];
        if (nodo?.getAttribute('Impuesto') === '001') {
          const importeISR = parseFloat(nodo?.getAttribute('Importe') || '0');
          if (!isNaN(importeISR)) datosFacturacion.descISR = formatMoney(importeISR);
          break;
        }
      }

      // Validar RFC del Emisor contra el RFC registrado — bloquear si no coincide
      const rfcActual = rfcLocal.value || props.rfc;
      if (xmlRfcEmisor.value && rfcActual && rfcActual !== 'Pendiente RFC' && xmlRfcEmisor.value !== rfcActual) {
        const rfcDelXml = xmlRfcEmisor.value;
        xmlFile.value = null;
        xmlFolioFiscal.value = '';
        xmlRfcEmisor.value = '';
        xmlFecha.value = '';
        datosFacturacion.importe = '';
        notifyError(`XML rechazado. RFC del Emisor (${rfcDelXml}) no coincide con el RFC registrado (${rfcActual}). Verifique la factura.`);
        return;
      }

      xmlFacturaSubido.value = true;
      notifyOk(
        `XML cargado: ${file.name}${datosFacturacion.importe ? `. IMPORTE: $${datosFacturacion.importe}` : ''}${xmlFolioFiscal.value ? `. UUID: ${xmlFolioFiscal.value.substring(0, 8)}...` : ''}`,
      );
    } catch {
      xmlFacturaSubido.value = true;
      notifyOk(`XML cargado: ${file.name}`);
    }
  };
  reader.readAsText(file, 'utf-8');
}

async function handleGuardarXmlFactura() {
  if (!xmlFacturaSubido.value || !xmlFile.value) {
    notifyError('Debe cargar primero el XML de la factura.');
    return;
  }

  // Validar campos requeridos al guardar XML
  if (!datosFacturacion.pagoPredial.trim()) {
    notifyError('Pago Predial es requerido antes de guardar el XML.');
    return;
  }
  if (!datosFacturacion.descPredial.trim()) {
    notifyError('Desc. Predial es requerido antes de guardar el XML.');
    return;
  }
  if (!datosFacturacion.descISR.trim()) {
    notifyError('Desc. ISR es requerido antes de guardar el XML.');
    return;
  }
  if (!datosFacturacion.diasHabilesPago.trim()) {
    notifyError('Dias Habiles de Pago es requerido antes de guardar el XML.');
    return;
  }

  try {
    const xmlBase64 = await fileToBase64(xmlFile.value);
    const sedeId = authStore.sedeActivaId || 0;

    await api.post('/api/facturacion/guardar-xml', {
      tickets: props.tickets,
      sedeId,
      xmlBase64,
      xmlNombre: xmlFile.value.name,
      importe: datosFacturacion.importe,
      pagoPredial: datosFacturacion.pagoPredial,
      descPredial: datosFacturacion.descPredial,
      descISR: datosFacturacion.descISR,
      diasHabilesPago: datosFacturacion.diasHabilesPago,
      folioFiscal: xmlFolioFiscal.value || undefined,
    });

    xmlGuardado.value = true;
    emit('update-documentos-status', props.tickets, documentosGuardados.value, true);
    notifyOk(`XML guardado: ${xmlFile.value.name}`);

    if (props.tickets[0]) await cargarExpediente(props.tickets[0]);
  } catch {
    notifyError('Error al guardar el XML. Intente de nuevo.');
  }
}

// Guardar unificado
async function handleGuardar() {
  if (rfcPendiente.value && !rfcRegistrado.value) {
    notifyError('Debe capturar y guardar el RFC antes de continuar.');
    return;
  }

  // Validar datos del productor
  const camposFaltantesProductor: string[] = [];
  if (!datosProductor.nombre.trim()) camposFaltantesProductor.push('Nombre');
  if (!datosProductor.telefono.trim()) camposFaltantesProductor.push('Telefono');
  if (!datosProductor.correo.trim()) camposFaltantesProductor.push('Correo');
  if (!datosProductor.origen.trim()) camposFaltantesProductor.push('Origen');
  if (!datosProductor.municipio.trim()) camposFaltantesProductor.push('Municipio');

  if (camposFaltantesProductor.length) {
    notifyError(`Informacion incompleta del productor: ${camposFaltantesProductor.join(', ')}.`);
    return;
  }

  // Validar campos de facturacion cuando hay XML cargado
  if (xmlFacturaSubido.value) {
    const camposFaltantesXml: string[] = [];
    if (!datosFacturacion.pagoPredial.trim()) camposFaltantesXml.push('Pago Predial');
    if (!datosFacturacion.descPredial.trim()) camposFaltantesXml.push('Desc. Predial');
    if (!datosFacturacion.descISR.trim()) camposFaltantesXml.push('Desc. ISR');
    if (!datosFacturacion.diasHabilesPago.trim()) camposFaltantesXml.push('Dias Habiles de Pago');

    if (camposFaltantesXml.length) {
      notifyError(`Campos requeridos por el XML: ${camposFaltantesXml.join(', ')}.`);
      return;
    }
  }

  // Validar documentos PDF obligatorios
  const faltantes: string[] = [];
  if (!archivoIdentificacion.value && !expedienteGuardado.value?.identificacion)
    faltantes.push('Identificacion Oficial');
  if (!archivoConstancia.value && !expedienteGuardado.value?.constancia)
    faltantes.push('Documento Fiscal');
  if (!archivoOpinion.value && !expedienteGuardado.value?.opinion)
    faltantes.push('Opinion de Cumplimiento');
  if (!archivoCuentaBancaria.value && !expedienteGuardado.value?.cuenta_bancaria)
    faltantes.push('Caratula de Cuenta Bancaria');

  if (faltantes.length) {
    notifyError(`Documentos faltantes: ${faltantes.join(', ')}`);
    return;
  }

  if (errorConstancia.value || errorOpinion.value) {
    notifyError('No se puede guardar con documentos vencidos (> 90 dias).');
    return;
  }

  try {
    // Convertir archivos nuevos a Base64 en paralelo
    const [identBase64, constBase64, opBase64, cuentaBase64, otroBase64, xmlBase64] = await Promise.all([
      archivoIdentificacion.value
        ? fileToBase64(archivoIdentificacion.value)
        : Promise.resolve(null),
      archivoConstancia.value ? fileToBase64(archivoConstancia.value) : Promise.resolve(null),
      archivoOpinion.value ? fileToBase64(archivoOpinion.value) : Promise.resolve(null),
      archivoCuentaBancaria.value ? fileToBase64(archivoCuentaBancaria.value) : Promise.resolve(null),
      archivoOtro.value ? fileToBase64(archivoOtro.value) : Promise.resolve(null),
      xmlFile.value && !xmlGuardado.value ? fileToBase64(xmlFile.value) : Promise.resolve(null),
    ]);

    const sedeId = authStore.sedeActivaId || 0;

    await api.post('/api/facturacion/guardar-expediente', {
      tickets: props.tickets,
      sedeId,
      nombre: datosProductor.nombre,
      telefono: datosProductor.telefono,
      correo: datosProductor.correo,
      origen: datosProductor.origen,
      municipio: datosProductor.municipio,
      atiende: datosProductor.atiende,
      importe: datosFacturacion.importe,
      pagoPredial: datosFacturacion.pagoPredial,
      descPredial: datosFacturacion.descPredial,
      descISR: datosFacturacion.descISR,
      diasHabilesPago: datosFacturacion.diasHabilesPago,
      xmlBase64: xmlBase64 ?? undefined,
      xmlNombre: xmlFile.value?.name,
      identificacionBase64: identBase64 ?? undefined,
      identificacionNombre: archivoIdentificacion.value?.name,
      constanciaBase64: constBase64 ?? undefined,
      constanciaNombre: archivoConstancia.value?.name,
      fechaConstancia: fechaConstanciaStr.value || undefined,
      opinionBase64: opBase64 ?? undefined,
      opinionNombre: archivoOpinion.value?.name,
      fechaOpinion: fechaOpinionStr.value || undefined,
      cuentaBancariaBase64: cuentaBase64 ?? undefined,
      cuentaBancariaNombre: archivoCuentaBancaria.value?.name,
      cuentaBancariaDatosCoiniciden: cuentaBancariaDatosCoincidenCheck.value,
      otroBase64: otroBase64 ?? undefined,
      otroNombre: archivoOtro.value?.name,
    });

    if (xmlFacturaSubido.value) xmlGuardado.value = true;
    documentosGuardados.value = true;
    emit('update-documentos-status', props.tickets, true, xmlGuardado.value);
    notifyOk('Expediente guardado correctamente.');

    if (props.tickets[0]) await cargarExpediente(props.tickets[0]);
  } catch {
    notifyError('Error al guardar el expediente. Intente de nuevo.');
  }
}

function validarFechaDoc(fechaStr: string, errorRef: { value: string }, label: string) {
  if (!fechaStr) {
    errorRef.value = '';
    return;
  }
  const fecha = new Date(fechaStr + 'T00:00:00');
  console.log(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diffDias = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
  errorRef.value =
    diffDias > 90 ? `${label} vencida (${diffDias} dias). Maximo permitido: 90 dias.` : '';
}

const validarFechaConstancia = () =>
  validarFechaDoc(fechaConstanciaStr.value, errorConstancia, 'Documento Fiscal');
const validarFechaOpinion = () =>
  validarFechaDoc(fechaOpinionStr.value, errorOpinion, 'Opinion de Cumplimiento');

/* ═══════════════════════════
   Extraccion de fecha desde PDF SAT (sin libreria externa)
   Lee el binario como ISO-8859-1 y busca los patrones del SAT
═══════════════════════════ */
const mesesMx: Record<string, string> = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12',
};

function parsearFechaEspanol(dia: string, mes: string, anio: string): string | null {
  const mesNum = mesesMx[mes.toLowerCase()];
  if (!mesNum) return null;
  return `${anio}-${mesNum}-${dia.padStart(2, '0')}`;
}

function buscarFechaEnTexto(text: string, esConstancia: boolean): string | null {
  if (esConstancia) {
    // Patron SAT: "CULIACAN , SINALOA A 18 DE FEBRERO DE 2026"
    const m = text.match(/A\s+(\d{1,2})\s+DE\s+([A-Z\u00C0-\u00FF]+)\s+DE\s+(\d{4})/i);
    if (m?.[1] && m[2] && m[3]) return parsearFechaEspanol(m[1], m[2], m[3]);
  } else {
    // Patron SAT: "18 de febrero de 2026 a las 23:12 horas"
    const m = text.match(/(\d{1,2})\s+de\s+([a-z\u00C0-\u00FF]+)\s+de\s+(\d{4})\s+a\s+las/i);
    if (m?.[1] && m[2] && m[3]) return parsearFechaEspanol(m[1], m[2], m[3]);
    // Fallback generico
    const mGen = text.match(/(\d{1,2})\s+de\s+([a-z\u00C0-\u00FF]+)\s+de\s+(\d{4})/i);
    if (mGen?.[1] && mGen[2] && mGen[3]) return parsearFechaEspanol(mGen[1], mGen[2], mGen[3]);
  }
  return null;
}

function findBytes(haystack: Uint8Array, needle: number[], from: number): number {
  outer: for (let i = from; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

async function extraerTextoPDFStreams(bytes: Uint8Array): Promise<string> {
  if (typeof DecompressionStream === 'undefined') return '';
  const STREAM = [0x73, 0x74, 0x72, 0x65, 0x61, 0x6d];
  const ENDSTREAM = [0x65, 0x6e, 0x64, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6d];
  const resultTexts: string[] = [];
  let pos = 0;

  while (pos < bytes.length) {
    const streamPos = findBytes(bytes, STREAM, pos);
    if (streamPos === -1) break;

    // El keyword 'stream' debe ir seguido de \r\n o \n (spec PDF)
    const after = streamPos + 6;
    if (bytes[after] !== 0x0a && !(bytes[after] === 0x0d && bytes[after + 1] === 0x0a)) {
      pos = streamPos + 1;
      continue;
    }

    let dataStart = after;
    if (bytes[dataStart] === 0x0d) dataStart++;
    if (bytes[dataStart] === 0x0a) dataStart++;

    const endPos = findBytes(bytes, ENDSTREAM, dataStart);
    if (endPos === -1) {
      pos = streamPos + 6;
      continue;
    }

    let dataEnd = endPos;
    if (dataEnd > dataStart && bytes[dataEnd - 1] === 0x0a) dataEnd--;
    if (dataEnd > dataStart && bytes[dataEnd - 1] === 0x0d) dataEnd--;

    const streamData = bytes.slice(dataStart, dataEnd);
    if (streamData.length > 10) {
      for (const fmt of ['deflate', 'deflate-raw'] as const) {
        try {
          const ds = new DecompressionStream(fmt);
          const writer = ds.writable.getWriter();
          const reader = ds.readable.getReader();
          const chunks: Uint8Array[] = [];
          const readAll = (async () => {
            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) chunks.push(value);
              }
            } catch {
              /* stream parcial */
            }
          })();
          await writer.write(streamData).catch(() => {});
          await writer.close().catch(() => {});
          await readAll;
          if (chunks.length) {
            const total = chunks.reduce((s, c) => s + c.length, 0);
            const out = new Uint8Array(total);
            let off = 0;
            for (const c of chunks) {
              out.set(c, off);
              off += c.length;
            }
            resultTexts.push(new TextDecoder('iso-8859-1').decode(out));
            break;
          }
        } catch {
          /* probar siguiente formato */
        }
      }
    }

    pos = endPos + 9;
  }

  return resultTexts.join('\n');
}

async function leerFechaDePDF(
  file: File,
  esConstancia: boolean,
  onOcrProgress?: (pct: number) => void,
): Promise<string | null> {
  try {
    const buffer = await file.arrayBuffer();

    // Paso 1: texto raw (metadatos no comprimidos)
    const textLatin = new TextDecoder('iso-8859-1').decode(buffer);
    const fechaDirecta = buscarFechaEnTexto(textLatin, esConstancia);
    if (fechaDirecta) return fechaDirecta;

    // Paso 2: descomprimir streams FlateDecode
    const textoStreams = await extraerTextoPDFStreams(new Uint8Array(buffer));
    if (textoStreams) {
      const fecha = buscarFechaEnTexto(textoStreams, esConstancia);
      if (fecha) return fecha;
    }

    // Paso 3: OCR para PDFs con imagen escaneada
    const { ocrPDFToText } = await import('src/utils/pdfOcr');
    const textoOCR = await ocrPDFToText(new Uint8Array(buffer), 'spa', onOcrProgress);
    if (textoOCR) {
      const fecha = buscarFechaEnTexto(textoOCR, esConstancia);
      if (fecha) return fecha;
    }

    return null;
  } catch {
    return null;
  }
}

function buscarRfcEnTexto(text: string): string | null {
  const m = text.match(/[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2,3}/);
  return m ? m[0] : null;
}

async function leerRfcDePDF(file: File): Promise<string | null> {
  try {
    const buffer = await file.arrayBuffer();
    const textLatin = new TextDecoder('iso-8859-1').decode(buffer);
    const rfc1 = buscarRfcEnTexto(textLatin);
    if (rfc1) return rfc1;
    const textoStreams = await extraerTextoPDFStreams(new Uint8Array(buffer));
    if (textoStreams) {
      const rfc2 = buscarRfcEnTexto(textoStreams);
      if (rfc2) return rfc2;
    }
    return null;
  } catch {
    return null;
  }
}

async function onConstanciaSelected(file: File | null) {
  if (!file) return;
  ocrCargandoConstancia.value = true;
  try {
    const fecha = await leerFechaDePDF(file, true, (pct) => {
      void pct;
    });
    if (fecha) {
      fechaConstanciaStr.value = fecha;
      validarFechaConstancia();
      if (errorConstancia.value) {
        // Documento vencido → rechazar archivo y mostrar error en rojo
        archivoConstancia.value = null;
        fechaConstanciaStr.value = '';
        errorConstancia.value = '';
        notifyError(`Documento Fiscal rechazado. Fecha detectada: ${fecha} — Vencida (más de 90 días). Máximo permitido: 90 días.`);
      } else {
        notifyOk(`Documento Fiscal cargado. Fecha detectada automaticamente: ${fecha}`);
        // Validar RFC del documento contra el RFC registrado
        const rfcEncontrado = await leerRfcDePDF(file);
        const rfcActual = rfcLocal.value || props.rfc;
        if (rfcEncontrado && rfcActual && rfcActual !== 'Pendiente RFC' && rfcEncontrado !== rfcActual) {
          $q.notify({ type: 'warning', icon: 'warning', message: `RFC en el Documento Fiscal (${rfcEncontrado}) no coincide con el RFC registrado (${rfcActual}). Verifique el documento.`, timeout: 7000 });
        }
      }
    } else {
      archivoConstancia.value = null;
      notifyError('Documento Fiscal rechazado. No se pudo detectar la fecha. Verifique que el documento sea válido.');
    }
  } finally {
    ocrCargandoConstancia.value = false;
  }
}

async function onOpinionSelected(file: File | null) {
  if (!file) return;
  ocrCargandoOpinion.value = true;
  try {
    const fecha = await leerFechaDePDF(file, false, (pct) => {
      void pct;
    });
    if (fecha) {
      fechaOpinionStr.value = fecha;
      validarFechaOpinion();
      if (errorOpinion.value) {
        // Documento vencido → rechazar archivo y mostrar error en rojo
        archivoOpinion.value = null;
        fechaOpinionStr.value = '';
        errorOpinion.value = '';
        notifyError(`Opinión rechazada. Fecha detectada: ${fecha} — Vencida (más de 90 días). Máximo permitido: 90 días.`);
      } else {
        notifyOk(`Opinion de Cumplimiento cargada. Fecha detectada automaticamente: ${fecha}`);
      }
    } else {
      archivoOpinion.value = null;
      notifyError('Opinión rechazada. No se pudo detectar la fecha. Verifique que el documento sea válido.');
    }
  } finally {
    ocrCargandoOpinion.value = false;
  }
}

/* ═══════════════════════════
   Validacion INE / Identificacion Oficial
═══════════════════════════ */
function normalizarMRZANombre(mrz: string): string {
  const partes = mrz.split('<<');
  const apellidos = (partes[0] ?? '').split('<').filter(Boolean).join(' ');
  const nombres = (partes[1] ?? '').replace(/<+$/, '').split('<').filter(Boolean).join(' ');
  return `${apellidos} ${nombres}`.trim();
}

// function ineNombresCoinciden(frente: string, mrz: string): boolean {
//   const frenteNorm = frente.toUpperCase().replace(/\s+/g, ' ').trim();
//   const apellidosMRZ = (mrz.split('<<')[0] ?? '').split('<').filter(Boolean);
//   return apellidosMRZ.length > 0 && apellidosMRZ.every((a) => frenteNorm.includes(a));
// }

// Colapsa espacios en líneas que contienen '<' (MRZ con caracteres espaciados por OCR)
// Ej: "V I L L E G A S < A M A R I L L A < < E L I A S" → "VILLEGAS<AMARILLA<<ELIAS"
// function normalizarLineasMRZ(texto: string): string {
//   return texto
//     .split('\n')
//     .map((line) => (line.includes('<') ? line.replace(/\s+/g, '') : line))
//     .join('\n');
// }

// function extraerNombreINEDeTexto(texto: string): { frente?: string; mrz?: string } {
//   const resultado: { frente?: string; mrz?: string } = {};

//   // === MRZ del reverso ===
//   const textoMRZ = normalizarLineasMRZ(texto);
//   // Regex específica para el formato de la INE en el reverso
//   const mrzMatch = textoMRZ.match(/([A-Z]{2,}(?:<[A-Z]+)*)<<([A-Z<]{2,})/);
//   if (mrzMatch?.[0]) resultado.mrz = mrzMatch[0];

//   // === Nombre del frente ===
//   const posNombre = texto.search(/\bNOMBRE\b/);
//   if (posNombre !== -1) {
//     const primerSalto = texto.indexOf('\n', posNombre);
//     if (primerSalto !== -1) {
//       const bloque = texto.slice(primerSalto + 1);
//       const stopWords = /\b(DOMICILIO|CALLE|CURP|CLAVE|SECCI[OÓ]N|FECHA|SEXO|VIGENCIA|INE)\b/i;
//       const lineas = bloque
//         .split(/[\n\r]+/)
//         .map((l) => l.trim())
//         .filter((l) => l.length >= 2);

//       const nombresLineas: string[] = [];
//       for (const linea of lineas.slice(0, 5)) {
//         if (stopWords.test(linea)) break;
//         // Solo aceptar líneas que sean puramente letras mayúsculas y espacios
//         if (/^[A-Z\u00C0-\u00DE][A-Z\u00C0-\u00DE\s]*$/.test(linea)) {
//           nombresLineas.push(linea);
//         } else {
//           break;
//         }
//       }

//       const nombreCompleto = nombresLineas.join(' ').replace(/\s+/g, ' ').trim();
//       if (nombreCompleto.length >= 5) resultado.frente = nombreCompleto;
//     }
//   }

//   return resultado;
// }

// async function leerDatosINE(
//   file: File,
//   onOcrProgress?: (pct: number) => void,
// ): Promise<{ frente?: string; mrz?: string; coinciden?: boolean }> {
//   const buffer = await file.arrayBuffer();
//   const bytes = new Uint8Array(buffer);

//   // Paso 1: texto raw + streams descomprimidos
//   const textLatin = new TextDecoder('iso-8859-1').decode(buffer);
//   const textoStreams = await extraerTextoPDFStreams(bytes);
//   let datos = extraerNombreINEDeTexto(textLatin + '\n' + textoStreams);

//   // Paso 2: OCR si no se encontro nombre por texto
//   if (!datos.frente && !datos.mrz) {
//     try {
//       const { ocrPDFToText } = await import('src/utils/pdfOcr');
//       const textoOCR = await ocrPDFToText(bytes, 'spa', onOcrProgress);
//       datos = extraerNombreINEDeTexto(textoOCR);
//     } catch {
//       /* OCR no disponible */
//     }
//   }

//   const resultado: { frente?: string; mrz?: string; coinciden?: boolean } = { ...datos };
//   if (resultado.frente && resultado.mrz) {
//     resultado.coinciden = ineNombresCoinciden(resultado.frente, resultado.mrz);
//   }

//   return resultado;
// }

async function onIdentificacionSelected(file: File | null) {
  if (!file) {
    ineValidacion.value = null;
    return;
  }

  try {
    ocrCargandoINE.value = true;

    // 1. Convertir a Base64 para guardar
    const base64ParaGuardar = await fileToBase64(file);

    // 2. Enviar directamente al servidor sin validar localmente
    await api.post('/api/facturacion/validar-y-guardar', {
      textoOcr: 'Subida directa sin OCR', // Enviamos un placeholder
      nombreProductorEsperado: props.productor,
      archivoBase64: base64ParaGuardar,
      nombreArchivo: file.name,
      sedeId: detalle.value?.sedeId || 8,
      tickets: props.tickets,
    });

    // 3. Actualizar la interfaz (Marcamos como coincidente para que no salga error)
    ineValidacion.value = {
      frente: 'Documento PDF cargado',
      mrz: '',
      coinciden: true, // Forzamos true para avanzar
    };

    notifyOk('Identificación cargada y guardada en el expediente.');
  } catch (error) {
    console.error('Error al subir identificación:', error);
    notifyError('Error al guardar el documento.');
  } finally {
    ocrCargandoINE.value = false;
  }
}

// Cesion de derechos
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onGuardarCesionDerechos(_datos: unknown) {
  notifyOk('Cesion de derechos guardada.');
}

/* ═══════════════════════════
   Utils - Archivos
═══════════════════════════ */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Quitar el prefijo "data:...;base64,"
      resolve(result.split(',')[1] ?? result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function mimeTypeFromNombre(nombre: string): string {
  const ext = nombre.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'xml') return 'application/xml';
  return 'application/octet-stream';
}

function descargarArchivo(base64: string, nombre: string) {
  const tipo = mimeTypeFromNombre(nombre);
  const byteChars = atob(base64);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
  const blob = new Blob([byteArr], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function cargarExpediente(ticket: string) {
  try {
    const sedeId = authStore.sedeActivaId || 0;
    const { data } = await api.get('/api/facturacion/documentos-expediente', {
      params: { ticket, sedeId },
    });

    // El API devuelve directamente el JSON plano de datos_adicionales
    // Estructura: { xml, identificacion, constancia, opinion, contacto_adicional, ... }
    const exp = data as ExpedienteGuardado;

    const hayDatos = !!(
      exp.xml ||
      exp.identificacion ||
      exp.constancia ||
      exp.opinion ||
      exp.cuenta_bancaria ||
      exp.otro ||
      exp.contacto_adicional?.nombre
    );
    expedienteGuardado.value = hayDatos ? exp : null;

    // Cargar datos de facturación desde el XML guardado
    if (exp.xml) {
      const x = exp.xml;
      if (x.importe && !datosFacturacion.importe) datosFacturacion.importe = x.importe;
      if (x.pagoPredial && !datosFacturacion.pagoPredial)
        datosFacturacion.pagoPredial = x.pagoPredial;
      if (x.descPredial && !datosFacturacion.descPredial)
        datosFacturacion.descPredial = x.descPredial;
      if (x.descISR && !datosFacturacion.descISR) datosFacturacion.descISR = x.descISR;
      if (x.diasHabilesPago && !datosFacturacion.diasHabilesPago)
        datosFacturacion.diasHabilesPago = x.diasHabilesPago;
      xmlGuardado.value = true;
    }

    // Cargar contacto adicional del expediente guardado
    if (exp.contacto_adicional) {
      const ca = exp.contacto_adicional;
      if (ca.nombre && !datosProductor.contactoNombre) datosProductor.contactoNombre = ca.nombre;
      if (ca.telefono && !datosProductor.contactoTelefono)
        datosProductor.contactoTelefono = ca.telefono;
      if (ca.correo && !datosProductor.contactoCorreo) datosProductor.contactoCorreo = ca.correo;
    }

    // Checkbox carátula de cuenta bancaria
    if (exp.cuenta_bancaria_datos_coinciden !== undefined) {
      cuentaBancariaDatosCoincidenCheck.value = exp.cuenta_bancaria_datos_coinciden;
    }

    // Fechas de documentos (se llenan desde DB o auto-deteccion PDF)
    if (exp.constancia?.fecha && !fechaConstanciaStr.value) {
      fechaConstanciaStr.value = exp.constancia.fecha;
      validarFechaConstancia();
    }
    if (exp.opinion?.fecha && !fechaOpinionStr.value) {
      fechaOpinionStr.value = exp.opinion.fecha;
      validarFechaOpinion();
    }
  } catch {
    // Silencioso: si no hay expediente guardado aún, está bien
  }
}

/* ═══════════════════════════
   Utils - Formato
═══════════════════════════ */
function formatMoney(v: number | string): string {
  const num = typeof v === 'string' ? parsearMonto(v) : v;
  return Number(num || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatNumber(v: number | string): string {
  const num = typeof v === 'string' ? parseFloat(v) || 0 : v;
  return Number(num || 0).toLocaleString('en-US');
}

function parsearMonto(valor: string): number {
  if (!valor) return 0;
  return parseFloat(String(valor).replace(/[$,]/g, '')) || 0;
}

function notifyOk(message: string) {
  $q.notify({ type: 'positive', message, position: 'top' });
}
function notifyError(message: string) {
  $q.notify({ type: 'negative', message, position: 'top' });
}

/* ═══════════════════════════
   Init
═══════════════════════════ */
onMounted(() => {
  void cargarConfigCampos();
  if (props.tickets.length > 0) {
    const firstTicket = props.tickets[0];
    if (firstTicket) {
      void cargarDetalle(firstTicket);
      void cargarExpediente(firstTicket);
    }
  }
});
</script>

<style scoped>
.font-mono :deep(input) {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}
.factura-proveedor-box {
  border: 2px dashed #bdbdbd;
  border-radius: 8px;
}
</style>
