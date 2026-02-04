<template>
  <q-card flat class="full-width bg-grey-1">
    <q-card-section class="row items-center bg-white q-pb-none">
      <q-btn flat round icon="arrow_back" color="grey-7" @click="$emit('close')" />
      <div class="text-h6 q-ml-sm">Nuevo Registro - Báscula Recepción</div>
      <q-space />
      <div class="text-h6 text-weight-bolder text-primary">TICKET: {{ form.ticket_numero }}</div>
    </q-card-section>

    <q-card-section class="q-pa-md">
      <q-form @submit.prevent="onSubmit" class="row q-col-gutter-md">
        <div class="col-12 col-md-8">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-4">
              <q-input v-model="fechaDisplay" label="Fecha y Hora" readonly outlined dense bg-color="white" />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.grano_id" :options="catalogoGranos" option-value="id" option-label="nombre" emit-value map-options label="Grano *" outlined dense bg-color="white" required />
            </div>


            <div class="col-12 col-md-8">
              <q-select
                v-model="form.productor_id" :options="listaProductores" option-value="id" option-label="nombre"
                emit-value map-options label="Productor *" outlined dense bg-color="white" use-input
                @update:model-value="onProductorSelected"
              >
                <template v-slot:after>
                  <q-btn round dense color="primary" icon="add" @click="modalProductor = true" />
                </template>
              </q-select>

              <q-banner v-if="form.observaciones" dense class="bg-blue-1 text-blue-9 q-mt-xs rounded-borders">
    <template v-slot:avatar>
      <q-icon name="info" color="blue-9" size="xs" />
    </template>
    {{ form.observaciones }}
  </q-banner>

            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.tipo_productor" :options="['Ejidal', 'Pequeña Propiedad']" label="T. Productor" outlined dense bg-color="white" />
            </div>

            <div class="col-12 col-md-4">
              <q-input v-model="form.celular" label="Celular" outlined dense bg-color="grey-2" readonly />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.origen_id" :options="catalogoOrigenes" option-value="id" option-label="municipio" emit-value map-options label="Origen" outlined dense bg-color="white" />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.comprador_id" :options="catalogoCompradores" option-value="id" option-label="nombre" emit-value map-options label="Comprador" outlined dense bg-color="white" />
            </div>

            <div class="col-12 col-md-4">
              <q-input v-model="form.chofer" label="Chofer" outlined dense bg-color="white" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="form.placas" label="Placas" outlined dense bg-color="white" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model.number="form.ton_aprox" type="number" step="0.01" label="Ton. Aprox" outlined dense bg-color="white" />
            </div>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <q-card bordered flat class="bg-amber-1" style="border: 2px solid #f2c037">
            <q-card-section class="text-center">
              <div class="text-subtitle2 text-weight-bold q-mb-sm text-uppercase">Peso Bruto (kg)</div>
              <div class="text-h2 text-weight-bolder text-primary q-mb-md">
                {{ form.peso_bruto_kg.toLocaleString() }}
              </div>

              <div class="row q-gutter-sm">
                <q-btn color="positive" icon="scale" label="Leer Báscula" class="col" size="lg" disable />
                <q-btn color="black" icon="edit" label="Captura Manual" class="col" outline @click="abrirCapturaManual" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 row justify-end q-gutter-sm q-mt-lg">
          <q-btn label="Cancelar" color="grey-8" flat @click="$emit('close')" />
          <q-btn label="Generar Ticket de Entrada" type="submit" color="primary" icon="save" unelevated />
        </div>
      </q-form>
    </q-card-section>

    <q-dialog v-model="modalProductor" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Agregar nuevo Productor</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div class="row q-gutter-md">
            <q-radio v-model="nuevoProd.tipo" val="Fisica" label="Física" />
            <q-radio v-model="nuevoProd.tipo" val="Moral" label="Moral" />
          </div>

          <template v-if="nuevoProd.tipo === 'Fisica'">
            <q-input v-model="nuevoProd.nombre" label="Nombre del productor" outlined dense />
          </template>
          <template v-else>
            <q-input v-model="nuevoProd.nombre" label="Razón Social" outlined dense />
            <q-input v-model="nuevoProd.atiende" label="Nombre de quien atiende" outlined dense />
          </template>
          <q-input v-model="nuevoProd.telefono" label="Teléfono" outlined dense mask="##########" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cerrar" flat v-close-popup />
          <q-btn label="Registrar Productor" color="primary" @click="guardarNuevoProductor" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref,onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth'; // Asegúrate de que la ruta sea correcta

const authStore = useAuthStore(); // Instanciamos el store de Pinia
const usuarioDbId = ref<number | null>(null); // Aquí guardaremos el '3'

