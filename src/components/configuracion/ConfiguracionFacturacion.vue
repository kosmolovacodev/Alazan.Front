<template>
  <div class="q-gutter-lg relative-position">
    <div>
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">📄</div>
        <div class="text-h6">Configuración de Recepción de Facturas</div>
      </div>
      <div class="text-body2 text-grey-7 q-mt-sm">
        Define documentos requeridos, validaciones automáticas, parámetros financieros y status del flujo de facturación.
      </div>
    </div>

    <q-card bordered flat>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('documentos')">
        <q-item-section avatar>
          <q-icon name="description" color="orange-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1 text-weight-medium">Documentos Requeridos del Expediente</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'documentos' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'documentos'" class="q-pa-md bg-white">
          <div class="text-caption text-grey-7 q-mb-md">
            Configura los documentos que se solicitarán a los productores según su tipo de persona.
          </div>

          <q-markup-table flat bordered dense wrap-cells class="bg-white">
            <thead>
              <tr class="bg-grey-2">
                <th class="text-center" style="width: 50px">Activo</th>
                <th class="text-left">Documento</th>
                <th class="text-left">Formato Sugerido</th>
                <th class="text-center">Obligatorio</th>
                <th class="text-center">Vigencia (días)</th>
                <th class="text-center">P. Física</th>
                <th class="text-center">P. Moral</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="doc in documentos" :key="doc.id">
                <td class="text-center">
                  <q-checkbox v-model="doc.activo" dense />
                </td>

                <td>
                  <span :class="doc.activo ? 'text-grey-9' : 'text-grey-5'">
                    {{ doc.nombre }}
                  </span>
                </td>

                <td>
                  <q-badge color="blue-2" text-color="blue-9">
                    {{ doc.formato }}
                  </q-badge>
                </td>

                <td class="text-center">
                  <q-checkbox v-model="doc.obligatorio" dense :disable="!doc.activo" color="negative" />
                </td>

                <td class="text-center">
                  <template v-if="doc.requiereVigencia">
                    <q-input
                      v-model.number="doc.diasVigenciaDefault"
                      type="number"
                      dense
                      outlined
                      style="width: 80px; margin: 0 auto;"
                      input-class="text-center"
                      :disable="!doc.activo"
                      :min="0"
                    />
                  </template>
                  <template v-else>
                    <span class="text-grey-5">N/A</span>
                  </template>
                </td>

                <td class="text-center">
                  <q-checkbox
                    v-model="doc.aplicaPersonaFisica"
                    dense
                    :disable="!doc.activo"
                  />
                </td>

                <td class="text-center">
                  <q-checkbox
                    v-model="doc.aplicaPersonaMoral"
                    dense
                    :disable="!doc.activo"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>

          <q-banner rounded class="bg-blue-1 text-blue-10 q-mt-md">
            <template v-slot:avatar>
              <q-icon name="info" color="blue-8" />
            </template>
            <div class="text-body2">
              <span class="text-weight-bold">💡 Nota:</span>
              Los documentos marcados como obligatorios bloquearán el avance del flujo hasta que sean adjuntados y validados.
            </div>
          </q-banner>
        </div>
      </q-slide-transition>
    </q-card>

    <q-card bordered flat>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('validaciones')">
        <q-item-section avatar>
          <q-icon name="verified_user" color="blue-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1 text-weight-medium">Validaciones Automáticas</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'validaciones' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'validaciones'" class="q-pa-md bg-white q-gutter-md">
          <div class="row q-col-gutter-md">
            
            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-grey-1 q-pa-md full-height">
                <div class="row items-center justify-between no-wrap">
                  <div>
                    <div class="text-weight-bold text-grey-9">Validar RFC en SAT</div>
                    <div class="text-caption text-grey-7">Verifica la existencia del RFC en el padrón oficial.</div>
                  </div>
                  <q-toggle v-model="validarRfcEnSAT" color="blue-6" />
                </div>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-grey-1 q-pa-md full-height">
                <div class="row items-center justify-between no-wrap">
                  <div>
                    <div class="text-weight-bold text-grey-9">Validar Formato de Archivos</div>
                    <div class="text-caption text-grey-7">Restringir subida solo a extensiones permitidas.</div>
                  </div>
                  <q-toggle v-model="validarFormatoArchivos" color="blue-6" />
                </div>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-grey-1 q-pa-md full-height">
                <div class="row items-center justify-between no-wrap">
                  <div>
                    <div class="text-weight-bold text-grey-9">Alertar Vencimiento</div>
                    <div class="text-caption text-grey-7">Días de anticipación para avisar caducidad.</div>
                  </div>
                  <q-input
                    v-model.number="diasAlertaVencimiento"
                    type="number"
                    dense
                    outlined
                    style="width: 80px"
                    input-class="text-center"
                  />
                </div>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-grey-1 q-pa-md full-height">
                <div class="row items-center justify-between no-wrap">
                  <div>
                    <div class="text-weight-bold text-grey-9">Permitir Vencidos</div>
                    <div class="text-caption text-grey-7">Permite operación con documentos caducos.</div>
                  </div>
                  <q-toggle v-model="permitirDocumentosVencidos" color="red-6" />
                </div>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-grey-1 q-pa-md full-height">
                <div class="row items-center justify-between no-wrap">
                  <div>
                    <div class="text-weight-bold text-grey-9">Tamaño Máximo (MB)</div>
                    <div class="text-caption text-grey-7">Límite de peso por archivo adjunto.</div>
                  </div>
                  <q-input
                    v-model.number="tamanoMaximoMB"
                    type="number"
                    dense
                    outlined
                    style="width: 80px"
                    input-class="text-center"
                  />
                </div>
              </q-card>
            </div>

          </div>
        </div>
      </q-slide-transition>
    </q-card>

    <q-card bordered flat>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('financiero')">
        <q-item-section avatar>
          <q-icon name="attach_money" color="green-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1 text-weight-medium">Parámetros Financieros</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'financiero' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'financiero'" class="q-pa-md bg-white q-gutter-md">
          <ConfigPercentRow
            title="Retención Federal (%)"
            description="Porcentaje de retención federal estándar"
            v-model="retencionFederal"
          />
          <ConfigPercentRow
            title="Retención ISR (%)"
            description="Porcentaje de retención de ISR"
            v-model="retencionISR"
          />
          <ConfigPercentRow
            title="Retención IVA (%)"
            description="Porcentaje de retención de IVA"
            v-model="retencionIVA"
          />

          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between">
              <div>
                <div class="text-weight-bold text-grey-9">Cálculo Automático</div>
                <div class="text-caption text-grey-7">Aplicar retenciones al generar pre-liquidación.</div>
              </div>
              <q-toggle v-model="aplicarRetencionAutomatica" color="green-6" />
            </div>
          </q-card>

          <q-banner rounded class="bg-green-1 text-green-10 border-green">
            <div class="text-subtitle2 q-mb-xs">📊 Ejemplo de Cálculo (Base: {{ fmtMoney(100000) }})</div>
            <div class="text-body2 row q-col-gutter-sm">
              <div class="col-12 col-sm-6">• Fed ({{ retencionFederal }}%): {{ fmtMoney(calcRet(100000, retencionFederal)) }}</div>
              <div class="col-12 col-sm-6">• ISR ({{ retencionISR }}%): {{ fmtMoney(calcRet(100000, retencionISR)) }}</div>
              <div class="col-12 col-sm-6">• IVA ({{ retencionIVA }}%): {{ fmtMoney(calcRet(100000, retencionIVA)) }}</div>
              <div class="col-12 text-weight-bold text-h6 q-mt-sm">
                Total Neto: {{ fmtMoney(100000 - calcRet(100000, retencionFederal + retencionISR + retencionIVA)) }}
              </div>
            </div>
          </q-banner>
        </div>
      </q-slide-transition>
    </q-card>

    <q-card bordered flat>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('status')">
        <q-item-section avatar>
          <q-icon name="fact_check" color="purple-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1 text-weight-medium">Status del Flujo de Facturación</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'status' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'status'" class="q-pa-md bg-white">
          <div class="q-gutter-sm">
            <q-card
              v-for="st in statusOrdenado"
              :key="st.id"
              flat
              bordered
              class="q-pa-sm"
              :class="st.activo ? 'bg-white' : 'bg-grey-2'"
            >
              <div class="row items-center q-col-gutter-md">
                <div class="col-auto">
                  <q-checkbox v-model="st.activo" dense />
                </div>

                <div class="col">
                  <div class="row items-center q-gutter-sm">
                    <q-badge :style="{ backgroundColor: st.colorHex }" rounded />
                    <div class="text-weight-bold">{{ st.nombre }}</div>
                    <q-badge v-if="st.bloqueaPago" color="red-2" text-color="red-9" label="BLOQUEA PAGO" outline />
                  </div>
                  <div class="text-caption text-grey-7">{{ st.descripcion }}</div>
                </div>

                <div class="col-auto">
                  <q-input
                    v-model.number="st.orden"
                    type="number"
                    dense
                    outlined
                    label="Orden"
                    style="width: 70px"
                    input-class="text-center"
                    :disable="!st.activo"
                  />
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </q-slide-transition>
    </q-card>

    <q-card bordered flat>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('persona')">
        <q-item-section avatar>
          <q-icon name="warning_amber" color="yellow-9" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1 text-weight-medium">Reglas por Tipo de Persona</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'persona' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'persona'" class="q-pa-md bg-white q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-grey-1 q-pa-md">
                <div class="text-weight-bold">Longitud RFC Física</div>
                <q-input v-model.number="longitudRFCFisica" type="number" dense outlined class="q-mt-xs" />
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-grey-1 q-pa-md">
                <div class="text-weight-bold">Longitud RFC Moral</div>
                <q-input v-model.number="longitudRFCMoral" type="number" dense outlined class="q-mt-xs" />
              </q-card>
            </div>
          </div>
          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between">
              <div class="text-weight-bold">Requiere Acta Constitutiva (Moral)</div>
              <q-toggle v-model="requiereActaMoral" color="blue-6" />
            </div>
          </q-card>
        </div>
      </q-slide-transition>
    </q-card>

    <q-card bordered flat>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('formatos')">
        <q-item-section avatar>
          <q-icon name="folder" color="indigo-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1 text-weight-medium">Formatos de Archivo Permitidos</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'formatos' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'formatos'" class="q-pa-md bg-white">
          <div class="row q-col-gutter-sm">
            <div v-for="f in formatosPermitidos" :key="f.id" class="col-6 col-sm-4 col-md-3">
              <q-card flat bordered class="q-pa-sm text-center" :class="f.activo ? 'bg-indigo-1' : 'bg-grey-2'">
                <q-checkbox v-model="f.activo" :label="f.extension" dense class="text-weight-bold" />
                <div class="text-caption text-grey-6">{{ f.descripcion }}</div>
              </q-card>
            </div>
          </div>
        </div>
      </q-slide-transition>
    </q-card>

    <q-card bordered flat>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('endoso')">
        <q-item-section avatar>
          <q-icon name="history_edu" color="purple-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1 text-weight-medium">Configuración de Endoso/Cesión de Derechos</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'endoso' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'endoso'" class="q-pa-md bg-white q-gutter-md">
          <div class="text-body2 text-grey-7">
            Configura el documento de endoso y los requisitos para la cesión de derechos del ticket.
          </div>

          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="text-weight-bold q-mb-xs">Título del Documento</div>
            <q-input v-model="tituloEndoso" dense outlined bg-color="white" placeholder="CARTA DE CESIÓN DE DERECHOS" />
            <div class="text-caption text-grey-6 q-mt-xs">Este título aparecerá en el encabezado del documento de endoso</div>
          </q-card>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-grey-1 q-pa-md full-height">
                <div class="row items-center justify-between no-wrap">
                  <div>
                    <div class="text-weight-bold">Requiere Documento Escaneado</div>
                    <div class="text-caption text-grey-7">Obliga a cargar el documento firmado.</div>
                  </div>
                  <q-toggle v-model="requiereDocumentoEscaneado" color="purple-6" />
                </div>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat bordered class="bg-grey-1 q-pa-md full-height">
                <div class="row items-center justify-between no-wrap">
                  <div>
                    <div class="text-weight-bold">Información del Beneficiario</div>
                    <div class="text-caption text-grey-7">Solicita RFC, Municipio, etc. del nuevo dueño.</div>
                  </div>
                  <q-toggle v-model="requiereInformacionBeneficiario" color="purple-6" />
                </div>
              </q-card>
            </div>
          </div>

          <div class="text-subtitle2 q-mt-md">Contenido del Documento de Endoso</div>
          <div class="text-caption text-grey-7">Personaliza el texto. Etiquetas permitidas: <q-badge outline color="primary">{PRODUCTOR_CEDENTE}</q-badge> <q-badge outline color="primary">{NUEVO_BENEFICIARIO}</q-badge> <q-badge outline color="primary">{TICKET}</q-badge></div>
          
          <div class="q-gutter-y-sm q-mt-xs">
            <q-input v-model="textoParrafo1" label="Párrafo 1 - Introducción" type="textarea" outlined autogrow dense />
            <q-input v-model="textoParrafo2" label="Párrafo 2 - Cesión" type="textarea" outlined autogrow dense />
            <q-input v-model="textoParrafo3" label="Párrafo 3 - Aceptación" type="textarea" outlined autogrow dense />
            <q-input v-model="textoParrafo4" label="Párrafo 4 - Cláusula Final" type="textarea" outlined autogrow dense />
          </div>

          <q-banner rounded class="bg-blue-1 text-blue-9 q-mt-md">
            <div class="text-weight-bold">🏷️ Etiquetas disponibles:</div>
            <div class="row q-col-gutter-xs q-mt-xs">
              <div v-for="tag in ['{PRODUCTOR_CEDENTE} - Nombre del productor original', '{NUEVO_BENEFICIARIO} - Nombre del nuevo beneficiario', '{TICKET} - Número de ticket', '{FECHA} - Fecha del ticket', '{TOTAL_PAGAR} - Monto total a pagar', '{KG_LIQUIDAR} - Kilogramos a liquidar']" :key="tag" class="col-auto">
                <q-chip size="sm" color="blue-2" text-color="blue-9" dense>{{ tag }}</q-chip>
              </div>
            </div>
          </q-banner>

          <div class="text-subtitle2 q-mt-lg">Documentos Adjuntos Requeridos del Nuevo Beneficiario</div>
          <div class="q-gutter-y-xs">
            <q-card v-for="doc in documentosEndoso" :key="doc.id" flat bordered class="q-pa-sm" :class="doc.activo ? '' : 'bg-grey-2'">
              <div class="row items-center justify-between">
                <div class="row items-center q-gutter-sm">
                  <q-checkbox v-model="doc.activo" dense />
                  <div :class="doc.activo ? 'text-weight-medium' : 'text-grey-5'">{{ doc.nombre }} <span class="text-caption">({{ doc.formato }})</span></div>
                </div>
                <q-badge :color="doc.obligatorio ? 'red-1' : 'grey-2'" :text-color="doc.obligatorio ? 'red-9' : 'grey-7'" :label="doc.obligatorio ? 'OBLIGATORIO' : 'OPCIONAL'" />
              </div>
            </q-card>
          </div>

          <div class="text-subtitle2 q-mt-lg">Cláusulas del Documento</div>
          <div class="row q-col-gutter-sm">
            <div v-for="cl in clausulasEndoso" :key="cl.id" class="col-12">
              <q-card flat bordered :class="cl.activo ? 'bg-purple-1 border-purple' : 'bg-grey-1'">
                <q-item tag="label" v-ripple>
                  <q-item-section avatar>
                    <q-checkbox v-model="cl.activo" color="purple-6" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ cl.nombre }}</q-item-label>
                    <q-item-label caption>{{ cl.descripcion }}</q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="cl.activo">
                    <q-badge color="purple-6" label="ACTIVA" />
                  </q-item-section>
                </q-item>
              </q-card>
            </div>
          </div>
          <q-banner rounded class="bg-purple-1 text-purple-9 q-mt-lg border-purple">
            <template v-slot:avatar>
              <q-icon name="help_outline" color="purple-7" />
            </template>
            <div>
              <div class="text-weight-bold q-mb-xs">📋 Flujo del Endoso:</div>
              <div class="text-body2">
                <ol class="q-pl-md q-ma-none" style="line-height: 1.6;">
                  <li>Se ingresa el nombre del nuevo productor/beneficiario.</li>
                  <li>Se genera automáticamente el documento de endoso con las cláusulas activas.</li>
                  <li>Se imprime o descarga el documento para firmas.</li>
                  <li>Se carga el documento escaneado y firmado.</li>
                  <li>Se completa información del nuevo beneficiario y se adjuntan sus documentos.</li>
                  <li>El nuevo beneficiario hereda todos los derechos del ticket.</li>
                </ol>
              </div>
            </div>
          </q-banner>
        </div>
      </q-slide-transition>
    </q-card>

    <div class="row justify-end q-mt-xl">
      <q-btn 
        color="orange-9" 
        icon="save" 
        label="Guardar Configuración General" 
        size="lg"
        unelevated 
        :loading="loading"
        @click="guardarConfiguracion" 
      />
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="orange" />
    </q-inner-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

