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
      <div class="tabs-scroll-wrap" @wheel.prevent="scrollTabs">
      <q-tabs
        ref="tabsRef"
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
        <q-tab name="precios-clasificacion" label="Precios por Clasificación" icon="grade" />
        <q-tab name="granos" label="Recepción de Granos" icon="grass" />
        <q-tab name="facturas" label="Recepción de Facturas" icon="description" />
        <q-tab name="pagos" label="Pagos" icon="account_balance_wallet" />
        <q-tab name="produccion" label="Producción" icon="precision_manufacturing" />
        <q-tab name="bodega" label="Bodega" icon="warehouse" />
        <q-tab name="embarque" label="Instrucciones de Embarque" icon="local_shipping" />
        <q-tab name="bitacoras" label="Bitácoras" icon="history" />
        <q-tab name="inicio-dia" label="Inicio del Día" icon="wb_sunny" />
        <q-tab name="cierre-dia" label="Cierre del Día" icon="lock_clock" />
        <q-tab name="consultas" label="Consultas" icon="manage_search" />
      </q-tabs>
      </div>

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

        <q-tab-panel name="precios-clasificacion" class="q-pa-none">
          <q-scroll-area style="height: calc(100vh - 280px);">
            <ConfigPreciosClasificacion />
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

        <q-tab-panel name="produccion">
          <div class="text-h6 q-mb-md">Configuración de Producción</div>
          <ConfiguracionProduccion />
        </q-tab-panel>

        <q-tab-panel name="bodega">
          <div class="text-h6 q-mb-md">Configuración — Módulo de Bodega</div>
          <div class="text-caption text-grey-6 q-mb-md">Catálogos de ubicaciones físicas y tipos de producto manejados en la asignación de bodega</div>
          <ConfiguracionBodega />
        </q-tab-panel>

        <q-tab-panel name="embarque">
          <div class="text-h6 q-mb-md">Configuración — Instrucciones de Embarque</div>
          <div class="text-caption text-grey-6 q-mb-md">Catálogos de presentaciones, brokers, lugares de embarque y plantillas de condiciones</div>
          <ConfiguracionInstruccionesEmbarque />
        </q-tab-panel>

        <q-tab-panel name="bitacoras">
          <div class="text-h6 q-mb-md">Configuración — Módulo de Bitácoras</div>
          <div class="text-caption text-grey-6 q-mb-md">Secciones y bitácoras operativas registradas en el sistema</div>
          <ConfiguracionBitacoras />
        </q-tab-panel>

        <q-tab-panel name="inicio-dia" class="q-pa-none">
          <div class="q-pa-md q-pb-sm">
            <div class="text-h6 q-mb-xs">Configuración — Inicio del Día</div>
            <div class="text-caption text-grey-6">Secciones activas, íconos, colores y estado diario por sede</div>
          </div>
          <ConfiguracionInicioDia />
        </q-tab-panel>

        <q-tab-panel name="cierre-dia">
          <div class="text-h6 q-mb-xs">Configuración — Cierre del Día</div>
          <div class="text-caption text-grey-6 q-mb-md">Define qué roles pueden ejecutar el cierre del día en Órdenes de Compra</div>
          <CierreDiaConfig />
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

// Importación de Precios por Clasificación (Garbanzo)
import ConfigPreciosClasificacion from 'src/components/configuracion/ConfigPreciosClasificacion.vue';

// Importación de Configuración de Facturación
import ConfiguracionFacturacion from 'src/components/configuracion/ConfiguracionFacturacion.vue';

// Importación de Configuración de Pagos
import ConfiguracionPagos from 'src/components/configuracion/ConfiguracionPagos.vue';

// Importación de Configuración de Producción
import ConfiguracionProduccion from 'src/components/configuracion/ConfiguracionProduccion.vue';

// Importación de Configuración de Bodega
import ConfiguracionBodega from 'src/components/configuracion/ConfiguracionBodega.vue';

// Importación de Configuración de Instrucciones de Embarque
import ConfiguracionInstruccionesEmbarque from 'src/components/configuracion/ConfiguracionInstruccionesEmbarque.vue';

// Importación de Configuración de Bitácoras
import ConfiguracionBitacoras from 'src/components/configuracion/ConfiguracionBitacoras.vue';

// Importación de Configuración de Inicio del Día
import ConfiguracionInicioDia from 'src/components/configuracion/ConfiguracionInicioDia.vue';

// Importación de Configuración de Cierre del Día
import CierreDiaConfig from 'src/components/configuracion/CierreDiaConfig.vue';

// Estado de la pestaña principal
const mainTab = ref('general');

// ── Scroll con trackpad/mousewheel en el panel de tabs ────────
const tabsRef = ref<{ $el: HTMLElement } | null>(null);

function scrollTabs(e: WheelEvent) {
  const content = tabsRef.value?.$el?.querySelector('.q-tabs__content') as HTMLElement | null;
  if (content) {
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    content.scrollBy({ left: delta * 3, behavior: 'smooth' });
  }
}
</script>

<style scoped>
.text-purple-9 {
  color: #1e1548;
}
/* Estética para que los expansion items se vean limpios dentro de la tab */
.rounded-borders {
  border-radius: 8px;
}

/* Wrapper que captura el evento wheel para scroll horizontal con trackpad */
.tabs-scroll-wrap {
  overflow: hidden;
}
/* Suaviza el scroll horizontal del contenedor interno de q-tabs */
:deep(.q-tabs__content) {
  scroll-behavior: smooth;
}
</style>