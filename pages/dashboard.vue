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
      <div class="stat card-body" v-for="i in 4" :key="i">
        <div class="skeleton h-4 w-1/4"></div>
        <div class="skeleton h-8 w-1/2 mt-2"></div>
        <div class="skeleton h-3 w-3/4 mt-2"></div>
      </div>
    </div>

    <div v-else class="grid dashboard-stat-grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="stat card-body">
        <div class="flex items-center justify-between">
          <div>
            <p class="stat-title">Total Vehículos</p>
            <p class="stat-value">{{ stats.total_vehiculos }}</p>
          </div>
          <div class="stat-figure bg-primary/10 text-primary">
            <i class="ri-truck-line ri-2xl"></i>
          </div>
        </div>
        <p class="stat-desc mt-2">{{ stats.por_kilometraje }} por km · {{ stats.por_fecha }} por fecha</p>
      </div>

      <div class="stat card-body">
        <div class="flex items-center justify-between">
          <div>
            <p class="stat-title">Total Choferes</p>
            <p class="stat-value">{{ stats.total_choferes }}</p>
          </div>
          <div class="stat-figure bg-secondary/10 text-secondary">
            <i class="ri-user-line ri-2xl"></i>
          </div>
        </div>
      </div>

      <div class="stat card-body">
        <div class="flex items-center justify-between">
          <div>
            <p class="stat-title">Mantenimientos Totales</p>
            <p class="stat-value">{{ stats.total_mantenimientos }}</p>
          </div>
          <div class="stat-figure bg-accent/10 text-accent">
            <i class="ri-tools-line ri-2xl"></i>
          </div>
        </div>
        <p class="stat-desc mt-2">{{ stats.mantenimientos_mes_actual }} este mes</p>
      </div>

      <div class="stat card-body">
        <div class="flex items-center justify-between">
          <div>
            <p class="stat-title">Alertas</p>
            <p class="stat-value text-error">{{ stats.proximos_vencidos }}</p>
          </div>
          <div class="stat-figure bg-error/10 text-error">
            <i class="ri-alarm-warning-line ri-2xl"></i>
          </div>
        </div>
        <p class="stat-desc mt-2">Incluye cambios por fecha o kilometraje vencidos</p>
        <p class="stat-desc">{{ stats.mantenimientos_3_4_dias }} próximos en 3–4 días</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="overflow-x-auto">
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

    <div class="grid gap-4 lg:grid-cols-2">
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
            <i class="ri-time-line text-warning"></i> Mantenimientos en 3–4 días
          </h3>
          <div v-if="proximos3a4Dias.length === 0" class="text-center py-8 text-base-content/50">
            <i class="ri-calendar-check-line ri-3xl block mb-2"></i>
            Sin mantenimientos por fecha dentro de 3–4 días
          </div>
          <div v-else class="space-y-3 max-h-64 overflow-y-auto">
            <div v-for="m in proximos3a4Dias" :key="m.id" class="flex items-center justify-between p-3 rounded-field bg-base-200/50 mobile-upcoming-item">
              <div class="flex items-center gap-3">
                <div class="avatar w-10 h-10 bg-secondary/10 text-secondary">
                  <i class="ri-calendar-line"></i>
                </div>
                <div>
                  <p class="font-medium">{{ m.placa }}</p>
                  <p class="text-sm text-base-content/50">{{ m.marca }} {{ m.modelo }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium">{{ formatearFecha(m.proximo_servicio?.fecha || '') }}</p>
                <p class="text-xs text-base-content/50">En {{ m.proximo_servicio?.dias_restantes }} días</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
  mantenimientos_3_4_dias: 0,
  por_kilometraje: 0,
  por_fecha: 0
})

const proximasRevisiones = ref<VehiculoConSeguimiento[]>([])
const cargando = ref(true)

const fechaActual = computed(() => new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

const proximos3a4Dias = computed(() => {
  return proximasRevisiones.value
    .filter(v =>
      v.tipo_seguimiento === 'fecha' &&
      v.proximo_servicio?.dias_restantes !== null &&
      v.proximo_servicio?.dias_restantes !== undefined &&
      v.proximo_servicio.dias_restantes >= 3 &&
      v.proximo_servicio.dias_restantes <= 4
    )
    .slice(0, 5)
})

function formatearFecha(fecha: string): string {
  if (!fecha) return '—'
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
</script>