async function cargarIdRealDeUsuario() {
  const uuid = authStore.user?.id; // Este es el "483381cb..."

  if (!uuid) return;

  try {
    const res = await api.get(`/api/usuarios/perfil/${uuid}`);
    usuarioDbId.value = res.data.id; // Guardamos el '3' (o el que corresponda)
    console.log('ID de auditoría cargado:', usuarioDbId.value);
  } catch (error) {
    console.error('No se pudo traducir el UUID a ID numérico', error);
  }
}

onMounted(async () => {
  await cargarIdRealDeUsuario();
});

const $q = useQuasar();
const props = defineProps<{
  ultimoTicket: number;
  catalogoGranos: Grano[];
  catalogoOrigenes: Origen[];
  catalogoCompradores: Comprador[];
  listaProductores: Productor[];
}>();
const emit = defineEmits(['save', 'close', 'refresh-productores']);

const fechaDisplay = ref(new Date().toLocaleString());
const modalProductor = ref(false);

interface Productor {
  id: number;
  nombre: string;
  telefono: string;
  atiende?: string; // El '?' significa que es opcional (puede ser null)
}

interface Grano {
  id: number;
  nombre: string;
}

interface Origen {
  id: number;
  municipio: string;
  estado: string;
}

interface Comprador {
  id: string; // Es string porque es un GUID
  nombre: string;
}

const form = reactive({
  ticket_numero: props.ultimoTicket,
  fecha_hora: new Date().toISOString(),
  grano_id: null,
  productor_id: null,
  tipo_productor: 'Ejidal',
  celular: '',
  origen_id: null,
  comprador_id: null,
  chofer: '',
  placas: '',
  ton_aprox: 0,
  peso_bruto_kg: 0,
  status: 'PENDIENTE',
  observaciones: '' // <-- AGREGA ESTA LÍNEA
});

const nuevoProd = reactive({ tipo: 'Fisica', nombre: '', atiende: '', telefono: '' });

// 1. Al seleccionar productor, llenar celular automáticamente
function onProductorSelected(id: number) {
  const prod = props.listaProductores.find((p) => p.id === id);
  if (prod) {
    form.celular = prod.telefono;
    form.observaciones = prod.atiende ? `Atiende: ${prod.atiende}` : '';
  }
}

// 2. Captura Manual de Peso
function abrirCapturaManual() {
  $q.dialog({
    title: 'Captura Manual',
    message: 'Ingrese los kilogramos actuales en báscula:',
    prompt: { model: '', type: 'number' },
    cancel: true,
    persistent: true
  }).onOk(data => {
    form.peso_bruto_kg = parseFloat(data);
  });
}

// 3. Registro rápido de productor
async function guardarNuevoProductor() {
  try {
    // Preparamos el objeto según el tipo de persona
    const payload = {
      nombre: nuevoProd.nombre, // En el modal es Razón Social si es Moral
      telefono: nuevoProd.telefono,
      tipo_persona: nuevoProd.tipo,
      atiende: nuevoProd.tipo === 'Moral' ? nuevoProd.atiende : null
    };

    const res = await api.post('/api/catalogos/productores', payload);

    emit('refresh-productores');

    // Asignamos el ID recién creado al formulario de báscula
    form.productor_id = res.data.id;
    form.celular = nuevoProd.telefono;

    modalProductor.value = false;
    $q.notify({ type: 'positive', message: 'Productor registrado con éxito' });
  } catch  {
    $q.notify({ type: 'negative', message: 'Error al registrar productor' });
  }
}

function onSubmit() {
  if (form.peso_bruto_kg <= 0) {
    return $q.notify({ type: 'warning', message: 'Debe capturar el peso bruto' });
  }

  // Validamos que tengamos el ID numérico antes de enviar
  if (!usuarioDbId.value) {
    return $q.notify({
      type: 'negative',
      message: 'Error de integridad: No se pudo verificar tu ID de usuario.'
    });
  }

  const registroParaGuardar = {
    ticket_numero: String(form.ticket_numero),
    fecha_hora: new Date().toISOString(),
    productor_id: Number(form.productor_id),
    chofer: form.chofer,
    placas: form.placas,
    peso_bruto_kg: Number(form.peso_bruto_kg),
    grano_id: Number(form.grano_id),
    origen_id: form.origen_id ? Number(form.origen_id) : null,
    comprador_id: form.comprador_id,
    status: form.status,
    datos_adicionales: JSON.stringify({
      tipo_productor: form.tipo_productor,
      observaciones: form.observaciones,
      celular: form.celular
    }),
    boleta_numero: null,
    // AQUÍ ESTÁ LA MAGIA: Mandamos el número (3), no el UUID
    usuario_registro_id: usuarioDbId.value
  };

  emit('save', registroParaGuardar);
}
</script>
