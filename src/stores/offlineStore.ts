import { defineStore } from 'pinia';




export interface UsuarioPendiente {
  id: number | null | undefined; // Añadimos undefined aquí
  nombre: string;
  username: string;
  password?: string;
  rol_id: number | null;
  activo: boolean;
  tipoOperacion: 'CREATE' | 'UPDATE';
  fechaLocal: string;
  firma?: string;
  departamento?: string;
  telefono?: string;
}

export interface ProductorPendiente {
  // Campos que van a POST /api/catalogos/productores
  nombre: string;
  telefono: string;
  tipo_persona: 'Fisica' | 'Moral';
  atiende: string | null;
  // Metadata offline
  _localId: string;          // 'LOCAL_PROD_' + Date.now()
  _syncStatus: 'pending' | 'error';
  _syncError?: string;
}

export interface RegistroBasculaPendiente {
  // Campos que van a POST /api/bascula/guardar
  ticket_numero: string;
  fecha_hora: string;
  productor_id: number | null;      // null si el productor también es local
  chofer: string;
  placas: string;
  peso_bruto_kg: number;
  grano_id: number | null;
  origen_id: number | null;
  comprador_id: string | null;
  status: string;
  datos_adicionales: string;
  boleta_numero: null;
  usuario_registro_id: number | null;
  sede_id: number;
  // Metadata offline (NO van a la API)
  _localId: string;                 // 'LOCAL_BASC_' + Date.now()
  _syncStatus: 'pending' | 'error';
  _syncError?: string;
  _fechaLocal: string;
  _productor_localId?: string;      // si el productor fue creado offline, su _localId
  // Nombres resueltos para mostrar en tabla sin red
  _productor_nombre: string;
  _origen_nombre: string;
  _comprador_nombre: string;
  _grano_nombre: string;
}

export interface AnalisisPendiente {
  // Campos para POST /api/analisis/guardar o PUT /api/analisis/actualizar/:bascula_id
  bascula_id: number;
  calibre: string;
  humedad: number;
  impurezas: number;
  r1_danado_insecto: number;
  r2_quebrado: number;
  r2_manchado: number;
  r2_arrugado: number;
  analista_usuario_id: number;
  grano_id: number | null;
  observaciones: string;
  datos_adicionales: string;        // JSON con fotos (base64), cafes_lisos, etc.
  // Metadata offline (NO van a la API)
  _localId: string;                 // 'LOCAL_ANAL_' + Date.now()
  _syncStatus: 'pending' | 'error';
  _syncError?: string;
  _esActualizacion: boolean;        // true = PUT, false = POST
  _ticketNumero: string;            // para mostrar en notificaciones
}

// ── PRECIO ────────────────────────────────────────────────────────────────────
export interface PrecioPendiente {
  tipo: 'autorizar' | 'rechazar';
  boletaPrecioId: number;
  // autorizar:
  precioAutorizado?: number;
  observaciones?: string;
  tipoAutorizacion?: string;
  // rechazar:
  motivoRechazo?: string;
  _localId: string;
  _syncStatus: 'pending' | 'error';
  _syncError?: string;
  _descripcion: string;
}

// ── BOLETA ────────────────────────────────────────────────────────────────────
export interface BoletaConfirmacionPendiente {
  boletaId: number;
  acepta: boolean;
  motivoRechazo?: string;
  sedeId: number;
  _localId: string;
  _syncStatus: 'pending' | 'error';
  _syncError?: string;
  _descripcion: string;
}

// ── VOLCADO ───────────────────────────────────────────────────────────────────
export interface VolcadoPendiente {
  tipo: 'asignar-silo' | 'rechazar';
  boletaId: number;
  sedeId: number;
  // asignar-silo (modalidad simple):
  siloId?: number | null;
  // asignar-silo (modalidad detalle):
  siloCalibreId?: number | null;
  siloPulmonId?: number | null;
  bodegaId?: number | null;
  // rechazar:
  motivos?: string;
  evidencia?: string | null;
  _localId: string;
  _syncStatus: 'pending' | 'error';
  _syncError?: string;
  _descripcion: string;
}

// ── PRE-LIQUIDACIÓN ───────────────────────────────────────────────────────────
export interface PreliquidacionPendiente {
  tipo: 'guardar' | 'guardar-foto';
  // guardar:
  boletaId?: number;
  pesoTara?: number;
  pesoNeto?: number;
  descuento?: number;
  kgALiquidar?: number;
  importeTotal?: number;
  observaciones?: string;
  rt?: string;
  tipoSiembra?: string;
  divisiones?: unknown;
  // guardar-foto:
  foto?: string;
  _localId: string;
  _syncStatus: 'pending' | 'error';
  _syncError?: string;
  _descripcion: string;
}

// ── FACTURACIÓN ───────────────────────────────────────────────────────────────
export interface FacturacionPendiente {
  tipo: 'actualizar-rfc' | 'actualizar-documentos-status';
  tickets: string[];
  sedeId: number;
  // actualizar-rfc:
  nuevoRfc?: string;
  // actualizar-documentos-status:
  tieneDocumentos?: boolean;
  tieneFacturaXml?: boolean;
  _localId: string;
  _syncStatus: 'pending' | 'error';
  _syncError?: string;
  _descripcion: string;
}

