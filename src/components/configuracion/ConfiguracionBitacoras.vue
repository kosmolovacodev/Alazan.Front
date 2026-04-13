<template>
  <div>

    <!-- ═══ CONFIGURACIÓN GLOBAL DE FIRMA POR NIP ═══ -->
    <div class="nip-card q-mb-lg">
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <div class="nip-icon-wrap"><q-icon name="lock" color="white" size="20px" /></div>
          <div>
            <div class="text-body2 text-weight-bold text-grey-9">Configuración Global de Firma por NIP</div>
            <div class="text-caption text-grey-6">Aplica a todas las bitácoras del sistema</div>
          </div>
        </div>
        <q-chip dense color="grey-3" text-color="grey-7" size="sm">Global</q-chip>
      </div>

      <div class="row q-col-gutter-md">
        <!-- Longitud del NIP -->
        <div class="col-12 col-md-4">
          <div class="nip-label q-mb-xs"># Longitud del NIP</div>
          <div class="row q-gutter-xs">
            <button v-for="l in [4, 6]" :key="l"
              class="nip-btn" :class="{ 'nip-btn--active-dark': nip.longitud === l }"
              @click="setNip('longitud', l)">
              {{ l }} dígitos
            </button>
          </div>
          <div class="text-caption text-grey-5 q-mt-xs">
            NIP de {{ nip.longitud }} dígitos: {{ nip.longitud === 4 ? 'rápido y ágil para operación en campo' : 'mayor seguridad y complejidad' }}
          </div>
        </div>

        <!-- Intentos antes de bloqueo -->
        <div class="col-12 col-md-4">
          <div class="nip-label q-mb-xs"><q-icon name="timer" size="12px" class="q-mr-xs" />Intentos antes de bloqueo</div>
          <div class="row q-gutter-xs">
            <button v-for="i in [2, 3, 5]" :key="i"
              class="nip-btn" :class="{ 'nip-btn--active-orange': nip.intentos === i }"
              @click="setNip('intentos', i)">
              {{ i }}
            </button>
          </div>
          <div class="text-caption text-grey-5 q-mt-xs">
            Intentos fallidos consecutivos antes de bloquear temporalmente
          </div>
        </div>

        <!-- Tiempo de bloqueo -->
        <div class="col-12 col-md-4">
          <div class="nip-label q-mb-xs"><q-icon name="timer_off" size="12px" class="q-mr-xs" />Tiempo de bloqueo</div>
          <div class="row q-gutter-xs">
            <button v-for="t in [5, 15, 30]" :key="t"
              class="nip-btn" :class="{ 'nip-btn--active-orange': nip.tiempo === t }"
              @click="setNip('tiempo', t)">
              {{ t }} min
            </button>
          </div>
          <div class="text-caption text-grey-5 q-mt-xs">
            Tiempo que el usuario debe esperar tras {{ nip.intentos }} intentos fallidos
          </div>
        </div>
      </div>

      <!-- Info box dinámico -->
      <div class="nip-info-box q-mt-md">
        <q-icon name="info" size="16px" color="blue-6" class="q-mr-sm" />
        <span class="text-caption text-grey-8">
          Cada usuario del sistema tiene asignado un NIP de
          <strong>{{ nip.longitud }} dígitos</strong> que usa para firmar digitalmente los registros de bitácora.
          Después de <strong>{{ nip.intentos }} intentos</strong> fallidos la cuenta se bloquea por
          <strong>{{ nip.tiempo }} minutos</strong>.
          Las firmas quedan registradas con fecha, hora y usuario en el historial de auditoría.
        </span>
      </div>
    </div>

    <!-- ═══ CONFIGURACIÓN POR BITÁCORA ═══ -->
    <div class="cfg-label q-mb-sm">CONFIGURACIÓN POR BITÁCORA</div>

    <div class="q-gutter-y-sm">
      <q-expansion-item
        v-for="sec in SECCIONES" :key="sec.codigo"
        :default-opened="sec.codigo === 'SEC-01'"
        bordered
        class="rounded-borders overflow-hidden"
        :header-style="{ background: sec.colorLight, borderLeft: `4px solid ${sec.color}` }"
      >
        <template v-slot:header>
          <div class="row items-center q-gutter-sm col">
            <span class="cb-sec-badge" :style="{ background: sec.color }">{{ sec.codigo }}</span>
            <span class="text-subtitle2 text-weight-bold" :style="{ color: sec.color }">{{ sec.nombre }}</span>
            <span class="text-caption text-grey-6">
              {{ configuradas(sec).length }} bitácora{{ configuradas(sec).length !== 1 ? 's' : '' }} ·
              {{ firmasSeccion(sec) }} firmas configuradas
            </span>
          </div>
        </template>

        <div class="q-pa-none">

          <div v-if="configuradas(sec).length === 0" class="text-caption text-grey-5 text-center q-pa-md">
            Las bitácoras de esta sección están por definir
          </div>

          <!-- Lista de bitácoras configuradas (accordion anidado) -->
          <q-expansion-item
            v-for="bit in configuradas(sec)" :key="bit.codigo"
            dense
            bordered
            :header-class="'bg-white'"
          >
            <template v-slot:header>
              <div class="row items-center col q-py-xs q-gutter-xs">
                <span class="cb-code-chip" :style="{ borderColor: sec.color, color: sec.color }">
                  {{ bit.codigo }}
                </span>
                <span class="text-body2 text-grey-8 col q-ml-xs" style="font-size:13px">
                  {{ capitalize(bit.nombre) }}
                </span>
                <!-- Summary chips -->
                <q-chip v-if="getCfg(bit.codigo).periodicidad"
                  dense size="sm" color="grey-2" text-color="grey-7" icon="schedule" class="q-mr-xs">
                  {{ getCfg(bit.codigo).periodicidad }}
                </q-chip>
                <q-chip v-if="getCfg(bit.codigo).rolOperativo"
                  dense size="sm" color="grey-8" text-color="white" icon="engineering">
                  {{ getCfg(bit.codigo).firmasOperativo }}F
                </q-chip>
                <q-chip v-if="getCfg(bit.codigo).rolSupervisor"
                  dense size="sm" color="blue-7" text-color="white" icon="manage_accounts">
                  {{ getCfg(bit.codigo).firmasSupervisor }}F
                </q-chip>
                <q-chip v-if="getCfg(bit.codigo).rolGerente"
                  dense size="sm" color="purple-7" text-color="white" icon="admin_panel_settings">
                  {{ getCfg(bit.codigo).firmasGerente }}F
                </q-chip>
                <q-chip v-if="getCfg(bit.codigo).firmaRecepcion"
                  dense size="sm" color="amber-7" text-color="white" icon="person_pin">
                  Rec.
                </q-chip>
                <q-spinner v-if="saving[bit.codigo]" color="primary" size="14px" class="q-ml-xs" />
                <q-icon v-else-if="saved[bit.codigo]" name="check_circle" color="positive" size="16px" class="q-ml-xs" />
              </div>
            </template>

            <!-- Panel de configuración -->
            <div class="bit-panel q-pa-md">

              <!-- COLUMNAS REGISTRADAS -->
              <div class="q-mb-md">
                <div class="cfg-label">COLUMNAS REGISTRADAS ({{ bit.columnas.length }})</div>
                <div class="row q-gutter-xs q-mt-xs">
                  <q-chip v-for="col in bit.columnas" :key="col.campo"
                    dense size="sm" color="grey-2" text-color="grey-8">
                    {{ col.label }}
                  </q-chip>
                </div>
              </div>

              <!-- PERIODICIDAD -->
              <div class="q-mb-md">
                <div class="cfg-label">PERIODICIDAD DE GENERACIÓN</div>
                <div class="row q-gutter-xs q-mt-xs">
                  <button v-for="p in PERIODICIDADES" :key="p.val"
                    class="period-btn"
                    :class="{ 'period-btn--active': getCfg(bit.codigo).periodicidad === p.val }"
                    @click="setCfgField(bit.codigo, 'periodicidad', p.val)">
                    <q-icon :name="p.icon" size="13px" class="q-mr-xs" />{{ p.label }}
                  </button>
                </div>
                <!-- Sub-selector día de semana -->
                <div v-if="getCfg(bit.codigo).periodicidad === 'Semanal'" class="q-mt-sm">
                  <div class="text-caption text-grey-6 q-mb-xs">Día de la semana en que se genera</div>
                  <div class="row q-gutter-xs">
                    <button v-for="d in DIAS_SEMANA" :key="d"
                      class="period-btn"
                      :class="{ 'period-btn--active': getCfg(bit.codigo).diaSemana === d }"
                      @click="setCfgField(bit.codigo, 'diaSemana', d)">
                      {{ d }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- ROLES FIRMANTES -->
              <div class="q-mb-md">
                <div class="cfg-label q-mb-xs">
                  ROLES FIRMANTES
                  <span class="text-grey-5 q-ml-xs" style="font-weight:400; letter-spacing:0">
                    · Supervisor o superior = {{ getCfg(bit.codigo).firmasSupervisor }} firma{{ getCfg(bit.codigo).firmasSupervisor !== 1 ? 's' : '' }}
                    · Operativo = {{ getCfg(bit.codigo).firmasOperativo }} firmas
                  </span>
                </div>
                <div class="row q-gutter-sm">

                  <!-- Operativo -->
                  <div class="rol-card col"
                    :class="getCfg(bit.codigo).rolOperativo ? 'rol-card--operativo' : 'rol-card--off'"
                    @click="toggleRol(bit.codigo, 'operativo')">
                    <div class="row items-start justify-between">
                      <q-icon name="engineering" size="22px" :color="getCfg(bit.codigo).rolOperativo ? 'white' : 'grey-5'" />
                      <q-checkbox :model-value="getCfg(bit.codigo).rolOperativo" dense
                        :dark="getCfg(bit.codigo).rolOperativo"
                        @update:model-value="toggleRol(bit.codigo, 'operativo')" @click.stop />
                    </div>
                    <div class="rol-title q-mt-sm">Operativo</div>
                    <div class="rol-firmas">
                      <span :class="getCfg(bit.codigo).rolOperativo ? 'text-amber-3' : 'text-grey-4'">
                        {{ getCfg(bit.codigo).firmasOperativo }} firma{{ getCfg(bit.codigo).firmasOperativo !== 1 ? 's' : '' }}
                      </span>
                      &nbsp;
                      <span class="rol-badge" :class="getCfg(bit.codigo).rolOperativo ? 'text-amber-4' : 'text-grey-5'">
                        ⚠ Nivel operativo
                      </span>
                    </div>
                    <div v-if="getCfg(bit.codigo).rolOperativo" class="row items-center q-mt-sm q-gutter-xs">
                      <q-btn flat dense round icon="remove" size="xs" color="white"
                        @click.stop="adjustFirmas(bit.codigo, 'firmasOperativo', -1)" />
                      <span class="text-caption text-white">{{ getCfg(bit.codigo).firmasOperativo }}</span>
                      <q-btn flat dense round icon="add" size="xs" color="white"
                        @click.stop="adjustFirmas(bit.codigo, 'firmasOperativo', +1)" />
                    </div>
                  </div>

                  <!-- Supervisor -->
                  <div class="rol-card col"
                    :class="getCfg(bit.codigo).rolSupervisor ? 'rol-card--supervisor' : 'rol-card--off'"
                    @click="toggleRol(bit.codigo, 'supervisor')">
                    <div class="row items-start justify-between">
                      <q-icon name="manage_accounts" size="22px" :color="getCfg(bit.codigo).rolSupervisor ? 'white' : 'grey-5'" />
                      <q-checkbox :model-value="getCfg(bit.codigo).rolSupervisor" dense
                        :dark="getCfg(bit.codigo).rolSupervisor"
                        @update:model-value="toggleRol(bit.codigo, 'supervisor')" @click.stop />
                    </div>
                    <div class="rol-title q-mt-sm">Supervisor</div>
                    <div class="rol-firmas">
                      <span :class="getCfg(bit.codigo).rolSupervisor ? 'text-blue-2' : 'text-grey-4'">
                        {{ getCfg(bit.codigo).firmasSupervisor }} firma{{ getCfg(bit.codigo).firmasSupervisor !== 1 ? 's' : '' }}
                      </span>
                      &nbsp;
                      <span class="rol-badge" :class="getCfg(bit.codigo).rolSupervisor ? 'text-blue-3' : 'text-grey-5'">
                        ✓ Nivel supervisor+
                      </span>
                    </div>
                    <div v-if="getCfg(bit.codigo).rolSupervisor" class="row items-center q-mt-sm q-gutter-xs">
                      <q-btn flat dense round icon="remove" size="xs" color="white"
                        @click.stop="adjustFirmas(bit.codigo, 'firmasSupervisor', -1)" />
                      <span class="text-caption text-white">{{ getCfg(bit.codigo).firmasSupervisor }}</span>
                      <q-btn flat dense round icon="add" size="xs" color="white"
                        @click.stop="adjustFirmas(bit.codigo, 'firmasSupervisor', +1)" />
                    </div>
                  </div>

                  <!-- Gerente -->
                  <div class="rol-card col"
                    :class="getCfg(bit.codigo).rolGerente ? 'rol-card--gerente' : 'rol-card--off'"
                    @click="toggleRol(bit.codigo, 'gerente')">
                    <div class="row items-start justify-between">
                      <q-icon name="admin_panel_settings" size="22px" :color="getCfg(bit.codigo).rolGerente ? 'white' : 'grey-5'" />
                      <q-checkbox :model-value="getCfg(bit.codigo).rolGerente" dense
                        :dark="getCfg(bit.codigo).rolGerente"
                        @update:model-value="toggleRol(bit.codigo, 'gerente')" @click.stop />
                    </div>
                    <div class="rol-title q-mt-sm">Gerente / Admin</div>
                    <div class="rol-firmas">
                      <span :class="getCfg(bit.codigo).rolGerente ? 'text-purple-2' : 'text-grey-4'">
                        {{ getCfg(bit.codigo).firmasGerente }} firma{{ getCfg(bit.codigo).firmasGerente !== 1 ? 's' : '' }}
                      </span>
                      &nbsp;
                      <span class="rol-badge" :class="getCfg(bit.codigo).rolGerente ? 'text-purple-3' : 'text-grey-5'">
                        ★ Nivel gerencia
                      </span>
                    </div>
                    <div v-if="getCfg(bit.codigo).rolGerente" class="row items-center q-mt-sm q-gutter-xs">
                      <q-btn flat dense round icon="remove" size="xs" color="white"
                        @click.stop="adjustFirmas(bit.codigo, 'firmasGerente', -1)" />
                      <span class="text-caption text-white">{{ getCfg(bit.codigo).firmasGerente }}</span>
                      <q-btn flat dense round icon="add" size="xs" color="white"
                        @click.stop="adjustFirmas(bit.codigo, 'firmasGerente', +1)" />
                    </div>
                  </div>

                </div>
              </div>

              <!-- FIRMA DE RECEPCIÓN -->
              <div class="q-mb-md">
                <div class="cfg-label q-mb-xs">FIRMA DE RECEPCIÓN</div>
                <div class="recepcion-card"
                  :class="getCfg(bit.codigo).firmaRecepcion ? 'recepcion-card--active' : ''"
                  @click="toggleFirmaRecepcion(bit.codigo)">
                  <div class="row items-center q-gutter-sm">
                    <div class="recep-icon-wrap"
                      :class="getCfg(bit.codigo).firmaRecepcion ? 'recep-icon-wrap--active' : ''">
                      <q-icon name="person_pin" size="18px" color="white" />
                    </div>
                    <div class="col">
                      <div class="text-caption text-weight-bold"
                        :class="getCfg(bit.codigo).firmaRecepcion ? 'text-orange-8' : 'text-grey-6'">
                        Esta bitácora requiere firma de Recepción
                      </div>
                      <div class="text-caption"
                        :class="getCfg(bit.codigo).firmaRecepcion ? 'text-orange-7' : 'text-grey-5'">
                        1 firma adicional de quien recibe / acepta el registro
                      </div>
                    </div>
                    <q-checkbox :model-value="getCfg(bit.codigo).firmaRecepcion" dense
                      :color="getCfg(bit.codigo).firmaRecepcion ? 'orange-7' : 'grey-4'"
                      @update:model-value="toggleFirmaRecepcion(bit.codigo)" @click.stop />
                  </div>
                </div>
              </div>

              <!-- RESUMEN DE FIRMA -->
              <div class="resumen-card">
                <div class="cfg-label q-mb-xs">RESUMEN DE FIRMA</div>
                <div class="row q-gutter-xs q-mb-xs">
                  <template v-if="totalFirmas(bit.codigo) === 0">
                    <span class="text-caption text-grey-5">Sin roles firmantes configurados</span>
                  </template>
                  <q-chip v-if="getCfg(bit.codigo).rolOperativo" dense size="sm"
                    color="grey-8" text-color="white" icon="engineering">
                    Operativo <strong class="q-ml-xs">{{ getCfg(bit.codigo).firmasOperativo }} firma{{ getCfg(bit.codigo).firmasOperativo !== 1 ? 's' : '' }}</strong>
                  </q-chip>
                  <q-chip v-if="getCfg(bit.codigo).rolSupervisor" dense size="sm"
                    color="blue-7" text-color="white" icon="manage_accounts">
                    Supervisor <strong class="q-ml-xs">{{ getCfg(bit.codigo).firmasSupervisor }} firma{{ getCfg(bit.codigo).firmasSupervisor !== 1 ? 's' : '' }}</strong>
                  </q-chip>
                  <q-chip v-if="getCfg(bit.codigo).rolGerente" dense size="sm"
                    color="purple-7" text-color="white" icon="admin_panel_settings">
                    Gerente <strong class="q-ml-xs">{{ getCfg(bit.codigo).firmasGerente }} firma{{ getCfg(bit.codigo).firmasGerente !== 1 ? 's' : '' }}</strong>
                  </q-chip>
                  <q-chip v-if="getCfg(bit.codigo).firmaRecepcion" dense size="sm"
                    color="amber-7" text-color="white" icon="person_pin">
                    Recepción · 1 firma
                  </q-chip>
                </div>
                <div class="text-caption text-grey-7">
                  Total de firmas NIP requeridas para cerrar un registro:
                  <strong>{{ totalFirmas(bit.codigo) }}</strong>
                  <template v-if="getCfg(bit.codigo).periodicidad === 'Semanal' && getCfg(bit.codigo).diaSemana">
                    · <span class="text-blue-6">Genera cada {{ getCfg(bit.codigo).diaSemana }}</span>
                  </template>
                </div>
              </div>

            </div>
          </q-expansion-item>

        </div>
      </q-expansion-item>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { api } from 'src/boot/axios';

// ─── Tipos ───────────────────────────────────────────────────
interface ColDef { campo: string; label: string; }

interface BitacoraConfig {
  periodicidad:     string;
  diaSemana:        string;
  rolOperativo:     boolean;
  firmasOperativo:  number;
  rolSupervisor:    boolean;
  firmasSupervisor: number;
  rolGerente:       boolean;
  firmasGerente:    number;
  firmaRecepcion:   boolean;
}

interface BitacoraItem {
  codigo:   string;
  nombre:   string;
  columnas: ColDef[];   // sólo bitácoras con columnas aparecen aquí
}

interface SeccionItem {
  codigo:     string;
  nombre:     string;
  color:      string;
  colorLight: string;
  colorQ:     string;
  icono:      string;
  bitacoras:  BitacoraItem[];
}

interface NipConfig {
  longitud: number;
  intentos: number;
  tiempo:   number;
}

interface BitacoraConfigRow extends BitacoraConfig {
  codigoBitacora: string;
}

interface NipConfigRow {
  longitudNip:   number;
  intentos:      number;
  tiempoBloqueo: number;
}

// ─── Constantes ───────────────────────────────────────────────
const PERIODICIDADES = [
  { val: 'Diaria',    label: 'Diaria',    icon: 'today' },
  { val: 'Semanal',   label: 'Semanal',   icon: 'date_range' },
  { val: 'Quincenal', label: 'Quincenal', icon: 'event' },
  { val: 'Mensual',   label: 'Mensual',   icon: 'calendar_month' },
];

const DIAS_SEMANA = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

const SECCIONES: SeccionItem[] = [
  {
    codigo: 'SEC-01', nombre: 'Báscula', color: '#e65100', colorLight: '#fff3e0', colorQ: 'deep-orange-8', icono: 'scale',
    bitacoras: [
      { codigo: 'FO-HC-IMP-002', nombre: 'Bitácora de Registro de Recepción de Grano', columnas: [
        { campo: 'fecha',             label: 'Fecha' },
        { campo: 'productor_cliente', label: 'Productor/Cliente' },
        { campo: 'placas',            label: 'Placas de Camión' },
        { campo: 'tipo_grano',        label: 'Tipo de Grano' },
        { campo: 'ticket',            label: '# de Ticket o Boleta' },
        { campo: 'peso_bruto',        label: 'Peso Bruto (kg)' },
        { campo: 'tara',              label: 'Tara (kg)' },
        { campo: 'peso_neto',         label: 'Peso Neto (kg)' },
        { campo: 'observaciones',     label: 'Observaciones' },
      ]},
      { codigo: 'FO-HC-IMP-003', nombre: 'Bitácora de Análisis de Grano', columnas: [
        { campo: 'ticket',            label: 'Ticket/No. Boleta' },
        { campo: 'placas',            label: 'Placas de Camión' },
        { campo: 'color_apariencia',  label: 'Color/Apariencia' },
        { campo: 'olor',              label: 'Olor' },
        { campo: 'humedad',           label: 'Humedad del Grano (%)' },
        { campo: 'impurezas',         label: 'Impurezas (%)' },
        { campo: 'infestacion_moho',  label: 'Infestación/Moho (S/N)' },
        { campo: 'resultado_final',   label: 'Resultado Final' },
        { campo: 'observaciones',     label: 'Observaciones' },
      ]},
      { codigo: 'FO-HC-IMP-011', nombre: 'Bitácora de Báscula – Salida', columnas: [
        { campo: 'fecha',             label: 'Fecha' },
        { campo: 'ticket_folio',      label: 'Ticket/Folio' },
        { campo: 'producto',          label: 'Producto' },
        { campo: 'lote',              label: 'Lote' },
        { campo: 'peso_bruto',        label: 'Peso Bruto (kg)' },
        { campo: 'tara',              label: 'Tara (kg)' },
        { campo: 'peso_neto',         label: 'Peso Neto (kg)' },
        { campo: 'cliente_destino',   label: 'Cliente/Destino' },
        { campo: 'observaciones',     label: 'Observaciones' },
      ]},
    ],
  },
  {
    codigo: 'SEC-02', nombre: 'Volcado', color: '#f59e0b', colorLight: '#fffbeb', colorQ: 'amber-8', icono: 'move_to_inbox',
    bitacoras: [
      { codigo: 'FO-HC-IMP-004', nombre: 'Bitácora de Volcado y Evaluación Visual del Grano', columnas: [
        { campo: 'fecha',             label: 'Fecha' },
        { campo: 'ticket',            label: 'Ticket/No. Boleta' },
        { campo: 'condicion_tolva',   label: 'Condición de Tolva antes de Volcado' },
        { campo: 'condicion_grano',   label: 'Condición del Grano Descargado' },
        { campo: 'silo_asignado',     label: 'Silo Asignado' },
        { campo: 'observaciones',     label: 'Observaciones' },
      ]},
      { codigo: 'FO-HC-IMP-009', nombre: 'Bitácora de Monitoreo de Temperatura y Humedad', columnas: [
        { campo: 'fecha',             label: 'Fecha' },
        { campo: 'hora',              label: 'Hora' },
        { campo: 'area_silo',         label: 'Área o Silo Monitoreado' },
        { campo: 'temperatura',       label: 'Temperatura (°C)' },
        { campo: 'humedad_relativa',  label: 'Humedad Relativa (%)' },
        { campo: 'condicion',         label: 'Condición del Grano / Obs. Visual' },
        { campo: 'accion_correctiva', label: 'Acción Correctiva Aplicada' },
        { campo: 'responsable',       label: 'Nombre y Firma del Responsable' },
      ]},
    ],
  },
  {
    codigo: 'SEC-03', nombre: 'Proceso', color: '#3b82f6', colorLight: '#eff6ff', colorQ: 'blue-6', icono: 'precision_manufacturing',
    bitacoras: [
      { codigo: 'FO-HC-IMP-005', nombre: 'Bitácora de Producción y Clasificación (Garbanzo / Frijol)', columnas: [
        { campo: 'fecha',             label: 'Fecha' },
        { campo: 'orden_lote',        label: 'Orden de Producción / Lote' },
        { campo: 'producto',          label: 'Producto' },
        { campo: 'num_tren',          label: '# Tren' },
        { campo: 'silo_origen',       label: 'Silo Origen' },
        { campo: 'cant_procesada',    label: 'Cantidad Procesada (kg)' },
        { campo: 'prod_clasificado',  label: 'Producto Clasificado (kg)' },
        { campo: 'subproducto',       label: 'Subproducto / Rezaga (kg)' },
        { campo: 'desecho',           label: 'Desecho (kg)' },
        { campo: 'rendimiento',       label: 'Rendimiento (%)' },
        { campo: 'observaciones',     label: 'Observaciones' },
      ]},
      { codigo: 'FO-HC-IMP-006', nombre: 'Bitácora de Control de Calidad del Producto Terminado', columnas: [
        { campo: 'fecha',             label: 'Fecha' },
        { campo: 'envasado',          label: 'Envasado' },
        { campo: 'producto',          label: 'Producto' },
        { campo: 'cosecha',           label: 'Cosecha' },
        { campo: 'proceso',           label: 'Proceso' },
        { campo: 'silos',             label: 'Silos' },
        { campo: 'variedad',          label: 'Variedad' },
        { campo: 'parrillas_completas',  label: 'Parrillas Completas' },
        { campo: 'parrillas_comenzadas', label: 'Parrillas Comenzadas' },
      ]},
    ],
  },
  {
    codigo: 'SEC-04', nombre: 'Almacén', color: '#14b8a6', colorLight: '#f0fdfa', colorQ: 'teal-6', icono: 'warehouse',
    bitacoras: [
      { codigo: 'FO-HC-IMP-007', nombre: 'Bitácora de Descarga Manual y Almacenamiento de Frijol', columnas: [
        { campo: 'fecha',             label: 'Fecha' },
        { campo: 'ticket',            label: 'Ticket / Boleta No.' },
        { campo: 'condicion_camion',  label: 'Condición de Camión antes de Descarga' },
        { campo: 'condicion_grano',   label: 'Condición del Grano Descargado' },
        { campo: 'almacen_asignado',  label: 'Almacén Asignado' },
        { campo: 'observaciones',     label: 'Observaciones' },
        { campo: 'resultado_accion',  label: 'Resultado / Acción Tomada' },
      ]},
      { codigo: 'FO-HC-IMP-008', nombre: 'Bitácora de Almacenamiento Final de Producto', columnas: [
        { campo: 'fecha',             label: 'Fecha' },
        { campo: 'producto',          label: 'Producto' },
        { campo: 'presentacion',      label: 'Presentación' },
        { campo: 'variedad',          label: 'Variedad' },
        { campo: 'ubicacion',         label: 'Ubicación' },
        { campo: 'lote',              label: 'Lote' },
        { campo: 'cantidad',          label: 'Cantidad Almacenada (kg/sacos)' },
        { campo: 'cond_producto',     label: 'Condición del Producto' },
        { campo: 'cond_area',         label: 'Condición del Área' },
        { campo: 'marbete_colocado',  label: 'Marbete Colocado' },
        { campo: 'codigo_marbete',    label: 'Código del Marbete' },
        { campo: 'movimiento',        label: 'Movimiento' },
        { campo: 'observaciones',     label: 'Observaciones' },
      ]},
      { codigo: 'FO-HC-IMP-009', nombre: 'Bitácora de Monitoreo de Temperatura y Humedad', columnas: [
        { campo: 'fecha',             label: 'Fecha' },
        { campo: 'hora',              label: 'Hora' },
        { campo: 'area_silo',         label: 'Área o Silo Monitoreado' },
        { campo: 'temperatura',       label: 'Temperatura (°C)' },
        { campo: 'humedad_relativa',  label: 'Humedad Relativa (%)' },
        { campo: 'condicion',         label: 'Condición del Grano / Obs. Visual' },
        { campo: 'accion_correctiva', label: 'Acción Correctiva Aplicada' },
        { campo: 'responsable',       label: 'Nombre y Firma del Responsable' },
      ]},
    ],
  },
  {
    codigo: 'SEC-05', nombre: 'Despacho', color: '#8b5cf6', colorLight: '#f5f3ff', colorQ: 'purple-6', icono: 'local_shipping',
    bitacoras: [
      { codigo: 'FO-HC-IMP-010', nombre: 'Bitácora de Despacho y Verificación de Unidades Limpias', columnas: [
        { campo: 'fecha',             label: 'Fecha' },
        { campo: 'unidad_placas',     label: 'Unidad / Placas' },
        { campo: 'conductor',         label: 'Conductor / Transportista' },
        { campo: 'producto_despachado', label: 'Producto Despachado' },
        { campo: 'lote',              label: 'Lote de Producto' },
        { campo: 'cantidad_peso',     label: 'Cantidad / Peso (kg)' },
        { campo: 'cond_vehiculo',     label: 'Condición del Vehículo' },
        { campo: 'resultado_verif',   label: 'Resultado de Verificación' },
        { campo: 'observaciones',     label: 'Observaciones / Acción Correctiva' },
      ]},
    ],
  },
  {
    codigo: 'SEC-06', nombre: 'Inocuidad', color: '#22c55e', colorLight: '#f0fdf4', colorQ: 'green-6', icono: 'health_and_safety',
    bitacoras: [],
  },
];

// ─── Estado reactivo ──────────────────────────────────────────
const nip = reactive<NipConfig>({ longitud: 4, intentos: 3, tiempo: 15 });
const configs  = reactive<Record<string, BitacoraConfig>>({});
const saving   = reactive<Record<string, boolean>>({});
const saved    = reactive<Record<string, boolean>>({});

function defaultCfg(): BitacoraConfig {
  return {
    periodicidad: 'Diaria', diaSemana: '',
    rolOperativo: false, firmasOperativo: 2,
    rolSupervisor: false, firmasSupervisor: 1,
    rolGerente: false, firmasGerente: 1,
    firmaRecepcion: false,
  };
}

function getCfg(codigo: string): BitacoraConfig {
  if (!configs[codigo]) configs[codigo] = defaultCfg();
  return configs[codigo];
}

// ─── Helpers de sección ───────────────────────────────────────
function configuradas(sec: SeccionItem): BitacoraItem[] {
  return sec.bitacoras; // ya filtrado — solo las que tienen columnas
}

function firmasSeccion(sec: SeccionItem): number {
  return configuradas(sec).reduce((sum, bit) => sum + totalFirmas(bit.codigo), 0);
}

function capitalize(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());
}

