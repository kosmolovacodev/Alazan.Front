<template>
  <div class="scroll-area">
    <div class="q-mb-md">
      <div class="text-h6">Configuración de Recepción de Granos</div>
      <div class="text-body2 text-grey-7 q-mt-xs">
        Gobierna el comportamiento del módulo Recepción de Granos (Báscula, Análisis, Precio, Boleta, Volcado, Pre-liquidación).
      </div>
    </div>
    

    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>

    <div class="q-gutter-lg" v-if="!loading">
      <q-card flat bordered class="q-pa-md" v-if="reglas">
          <div class="row items-center q-gutter-sm q-mb-sm">
            <div class="text-h6">💰</div>
            <div class="text-subtitle1">Cálculo de Descuento por Impurezas</div>
          </div>

          <q-banner rounded class="bg-yellow-1 text-grey-9">
            <div class="row items-center q-col-gutter-md">
              <div class="col-auto text-caption text-grey-8">
                <span class="text-weight-medium">Fórmula:</span>
              </div>

              <div class="col">
                <div class="row items-center q-gutter-xs">
                  <q-badge color="white" text-color="grey-9" class="q-pa-sm">
                    Descuento (kg/ton) = Impurezas (%) ×
                  </q-badge>

                  <q-input
                    v-model.number="reglas.factorImpurezas"
                    type="number"
                    dense
                    outlined
                    style="width: 90px"
                    input-class="text-center"
                  />
                </div>

                <div class="text-caption text-grey-7 q-mt-sm">
                  Ejemplo: Si Impurezas = 3.2%, entonces Descuento = 3.2 × {{ reglas.factorImpurezas }} = {{ (3.2 * (reglas.factorImpurezas || 0)).toFixed(2) }} kg/ton
                </div>
              </div>
            </div>
          </q-banner>
        </q-card>

      <q-card flat bordered class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="text-h6">🚛</div>
          <div class="text-subtitle1">Volcado y Silos</div>
        </div>

        <q-card flat bordered class="bg-grey-1 q-pa-md">
          <div class="q-mb-md">
            <q-checkbox v-model="reglas.asignacionAutoSilo" label="Asignación automática de silo" />
          </div>

          <div class="q-mb-md">
            <div class="text-caption text-grey-8 text-weight-medium q-mb-sm">
              Reglas de Asignación (Prioridad de arriba a abajo)
            </div>

            <div class="q-gutter-sm">
              <q-checkbox v-model="reglas.reglaTipoGrano" label="Por tipo de grano (Garbanzo/Frijol)" />
              <q-checkbox v-model="reglas.reglaCalibre" label="Por calibre" />
              <q-checkbox v-model="reglas.reglaExportacion" label="Por % exportación" />
              <q-checkbox v-model="reglas.reglaCapacidad" label="Por capacidad disponible" />
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-8 q-mb-xs">Alerta de Capacidad cuando el silo esté al:</div>
            <div class="row items-center q-gutter-sm">
              <q-input
                v-model.number="reglas.alertaCapacidadPct"
                type="number"
                dense
                outlined
                style="width: 110px"
                suffix="%"
              />
              <div class="text-body2 text-grey-7">de su capacidad</div>
            </div>
          </div>
        </q-card>
      </q-card>

      <q-card flat bordered class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="text-h6">📝</div>
          <div class="text-subtitle1">Configuración de Campos por Pantalla</div>
        </div>

        <q-btn 
            color="primary" 
            icon="add" 
            label="Agregar Campo Personalizado" 
            @click="abrirDialogoNuevoCampo" 
      />

          <q-card flat bordered>
            <q-tabs
              v-model="tabActual"
              dense
              class="bg-grey-2 text-grey-7"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="BASCULA" label="Báscula" />
              <q-tab name="BOLETA_GRID" label="Boleta Grid" />
              <q-tab name="ANALISIS" label="Análisis" />
              <q-tab name="PRELIQUIDACION" label="Pre-Liquidación" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="tabActual" animated class="bg-white">
              
              <q-tab-panel name="BASCULA" class="q-pa-none">
                <q-table
                  :rows="camposBascula"
                  :columns="columnsCampos"
                  row-key="id"
                  flat
                  dense
                  :pagination="{ rowsPerPage: 0 }"
                  hide-bottom
                >
                  <template v-slot:body-cell-orden="props">
                    <q-td :props="props">
                      <div class="row justify-center no-wrap">
                        <q-btn flat dense size="sm" icon="arrow_upward" @click="moverFila(camposBascula, props.rowIndex, -1)" :disable="props.rowIndex === 0" color="grey-8" />
                        <q-btn flat dense size="sm" icon="arrow_downward" @click="moverFila(camposBascula, props.rowIndex, 1)" :disable="props.rowIndex === camposBascula.length - 1" color="grey-8" />
                      </div>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-visible="props">
                    <q-td :props="props"><q-checkbox v-model="props.row.visible" dense /></q-td>
                  </template>
                  <template v-slot:body-cell-obligatorio="props">
                    <q-td :props="props"><q-checkbox v-model="props.row.obligatorio" dense /></q-td>
                  </template>
                  <template v-slot:body-cell-acciones="props">
                    <q-td :props="props">
                      <q-btn icon="edit" color="primary" flat dense round size="sm" @click="abrirEdicion(props.row)">
                        <q-tooltip>Editar nombre</q-tooltip>
                      </q-btn>
                      <q-btn
                        v-if="!props.row.esSistema"
                        icon="delete"
                        color="negative"
                        flat
                        dense
                        round
                        size="sm"
                        @click="eliminarCampo(props.row)"
                      >
                        <q-tooltip>Eliminar campo personalizado</q-tooltip>
                      </q-btn>
                      <q-icon v-else name="lock" color="grey-4">
                        <q-tooltip>Campo de Sistema (Protegido)</q-tooltip>
                      </q-icon>
                    </q-td>
                  </template>
                </q-table>
              </q-tab-panel>

              <q-tab-panel name="BOLETA_GRID" class="q-pa-none">
                <q-table :rows="camposBoletaGrid" :columns="columnsCampos" row-key="id" flat dense :pagination="{ rowsPerPage: 0 }" hide-bottom>
                  <template v-slot:body-cell-orden="props">
                    <q-td :props="props">
                      <div class="row justify-center no-wrap">
                        <q-btn flat dense size="sm" icon="arrow_upward" @click="moverFila(camposBoletaGrid, props.rowIndex, -1)" color="grey-8" />
                        <q-btn flat dense size="sm" icon="arrow_downward" @click="moverFila(camposBoletaGrid, props.rowIndex, 1)" color="grey-8" />
                      </div>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-visible="props"><q-td :props="props"><q-checkbox v-model="props.row.visible" dense /></q-td></template>
                  <template v-slot:body-cell-obligatorio="props"><q-td :props="props"><q-checkbox v-model="props.row.obligatorio" dense /></q-td></template>
                  <template v-slot:body-cell-acciones="props">
                    <q-td :props="props">
                      <q-btn icon="edit" color="primary" flat dense round size="sm" @click="abrirEdicion(props.row)">
                        <q-tooltip>Editar nombre</q-tooltip>
                      </q-btn>
                      <q-btn
                        v-if="!props.row.esSistema"
                        icon="delete"
                        color="negative"
                        flat
                        dense
                        round
                        size="sm"
                        @click="eliminarCampo(props.row)"
                      >
                        <q-tooltip>Eliminar campo personalizado</q-tooltip>
                      </q-btn>
                      <q-icon v-else name="lock" color="grey-4">
                        <q-tooltip>Campo de Sistema (Protegido)</q-tooltip>
                      </q-icon>
                    </q-td>
                  </template>
                </q-table>
              </q-tab-panel>

              <q-tab-panel name="ANALISIS" class="q-pa-sm">
                <div class="row items-center q-gutter-sm q-mb-sm">
                  <div class="text-caption text-grey-7">Tipo de grano a configurar:</div>
                  <q-select
                    v-model="granoFiltroAnalisis"
                    :options="opcionesGranoAnalisis"
                    emit-value
                    map-options
                    dense
                    outlined
                    style="min-width: 180px"
                  />
                </div>
                <q-table :rows="camposAnalisisFiltrados" :columns="columnsCampos" row-key="id" flat dense :pagination="{ rowsPerPage: 0 }" hide-bottom>
                    <template v-slot:body-cell-orden="props">
                      <q-td :props="props">
                        <div class="row justify-center no-wrap">
                          <q-btn flat dense size="sm" icon="arrow_upward" @click="moverFilaAnalisis(props.rowIndex, -1)" :disable="props.rowIndex === 0" color="grey-8" />
                          <q-btn flat dense size="sm" icon="arrow_downward" @click="moverFilaAnalisis(props.rowIndex, 1)" :disable="props.rowIndex === camposAnalisisFiltrados.length - 1" color="grey-8" />
                        </div>
                      </q-td>
                    </template>
                    <template v-slot:body-cell-visible="props"><q-td :props="props"><q-checkbox v-model="props.row.visible" dense /></q-td></template>
                    <template v-slot:body-cell-obligatorio="props"><q-td :props="props"><q-checkbox v-model="props.row.obligatorio" dense /></q-td></template>
                  <template v-slot:body-cell-acciones="props">
                    <q-td :props="props">
                      <q-btn icon="edit" color="primary" flat dense round size="sm" @click="abrirEdicion(props.row)">
                        <q-tooltip>Editar nombre</q-tooltip>
                      </q-btn>
                      <q-btn
                        v-if="!props.row.esSistema"
                        icon="delete"
                        color="negative"
                        flat
                        dense
                        round
                        size="sm"
                        @click="eliminarCampo(props.row)"
                      >
                        <q-tooltip>Eliminar campo personalizado</q-tooltip>
                      </q-btn>
                      <q-icon v-else name="lock" color="grey-4">
                        <q-tooltip>Campo de Sistema (Protegido)</q-tooltip>
                      </q-icon>
                    </q-td>
                  </template>
                  </q-table>
              </q-tab-panel>

              <q-tab-panel name="PRELIQUIDACION" class="q-pa-none">
                <q-table :rows="camposPreliquidacion" :columns="columnsCampos" row-key="id" flat dense :pagination="{ rowsPerPage: 0 }" hide-bottom>
                    <template v-slot:body-cell-orden="props">
                      <q-td :props="props">
                        <div class="row justify-center no-wrap">
                          <q-btn flat dense size="sm" icon="arrow_upward" @click="moverFila(camposPreliquidacion, props.rowIndex, -1)" color="grey-8" />
                          <q-btn flat dense size="sm" icon="arrow_downward" @click="moverFila(camposPreliquidacion, props.rowIndex, 1)" color="grey-8" />
                        </div>
                      </q-td>
                    </template>
                    <template v-slot:body-cell-visible="props"><q-td :props="props"><q-checkbox v-model="props.row.visible" dense /></q-td></template>
                    <template v-slot:body-cell-obligatorio="props"><q-td :props="props"><q-checkbox v-model="props.row.obligatorio" dense /></q-td></template>
                    <template v-slot:body-cell-acciones="props">
                      <q-td :props="props">
                        <q-btn icon="edit" color="primary" flat dense round size="sm" @click="abrirEdicion(props.row)">
                          <q-tooltip>Editar nombre</q-tooltip>
                        </q-btn>
                        <q-btn
                          v-if="!props.row.esSistema"
                          icon="delete"
                          color="negative"
                          flat
                          dense
                          round
                          size="sm"
                          @click="eliminarCampo(props.row)"
                        >
                          <q-tooltip>Eliminar campo personalizado</q-tooltip>
                        </q-btn>
                        <q-icon v-else name="lock" color="grey-4">
                          <q-tooltip>Campo de Sistema (Protegido)</q-tooltip>
                        </q-icon>
                      </q-td>
                    </template>
                  </q-table>
              </q-tab-panel>

            </q-tab-panels>
          </q-card>
        
      </q-card>
      
      <q-banner rounded class="bg-blue-1 text-blue-10 q-mt-md">
                <div class="text-weight-medium q-mb-sm">✓ Precio Autorizado - Confirmación del Productor</div>
                <q-checkbox v-model="reglas.solicitarAprobacionProd" label="Solicitar aprobación del productor antes de finalizar boleta" />
                
                <q-card flat bordered class="bg-white q-pa-md q-mt-sm" v-if="reglas.solicitarAprobacionProd">
                  <div class="text-caption text-grey-8 q-mb-xs">Pregunta a mostrar al productor:</div>
                  <q-input v-model="reglas.preguntaProductor" dense outlined placeholder="Ej: ¿Acepta los términos de esta boleta?" />

                  <div class="row q-col-gutter-md q-mt-md">
                    <div class="col-12 col-md-6">
                      <q-card flat bordered class="bg-green-1 q-pa-sm">
                        <div class="text-weight-medium text-green-9 q-mb-xs">Si acepta:</div>
                        <q-select 
                          v-model="reglas.accionSiAcepta" 
                          :options="[
                            { label: 'Pasar de Boleta Preliminar -> Boleta', value: 'BOLETA' },
                            { label: 'Continuar a Pre-liquidación', value: 'PRELIQUIDACION' },
                            { label: 'Continuar a Volcado', value: 'VOLCADO' }
                          ]" 
                          emit-value
                          map-options
                          dense outlined bg-color="white" 
                        />
                        <div class="text-caption text-green-8 q-mt-xs">
                          <q-icon name="info" /> La boleta se marca como aceptada y continúa el flujo
                        </div>
                      </q-card>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-card flat bordered class="bg-red-1 q-pa-sm">
                        <div class="text-weight-medium text-red-9 q-mb-xs">Si rechaza:</div>
                        <q-select 
                          v-model="reglas.accionSiRechaza" 
                          :options="[
                            { label: 'Ir a Renegociar (Precio)', value: 'RENEGOCIAR' },
                            { label: 'Volver a Análisis', value: 'ANALISIS' },
                            { label: 'Cancelar operación', value: 'CANCELAR' }
                          ]" 
                          emit-value
                          map-options
                          dense outlined bg-color="white" 
                        />
                        <div class="text-caption text-red-8 q-mt-xs">
                          <q-icon name="info" /> Se registra el rechazo y permite ajustes
                        </div>
                      </q-card>
                    </div>
                  </div>
                </q-card>
      </q-banner>
          
      

      <q-card flat bordered class="q-pa-md">
        <div class="text-h6 q-mb-sm">✅ Validaciones</div>
        <div class="q-gutter-sm">
          <q-checkbox v-model="reglas.valAtiendeMorales" label="Habilitar campo ATIENDE para Personas Morales" />
          <q-checkbox v-model="reglas.valMultiplesEntregas" label="Permitir múltiples entregas el mismo día" />
          <q-checkbox v-model="reglas.valBloquearPlacas" label="Bloquear placas duplicadas" />
          <q-checkbox v-model="reglas.valLecturaAutoBascula" label="Permitir lectura automática de báscula" />
          <q-checkbox v-model="reglas.valCapturaManualPeso" label="Permitir captura manual de peso" />
          <q-checkbox v-model="reglas.valMotivoPesoManual" label="Solicitar motivo en captura manual" />
        </div>
      </q-card>

      <q-card flat bordered class="q-pa-md">
        <div class="text-h6 q-mb-sm q-mt-lg">✍️ Plantillas de Observaciones para Pre-Liquidación</div>
        <div class="q-gutter-md">
          <q-input 
            v-model="reglas.tplEjidal" 
            label="Productor Ejidal" 
            type="textarea" outlined dense rows="2"
            hint="Variables disponibles: {monto}, {tipo_productor}, {fecha}"
          />
          <q-input 
            v-model="reglas.tplPequenaPropiedad" 
            label="Pequeña Propiedad" 
            type="textarea" outlined dense rows="2"
            hint="Variables disponibles: {monto}, {tipo_productor}, {fecha}"
          />
          <q-input 
            v-model="reglas.tplPersonaMoral" 
            label="Persona Moral" 
            type="textarea" outlined dense rows="2"
            hint="Variables disponibles: {razon_social}, {atiende}, {fecha}"
          />
        </div>

        <div class="q-mt-xl">
          <q-btn 
            color="orange" 
            label="Guardar Configuración Completa" 
            unelevated 
            class="q-px-xl q-py-sm"
            icon="save"
            :loading="loading"
            @click="guardarConfiguracionCompleta"
          />
        </div>
      </q-card>

      <!-- Dialog: Editar nombre de campo -->
      <q-dialog v-model="showDialogEditarCampo" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <div class="text-h6">Editar Campo</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="column q-gutter-md">
              <q-input
                v-model="campoEditando.nombreMostrar"
                label="Nombre a mostrar en pantalla"
                outlined
                dense
                autofocus
                @keyup.enter="confirmarEdicion"
              />
              <q-select
                v-model="campoEditando.tipoDato"
                :options="opcionesTipoDato"
                emit-value
                map-options
                label="Tipo de dato"
                outlined dense
              />
              <q-banner
                v-if="campoEditando.tipoDato === 'porcentaje'"
                rounded
                class="bg-blue-1 text-blue-9 q-pa-sm"
              >
                <q-checkbox
                  v-model="campoEditando.afectaExportacion"
                  label="Descuenta del % de Exportación"
                  color="blue-8"
                />
              </q-banner>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn color="primary" label="Aplicar" @click="confirmarEdicion" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showDialogNuevoCampo" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center">
            <div class="text-h6">Nuevo Campo Personalizado</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="column q-gutter-md">
              <q-select
                v-model="nuevoCampo.pantalla"
                :options="['BASCULA', 'BOLETA_GRID', 'ANALISIS', 'PRELIQUIDACION']"
                label="Pantalla donde aparecerá"
                outlined dense
              />
              
              <q-input 
                v-model="nuevoCampo.nombreMostrar" 
                label="Nombre a mostrar (Label)" 
                outlined dense 
                placeholder="Ej: Color del Grano"
              />

              <q-input
                v-model="nuevoCampo.claveCampo"
                label="Clave técnica (ID)"
                outlined dense
                placeholder="Ej: color_grano"
                hint="Se usará para identificar el dato en la base de datos"
              />

              <q-select
                v-if="nuevoCampo.pantalla === 'ANALISIS'"
                v-model="nuevoCampo.granoId"
                :options="opcionesGranoAnalisis"
                emit-value
                map-options
                label="Tipo de grano"
                outlined dense
              />

              <q-select
                v-model="nuevoCampo.tipoDato"
                :options="opcionesTipoDato"
                emit-value
                map-options
                label="Tipo de dato"
                outlined dense
              />

              <q-banner
                v-if="nuevoCampo.tipoDato === 'porcentaje'"
                rounded
                class="bg-blue-1 text-blue-9 q-pa-sm"
              >
                <q-checkbox
                  v-model="nuevoCampo.afectaExportacion"
                  label="Descuenta del % de Exportación"
                  color="blue-8"
                />
                <div class="text-caption q-mt-xs">
                  Si está activo, el valor de este campo se restará del porcentaje de Exportación calculado.
                </div>
              </q-banner>

              <div class="row q-gutter-md">
                <q-checkbox v-model="nuevoCampo.visible" label="Visible" />
                <q-checkbox v-model="nuevoCampo.obligatorio" label="Obligatorio" />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn color="primary" label="Guardar Campo" @click="guardarNuevoCampo" :loading="loading" />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { Dialog, Notify } from 'quasar'
