<template>
  <q-page padding>
    <div class="row items-center q-mb-md q-gutter-sm">
      <div class="col">
        <div class="text-h5 text-primary text-weight-bolder">Registro de Orden de Producción MBA3</div>
        <div class="text-caption text-grey-8">Endpoint: {{ MBA3_BASE_URL }}/mba3api/ordenes_produccion</div>
      </div>
      <q-chip :color="tokenColor" text-color="white" :icon="tokenIcon" :label="tokenLabel" />
      <q-btn outline size="sm" color="orange" icon="refresh" label="Renovar Token" :loading="refreshing" @click="forzarNuevoToken" />
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        
        <q-card flat bordered class="q-mb-md shadow-2">
          <q-card-section class="bg-primary text-white q-py-xs">
            <div class="text-subtitle2">1. Información de Control e Identificación</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-select v-model="form.operacion" :options="opcionesOperacion" option-value="value" option-label="label" emit-value map-options dense outlined label="Operación *" />
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model="form.codigo_empresa" dense outlined label="Empresa" readonly />
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model="form.codigo_sucursal" dense outlined label="Sucursal *" />
            </div>
            <div class="col-6 col-sm-4">
              <q-input v-model.number="form.numero_orden" dense outlined type="number" label="N° Orden *" />
            </div>
            <div class="col-6 col-sm-4">
              <q-input v-model="form.fecha_ajuste" dense outlined label="Fecha Ajuste *" mask="####-##-##">
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.fecha_ajuste" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat /></div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-select v-model="form.estatus_orden" :options="opcionesEstatus" option-value="value" option-label="label" emit-value map-options dense outlined label="Estatus *" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.codigo_bodega_materia_prima" dense outlined label="Bodega Materia Prima *" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.codigo_bodega_productos_proceso" dense outlined label="Bodega Proceso *" />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model="form.codigo_bodega_producto_terminado" dense outlined label="Bodega Terminado *" />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md shadow-2">
          <q-card-section class="bg-grey-3 q-py-xs">
            <div class="text-subtitle2 text-grey-9">2. Definición de Producto y Cantidad</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.codigo_producto_terminado" dense outlined label="Producto Terminado *" />
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model="form.ruta_produccion" dense outlined label="Ruta" />
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model="form.numero_pedido" dense outlined label="N° Pedido" />
            </div>
            <div class="col-6">
              <q-input v-model.number="form.cantidad" dense outlined type="number" step="0.01" label="Cantidad Principal *" />
            </div>
            <div class="col-6">
              <q-input v-model.number="form.cantidad_segunda_unidad" dense outlined type="number" step="0.01" label="Cantidad 2da Unidad" />
            </div>
          </q-card-section>
        </q-card>

        <q-expansion-item icon="schedule" label="Fechas y Horas de Programación (Opcionales)" class="q-mb-md shadow-1 border-grey rounded-borders">
          <q-card>
            <q-card-section class="row q-col-gutter-sm">
              <div class="col-6 col-sm-3"><q-input v-model="form.fecha_requerida_interna" dense outlined label="F. Req. Interna" placeholder="YYYY-MM-DD" /></div>
              <div class="col-6 col-sm-3"><q-input v-model="form.fecha_requerida_cliente" dense outlined label="F. Req. Cliente" /></div>
              <div class="col-6 col-sm-3"><q-input v-model="form.fecha_programada_inicio" dense outlined label="F. Prog. Inicio" /></div>
              <div class="col-6 col-sm-3"><q-input v-model="form.fecha_estimada_entrega" dense outlined label="F. Est. Entrega" /></div>
              <div class="col-6 col-sm-6"><q-input v-model="form.hora_requerida_interna" dense outlined label="Hora Req. Interna (HH:MM:SS)" /></div>
              <div class="col-6 col-sm-6"><q-input v-model="form.hora_programada_inicio" dense outlined label="Hora Prog. Inicio (HH:MM:SS)" /></div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-card flat bordered class="q-mb-md shadow-2 border-primary">
          <q-card-section class="row items-center q-py-sm bg-primary text-white">
            <div class="text-subtitle2">3. Detalle de Insumos y Materia Prima</div>
            <q-space />
            <q-btn size="sm" color="white" text-color="primary" icon="add" label="Agregar Línea" @click="agregarDetalle" />
          </q-card-section>
          
          <q-card-section v-for="(item, idx) in form.detalle" :key="idx" class="q-pb-none">
            <div class="row q-col-gutter-sm bg-blue-grey-1 q-pa-sm rounded-borders q-mb-md items-start">
              <div class="col-12 col-sm-4">
                <q-input v-model="item.codigo_producto_receta" dense outlined label="Cód. Insumo *" />
              </div>
              <div class="col-6 col-sm-3">
                <q-input v-model.number="item.tipo_producto" dense outlined type="number" label="Tipo *" />
              </div>
              <div class="col-3 col-sm-2">
                <q-input v-model.number="item.aplicacion_producto" dense outlined type="number" label="Apl." />
              </div>
              <div class="col-3 col-sm-2">
                <q-input v-model.number="item.cantidad_producto" dense outlined type="number" label="Cant. *" />
              </div>
              <div class="col-12 col-sm-1 flex flex-center">
                <q-btn flat color="negative" icon="delete" @click="quitarDetalle(idx)" :disable="form.detalle.length === 1" />
              </div>
              <div class="col-12">
                <q-input v-model="item.listado_lotes" dense outlined label="Listado Lotes (Lote;Cant;Ubic;)" class="bg-white" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-gutter-md q-pb-xl">
          <q-btn color="primary" icon="send" label="PROCESAR ORDEN EN MBA3" :loading="enviando" size="lg" class="col" @click="enviar" />
          <q-btn outline color="grey" label="LIMPIAR" @click="limpiarFormulario" />
        </div>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="bg-dark text-amber q-mb-md sticky-top">
          <q-card-section><div class="text-overline">JSON Payload</div></q-card-section>
          <q-card-section>
            <pre style="font-size: 10px; white-space: pre-wrap;">{{ form }}</pre>
          </q-card-section>
        </q-card>
        
        <q-card v-if="errorMba3" flat bordered class="bg-red-1 text-red">
          <q-card-section>
            <div class="text-subtitle2">Error de Respuesta:</div>
            <div class="text-caption" style="word-break: break-all;">{{ errorMba3 }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Notify } from 'quasar';
