<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="page-heading">
        <h1 class="text-3xl font-bold text-base-content">Choferes</h1>
        <p class="text-base-content/60 mt-1">Gestión de conductores</p>
      </div>
    </div>

    <div v-if="choferes.length > 0" class="records-grid">
      <article v-for="c in choferes" :key="c.id" class="card record-card">
        <header class="record-card-header">
          <div class="record-card-identity">
            <div class="avatar w-12 h-12 bg-secondary/10 text-secondary text-xl">
              {{ toUpperCase(c.nombre[0]) }}{{ toUpperCase(c.apellido[0]) }}
            </div>
            <div class="min-w-0">
              <h2 class="record-card-title">{{ toUpperCase(c.nombre) }} {{ toUpperCase(c.apellido) }}</h2>
              <p class="record-card-subtitle">Chofer</p>
            </div>
          </div>
          <div class="record-card-actions">
            <button class="btn btn-ghost btn-circle" type="button" :aria-label="`Editar chofer ${c.nombre} ${c.apellido}`" title="Editar" @click="editar(c)">
              <i class="ri-edit-line ri-lg"></i>
            </button>
            <button class="btn btn-ghost btn-circle text-error" type="button" :aria-label="`Eliminar chofer ${c.nombre} ${c.apellido}`" title="Eliminar" @click="eliminar(c)">
              <i class="ri-delete-bin-line ri-lg"></i>
            </button>
          </div>
        </header>

        <dl class="record-card-details">
          <div class="record-card-detail">
            <dt>Mantenimientos</dt>
            <dd><span class="badge badge-secondary">{{ c.total_mantenimientos }}</span></dd>
          </div>
          <div class="record-card-detail">
            <dt>Último servicio</dt>
            <dd v-if="c.ultimo_servicio">{{ formatearFecha(c.ultimo_servicio) }}</dd>
            <dd v-else class="text-base-content/40">Sin registros</dd>
          </div>
        </dl>
      </article>
    </div>
    <div v-else-if="!cargando" class="card record-empty">
      <i class="ri-user-line ri-3xl"></i>
      <p>No hay choferes registrados</p>
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
const { toUpperCase } = useTextNormalize()

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