import type { QTableColumn } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

// --- INTERFACES PARA TYPESCRIPT ---
interface ReglasRecepcion {
  id: number;
  factorImpurezas: number;
  asignacionAutoSilo: boolean;
  reglaTipoGrano: boolean; 
  reglaCalibre: boolean;
  reglaExportacion: boolean;
  reglaCapacidad: boolean;
  alertaCapacidadPct: number;
  solicitarAprobacionProd: boolean;
  preguntaProductor: string | null;
  accionSiAcepta: string | null;
  accionSiRechaza: string | null;
  solicitarMotivoRechazo: boolean;
  requerirFirmaDigital: boolean;
  valAtiendeMorales: boolean;
  valMultiplesEntregas: boolean;
  valBloquearPlacas: boolean;
  valLecturaAutoBascula: boolean;
  valCapturaManualPeso: boolean;
  valMotivoPesoManual: boolean;
  tplEjidal: string | null;
  tplPequenaPropiedad: string | null;
  tplPersonaMoral: string | null;
}

interface CampoConfig {
  id: number;
  pantalla: string;
  claveCampo: string;
  nombreMostrar: string;
  orden: number;
  visible: boolean;
  obligatorio: boolean;
  esSistema: boolean;
  descripcion?: string;
  granoId?: number | null;
  tipoDato: string;
  afectaExportacion: boolean;
}

