import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificacionesStore = defineStore('notificaciones', () => {
  const pulso = ref(0);

  function disparar() {
    pulso.value++;
  }

  return { pulso, disparar };
});
