<template>
  <div class="id-overlay">
    <div class="id-container">

      <!-- ── Header ─────────────────────────────────────────────── -->
      <div class="id-header">
        <div class="id-header-left">
          <q-icon name="wb_sunny" size="30px" color="white" class="q-mr-sm" />
          <div>
            <div class="id-title">INICIO DE DÍA</div>
            <div class="id-subtitle">{{ fechaFormateada }}</div>
          </div>
        </div>
        <div class="row items-center q-gutter-sm">
          <q-chip color="white" text-color="orange-9" icon="place" dense>
            {{ authStore.nombreSedeActiva }}
          </q-chip>
          <q-chip color="orange-9" text-color="white" icon="schedule" dense>
            {{ horaActual }}
          </q-chip>
        </div>
      </div>

      <!-- ── Cuerpo ──────────────────────────────────────────────── -->
      <div class="id-body">

        <!-- Cargando -->
        <div v-if="cargando" class="id-loading">
          <q-spinner-dots color="orange-8" size="48px" />
          <div class="q-mt-sm text-grey-6">Cargando datos del personal...</div>
        </div>

        <!-- ── ADMIN / GERENTE: todas las secciones ──────────────── -->
        <template v-else-if="esAdminOGerente">
          <div class="id-grid">
            <div v-for="sec in seccionesConRoles" :key="sec.codigo"
              class="id-sec-card" :style="{ borderTop: `4px solid ${sec.color}` }">

              <div class="id-sec-title" :style="{ color: sec.color }">
                <q-icon :name="sec.icono" size="18px" class="q-mr-xs" />
                {{ sec.nombre }}
                <q-badge :color="seccionCubierta(sec.codigo) ? 'green' : 'orange'" class="q-ml-auto">
                  {{ asignacionesCubiertas(sec.codigo) }}/{{ sec.roles.length }}
                </q-badge>
              </div>

              <!-- Posición por cada rol de la sección -->
              <div v-for="rol in sec.roles" :key="rol.rol_id" class="id-puesto-row">
                <div class="id-puesto-label">
                  <q-icon :name="rol.es_supervisor ? 'manage_accounts' : 'engineering'"
                    size="14px" :color="rol.es_supervisor ? 'orange-8' : 'grey-5'" class="q-mr-xs" />
                  {{ formatRol(rol.nombre_rol) }}
                </div>
                <q-select v-model="asignaciones[rol.rol_id]"
                  :options="personalDeSeccion(sec.codigo)"
                  emit-value map-options dense outlined clearable
                  :popup-content-style="{ zIndex: '10000' }"
                  placeholder="Sin asignar"
                  :bg-color="asignaciones[rol.rol_id] ? 'green-1' : undefined"
                  class="id-select" />
              </div>

              <div v-if="sec.roles.length === 0" class="id-empty">Sin roles configurados</div>
            </div>
          </div>
        </template>

        <!-- ── SUPERVISOR: su sección con posiciones ─────────────── -->
        <template v-else-if="esSupervisor && seccionPropia">
          <div class="id-single">
            <div class="id-sec-card"
              :style="{ borderTop: `4px solid ${seccionPropia.color}`, maxWidth: '480px' }">

              <div class="id-sec-title" :style="{ color: seccionPropia.color }">
                <q-icon :name="seccionPropia.icono" size="18px" class="q-mr-xs" />
                {{ seccionPropia.nombre }}
                <q-badge color="blue-7" text-color="white" dense class="q-ml-auto">Supervisor</q-badge>
              </div>

              <div v-for="rol in rolesDeSeccionPropia" :key="rol.rol_id" class="id-puesto-row">
                <div class="id-puesto-label">
                  <q-icon :name="rol.es_supervisor ? 'manage_accounts' : 'engineering'"
                    size="14px" :color="rol.es_supervisor ? 'orange-8' : 'grey-5'" class="q-mr-xs" />
                  {{ formatRol(rol.nombre_rol) }}
                </div>
                <!-- Puesto del supervisor: pre-llenado con él mismo, no editable -->
                <div v-if="rol.es_supervisor" class="id-yo-badge">
                  <q-icon name="check_circle" color="green-7" size="16px" class="q-mr-xs" />
                  <span>{{ authStore.user?.nombre_completo }}</span>
                </div>
                <!-- Otros puestos: dropdown de usuarios de la sección -->
                <q-select v-else
                  v-model="asignaciones[rol.rol_id]"
                  :options="personalDeSeccion(seccionPropia.codigo)"
                  emit-value map-options dense outlined clearable
                  :popup-content-style="{ zIndex: '10000' }"
                  placeholder="Seleccionar..."
                  :bg-color="asignaciones[rol.rol_id] ? 'green-1' : undefined"
                  class="id-select" />
              </div>

              <div v-if="rolesDeSeccionPropia.length === 0" class="id-empty">
                Sin roles configurados para esta sección
              </div>
            </div>
          </div>
        </template>

        <!-- ── ASISTENTE: esperando que el supervisor inicie tras decir "Sí" ── -->
        <template v-else-if="esAsistente && esperandoSupervisorInicie">
          <div class="id-waiting">
            <q-icon name="access_time" size="56px" color="blue-7" />
            <div class="id-waiting-title">Esperando al supervisor</div>
            <div class="id-waiting-sub">
              Notificaste que el supervisor está presente.<br>
              Espera a que <strong>inicie sesión</strong> para comenzar el día.
            </div>
            <q-btn outline color="blue-7" icon="refresh" label="Verificar de nuevo"
              :loading="cargando" class="q-mt-lg" @click="cargar" />
          </div>
        </template>

        <!-- ── ASISTENTE: pregunta supervisor + posiciones ─────────── -->
        <template v-else-if="esAsistente && seccionPropia">
          <div class="id-single">
            <div class="id-sec-card"
              :style="{ borderTop: `4px solid ${seccionPropia.color}`, maxWidth: '480px' }">

              <div class="id-sec-title" :style="{ color: seccionPropia.color }">
                <q-icon :name="seccionPropia.icono" size="18px" class="q-mr-xs" />
                {{ seccionPropia.nombre }}
                <q-badge color="teal-7" text-color="white" dense class="q-ml-auto">Asistente</q-badge>
              </div>

              <!-- Pregunta clave -->
              <div class="id-pregunta-card">
                <div class="id-pregunta-label">
                  <q-icon name="help_outline" color="orange-8" size="18px" class="q-mr-xs" />
                  ¿Asistió el supervisor hoy?
                </div>
                <div class="row q-gutter-sm q-mt-sm">
                  <q-btn unelevated
                    :color="supervisorAsistio === true ? 'green-7' : 'grey-3'"
                    :text-color="supervisorAsistio === true ? 'white' : 'grey-7'"
                    icon="check_circle" label="Sí" size="sm" class="q-px-md"
                    @click="supervisorAsistio = true" />
                  <q-btn unelevated
                    :color="supervisorAsistio === false ? 'red-7' : 'grey-3'"
                    :text-color="supervisorAsistio === false ? 'white' : 'grey-7'"
                    icon="cancel" label="No" size="sm" class="q-px-md"
                    @click="supervisorAsistio = false" />
                </div>
              </div>

              <!-- SI asistió → mensaje para que el supervisor inicie sesión -->
              <template v-if="supervisorAsistio === true">
                <div class="id-aviso-card">
                  <q-icon name="info" color="blue-7" size="22px" class="q-mr-sm" />
                  <div>
                    <div class="text-weight-bold text-blue-9">Supervisor presente</div>
                    <div class="text-caption text-grey-7 q-mt-xs">
                      Favor de solicitarle al supervisor que inicie sesión para comenzar el día.
                    </div>
                  </div>
                </div>
              </template>

              <!-- SI NO asistió → el asistente cubre como supervisor; seleccionar quién es el analista -->
              <template v-else-if="supervisorAsistio === false">
                <div class="id-sec-divider id-sec-divider--warn">
                  <q-icon name="person_search" color="orange-8" size="14px" class="q-mr-xs" />
                  ¿Quién va a ser el analista de hoy?
                </div>
                <q-select v-model="suplementoAnalista"
                  :options="personalAnalistas"
                  outlined dense clearable
                  :popup-content-style="{ zIndex: '10000' }"
                  label="Selecciona el analista"
                  class="q-mt-sm"
                  :bg-color="suplementoAnalista ? 'teal-1' : undefined">
                  <template v-slot:prepend>
                    <q-icon name="engineering" color="teal-7" />
                  </template>
                </q-select>
              </template>

            </div>
          </div>
        </template>

        <!-- ── ANALISTA: pantalla de espera ──────────────────────── -->
        <template v-else>
          <div class="id-waiting">
            <q-icon name="hourglass_top" size="56px" color="orange-8" />
            <div class="id-waiting-title">Esperando inicio de jornada</div>
            <div class="id-waiting-sub">
              Por favor espera a que el <strong>supervisor</strong> o
              <strong>asistente</strong> de tu sección inicie el día.
            </div>
            <q-btn outline color="orange-8" icon="refresh" label="Verificar de nuevo"
              :loading="cargando" class="q-mt-lg" @click="cargar" />
          </div>
        </template>

      </div>

      <!-- ── Footer ─────────────────────────────────────────────── -->
      <div class="id-footer" v-if="!cargando && puedeActuar">
        <div class="id-footer-hint">
          <q-icon name="info" size="14px" color="grey-5" />
          <span v-if="esAdminOGerente" class="text-grey-6 text-caption q-ml-xs">
            Al confirmar, el sistema quedará desbloqueado para todos.
          </span>
          <span v-else class="text-grey-6 text-caption q-ml-xs">
            Al confirmar podrás acceder al sistema.
          </span>
        </div>
        <div class="id-footer-actions">
          <q-btn v-if="esAdminOGerente"
            unelevated color="orange-8" icon="wb_sunny"
            label="Iniciar Día de Trabajo"
            :loading="guardando" size="md" class="q-px-xl"
            @click="guardar(true)" />
          <!-- ASISTENTE dijo Sí: pasa a pantalla de espera (NO desbloquea) -->
          <q-btn v-else-if="esAsistente && supervisorAsistio === true && !esperandoSupervisorInicie"
            unelevated color="blue-7" icon="check"
            label="Entendido"
            size="md" class="q-px-lg"
            @click="esperandoSupervisorInicie = true" />
          <!-- ASISTENTE dijo No o no respondió / SUPERVISOR: marca el día como completo -->
          <q-btn v-else
            unelevated color="teal-7" icon="check_circle"
            label="Confirmar"
            :loading="guardando" size="md" class="q-px-lg"
            :disable="esAsistente && supervisorAsistio === null"
            @click="guardar(true)" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