// ─── Carga inicial ────────────────────────────────────────────
onMounted(async () => {
  try {
    const [cfgRes, nipRes] = await Promise.all([
      api.get<BitacoraConfigRow[]>('/api/bitacoras-config'),
      api.get<NipConfigRow>('/api/bitacoras-config/nip-global'),
    ]);
    for (const row of cfgRes.data) {
      if (!row.codigoBitacora) continue;
      configs[row.codigoBitacora] = {
        periodicidad:     row.periodicidad ?? 'Diaria',
        diaSemana:        row.diaSemana ?? '',
        rolOperativo:     row.rolOperativo,
        firmasOperativo:  row.firmasOperativo,
        rolSupervisor:    row.rolSupervisor,
        firmasSupervisor: row.firmasSupervisor,
        rolGerente:       row.rolGerente,
        firmasGerente:    row.firmasGerente,
        firmaRecepcion:   row.firmaRecepcion,
      };
    }
    nip.longitud = nipRes.data.longitudNip ?? 4;
    nip.intentos = nipRes.data.intentos ?? 3;
    nip.tiempo   = nipRes.data.tiempoBloqueo ?? 15;
  } catch { /* defaults */ }
});

// ─── Auto-save (bitácoras) ────────────────────────────────────
const saveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function scheduleSave(codigo: string) {
  clearTimeout(saveTimers[codigo]);
  saveTimers[codigo] = setTimeout(() => void persistConfig(codigo), 600);
}

