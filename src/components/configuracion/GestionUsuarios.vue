<template>
  <div>
    <div class="row justify-between items-center q-mb-md">
      <div class="text-subtitle1 text-weight-bold">Usuarios del Sistema</div>
      <q-btn
        color="purple"
        icon="person_add"
        label="Nuevo Usuario"
        unelevated
        @click="abrirModal"
      />
    </div>

    <q-table :rows="usuarios" :columns="columns" row-key="id" flat bordered :loading="loading" :rows-per-page-options="[0]">
      <template v-slot:body-cell-nombre_sede="props">
        <q-td :props="props">
          <q-badge :color="props.row.sede_id === 0 ? 'black' : 'grey-7'" outline>
            {{ props.row.nombre_sede || 'Sin Sede' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-activo="props">
        <q-td :props="props" class="text-center">
          <q-chip :color="props.row.activo ? 'green' : 'red'" text-color="white" size="sm">
            {{ props.row.activo ? 'Activo' : 'Inactivo' }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn flat round icon="edit" color="blue" size="sm" @click="editar(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="modal" persistent>
      <q-card style="width: 700px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Editar Usuario' : 'Nuevo Usuario' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6 q-gutter-y-sm">
              <q-input v-model="form.nombre" label="Nombre Completo *" outlined dense />
              <q-input
                v-model="form.username"
                label="Email / Usuario *"
                outlined
                dense
                type="email"
              />
              <q-input
                v-model="form.password"
                label="Contraseña"
                type="password"
                outlined
                dense
                :hint="form.id ? 'Dejar vacío para no cambiar' : 'Requerido'"
              />

              <q-select
                v-model="form.rol_id"
                :options="rolesOptions"
                label="Rol *"
                outlined
                dense
                emit-value
                map-options
              />

              <q-select
                v-model="form.sede_id"
                :options="authStore.listaSedes"
                option-value="id"
                option-label="nombre"
                label="Bodega Asignada *"
                outlined
                dense
                emit-value
                map-options
                :readonly="!authStore.esAdminGlobal"
              >
                <template v-slot:prepend>
                  <q-icon name="place" />
                </template>
                <q-tooltip v-if="!authStore.esAdminGlobal"
                  >Solo el Admin Global puede cambiar la sede</q-tooltip
                >
              </q-select>
            </div>

            <div class="col-12 col-md-6 q-gutter-y-sm">
              <!-- Firma de imagen -->
              <div>
                <div class="text-caption text-grey-7 q-mb-xs">Firma (imagen)</div>
                <div
                  style="background:#fff; border:1px solid #bdbdbd; border-radius:4px; min-height:80px; display:flex; align-items:center; justify-content:center; padding:8px;"
                >
                  <img v-if="form.firma" :src="form.firma" style="max-height:70px; max-width:100%; display:block;" />
                  <span v-else class="text-grey-5 text-caption">Sin firma cargada</span>
                </div>
                <div class="row q-gutter-sm q-mt-xs">
                  <q-btn flat dense size="sm" icon="upload" label="Cargar imagen" color="blue" @click="triggerFirmaInput" />
                  <q-btn v-if="form.firma" flat dense size="sm" icon="clear" label="Quitar" color="negative" @click="form.firma = ''" />
                </div>
                <input ref="firmaInput" type="file" accept="image/*" style="display:none" @change="onFirmaChange" />
                <canvas ref="firmaCanvas" style="display:none" />
              </div>

              <q-input v-model="form.nip" label="NIP de firma (4-6 dígitos)" type="password"
                outlined dense maxlength="6"
                hint="Se usa para firmar bitácoras digitalmente. Dejar vacío para no cambiar." />
              <q-input v-model="form.departamento" label="Departamento (Opcional)" outlined dense />
              <q-input
                v-model="form.telefono"
                label="Teléfono (Opcional)"
                outlined
                dense
                mask="##########"
              />
              <q-checkbox v-model="form.activo" label="Usuario Activo" color="purple" />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup color="grey" />
          <q-btn color="purple" label="Guardar Usuario" @click="guardar" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import { useOfflineStore } from 'src/stores/offlineStore';
import { useUsuariosStore } from 'src/stores/usuariosStore';
import { useAuthStore } from 'src/stores/auth'; // Importamos el AuthStore para sedes

const usuariosStore = useUsuariosStore();
const offlineStore = useOfflineStore();
const authStore = useAuthStore();

interface Usuario {
  id?: number | null | undefined;
  nombre: string;
  username: string;
  password?: string;
  nip?: string;
  rol_id: number | null;
  nombre_rol?: string;
  nombre_sede?: string;
  sede_id: number | null;
  firma?: string;
  departamento?: string;
  telefono?: string;
  activo: boolean;
}

interface Rol {
  id: number;
  nombre_rol: string;
  descripcion?: string;
}

const usuarios = ref<Usuario[]>([]);
const rolesOptions = computed(() =>
  (usuariosStore.listaRoles as Rol[]).map((r) => ({ label: r.nombre_rol, value: r.id }))
);
const loading = ref(false);
const modal = ref(false);

// Firma de imagen
const firmaInput = ref<HTMLInputElement | null>(null);
const firmaCanvas = ref<HTMLCanvasElement | null>(null);

function triggerFirmaInput() {
  firmaInput.value?.click();
}

function onFirmaChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const canvas = firmaCanvas.value!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const brightness = (d[i]! + d[i + 1]! + d[i + 2]!) / 3;
        if (brightness > 200) d[i + 3] = 0; // quitar fondo claro
      }
      ctx.putImageData(imageData, 0, 0);
      form.value.firma = canvas.toDataURL('image/png');
    };
    img.src = ev.target?.result as string;
  };
  reader.readAsDataURL(file);
  (e.target as HTMLInputElement).value = '';
}

