<template>
  <q-page padding class="bg-grey-2">
    <q-banner v-if="!isOnline" class="bg-red-2 text-red-9 q-mb-sm" dense>
      <template #avatar><q-icon name="cloud_off" color="red-9" /></template>
      Modo sin conexión — las órdenes y resultados se guardarán localmente y se sincronizarán al volver la red.
    </q-banner>

    <!-- ==================== HISTORIAL ==================== -->
    <template v-if="vista === 'historial'">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-grey-8 text-weight-bold">
          <q-icon name="precision_manufacturing" class="q-mr-sm" size="md" />
          Producción
        </div>
        <div class="row q-gutter-sm">
          <q-btn unelevated color="orange-7" icon="add" label="Nueva Orden"
            @click="irNuevaOrden" />
        </div>
      </div>

      <!-- Buscador -->
      <q-card bordered flat class="q-pa-sm q-mb-md shadow-1">
        <q-input v-model="busqueda" dense outlined clearable label="Buscar por No. Orden o Producto">
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </q-card>

      <!-- Tabla de Órdenes -->
      <q-card bordered flat class="shadow-1">
        <q-table
          :rows="ordenesFiltradas"
          :columns="columnaOrdenes"
          row-key="id"
          flat
          :loading="loading"
          dense
          :rows-per-page-options="[10, 20, 50]"
        >
          <template #body-cell-status="props">
            <q-td align="center">
              <q-badge :color="props.row.status === 'Resultado Registrado' ? 'positive' : 'orange-7'">
                {{ props.row.status }}
              </q-badge>
            </q-td>
          </template>
          <template #body-cell-acciones="props">
            <q-td align="center">
              <q-btn flat dense round icon="visibility" color="primary" title="Ver Resultado"
                @click="irResultado(props.row)" />
              <q-btn flat dense round icon="edit" color="grey-7" title="Editar Orden"
                @click="irEditarOrden(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </template>

    <!-- ==================== REGISTRO DE ORDEN ==================== -->
    <template v-else-if="vista === 'registro'">
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-btn flat round icon="arrow_back" @click="vista = 'historial'" />
        <div class="text-h5 text-grey-8 text-weight-bold">
          {{ ordenEditandoId ? 'Editar Orden' : 'Nueva Orden de Producción' }}
        </div>
      </div>

      <q-card bordered flat class="q-pa-md shadow-1">
        <!-- Número de Orden -->
        <div class="row q-col-gutter-md q-mb-md items-center">
          <div class="col-12 col-md-4">
            <q-input v-model="formOrden.noOrden" outlined dense label="No. Orden de Producción *"
              placeholder="Ej: 4165" />
          </div>
          <div class="col-auto">
            <q-btn
              :disable="trenes.length >= 4"
              unelevated
              color="orange-7"
              icon="add"
              label="Agregar Tren"
              @click="agregarTren"
            />
          </div>
        </div>

        <!-- Tarjetas de Trenes -->
        <div v-for="(tren, idx) in trenes" :key="idx" class="q-mb-md">
          <q-card bordered flat class="bg-white">
            <q-card-section class="q-py-sm bg-orange-1">
              <div class="row items-center justify-between">
                <div class="row items-center q-gutter-sm">
                  <span class="text-weight-bold text-orange-9">TREN</span>
                  <q-select
                    v-model="tren.trenId"
                    :options="trenesDisponibles(idx)"
                    option-value="id"
                    option-label="nombre"
                    emit-value map-options
                    dense outlined
                    style="min-width: 130px"
                    label="Seleccionar Tren"
                  />
                </div>
                <q-btn v-if="trenes.length > 1" flat round dense icon="delete" color="negative"
                  @click="eliminarTren(idx)" />
              </div>
            </q-card-section>

            <q-card-section>
              <div class="row q-col-gutter-md">
                <!-- Columna Izquierda -->
                <div class="col-12 col-md-6">
                  <q-input v-model="tren.fecha" outlined dense label="Fecha *" type="date" class="q-mb-sm" />
                  <q-select v-model="tren.tipoprocesoId" :options="cats.tipoProceso" option-value="id"
                    option-label="nombre" emit-value map-options dense outlined label="Tipo de Proceso *"
                    class="q-mb-sm" />
                  <q-select v-model="tren.producto" :options="['Garbanzo', 'Frijol']" dense outlined
                    label="Producto *" class="q-mb-sm"
                    @update:model-value="(v) => { tren.origen = ''; tren.granoId = granoIdPorNombre(v) }" />
                  <q-select
                    v-model="tren.origen"
                    :options="origenesParaTren(tren.producto)"
                    option-value="nombre" option-label="nombre"
                    emit-value map-options
                    dense outlined label="Origen *" class="q-mb-sm" />
                </div>
                <!-- Columna Derecha -->
                <div class="col-12 col-md-6">
                  <q-select v-model="tren.maniobra" :options="['Externa', 'Interna']" dense outlined
                    label="Maniobra *" class="q-mb-sm" />
                  <q-select v-model="tren.presentacionId" :options="cats.presentacion" option-value="id"
                    option-label="nombre" emit-value map-options dense outlined label="Presentación *"
                    class="q-mb-sm" />
                  <q-input v-model.number="tren.totalMp" outlined dense label="Total MP Suministrada *"
                    type="number" :max="50" class="q-mb-sm"
                    hint="Máximo 50">
                    <template #append>
                      <q-badge v-if="tren.totalMp > 50" color="negative">Límite: 50</q-badge>
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Bloque Insumos -->
              <q-separator class="q-my-sm" />
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-weight-bold">Bloque Insumos</div>
                <q-btn unelevated color="orange-7" icon="add" label="Agregar Insumo" size="sm"
                  @click="agregarInsumo(idx)" />
              </div>
              <div v-for="(ins, iIdx) in tren.insumos" :key="iIdx" class="row q-col-gutter-sm q-mb-xs items-center">
                <div class="col">
                  <q-select v-model="ins.insumoId" :options="cats.bloqueInsumos" option-value="id"
                    option-label="nombre" emit-value map-options dense outlined label="Insumo" />
                </div>
                <div class="col-3">
                  <q-input v-model.number="ins.cantidad" outlined dense label="Cantidad" type="number" min="1" />
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
      </q-card>
    </template>

    <!-- ==================== RESULTADO DE PRODUCCIÓN ==================== -->
    <template v-else-if="vista === 'resultado'">
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-btn flat round icon="arrow_back" @click="vista = 'historial'" />
        <div class="text-h5 text-grey-8 text-weight-bold">
          Resultado de Producción — Orden {{ ordenActual?.noOrden }}
        </div>
      </div>

      <q-card bordered flat class="q-pa-md shadow-1">
        <!-- Fechas inicio/fin -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6 col-md-3">
            <q-input v-model="resultado.fechaInicio" outlined dense label="Fecha Inicio *" type="date" :disable="resultadoReadonly" />
          </div>
          <div class="col-6 col-md-3">
            <q-input v-model="resultado.horaInicio" outlined dense label="Hora Inicio *" type="time" :disable="resultadoReadonly" />
          </div>
          <div class="col-6 col-md-3">
            <q-input v-model="resultado.fechaFin" outlined dense label="Fecha Fin *" type="date" :disable="resultadoReadonly" />
          </div>
          <div class="col-6 col-md-3">
            <q-input v-model="resultado.horaFin" outlined dense label="Hora Fin *" type="time" :disable="resultadoReadonly" />
          </div>
        </div>

        <!-- BLOQUE 1: Producto Clasificado -->
        <div class="bg-blue-7 text-white text-weight-bold q-pa-sm q-mb-sm rounded-borders">
          Producto Clasificado
        </div>
        <q-markup-table flat bordered separator="cell" class="q-mb-md">
          <thead>
            <tr class="bg-grey-3">
              <th class="text-left">TREN</th>
              <th class="text-right">SACOS 25KG</th>
              <th class="text-right">SACOS 50KG</th>
              <th class="text-right">POLIBOLSA (KG)</th>
              <th class="text-left">CALIBRE</th>
              <th class="text-right bg-grey-4 text-weight-bold">KG X TREN</th>
              <th class="text-left">OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tr, idx) in resultado.trenResultados" :key="idx">
              <td class="text-weight-medium">{{ tr.trenNombre }}</td>
              <td>
                <q-input v-model.number="tr.sacos25" type="number" min="0" dense borderless
                  class="text-right" :disable="resultadoReadonly" @update:model-value="calcularKg(idx)" />
              </td>
              <td>
                <q-input v-model.number="tr.sacos50" type="number" min="0" dense borderless
                  class="text-right" :disable="resultadoReadonly" @update:model-value="calcularKg(idx)" />
              </td>
              <td>
                <q-input v-model.number="tr.polibolsa" type="number" min="0" dense borderless
                  class="text-right" :disable="resultadoReadonly" @update:model-value="calcularKg(idx)" />
              </td>
              <td>
                <q-select v-model="tr.calibre" :options="calibresParaTren(idx)"
                  option-value="nombre" option-label="nombre" emit-value map-options
                  dense borderless label="" :disable="resultadoReadonly" />
              </td>
              <td class="bg-grey-2 text-right text-weight-bold">{{ fmtNum(tr.kgXTren) }}</td>
              <td>
                <q-input v-model="tr.observaciones" dense borderless :disable="resultadoReadonly" />
              </td>
            </tr>
            <tr class="bg-grey-3 text-weight-bold">
              <td>TOTAL</td>
              <td class="text-right">{{ totalClasificado.sacos25 }}</td>
              <td class="text-right">{{ totalClasificado.sacos50 }}</td>
              <td class="text-right">{{ fmtNum(totalClasificado.polibolsa) }}</td>
              <td>—</td>
              <td class="text-right">{{ fmtNum(totalClasificado.kg) }}</td>
              <td>—</td>
            </tr>
          </tbody>
        </q-markup-table>

        <!-- BLOQUE 2: Subproducto / Rezaga -->
        <div class="row items-center justify-between q-mb-sm">
          <div class="bg-purple-7 text-white text-weight-bold q-pa-sm rounded-borders">Sub Producto / Rezaga</div>
          <q-btn v-if="!resultadoReadonly" unelevated color="green-7" icon="add" label="Agregar Línea" size="sm"
            @click="agregarSubproducto" />
        </div>
        <q-markup-table flat bordered separator="cell" class="q-mb-md">
          <thead>
            <tr class="bg-grey-3">
              <th class="text-left">TREN</th>
              <th class="text-left">TIPO SUB PRODUCTO</th>
              <th class="text-right">SACOS</th>
              <th class="text-right">POLIBOLSA</th>
              <th class="text-right">PESO</th>
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
              <td><q-input v-model.number="s.sacos" type="number" min="0" dense borderless class="text-right" :disable="resultadoReadonly" /></td>
              <td><q-input v-model.number="s.polibolsa" type="number" min="0" dense borderless class="text-right" :disable="resultadoReadonly" /></td>
              <td><q-input v-model.number="s.peso" type="number" min="0" dense borderless class="text-right" :disable="resultadoReadonly" /></td>
              <td><q-input v-model="s.observaciones" dense borderless :disable="resultadoReadonly" /></td>
              <td align="center">
                <q-btn v-if="!resultadoReadonly" flat dense round icon="delete" color="negative" @click="resultado.subproductos.splice(idx, 1)" />
              </td>
            </tr>
            <tr v-if="!resultado.subproductos.length">
              <td colspan="7" class="text-center text-grey-5">Sin líneas</td>
            </tr>
          </tbody>
        </q-markup-table>

        <!-- BLOQUE 3: Desecho -->
        <div class="row items-center justify-between q-mb-sm">
          <div class="bg-red-7 text-white text-weight-bold q-pa-sm rounded-borders">Desecho</div>
          <q-btn v-if="!resultadoReadonly" unelevated color="green-7" icon="add" label="Agregar Línea" size="sm"
            @click="agregarDesecho" />
        </div>
        <q-markup-table flat bordered separator="cell" class="q-mb-md">
          <thead>
            <tr class="bg-grey-3">
              <th class="text-left">TREN</th>
              <th class="text-left">TIPO DESECHO</th>
              <th class="text-right">SACOS</th>
              <th class="text-right">POLIBOLSA</th>
              <th class="text-right">PESO</th>
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
              <td><q-input v-model.number="d.sacos" type="number" min="0" dense borderless class="text-right" :disable="resultadoReadonly" /></td>
              <td><q-input v-model.number="d.polibolsa" type="number" min="0" dense borderless class="text-right" :disable="resultadoReadonly" /></td>
              <td><q-input v-model.number="d.peso" type="number" min="0" dense borderless class="text-right" :disable="resultadoReadonly" /></td>
              <td><q-input v-model="d.observaciones" dense borderless :disable="resultadoReadonly" /></td>
              <td align="center">
                <q-btn v-if="!resultadoReadonly" flat dense round icon="delete" color="negative" @click="resultado.desechos.splice(idx, 1)" />
              </td>
            </tr>
            <tr v-if="!resultado.desechos.length">
              <td colspan="7" class="text-center text-grey-5">Sin líneas</td>
            </tr>
          </tbody>
        </q-markup-table>

        <!-- Botones -->
        <div class="row q-gutter-sm justify-end q-mt-md">
          <q-btn flat color="grey-7" label="Regresar" @click="vista = 'historial'" />
          <q-btn v-if="!resultadoReadonly" unelevated color="green-7" icon="save" label="Guardar Resultado"
            @click="guardarResultado" />
          <q-badge v-else color="positive" label="Resultado Registrado" class="q-pa-sm text-body2" />
        </div>
      </q-card>
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
        <q-table
          :rows="listaAnalisis"
          :columns="columnasAnalisis"
          row-key="id"
          flat
          :loading="loadingAnalisis"
          dense
          :rows-per-page-options="[10, 20, 50]"
        >
          <template #body-cell-acciones="props">
            <q-td align="center">
              <q-btn flat dense round icon="visibility" color="deep-purple-7"
                @click="verAnalisis(props.row)" />
              <q-btn flat dense round icon="check_circle" color="positive" title="Finalizar análisis"
                @click="confirmarFinalizarAnalisis(props.row)" />
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
        <q-btn unelevated color="green-7" icon="save" label="Guardar Análisis"
          @click="guardarAnalisis" />
      </div>

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
            <div class="col-6 col-md-2">
              <q-input :model-value="analisisActual.variedad" dense outlined label="Variedad" readonly bg-color="grey-2" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- BLOQUE 2: Análisis Detallado (tabla dinámica de parrillas) -->
      <q-card bordered flat class="q-mb-md shadow-1">
        <q-card-section class="bg-green-7 text-white text-weight-bold q-py-sm row items-center justify-between">
          <span>Análisis de Calidad Detallado</span>
          <q-btn unelevated color="white" text-color="green-9" icon="add" label="Agregar Línea" size="sm"
            :disable="parrillasDetallado.length >= 50"
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
                  <q-select v-model="p.calibre"
                    :options="calibresAnalisis"
                    option-value="nombre" option-label="nombre" emit-value map-options
                    dense borderless />
                </td>
                <td v-for="col in campoDanoAnalisis" :key="col">
                  <q-input v-model.number="p[col]" type="number" min="0" step="0.01" dense borderless
                    class="text-right" @update:model-value="calcularDano(idx)" />
                </td>
                <td class="bg-yellow-2 text-right text-weight-bold">{{ fmtNum(p.danoTotal) }}</td>
                <td class="bg-blue-2 text-right text-weight-bold">{{ fmtNum(p.pctExp) }}</td>
                <td align="center">
                  <q-btn flat dense round icon="delete" color="negative"
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
                  @click="parrillaCompletas.push({ calibre: '', cantidad: 0, kg: 0 })" />
              </div>
              <div v-for="(c, idx) in parrillaCompletas" :key="idx"
                class="row q-col-gutter-sm q-mb-xs items-center bg-blue-1 rounded-borders q-pa-xs">
                <div class="col">
                  <q-select v-model="c.calibre" :options="calibresAnalisis"
                    option-value="nombre" option-label="nombre" emit-value map-options
                    dense outlined label="Calibre" />
                </div>
                <div class="col-3">
                  <q-input v-model.number="c.cantidad" type="number" min="0" dense outlined label="Cantidad" />
                </div>
                <div class="col-3">
                  <q-input v-model.number="c.kg" type="number" min="0" dense outlined label="KG" />
                </div>
                <div class="col-auto">
                  <q-btn flat dense round icon="delete" color="negative"
                    @click="parrillaCompletas.splice(idx, 1)" />
                </div>
              </div>
            </div>
            <!-- Incompletas -->
            <div class="col-12 col-md-6">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-orange-9 text-weight-bold">Incompletas</div>
                <q-btn unelevated color="orange-7" icon="add" size="sm" label="Agregar"
                  @click="parrillaIncompletas.push({ calibre: '', cantidad: 0, kg: 0 })" />
              </div>
              <div v-for="(c, idx) in parrillaIncompletas" :key="idx"
                class="row q-col-gutter-sm q-mb-xs items-center bg-orange-1 rounded-borders q-pa-xs">
                <div class="col">
                  <q-select v-model="c.calibre" :options="calibresAnalisis"
                    option-value="nombre" option-label="nombre" emit-value map-options
                    dense outlined label="Calibre" />
                </div>
                <div class="col-3">
                  <q-input v-model.number="c.cantidad" type="number" min="0" dense outlined label="Cantidad" />
                </div>
                <div class="col-3">
                  <q-input v-model.number="c.kg" type="number" min="0" dense outlined label="KG" />
                </div>
                <div class="col-auto">
                  <q-btn flat dense round icon="delete" color="negative"
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
                :options="origenesParaTren(formAnalisis.producto).map(o => o.nombre)"
                outlined dense label="Silo / Almacén" />
            </div>
            <div class="col-6">
              <q-input v-model="formAnalisis.variedad" outlined dense label="Variedad" />
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
}>({
  trenes: [], tipoProceso: [], presentacion: [], bloqueInsumos: [],
  subproductos: [], desechos: [], silos: [], bodegas: [], calibres: [],
});

