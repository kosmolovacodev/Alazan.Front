<!-- src/app/components/ConfiguracionRecepcionFacturas.vue -->
<template>
  <div class="q-gutter-lg">
    <!-- Header -->
    <div>
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">📄</div>
        <div class="text-h6">Configuración de Recepción de Facturas</div>
      </div>
      <div class="text-body2 text-grey-7 q-mt-sm">
        Define documentos requeridos, validaciones automáticas, parámetros financieros y status del
        flujo de facturación.
      </div>
    </div>

    <!-- SECCIÓN 1: DOCUMENTOS -->
    <q-card bordered>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('documentos')">
        <q-item-section avatar>
          <q-icon name="description" color="orange-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">Documentos Requeridos del Expediente</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon
            :name="seccionExpandida === 'documentos' ? 'expand_less' : 'chevron_right'"
            color="grey-7"
          />
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
                <th class="text-left">Activo</th>
                <th class="text-left">Documento</th>
                <th class="text-left">Formato</th>
                <th class="text-center">Obligatorio</th>
                <th class="text-center">Vigencia (días)</th>
                <th class="text-center">P. Física</th>
                <th class="text-center">P. Moral</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="doc in documentos" :key="doc.id">
                <td class="text-center">
                  <q-checkbox
                    v-model="doc.activo"
                    dense
                    @update:model-value="() => toggleDocumentoActivo(doc.id)"
                  />
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
                  <span v-if="doc.obligatorio" class="text-negative text-weight-bold">SÍ</span>
                  <span v-else class="text-grey-5">NO</span>
                </td>

                <td class="text-center">
                  <template v-if="doc.requiereVigencia">
                    <q-input
                      v-model.number="doc.diasVigencia"
                      type="number"
                      dense
                      outlined
                      style="width: 90px"
                      input-class="text-center"
                      :disable="!doc.activo"
                      :min="0"
                      @update:model-value="(v) => onChangeDiasVigencia(doc.id, v)"
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
                    @update:model-value="() => toggleAplicaFisica(doc.id)"
                  />
                </td>

                <td class="text-center">
                  <q-checkbox
                    v-model="doc.aplicaPersonaMoral"
                    dense
                    :disable="!doc.activo"
                    @update:model-value="() => toggleAplicaMoral(doc.id)"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>

          <q-banner rounded class="bg-blue-1 text-blue-10 q-mt-md">
            <div class="text-body2">
              <span class="text-weight-bold">💡 Nota:</span>
              Los documentos marcados como obligatorios bloquearán el avance del flujo hasta que
              sean adjuntados.
            </div>
          </q-banner>
        </div>
      </q-slide-transition>
    </q-card>

    <!-- SECCIÓN 2: VALIDACIONES -->
    <q-card bordered>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('validaciones')">
        <q-item-section avatar>
          <q-icon name="verified_user" color="blue-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">Validaciones Automáticas</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon
            :name="seccionExpandida === 'validaciones' ? 'expand_less' : 'chevron_right'"
            color="grey-7"
          />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'validaciones'" class="q-pa-md bg-white q-gutter-md">
          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between">
              <div>
                <div class="text-weight-bold text-grey-9">Validar RFC en Portal del SAT</div>
                <div class="text-caption text-grey-7">
                  Verifica automáticamente que el RFC exista en el padrón del SAT
                </div>
              </div>
              <q-toggle v-model="validarRfcEnSAT" color="blue-6" />
            </div>
          </q-card>

          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col">
                <div class="text-weight-bold text-grey-9">Días de Alerta por Vencimiento</div>
                <div class="text-caption text-grey-7">
                  Alertar cuando un documento esté próximo a vencer (días antes)
                </div>
              </div>
              <div class="col-auto">
                <q-input
                  v-model.number="diasAlertaVencimiento"
                  type="number"
                  dense
                  outlined
                  style="width: 110px"
                  input-class="text-center"
                  :min="1"
                  :max="30"
                />
              </div>
            </div>
          </q-card>

          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between">
              <div>
                <div class="text-weight-bold text-grey-9">Permitir Documentos Vencidos</div>
                <div class="text-caption text-grey-7">
                  Permite guardar el expediente aunque los documentos estén vencidos (no
                  recomendado)
                </div>
              </div>
              <q-toggle v-model="permitirDocumentosVencidos" color="blue-6" />
            </div>
          </q-card>

          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between">
              <div>
                <div class="text-weight-bold text-grey-9">Validar Formato de Archivos</div>
                <div class="text-caption text-grey-7">
                  Rechaza archivos que no cumplan con las extensiones permitidas
                </div>
              </div>
              <q-toggle v-model="validarFormatoArchivos" color="blue-6" />
            </div>
          </q-card>

          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col">
                <div class="text-weight-bold text-grey-9">Tamaño Máximo de Archivos (MB)</div>
                <div class="text-caption text-grey-7">Límite de peso por archivo adjunto</div>
              </div>
              <div class="col-auto">
                <q-input
                  v-model.number="tamanoMaximoMB"
                  type="number"
                  dense
                  outlined
                  style="width: 110px"
                  input-class="text-center"
                  :min="1"
                  :max="50"
                />
              </div>
            </div>
          </q-card>
        </div>
      </q-slide-transition>
    </q-card>

    <!-- SECCIÓN 3: FINANCIERO -->
    <q-card bordered>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('financiero')">
        <q-item-section avatar>
          <q-icon name="attach_money" color="green-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">Parámetros Financieros</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon
            :name="seccionExpandida === 'financiero' ? 'expand_less' : 'chevron_right'"
            color="grey-7"
          />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'financiero'" class="q-pa-md bg-white q-gutter-md">
          <ConfigPercentRow
            title="Retención Federal (%)"
            description="Porcentaje de retención federal sobre el importe total"
            v-model="retencionFederal"
          />
          <ConfigPercentRow
            title="Retención ISR (%)"
            description="Porcentaje de retención de ISR sobre el importe total"
            v-model="retencionISR"
          />
          <ConfigPercentRow
            title="Retención IVA (%)"
            description="Porcentaje de retención de IVA sobre el importe total"
            v-model="retencionIVA"
          />

          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between">
              <div>
                <div class="text-weight-bold text-grey-9">Aplicar Retenciones Automáticamente</div>
                <div class="text-caption text-grey-7">
                  Calcula y aplica las retenciones al generar la pre-liquidación
                </div>
              </div>
              <q-toggle v-model="aplicarRetencionAutomatica" color="blue-6" />
            </div>
          </q-card>

          <q-banner rounded class="bg-green-1 text-green-10">
            <div class="text-body2 text-weight-bold q-mb-xs">📊 Ejemplo de Cálculo</div>
            <div class="text-body2 q-gutter-xs">
              <div>• Importe: {{ fmtMoney(100000) }}</div>
              <div>
                • Retención Federal ({{ retencionFederal }}%):
                {{ fmtMoney(calcRet(100000, retencionFederal)) }}
              </div>
              <div>
                • Retención ISR ({{ retencionISR }}%): {{ fmtMoney(calcRet(100000, retencionISR)) }}
              </div>
              <div>
                • Retención IVA ({{ retencionIVA }}%): {{ fmtMoney(calcRet(100000, retencionIVA)) }}
              </div>
              <div class="q-mt-sm text-weight-bold">
                • Total a Pagar:
                {{
                  fmtMoney(100000 - calcRet(100000, retencionFederal + retencionISR + retencionIVA))
                }}
              </div>
            </div>
          </q-banner>
        </div>
      </q-slide-transition>
    </q-card>

    <!-- SECCIÓN 4: STATUS -->
    <q-card bordered>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('status')">
        <q-item-section avatar>
          <q-icon name="fact_check" color="purple-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">Status del Flujo de Facturación</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon
            :name="seccionExpandida === 'status' ? 'expand_less' : 'chevron_right'"
            color="grey-7"
          />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'status'" class="q-pa-md bg-white">
          <div class="text-caption text-grey-7 q-mb-md">
            Define los status que aparecerán en el flujo de facturación y su orden de aparición.
          </div>

          <div class="q-gutter-sm">
            <q-card
              v-for="st in statusOrdenado"
              :key="st.id"
              flat
              bordered
              class="q-pa-md"
              :class="st.activo ? '' : 'bg-grey-2'"
            >
              <div class="row items-start q-col-gutter-md">
                <div class="col-auto">
                  <q-checkbox
                    v-model="st.activo"
                    dense
                    @update:model-value="() => toggleStatusActivo(st.id)"
                  />
                </div>

                <div class="col">
                  <div class="row items-center q-gutter-sm q-mb-xs">
                    <div class="status-dot" :style="{ backgroundColor: st.color }" />
                    <div :class="['text-weight-bold', st.activo ? 'text-grey-9' : 'text-grey-6']">
                      {{ st.nombre }}
                    </div>
                    <q-badge
                      v-if="st.bloqueaPago"
                      color="red-2"
                      text-color="red-9"
                      label="BLOQUEA PAGO"
                    />
                  </div>

                  <div :class="['text-body2', st.activo ? 'text-grey-7' : 'text-grey-5']">
                    {{ st.descripcion }}
                  </div>
                </div>

                <div class="col-auto">
                  <div class="text-caption text-grey-6 text-center q-mb-xs">Orden</div>
                  <q-input
                    v-model.number="st.orden"
                    type="number"
                    dense
                    outlined
                    style="width: 90px"
                    input-class="text-center"
                    :disable="!st.activo"
                    :min="1"
                    @update:model-value="(v) => onChangeOrdenStatus(st.id, v)"
                  />
                </div>
              </div>
            </q-card>
          </div>

          <q-banner rounded class="bg-purple-1 text-purple-10 q-mt-md">
            <div class="text-body2">
              <span class="text-weight-bold">💡 Nota:</span>
              Los status marcados como “BLOQUEA PAGO” impedirán que se solicite el pago hasta que se
              complete el requisito correspondiente.
            </div>
          </q-banner>
        </div>
      </q-slide-transition>
    </q-card>

    <!-- SECCIÓN 5: REGLAS PERSONA -->
    <q-card bordered>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('persona')">
        <q-item-section avatar>
          <q-icon name="warning_amber" color="yellow-8" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">Reglas por Tipo de Persona</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon
            :name="seccionExpandida === 'persona' ? 'expand_less' : 'chevron_right'"
            color="grey-7"
          />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'persona'" class="q-pa-md bg-white q-gutter-md">
          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col">
                <div class="text-weight-bold text-grey-9">Longitud RFC Persona Física</div>
                <div class="text-caption text-grey-7">
                  Número de caracteres del RFC para personas físicas (ej: PEGJ850101ABC = 13)
                </div>
              </div>
              <div class="col-auto">
                <q-input
                  v-model.number="longitudRFCFisica"
                  type="number"
                  dense
                  outlined
                  style="width: 110px"
                  input-class="text-center"
                  :min="12"
                  :max="14"
                />
              </div>
            </div>
          </q-card>

          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col">
                <div class="text-weight-bold text-grey-9">Longitud RFC Persona Moral</div>
                <div class="text-caption text-grey-7">
                  Número de caracteres del RFC para personas morales (ej: AGR123456ABC = 12)
                </div>
              </div>
              <div class="col-auto">
                <q-input
                  v-model.number="longitudRFCMoral"
                  type="number"
                  dense
                  outlined
                  style="width: 110px"
                  input-class="text-center"
                  :min="11"
                  :max="13"
                />
              </div>
            </div>
          </q-card>

          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between">
              <div>
                <div class="text-weight-bold text-grey-9">
                  Requiere Acta Constitutiva (Persona Moral)
                </div>
                <div class="text-caption text-grey-7">
                  Solicitar Acta Constitutiva para personas morales
                </div>
              </div>
              <q-toggle v-model="requiereActaMoral" color="blue-6" />
            </div>
          </q-card>

          <q-banner rounded class="bg-yellow-1 text-brown-10">
            <div class="text-body2">
              <span class="text-weight-bold">⚠️ Importante:</span>
              El sistema identifica automáticamente el tipo de persona según la longitud del RFC.
            </div>
          </q-banner>
        </div>
      </q-slide-transition>
    </q-card>

    <!-- SECCIÓN 6: FORMATOS -->
    <q-card bordered>
      <q-item clickable v-ripple class="bg-grey-1" @click="toggleSeccion('formatos')">
        <q-item-section avatar>
          <q-icon name="folder" color="indigo-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">Formatos de Archivo Permitidos</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon
            :name="seccionExpandida === 'formatos' ? 'expand_less' : 'chevron_right'"
            color="grey-7"
          />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'formatos'" class="q-pa-md bg-white">
          <div class="text-caption text-grey-7 q-mb-md">
            Define qué extensiones de archivo estarán permitidas al adjuntar documentos.
          </div>

          <div class="row q-col-gutter-md">
            <div v-for="f in formatosPermitidos" :key="f.id" class="col-12 col-md-6">
              <q-card flat bordered class="q-pa-md" :class="f.activo ? '' : 'bg-grey-2'">
                <div class="row items-center justify-between">
                  <div class="row items-center q-gutter-sm">
                    <q-checkbox
                      v-model="f.activo"
                      dense
                      @update:model-value="() => toggleFormatoActivo(f.id)"
                    />
                    <div>
                      <div :class="['text-weight-bold', f.activo ? 'text-grey-9' : 'text-grey-6']">
                        {{ f.extension }}
                      </div>
                      <div :class="['text-caption', f.activo ? 'text-grey-7' : 'text-grey-5']">
                        {{ f.descripcion }}
                      </div>
                    </div>
                  </div>

                  <q-badge v-if="f.activo" color="green-2" text-color="green-9" label="ACTIVO" />
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </q-slide-transition>
    </q-card>

    <!-- Guardar -->
    <div class="row justify-end q-pt-md" style="border-top: 1px solid #e0e0e0">
      <q-btn
        color="orange"
        icon="save"
        label="Guardar Configuración"
        unelevated
        @click="guardarConfiguracion"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Subcomponente "ConfigPercentRow" (inline, sin JSX)
 * Nota: en Vue SFC no podemos declarar template para subcomponentes dentro del mismo archivo.
 * Para evitar multi-archivo, lo resolvemos con un "render" simple usando h().
 * Si NO quieres render function, te lo dejo sin subcomponente y duplico 3 filas.
 */
