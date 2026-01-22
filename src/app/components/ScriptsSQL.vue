<template>
  <q-page class="q-pa-lg">
    <div class="q-gutter-md">
      <!-- Encabezado -->
      <q-card
        class="text-white"
        style="background: linear-gradient(90deg, #7c3aed 0%, #f97316 100%)"
      >
        <q-card-section>
          <div class="text-h5 text-weight-bold">🚀 Scripts SQL de Inicialización</div>
          <div class="text-body2" style="opacity: 0.9">
            Copia y ejecuta estos scripts en Supabase para crear todas las tablas de la base de
            datos
          </div>
        </q-card-section>
      </q-card>

      <!-- Paso 1: Abrir SQL Editor -->
      <q-banner rounded class="bg-blue-1 text-blue-10">
        <template #avatar>
          <div class="text-h5">💡</div>
        </template>

        <div class="text-subtitle1 text-weight-bold">Paso 1: Abrir SQL Editor de Supabase</div>
        <div class="text-body2 q-mb-sm">Primero abre el SQL Editor de tu proyecto en Supabase:</div>

        <q-btn
          color="blue-7"
          unelevated
          icon="open_in_new"
          label="Abrir SQL Editor en Supabase"
          :href="supabaseSqlEditorUrl"
          target="_blank"
          rel="noopener noreferrer"
        />
      </q-banner>

      <!-- Script 1 -->
      <q-card bordered class="q-mt-md" style="border: 2px solid #86efac">
        <q-card-section class="bg-green-1">
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col">
              <div class="row items-center q-gutter-sm">
                <div class="text-h5">1️⃣</div>
                <div>
                  <div class="text-subtitle1 text-weight-bold text-green-10">
                    Script 1: Crear Tablas
                  </div>
                  <div class="text-caption text-green-9">
                    Ejecutar PRIMERO - Crea tablas + datos iniciales
                  </div>
                </div>
              </div>
            </div>

            <div class="col-auto row items-center q-gutter-sm">
              <q-btn
                :color="copiedScript1 ? 'green-8' : 'green-7'"
                unelevated
                :icon="copiedScript1 ? 'check' : 'content_copy'"
                :label="copiedScript1 ? 'Copiado!' : 'Copiar Script'"
                @click="copiarScript(SCRIPT_1_CREAR_TABLAS, 1)"
              />
              <q-btn
                flat
                round
                color="grey-8"
                :icon="expandedScript1 ? 'expand_less' : 'expand_more'"
                @click="expandedScript1 = !expandedScript1"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-slide-transition>
          <div v-show="expandedScript1" class="q-pa-md">
            <div class="code-box">
              <pre class="code-pre">{{ SCRIPT_1_CREAR_TABLAS }}</pre>
            </div>
          </div>
        </q-slide-transition>

        <q-separator />

        <q-card-section class="bg-green-2 text-green-10">
          <div class="text-caption">
            ✅ <span class="text-weight-bold">Qué hace:</span>
            Crea roles, usuarios, productores, báscula, análisis, precios, boletas,
            preliquidaciones, volcado, facturación, pagos y más.
          </div>
        </q-card-section>
      </q-card>

      <!-- Script 2 -->
      <q-card bordered class="q-mt-md" style="border: 2px solid #fdba74">
        <q-card-section class="bg-orange-1">
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col">
              <div class="row items-center q-gutter-sm">
                <div class="text-h5">2️⃣</div>
                <div>
                  <div class="text-subtitle1 text-weight-bold text-orange-10">
                    Script 2: Desactivar RLS
                  </div>
                  <div class="text-caption text-orange-9">
                    Ejecutar SEGUNDO - Permite acceso a las tablas (solo desarrollo)
                  </div>
                </div>
              </div>
            </div>

            <div class="col-auto row items-center q-gutter-sm">
              <q-btn
                :color="copiedScript2 ? 'orange-8' : 'orange-7'"
                unelevated
                :icon="copiedScript2 ? 'check' : 'content_copy'"
                :label="copiedScript2 ? 'Copiado!' : 'Copiar Script'"
                @click="copiarScript(SCRIPT_2_DESACTIVAR_RLS, 2)"
              />
              <q-btn
                flat
                round
                color="grey-8"
                :icon="expandedScript2 ? 'expand_less' : 'expand_more'"
                @click="expandedScript2 = !expandedScript2"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-slide-transition>
          <div v-show="expandedScript2" class="q-pa-md">
            <div class="code-box">
              <pre class="code-pre code-pre-orange">{{ SCRIPT_2_DESACTIVAR_RLS }}</pre>
            </div>
          </div>
        </q-slide-transition>

        <q-separator />

        <q-card-section class="bg-orange-2 text-orange-10">
          <div class="text-caption">
            ⚠️ <span class="text-weight-bold">Qué hace:</span>
            Desactiva Row Level Security para desarrollo. En producción debes configurar políticas
            RLS apropiadas.
          </div>
        </q-card-section>
      </q-card>

      <!-- Instrucciones -->
      <q-banner rounded class="bg-purple-1 text-purple-10 q-mt-md">
        <template #avatar>
          <div class="text-h5">📋</div>
        </template>

        <div class="text-subtitle1 text-weight-bold q-mb-sm">Instrucciones Paso a Paso</div>
        <ol class="q-pl-md q-mt-none q-mb-none">
          <li>Click en “Abrir SQL Editor en Supabase”</li>
          <li>Click en “Copiar Script” del Script 1 (Crear Tablas)</li>
          <li>Pega el script en el SQL Editor de Supabase</li>
          <li>Click en “RUN” o presiona Ctrl+Enter para ejecutar</li>
          <li>Espera a que termine (verás mensaje/resultado de confirmación)</li>
          <li>Repite el proceso con el Script 2 (Desactivar RLS)</li>
          <li>Vuelve a tu aplicación y recarga la página</li>
        </ol>
      </q-banner>

      <!-- Verificación -->
      <q-banner rounded class="bg-green-1 text-green-10 q-mt-md">
        <template #avatar>
          <div class="text-h5">✅</div>
        </template>

        <div class="text-subtitle1 text-weight-bold">Después de ejecutar los scripts</div>
        <div class="text-body2">
          Ve a la pestaña <strong>“Diagnóstico BD”</strong> y ejecuta el diagnóstico para verificar
          que todo funcione correctamente.
        </div>
        <div class="text-caption q-mt-xs" style="opacity: 0.9">
          💡 Si todo está bien, verás ✅ en todos los tests del diagnóstico.
        </div>
      </q-banner>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
