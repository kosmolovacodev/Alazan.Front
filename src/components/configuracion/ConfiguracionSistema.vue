<template>
  <div class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-icon name="settings" size="md" color="grey-8" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold text-grey-9">Configuración del Sistema</div>
    </div>

    <q-form @submit="guardarConfiguracion">
      <q-card bordered class="shadow-1 q-mb-lg">
        <q-card-section class="bg-blue-grey-1 text-blue-grey-9">
          <div class="text-subtitle1 text-weight-bold row items-center">
            <q-icon name="business" class="q-mr-sm" /> Datos de la Empresa
          </div>
        </q-card-section>

        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-md-3 flex flex-center column">
            <q-avatar
              size="100px"
              font-size="50px"
              :style="`background-color: ${form.color_primario}`"
              text-color="white"
            >
              {{ form.nombre_empresa ? form.nombre_empresa.charAt(0) : 'E' }}
            </q-avatar>
            <div class="q-mt-sm text-caption text-grey">Color Primario</div>
            <q-input
              v-model="form.color_primario"
              filled
              dense
              class="q-mt-xs"
              style="width: 150px"
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="form.color_primario" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-9">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-8">
                <q-input v-model="form.nombre_empresa" label="Nombre de la Empresa / Razón Social" outlined dense />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.rfc" label="RFC" outlined dense />
              </div>
              <div class="col-12">
                <q-input v-model="form.direccion" label="Dirección Fiscal" outlined dense />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.telefono" label="Teléfono de Contacto" outlined dense />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.correo" label="Correo Electrónico" outlined dense />
              </div>
              <div class="col-12">
                <q-input v-model="form.mensaje_ticket" label="Mensaje al pie del Ticket" outlined dense type="textarea" rows="2" />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card bordered class="shadow-1 q-mb-lg">
        <q-card-section class="bg-blue-1 text-blue-9">
          <div class="text-subtitle1 text-weight-bold row items-center">
            <q-icon name="straighten" class="q-mr-sm" /> Unidades de Medida
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div v-for="(unidad, index) in form.unidadesMedida" :key="index" class="col-12 col-sm-4 col-md-3">
              <q-item tag="label" v-ripple class="border rounded-borders">
                <q-item-section avatar>
                  <q-checkbox v-model="unidad.activa" color="blue" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ unidad.unidad }}</q-item-label>
                  <q-item-label caption>{{ unidad.simbolo }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card bordered class="shadow-1 q-mb-lg">
        <q-card-section class="bg-indigo-1 text-indigo-9">
          <div class="text-subtitle1 text-weight-bold row items-center">
            <q-icon name="public" class="q-mr-sm" /> Configuración Regional
          </div>
        </q-card-section>
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input v-model="form.zonaHoraria" label="Zona Horaria" outlined dense hint="Ej: America/Mexico_City" />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="form.formatoFecha" label="Formato de Fecha" outlined dense hint="Ej: DD/MM/YYYY" />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="form.formatoHora" label="Formato de Hora" outlined dense hint="Ej: HH:mm (24h)" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.idioma" label="Idioma" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="form.moneda" label="Moneda" outlined dense hint="Ej: MXN ($)" />
          </div>
        </q-card-section>
      </q-card>

      <div class="row justify-end q-mt-md">
        <q-btn
          label="Guardar Configuración General"
          type="submit"
          color="orange-9"
          icon="save"
          size="lg"
          :loading="loading"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';

const loading = ref(false);

const form = ref({
  // Datos Empresa
  nombre_empresa: '',
  rfc: '',
  direccion: '',
  telefono: '',
  correo: '',
  color_primario: '#1976D2',
  mensaje_ticket: '',
  
  // Unidades de Medida
  unidadesMedida: [
    { id: 1, unidad: 'Kilogramos', simbolo: 'kg', activa: true },
    { id: 2, unidad: 'Toneladas', simbolo: 't', activa: true },
    { id: 3, unidad: 'Libras', simbolo: 'lb', activa: false },
    { id: 4, unidad: 'Gramos', simbolo: 'g', activa: false },
    { id: 5, unidad: 'Hectáreas', simbolo: 'ha', activa: true }
  ],

  // Configuración Regional
  zonaHoraria: 'America/Mexico_City',
  formatoFecha: 'DD/MM/YYYY',
  formatoHora: 'HH:mm',
  idioma: 'Español (México)',
  moneda: 'MXN ($)'
});

const cargarConfiguracion = async () => {
  try {
    const { data } = await api.get('/api/configuracion');
    if (data) {
      // Fusionamos los datos que vienen del backend con la estructura del form
      // Si el backend no envía unidadesMedida, conservamos las de por defecto
      form.value = { ...form.value, ...data };
    }
  } catch (error) {
    console.error(error);
    Notify.create({ type: 'warning', message: 'Usando configuración predeterminada' });
  }
};

const guardarConfiguracion = async () => {
  loading.value = true;
  try {
    // Enviamos todo el objeto form al mismo endpoint
    await api.post('/api/configuracion', form.value);
    Notify.create({ type: 'positive', message: '✅ Configuración actualizada correctamente' });
  } catch {
    Notify.create({ type: 'negative', message: '❌ Error al guardar configuración' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void cargarConfiguracion();
});
</script>

<style scoped>
.border {
  border: 1px solid #e0e0e0;
}
.rounded-borders {
  border-radius: 8px;
}
</style>