const emit = defineEmits<{ (e: 'completado'): void }>();
const authStore = useAuthStore();

// ── Secciones (metadatos visuales) ────────────────────────────────────────
const SECCIONES = [
  { codigo: 'BASCULA', nombre: 'Báscula',  icono: 'scale',                   color: '#1565C0' },
  { codigo: 'VOLCADO', nombre: 'Volcado',  icono: 'move_to_inbox',            color: '#2E7D32' },
  { codigo: 'PROCESO', nombre: 'Proceso',  icono: 'precision_manufacturing',  color: '#E65100' },
  { codigo: 'ALMACEN', nombre: 'Almacén',  icono: 'warehouse',                color: '#6A1B9A' },
];

// ── Interfaces ────────────────────────────────────────────────────────────
interface RolSeccion {
  rol_id: number;
  nombre_rol: string;
  seccion: string;
  tipo_inicio_dia: string | null;
  es_supervisor: boolean;
}

interface PersonalItem {
  id: number;
  nombre: string;
  nombre_rol: string;
  seccion: string | null;
  es_supervisor: boolean;
}

// ── Estado ────────────────────────────────────────────────────────────────
const cargando   = ref(false);
const guardando  = ref(false);
const rolesSeccion = ref<RolSeccion[]>([]);
const personal     = ref<PersonalItem[]>([]);