const listaGranos = ref<{ id: number; nombre: string }[]>([]);

async function cargarCatalogos() {
  try {
    const sedeId = authStore.sedeActivaId ?? 0;
    const [catRes, granosRes] = await Promise.all([
      api.get('/api/produccion/catalogos', { params: { sedeId } }),
      api.get('/api/catalogos/granos', { params: { sede_id: sedeId } }),
    ]);
    cats.value = catRes.data as typeof cats.value;
    listaGranos.value = (granosRes.data as { id: number; nombre: string; activo: boolean }[]).filter(g => g.activo);
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar catálogos' });
  }
}

function granoIdPorNombre(nombre: string): number | null {
  const g = listaGranos.value.find(g => g.nombre.toLowerCase().includes(nombre?.toLowerCase() ?? ''));
  return g?.id ?? null;
}

function origenesParaTren(producto: string) {
  if (!producto) return [];
  if (producto === 'Frijol') return cats.value.bodegas;
  return cats.value.silos;
}

function calibresParaTren(idx: number) {
  const granoId = trenes.value[idx]?.granoId ?? null;
  if (!granoId) return cats.value.calibres;
  return cats.value.calibres.filter(c => c.granoId === granoId);
}

const calibresAnalisis = computed(() => {
  const granoId = analisisActual.value?.granoId ?? null;
  if (!granoId) return cats.value.calibres;
  return cats.value.calibres.filter(c => c.granoId === granoId);
});

