<template>
  <div class="q-gutter-y-md">
    <q-select
      v-model="rolId"
      :options="roles"
      option-label="nombre"
      option-value="id"
      emit-value
      map-options
      outlined
      dense
      label="Seleccione un Rol para editar permisos"
      @update:model-value="cargarPermisos"
    />

    <q-list bordered v-if="rolId">
      <q-item tag="label" v-for="p in permisos" :key="p.pantallaId">
        <q-item-section>
          <q-item-label>{{ p.pantallaNombre }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-checkbox v-model="p.permitido" @update:model-value="guardarPermiso(p)" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';

// Interfaces para tipado estricto
interface Rol {
  id: number;
  nombre: string;
}

interface Permiso {
  pantallaId: number;
  pantallaNombre: string;
  permitido: boolean;
}

const roles = ref<Rol[]>([]);
const rolId = ref<number | null>(null);
const permisos = ref<Permiso[]>([]); // Arregla el error de 'never'

const cargarRoles = async () => {
  const { data } = await api.get('/api/roles');
  roles.value = data;
};

// Se corrige el tipo 'any'
const cargarPermisos = async (val: number) => {
  const { data } = await api.get(`/api/permisos/${val}`);
  permisos.value = data;
};

// Se corrige el tipo 'any'
async function guardarPermiso(p: Permiso) {
  await api.post('/api/permisos/actualizar', { rolId: rolId.value, ...p });
}

onMounted(() => {
  void cargarRoles();
});
</script>