import { h } from 'vue';

const ConfigPercentRow = defineComponent({
  name: 'ConfigPercentRow',
  props: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    modelValue: { type: Number, required: true },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(
        'div',
        {},
        h(
          'div',
          { class: 'q-card q-card--flat q-card--bordered bg-grey-1 q-pa-md' },
          h('div', { class: 'row items-center justify-between q-col-gutter-md' }, [
            h('div', { class: 'col' }, [
              h('div', { class: 'text-weight-bold text-grey-9' }, props.title),
              h('div', { class: 'text-caption text-grey-7' }, props.description),
            ]),
            h('div', { class: 'col-auto row items-center q-gutter-xs' }, [
              h('div', { class: 'text-grey-7' }, '%'),
              h('input', {
                class: 'q-field__native q-pa-sm',
                style:
                  'width:110px;border:1px solid #e0e0e0;border-radius:6px;text-align:right;background:#fff;',
                type: 'number',
                step: '0.1',
                min: '0',
                max: '100',
                value: String(props.modelValue),
                onInput: (e: Event) => {
                  const v = Number((e.target as HTMLInputElement).value);
                  emit('update:modelValue', Number.isFinite(v) ? v : 0);
                },
              }),
            ]),
          ]),
        ),
      );
  },
});

import { computed, ref } from 'vue';
import { Notify } from 'quasar';

