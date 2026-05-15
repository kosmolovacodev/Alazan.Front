<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="text-center transition-fade">
      <q-img
        src="~assets/alazanLogo.png"
        spinner-color="orange"
        style="max-width: 400px; width: 80vw"
        class="q-mb-xl shadow-transition"
      />

      <div class="text-h4 text-weight-light text-grey-8">AgroAlazan</div>
      <div class="text-subtitle1 text-grey-6 q-mt-sm">Version 1.0</div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IndexPage',
});
</script>

<style scoped>
.transition-fade {
  animation: fadeIn 1.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