// import { projectId } from '/utils/supabase/info.tsx';

const $q = useQuasar();

/* =========================
   Scripts (idénticos al TSX)
========================= */
const SCRIPT_1_CREAR_TABLAS = `-- =====================================================
-- SISTEMA ALAZÁN - INICIALIZACIÓN RÁPIDA
-- =====================================================
-- Ejecutar PRIMERO en SQL Editor de Supabase
-- =====================================================

-- Función auxiliar
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    permisos_json JSONB DEFAULT '{}',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    auth_user_id UUID,
    nombre_completo VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    rol_id BIGINT REFERENCES roles(id) ON DELETE SET NULL,
    departamento VARCHAR(50),
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT true,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    ultimo_acceso TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Granos
CREATE TABLE IF NOT EXISTS granos_catalogo (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    requiere_analisis BOOLEAN DEFAULT true,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Calibres
CREATE TABLE IF NOT EXISTS calibres_catalogo (
    id BIGSERIAL PRIMARY KEY,
    calibre VARCHAR(50) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orígenes
CREATE TABLE IF NOT EXISTS origenes_catalogo (
    id BIGSERIAL PRIMARY KEY,
    municipio VARCHAR(150) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Compradores
CREATE TABLE IF NOT EXISTS compradores_catalogo (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bancos
CREATE TABLE IF NOT EXISTS bancos_catalogo (
    id BIGSERIAL PRIMARY KEY,
    nombre_banco VARCHAR(150) NOT NULL,
    codigo_banco VARCHAR(10),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bodegas
CREATE TABLE IF NOT EXISTS bodegas_silos_catalogo (
    id BIGSERIAL PRIMARY KEY,
    nombre_bodega VARCHAR(150) NOT NULL,
    numero_silo VARCHAR(50),
    capacidad_ton NUMERIC(10,2),
    ubicacion VARCHAR(200),
    tipo_grano_permitido VARCHAR(100),
    ocupacion_actual_ton NUMERIC(10,2) DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Productores
CREATE TABLE IF NOT EXISTS productores (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rfc VARCHAR(13) UNIQUE,
    correo VARCHAR(150),
    origen_id BIGINT REFERENCES origenes_catalogo(id) ON DELETE SET NULL,
    origen VARCHAR(150),
    municipio VARCHAR(150),
    tipo_persona VARCHAR(20),
    atiende VARCHAR(200),
    contacto_adicional_nombre VARCHAR(200),
    contacto_adicional_correo VARCHAR(150),
    contacto_adicional_telefono VARCHAR(20),
    banco_id BIGINT REFERENCES bancos_catalogo(id) ON DELETE SET NULL,
    cuenta_clabe VARCHAR(18),
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Báscula
CREATE TABLE IF NOT EXISTS bascula_recepciones (
    id BIGSERIAL PRIMARY KEY,
    ticket_numero VARCHAR(50) NOT NULL UNIQUE,
    fecha_hora TIMESTAMPTZ DEFAULT NOW(),
    productor_id BIGINT REFERENCES productores(id) ON DELETE SET NULL,
    productor_nombre VARCHAR(255),
    telefono VARCHAR(20),
    t_productor VARCHAR(20),
    comprador VARCHAR(200),
    origen VARCHAR(150),
    tipo_grano VARCHAR(100),
    peso_bruto_kg NUMERIC(12,2) NOT NULL,
    tara_kg NUMERIC(12,2) NOT NULL,
    peso_neto_kg NUMERIC(12,2) GENERATED ALWAYS AS (peso_bruto_kg - tara_kg) STORED,
    camion_placas VARCHAR(20),
    operador_nombre VARCHAR(200),
    usuario_registro_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'PENDIENTE_ANALISIS',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Análisis
CREATE TABLE IF NOT EXISTS analisis_calidad (
    id BIGSERIAL PRIMARY KEY,
    ticket_numero VARCHAR(50) NOT NULL,
    bascula_id BIGINT REFERENCES bascula_recepciones(id) ON DELETE CASCADE,
    calibre VARCHAR(20),
    humedad NUMERIC(5,2),
    impurezas NUMERIC(5,2),
    r1_danado_insecto NUMERIC(5,2),
    r2_quebrado NUMERIC(5,2),
    r2_manchado NUMERIC(5,2),
    r2_arrugado NUMERIC(5,2),
    r2_cristalizado NUMERIC(5,2),
    r2_germinado NUMERIC(5,2),
    r2_danado_mecanico NUMERIC(5,2),
    r2_inmaduro NUMERIC(5,2),
    r2_tierra NUMERIC(5,2),
    suma_r2 NUMERIC(5,2),
    total_danos NUMERIC(5,2),
    exportacion NUMERIC(5,2),
    analista_usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_analisis TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'PENDIENTE',
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Precios
CREATE TABLE IF NOT EXISTS precios_configuracion (
    id BIGSERIAL PRIMARY KEY,
    fecha_vigencia_inicio DATE NOT NULL,
    fecha_vigencia_fin DATE,
    precio_base_usd_ton NUMERIC(12,2) NOT NULL,
    tipo_cambio_fix NUMERIC(10,4) NOT NULL,
    precio_base_mxn_ton NUMERIC(12,2),
    calibre_12mm_descuento NUMERIC(10,2) DEFAULT 0,
    calibre_11mm_descuento NUMERIC(10,2) DEFAULT 0,
    calibre_10mm_descuento NUMERIC(10,2) DEFAULT 0,
    calibre_9mm_descuento NUMERIC(10,2) DEFAULT 0,
    calibre_8mm_descuento NUMERIC(10,2) DEFAULT 0,
    calibre_7mm_descuento NUMERIC(10,2) DEFAULT 0,
    usuario_registro_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Boletas
CREATE TABLE IF NOT EXISTS boletas (
    id BIGSERIAL PRIMARY KEY,
    folio VARCHAR(50) NOT NULL UNIQUE,
    ticket_numero VARCHAR(50),
    bascula_id BIGINT REFERENCES bascula_recepciones(id) ON DELETE SET NULL,
    analisis_id BIGINT REFERENCES analisis_calidad(id) ON DELETE SET NULL,
    fecha_hora TIMESTAMPTZ DEFAULT NOW(),
    productor VARCHAR(255),
    telefono VARCHAR(20),
    t_productor VARCHAR(20),
    comprador VARCHAR(200),
    origen VARCHAR(150),
    calibre VARCHAR(20),
    humedad NUMERIC(5,2),
    peso_bruto NUMERIC(12,2),
    tara NUMERIC(12,2),
    peso_neto NUMERIC(12,2),
    precio_base_usd NUMERIC(12,2),
    tipo_cambio NUMERIC(10,4),
    precio_mxn NUMERIC(12,2),
    descuento_kg_ton NUMERIC(10,2),
    kg_a_liquidar NUMERIC(12,2),
    importe_total NUMERIC(15,2),
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Preliquidaciones
CREATE TABLE IF NOT EXISTS preliquidaciones (
    id BIGSERIAL PRIMARY KEY,
    ticket_numero VARCHAR(50),
    bascula_id BIGINT REFERENCES bascula_recepciones(id) ON DELETE SET NULL,
    productor_id BIGINT REFERENCES productores(id) ON DELETE SET NULL,
    fecha_preliquidacion TIMESTAMPTZ DEFAULT NOW(),
    kg_neto_recibido NUMERIC(12,2),
    calibre VARCHAR(20),
    precio_base_mxn_ton NUMERIC(12,2),
    descuento_kg_ton NUMERIC(10,2),
    kg_a_liquidar NUMERIC(12,2),
    precio_final_mxn_ton NUMERIC(12,2),
    importe_total NUMERIC(15,2),
    anticipos NUMERIC(15,2) DEFAULT 0,
    saldo_pendiente NUMERIC(15,2),
    status VARCHAR(50) DEFAULT 'PENDIENTE',
    aprobado_por_usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_aprobacion TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Volcado
CREATE TABLE IF NOT EXISTS volcado_bodega (
    id BIGSERIAL PRIMARY KEY,
    ticket_numero VARCHAR(50),
    bascula_id BIGINT REFERENCES bascula_recepciones(id) ON DELETE SET NULL,
    fecha_hora_volcado TIMESTAMPTZ DEFAULT NOW(),
    bodega_id BIGINT REFERENCES bodegas_silos_catalogo(id) ON DELETE SET NULL,
    bodega_ubicacion VARCHAR(150),
    silo_numero VARCHAR(50),
    calibre VARCHAR(20),
    kg_volcados NUMERIC(12,2),
    operador_volcado VARCHAR(200),
    supervisor_volcado VARCHAR(200),
    temperatura_grano NUMERIC(5,2),
    humedad_verificacion NUMERIC(5,2),
    observaciones TEXT,
    status VARCHAR(50) DEFAULT 'EN_PROCESO',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Entregas Agrupadas
CREATE TABLE IF NOT EXISTS entregas_agrupadas (
    id BIGSERIAL PRIMARY KEY,
    productor_id BIGINT REFERENCES productores(id) ON DELETE SET NULL,
    tickets_agrupados JSONB DEFAULT '[]',
    kg_total NUMERIC(12,2),
    importe_total_estimado NUMERIC(15,2),
    fecha_agrupacion TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'PENDIENTE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Facturación
CREATE TABLE IF NOT EXISTS facturacion_recepciones (
    id BIGSERIAL PRIMARY KEY,
    entrega_agrupada_id BIGINT REFERENCES entregas_agrupadas(id) ON DELETE SET NULL,
    productor_id BIGINT REFERENCES productores(id) ON DELETE SET NULL,
    fecha_recepcion TIMESTAMPTZ DEFAULT NOW(),
    rfc_productor VARCHAR(13),
    xml_factura_path TEXT,
    importe_factura NUMERIC(15,2),
    kg_total_entregados NUMERIC(12,2),
    precio_promedio NUMERIC(12,2),
    tiene_documentos BOOLEAN DEFAULT false,
    tiene_factura_xml BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'PENDIENTE_DOCUMENTOS',
    usuario_registro_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Documentos
CREATE TABLE IF NOT EXISTS documentos_expediente (
    id BIGSERIAL PRIMARY KEY,
    productor_id BIGINT REFERENCES productores(id) ON DELETE CASCADE,
    facturacion_id BIGINT REFERENCES facturacion_recepciones(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(50),
    archivo_path TEXT,
    fecha_documento DATE,
    fecha_vencimiento DATE,
    vigente BOOLEAN DEFAULT true,
    usuario_registro_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Solicitudes de Pago
CREATE TABLE IF NOT EXISTS solicitudes_pago (
    id BIGSERIAL PRIMARY KEY,
    facturacion_id BIGINT REFERENCES facturacion_recepciones(id) ON DELETE SET NULL,
    productor_id BIGINT REFERENCES productores(id) ON DELETE SET NULL,
    fecha_solicitud TIMESTAMPTZ DEFAULT NOW(),
    monto_solicitado NUMERIC(15,2) NOT NULL,
    banco_id BIGINT REFERENCES bancos_catalogo(id) ON DELETE SET NULL,
    metodo_pago VARCHAR(30),
    cuenta_clabe VARCHAR(18),
    referencia_pago VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDIENTE',
    fecha_pago TIMESTAMPTZ,
    comprobante_pago_path TEXT,
    aprobado_por_usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DATOS INICIALES
INSERT INTO roles (nombre_rol, descripcion, permisos_json) VALUES
('ADMIN', 'Administrador', '{"all": true}'),
('OPERADOR_BASCULA', 'Báscula', '{"bascula": true}'),
('ANALISTA_LABORATORIO', 'Laboratorio', '{"analisis": true}'),
('CONTADOR', 'Contador', '{"facturacion": true}'),
('TESORERO', 'Tesorero', '{"pagos": true}')
ON CONFLICT (nombre_rol) DO NOTHING;

INSERT INTO calibres_catalogo (calibre, activo) VALUES
('12mm', true),
('11mm', true),
('10mm', true),
('9mm', true),
('8mm', true),
('7mm', true)
ON CONFLICT (calibre) DO NOTHING;

INSERT INTO granos_catalogo (nombre, requiere_analisis) VALUES
('GARBANZO', true),
('FRIJOL', false)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO compradores_catalogo (nombre, telefono) VALUES
('Exportadora del Norte', '667-123-4567'),
('Granos y Cereales SA', '667-234-5678'),
('Comercializadora Pacífico', '668-345-6789')
ON CONFLICT DO NOTHING;

INSERT INTO origenes_catalogo (municipio, estado, region) VALUES
('Navojoa', 'Sonora', 'Sur'),
('Guasave', 'Sinaloa', 'Norte'),
('Caborca', 'Sonora', 'Norte')
ON CONFLICT DO NOTHING;

INSERT INTO bancos_catalogo (nombre_banco, codigo_banco) VALUES
('BBVA', '012'),
('Banamex', '002'),
('Santander', '014'),
('Banorte', '072'),
('HSBC', '021')
ON CONFLICT DO NOTHING;

-- Verificar
SELECT 'Tablas creadas correctamente' AS resultado,
       COUNT(*) AS total_tablas
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';`;