type SeccionKey =
  | ''
  | 'documentos'
  | 'validaciones'
  | 'financiero'
  | 'status'
  | 'persona'
  | 'formatos';

interface Documento {
  id: number;
  nombre: string;
  formato: string;
  obligatorio: boolean;
  requiereVigencia: boolean;
  diasVigencia: number;
  aplicaPersonaFisica: boolean;
  aplicaPersonaMoral: boolean;
  activo: boolean;
}

interface StatusFlujo {
  id: number;
  nombre: string;
  color: string;
  descripcion: string;
  orden: number;
  activo: boolean;
  bloqueaPago: boolean;
}

interface FormatoPermitido {
  id: number;
  extension: string;
  descripcion: string;
  activo: boolean;
}

/** Estado UI */
const seccionExpandida = ref<SeccionKey>('documentos');

/** 📄 Documentos requeridos */
const documentos = ref<Documento[]>([
  {
    id: 1,
    nombre: 'Identificación Oficial',
    formato: '.PDF',
    obligatorio: true,
    requiereVigencia: false,
    diasVigencia: 0,
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Constancia de Situación Fiscal',
    formato: '.PDF',
    obligatorio: true,
    requiereVigencia: true,
    diasVigencia: 30,
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true,
    activo: true,
  },
  {
    id: 3,
    nombre: 'Opinión de Cumplimiento de Obligaciones Fiscales',
    formato: '.PDF',
    obligatorio: true,
    requiereVigencia: true,
    diasVigencia: 30,
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true,
    activo: true,
  },
  {
    id: 4,
    nombre: 'Acta Constitutiva',
    formato: '.PDF',
    obligatorio: true,
    requiereVigencia: false,
    diasVigencia: 0,
    aplicaPersonaFisica: false,
    aplicaPersonaMoral: true,
    activo: true,
  },
  {
    id: 5,
    nombre: 'Factura XML del Productor',
    formato: '.XML',
    obligatorio: true,
    requiereVigencia: false,
    diasVigencia: 0,
    aplicaPersonaFisica: true,
    aplicaPersonaMoral: true,
    activo: true,
  },
]);