// ─── HISTORIAL DE ÓRDENES ─────────────────────────────────────────────────
const loading = ref(false);
const ordenes = ref<OrdenResumen[]>([]);
const busqueda = ref('');

interface OrdenResumen {
  id: number;
  noOrden: string;
  fechaOrden: string;
  producto: string;
  kg: number;
  status: string;
}

const columnaOrdenes: QTableColumn[] = [
  { name: 'noOrden',    label: 'No. Orden', field: 'noOrden',    align: 'left',  sortable: true },
  { name: 'fechaOrden', label: 'Fecha',     field: 'fechaOrden', align: 'left',  sortable: true, format: (val: string) => val?.substring(0, 10) ?? '' },
  { name: 'producto',   label: 'Producto',  field: 'producto',   align: 'left' },
  { name: 'kg',         label: 'KG',        field: 'kg',         align: 'right' },
  { name: 'status',     label: 'Estatus',   field: 'status',     align: 'center' },
  { name: 'acciones',   label: 'Acciones',  field: 'id',         align: 'center' },
];

const ordenesFiltradas = computed(() => {
  const q = busqueda.value.toLowerCase();
  if (!q) return ordenes.value;
  return ordenes.value.filter(o =>
    o.noOrden.toLowerCase().includes(q) || o.producto?.toLowerCase().includes(q)
  );
});

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
  fecha: string;
  maniobra: string;
  tipoprocesoId: number | null;
  presentacionId: number | null;
  producto: string;
  granoId: number | null;
  origen: string;
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

