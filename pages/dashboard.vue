<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="page-heading">
        <h1 class="text-3xl font-bold text-base-content">Dashboard</h1>
        <p class="text-base-content/60 mt-1">Resumen de mantenimientos y próximas revisiones</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="badge badge-ghost">Actualizado: {{ fechaActual }}</span>
      </div>
    </div>

    <div v-if="cargando" class="grid dashboard-stat-grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="i in 4" :key="i" class="card dashboard-stat-card">
        <div class="dashboard-stat-card-header">
          <div class="skeleton h-4 w-1/3"></div>
          <div class="skeleton h-11 w-11 rounded-xl"></div>
        </div>
        <div class="skeleton h-9 w-1/3 mt-5"></div>
        <div class="skeleton h-4 w-2/3 mt-3"></div>
      </div>
    </div>

    <div v-else class="grid dashboard-stat-grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="card dashboard-stat-card dashboard-stat-card-primary">
        <div class="dashboard-stat-card-header">
          <p class="stat-title">Total vehículos</p>
          <div class="stat-figure">
            <i class="ri-truck-line"></i>
          </div>
        </div>
        <p class="stat-value">{{ stats.total_vehiculos }}</p>
        <div class="dashboard-stat-card-footer">
          <span><i class="ri-gauge-line"></i>{{ stats.por_kilometraje }} por km</span>
          <span><i class="ri-calendar-line"></i>{{ stats.por_fecha }} por fecha</span>
        </div>
      </div>

      <div class="card dashboard-stat-card dashboard-stat-card-secondary">
        <div class="dashboard-stat-card-header">
          <p class="stat-title">Total choferes</p>
          <div class="stat-figure">
            <i class="ri-user-line"></i>
          </div>
        </div>
        <p class="stat-value">{{ stats.total_choferes }}</p>
        <div class="dashboard-stat-card-footer">
          <span><i class="ri-team-line"></i>Choferes registrados</span>
        </div>
      </div>

      <div class="card dashboard-stat-card dashboard-stat-card-accent">
        <div class="dashboard-stat-card-header">
          <p class="stat-title">Mantenimientos</p>
          <div class="stat-figure">
            <i class="ri-tools-line"></i>
          </div>
        </div>
        <p class="stat-value">{{ stats.total_mantenimientos }}</p>
        <div class="dashboard-stat-card-footer">
          <span><i class="ri-calendar-check-line"></i>{{ stats.mantenimientos_mes_actual }} este mes</span>
        </div>
      </div>

      <div class="card dashboard-stat-card dashboard-stat-card-error">
        <div class="dashboard-stat-card-header">
          <p class="stat-title">Alertas</p>
          <div class="stat-figure">
            <i class="ri-alarm-warning-line"></i>
          </div>
        </div>
        <p class="stat-value">{{ stats.proximos_vencidos + stats.mantenimientos_por_vencer }}</p>
        <div class="dashboard-stat-card-footer dashboard-stat-alerts">
          <span><i class="ri-close-circle-line"></i>{{ stats.proximos_vencidos }} vencidos</span>
          <span><i class="ri-time-line"></i>{{ stats.mantenimientos_por_vencer }} por vencer</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="max-h-[28rem] overflow-auto scrollbar-thin">
          <table class="table table-zebra table-pin-rows w-full responsive-table">
            <thead>
              <tr>
                <th class="w-40">Vehículo</th>
                <th class="hidden md:table-cell">Tipo Seguimiento</th>
                <th>Próximo Servicio</th>
                <th>Estado</th>
                <th class="w-24">Último</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in proximasRevisiones" :key="v.id">
                <td class="font-medium mobile-table-wide" data-label="Vehículo">
                  <div class="flex items-center gap-2">
                    <div class="avatar w-8 h-8 bg-primary/10 text-primary">
                      <i class="ri-truck-line"></i>
                    </div>
                    <div>
                      <p>{{ toUpperCase(v.placa) }}</p>
                      <p class="text-xs text-base-content/50">{{ toUpperCase(v.marca) }} {{ toUpperCase(v.modelo) }}</p>
                    </div>
                  </div>
                </td>
                <td class="hidden md:table-cell" data-label="Seguimiento">
                  <span class="badge" :class="v.tipo_seguimiento === 'kilometraje' ? 'badge-primary' : 'badge-secondary'">
                    <i :class="v.tipo_seguimiento === 'kilometraje' ? 'ri-gauge-line' : 'ri-calendar-line'"></i>
                    {{ toUpperCase(v.tipo_seguimiento === 'kilometraje' ? 'Kilometraje' : 'Fecha') }}
                  </span>
                </td>
                <td data-label="Próximo servicio">
                  <div v-if="v.proximo_servicio">
                    <div v-if="v.tipo_seguimiento === 'fecha' && v.proximo_servicio.fecha">
                      <p class="font-medium">{{ formatearFecha(v.proximo_servicio.fecha) }}</p>
                      <p class="text-xs" :class="v.proximo_servicio.vencido ? 'text-error' : 'text-base-content/50'">
                        {{ v.proximo_servicio.vencido ? 'VENCIDO' : `${v.proximo_servicio.dias_restantes} días` }}
                      </p>
                    </div>
                    <div v-else-if="v.tipo_seguimiento === 'kilometraje' && v.proximo_servicio.kilometraje">
                      <p class="font-medium">{{ v.proximo_servicio.kilometraje.toLocaleString() }} km</p>
                      <p class="text-xs" :class="v.proximo_servicio.vencido ? 'text-error' : 'text-base-content/50'">
                        {{ v.proximo_servicio.vencido ? 'VENCIDO' : `${v.proximo_servicio.km_restantes?.toLocaleString()} km` }}
                      </p>
                    </div>
                    <span v-else class="text-base-content/40 italic">Sin programar</span>
                  </div>
                  <span v-else class="text-base-content/40 italic">Sin programar</span>
                </td>
                <td data-label="Estado">
                  <span class="badge" :class="obtenerClaseEstado(v)">
                    <i :class="obtenerIconoEstado(v)"></i>
                    {{ obtenerTextoEstado(v) }}
                  </span>
                </td>
                <td class="text-base-content/60 text-sm" data-label="Último servicio">
                  {{ v.ultimo_mantenimiento ? formatearFecha(v.ultimo_mantenimiento.fecha_servicio) : '—' }}
                </td>
              </tr>
              <tr v-if="proximasRevisiones.length === 0" class="empty-table-row">
                <td colspan="5" class="text-center py-12 text-base-content/50">
                  <i class="ri-inbox-line ri-3xl block mb-2"></i>
                  No hay vehículos con próximas revisiones
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title mb-4 flex items-center gap-2">
            <i class="ri-bar-chart-line text-info"></i> Distribución por Tipo
          </h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Por Kilometraje</span>
                <span class="font-medium">{{ stats.por_kilometraje }}</span>
              </div>
              <div class="progress">
                <div class="progress-bar bg-primary" :style="{ width: stats.total_vehiculos > 0 ? (stats.por_kilometraje / stats.total_vehiculos * 100) + '%' : '0%' }"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Por Fecha</span>
                <span class="font-medium">{{ stats.por_fecha }}</span>
              </div>
              <div class="progress">
                <div class="progress-bar bg-secondary" :style="{ width: stats.total_vehiculos > 0 ? (stats.por_fecha / stats.total_vehiculos * 100) + '%' : '0%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <h3 class="card-title mb-4 flex items-center gap-2">
            <i class="ri-alarm-warning-line text-error"></i> Vencidos
          </h3>
          <div v-if="mantenimientosVencidos.length === 0" class="text-center py-8 text-base-content/50">
            <i class="ri-calendar-check-line ri-3xl block mb-2"></i>
            No hay mantenimientos vencidos
          </div>
          <div v-else class="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
            <div v-for="v in mantenimientosVencidos" :key="v.id" class="flex items-center justify-between p-3 rounded-field bg-base-200/50 mobile-upcoming-item">
              <div class="flex items-center gap-3">
                <div class="avatar w-10 h-10 bg-error/10 text-error">
                  <i class="ri-truck-line"></i>
                </div>
                <div>
                  <p class="font-medium">{{ toUpperCase(v.placa) }}</p>
                  <p class="text-sm text-base-content/50">{{ toUpperCase(v.marca) }} {{ toUpperCase(v.modelo) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium">{{ obtenerDetalleServicio(v) }}</p>
                <p class="text-xs text-error">Vencido</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <h3 class="card-title mb-4 flex items-center gap-2">
            <i class="ri-time-line text-warning"></i> Por vencer (3 días)
          </h3>
          <div v-if="mantenimientosPorVencer.length === 0" class="text-center py-8 text-base-content/50">
            <i class="ri-calendar-check-line ri-3xl block mb-2"></i>
            No hay mantenimientos por vencer en los próximos 3 días
          </div>
          <div v-else class="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
            <div v-for="v in mantenimientosPorVencer" :key="v.id" class="flex items-center justify-between p-3 rounded-field bg-base-200/50 mobile-upcoming-item">
              <div class="flex items-center gap-3">
                <div class="avatar w-10 h-10 bg-warning/10 text-warning">
                  <i class="ri-calendar-line"></i>
                </div>
                <div>
                  <p class="font-medium">{{ toUpperCase(v.placa) }}</p>
                  <p class="text-sm text-base-content/50">{{ toUpperCase(v.marca) }} {{ toUpperCase(v.modelo) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium">{{ obtenerDetalleServicio(v) }}</p>
                <p class="text-xs text-warning">En {{ v.proximo_servicio?.dias_restantes }} días</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useDashboard } from '~/composables/useDashboard'
import { useVehiculos } from '~/composables/useVehiculos'
import { useTextNormalize } from '~/composables/useTextNormalize'
import type { VehiculoConSeguimiento } from '~/types/database'

const { obtenerEstadisticas, obtenerProximasRevisiones } = useDashboard()
const { obtenerConSeguimiento } = useVehiculos()
const { toUpperCase } = useTextNormalize()

const stats = ref({
  total_vehiculos: 0,
  total_choferes: 0,
  total_mantenimientos: 0,
  mantenimientos_mes_actual: 0,
  proximos_vencidos: 0,
  mantenimientos_por_vencer: 0,
  por_kilometraje: 0,
  por_fecha: 0
})

const proximasRevisiones = ref<VehiculoConSeguimiento[]>([])
const cargando = ref(true)
const cambiosMantenimiento = useState<number>('cambios-mantenimiento', () => 0)

const fechaActual = computed(() => new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

const mantenimientosVencidos = computed(() => {
  return proximasRevisiones.value
    .filter(v => v.proximo_servicio?.vencido)
})

const mantenimientosPorVencer = computed(() => {
  return proximasRevisiones.value
    .filter(v =>
      v.tipo_seguimiento === 'fecha' &&
      v.proximo_servicio?.dias_restantes !== null &&
      v.proximo_servicio?.dias_restantes !== undefined &&
      v.proximo_servicio.dias_restantes >= 0 &&
      v.proximo_servicio.dias_restantes <= 3
    )
})

function formatearFecha(fecha: string): string {
  if (!fecha) return '—'
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function obtenerDetalleServicio(v: VehiculoConSeguimiento): string {
  const proximo = v.proximo_servicio
  if (!proximo) return 'Sin programar'
  if (v.tipo_seguimiento === 'fecha') return formatearFecha(proximo.fecha || '')
  return proximo.kilometraje !== null ? `${proximo.kilometraje.toLocaleString()} km` : 'Sin kilometraje'
}

function obtenerClaseEstado(v: VehiculoConSeguimiento): string {
  if (!v.proximo_servicio) return 'badge-ghost'
  if (v.proximo_servicio.vencido) return 'badge-error'
  if (v.tipo_seguimiento === 'fecha' && v.proximo_servicio.dias_restantes !== null && v.proximo_servicio.dias_restantes <= 7) return 'badge-warning'
  if (v.tipo_seguimiento === 'kilometraje' && v.proximo_servicio.km_restantes !== null && v.proximo_servicio.km_restantes <= 500) return 'badge-warning'
  return 'badge-success'
}

function obtenerIconoEstado(v: VehiculoConSeguimiento): string {
  if (!v.proximo_servicio) return 'ri-question-line'
  if (v.proximo_servicio.vencido) return 'ri-close-circle-line'
  if (v.tipo_seguimiento === 'fecha' && v.proximo_servicio.dias_restantes !== null && v.proximo_servicio.dias_restantes <= 7) return 'ri-alarm-warning-line'
  if (v.tipo_seguimiento === 'kilometraje' && v.proximo_servicio.km_restantes !== null && v.proximo_servicio.km_restantes <= 500) return 'ri-alarm-warning-line'
  return 'ri-check-line'
}

function obtenerTextoEstado(v: VehiculoConSeguimiento): string {
  if (!v.proximo_servicio) return 'Sin programar'
  if (v.proximo_servicio.vencido) return 'Vencido'
  if (v.tipo_seguimiento === 'fecha' && v.proximo_servicio.dias_restantes !== null && v.proximo_servicio.dias_restantes <= 7) return 'Próximo'
  if (v.tipo_seguimiento === 'kilometraje' && v.proximo_servicio.km_restantes !== null && v.proximo_servicio.km_restantes <= 500) return 'Próximo'
  return 'Al día'
}

async function cargarDatos() {
  cargando.value = true
  try {
    const [s, p] = await Promise.all([
      obtenerEstadisticas(),
      obtenerProximasRevisiones()
    ])
    stats.value = s
    proximasRevisiones.value = p
  } catch (error) {
    console.error('Error cargando dashboard:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
watch(cambiosMantenimiento, cargarDatos)
</script>