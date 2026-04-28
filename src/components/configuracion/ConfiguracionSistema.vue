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
            <!-- Logo de la empresa -->
            <div
              class="logo-upload-area rounded-borders flex flex-center column cursor-pointer q-mb-sm"
              style="width: 140px; height: 100px; border: 2px dashed #bdbdbd; background: #f5f5f5"
              @click="seleccionarLogo"
            >
              <img
                v-if="form.logo_url"
                :src="form.logo_url"
                style="max-width: 130px; max-height: 90px; object-fit: contain"
              />
              <template v-else>
                <q-icon name="add_photo_alternate" size="md" color="grey-5" />
                <div class="text-caption text-grey-6 q-mt-xs text-center">Subir logo</div>
              </template>
            </div>
            <q-btn
              v-if="form.logo_url"
              flat
              dense
              size="xs"
              icon="delete"
              color="negative"
              label="Quitar logo"
              @click="form.logo_url = ''"
            />
            <input ref="logoInputRef" type="file" accept="image/*" style="display:none" @change="onLogoSeleccionado" />
            <div class="q-mt-md text-caption text-grey">Color Primario</div>
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

      <q-card bordered class="shadow-1 q-mb-lg">
        <q-card-section class="bg-orange-1 text-orange-9">
          <div class="text-subtitle1 text-weight-bold row items-center">
            <q-icon name="price_change" class="q-mr-sm" /> Configuración del Módulo de Precios
          </div>
        </q-card-section>
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model.number="form.tiempo_autorizacion_auto"
              label="Tiempo de Autorización Automática (minutos)"
              outlined
              dense
              type="number"
              min="1"
              max="1440"
              hint="Tiempo en minutos para que el precio se autorice automáticamente si el productor no responde"
            >
              <template v-slot:prepend>
                <q-icon name="timer" />
              </template>
              <template v-slot:append>
                <span class="text-caption text-grey">min</span>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-banner rounded class="bg-grey-2 text-grey-8">
              <template v-slot:avatar>
                <q-icon name="info" color="blue" />
              </template>
              <div class="text-caption">
                Si el productor no acepta o rechaza el precio sugerido dentro de este tiempo,
                el sistema autorizará automáticamente el precio sugerido.
              </div>
            </q-banner>
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
import { ref, onMounted, watch } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

const authStore = useAuthStore();
const loading = ref(false);
const logoInputRef = ref<HTMLInputElement | null>(null);

const form = ref({
  // Datos Empresa
  nombre_empresa: '',
  rfc: '',
  direccion: '',
  telefono: '',
  correo: '',
  color_primario: '#1976D2',
  mensaje_ticket: '',
  logo_url: '',
  
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
  moneda: 'MXN ($)',

  // Configuración del Módulo de Precios
  tiempo_autorizacion_auto: 30 // Minutos para autorización automática
});

function seleccionarLogo() {
  logoInputRef.value?.click();
}

function onLogoSeleccionado(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    form.value.logo_url = ev.target?.result as string;
  };
  reader.readAsDataURL(file);
}

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

// Watcher para recargar cuando cambie de sede
watch(() => authStore.sedeActivaId, () => {
  void cargarConfiguracion();
});

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