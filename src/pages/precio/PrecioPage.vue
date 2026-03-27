<template>
  <q-page>
    <q-banner v-if="!isOnline" class="bg-red-2 text-red-9 q-mb-sm" dense>
      <template #avatar><q-icon name="cloud_off" color="red-9" /></template>
      Modo sin conexión — las autorizaciones se guardarán localmente y se sincronizarán al volver la red.
    </q-banner>
    <PrecioScreen
      :boletas-precios="boletasPrecios"
      :tick-tiempo="tickTiempo"
      :tiempo-autorizacion-automatica="configuracion.minutosParaAutorizacion"
      @seleccionar-boleta="abrirDialogoDetalle"
      @export-excel="exportarExcel"
    />

    <!-- Modal de Autorización de Precio -->
    <ModalAutorizacionPrecio
      v-model="mostrarDialogo"
      :selected-boleta="boletaSeleccionada"
      v-model:selected-precio="selectedPrecio"
      v-model:justificacion="justificacion"
      :calcular-precios-disponibles="calcularPreciosDisponibles"
      :precio-base-u-s-d="precioBaseUSD"
      :tipo-cambio-f-i-x="tipoCambioFIX"
      :tabla-calibre="tablaCalibre"
      :modo="modoModal"
      @close="cerrarModal"
      @autorizar="(pc?: number, dc?: number) => autorizarPrecio(pc, dc)"
      @rechazar="rechazarPrecio"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import PrecioScreen from 'src/components/precio/PrecioScreen.vue';
import ModalAutorizacionPrecio from 'src/components/precio/ModalAutorizacionPrecio.vue';
import type { BoletaPrecio } from 'src/types/precio';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import { useOfflineStore } from 'src/stores/offlineStore';

// Tipos para los catálogos
interface CalibreDescuento {
  id: number;
  calibre: string;
  descuento_kg_ton: number;
  codigo?: string;
}

interface NivelExportacion {
  id: number;
  codigo: string;
  porcentaje_export_label: string;
  precio_final_mxn: number;
  descuento_precio_id: number | null;
  vigente: boolean;
  sede_id: number;
}

interface DescuentoPrecio {
  id: number;
  codigo: string;
  descuento_mxn: number;
}

// Estado
const offlineStore = useOfflineStore();
const isOnline = ref(window.navigator.onLine);
const boletasPrecios = ref<BoletaPrecio[]>([]);
const tickTiempo = ref(0);
const loading = ref(false);

const configuracion = ref({
  minutosParaAutorizacion: 30,
  habilitarAutorizacionAutomatica: false,
  toleranciaPrecioPct: 5.0,
});

// Modal
const mostrarDialogo = ref(false);
const boletaSeleccionada = ref<BoletaPrecio | null>(null);
const selectedPrecio = ref('');
const justificacion = ref('');
const modoModal = ref<'autorizar' | 'renegociar'>('autorizar');

// Datos para el modal
const precioBaseUSD = ref('28.50');
const tipoCambioFIX = ref('20.00');
const tablaCalibre = ref<CalibreDescuento[]>([]);
const nivelesExportacion = ref<NivelExportacion[]>([]);
const catalogoDescuentos = ref<DescuentoPrecio[]>([]);

// Timer para actualizar el tick de tiempo
let timerInterval: ReturnType<typeof setInterval> | null = null;

// Cargar configuración desde configuracion_sistema
const cargarConfiguracion = async () => {
  try {
    // Cargar desde configuracion_sistema que tiene tiempo_autorizacion_auto
    const { data } = await api.get('/api/configuracion');
    configuracion.value = {
      minutosParaAutorizacion: data.tiempo_autorizacion_auto || 30,
      habilitarAutorizacionAutomatica: true,
      toleranciaPrecioPct: 5.0,
    };
  } catch (error) {
    console.error('Error al cargar configuración:', error);
  }
};

// Cargar catálogos (calibres, niveles de exportación, descuentos) filtrados por grano
const cargarCatalogos = async (granoId?: number) => {
  try {
    const params: Record<string, unknown> = {};
    if (granoId) params.granoId = granoId;

    const { data } = await api.get('/api/Reglas-Precio/catalogos', { params });

    // Mapear los datos de los catálogos
    tablaCalibre.value = data.calibres || [];
    nivelesExportacion.value = data.export || [];
    catalogoDescuentos.value = data.precios || [];
  } catch (error) {
    console.error('Error al cargar catálogos:', error);
  }
};

// Cargar boletas desde el backend
const cargarBoletas = async () => {
  try {
    const { data } = await api.get('/api/precio');
    boletasPrecios.value = data;
  } catch (error) {
    console.error('Error al cargar boletas:', error);
    Notify.create({
      type: 'negative',
      message: 'Error al cargar boletas de precio',
    });
  }
};

// Calcular precios disponibles con formula acumulativa:
// P1 = precio base, P2 = P1 - descuento_P2, P3 = P2 - descuento_P3, etc.

const GARBANZO_ID = 4;