const initialForm: Usuario = {
  id: null,
  nombre: '',
  username: '',
  password: '',
  nip: '',
  rol_id: null,
  sede_id: null,
  firma: '',
  departamento: '',
  telefono: '',
  activo: true,
};

const form = ref<Usuario>({ ...initialForm });

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const },
  { name: 'username', label: 'Email', field: 'username', align: 'left' as const },
  { name: 'nombre_rol', label: 'Rol', field: 'nombre_rol', align: 'left' as const },
  { name: 'nombre_sede', label: 'Sede', field: 'nombre_sede', align: 'left' as const },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' as const },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right' as const },
];

watch(
  () => authStore.sedeActivaId,
  () => {
    void cargarData();
  },
);

const cargarData = async () => {
  loading.value = true;
  if (window.navigator.onLine) {
    try {
      if (authStore.listaSedes.length === 0) await authStore.cargarSedes();

      // Tipamos explícitamente la respuesta como Usuario[]

      // Admin global (user.sede_id === 0) siempre pide sedeId=0 → ve todos los usuarios
      const sedeIdQuery = authStore.esAdminGlobal ? 0 : (authStore.sedeActivaId ?? 0);
      const [resUsers, resRoles] = await Promise.allSettled([
        api.get<Usuario[]>('/api/usuarios', { params: { sedeId: sedeIdQuery } }),
        api.get<Rol[]>('/api/roles'),
      ]);

      if (resUsers.status === 'fulfilled') {
        usuariosStore.listaUsuarios = Array.isArray(resUsers.value.data) ? resUsers.value.data : [];
      } else {
        console.warn('Error cargando usuarios:', resUsers.reason);
      }
      if (resRoles.status === 'fulfilled') {
        usuariosStore.listaRoles = Array.isArray(resRoles.value.data) ? resRoles.value.data : [];
      } else {
        console.warn('Error cargando roles:', resRoles.reason);
      }
    } catch (err) {
      console.warn('Error cargando datos', err);
    }
  }

  // 1. Mapeamos y aseguramos que cada objeto sea tratado como 'Usuario'
  const datosMezclados = (Array.isArray(usuariosStore.listaUsuarios) ? usuariosStore.listaUsuarios as Usuario[] : []).map((uServidor) => {
    const cambioPendiente = offlineStore.colaUsuarios.find((p) => p.id === uServidor.id);

    // Creamos una copia limpia para evitar problemas de referencia
    const usuarioFinal: Usuario = cambioPendiente
      ? { ...uServidor, ...cambioPendiente }
      : { ...uServidor };

    // Buscamos la sede en el catálogo (que usa .nombre según tu API)
    const sedeObj = authStore.listaSedes.find((s) => s.id === usuarioFinal.sede_id);

    // Asignamos el texto a mostrar en la columna 'nombre_sede' de la tabla
    usuarioFinal.nombre_sede = sedeObj?.nombre || (usuarioFinal.sede_id === 0 ? 'Global' : 'N/A');

    return usuarioFinal;
  });

  // Asignamos el resultado a la tabla
  usuarios.value = datosMezclados;


  loading.value = false;
};

function abrirModal() {
  form.value = { ...initialForm };
  // Si no es admin global, se le asigna su propia sede automáticamente
  if (!authStore.esAdminGlobal) {
    form.value.sede_id = authStore.user?.sede_id || null;
  } else {
    // Si es global, sugerimos la sede que está viendo actualmente
    form.value.sede_id = authStore.sedeActivaId;
  }
  modal.value = true;
}

function editar(usuario: Usuario) {
  form.value = { ...usuario, password: '' };
  modal.value = true;
}

async function guardar() {
  if (
    !form.value.nombre ||
    !form.value.username ||
    !form.value.rol_id ||
    form.value.sede_id === null
  ) {
    Notify.create({ type: 'warning', message: 'Nombre, Email, Rol y Sede son obligatorios' });
    return;
  }

  if (!window.navigator.onLine) {
    // Lógica Offline (Igual a la que tienes, solo asegúrate de incluir sede_id en el objeto 'pendiente')
    Notify.create({
      type: 'warning',
      message: 'Modo offline no implementado para sede_id en este ejemplo',
    });
    return;
  }

  try {
    loading.value = true;
    if (form.value.id) {
      await api.put(`/api/usuarios/${form.value.id}`, form.value);
      if (form.value.nip && form.value.nip.length >= 4) {
        await api.post(`/api/usuarios/${form.value.id}/nip`, { nip: form.value.nip });
      }
      Notify.create({ type: 'positive', message: 'Usuario actualizado' });
    } else {
      await api.post('/api/usuarios', form.value);
      Notify.create({ type: 'positive', message: 'Usuario creado. El usuario debe configurar su NIP de firma desde la edición.' });
    }
    modal.value = false;
    await cargarData();
  } catch {
    Notify.create({ type: 'negative', message: 'Error en la operación' });
  } finally {
    loading.value = false;
  }
}

onMounted(() => void cargarData());
</script>