// asignaciones[rol_id] = usuario_id seleccionado para ese puesto
const asignaciones = ref<Record<number, number | null>>({});

// Estado del flujo ASISTENTE
const supervisorAsistio        = ref<boolean | null>(null);
const esperandoSupervisorInicie = ref(false); // true cuando ASISTENTE dijo "Sí" y espera que el supervisor inicie
// Objeto completo para evitar el quirk de emit-value/map-options con datos dinámicos
const suplementoAnalista = ref<{ label: string; value: number } | null>(null);

// ── Hora viva ──────────────────────────────────────────────────────────────
const horaActual = ref('');
let timerHora: ReturnType<typeof setInterval> | null = null;
const actualizarHora = () => {
  horaActual.value = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};
onMounted(() => { actualizarHora(); timerHora = setInterval(actualizarHora, 30_000); void cargar(); });
onBeforeUnmount(() => { if (timerHora) clearInterval(timerHora); });

const fechaFormateada = computed(() =>
  new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
);

// ── Roles del usuario logueado ─────────────────────────────────────────────
const tipoInicioDia   = computed(() => authStore.user?.tipo_inicio_dia?.toUpperCase() ?? null);
const esAdminOGerente = computed(() => {
  const rol = authStore.user?.nombre_rol?.toUpperCase() ?? '';
  return rol === 'ADMIN' || rol.includes('ADMIN') || rol.includes('GERENTE');
});
const esSupervisor = computed(() => tipoInicioDia.value === 'SUPERVISOR');
const esAsistente  = computed(() => tipoInicioDia.value === 'ASISTENTE');
const puedeActuar  = computed(() => esAdminOGerente.value || esSupervisor.value || esAsistente.value);