const calcularPreciosDisponibles = () => {
  if (!boletaSeleccionada.value) return [];

  // --- FRIJOL: mostrar todos los calibres con su precio (descuento_kg_ton), orden inverso (70 primero) ---
  if (boletaSeleccionada.value.tipoGrano === 'Frijol') {
    return tablaCalibre.value
      .map((c) => ({
        codigo: c.calibre,
        valor: Number(c.descuento_kg_ton) || 0,
      }))
      .reverse();
  }

  // --- GARBANZO: precio único calculado por clasificación (CLASIF) ---
  if (boletaSeleccionada.value.granoId === GARBANZO_ID) {
    return [{ codigo: 'CLASIF', valor: boletaSeleccionada.value.precioSugerido ?? 0 }];
  }

  // --- Otros granos: flujo normal con niveles de exportación ---
  const niveles = nivelesExportacion.value;
  if (!niveles || niveles.length === 0) return [];

  // 1. MAPA DE DESCUENTOS (P2, P3...)
  const descuentosMap = new Map<number, number>();
  if (catalogoDescuentos.value) {
    catalogoDescuentos.value.forEach((d) => {
      descuentosMap.set(d.id, Number(d.descuento_mxn) || 0);
    });
  }

  // 2. BUSCAR EL DESCUENTO POR CALIBRE
  const calibreBoleta = boletaSeleccionada.value.calibre;
  const infoCalibre = tablaCalibre.value.find((c) => c.calibre === calibreBoleta);
  const descuentoCalibreRaw = infoCalibre ? Number(infoCalibre.descuento_kg_ton) || 0 : 0;
  const descuentoCalibrePesos = descuentoCalibreRaw / 1000;

  const resultado = [];
  let precioAcumulado = 0;

  for (const [i, nivel] of niveles.entries()) {
    if (i === 0) {
      const precioBaseRaw = Number(nivel.precio_final_mxn) || 0;
      const precioBasePesos = precioBaseRaw / 1000;
      precioAcumulado = precioBasePesos - descuentoCalibrePesos;
    } else {
      const descuentoId = nivel.descuento_precio_id;
      const descNivelRaw = descuentoId ? descuentosMap.get(descuentoId) || 0 : 0;
      precioAcumulado = precioAcumulado - descNivelRaw / 1000;
    }

    resultado.push({
      codigo: nivel.codigo || `P${i + 1}`,
      valor: isNaN(precioAcumulado) ? 0 : precioAcumulado,
    });
  }
  return resultado;
};

// Abrir diálogo con detalle de la boleta
const abrirDialogoDetalle = async (
  boleta: BoletaPrecio,
  tab: 'autorizar' | 'renegociar' = 'autorizar',
) => {
  boletaSeleccionada.value = boleta;
  selectedPrecio.value = boleta.precioSugeridoCodigo || 'BASE';
  justificacion.value = '';
  modoModal.value = tab;

  // Recargar catálogos filtrados por el grano de esta boleta
  if (boleta.granoId) {
    await cargarCatalogos(boleta.granoId);
  }

  mostrarDialogo.value = true;
};

// Cerrar modal
const cerrarModal = () => {
  mostrarDialogo.value = false;
  boletaSeleccionada.value = null;
  selectedPrecio.value = '';
  justificacion.value = '';
};

// Obtener el número de nivel del código (P1=1, P2=2, etc.)
function getNivelFromCodigo(codigo: string | null | undefined): number {
  if (!codigo) return 999;
  const match = codigo.match(/P(\d+)/);
  return match && match[1] ? parseInt(match[1], 10) : 999;
}

