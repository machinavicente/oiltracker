<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="page-heading">
        <h1 class="text-3xl font-bold text-base-content">Vehículos</h1>
        <p class="text-base-content/60 mt-1">Gestión de flota y tipos de seguimiento</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="overflow-x-auto">
          <table class="table table-zebra table-pin-rows w-full responsive-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Marca / Modelo</th>
                <th>Tipo Seguimiento</th>
                <th>Próximo Servicio</th>
                <th>Estado</th>
                <th class="w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in vehiculos" :key="v.id">
                <td class="font-medium" data-label="Placa">{{ toUpperCase(v.placa) }}</td>
                <td data-label="Marca / modelo">{{ toUpperCase(v.marca) || '—' }} {{ toUpperCase(v.modelo) || '' }}</td>
                <td data-label="Seguimiento">
                  <span class="badge" :class="v.tipo_seguimiento === 'kilometraje' ? 'badge-primary' : 'badge-secondary'">
                    <i :class="v.tipo_seguimiento === 'kilometraje' ? 'ri-gauge-line' : 'ri-calendar-line'"></i>
                    {{ toUpperCase(v.tipo_seguimiento === 'kilometraje' ? 'Kilometraje' : 'Fecha') }}
                  </span>
                </td>
                <td data-label="Próximo servicio">
                  <div v-if="v.proximo_servicio">
                    <p v-if="v.tipo_seguimiento === 'fecha' && v.proximo_servicio.fecha" class="font-medium">{{ formatearFecha(v.proximo_servicio.fecha) }}</p>
                    <p v-else-if="v.tipo_seguimiento === 'kilometraje' && v.proximo_servicio.kilometraje" class="font-medium">{{ v.proximo_servicio.kilometraje.toLocaleString() }} km</p>
                    <p class="text-xs" :class="v.proximo_servicio.vencido ? 'text-error' : 'text-base-content/50'">
                      {{ v.proximo_servicio.vencido ? 'VENCIDO' :
                         v.tipo_seguimiento === 'fecha' ? `${v.proximo_servicio.dias_restantes} días` :
                         `${v.proximo_servicio.km_restantes?.toLocaleString()} km` }}
                    </p>
                  </div>
                  <span v-else class="text-base-content/40 italic">Sin programar</span>
                </td>
                <td data-label="Estado">
                  <span class="badge" :class="obtenerClaseEstado(v)">
                    {{ obtenerTextoEstado(v) }}
                  </span>
                </td>
                <td class="mobile-table-actions" data-label="Acciones">
                  <div class="flex items-center gap-1">
                    <button class="btn btn-ghost btn-circle" type="button" :aria-label="`Editar vehículo ${v.placa}`" title="Editar" @click="editar(v)">
                      <i class="ri-edit-line ri-lg"></i>
                    </button>
                    <button class="btn btn-ghost btn-circle text-error" type="button" :aria-label="`Eliminar vehículo ${v.placa}`" title="Eliminar" @click="eliminar(v)">
                      <i class="ri-delete-bin-line ri-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="vehiculos.length === 0" class="empty-table-row">
                <td colspan="6" class="text-center py-12 text-base-content/50">
                  <i class="ri-truck-line ri-3xl block mb-2"></i>
                  No hay vehículos registrados
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ModalEdicionRegistro
      v-if="edicion"
      tipo="vehiculo"
      :registro="edicion"
      :vehiculos="[]"
      :choferes="[]"
      @cerrar="edicion = null"
      @guardado="guardarEdicion"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useVehiculos } from '~/composables/useVehiculos'
import { useTextNormalize } from '~/composables/useTextNormalize'
import type { VehiculoConSeguimiento } from '~/types/database'

const { obtenerConSeguimiento, eliminar: eliminarVehiculo } = useVehiculos()
const { toUpperCase } = useTextNormalize()

const vehiculos = ref<VehiculoConSeguimiento[]>([])
const edicion = ref<VehiculoConSeguimiento | null>(null)
const cargando = ref(true)

function formatearFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function obtenerClaseEstado(v: VehiculoConSeguimiento): string {
  if (!v.proximo_servicio) return 'badge-ghost'
  if (v.proximo_servicio.vencido) return 'badge-error'
  if (v.tipo_seguimiento === 'fecha' && v.proximo_servicio.dias_restantes !== null && v.proximo_servicio.dias_restantes <= 7) return 'badge-warning'
  if (v.tipo_seguimiento === 'kilometraje' && v.proximo_servicio.km_restantes !== null && v.proximo_servicio.km_restantes <= 500) return 'badge-warning'
  return 'badge-success'
}

function obtenerTextoEstado(v: VehiculoConSeguimiento): string {
  if (!v.proximo_servicio) return 'Sin programar'
  if (v.proximo_servicio.vencido) return 'Vencido'
  if (v.tipo_seguimiento === 'fecha' && v.proximo_servicio.dias_restantes !== null && v.proximo_servicio.dias_restantes <= 7) return 'Próximo'
  if (v.tipo_seguimiento === 'kilometraje' && v.proximo_servicio.km_restantes !== null && v.proximo_servicio.km_restantes <= 500) return 'Próximo'
  return 'Al día'
}

async function cargar() {
  cargando.value = true
  try {
    vehiculos.value = await obtenerConSeguimiento()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    cargando.value = false
  }
}

function editar(v: VehiculoConSeguimiento) {
  edicion.value = v
}

async function guardarEdicion() {
  edicion.value = null
  await cargar()
}

async function eliminar(v: VehiculoConSeguimiento) {
  if (!confirm(`¿Eliminar vehículo ${v.placa}?`)) return
  try {
    await eliminarVehiculo(v.id)
    vehiculos.value = vehiculos.value.filter(x => x.id !== v.id)
  } catch (error) {
    console.error('Error eliminando:', error)
    alert(error instanceof Error ? `No se pudo eliminar el vehículo: ${error.message}` : 'No se pudo eliminar el vehículo.')
  }
}

onMounted(cargar)
</script>