const columnsCampos: QTableColumn[] = [
  { 
    name: 'orden', 
    label: 'Orden', 
    align: 'center', 
    field: 'orden', 
    style: 'width: 80px' 
  },
  { 
    name: 'nombreMostrar', 
    label: 'Nombre en Pantalla', 
    align: 'left', 
    field: 'nombreMostrar' 
  },
  { 
    name: 'claveCampo', 
    label: 'Clave Interna', 
    align: 'left', 
    field: 'claveCampo', 
    classes: 'text-grey-7' 
  },
  { 
    name: 'visible', 
    label: 'Visible', 
    align: 'center', 
    field: 'visible', 
    style: 'width: 100px' 
  },
  { 
    name: 'obligatorio', 
    label: 'Obligatorio', 
    align: 'center', 
    field: 'obligatorio', 
    style: 'width: 100px' 
  },
  { 
    name: 'acciones', 
    label: 'Acciones', 
    align: 'center', 
    field: 'id', // Añadido field requerido por QTableColumn
    style: 'width: 50px' 
  }
]

// --- ESTADO DE CARGA ---
const loading = ref(false)

// --- 1. REGLAS GENERALES ---
const reglas = ref<ReglasRecepcion>({
  id: 1,
  factorImpurezas: 0,
  asignacionAutoSilo: false,
  reglaTipoGrano: false,
  reglaCalibre: false,
  reglaExportacion: false,
  reglaCapacidad: false,
  alertaCapacidadPct: 0,
  solicitarAprobacionProd: false,
  preguntaProductor: '',
  accionSiAcepta: '',
  accionSiRechaza: '',
  solicitarMotivoRechazo: false,
  requerirFirmaDigital: false,
  valAtiendeMorales: false,
  valMultiplesEntregas: false,
  valBloquearPlacas: false,
  valLecturaAutoBascula: false,
  valCapturaManualPeso: false,
  valMotivoPesoManual: false,
  tplEjidal: '',
  tplPequenaPropiedad: '',
  tplPersonaMoral: ''
});