// Autorizar precio
const autorizarPrecio = async (precioCustom?: number, descuentoCustom?: number) => {
  if (!boletaSeleccionada.value) return;

  try {
    loading.value = true;

    const esFrijolBoleta = boletaSeleccionada.value.tipoGrano === 'Frijol';

    // Encontrar el valor del precio seleccionado de la lista
    const preciosDisponibles = calcularPreciosDisponibles();
    const precioSeleccionadoItem = preciosDisponibles.find(
      (p) => p.codigo === selectedPrecio.value,
    );

    // Si es calibre > 96 con precio custom, usar ese valor
    let precioValor: number;
    if (precioCustom && precioCustom > 0) {
      precioValor = precioCustom;
    } else {
      precioValor = precioSeleccionadoItem?.valor || boletaSeleccionada.value.precioSugerido;
    }

    // Determinar tipo de autorización
    let tipoAutorizacion: string;

    const esGarbanzoBoleta = boletaSeleccionada.value.granoId === GARBANZO_ID;

    if (esFrijolBoleta) {
      // Para frijol: comparar por valor de precio
      const codigoSugerido = boletaSeleccionada.value.precioSugeridoCodigo;
      const valorSugerido = preciosDisponibles.find((p) => p.codigo === codigoSugerido)?.valor || 0;
      if (precioValor > valorSugerido) {
        tipoAutorizacion = 'CC';
      } else {
        tipoAutorizacion = 'NORMAL';
      }
    } else if (esGarbanzoBoleta) {
      // Para garbanzo: precio único CLASIF, siempre NORMAL
      tipoAutorizacion = 'NORMAL';
    } else {
      // Para otros granos: comparar por nivel P
      const codigoSugerido = boletaSeleccionada.value.precioSugeridoCodigo;
      const nivelSugerido = getNivelFromCodigo(codigoSugerido);
      const nivelSeleccionado = getNivelFromCodigo(selectedPrecio.value);
      if (nivelSeleccionado < nivelSugerido) {
        tipoAutorizacion = 'CC';
      } else {
        tipoAutorizacion = 'NORMAL';
      }
    }

    if (!window.navigator.onLine) {
      offlineStore.agregarPrecio({
        tipo: 'autorizar',
        boletaPrecioId: boletaSeleccionada.value.id ?? 0,
        precioAutorizado: precioValor,
        observaciones: justificacion.value || '',
        tipoAutorizacion: tipoAutorizacion,
        _localId: 'LOCAL_PREC_' + Date.now(),
        _syncStatus: 'pending',
        _descripcion: `Autorizar precio boleta #${boletaSeleccionada.value.id}`,
      });
      Notify.create({ type: 'warning', icon: 'cloud_off', message: 'Sin conexión — autorización guardada localmente. Se sincronizará al volver la red.', timeout: 4000 });
      cerrarModal();
      loading.value = false;
      return;
    }

    if (modoModal.value === 'renegociar') {
      await api.post('/api/precio/renegociar', {
        boletaPrecioId: boletaSeleccionada.value.id,
        precioNuevo: precioValor,
        motivoRenegociacion: justificacion.value || 'Renegociación de precio',
        ...(descuentoCustom !== undefined ? { descuentoKg: descuentoCustom } : {}),
      });
      Notify.create({ type: 'positive', message: 'Precio renegociado y autorizado correctamente' });
    } else {
      await api.post('/api/precio/autorizar', {
        boletaPrecioId: boletaSeleccionada.value.id,
        precioAutorizado: precioValor,
        observaciones: justificacion.value || '',
        tipoAutorizacion: tipoAutorizacion,
        ...(descuentoCustom !== undefined ? { descuentoKg: descuentoCustom } : {}),
      });
      const mensajes: Record<string, string> = {
        CC: 'Precio autorizado CC correctamente',
        NORMAL: 'Precio autorizado correctamente',
      };
      Notify.create({ type: 'positive', message: mensajes[tipoAutorizacion] || 'Precio autorizado' });
    }

    cerrarModal();
    await cargarBoletas();
  } catch (error) {
    console.error('Error al autorizar precio:', error);
    Notify.create({ type: 'negative', message: 'Error al autorizar precio' });
  } finally {
    loading.value = false;
  }
};

// Rechazar precio (enviar a renegociación)
const rechazarPrecio = async () => {
  if (!boletaSeleccionada.value) return;

  try {
    loading.value = true;

    if (!window.navigator.onLine) {
      offlineStore.agregarPrecio({
        tipo: 'rechazar',
        boletaPrecioId: boletaSeleccionada.value.id ?? 0,
        motivoRechazo: justificacion.value || 'Rechazado por el productor',
        _localId: 'LOCAL_PREC_' + Date.now(),
        _syncStatus: 'pending',
        _descripcion: `Rechazar precio boleta #${boletaSeleccionada.value.id}`,
      });
      Notify.create({ type: 'warning', icon: 'cloud_off', message: 'Sin conexión — rechazo guardado localmente. Se sincronizará al volver la red.', timeout: 4000 });
      cerrarModal();
      loading.value = false;
      return;
    }

    await api.post('/api/precio/rechazar', {
      boletaPrecioId: boletaSeleccionada.value.id,
      motivoRechazo: justificacion.value || 'Rechazado por el productor',
    });

    Notify.create({
      type: 'info',
      message: 'Precio rechazado. Boleta enviada a renegociación.',
    });

    cerrarModal();
    await cargarBoletas();
  } catch (error) {
    console.error('Error al rechazar precio:', error);
    Notify.create({
      type: 'negative',
      message: 'Error al rechazar precio',
    });
  } finally {
    loading.value = false;
  }
};

// Exportar a Excel (placeholder)
const exportarExcel = () => {
  Notify.create({
    type: 'info',
    message: 'Función de exportación a Excel en desarrollo',
  });
};

// Iniciar el timer para actualizar el tiempo de espera cada minuto
const iniciarTimer = () => {
  timerInterval = setInterval(() => {
    tickTiempo.value++;
  }, 60000); // Cada 60 segundos
};

const _syncOnline = () => { isOnline.value = window.navigator.onLine; };

// Lifecycle hooks
onMounted(async () => {
  window.addEventListener('online', _syncOnline);
  window.addEventListener('offline', _syncOnline);

  await cargarConfiguracion();
  await cargarCatalogos();
  await cargarBoletas();
  iniciarTimer();

  // Recargar boletas cada 5 minutos
  const reloadInterval = setInterval(() => {
    void cargarBoletas();
  }, 300000); // 5 minutos

  // Limpiar interval al desmontar
  onUnmounted(() => {
    window.removeEventListener('online', _syncOnline);
    window.removeEventListener('offline', _syncOnline);
    if (timerInterval) clearInterval(timerInterval);
    clearInterval(reloadInterval);
  });
});
</script>
