<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="page-heading">
        <h1 class="text-3xl font-bold text-base-content">Mantenimientos</h1>
        <p class="text-base-content/60 mt-1">Historial completo de servicios de aceite</p>
      </div>
    </div>

    <div class="tabs tabs-bordered maintenance-status-tabs" role="tablist" aria-label="Estado de mantenimientos">
      <button
        class="tab tab-bordered"
        :class="{ 'tab-bordered-active': filtroEstado === 'vigentes' }"
        type="button"
        role="tab"
        :aria-selected="filtroEstado === 'vigentes'"
        @click="filtroEstado = 'vigentes'"
      >
        Vigentes <span class="badge badge-success badge-sm">{{ mantenimientosVigentes.length }}</span>
      </button>
      <button
        class="tab tab-bordered"
        :class="{ 'tab-bordered-active': filtroEstado === 'vencidos' }"
        type="button"
        role="tab"
        :aria-selected="filtroEstado === 'vencidos'"
        @click="filtroEstado = 'vencidos'"
      >
        Vencidos <span class="badge badge-error badge-sm">{{ mantenimientosVencidos.length }}</span>
      </button>
      <button
        class="tab tab-bordered"
        :class="{ 'tab-bordered-active': filtroEstado === 'historial' }"
        type="button"
        role="tab"
        :aria-selected="filtroEstado === 'historial'"
        @click="filtroEstado = 'historial'"
      >
        Historial <span class="badge badge-ghost badge-sm">{{ mantenimientosHistorial.length }}</span>
      </button>
    </div>

    <div v-if="mantenimientosFiltrados.length > 0" class="records-grid">
      <article v-for="m in mantenimientosFiltrados" :key="m.id" class="card record-card">
        <header class="record-card-header">
          <div class="record-card-identity">
            <div class="avatar w-11 h-11 bg-primary/10 text-primary"><i class="ri-truck-line ri-lg"></i></div>
            <div class="min-w-0">
              <h2 class="record-card-title">{{ toUpperCase(m.vehiculo?.placa) }}</h2>
              <p class="record-card-subtitle">{{ toUpperCase(m.vehiculo?.marca) }} {{ toUpperCase(m.vehiculo?.modelo) }}</p>
            </div>
          </div>
          <div class="record-card-actions">
            <button
              class="btn btn-ghost btn-circle"
              type="button"
              :aria-label="`Editar mantenimiento ${m.id}`"
              title="Editar"
              @click="editar(m)"
            >
              <i class="ri-edit-line ri-lg"></i>
            </button>
            <button
              class="btn btn-ghost btn-circle text-error"
              type="button"
              :aria-label="`Eliminar mantenimiento ${m.id}`"
              title="Eliminar"
              @click="eliminar(m)"
            >
              <i class="ri-delete-bin-line ri-lg"></i>
            </button>
          </div>
        </header>

        <div class="record-card-date">
          <i class="ri-calendar-line"></i>
          Servicio del {{ formatearFecha(m.fecha_servicio) }}
          <span v-if="estaVencido(m)" class="badge badge-error badge-sm maintenance-expired-badge">
            <i class="ri-alarm-warning-line"></i> Vencido
          </span>
          <span v-else-if="!esServicioActual(m)" class="badge badge-ghost badge-sm maintenance-expired-badge">
            Servicio reemplazado
          </span>
        </div>

        <dl class="record-card-details">
          <div v-if="m.chofer" class="record-card-detail">
            <dt>Chofer</dt>
            <dd>{{ toUpperCase(m.chofer.nombre) }} {{ toUpperCase(m.chofer.apellido) }}</dd>
          </div>
          <div v-if="m.kilometraje !== null" class="record-card-detail">
            <dt>Kilometraje</dt>
            <dd>{{ m.kilometraje.toLocaleString() }} km</dd>
          </div>
          <div class="record-card-detail">
            <dt>Tipo de aceite</dt>
            <dd>{{ toUpperCase(m.tipo_aceite) || '—' }}</dd>
          </div>
          <div class="record-card-detail">
            <dt>N.º de filtro</dt>
            <dd>{{ toUpperCase(m.numero_filtro) || '—' }}</dd>
          </div>
          <div class="record-card-detail">
            <dt>Filtro de combustible</dt>
            <dd>{{ m.filtro_combustible ? 'Cambiado' : 'No cambiado' }}</dd>
          </div>
          <div class="record-card-detail">
            <dt>Filtro de aire</dt>
            <dd>{{ m.filtro_aire_accion === 'soplado' ? 'Soplado' : (m.filtro_aire || m.filtro_aire_accion) ? 'Cambiado' : 'No cambiado' }}</dd>
          </div>
          <div class="record-card-detail">
            <dt>Próximo servicio</dt>
            <dd v-if="m.proxima_revision">{{ formatearFecha(m.proxima_revision) }}</dd>
            <dd v-else-if="m.proximo_kilometraje !== null">{{ m.proximo_kilometraje.toLocaleString() }} km</dd>
            <dd v-else class="text-base-content/40">Sin programar</dd>
            <p v-if="m.proximo_kilometraje !== null && m.kilometraje !== null" class="record-card-hint">
              {{ (m.proximo_kilometraje - m.kilometraje).toLocaleString() }} km restantes
            </p>
          </div>
        </dl>

        <footer v-if="m.engrase || m.transmision_caja" class="record-card-footer">
          <span v-if="m.engrase" class="badge badge-warning badge-sm"><i class="ri-check-line"></i> Engrase</span>
          <span v-if="m.transmision_caja" class="badge badge-info badge-sm">
            <i class="ri-settings-3-line"></i> Transmisión/Caja: {{ toUpperCase(m.transmision_caja) }}
          </span>
        </footer>
      </article>
    </div>
    <div v-else-if="!cargando" class="card record-empty">
      <i :class="filtroEstado === 'vencidos' ? 'ri-checkbox-circle-line ri-3xl' : 'ri-inbox-line ri-3xl'"></i>
      <p>
        {{ filtroEstado === 'vencidos'
          ? 'No hay mantenimientos vencidos'
          : filtroEstado === 'historial'
            ? 'No hay servicios anteriores en el historial'
            : 'No hay mantenimientos vigentes' }}
      </p>
    </div>

    <ModalEdicionRegistro
      v-if="edicion"
      tipo="mantenimiento"
      :registro="edicion"
      :vehiculos="vehiculos"
      :choferes="choferes"
      @cerrar="edicion = null"
      @guardado="guardarEdicion"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useMantenimientos } from '~/composables/useMantenimientos'