// --- 2. CONFIGURACIÓN DE TABLAS ---
const camposBascula = ref<CampoConfig[]>([])
const camposBoletaGrid = ref<CampoConfig[]>([])
const camposAnalisis = ref<CampoConfig[]>([])
const camposPreliquidacion = ref<CampoConfig[]>([])

const showDialogNuevoCampo = ref(false)
const showDialogEditarCampo = ref(false)
const campoEditando = ref<{ id: number; nombreMostrar: string; tipoDato: string; afectaExportacion: boolean }>({ id: 0, nombreMostrar: '', tipoDato: 'texto', afectaExportacion: false })
const tabActual = ref('BASCULA')

// --- ANÁLISIS: selector de grano ---
const granosDisponibles = ref<{ id: number; nombre: string }[]>([])
const granoFiltroAnalisis = ref<number | null>(null)

const opcionesGranoAnalisis = computed(() =>
  granosDisponibles.value.map(g => ({ label: g.nombre, value: g.id }))
)

const camposAnalisisFiltrados = computed(() =>
  camposAnalisis.value.filter(c => c.granoId === granoFiltroAnalisis.value)
)

const cargarGranos = async () => {
  try {
    const { data } = await api.get<{ id: number; nombre: string }[]>('/api/catalogos/granos')
    granosDisponibles.value = data
    if (data.length > 0 && granoFiltroAnalisis.value === null) {
      granoFiltroAnalisis.value = data[0]?.id ?? null
    }
  } catch {
    // Si falla, el selector queda vacío pero no rompe nada
  }
}