import { mba3Request } from 'src/services/mba3Api';
import { useMba3Store } from 'src/stores/mba3Store';

// INTERFACES (Corrige error "Unexpected any")
interface DetalleItem {
  codigo_producto_receta: string;
  tipo_producto: number | null;
  aplicacion_producto: number | null;
  cantidad_producto: number;
  listado_lotes: string;
}

interface FormOrden {
  [key: string]: string | number | null | DetalleItem[];
  operacion: string | null;
  codigo_empresa: string;
  codigo_sucursal: string;
  numero_orden: number;
  fecha_ajuste: string;
  estatus_orden: string | null;
  codigo_bodega_materia_prima: string;
  codigo_bodega_productos_proceso: string;
  codigo_bodega_producto_terminado: string;
  codigo_producto_terminado: string;
  ruta_produccion: string;
  numero_pedido: string;
  cantidad: number;
  cantidad_segunda_unidad: number;
  fecha_requerida_interna: string;
  fecha_requerida_cliente: string;
  fecha_programada_inicio: string;
  fecha_estimada_entrega: string;
  hora_requerida_interna: string;
  hora_programada_inicio: string;
  detalle: DetalleItem[];
}

// CONFIGURACIÓN
const MBA3_CODIGO = 'API101';
const MBA3_PWD    = 'zaqxsw97531';
const MBA3_BASE_URL = 'http://201.148.25.52:8443';

const opcionesOperacion = [{ value: '1', label: '1 - Crear Orden' }, { value: '4', label: '4 - Proceso Completo' }];
const opcionesEstatus = [{ value: '1', label: '1 - Planificado' }, { value: '3', label: '3 - En Proceso' }];