defineOptions({
  name: 'ConfiguracionRecepcionFacturas'
})

// --- Interfaces para eliminar los 'any' ---
interface Documento {
  id: number; nombre: string; formato: string; obligatorio: boolean;
  requiereVigencia: boolean; diasVigenciaDefault: number; aplicaPersonaFisica: boolean;
  aplicaPersonaMoral: boolean; activo: boolean;
}

interface FormatoPermitido {
  id: number;
  extension: string;
  descripcion: string;
  activo: boolean;
}

interface StatusFlujo {
  id: number; nombre: string; colorHex: string; descripcion: string;
  orden: number; activo: boolean; bloqueaPago: boolean;
}

interface ClausulaEndoso {
  id: number; nombre: string; descripcion: string; activo: boolean;
}

interface DocumentoEndoso {
  id: number; nombre: string; formato: string; obligatorio: boolean; activo: boolean;
}

type SeccionKey = '' | 'documentos' | 'validaciones' | 'financiero' | 'status' | 'persona' | 'formatos' | 'endoso'

// --- Estado ---
const seccionExpandida = ref<SeccionKey>('documentos')
const loading = ref(false)

const documentos = ref<Documento[]>([])
const statusFlujo = ref<StatusFlujo[]>([])
const clausulasEndoso = ref<ClausulaEndoso[]>([])
const documentosEndoso = ref<DocumentoEndoso[]>([])