const opcionesTipoDato = [
  { label: 'Texto', value: 'texto' },
  { label: 'Número', value: 'numero' },
  { label: 'Porcentaje (%)', value: 'porcentaje' },
]

const nuevoCampo = ref<{
  pantalla: string;
  nombreMostrar: string;
  claveCampo: string;
  obligatorio: boolean;
  visible: boolean;
  esSistema: boolean;
  granoId: number | null;
  tipoDato: string;
  afectaExportacion: boolean;
}>({
  pantalla: 'BASCULA',
  nombreMostrar: '',
  claveCampo: '',
  obligatorio: false,
  visible: true,
  esSistema: false,
  granoId: null,
  tipoDato: 'texto',
  afectaExportacion: false,
})

const abrirEdicion = (campo: CampoConfig) => {
  campoEditando.value = {
    id: campo.id,
    nombreMostrar: campo.nombreMostrar,
    tipoDato: campo.tipoDato ?? 'texto',
    afectaExportacion: campo.afectaExportacion ?? false,
  }
  showDialogEditarCampo.value = true
}

const confirmarEdicion = () => {
  const todasLasListas = [camposBascula, camposBoletaGrid, camposAnalisis, camposPreliquidacion]
  for (const lista of todasLasListas) {
    const idx = lista.value.findIndex(c => c.id === campoEditando.value.id)
    if (idx >= 0) {
      lista.value[idx]!.nombreMostrar = campoEditando.value.nombreMostrar
      lista.value[idx]!.tipoDato = campoEditando.value.tipoDato
      lista.value[idx]!.afectaExportacion = campoEditando.value.afectaExportacion
      break
    }
  }
  showDialogEditarCampo.value = false
}