/** 🔐 Validaciones */
const validarRfcEnSAT = ref(false);
const diasAlertaVencimiento = ref(7);
const permitirDocumentosVencidos = ref(false);
const validarFormatoArchivos = ref(true);
const tamanoMaximoMB = ref(10);

/** 💰 Parámetros financieros */
const retencionFederal = ref(1.3);
const retencionISR = ref(0);
const retencionIVA = ref(0);
const aplicarRetencionAutomatica = ref(true);

/** 📊 Status flujo */
const statusFlujo = ref<StatusFlujo[]>([
  {
    id: 1,
    nombre: 'PENDIENTE RFC',
    color: '#DC2626',
    descripcion: 'Productor nuevo sin RFC capturado',
    orden: 1,
    activo: true,
    bloqueaPago: true,
  },
  {
    id: 2,
    nombre: 'PENDIENTE DOCUMENTOS',
    color: '#D97706',
    descripcion: 'RFC capturado, faltan documentos del expediente',
    orden: 2,
    activo: true,
    bloqueaPago: true,
  },
  {
    id: 3,
    nombre: 'PENDIENTE FACTURA XML',
    color: '#F59E0B',
    descripcion: 'Documentos completos, falta XML de factura',
    orden: 3,
    activo: true,
    bloqueaPago: true,
  },
  {
    id: 4,
    nombre: 'LISTO PARA SOLICITAR PAGO',
    color: '#16A34A',
    descripcion: 'Todo completo (RFC + Documentos + XML)',
    orden: 4,
    activo: true,
    bloqueaPago: false,
  },
]);

