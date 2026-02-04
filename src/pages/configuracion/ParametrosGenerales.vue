<template>
  <q-page padding class="bg-grey-2">
    <div class="row items-center q-mb-md">
      <q-icon name="settings" size="md" color="primary" class="q-mr-sm" />
      <div>
        <h1 class="text-h5 text-weight-bold q-my-none text-purple-9">
          Panel de Configuración Maestro
        </h1>
        <div class="text-caption text-grey-7">Gestiona las reglas de negocio y parámetros del sistema</div>
      </div>
    </div>

    <q-card flat bordered class="shadow-2 rounded-borders">
      <q-tabs
        v-model="mainTab"
        dense
        class="text-grey-7 bg-white"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
        outside-arrows
        mobile-arrows
      >
        <q-tab name="general" label="Parámetros Generales" icon="tune" />
        <q-tab name="precios" label="Reglas de Precio" icon="payments" />
        <q-tab name="granos" label="Recepción de Granos" icon="grass" />
        <q-tab name="facturas" label="Recepción de Facturas" icon="description" />
        <q-tab name="pagos" label="Pagos" icon="account_balance_wallet" />
        <q-tab name="bitacoras" label="Bitácoras" icon="history" />
        <q-tab name="consultas" label="Consultas" icon="manage_search" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="mainTab" animated class="bg-white">
        
        <q-tab-panel name="general" class="q-pa-none">
          <q-scroll-area style="height: calc(100vh - 280px);">
            <div class="q-pa-md q-gutter-y-md">
              
              <q-expansion-item
                label="Gestión de Usuarios"
                header-class="bg-grey-3 text-purple-9 text-weight-bold text-h5"
                icon=""
                bordered
                class="overflow-hidden shadow-1 rounded-borders"
              >
                <q-card>
                  <q-card-section><GestionUsuarios /></q-card-section>
                </q-card>
              </q-expansion-item>

              <q-expansion-item
                label="Gestión de Roles"
                header-class="bg-grey-3 text-purple-9 text-weight-bold text-h5"
                icon=""
                bordered
                class="overflow-hidden shadow-1 rounded-borders"
              >
                <q-card>
                  <q-card-section><GestionRoles /></q-card-section>
                </q-card>
              </q-expansion-item>

              <q-expansion-item
                label="Permisos de Acceso a Pantallas"
                header-class="bg-grey-3 text-purple-9 text-weight-bold text-h5"
                icon=""
                bordered
                class="overflow-hidden shadow-1 rounded-borders"
              >
                <q-card>
                  <q-card-section><PermisosPantallas /></q-card-section>
                </q-card>
              </q-expansion-item>

              <q-expansion-item
                label="Catálogos Maestros"
                header-class="bg-grey-3 text-purple-9 text-weight-bold text-h5"
                icon=""
                bordered
                class="overflow-hidden shadow-1 rounded-borders"
              >
                <q-card>
                  <q-card-section><CatalogosMaestros /></q-card-section>
                </q-card>
              </q-expansion-item>

              <q-expansion-item
                label="Configuración del Sistema"
                header-class="bg-grey-3 text-purple-9 text-weight-bold text-h5"
                icon=""
                bordered
                class="overflow-hidden shadow-1 rounded-borders"
              >
                <q-card>
                  <q-card-section><ConfiguracionSistema /></q-card-section>
                </q-card>
              </q-expansion-item>

            </div>
          </q-scroll-area>

        </q-tab-panel>

        <q-tab-panel name="precios" class="q-pa-none">
          <q-scroll-area style="height: calc(100vh - 280px);">
            <ReglasPrecio />
          </q-scroll-area>
        </q-tab-panel>

        <q-tab-panel name="granos">
          <ConfigRecepcionGranos />
          </q-tab-panel>

        <q-tab-panel name="facturas">
          <div class="text-h6">Recepción de Facturas</div>
          <ConfiguracionFacturacion />
        </q-tab-panel>

        <q-tab-panel name="pagos">
          <div class="text-h6">Configuración de Pagos</div>
          <ConfiguracionPagos />
        </q-tab-panel>

        <q-tab-panel name="bitacoras">
          <div class="text-h6">Configuración de Bitácoras</div>
          Define qué eventos se registran, nivel de detalle y retención de información.
          <div class="q-mt-md q-pa-md bg-orange-1 border-orange rounded-borders">⚠️Contenido pendiente de implementar</div>
        </q-tab-panel>

        <q-tab-panel name="consultas">
          <div class="text-h6">Configuración de Consultas</div>
          Define módulos consultables, tipos de reportes y opciones de exportación.
          <div class="q-mt-md q-pa-md bg-orange-1 border-orange rounded-borders">⚠️Contenido pendiente de implementar</div>

        </q-tab-panel>

      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Importación de Parámetros Generales
import CatalogosMaestros from 'src/components/configuracion/CatalogosMaestros.vue';
import GestionUsuarios from 'src/components/configuracion/GestionUsuarios.vue';
import GestionRoles from 'src/components/configuracion/GestionRoles.vue';
import PermisosPantallas from 'src/components/configuracion/PermisosPantallas.vue';
import ConfiguracionSistema from 'src/components/configuracion/ConfiguracionSistema.vue';

// Importación de Configuración Reglas de Precio
import ReglasPrecio from 'src/components/configuracion/ReglasPrecio.vue';

//Importación de Configuración Recepción de Granos
import ConfigRecepcionGranos from 'src/components/configuracion/ConfigRecepcionGranos.vue';

// Importación de Configuración de Facturación
import ConfiguracionFacturacion from 'src/components/configuracion/ConfiguracionFacturacion.vue';

// Importación de Configuración de Pagos
import ConfiguracionPagos from 'src/components/configuracion/ConfiguracionPagos.vue';

// Estado de la pestaña principal
const mainTab = ref('general');
</script>

<style scoped>
.text-purple-9 {
  color: #1e1548;
}
/* Estética para que los expansion items se vean limpios dentro de la tab */
.rounded-borders {
  border-radius: 8px;
}
</style>