const mba3Store = useMba3Store();
const tokenInfo = computed(() => mba3Store.tokenInfo(MBA3_CODIGO));
const tokenColor = computed(() => tokenInfo.value.status === 'activo' ? 'green' : 'red');
const tokenIcon = computed(() => tokenInfo.value.status === 'activo' ? 'check' : 'warning');
const tokenLabel = computed(() => tokenInfo.value.status === 'activo' ? 'MBA3 ONLINE' : 'TOKEN INVÁLIDO');

const refreshing = ref(false);
const enviando = ref(false);
const errorMba3 = ref('');

function nuevoDetalle(): DetalleItem {
  return { codigo_producto_receta: '', tipo_producto: null, aplicacion_producto: null, cantidad_producto: 0, listado_lotes: '' };
}

const form = ref<FormOrden>({
  operacion: null,
  codigo_empresa: 'BGAR1',
  codigo_sucursal: '',
  numero_orden: 0,
  fecha_ajuste: new Date().toISOString().split('T')[0] || '', // Corrección error string|undefined
  estatus_orden: null,
  codigo_bodega_materia_prima: '',
  codigo_bodega_productos_proceso: '',
  codigo_bodega_producto_terminado: '',
  codigo_producto_terminado: '',
  ruta_produccion: 'ESTAN',
  numero_pedido: '0',
  cantidad: 0,
  cantidad_segunda_unidad: 0,
  fecha_requerida_interna: '0000-00-00',
  fecha_requerida_cliente: '0000-00-00',
  fecha_programada_inicio: '0000-00-00',
  fecha_estimada_entrega: '0000-00-00',
  hora_requerida_interna: '00:00:00',
  hora_programada_inicio: '00:00:00',
  detalle: [nuevoDetalle()]
});

const agregarDetalle = () => form.value.detalle.push(nuevoDetalle());
const quitarDetalle = (idx: number) => form.value.detalle.splice(idx, 1);
const limpiarFormulario = () => { form.value.operacion = null; form.value.detalle = [nuevoDetalle()]; };

async function forzarNuevoToken() {
  refreshing.value = true;
  await mba3Store.forceRefresh(MBA3_CODIGO, MBA3_PWD);
  refreshing.value = false;
}

async function enviar() {
  enviando.value = true;
  errorMba3.value = '';

  try {
    const fd = new FormData();
    
    // Serialización segura para evitar errores de tipo y base-to-string
    (Object.keys(form.value) as Array<keyof FormOrden>).forEach((key) => {
      const val = form.value[key];
      if (key !== 'detalle' && val !== null && val !== undefined && val !== '') {
        // Forzamos key a string y val a string, excluyendo objetos
        if (typeof val !== 'object') {
          fd.append(String(key), String(val));
        }
      }
    });

    const dFinal = form.value.detalle.map(d => ({
      ...d,
      tipo_producto: d.tipo_producto || '',
      cantidad_producto: String(d.cantidad_producto)
    }));
    fd.append('detalle', JSON.stringify(dFinal));

    const resp = await mba3Request<{ error_api?: boolean; msg?: string }>({
      method: 'post',
      endpoint: '/mba3api/ordenes_produccion',
      codigo: MBA3_CODIGO,
      pwd: MBA3_PWD,
      multipartData: fd,
    });

    if (resp && typeof resp === 'object' && resp.error_api) {
      errorMba3.value = resp.msg ?? JSON.stringify(resp);
      Notify.create({ type: 'negative', message: resp.msg ?? 'Error en MBA3' });
    } else {
      Notify.create({ type: 'positive', message: 'Enviado correctamente a MBA3' });
    }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const e = err as { response: { data: unknown } };
      errorMba3.value = JSON.stringify(e.response.data);
    } else {
      errorMba3.value = String(err);
    }
    Notify.create({ type: 'negative', message: 'Fallo en MBA3' });
  } finally {
    enviando.value = false;
  }
}
</script>

<style scoped>
.sticky-top { position: sticky; top: 10px; z-index: 10; }
.border-grey { border: 1px solid #ddd; }
</style>