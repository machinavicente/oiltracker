<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="page-heading">
        <h1 class="text-3xl font-bold text-base-content">Vehículos</h1>
        <p class="text-base-content/60 mt-1">Gestión de flota y tipos de seguimiento</p>
      </div>
    </div>

    <div v-if="vehiculos.length > 0" class="records-grid">
      <article v-for="v in vehiculos" :key="v.id" class="card record-card">
        <header class="record-card-header">
          <div class="record-card-identity">
            <div class="avatar w-11 h-11 bg-primary/10 text-primary"><i class="ri-truck-line ri-lg"></i></div>
            <div class="min-w-0">
              <h2 class="record-card-title">{{ toUpperCase(v.placa) }}</h2>
              <p class="record-card-subtitle">{{ toUpperCase(v.marca) || 'Marca no especificada' }} {{ toUpperCase(v.modelo) || '' }}</p>
            </div>
          </div>
          <div class="record-card-actions">
            <button class="btn btn-ghost btn-circle" type="button" :aria-label="`Editar vehículo ${v.placa}`" title="Editar" @click="editar(v)">
              <i class="ri-edit-line ri-lg"></i>
            </button>
            <button class="btn btn-ghost btn-circle text-error" type="button" :aria-label="`Eliminar vehículo ${v.placa}`" title="Eliminar" @click="eliminar(v)">
              <i class="ri-delete-bin-line ri-lg"></i>
            </button>
          </div>
        </header>

        <div class="record-card-footer">
          <span class="badge" :class="v.tipo_seguimiento === 'kilometraje' ? 'badge-primary' : 'badge-secondary'">
            <i :class="v.tipo_seguimiento === 'kilometraje' ? 'ri-gauge-line' : 'ri-calendar-line'"></i>
            {{ toUpperCase(v.tipo_seguimiento === 'kilometraje' ? 'Kilometraje' : 'Fecha') }}
          </span>
          <span class="badge" :class="obtenerClaseEstado(v)">
            <i :class="v.proximo_servicio?.vencido ? 'ri-close-circle-line' : v.proximo_servicio ? 'ri-checkbox-circle-line' : 'ri-question-line'"></i>
            {{ obtenerTextoEstado(v) }}
          </span>
        </div>

        <dl class="record-card-details">
          <div class="record-card-detail">
            <dt>Próximo servicio</dt>
            <dd v-if="v.proximo_servicio?.fecha && v.tipo_seguimiento === 'fecha'">
              {{ formatearFecha(v.proximo_servicio.fecha) }}
            </dd>
            <dd v-else-if="v.proximo_servicio?.kilometraje !== null && v.proximo_servicio?.kilometraje !== undefined">
              {{ v.proximo_servicio.kilometraje.toLocaleString() }} km
            </dd>
            <dd v-else class="text-base-content/40">Sin programar</dd>
            <p v-if="v.proximo_servicio && v.proximo_servicio.dias_restantes !== null" class="record-card-hint" :class="v.proximo_servicio.vencido ? 'text-error' : ''">
              {{ v.proximo_servicio.vencido ? 'Vencido' : `${v.proximo_servicio.dias_restantes} días restantes` }}
            </p>
            <p v-else-if="v.proximo_servicio?.km_restantes !== null && v.proximo_servicio?.km_restantes !== undefined" class="record-card-hint" :class="v.proximo_servicio.vencido ? 'text-error' : ''">
              {{ v.proximo_servicio.vencido ? 'Vencido' : `${v.proximo_servicio.km_restantes.toLocaleString()} km restantes` }}
            </p>
          </div>
        </dl>
      </article>
    </div>
    <div v-else-if="!cargando" class="card record-empty">
      <i class="ri-truck-line ri-3xl"></i>
      <p>No hay vehículos registrados</p>
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