const SCRIPT_2_DESACTIVAR_RLS = `-- =====================================================
-- ⚠️  DESACTIVAR RLS (Row Level Security)
-- =====================================================
-- Ejecutar SEGUNDO en SQL Editor de Supabase
-- =====================================================

-- IMPORTANTE: Esto es solo para desarrollo
-- En producción, deberás configurar políticas específicas por usuario

-- CATÁLOGOS BASE
ALTER TABLE IF EXISTS sedes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS granos_catalogo DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS calibres_catalogo DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS origenes_catalogo DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS compradores_catalogo DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bancos_catalogo DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bodegas_silos_catalogo DISABLE ROW LEVEL SECURITY;

-- TABLAS OPERATIVAS
ALTER TABLE IF EXISTS productores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bascula_recepciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS analisis_calidad DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS precios_configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS boletas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS preliquidaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS volcado_bodega DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS entregas_agrupadas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS facturacion_recepciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documentos_expediente DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS solicitudes_pago DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS topes_pago_sede DISABLE ROW LEVEL SECURITY;

-- TABLAS DE CONFIGURACIÓN DE PRECIOS
ALTER TABLE IF EXISTS precios_base DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS descuentos_calibre DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS descuentos_calibre_historial DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS descuentos_calibre_autorizaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS precios_historial DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tipo_cambio DISABLE ROW LEVEL SECURITY;

-- Verificar que se desactivó correctamente
SELECT
    tablename AS "Tabla",
    CASE
        WHEN rowsecurity = false THEN '✅ RLS DESACTIVADO'
        ELSE '❌ RLS ACTIVADO'
    END AS "Estado RLS"
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'sedes', 'roles', 'usuarios', 'granos_catalogo',
        'calibres_catalogo', 'origenes_catalogo', 'compradores_catalogo',
        'bancos_catalogo', 'bodegas_silos_catalogo', 'productores',
        'bascula_recepciones', 'analisis_calidad', 'precios_configuracion',
        'boletas', 'preliquidaciones', 'volcado_bodega', 'entregas_agrupadas',
        'facturacion_recepciones', 'documentos_expediente', 'solicitudes_pago',
        'topes_pago_sede', 'precios_base', 'descuentos_calibre',
        'descuentos_calibre_historial', 'descuentos_calibre_autorizaciones',
        'precios_historial', 'tipo_cambio'
    )
ORDER BY tablename;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ RLS DESACTIVADO EN TODAS LAS TABLAS';
    RAISE NOTICE '⚠️  IMPORTANTE: Esto es solo para desarrollo';
    RAISE NOTICE '⚠️  En producción, configura políticas RLS apropiadas';
END $$;`;

