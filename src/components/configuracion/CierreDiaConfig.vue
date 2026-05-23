<template>
  <q-card flat bordered>
    <q-card-section class="row items-center q-pb-sm">
      <q-icon name="lock_clock" color="orange-8" size="sm" class="q-mr-sm" />
      <div>
        <div class="text-subtitle1 text-weight-bold">Roles con acceso al Cierre del Día</div>
        <div class="text-caption text-grey-6">
          Solo los roles seleccionados verán el botón "Cierre del Día" en Órdenes de Compra
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div v-if="cargando" class="text-center q-pa-md">
        <q-spinner color="orange-8" size="sm" />
      </div>
      <q-list v-else dense>
        <q-item v-for="rol in rolesDisponibles" :key="rol.id" dense>
          <q-item-section avatar>
            <q-checkbox
              v-model="rolesSeleccionados"
              :val="rol.nombre_rol"
              color="orange-8"
              :disable="rol.nombre_rol === 'ADMIN'"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ rol.nombre_rol }}</q-item-label>
          </q-item-section>
          <q-item-section side v-if="rol.nombre_rol === 'ADMIN'">
            <q-badge color="orange-8" label="Siempre activo" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-actions align="right" class="q-pr-md q-pb-md">
      <q-btn unelevated color="orange-8" label="Guardar" icon="save"
        :loading="guardando" :disable="cargando"
        @click="guardar" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/auth'
import { useConfiguracionStore } from 'src/stores/configuracionStore'

interface Rol {
  id: number
  nombre_rol: string
}

const $q               = useQuasar()
const authStore        = useAuthStore()
const configuracionStore = useConfiguracionStore()

const rolesDisponibles   = ref<Rol[]>([])
const rolesSeleccionados = ref<string[]>(['ADMIN'])
const cargando           = ref(false)
const guardando          = ref(false)

async function cargar() {
  cargando.value = true
  try {
    const sedeId = authStore.sedeActivaId ?? 0
    const [rolesRes, configRes] = await Promise.all([
      api.get<Rol[]>('/api/roles'),
      api.get(`/api/configuracion?sedeId=${sedeId}`),
    ])
    rolesDisponibles.value = rolesRes.data

    const rawRoles = configRes.data?.roles_cierre_dia
    if (rawRoles) {
      try {
        const parsed = JSON.parse(rawRoles)
        if (Array.isArray(parsed)) {
          rolesSeleccionados.value = parsed.includes('ADMIN') ? parsed : ['ADMIN', ...parsed]
        }
      } catch {
        rolesSeleccionados.value = ['ADMIN']
      }
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar configuración' })
  } finally {
    cargando.value = false
  }
}

async function guardar() {
  // Garantizar que ADMIN siempre esté incluido
  const roles = rolesSeleccionados.value.includes('ADMIN')
    ? rolesSeleccionados.value
    : ['ADMIN', ...rolesSeleccionados.value]

  guardando.value = true
  try {
    const sedeId = authStore.sedeActivaId ?? 0
    // Obtener config actual para no pisar otros campos
    const { data: configActual } = await api.get(`/api/configuracion?sedeId=${sedeId}`)
    await api.post(`/api/configuracion?sedeId=${sedeId}`, {
      ...configActual,
      roles_cierre_dia: JSON.stringify(roles),
    })
    // Actualizar el store para reactividad inmediata en toda la app
    configuracionStore.setRolesCierreDia(roles)
    $q.notify({ type: 'positive', message: 'Configuración guardada correctamente' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar configuración' })
  } finally {
    guardando.value = false
  }
}

onMounted(cargar)
</script>
