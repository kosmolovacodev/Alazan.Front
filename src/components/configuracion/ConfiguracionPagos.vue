<template>
  <div class="q-gutter-lg">
    <div>
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">💵</div>
        <div class="text-h6">Configuración de Pagos</div>
      </div>
      <div class="text-body2 text-grey-7 q-mt-sm">
        Define estados de pago, formas de pago, topes diarios por sede, días hábiles y validaciones.
      </div>
    </div>

    <q-card bordered>
      <q-item clickable v-ripple @click="toggleSeccion('status')" class="bg-grey-1">
        <q-item-section avatar>
          <q-icon name="check_circle" color="blue-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">Status de Pago</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'status' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'status'" class="q-pa-md bg-white">
          <div class="text-caption text-grey-7 q-mb-md">
            Define los estados del flujo de pagos y su comportamiento.
          </div>

          <div class="q-gutter-sm">
            <q-card
              v-for="s in statusOrdenado"
              :key="s.id"
              flat
              bordered
              class="q-pa-md"
              :class="s.activo ? '' : 'bg-grey-2'"
            >
              <div class="row items-start q-col-gutter-md">
                <div class="col-auto">
                  <q-checkbox v-model="s.activo" />
                </div>

                <div class="col">
                  <div class="row items-center q-gutter-sm q-mb-xs">
                    <div class="status-dot" :style="{ backgroundColor: s.color }" />
                    <div :class="['text-weight-bold', s.activo ? 'text-grey-9' : 'text-grey-6']">
                      {{ s.nombre }}
                    </div>

                    <q-badge v-if="s.bloqueaEdicion" color="orange-2" text-color="orange-9" label="BLOQUEA EDICIÓN" />
                    <q-badge v-if="s.requiereAprobacion" color="purple-2" text-color="purple-9" label="REQUIERE APROBACIÓN" />
                  </div>

                  <div :class="['text-body2', s.activo ? 'text-grey-7' : 'text-grey-5']">
                    {{ s.descripcion }}
                  </div>
                </div>

                <div class="col-auto">
                  <div class="text-caption text-grey-6 text-center q-mb-xs">Orden</div>
                  <q-input
                    v-model.number="s.orden"
                    type="number"
                    dense
                    outlined
                    style="width: 80px"
                    input-class="text-center"
                    :disable="!s.activo"
                    :min="1"
                  />
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </q-slide-transition>
    </q-card>

    <q-card bordered>
      <q-item clickable v-ripple @click="toggleSeccion('formasPago')" class="bg-grey-1">
        <q-item-section avatar>
          <q-icon name="credit_card" color="green-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">Formas de Pago</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'formasPago' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'formasPago'" class="q-pa-md bg-white">
          <div class="text-caption text-grey-7 q-mb-md">
            Define los métodos de pago disponibles para los productores.
          </div>

          <div class="row q-col-gutter-md">
            <div v-for="f in formasPago" :key="f.id" class="col-12 col-md-6">
              <q-card flat bordered class="q-pa-md" :class="f.activo ? '' : 'bg-grey-2'">
                <div class="row items-start justify-between q-mb-sm">
                  <div class="row items-center q-gutter-sm">
                    <q-checkbox v-model="f.activo" />
                    <div>
                      <div :class="['text-weight-bold', f.activo ? 'text-grey-9' : 'text-grey-6']">
                        {{ f.nombre }}
                      </div>
                      <div class="text-caption text-grey-6">Código: {{ f.codigo }}</div>
                    </div>
                  </div>
                  <q-badge v-if="f.activo" color="green-2" text-color="green-9" label="ACTIVO" />
                </div>

                <div class="q-gutter-sm">
                  <q-checkbox
                    v-model="f.requiereCLABE"
                    :disable="!f.activo"
                    label="Requiere CLABE"
                  />
                  <q-checkbox
                    v-model="f.requiereCuenta"
                    :disable="!f.activo"
                    label="Requiere Cuenta"
                  />
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </q-slide-transition>
    </q-card>

    <q-card bordered>
      <q-item clickable v-ripple @click="toggleSeccion('topes')" class="bg-grey-1">
        <q-item-section avatar>
          <q-icon name="attach_money" color="teal-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">Topes Diarios por Sede</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'topes' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'topes'" class="q-pa-md bg-white">
          <div class="text-caption text-grey-7 q-mb-md">
            Establece el tope diario de solicitudes de pago por cada sede.
          </div>

          <div class="q-gutter-sm">
            <q-card
              v-for="t in topesSede"
              :key="t.id"
              flat
              bordered
              class="q-pa-md"
              :class="t.activo ? '' : 'bg-grey-2'"
            >
              <div class="row items-center justify-between q-col-gutter-md">
                <div class="col">
                  <div class="row items-center q-gutter-sm">
                    <q-checkbox v-model="t.activo" />
                    <div>
                      <div :class="['text-weight-bold', t.activo ? 'text-grey-9' : 'text-grey-6']">
                        {{ t.nombreSede }}
                      </div>
                      <div :class="['text-caption', t.activo ? 'text-grey-7' : 'text-grey-5']">
                        {{ t.ciudad }}, {{ t.estado }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-auto">
                  <div class="text-caption text-grey-6 text-right q-mb-xs">Tope Diario</div>
                  <div class="row items-center q-gutter-xs">
                    <div class="text-grey-7">$</div>
                    <q-input
                      v-model.number="t.topeDiario"
                      type="number"
                      dense
                      outlined
                      style="width: 160px"
                      input-class="text-right"
                      :disable="!t.activo"
                    />
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </q-slide-transition>
    </q-card>

    <q-card bordered>
      <q-item clickable v-ripple @click="toggleSeccion('horarios')" class="bg-grey-1">
        <q-item-section avatar>
          <q-icon name="event" color="purple-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">Días Hábiles y Horarios</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'horarios' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'horarios'" class="q-pa-md bg-white q-gutter-md">
          <div>
            <div class="text-weight-bold text-grey-9 q-mb-sm">Días Hábiles para Solicitud</div>
            <div class="row q-col-gutter-sm">
              <div v-for="d in diasHabiles" :key="d.id" class="col">
                <q-btn
                  unelevated
                  class="full-width"
                  :color="d.activo ? 'green-2' : 'grey-3'"
                  :text-color="d.activo ? 'green-9' : 'grey-7'"
                  @click="d.activo = !d.activo"
                  :label="d.dia.substring(0, 3)"
                />
              </div>
            </div>
          </div>

          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col">
                <div class="text-weight-bold text-grey-9">Horario Límite para Solicitud</div>
                <div class="text-caption text-grey-7">Hora límite para enviar solicitudes en el día</div>
              </div>
              <div class="col-auto">
                <q-input v-model="configGeneral.horarioLimiteSolicitud" type="time" dense outlined style="width: 140px" />
              </div>
            </div>
          </q-card>

          <q-card flat bordered class="bg-grey-1 q-pa-md">
            <div class="row items-center justify-between">
              <div>
                <div class="text-weight-bold text-grey-9">Alertar Días Festivos</div>
                <div class="text-caption text-grey-7">Mostrar advertencia en días no laborables</div>
              </div>
              <q-toggle v-model="configGeneral.alertaDiasFestivos" color="purple-6" />
            </div>
          </q-card>
        </div>
      </q-slide-transition>
    </q-card>

    <q-card bordered>
      <q-item clickable v-ripple @click="toggleSeccion('tiempos')" class="bg-grey-1">
        <q-item-section avatar>
          <q-icon name="schedule" color="orange-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">Tiempos del Proceso</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'tiempos' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <q-slide-transition>
        <div v-show="seccionExpandida === 'tiempos'" class="q-pa-md bg-white q-gutter-md">
          <div class="row items-center justify-between">
             <div>
                <div class="text-weight-bold">Días para Autorización</div>
                <div class="text-caption text-grey-7">Tiempo estimado para autorizar un pago</div>
             </div>
             <q-input v-model.number="configGeneral.diasAutorizacion" type="number" dense outlined suffix="días" style="width: 120px" />
          </div>

          <div class="row items-center justify-between">
             <div>
                <div class="text-weight-bold">Días para Ejecución</div>
                <div class="text-caption text-grey-7">Tiempo estimado para ejecutar el pago</div>
             </div>
             <q-input v-model.number="configGeneral.diasEjecucion" type="number" dense outlined suffix="días" style="width: 120px" />
          </div>

          <div class="row items-center justify-between">
             <div>
                <div class="text-weight-bold">Alerta por Vencimiento</div>
                <div class="text-caption text-grey-7">Días antes para mostrar alerta</div>
             </div>
             <q-input v-model.number="configGeneral.diasAlertaVencimiento" type="number" dense outlined suffix="días" style="width: 120px" />
          </div>

          <div class="q-mt-md q-pa-md bg-orange-1 border-orange rounded-borders">
  <p class="text-orange-10 q-mb-none">
    <strong>⏱️ Flujo Estimado:</strong>
    Solicitud 
    <q-icon name="arrow_forward" size="xs" /> 
    <span class="text-weight-bold">{{ configGeneral.diasAutorizacion }}</span> día(s) 
    <q-icon name="arrow_forward" size="xs" /> 
    Autorización 
    <q-icon name="arrow_forward" size="xs" /> 
    <span class="text-weight-bold">{{ configGeneral.diasEjecucion }}</span> día(s) 
    <q-icon name="arrow_forward" size="xs" /> 
    Pago Ejecutado
  </p>
</div>

        </div>
      </q-slide-transition>
    </q-card>

    <q-card bordered>
      <q-item clickable v-ripple @click="toggleSeccion('validaciones')" class="bg-grey-1">
        <q-item-section avatar>
          <q-icon name="verified" color="red-6" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-subtitle1">Validaciones y Requisitos</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="seccionExpandida === 'validaciones' ? 'expand_less' : 'chevron_right'" color="grey-7" />
        </q-item-section>
      </q-item>

      <q-separator />

      <div v-show="seccionExpandida === 'validaciones'" class="q-pa-sm bg-white">
  <q-list separator>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>Validar Topes Diarios</q-item-label>
        <q-item-label caption>Bloquear solicitudes que excedan el tope diario de la sede</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="configGeneral.validarTopesDiarios" color="red-6" />
      </q-item-section>
    </q-item>

    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>Validar Días Hábiles</q-item-label>
        <q-item-label caption>Bloquear solicitudes en días no hábiles</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="configGeneral.validarDiasHabiles" color="red-6" />
      </q-item-section>
    </q-item>

    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>Validar Horario Límite</q-item-label>
        <q-item-label caption>Bloquear solicitudes después del horario límite</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="configGeneral.validarHorarioLimite" color="red-6" />
      </q-item-section>
    </q-item>

    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>Requiere Folio de Pago</q-item-label>
        <q-item-label caption>Obligatorio capturar el folio al registrar el pago</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="configGeneral.requiereFolioPago" color="red-6" />
      </q-item-section>
    </q-item>

    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>Requiere Comprobante de Pago</q-item-label>
        <q-item-label caption>Obligatorio adjuntar el archivo del comprobante ejecutado</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="configGeneral.requiereComprobantePago" color="red-6" />
      </q-item-section>
    </q-item>

    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-item-label>Permitir Pago Parcial</q-item-label>
        <q-item-label caption>Permite pagar montos menores al total de la factura</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-toggle v-model="configGeneral.permitirPagoParcial" color="red-6" />
      </q-item-section>
    </q-item>
  </q-list>

  <q-card flat bordered class="bg-grey-1 q-pa-md q-mt-sm">
    <div class="row items-center justify-between">
      <div class="col">
        <div class="text-weight-bold">Monto Mínimo de Pago</div>
        <div class="text-caption text-grey-7">Monto mínimo permitido para procesar un pago</div>
      </div>
      <div class="col-auto">
        <q-input 
          v-model.number="configGeneral.montoMinimoPago" 
          type="number" 
          dense 
          outlined 
          prefix="$" 
          style="width: 140px" 
        />
      </div>
    </div>
  </q-card>
</div>
    </q-card>

    <div class="row justify-end q-pt-md">
      <q-btn color="orange" icon="save" label="Guardar Configuración" unelevated @click="guardarConfiguracion" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios' // Asegúrate de tener configurado axios

const $q = useQuasar()

// --- INTERFACES ---
interface Sede {
  id: number
  nombreSede: string // Mapeado del backend (nombre_sede)
  ciudad: string
  estado: string
  topeDiario: number // Mapeado del backend (tope_diario)
  activo: boolean    // Mapeado del backend (permite_pagos)
}

interface StatusPago {
  id: number
  nombre: string
  color: string
  descripcion: string
  orden: number
  activo: boolean
  bloqueaEdicion: boolean
  requiereAprobacion: boolean
}

interface FormaPago {
  id: number
  nombre: string
  codigo: string
  activo: boolean
  requiereCLABE: boolean
  requiereCuenta: boolean
}

interface DiaHabil {
  id: number
  dia: string
  activo: boolean
}

// Interfaz para el objeto de configuración general (Tabla Configuracion_Pagos_General)
interface ConfigGeneral {
  horarioLimiteSolicitud: string
  alertaDiasFestivos: boolean
  diasAutorizacion: number
  diasEjecucion: number
  diasAlertaVencimiento: number
  validarTopesDiarios: boolean
  validarDiasHabiles: boolean
  validarHorarioLimite: boolean
  requiereFolioPago: boolean
  requiereComprobantePago: boolean
  permitirPagoParcial: boolean
  montoMinimoPago: number
}

type SeccionKey = '' | 'status' | 'formasPago' | 'topes' | 'horarios' | 'tiempos' | 'validaciones'

// --- ESTADO ---
const seccionExpandida = ref<SeccionKey>('status')
const cargando = ref(false)

// Data Refs
const statusPagos = ref<StatusPago[]>([])
const formasPago = ref<FormaPago[]>([])
const topesSede = ref<Sede[]>([])
const diasHabiles = ref<DiaHabil[]>([])

// Objeto unificado para las secciones 4, 5 y 6
const configGeneral = ref<ConfigGeneral>({
  horarioLimiteSolicitud: '14:00',
  alertaDiasFestivos: true,
  diasAutorizacion: 1,
  diasEjecucion: 2,
  diasAlertaVencimiento: 3,
  validarTopesDiarios: true,
  validarDiasHabiles: true,
  validarHorarioLimite: true,
  requiereFolioPago: true,
  requiereComprobantePago: true,
  permitirPagoParcial: false,
  montoMinimoPago: 100
})

const statusOrdenado = computed(() => [...statusPagos.value].sort((a, b) => a.orden - b.orden))

// --- MÉTODOS DE API ---

const cargarConfiguracion = async () => {
  cargando.value = true
  try {
    // Llamada al endpoint de .NET
    const { data } = await api.get('/api/ConfiguracionPagos')
    
    // Asignación de datos desde el DTO del backend
    statusPagos.value = data.status
    formasPago.value = data.formasPago
    topesSede.value = data.topesSede
    diasHabiles.value = data.diasHabiles
    configGeneral.value = data.general
    
  } catch (error) {
    console.error('Error al cargar configuración:', error)
    $q.notify({ type: 'negative', message: 'Error al conectar con el servidor' })
  } finally {
    cargando.value = false
  }
}

const guardarConfiguracion = async () => {
  $q.loading.show({ message: 'Guardando cambios...' })
  
  try {
    // Construimos el objeto igual al ConfiguracionPagosDto de C#
    const payload = {
      general: configGeneral.value,
      status: statusPagos.value,
      formasPago: formasPago.value,
      diasHabiles: diasHabiles.value,
      topesSede: topesSede.value
    }

    await api.post('/api/ConfiguracionPagos/guardar', payload)
    
    $q.notify({
      type: 'positive',
      message: '✅ Configuración de Pagos guardada correctamente'
    })
  } catch (error) {
    console.error('Error al guardar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al persistir los cambios en la base de datos'
    })
  } finally {
    $q.loading.hide()
  }
}

// --- LOGICA DE UI ---

function toggleSeccion(seccion: SeccionKey) {
  seccionExpandida.value = seccionExpandida.value === seccion ? '' : seccion
}

onMounted(async () => {
  await cargarConfiguracion()
})
</script>

<style scoped>
.status-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
}
</style>