const seccionPropia = computed(() => {
  const seccion = authStore.user?.seccion_inicio_dia?.toUpperCase().trim();
  if (!seccion) return null;
  return SECCIONES.find(s => s.codigo === seccion) ?? null;
});

// ── Helpers de datos ──────────────────────────────────────────────────────
function personalDeSeccion(seccion: string): { label: string; value: number }[] {
  return personal.value
    .filter(p => p.seccion === seccion)
    .map(p => ({ label: p.nombre, value: p.id }));
}

const rolesDeSeccionPropia = computed(() =>
  seccionPropia.value
    ? rolesSeccion.value.filter(r => r.seccion === seccionPropia.value!.codigo)
    : []
);


// Analistas de la sección propia (para cuando el supervisor está ausente)
// Fuente: dbo.usuarios JOIN dbo.roles WHERE seccion_inicio_dia IS NOT NULL AND tipo != SUPERVISOR
const personalAnalistas = computed(() => {
  if (!seccionPropia.value) {
    console.log('[personalAnalistas] seccionPropia es null → retorna []');
    return [];
  }
  const todos = personal.value.filter(p => p.seccion === seccionPropia.value!.codigo);
  const noSupervisores = todos.filter(p => !p.es_supervisor);
  const resultado = noSupervisores.map(p => ({ label: p.nombre, value: p.id }));
  console.log('[personalAnalistas] seccion buscada:', seccionPropia.value.codigo);
  console.log('[personalAnalistas] todos en sección:', JSON.stringify(todos));
  console.log('[personalAnalistas] no-supervisores:', JSON.stringify(noSupervisores));
  console.log('[personalAnalistas] opciones finales para q-select:', JSON.stringify(resultado));
  return resultado;
});

// Para el grid del admin
const seccionesConRoles = computed(() =>
  SECCIONES.map(sec => ({
    ...sec,
    roles: rolesSeccion.value.filter(r => r.seccion === sec.codigo),
  }))
);

function asignacionesCubiertas(seccion: string): number {
  return rolesSeccion.value
    .filter(r => r.seccion === seccion)
    .filter(r => asignaciones.value[r.rol_id] != null).length;
}

function seccionCubierta(seccion: string): boolean {
  const roles = rolesSeccion.value.filter(r => r.seccion === seccion);
  return roles.length > 0 && roles.every(r => asignaciones.value[r.rol_id] != null);
}

