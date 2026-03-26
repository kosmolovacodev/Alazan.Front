/**
 * useBascula.js — Composable para lectura de báscula REVUELTA ERCC via Web Serial API
 *
 * IMPORTANTE: La Web Serial API sólo funciona en contextos seguros:
 *   - https:// (producción con SSL)
 *   - http://localhost (desarrollo local)
 * No funcionará en http:// con dominio externo ni en iframes sin permiso.
 *
 * Hardware: Adaptador USB → RS-232 DB9 Hembra
 * Parámetros del puerto: 9600 baudios, 8 bits de datos, 1 bit de parada, sin paridad
 */

import { ref, computed, onUnmounted } from 'vue';

// Regex para extraer el valor numérico de la trama de la báscula.
// Ejemplo de trama: "ST,GS,+  125.50kg" o "ST,GS,+000125.50 kg"
// Captura: uno o más dígitos, punto decimal opcional, más dígitos opcionales
const REGEX_PESO = /[+-]?\s*(\d+\.?\d*)/;

// Umbral de estabilidad: si el peso no cambia más de este valor en 2 segundos, se considera estable
const UMBRAL_ESTABILIDAD_KG = 0.02;
const TIEMPO_ESTABILIDAD_MS = 2000;

export function useBascula() {
  // ─── Estado reactivo ──────────────────────────────────────────────────────
  const peso = ref(0);           // Último peso leído en kg
  const pesoTextoRaw = ref('');  // Trama original sin procesar
  const conectado = ref(false);  // true cuando el puerto está abierto y leyendo
  const cargando = ref(false);   // true durante el proceso de conexión/desconexión
  const error = ref('');         // Mensaje del último error ocurrido
  const isStable = ref(false);   // true si el peso no cambió ±0.02 kg en los últimos 2 s

  // ─── Referencias internas (no reactivas) ─────────────────────────────────
  let port = null;               // SerialPort activo
  let reader = null;             // ReadableStreamDefaultReader activo
  let readableStreamClosed = null; // Promesa del cierre del stream de texto
  // Variables para el cálculo de estabilidad
  let ultimoPesoParaEstabilidad = null;
  let timerEstabilidad = null;

  // ─── Computed helpers ─────────────────────────────────────────────────────

  /** Devuelve el peso formateado con 2 decimales como string, p.ej. "125.50" */
  const pesoFormateado = computed(() => peso.value.toFixed(2));

  /** Indica si la Web Serial API está disponible en este navegador/contexto */
  const serialDisponible = computed(() => 'serial' in navigator);

  // ─── Lógica de estabilidad ────────────────────────────────────────────────

  /**
   * Evalúa si el peso es estable comparando con la lectura anterior.
   * Se llama cada vez que llega una nueva lectura.
   */
  function actualizarEstabilidad(nuevoPeso) {
    if (ultimoPesoParaEstabilidad === null) {
      ultimoPesoParaEstabilidad = nuevoPeso;
      isStable.value = false;
      reiniciarTimerEstabilidad(nuevoPeso);
      return;
    }

    const diferencia = Math.abs(nuevoPeso - ultimoPesoParaEstabilidad);

    if (diferencia > UMBRAL_ESTABILIDAD_KG) {
      // El peso cambió más del umbral: reiniciar el temporizador
      isStable.value = false;
      ultimoPesoParaEstabilidad = nuevoPeso;
      reiniciarTimerEstabilidad(nuevoPeso);
    }
    // Si la diferencia es menor al umbral, el timer activo eventualmente marcará como estable
  }

  function reiniciarTimerEstabilidad(pesoActual) {
    if (timerEstabilidad) clearTimeout(timerEstabilidad);

    timerEstabilidad = setTimeout(() => {
      // Si tras TIEMPO_ESTABILIDAD_MS el peso sigue igual (dentro del umbral), es estable
      const diferenciaFinal = Math.abs(peso.value - pesoActual);
      if (diferenciaFinal <= UMBRAL_ESTABILIDAD_KG) {
        isStable.value = true;
      }
    }, TIEMPO_ESTABILIDAD_MS);
  }

  // ─── Parsing de trama ─────────────────────────────────────────────────────

  /**
   * Extrae el valor numérico del string de la trama.
   * Ejemplo de entrada: "ST,GS,+  125.50kg"
   * Ejemplo de salida:  125.50
   * Retorna null si no se pudo parsear.
   */
  function parsearTrama(trama) {
    const match = REGEX_PESO.exec(trama);
    if (!match) return null;
    const valor = parseFloat(match[1]);
    return isNaN(valor) ? null : valor;
  }

  // ─── Lectura por stream ────────────────────────────────────────────────────

  /**
   * Lee el stream del puerto de forma asíncrona usando TextDecoderStream.
   * Acumula fragmentos de texto hasta encontrar un salto de línea para
   * procesar tramas completas sin bloquear la UI.
   */
async function iniciarLecturaStream() {
  const decoderStream = new TextDecoderStream();
  readableStreamClosed = port.readable.pipeTo(decoderStream.writable);
  reader = decoderStream.readable.getReader();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += value;
      // DEBUG: Descomenta la siguiente línea para ver en consola qué llega exactamente
      // console.log("DATA RAW:", JSON.stringify(value));

      const lineas = buffer.split(/[\r\n]+/);
      
      // Si solo hay un elemento, significa que no hubo separador aún
      if (lineas.length > 1) {
        buffer = lineas.pop() ?? '';
        for (const linea of lineas) {
          procesarLinea(linea);
        }
      } else if (buffer.length > 20) { 
        // Salvaguarda: si el buffer crece mucho sin saltos de línea, procesamos lo que hay
        procesarLinea(buffer);
        buffer = '';
      }
    }
  } catch (err) {
      // Si el error es por cancelación manual, no es un error real
      if (err.name !== 'AbortError' && err.name !== 'NetworkError') {
        // Desconexión repentina del cable USB/Serial
        if (err.name === 'BufferOverrunError' || err.message?.includes('disconnected') || err.message?.includes('device lost')) {
          error.value = 'Dispositivo desconectado. Reconecta el cable USB y vuelve a intentarlo.';
        } else {
          error.value = `Error de lectura: ${err.message}`;
        }
        console.error('[useBascula] Error en stream:', err);
        await desconectar(false); // Limpieza sin intentar cerrar el reader nuevamente
      }
    }
  }

  function procesarLinea(linea) {
  const tramaTrimmed = linea.trim();
  if (!tramaTrimmed) return;

  pesoTextoRaw.value = tramaTrimmed;
  const nuevoPeso = parsearTrama(tramaTrimmed);
  
  if (nuevoPeso !== null) {
    peso.value = nuevoPeso;
    actualizarEstabilidad(nuevoPeso);
  }
}

  // ─── Conexión ─────────────────────────────────────────────────────────────

  /**
   * Solicita al usuario seleccionar el puerto serial y abre la conexión.
   * Configura el puerto con los parámetros estándar de la báscula REVUELTA ERCC.
   */
  async function conectar() {
    if (!serialDisponible.value) {
      error.value = 'Tu navegador no soporta Web Serial API. Usa Chrome o Edge en escritorio.';
      return;
    }

    if (conectado.value) return;

    cargando.value = true;
    error.value = '';

    try {
      // Solicitar al usuario que seleccione el puerto (abre el diálogo del navegador)
      port = await navigator.serial.requestPort();

      // Abrir el puerto con los parámetros de la báscula REVUELTA ERCC
      await port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
      });

      // FORZAR SEÑALES (Crítico para adaptadores Prolific/RS232)
      await port.setSignals({ dataTerminalReady: true, requestToSend: true });

      conectado.value = true;
      isStable.value = false;
      peso.value = 0;
      pesoTextoRaw.value = '';
      ultimoPesoParaEstabilidad = null;

      // Iniciar lectura asíncrona (no bloquea la UI)
      void iniciarLecturaStream();
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        // El usuario canceló el diálogo de selección de puerto
        error.value = 'Permiso denegado. Selecciona el puerto serial para continuar.';
      } else if (err.name === 'InvalidStateError') {
        error.value = 'El puerto ya está en uso. Cierra otras aplicaciones que usen el puerto.';
      } else if (err.name === 'NetworkError') {
        error.value = 'No se pudo abrir el puerto. Verifica que el cable esté conectado.';
      } else {
        error.value = `Error al conectar: ${err.message}`;
      }
      console.error('[useBascula] Error al conectar:', err);
      port = null;
    } finally {
      cargando.value = false;
    }
  }

  // ─── Desconexión ──────────────────────────────────────────────────────────

  /**
   * Cierra el reader y el puerto de forma limpia para evitar fugas de memoria.
   * Se llama manualmente o desde onUnmounted.
   * @param {boolean} cancelarReader - Si debe cancelar el reader activo (default: true)
   */
  async function desconectar(cancelarReader = true) {
    if (timerEstabilidad) {
      clearTimeout(timerEstabilidad);
      timerEstabilidad = null;
    }

    isStable.value = false;
    conectado.value = false;
    ultimoPesoParaEstabilidad = null;

    // 1. Cancelar el reader para liberar el lock sobre el readable stream
    if (cancelarReader && reader) {
      try {
        await reader.cancel();
      } catch {
        // Ignorar: puede fallar si el stream ya se cerró
      }
    }
    reader = null;

    // 2. Esperar que el stream pipeTo termine de cerrarse limpiamente
    if (readableStreamClosed) {
      try {
        await readableStreamClosed;
      } catch {
        // Ignorar errores del cierre del stream
      }
    }
    readableStreamClosed = null;

    // 3. Cerrar el puerto físico
    if (port) {
      try {
        await port.close();
      } catch {
        // Ignorar errores si ya estaba cerrado
      }
      port = null;
    }
  }

  /**
   * Alias público para desconectar desde los componentes
   */
  async function cerrarConexion() {
    cargando.value = true;
    await desconectar(true);
    cargando.value = false;
  }

  // ─── Limpieza automática al desmontar el componente ───────────────────────

  /**
   * Garantiza que el puerto se cierre cuando el componente que usa este
   * composable se desmonte, evitando fugas de memoria y puertos bloqueados.
   */
  onUnmounted(async () => {
    await desconectar(true);
  });

  // ─── API pública del composable ───────────────────────────────────────────
  return {
    // Estado
    peso,
    pesoFormateado,
    pesoTextoRaw,
    conectado,
    cargando,
    error,
    isStable,
    serialDisponible,

    // Acciones
    conectar,
    cerrarConexion,
  };
}