async function persistConfig(codigo: string) {
  saving[codigo] = true;
  saved[codigo]  = false;
  try {
    await api.put(`/api/bitacoras-config/${encodeURIComponent(codigo)}`, getCfg(codigo));
    saved[codigo] = true;
    setTimeout(() => { saved[codigo] = false; }, 2000);
  } finally {
    saving[codigo] = false;
  }
}

// ─── Auto-save NIP ────────────────────────────────────────────
let nipTimer: ReturnType<typeof setTimeout> | null = null;

function setNip(field: 'longitud' | 'intentos' | 'tiempo', val: number) {
  nip[field] = val;
  if (nipTimer) clearTimeout(nipTimer);
  nipTimer = setTimeout(() => {
    void api.put('/api/bitacoras-config/nip-global', {
      longitudNip: nip.longitud, intentos: nip.intentos, tiempoBloqueo: nip.tiempo,
    });
  }, 600);
}

// ─── Mutaciones ───────────────────────────────────────────────
function setCfgField<K extends keyof BitacoraConfig>(codigo: string, field: K, value: BitacoraConfig[K]) {
  getCfg(codigo)[field] = value;
  scheduleSave(codigo);
}

function toggleRol(codigo: string, rol: 'operativo' | 'supervisor' | 'gerente') {
  const c = getCfg(codigo);
  if (rol === 'operativo')  c.rolOperativo  = !c.rolOperativo;
  if (rol === 'supervisor') c.rolSupervisor = !c.rolSupervisor;
  if (rol === 'gerente')    c.rolGerente    = !c.rolGerente;
  scheduleSave(codigo);
}