const statusOrdenado = computed(() => [...statusFlujo.value].sort((a, b) => a.orden - b.orden));

/** 👤 Reglas persona */
const longitudRFCFisica = ref(13);
const longitudRFCMoral = ref(12);
const requiereActaMoral = ref(true);

/** 📝 Formatos permitidos */
const formatosPermitidos = ref<FormatoPermitido[]>([
  { id: 1, extension: '.PDF', descripcion: 'Documentos del expediente', activo: true },
  { id: 2, extension: '.XML', descripcion: 'Factura electrónica', activo: true },
  { id: 3, extension: '.JPG', descripcion: 'Imágenes de documentos', activo: false },
  { id: 4, extension: '.PNG', descripcion: 'Imágenes de documentos', activo: false },
]);

/** UI */
function toggleSeccion(seccion: SeccionKey) {
  seccionExpandida.value = seccionExpandida.value === seccion ? '' : seccion;
}

/** Updates (manteniendo el mismo comportamiento del TSX: toggles por id) */
function toggleDocumentoActivo(id: number) {
  documentos.value = documentos.value.map((d) => (d.id === id ? { ...d, activo: !d.activo } : d));
}
function onChangeDiasVigencia(id: number, v: unknown) {
  const n = Number(v);
  documentos.value = documentos.value.map((d) =>
    d.id === id ? { ...d, diasVigencia: Number.isFinite(n) ? n : 0 } : d,
  );
}
function toggleAplicaFisica(id: number) {
  documentos.value = documentos.value.map((d) =>
    d.id === id ? { ...d, aplicaPersonaFisica: !d.aplicaPersonaFisica } : d,
  );
}
function toggleAplicaMoral(id: number) {
  documentos.value = documentos.value.map((d) =>
    d.id === id ? { ...d, aplicaPersonaMoral: !d.aplicaPersonaMoral } : d,
  );
}
function toggleFormatoActivo(id: number) {
  formatosPermitidos.value = formatosPermitidos.value.map((f) =>
    f.id === id ? { ...f, activo: !f.activo } : f,
  );
}
function toggleStatusActivo(id: number) {
  statusFlujo.value = statusFlujo.value.map((s) => (s.id === id ? { ...s, activo: !s.activo } : s));
}
function onChangeOrdenStatus(id: number, v: unknown) {
  const n = Number(v);
  statusFlujo.value = statusFlujo.value.map((s) =>
    s.id === id ? { ...s, orden: Number.isFinite(n) ? n : 1 } : s,
  );
}