// General
const validarRfcEnSAT = ref(false)
const diasAlertaVencimiento = ref(0)
const permitirDocumentosVencidos = ref(false)
const validarFormatoArchivos = ref(false)
const tamanoMaximoMB = ref(0)
const retencionFederal = ref(0)
const retencionISR = ref(0)
const retencionIVA = ref(0)
const aplicarRetencionAutomatica = ref(false)
const longitudRFCFisica = ref(13)
const longitudRFCMoral = ref(12)
const requiereActaMoral = ref(false)

// Endoso
const tituloEndoso = ref('')
const requiereDocumentoEscaneado = ref(false)
const requiereInformacionBeneficiario = ref(false)
const textoParrafo1 = ref('')
const textoParrafo2 = ref('')
const textoParrafo3 = ref('')
const textoParrafo4 = ref('')

const formatosPermitidos = ref<FormatoPermitido[]>([
  { id: 1, extension: '.PDF', descripcion: 'Documentos', activo: false },
  { id: 2, extension: '.XML', descripcion: 'Factura', activo: false },
  { id: 3, extension: '.JPG', descripcion: 'Imágenes', activo: false },
  { id: 4, extension: '.PNG', descripcion: 'Imágenes', activo: false }
])

// --- Carga de Datos ---
onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get('/api/ConfiguracionFacturacion')
    
    if (data && data.general) {
      // 1. Asignación de valores generales
      validarRfcEnSAT.value = data.general.validarRfcSat
      diasAlertaVencimiento.value = data.general.diasAlertaVencimiento
      permitirDocumentosVencidos.value = data.general.permitirDocsVencidos
      validarFormatoArchivos.value = data.general.validarFormatoArchivos
      tamanoMaximoMB.value = data.general.tamanoMaximoMb
      retencionFederal.value = data.general.retencionFederalPct
      retencionISR.value = data.general.retencionIsrPct
      retencionIVA.value = data.general.retencionIvaPct
      aplicarRetencionAutomatica.value = data.general.aplicarRetencionAuto
      longitudRFCFisica.value = data.general.longitudRfcFisica
      longitudRFCMoral.value = data.general.longitudRfcMoral
      requiereActaMoral.value = data.general.requiereActaMoral

      // 2. SINCRONIZACIÓN DE FORMATOS
      // Nota: Revisa en consola si el nombre es 'formatosAceptados' o 'formatos_aceptados'
      const desdeBD = data.general.formatosAceptados || ''
      console.log('Contenido de formatosAceptados desde API:', desdeBD)

      // Convertimos el string en un array limpio de extensiones
      const extensionesActivas = desdeBD
        .split(',')
        .map((s: string) => s.trim().toUpperCase())
        .filter((s: string) => s !== '')

      // Mapeamos el array completo para forzar la reactividad de los checkboxes
      formatosPermitidos.value = formatosPermitidos.value.map(f => ({
        ...f,
        activo: extensionesActivas.includes(f.extension.toUpperCase())
      }))

      // 3. Listas y Endoso
      documentos.value = data.documentos
      statusFlujo.value = data.statusFlujo
      clausulasEndoso.value = data.clausulasEndoso
      documentosEndoso.value = data.documentosEndoso

      tituloEndoso.value = data.endoso.tituloDocumento
      requiereDocumentoEscaneado.value = data.endoso.requiereEscaneado
      requiereInformacionBeneficiario.value = data.endoso.requiereInfoBeneficiario
      textoParrafo1.value = data.endoso.textoParrafo1
      textoParrafo2.value = data.endoso.textoParrafo2
      textoParrafo3.value = data.endoso.textoParrafo3
      textoParrafo4.value = data.endoso.textoParrafo4
    }
  } catch (e) {
    console.error('Error al cargar config:', e)
  } finally {
    loading.value = false
  }
})