function toggleFirmaRecepcion(codigo: string) {
  getCfg(codigo).firmaRecepcion = !getCfg(codigo).firmaRecepcion;
  scheduleSave(codigo);
}

function adjustFirmas(codigo: string, field: 'firmasOperativo' | 'firmasSupervisor' | 'firmasGerente', delta: number) {
  const c    = getCfg(codigo);
  const next = c[field] + delta;
  if (next >= 1 && next <= 5) {
    c[field] = next;
    scheduleSave(codigo);
  }
}

function totalFirmas(codigo: string): number {
  const c = getCfg(codigo);
  return (c.rolOperativo  ? c.firmasOperativo  : 0)
       + (c.rolSupervisor ? c.firmasSupervisor : 0)
       + (c.rolGerente    ? c.firmasGerente    : 0)
       + (c.firmaRecepcion ? 1 : 0);
}
</script>

<style scoped>
/* ── Sección chips ── */
.cb-sec-badge {
  font-size: 10px; font-weight: 800; letter-spacing: .6px;
  color: #fff; border-radius: 4px; padding: 2px 8px;
}
.cb-code-chip {
  font-size: 10px; font-weight: 700;
  border: 1.5px solid; border-radius: 4px;
  padding: 2px 7px; white-space: nowrap; flex-shrink: 0;
}
.cfg-label {
  font-size: 10px; font-weight: 800; letter-spacing: 0.8px; color: #9e9e9e;
}

