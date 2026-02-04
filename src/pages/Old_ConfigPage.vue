<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-card flat bordered>
        <q-item class="bg-orange-1">
          <q-item-section avatar>
            <q-icon name="settings" color="orange-9" size="md" />
          </q-item-section>
          <q-item-section>
            <div class="text-h6 text-orange-9">Configuración del Sistema</div>
            <div class="text-caption">Gestiona los parámetros generales de Alazán</div>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-toggle
                v-model="notificaciones"
                label="Activar notificaciones de báscula"
                color="orange"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="sucursal"
                label="Nombre de Sucursal"
                outlined
                dense
                color="orange"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Guardar Cambios" color="orange-8" unelevated />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const notificaciones = ref(true);
const sucursal = ref('Planta Principal - Alazán');
</script>
