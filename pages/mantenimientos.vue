<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="page-heading">
        <h1 class="text-3xl font-bold text-base-content">Mantenimientos</h1>
        <p class="text-base-content/60 mt-1">Historial completo de servicios de aceite</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="overflow-x-auto">
          <table class="table table-zebra table-pin-rows w-full responsive-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Vehículo</th>
                <th>Chofer</th>
                <th v-if="hayServiciosPorKilometraje">Kilometraje</th>
                <th>Tipo Aceite</th>
                <th>Filtros</th>
                <th>Próximo</th>
                <th class="w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in mantenimientos" :key="m.id">
                <td class="font-medium" data-label="Fecha">{{ formatearFecha(m.fecha_servicio) }}</td>
                <td class="mobile-table-wide" data-label="Vehículo">
                  <div class="flex items-center gap-2">
                    <div class="avatar w-8 h-8 bg-primary/10 text-primary"><i class="ri-truck-line"></i></div>
                    <div>
                      <p>{{ toUpperCase(m.vehiculo?.placa) }}</p>
                      <p class="text-xs text-base-content/50">{{ toUpperCase(m.vehiculo?.marca) }} {{ toUpperCase(m.vehiculo?.modelo) }}</p>
                    </div>
                  </div>
                </td>
                <td data-label="Chofer">
                  <div v-if="m.chofer" class="flex items-center gap-2">
                    <div class="avatar w-8 h-8 bg-secondary/10 text-secondary">{{ toUpperCase(m.chofer.nombre[0]) }}{{ toUpperCase(m.chofer.apellido[0]) }}</div>
                    <span>{{ toUpperCase(m.chofer.nombre) }} {{ toUpperCase(m.chofer.apellido) }}</span>
                  </div>
                  <span v-else class="text-base-content/40 italic">—</span>
                </td>
                <td v-if="hayServiciosPorKilometraje" data-label="Kilometraje">
                  <span v-if="m.proximo_kilometraje !== null && m.kilometraje !== null">
                    {{ m.kilometraje.toLocaleString() }} km
                  </span>
                </td>
                <td data-label="Aceite">{{ toUpperCase(m.tipo_aceite) || '—' }}</td>
                <td data-label="Filtros y servicios">
                  <div class="flex items-center gap-1">
                    <span v-if="m.filtro_combustible" class="badge badge-success badge-sm"><i class="ri-check-line"></i> Comb.</span>
                    <span v-if="m.filtro_aire || m.filtro_aire_accion" class="badge badge-info badge-sm">
                      <i class="ri-check-line"></i>
                      Aire {{ m.filtro_aire_accion === 'soplado' ? 'soplado' : 'cambiado' }}
                    </span>
                    <span v-if="m.engrase" class="badge badge-warning badge-sm"><i class="ri-check-line"></i> Engrase</span>
                    <span v-if="!m.filtro_combustible && !m.filtro_aire && !m.filtro_aire_accion && !m.engrase" class="text-base-content/40 text-xs">—</span>
                  </div>
                </td>
                <td data-label="Próximo">
                  <div v-if="m.proxima_revision || m.proximo_kilometraje">
                    <p v-if="m.proxima_revision" class="font-medium">{{ formatearFecha(m.proxima_revision) }}</p>
                    <p v-else class="font-medium">{{ m.proximo_kilometraje?.toLocaleString() }} km</p>
                    <p v-if="m.proximo_kilometraje !== null && m.kilometraje !== null" class="text-xs text-base-content/50">
                      {{ (m.proximo_kilometraje - m.kilometraje).toLocaleString() }} km restantes
                    </p>
                  </div>
                  <span v-else class="text-base-content/40 italic">Sin programar</span>
                </td>
                <td class="mobile-table-actions" data-label="Acciones">
                  <div class="flex items-center gap-1">
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
                </td>
              </tr>
              <tr v-if="mantenimientos.length === 0" class="empty-table-row">
                <td :colspan="hayServiciosPorKilometraje ? 8 : 7" class="text-center py-12 text-base-content/50">
                  <i class="ri-inbox-line ri-3xl block mb-2"></i>
                  No hay mantenimientos registrados
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
import { ref, onMounted, computed } from 'vue'
import { useMantenimientos } from '~/composables/useMantenimientos'
import { useVehiculos } from '~/composables/useVehiculos'
import { useChoferes } from '~/composables/useChoferes'
import { useTextNormalize } from '~/composables/useTextNormalize'
import type { Chofer, MantenimientoConRelaciones, Vehiculo } from '~/types/database'

const { obtenerTodos, eliminar: eliminarMantenimiento } = useMantenimientos()
const { obtenerTodos: obtenerVehiculos } = useVehiculos()
const { obtenerTodos: obtenerChoferes } = useChoferes()
const { toUpperCase } = useTextNormalize()

const mantenimientos = ref<MantenimientoConRelaciones[]>([])
const hayServiciosPorKilometraje = computed(() =>
  mantenimientos.value.some(m => m.proximo_kilometraje !== null)
)
const vehiculos = ref<Vehiculo[]>([])
const choferes = ref<Chofer[]>([])
const edicion = ref<MantenimientoConRelaciones | null>(null)
const cargando = ref(true)

function formatearFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function cargar() {
  cargando.value = true
  try {
    mantenimientos.value = await obtenerTodos()
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
    mantenimientos.value = mantenimientos.value.filter(x => x.id !== m.id)
  } catch (error) {
    console.error('Error eliminando:', error)
    alert(error instanceof Error ? `No se pudo eliminar el mantenimiento: ${error.message}` : 'No se pudo eliminar el mantenimiento.')
  }
}

onMounted(cargar)
</script>