/* ── NIP global card ── */
.nip-card {
  background: #fff; border: 1.5px solid #e0e0e0;
  border-radius: 10px; padding: 18px 20px;
}
.nip-icon-wrap {
  width: 36px; height: 36px; border-radius: 8px;
  background: #1a1a2e; display: flex; align-items: center; justify-content: center;
}
.nip-label { font-size: 11px; font-weight: 700; color: #555; }
.nip-btn {
  padding: 6px 14px; border-radius: 6px;
  border: 1.5px solid #d0d0d0; background: #fff; color: #666;
  font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;
}
.nip-btn:hover { border-color: #888; color: #333; }
.nip-btn--active-dark  { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
.nip-btn--active-orange { background: #f97316; color: #fff; border-color: #f97316; }
.nip-info-box {
  background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 8px;
  padding: 10px 14px; display: flex; align-items: flex-start;
}

/* ── Bitácora panel ── */
.bit-panel {
  background: #fafafa; border-top: 1px solid #f0f0f0;
}

/* ── Periodicidad buttons ── */
.period-btn {
  display: inline-flex; align-items: center;
  padding: 5px 12px; border-radius: 20px;
  border: 1.5px solid #d0d0d0; background: #fff; color: #666;
  font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s;
}
.period-btn:hover { border-color: #888; color: #333; }
.period-btn--active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }

/* ── Rol cards ── */
.rol-card {
  border-radius: 10px; padding: 12px; cursor: pointer;
  transition: all 0.2s; min-width: 100px;
}
.rol-card--off {
  background: #f8f8f8; border: 1.5px solid #e8e8e8;
}
.rol-card--operativo  { background: #1a1a2e; border: 1.5px solid #1a1a2e; }
.rol-card--supervisor { background: #1e40af; border: 1.5px solid #1e40af; }
.rol-card--gerente    { background: #6d28d9; border: 1.5px solid #6d28d9; }

.rol-title  { font-size: 13px; font-weight: 700; color: inherit; }
.rol-card--off .rol-title { color: #bbb; }
.rol-firmas { font-size: 11px; margin-top: 2px; }
.rol-badge  { font-size: 10px; }

/* ── Firma Recepción ── */
.recepcion-card {
  border-radius: 8px; border: 1.5px solid #e0e0e0;
  background: #fafafa; padding: 10px 14px; cursor: pointer; transition: all 0.2s;
}
.recepcion-card--active { background: #fff7ed; border-color: #fb923c; }
.recep-icon-wrap {
  width: 32px; height: 32px; border-radius: 6px;
  background: #d0d0d0; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.recep-icon-wrap--active { background: #f97316; }

/* ── Resumen ── */
.resumen-card {
  background: #f5f5f5; border-radius: 8px; padding: 10px 14px;
}
</style>