const formOrden = ref({ noOrden: '' });
const trenes = ref<TrenForm[]>([]);
const ordenEditandoId = ref<number | null>(null);

function trenVacio(): TrenForm {
  return {
    trenId: null, fecha: fechaHoy(),
    maniobra: 'Externa', tipoprocesoId: null, presentacionId: null,
    producto: '', granoId: null, origen: '', totalMp: 0,
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
  formOrden.value.noOrden = '';
  trenes.value = [trenVacio()];
  vista.value = 'registro';
}

async function irEditarOrden(row: OrdenResumen) {
  try {
    $q.loading.show();
    const { data } = await api.get(`/api/produccion/ordenes/${row.id}`);
    const d = data as { orden: { noOrden: string }; trenes: TrenApiResponse[] };
    ordenEditandoId.value = row.id;
    formOrden.value.noOrden = d.orden.noOrden;
    trenes.value = d.trenes.map(t => ({
      trenId: t.trenId,
      fecha: t.fecha?.substring?.(0, 10) ?? '',
      maniobra: t.maniobra ?? 'Externa',
      tipoprocesoId: t.tipoprocesoId,
      presentacionId: t.presentacionId,
      producto: t.producto ?? '',
      granoId: t.granoId ?? null,
      origen: t.origen ?? '',
      totalMp: Number(t.totalMpSuministrada ?? 0),
      insumos: t.bloqueInsumos
        ? (JSON.parse(t.bloqueInsumos as unknown as string) as { insumoId: number; cantidad: number }[])
        : [{ insumoId: null, cantidad: 0 }],
    })) as TrenForm[];
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
  if (!trenes.value.length) {
    Notify.create({ type: 'warning', message: 'Debe agregar al menos un tren' });
    return;
  }
  for (const t of trenes.value) {
    if (!t.trenId || !t.tipoprocesoId || !t.producto || !t.origen || !t.maniobra) {
      Notify.create({ type: 'warning', message: 'Complete todos los campos obligatorios de cada tren' });
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
  const payload = {
    noOrden: formOrden.value.noOrden,
    fechaOrden: fechaHoy(),
    justificacionEdicion: justificacionEdicion.value || null,
    trenes: trenes.value.map(t => ({
      trenId: t.trenId,
      fecha: t.fecha,
      maniobra: t.maniobra,
      tipoprocesoId: t.tipoprocesoId,
      presentacionId: t.presentacionId,
      producto: t.producto,
      granoId: t.granoId,
      origen: t.origen,
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
      trenes: { trenId: number; trenNombre: string; producto: string; granoId: number | null }[];
      resultado: {
        fechaInicio: string; horaInicio: string; fechaFin: string; horaFin: string;
        productoClasificado: string; subproducto: string; desecho: string;
      } | null;
    };

    trenesActuales.value = d.trenes.map(t => ({
      trenId: t.trenId,
      trenNombre: t.trenNombre,
      granoId: t.granoId ?? null,
      sacos25: 0, sacos50: 0, polibolsa: 0, calibre: '', kgXTren: 0, observaciones: '',
    }));

    if (d.resultado) {
      resultado.value.fechaInicio = d.resultado.fechaInicio?.substring?.(0, 10) ?? '';
      resultado.value.horaInicio = d.resultado.horaInicio ?? '';
      resultado.value.fechaFin = d.resultado.fechaFin?.substring?.(0, 10) ?? '';
      resultado.value.horaFin = d.resultado.horaFin ?? '';
      try {
        resultado.value.trenResultados = d.resultado.productoClasificado
          ? (JSON.parse(d.resultado.productoClasificado) as TrenResultado[])
          : trenesActuales.value;
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
  envasado: string; producto: string; cosecha: string; proceso: string; silo: string; variedad: string;
}

const columnasAnalisis: QTableColumn[] = [
  { name: 'noOrden',  label: 'Orden',    field: 'noOrden',  align: 'left'  },
  { name: 'fecha',    label: 'Fecha',    field: 'fecha',    align: 'left'  },
  { name: 'envasado', label: 'Envasado', field: 'envasado', align: 'left'  },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left'  },
  { name: 'cosecha',  label: 'Cosecha',  field: 'cosecha',  align: 'left'  },
  { name: 'proceso',  label: 'Proceso',  field: 'proceso',  align: 'left'  },
  { name: 'silo',     label: 'Silo',     field: 'silo',     align: 'left'  },
  { name: 'variedad', label: 'Variedad', field: 'variedad', align: 'left'  },
  { name: 'acciones', label: 'Ver',      field: 'id',       align: 'center' },
];

const formAnalisis = ref({
  noOrden: '', fecha: fechaHoy(),
  envasado: '', producto: '', granoId: null as number | null,
  cosecha: '', proceso: '', silo: '', variedad: '',
});

const analisisActual = ref<AnalisisResumen & { granoId: number | null; detallado: string; parrillas: string }>({
  id: 0, noOrden: '', fecha: '', envasado: '', producto: '',
  granoId: null, cosecha: '', proceso: '', silo: '', variedad: '',
  detallado: '', parrillas: '',
});

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
    cosecha: '', proceso: '', silo: '', variedad: '',
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
    analisisActual.value = { ...formAnalisis.value, id: data.id, detallado: '[]', parrillas: '{}' };
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

function confirmarFinalizarAnalisis(row: AnalisisResumen) {
  $q.dialog({
    title: 'Finalizar análisis',
    message: `¿Confirmas finalizar el análisis de la orden <b>${row.noOrden}</b>? Ya no aparecerá en la lista activa.`,
    html: true,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Finalizar', color: 'positive', unelevated: true },
  }).onOk(() => {
    void api.post(`/api/produccion/analisis/${row.id}/finalizar`)
      .then(() => {
        Notify.create({ type: 'positive', message: 'Análisis finalizado correctamente' });
        void cargarAnalisis();
      })
      .catch(() => {
        Notify.create({ type: 'negative', message: 'Error al finalizar análisis' });
      });
  });
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