// Formato legible del nombre del rol: SUPERVISOR_PRODUCCION → Supervisor de Producción
function formatRol(nombre: string): string {
  const partes = nombre.split('_');
  if (partes.length < 2 || !partes[0] || !partes[1]) return nombre;
  const tipo  = partes[0].charAt(0).toUpperCase() + partes[0].slice(1).toLowerCase();
  const resto = partes.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  return `${tipo} de ${resto}`;
}

// ── Carga ──────────────────────────────────────────────────────────────────
async function cargar() {
  cargando.value = true;
  try {
    const sedeId  = authStore.sedeActivaId ?? 0;
    const seccion = authStore.user?.seccion_inicio_dia ?? null;
    const { data } = await api.get('/api/inicio-dia/hoy', { params: { sedeId, seccion } });

    if (data.completo) { emit('completado'); return; }

    rolesSeccion.value = data.roles_seccion ?? [];
    personal.value     = data.personal ?? [];

    // ── DEBUG ──────────────────────────────────────────────────────────────
    console.log('[InicioDia] sedeId usado:', sedeId);
    console.log('[InicioDia] personal RAW desde API:', JSON.stringify(data.personal));
    console.log('[InicioDia] seccion_inicio_dia del usuario logueado:', authStore.user?.seccion_inicio_dia);
    console.log('[InicioDia] tipo_inicio_dia del usuario logueado:', authStore.user?.tipo_inicio_dia);
    // ───────────────────────────────────────────────────────────────────────

    // Inicializar asignaciones vacías
    const mapa: Record<number, number | null> = {};
    for (const r of rolesSeccion.value) mapa[r.rol_id] = null;

    // Pre-llenar con asignaciones ya guardadas
    for (const a of (data.asistencias ?? [])) {
      // Buscar el rol del usuario para pre-llenar su posición
      const usuarioEnPersonal = personal.value.find(p => p.id === a.usuario_id);
      if (usuarioEnPersonal) {
        const rolDelUsuario = rolesSeccion.value.find(
          r => r.seccion === usuarioEnPersonal.seccion && r.nombre_rol === usuarioEnPersonal.nombre_rol
        );
        if (rolDelUsuario && a.asistio) mapa[rolDelUsuario.rol_id] = a.usuario_id;
      }
    }

    // Pre-llenar puesto del supervisor con él mismo
    if (esSupervisor.value && seccionPropia.value) {
      const rolSupervisor = rolesDeSeccionPropia.value.find(r => r.es_supervisor);
      if (rolSupervisor) {
        mapa[rolSupervisor.rol_id] = mapa[rolSupervisor.rol_id] ?? (authStore.user?.usuario_id ?? null);
      }
    }

    asignaciones.value = mapa;
    supervisorAsistio.value         = null;
    suplementoAnalista.value        = null;
    esperandoSupervisorInicie.value = false;

  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar datos del día' });
  } finally {
    cargando.value = false;
  }
}

// ── Guardar ────────────────────────────────────────────────────────────────
async function guardar(marcarCompleto: boolean) {
  if (esAsistente.value && supervisorAsistio.value === null) {
    Notify.create({ type: 'warning', message: 'Indica si el supervisor asistió' });
    return;
  }
  // suplenteSupervisorId es opcional: el analista de respaldo puede estar vacío

  guardando.value = true;
  try {
    const sedeId       = authStore.sedeActivaId ?? 0;
    const registradoPor = authStore.user?.usuario_id;
    // seccion: null para ADMIN (cubre todo), código de sección para supervisor/asistente
    const seccion = esAdminOGerente.value ? null : (seccionPropia.value?.codigo ?? null);

    const asistenciasPayload: Array<{ usuarioId: number; asistio: boolean }> = [];

    if (esAsistente.value && supervisorAsistio.value === false) {
      // Supervisor ausente: registrar supervisor como no asistió, y el analista asignado como sí
      const supervisorEnPersonal = personal.value.find(
        p => p.seccion === seccionPropia.value?.codigo && p.es_supervisor
      );
      if (supervisorEnPersonal) asistenciasPayload.push({ usuarioId: supervisorEnPersonal.id, asistio: false });
      if (suplementoAnalista.value) asistenciasPayload.push({ usuarioId: suplementoAnalista.value.value, asistio: true });
    } else {
      // Convertir asignaciones (rol_id → usuario_id) a lista de asistencias
      const rolesAGuardar = esAdminOGerente.value
        ? rolesSeccion.value
        : rolesDeSeccionPropia.value;

      for (const rol of rolesAGuardar) {
        const uid = asignaciones.value[rol.rol_id];
        if (uid != null) asistenciasPayload.push({ usuarioId: uid, asistio: true });
      }
    }

    await api.post('/api/inicio-dia/guardar', {
      sedeId,
      registradoPor,
      marcarCompleto,
      seccion,
      asistencias: asistenciasPayload,
    });

    Notify.create({
      type: 'positive',
      message: marcarCompleto ? '¡Día de trabajo iniciado!' : 'Sección confirmada',
    });

    // Tanto el admin (marcarCompleto=true) como el supervisor/asistente cierran el modal al confirmar
    emit('completado');

  } catch {
    Notify.create({ type: 'negative', message: 'Error al guardar' });
  } finally {
    guardando.value = false;
  }
}
</script>