const eliminarCampo = (campo: CampoConfig) => {
  Dialog.create({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de que deseas eliminar el campo "${campo.nombreMostrar}"?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative', flat: true }
  }).onOk(() => {
    void ejecutarEliminacion(campo.id)
  })
}

const ejecutarEliminacion = async (id: number) => {
  try {
    loading.value = true
    await api.delete(`/api/configuracion-recepcion/campos/${id}`)
    
    Notify.create({ type: 'positive', message: 'Campo eliminado' })
    await cargarConfiguracion() 
  } catch (e) {
    console.error(e)
    Notify.create({ type: 'negative', message: 'No se pudo eliminar el campo' })
  } finally {
    loading.value = false
  }
}

const abrirDialogoNuevoCampo = () => {
  nuevoCampo.value = {
    pantalla: tabActual.value,
    nombreMostrar: '',
    claveCampo: '',
    obligatorio: false,
    visible: true,
    esSistema: false,
    granoId: tabActual.value === 'ANALISIS' ? granoFiltroAnalisis.value : null,
    tipoDato: 'texto',
    afectaExportacion: false,
  }
  showDialogNuevoCampo.value = true
}

const guardarNuevoCampo = async () => {
  try {
    if (!nuevoCampo.value.nombreMostrar || !nuevoCampo.value.claveCampo) {
      Notify.create({ type: 'warning', message: 'Nombre y Clave son obligatorios' })
      return
    }

    loading.value = true
    // Generamos una clave limpia (sin espacios)
    nuevoCampo.value.claveCampo = nuevoCampo.value.claveCampo.replace(/\s+/g, '_')

    // Llamada al API (Necesitarás crear este endpoint en tu controlador)
    const { data } = await api.post('/api/configuracion-recepcion/campos', nuevoCampo.value)
    
    // Actualizamos la lista local según la pantalla
    if (nuevoCampo.value.pantalla === 'BASCULA') camposBascula.value.push(data)
    if (nuevoCampo.value.pantalla === 'BOLETA_GRID') camposBoletaGrid.value.push(data)
    if (nuevoCampo.value.pantalla === 'ANALISIS') camposAnalisis.value.push(data)
    if (nuevoCampo.value.pantalla === 'PRELIQUIDACION') camposPreliquidacion.value.push(data)

    showDialogNuevoCampo.value = false
    Notify.create({ type: 'positive', message: 'Campo agregado correctamente' })
  } catch{
    Notify.create({ type: 'negative', message: 'Error al guardar el campo' })
  } finally {
    loading.value = false
  }
}

