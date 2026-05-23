import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfiguracionStore = defineStore('configuracion', () => {
  const rolesCierreDia = ref<string[]>(['ADMIN'])

  function setRolesCierreDia(roles: string[]) {
    rolesCierreDia.value = roles
  }

  return { rolesCierreDia, setRolesCierreDia }
}, { persist: true })