// ── PRODUCCIÓN ────────────────────────────────────────────────────────────────
export interface ProduccionPendiente {
  tipo: 'crear-orden' | 'actualizar-orden' | 'guardar-resultado';
  sedeId: number;
  // orden:
  ordenPayload?: unknown;
  ordenId?: number;
  // resultado:
  resultadoPayload?: unknown;
  _localId: string;
  _syncStatus: 'pending' | 'error';
  _syncError?: string;
  _descripcion: string;
}

export const useOfflineStore = defineStore('offline', {
  state: () => ({
    colaUsuarios: [] as UsuarioPendiente[],
    colaProductores: [] as ProductorPendiente[],
    colaBascula: [] as RegistroBasculaPendiente[],
    colaAnalisis: [] as AnalisisPendiente[],
    colaPrecio: [] as PrecioPendiente[],
    colaBoleta: [] as BoletaConfirmacionPendiente[],
    colaVolcado: [] as VolcadoPendiente[],
    colaPreliquidacion: [] as PreliquidacionPendiente[],
    colaFacturacion: [] as FacturacionPendiente[],
    colaProduccion: [] as ProduccionPendiente[],
  }),
  actions: {
    // Productores
    agregarProductor(p: ProductorPendiente) { this.colaProductores.push(p); },
    removerProductor(localId: string) {
      this.colaProductores = this.colaProductores.filter(p => p._localId !== localId);
    },
    marcarProductorError(localId: string, msg: string) {
      const p = this.colaProductores.find(p => p._localId === localId);
      if (p) { p._syncStatus = 'error'; p._syncError = msg; }
    },
    // Báscula
    agregarBascula(r: RegistroBasculaPendiente) { this.colaBascula.push(r); },
    removerBascula(localId: string) {
      this.colaBascula = this.colaBascula.filter(r => r._localId !== localId);
    },
    marcarBasculaError(localId: string, msg: string) {
      const r = this.colaBascula.find(r => r._localId === localId);
      if (r) { r._syncStatus = 'error'; r._syncError = msg; }
    },
    resolverProductorLocalId(localId: string, realId: number) {
      this.colaBascula
        .filter(r => r._productor_localId === localId)
        .forEach(r => { r.productor_id = realId; });
    },
    // Análisis
    agregarAnalisis(a: AnalisisPendiente) { this.colaAnalisis.push(a); },
    removerAnalisis(localId: string) {
      this.colaAnalisis = this.colaAnalisis.filter(a => a._localId !== localId);
    },
    marcarAnalisisError(localId: string, msg: string) {
      const a = this.colaAnalisis.find(a => a._localId === localId);
      if (a) { a._syncStatus = 'error'; a._syncError = msg; }
    },
    // Precio
    agregarPrecio(p: PrecioPendiente) { this.colaPrecio.push(p); },
    removerPrecio(localId: string) {
      this.colaPrecio = this.colaPrecio.filter(p => p._localId !== localId);
    },
    marcarPrecioError(localId: string, msg: string) {
      const p = this.colaPrecio.find(p => p._localId === localId);
      if (p) { p._syncStatus = 'error'; p._syncError = msg; }
    },
    // Boleta
    agregarBoleta(b: BoletaConfirmacionPendiente) { this.colaBoleta.push(b); },
    removerBoleta(localId: string) {
      this.colaBoleta = this.colaBoleta.filter(b => b._localId !== localId);
    },
    marcarBoletaError(localId: string, msg: string) {
      const b = this.colaBoleta.find(b => b._localId === localId);
      if (b) { b._syncStatus = 'error'; b._syncError = msg; }
    },
    // Volcado
    agregarVolcado(v: VolcadoPendiente) { this.colaVolcado.push(v); },
    removerVolcado(localId: string) {
      this.colaVolcado = this.colaVolcado.filter(v => v._localId !== localId);
    },
    marcarVolcadoError(localId: string, msg: string) {
      const v = this.colaVolcado.find(v => v._localId === localId);
      if (v) { v._syncStatus = 'error'; v._syncError = msg; }
    },
    // Pre-liquidación
    agregarPreliquidacion(p: PreliquidacionPendiente) { this.colaPreliquidacion.push(p); },
    removerPreliquidacion(localId: string) {
      this.colaPreliquidacion = this.colaPreliquidacion.filter(p => p._localId !== localId);
    },
    marcarPreliquidacionError(localId: string, msg: string) {
      const p = this.colaPreliquidacion.find(p => p._localId === localId);
      if (p) { p._syncStatus = 'error'; p._syncError = msg; }
    },
    // Facturación
    agregarFacturacion(f: FacturacionPendiente) { this.colaFacturacion.push(f); },
    removerFacturacion(localId: string) {
      this.colaFacturacion = this.colaFacturacion.filter(f => f._localId !== localId);
    },
    marcarFacturacionError(localId: string, msg: string) {
      const f = this.colaFacturacion.find(f => f._localId === localId);
      if (f) { f._syncStatus = 'error'; f._syncError = msg; }
    },
    // Producción
    agregarProduccion(p: ProduccionPendiente) { this.colaProduccion.push(p); },
    removerProduccion(localId: string) {
      this.colaProduccion = this.colaProduccion.filter(p => p._localId !== localId);
    },
    marcarProduccionError(localId: string, msg: string) {
      const p = this.colaProduccion.find(p => p._localId === localId);
      if (p) { p._syncStatus = 'error'; p._syncError = msg; }
    },
  },
  persist: true,
});