const statusOrdenado = computed(() => [...statusFlujo.value].sort((a, b) => a.orden - b.orden))
const toggleSeccion = (s: SeccionKey) => { seccionExpandida.value = seccionExpandida.value === s ? '' : s }
const calcRet = (base: number, pct: number) => (base * (pct || 0)) / 100
const fmtMoney = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

const guardarConfiguracion = async () => {
  loading.value = true

const formatosString = formatosPermitidos.value
    .filter(f => f.activo)
    .map(f => f.extension)
    .join(',');

  const payload = {
    general: {
      id: 1,
      validarRfcSat: validarRfcEnSAT.value,
      diasAlertaVencimiento: diasAlertaVencimiento.value,
      permitirDocsVencidos: permitirDocumentosVencidos.value,
      validarFormatoArchivos: validarFormatoArchivos.value,
      tamanoMaximoMb: tamanoMaximoMB.value,
      retencionFederalPct: retencionFederal.value,
      retencionIsrPct: retencionISR.value,
      retencionIvaPct: retencionIVA.value,
      aplicarRetencionAuto: aplicarRetencionAutomatica.value,
      longitudRfcFisica: longitudRFCFisica.value,
      longitudRfcMoral: longitudRFCMoral.value,
      requiereActaMoral: requiereActaMoral.value,
      formatosAceptados: formatosString
    },
    documentos: documentos.value,
    statusFlujo: statusFlujo.value,
    endoso: {
      id: 1,
      tituloDocumento: tituloEndoso.value,
      requiereEscaneado: requiereDocumentoEscaneado.value,
      requiereInfoBeneficiario: requiereInformacionBeneficiario.value,
      textoParrafo1: textoParrafo1.value,
      textoParrafo2: textoParrafo2.value,
      textoParrafo3: textoParrafo3.value,
      textoParrafo4: textoParrafo4.value
    },
    clausulasEndoso: clausulasEndoso.value,
    documentosEndoso: documentosEndoso.value,
    formatos : formatosPermitidos.value
  }

  try {
    await api.post('/api/ConfiguracionFacturacion/guardar', payload)
    Notify.create({ type: 'positive', message: '✅ Configuración guardada' })
  } catch (e) {
    console.error(e)
    Notify.create({ type: 'negative', message: '❌ Error al guardar' })
  } finally {
    loading.value = false
  }
}