<style scoped>
.id-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(10, 15, 40, 0.97);
  display: flex; align-items: flex-start; justify-content: center;
  overflow-y: auto; padding: 24px 16px 40px;
}
.id-container {
  width: 100%; max-width: 960px; border-radius: 12px;
  overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,0.6);
}
.id-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px;
  background: linear-gradient(135deg, #E65100 0%, #BF360C 100%);
}
.id-header-left { display: flex; align-items: center; }
.id-title { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: 2px; }
.id-subtitle { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 2px; text-transform: capitalize; }

.id-body { background: #f0f2f5; padding: 20px; min-height: 260px; }
.id-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; }

/* Grid admin */
.id-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; }
.id-sec-card { background: #fff; border-radius: 8px; padding: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
.id-sec-title {
  font-size: 12px; font-weight: 700; letter-spacing: 1px;
  text-transform: uppercase; display: flex; align-items: center; margin-bottom: 12px;
}

/* Fila de puesto */
.id-puesto-row { margin-bottom: 10px; }
.id-puesto-label {
  font-size: 12px; color: #555; margin-bottom: 4px;
  display: flex; align-items: center; font-weight: 500;
}
.id-select { font-size: 13px; }

/* Yo mismo (supervisor pre-llenado) */
.id-yo-badge {
  display: flex; align-items: center;
  padding: 6px 10px; background: #e8f5e9; border: 1px solid #a5d6a7;
  border-radius: 6px; font-size: 13px; font-weight: 600; color: #2e7d32;
}

.id-empty { font-size: 12px; color: #bbb; text-align: center; padding: 12px 0; }

.id-sec-divider {
  font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase;
  letter-spacing: 0.5px; border-top: 1px solid #eee;
  padding-top: 10px; margin: 12px 0 8px; display: flex; align-items: center;
}
.id-sec-divider--warn { color: #e65100; border-top-color: #ffe0b2; }

.id-pregunta-card {
  background: #fff8e1; border: 1px solid #ffe082; border-radius: 8px;
  padding: 12px 14px; margin-bottom: 10px;
}
.id-pregunta-label { font-size: 13px; font-weight: 600; color: #555; display: flex; align-items: center; }

.id-single { display: flex; justify-content: center; }
.id-single .id-sec-card { width: 100%; }

.id-aviso-card {
  display: flex; align-items: flex-start;
  background: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px;
  padding: 14px 16px; margin-top: 8px;
}

.id-waiting { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; text-align: center; }
.id-waiting-title { font-size: 18px; font-weight: 700; color: #333; margin-top: 16px; }
.id-waiting-sub { font-size: 14px; color: #888; margin-top: 8px; line-height: 1.6; }

.id-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; background: #fff; border-top: 1px solid #e8e8e8; gap: 12px;
}
.id-footer-hint { display: flex; align-items: center; }
.id-footer-actions { display: flex; gap: 10px; }

@media (max-width: 600px) {
  .id-grid { grid-template-columns: 1fr; }
  .id-footer { flex-direction: column; align-items: stretch; }
  .id-footer-actions { flex-direction: column; }
}
</style>
