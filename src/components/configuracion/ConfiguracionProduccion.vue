<template>
  <div class="q-pa-md">

    <!-- ════════════════════════════════════════════════
         SECCIÓN 1 — CALIBRES POR TIPO DE MERCADO
    ═════════════════════════════════════════════════ -->
    <div class="section-label q-mb-md">CALIBRES POR TIPO DE MERCADO</div>
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-md-4">
        <CatalogCard
          title="Garbanzo — OZ AM"
          subtitle="Mercado americano"
          placeholder="Ej. 50/52"
          api-base="/api/produccion-catalogos/calibre-oz-am"
          :get-params="{ sedeId }"
          :mutate-params="{ sedeId }"
        />
      </div>
      <div class="col-12 col-md-4">
        <CatalogCard
          title="Garbanzo — OZ ESP"
          subtitle="Mercado español / europeo"
          placeholder="Ej. 50/52"
          api-base="/api/produccion-catalogos/calibre-oz-esp"
          :get-params="{ sedeId }"
          :mutate-params="{ sedeId }"
        />
      </div>
      <div class="col-12 col-md-4">
        <CatalogCard
          title="Frijol — Granos / 100g"
          subtitle="Calibre por conteo de granos"
          placeholder="Ej. >96"
          api-base="/api/produccion-catalogos/calibre-frijol"
          :get-params="{ sedeId }"
          :mutate-params="{ sedeId }"
        />
      </div>
    </div>

    <!-- ════════════════════════════════════════════════
         SECCIÓN 2 — LÍNEAS DE PRODUCCIÓN Y OPERACIONES
    ═════════════════════════════════════════════════ -->
    <div class="section-label q-mb-md">LÍNEAS DE PRODUCCIÓN Y OPERACIONES</div>
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-md-6">
        <CatalogCard
          title="Trenes de Limpia / Clasificación"
          subtitle="Líneas disponibles al crear una orden. Máximo un tren por línea."
          placeholder="Ej. Tren 4"
          api-base="/api/catalogos/trenes"
          put-base="/api/catalogos/editar/trenes"
          :get-params="{ sede_id: sedeId }"
          :mutate-params="{ sedeId }"
        />
      </div>
      <div class="col-12 col-md-6">
        <CatalogCard
          title="Tipos de Proceso"
          subtitle="Operación a realizar en la orden (uno por orden)"
          placeholder="Ej. Clasificado Especial"
          api-base="/api/produccion-catalogos/tipo-proceso"
        />
      </div>
    </div>

    <!-- ════════════════════════════════════════════════
         SECCIÓN 3 — ORIGEN DE MATERIA PRIMA Y ENVASADO
    ═════════════════════════════════════════════════ -->
    <div class="section-label q-mb-md">ORIGEN DE MATERIA PRIMA Y ENVASADO</div>
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-md-6">
        <CatalogCard
          title="Silos Disponibles como Origen"
          subtitle="Silos que puede seleccionar un tren al crear la orden"
          placeholder="Ej. Silo 7"
          api-base="/api/produccion-catalogos/silo"
          :get-params="{ sedeId }"
          :mutate-params="{ sedeId }"
        />
      </div>
      <div class="col-12 col-md-6">
        <CatalogCard
          title="Presentaciones de Envasado"
          subtitle="Formatos de empaque seleccionables en el encabezado de la orden"
          placeholder="Ej. 20 kg"
          api-base="/api/produccion-catalogos/presentacion"
        />
      </div>
    </div>

    <!-- ════════════════════════════════════════════════
         SECCIÓN 4 — CATÁLOGO DE INSUMOS
    ═════════════════════════════════════════════════ -->
    <div class="section-label q-mb-md">CATÁLOGO DE INSUMOS</div>
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-md-6">
        <CatalogCard
          title="Catálogo de Insumos"
          subtitle="Costales, supersacos, hilos y otros materiales asignables por tren dentro de cada orden"
          placeholder="Ej. Costal KRAFT 25 KG"
          api-base="/api/produccion-catalogos/bloque-insumos"
        />
      </div>
    </div>

    <!-- ════════════════════════════════════════════════
         SECCIÓN 5 — CATÁLOGOS DEL RESULTADO DE PRODUCCIÓN
    ═════════════════════════════════════════════════ -->
    <div class="section-label q-mb-md">CATÁLOGOS DEL RESULTADO DE PRODUCCIÓN</div>
    <div class="row q-col-gutter-md q-mb-xl">
      <div class="col-12 col-md-6">
        <CatalogCard
          title="Subproductos / Rezagas"
          subtitle="Tipos de subproducto que se capturan al registrar el resultado de una orden"
          placeholder="Ej. Rezaga de Ojo Electrónico"
          api-base="/api/produccion-catalogos/subproducto"
        />
      </div>
      <div class="col-12 col-md-6">
        <CatalogCard
          title="Desechos"
          subtitle="Tipos de desecho que se capturan al registrar el resultado de una orden"
          placeholder="Ej. Basura General"
          api-base="/api/produccion-catalogos/desecho"
        />
      </div>
    </div>

    <!-- ════════════════════════════════════════════════
         SECCIÓN 6 — CALIBRES DE ANÁLISIS DE CALIDAD
    ═════════════════════════════════════════════════ -->
    <div class="section-label q-mb-md">CALIBRES DE ANÁLISIS DE CALIDAD</div>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <CatalogCard
          title="Calibres (mm)"
          subtitle="Rangos y valores en mm usados en el análisis detallado de calidad"
          placeholder="Ej. 7-8 mm"
          title-color="default"
          api-base="/api/produccion-catalogos/calibres-analisis"
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import CatalogCard from './CatalogCard.vue';

const authStore = useAuthStore();
const sedeId = computed(() => authStore.sedeActivaId ?? 0);
</script>

<style scoped>
.section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #9e9e9e;
  text-transform: uppercase;
  padding-bottom: 6px;
  border-bottom: 1px solid #eeeeee;
}
</style>
