<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="page-heading">
        <h1 class="text-3xl font-bold text-base-content">Choferes</h1>
        <p class="text-base-content/60 mt-1">Gestión de conductores</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="overflow-x-auto">
          <table class="table table-zebra table-pin-rows w-full responsive-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Mantenimientos</th>
                <th>Último Servicio</th>
                <th class="w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in choferes" :key="c.id">
                <td class="mobile-table-wide" data-label="Chofer">
                  <div class="flex items-center gap-3">
                    <div class="avatar w-12 h-12 bg-secondary/10 text-secondary text-xl">
                      {{ toUpperCase(c.nombre[0]) }}{{ toUpperCase(c.apellido[0]) }}
                    </div>
                    <div>
                      <p class="font-medium">{{ toUpperCase(c.nombre) }} {{ toUpperCase(c.apellido) }}</p>
                    </div>
                  </div>
                </td>
                <td data-label="Mantenimientos">
                  <span class="badge badge-secondary">{{ c.total_mantenimientos || 0 }}</span>
                </td>
                <td data-label="Último servicio">
                  <span v-if="c.ultimo_servicio" class="text-base-content/70">{{ formatearFecha(c.ultimo_servicio) }}</span>
                  <span v-else class="text-base-content/40 italic">Sin registros</span>
                </td>
                <td class="mobile-table-actions" data-label="Acciones">
                  <div class="flex items-center gap-1">
                    <button class="btn btn-ghost btn-circle" type="button" :aria-label="`Editar chofer ${c.nombre} ${c.apellido}`" title="Editar" @click="editar(c)">
                      <i class="ri-edit-line ri-lg"></i>
                    </button>
                    <button class="btn btn-ghost btn-circle text-error" type="button" :aria-label="`Eliminar chofer ${c.nombre} ${c.apellido}`" title="Eliminar" @click="eliminar(c)">
                      <i class="ri-delete-bin-line ri-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="choferes.length === 0" class="empty-table-row">
                <td colspan="4" class="text-center py-12 text-base-content/50">
                  <i class="ri-user-line ri-3xl block mb-2"></i>
                  No hay choferes registrados
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ModalEdicionRegistro
      v-if="edicion"
      tipo="chofer"
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
import { useChoferes } from '~/composables/useChoferes'
import { useMantenimientos } from '~/composables/useMantenimientos'
import { useTextNormalize } from '~/composables/useTextNormalize'
import type { Chofer } from '~/types/database'

const { obtenerTodos, eliminar: eliminarChofer } = useChoferes()
const { obtenerTodos: obtenerMantenimientos } = useMantenimientos()
const { toUpperCase, capitalize } = useTextNormalize()

interface ChoferConStats extends Chofer {
  total_mantenimientos: number
  ultimo_servicio: string | null
}

const choferes = ref<ChoferConStats[]>([])
const edicion = ref<ChoferConStats | null>(null)
const cargando = ref(true)

function formatearFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function cargar() {
  cargando.value = true
  try {
    const [choferesData, mantenimientos] = await Promise.all([
      obtenerTodos(),
      obtenerMantenimientos()
    ])

    choferes.value = choferesData.map(c => {
      const mantenimientosChofer = mantenimientos.filter(m => m.chofer_id === c.id)
      const ultimo = mantenimientosChofer.length > 0 ? mantenimientosChofer[0].fecha_servicio : null
      return {
        ...c,
        total_mantenimientos: mantenimientosChofer.length,
        ultimo_servicio: ultimo
      }
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    cargando.value = false
  }
}

function editar(c: ChoferConStats) {
  edicion.value = c
}

async function guardarEdicion() {
  edicion.value = null
  await cargar()
}

async function eliminar(c: ChoferConStats) {
  if (!confirm(`¿Eliminar chofer ${c.nombre} ${c.apellido}?`)) return
  try {
    await eliminarChofer(c.id)
    choferes.value = choferes.value.filter(x => x.id !== c.id)
  } catch (error) {
    console.error('Error eliminando:', error)
    alert(error instanceof Error ? `No se pudo eliminar el chofer: ${error.message}` : 'No se pudo eliminar el chofer.')
  }
}

onMounted(cargar)
</script>