/* =========================
   Estado UI (equivalente useState)
========================= */
const copiedScript1 = ref(false);
const copiedScript2 = ref(false);
const expandedScript1 = ref(false);
const expandedScript2 = ref(false);

const supabaseSqlEditorUrl = computed(() => {
  return `https://supabase.com/dashboard/project/${projectId}/sql/new`;
});

/* =========================
   Copiar script (compat iframe/restricción)
========================= */
async function copiarScript(script: string, scriptNum: 1 | 2) {
  // 1) intenta Clipboard API
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(script);
      onCopied(scriptNum);
      return;
    }
  } catch {
    // fallback abajo
  }

  // 2) fallback legacy (igual TSX)
  const textArea = document.createElement('textarea');
  textArea.value = script;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      onCopied(scriptNum);
    } else {
      notifyErr('Error al copiar. Selecciona y copia el texto manualmente');
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error al copiar:', err);
    notifyErr('Error al copiar. Selecciona y copia el texto manualmente');
  } finally {
    document.body.removeChild(textArea);
  }
}

function onCopied(scriptNum: 1 | 2) {
  if (scriptNum === 1) {
    copiedScript1.value = true;
    window.setTimeout(() => (copiedScript1.value = false), 2000);
  } else {
    copiedScript2.value = true;
    window.setTimeout(() => (copiedScript2.value = false), 2000);
  }
  notifyOk(`Script ${scriptNum} copiado al portapapeles`);
}

function notifyOk(message: string) {
  $q.notify({ type: 'positive', message, position: 'top' });
}
function notifyErr(message: string) {
  $q.notify({ type: 'negative', message, position: 'top' });
}
</script>

<style scoped>
.code-box {
  background: #111827; /* similar a bg-gray-900 */
  border-radius: 10px;
  padding: 12px;
  overflow-x: auto;
}
.code-pre {
  margin: 0;
  white-space: pre;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
  font-size: 12px;
  line-height: 1.35;
  color: #4ade80; /* green-ish */
}
.code-pre-orange {
  color: #fb923c; /* orange-ish */
}
</style>
