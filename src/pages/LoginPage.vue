<!-- pages/LoginPage.vue CORREGIDO -->
<template>
  <!-- QUITAR q-page porque login está FUERA del layout -->
  <div class="fullscreen bg-grey-2">
    <q-header elevated class="bg-orange-8 text-white">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">
          <q-icon name="agriculture" size="32px" class="q-mr-sm" />
          SISTEMA ALAZÁN
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <div class="row justify-center items-center fullscreen">
      <q-card class="login-card shadow-24">
        <q-card-section class="bg-orange-8 text-white q-pa-xl">
          <div class="text-center">
            <q-icon name="account_circle" size="80px" />
            <div class="text-h5 q-mt-md text-weight-bold">Bienvenido</div>
            <div class="text-subtitle2 opacity-80">Gestión de Recepción de Granos</div>
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit.prevent="onLogin" class="q-gutter-md">
            <q-input
              v-model="loginData.email"
              label="Correo Electrónico"
              outlined
              color="orange-8"
              type="email"
              :rules="[(val) => !!val || 'El correo es requerido']"
            >
              <template v-slot:prepend>
                <q-icon name="email" color="orange-8" />
              </template>
            </q-input>

            <q-input
              v-model="loginData.password"
              label="Contraseña"
              outlined
              color="orange-8"
              type="password"
              :rules="[(val) => !!val || 'La contraseña es requerida']"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="orange-8" />
              </template>
            </q-input>

            <div class="q-mt-lg">
              <q-btn
                label="Ingresar al Sistema"
                type="submit"
                color="orange-8"
                class="full-width text-weight-bold"
                size="lg"
                unelevated
                rounded
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-section class="text-center q-pa-none q-pb-md">
          <div class="text-caption text-grey-6">v1.0.0-net9 | © 2026 Alazán</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useQuasar, Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { useRouter } from 'vue-router';
const $q = useQuasar();
const authStore = useAuthStore();
const router = useRouter();

const loginData = reactive({
  email: '',
  password: '',
});

async function onLogin() {
  $q.loading.show({ message: 'Validando credenciales en SQL Server...' });

  try {
    const result = await authStore.login(loginData.email, loginData.password);

    if (result.success) {
      Notify.create({
        type: 'positive',
        message: `¡Bienvenido, ${authStore.user?.nombre_completo || 'Usuario'}!`,
        icon: 'check_circle',
        position: 'top',
      });
      // Navegamos al index (que usa el MainLayout)
      await router.push('/');
    } else {
      Notify.create({
        type: 'negative',
        message: result.message || 'Error de autenticación',
        icon: 'warning',
      });
    }
  } catch {
    Notify.create({
      type: 'negative',
      message: 'No se pudo conectar con el servidor .NET',
      icon: 'report_problem',
    });
  } finally {
    $q.loading.hide();
  }
}
</script>

<style scoped>
.login-card {
  width: 400px;
  max-width: 90vw;
  border-radius: 20px;
  overflow: hidden;
}
.opacity-80 {
  opacity: 0.8;
}
</style>