// --- Subcomponente Render Sin 'any' ---
interface RowProps { title: string; description: string; modelValue: number; }

const ConfigPercentRow = (props: RowProps, { emit }: { emit: (event: 'update:modelValue', val: number) => void }) => {
  return h('div', { class: 'q-card q-card--flat q-card--bordered bg-grey-1 q-pa-md' }, 
    h('div', { class: 'row items-center justify-between q-col-gutter-md' }, [
      h('div', { class: 'col' }, [
        h('div', { class: 'text-weight-bold text-grey-9' }, props.title),
        h('div', { class: 'text-caption text-grey-7' }, props.description)
      ]),
      h('div', { class: 'col-auto row items-center q-gutter-xs' }, [
        h('div', { class: 'text-grey-7' }, '%'),
        h('input', {
          class: 'q-field__native q-pa-sm',
          style: 'width:110px;border:1px solid #e0e0e0;border-radius:6px;text-align:right;background:#fff;',
          type: 'number', step: '0.1', value: String(props.modelValue),
          onInput: (e: Event) => emit('update:modelValue', Number((e.target as HTMLInputElement).value))
        })
      ])
    ])
  )
}
</script>

<style scoped>
.border-purple {
  border: 1px solid #9c27b0 !important;
}
.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.text-center-input :deep(input) {
  text-align: center;
}
</style>