// --- CARGA DE DATOS ---
const cargarConfiguracion = async () => {
  try {
    loading.value = true
    const { data } = await api.get<{ reglas: ReglasRecepcion, campos: CampoConfig[] }>('/api/configuracion-recepcion')
    
    if (data.reglas) {
      console.log("Datos recibidos:", data.reglas); // Revisa aquí si los nombres vienen con guion bajo _
      
      reglas.value = {
        id: data.reglas.id,
        factorImpurezas: data.reglas.factorImpurezas,
        // Usamos el operador !! para forzar a TRUE o FALSE literal
        asignacionAutoSilo: !!data.reglas.asignacionAutoSilo,
        reglaTipoGrano: !!data.reglas.reglaTipoGrano,
        reglaCalibre: !!data.reglas.reglaCalibre,
        reglaExportacion: !!data.reglas.reglaExportacion,
        reglaCapacidad: !!data.reglas.reglaCapacidad,
        alertaCapacidadPct: data.reglas.alertaCapacidadPct,
        solicitarAprobacionProd: !!data.reglas.solicitarAprobacionProd,
        preguntaProductor: data.reglas.preguntaProductor,
        accionSiAcepta: data.reglas.accionSiAcepta,
        accionSiRechaza: data.reglas.accionSiRechaza,
        solicitarMotivoRechazo: !!data.reglas.solicitarMotivoRechazo,
        requerirFirmaDigital: !!data.reglas.requerirFirmaDigital,
        valAtiendeMorales: !!data.reglas.valAtiendeMorales,
        valMultiplesEntregas: !!data.reglas.valMultiplesEntregas,
        valBloquearPlacas: !!data.reglas.valBloquearPlacas,
        valLecturaAutoBascula: !!data.reglas.valLecturaAutoBascula,
        valCapturaManualPeso: !!data.reglas.valCapturaManualPeso,
        valMotivoPesoManual: !!data.reglas.valMotivoPesoManual,
        tplEjidal: data.reglas.tplEjidal,
        tplPequenaPropiedad: data.reglas.tplPequenaPropiedad,
        tplPersonaMoral: data.reglas.tplPersonaMoral
      };
    }
    
    if (data.campos) {
      // También asegúrate de que los campos del grid tengan booleanos reales
      const camposLimpios = data.campos.map(c => ({
        ...c,
        visible: !!c.visible,
        obligatorio: !!c.obligatorio,
        esSistema: !!c.esSistema,
        granoId: c.granoId ?? null,
        tipoDato: c.tipoDato ?? 'texto',
        afectaExportacion: !!c.afectaExportacion,
      }))

      camposBascula.value = camposLimpios.filter(c => c.pantalla === 'BASCULA')
      camposBoletaGrid.value = camposLimpios.filter(c => c.pantalla === 'BOLETA_GRID')
      camposAnalisis.value = camposLimpios.filter(c => c.pantalla === 'ANALISIS')
      camposPreliquidacion.value = camposLimpios.filter(c => c.pantalla === 'PRELIQUIDACION')
    }
  } catch (e) {
    console.error(e)
    Notify.create({ type: 'negative', message: 'Error al cargar la configuración' })
  } finally {
    loading.value = false
  }
}