/** Guardar (mismo scope que TSX: console + confirmación) */
function guardarConfiguracion() {
  console.log('Guardando configuración de Recepción de Facturas:', {
    documentos: documentos.value,
    validaciones: {
      validarRfcEnSAT: validarRfcEnSAT.value,
      diasAlertaVencimiento: diasAlertaVencimiento.value,
      permitirDocumentosVencidos: permitirDocumentosVencidos.value,
      validarFormatoArchivos: validarFormatoArchivos.value,
      tamanoMaximoMB: tamanoMaximoMB.value,
    },
    parametrosFinancieros: {
      retencionFederal: retencionFederal.value,
      retencionISR: retencionISR.value,
      retencionIVA: retencionIVA.value,
      aplicarRetencionAutomatica: aplicarRetencionAutomatica.value,
    },
    statusFlujo: statusFlujo.value,
    reglasPersona: {
      longitudRFCFisica: longitudRFCFisica.value,
      longitudRFCMoral: longitudRFCMoral.value,
      requiereActaMoral: requiereActaMoral.value,
    },
    formatosPermitidos: formatosPermitidos.value,
  });

  Notify.create({
    type: 'positive',
    message: '✅ Configuración de Recepción de Facturas guardada correctamente',
  });
}

/** Helpers de formato */
function calcRet(importe: number, pct: number): number {
  return (importe * pct) / 100;
}
function fmtMoney(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
</script>

<script lang="ts">
/**
 * Subcomponente local SIN JSX (template inline) para filas %.
 * Se declara aquí para no generar archivo adicional.
 */
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ConfiguracionRecepcionFacturas',
});
</script>

<style scoped>
.status-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
}
</style>