import { useVehiculos } from '~/composables/useVehiculos'
import { useChoferes } from '~/composables/useChoferes'
import { useTextNormalize } from '~/composables/useTextNormalize'
import type { Chofer, MantenimientoConRelaciones, Vehiculo } from '~/types/database'

const { obtenerTodos, eliminar: eliminarMantenimiento } = useMantenimientos()
const { obtenerTodos: obtenerVehiculos, obtenerConSeguimiento } = useVehiculos()
const { obtenerTodos: obtenerChoferes } = useChoferes()
const { toUpperCase } = useTextNormalize()

const mantenimientos = ref<MantenimientoConRelaciones[]>([])
const serviciosActuales = ref(new Set<number>())
const vehiculos = ref<Vehiculo[]>([])
const choferes = ref<Chofer[]>([])
const edicion = ref<MantenimientoConRelaciones | null>(null)
const cargando = ref(true)
const filtroEstado = ref<'vigentes' | 'vencidos' | 'historial'>('vigentes')
const fechaHoy = ref(obtenerFechaHoy())
let temporizadorFecha: ReturnType<typeof setInterval> | undefined

const mantenimientosVencidos = computed(() => mantenimientos.value.filter(estaVencido))
const mantenimientosVigentes = computed(() =>
  mantenimientos.value.filter(m => serviciosActuales.value.has(m.id) && !estaVencido(m))
)
const mantenimientosHistorial = computed(() => mantenimientos.value.filter(m => !serviciosActuales.value.has(m.id)))
const mantenimientosFiltrados = computed(() =>
  filtroEstado.value === 'vencidos'
    ? mantenimientosVencidos.value
    : filtroEstado.value === 'historial'
      ? mantenimientosHistorial.value
      : mantenimientosVigentes.value
)

function esServicioActual(m: MantenimientoConRelaciones): boolean {
  return serviciosActuales.value.has(m.id)
}

function estaVencido(m: MantenimientoConRelaciones): boolean {
  if (!serviciosActuales.value.has(m.id)) return false
  if (m.proxima_revision && m.proxima_revision < fechaHoy.value) return true

  return m.proximo_kilometraje !== null &&
    m.kilometraje !== null &&
    m.kilometraje >= m.proximo_kilometraje
}

function obtenerFechaHoy(): string {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
}

function formatearFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function cargar() {
  cargando.value = true
  try {
    const [mantenimientosData, vehiculosData] = await Promise.all([
      obtenerTodos(),
      obtenerConSeguimiento()
    ])
    mantenimientos.value = mantenimientosData
    const idsActuales = new Set<number>()
    for (const vehiculo of vehiculosData) {
      const ultimoMantenimiento = vehiculo.ultimo_mantenimiento
      if (ultimoMantenimiento) {
        idsActuales.add(ultimoMantenimiento.id)
      }
    }
    serviciosActuales.value = idsActuales
  } catch (error) {
    console.error('Error:', error)
  } finally {
    cargando.value = false
  }
}

async function editar(m: MantenimientoConRelaciones) {
  try {
    const [vehiculosData, choferesData] = await Promise.all([obtenerVehiculos(), obtenerChoferes()])
    vehiculos.value = vehiculosData
    choferes.value = choferesData
    edicion.value = m
  } catch (error) {
    console.error('Error cargando opciones de edición:', error)
    alert('No se pudieron cargar los vehículos y choferes para editar.')
  }
}

async function guardarEdicion() {
  edicion.value = null
  await cargar()
}

async function eliminar(m: MantenimientoConRelaciones) {
  if (!confirm(`¿Eliminar mantenimiento de ${m.vehiculo?.placa} del ${formatearFecha(m.fecha_servicio)}?`)) return
  try {
    await eliminarMantenimiento(m.id)
    await cargar()
  } catch (error) {
    console.error('Error eliminando:', error)
    alert(error instanceof Error ? `No se pudo eliminar el mantenimiento: ${error.message}` : 'No se pudo eliminar el mantenimiento.')
  }
}

onMounted(() => {
  void cargar()
  temporizadorFecha = setInterval(() => {
    fechaHoy.value = obtenerFechaHoy()
  }, 60_000)
})

onBeforeUnmount(() => {
  if (temporizadorFecha) clearInterval(temporizadorFecha)
})

const cambiosMantenimiento = useState<number>('cambios-mantenimiento', () => 0)
watch(cambiosMantenimiento, cargar)
</script>