// --- GUARDADO GENERAL ---
const guardarConfiguracionCompleta = async () => {
  try {
    loading.value = true;

    // 1. Mandamos las reglas (lo que ya hacías)
    await api.post('/api/configuracion-recepcion/guardar-reglas', reglas.value);

    // 2. CONECTAMOS LOS CAMPOS:
    // Juntamos los 4 arrays en una sola lista para mandarlos al UPDATE masivo
    // Usamos map para crear un array limpio y evitar problemas de serialización
    const listaCompletaCampos = [
      ...camposBascula.value,
      ...camposBoletaGrid.value,
      ...camposAnalisis.value,
      ...camposPreliquidacion.value
    ].map(campo => ({
      id: campo.id,
      pantalla: campo.pantalla,
      claveCampo: campo.claveCampo,
      nombreMostrar: campo.nombreMostrar,
      orden: campo.orden,
      visible: campo.visible,
      obligatorio: campo.obligatorio,
      esSistema: campo.esSistema,
      granoId: campo.granoId ?? null,
      tipoDato: campo.tipoDato ?? 'texto',
      afectaExportacion: campo.afectaExportacion ?? false,
    }));

    // 3. Solo actualizamos campos si hay campos para actualizar
    if (listaCompletaCampos.length > 0) {
      // IMPORTANTE: El backend espera sedeId como query parameter, no en el body
      // Por eso lo pasamos explícitamente en el tercer parámetro (config)
      const authStore = useAuthStore();
      const sedeId = authStore.sedeActivaId ?? 0;

      await api.put('/api/configuracion-recepcion/actualizar-lista-campos', listaCompletaCampos, {
        params: { sedeId }
      });
    }

    Notify.create({
      type: 'positive',
      message: 'Reglas y configuración de campos guardados correctamente'
    });

    // 4. Refrescamos para asegurar que el front tenga la verdad absoluta de la DB
    await cargarConfiguracion();

  } catch (error) {
    console.error(error);
    Notify.create({ type: 'negative', message: 'Fallo al sincronizar con la base de datos' });
  } finally {
    loading.value = false;
  }
};

// --- LÓGICA DE MOVIMIENTO ---

// Versión especial para ANÁLISIS: opera sobre camposAnalisis (el array real)
// usando el índice visible del filtered computed
const moverFilaAnalisis = (visibleIndex: number, direccion: number) => {
  const filtrados = camposAnalisisFiltrados.value
  const itemA = filtrados[visibleIndex]
  const itemB = filtrados[visibleIndex + direccion]
  if (!itemA || !itemB) return
  // intercambia el orden entre los dos items en el array original
  const realA = camposAnalisis.value.indexOf(itemA)
  const realB = camposAnalisis.value.indexOf(itemB)
  if (realA < 0 || realB < 0) return
  camposAnalisis.value.splice(realA, 1, itemB)
  camposAnalisis.value.splice(realB, 1, itemA)
  // recalcula orden de todo camposAnalisis
  camposAnalisis.value.forEach((campo, idx) => { campo.orden = idx + 1 })
}

const moverFila = (lista: CampoConfig[], index: number, direccion: number) => {
  const nuevaPos = index + direccion
  if (nuevaPos < 0 || nuevaPos >= lista.length) return
  
  // Extraemos el elemento
  const removedItems = lista.splice(index, 1)
  const item = removedItems[0]

  // Validamos que 'item' no sea undefined
  if (item) {
    lista.splice(nuevaPos, 0, item)
    
    // Actualizamos el número de orden basado en el nuevo índice
    lista.forEach((campo, idx) => {
      campo.orden = idx + 1
    })
  }
}

onMounted(async () => {
  await Promise.all([cargarConfiguracion(), cargarGranos()])
})
</script>

<style scoped>
.scroll-area {
  overflow-y: auto;
  max-height: calc(100vh - 240px);
}
</style>
