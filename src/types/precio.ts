// Tipos compartidos para el módulo de Gestión de Precios

export interface BoletaPrecio {
  id?: number;
  noBoleta: string;
  fecha: string;
  comprador: string;
  tonsAprox: number;
  descuento: number;
  precioSugerido: number;
  precioSugeridoCodigo: string;
  precioAutorizado?: number;
  estatus: string;
  ticket: string;
  productor?: string;
  telefono?: string;
  origen?: string;
  calibre?: string;
  tiempoRegistro?: Date | string;
  esDeAnalisis?: boolean;
  pesoBruto?: number;
  peso_neto?: number;
  humedad?: number;
  impurezas?: number;
  r1?: number;
  sumaR2?: number;
  r2?: number;
  manchados?: number;
  quebMxc?: number;
  cafesLisos?: number;
  helados?: number;
  alimonados?: number;
  revolcados?: number;
  exportacion?: number;
  datosAdicionales?: string | Record<string, unknown>;
  kg_a_liquidar?: number;
  importe_total?: number;
  tProductor?: string;
  tipoGrano?: string;
  granoId?: number;
}

export type PrecioTab = 'autorizar' | 'renegociar';
