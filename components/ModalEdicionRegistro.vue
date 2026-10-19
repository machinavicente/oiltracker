<template>
  <div class="modal" role="presentation" @click.self="cerrar">
    <section class="modal-box max-w-2xl modal-form-dialog" role="dialog" aria-modal="true" :aria-labelledby="`editar-${tipo}-titulo`">
      <header class="modal-form-header">
        <div>
          <h2 :id="`editar-${tipo}-titulo`" class="text-xl font-bold">Editar {{ etiquetaTipo }}</h2>
          <p class="text-sm text-base-content/60 mt-1">Actualiza los datos y guarda los cambios.</p>
        </div>
        <button class="btn btn-ghost btn-circle" type="button" aria-label="Cerrar" @click="cerrar">
          <i class="ri-close-line ri-lg"></i>
        </button>
      </header>

      <form class="modal-form" @submit.prevent="guardar">
        <template v-if="tipo === 'vehiculo'">
          <div class="form-section">
            <h3 class="form-section-title">Datos del vehículo</h3>
            <div class="form-field">
              <label class="label" for="editar-placa">Placa</label>
              <input id="editar-placa" v-model.trim="formulario.placa" class="input" required maxlength="10" />
            </div>
            <div class="grid form-grid sm:grid-cols-2">
              <div class="form-field">
                <label class="label" for="editar-marca">Marca</label>
                <input id="editar-marca" v-model.trim="formulario.marca" class="input" />
              </div>
              <div class="form-field">
                <label class="label" for="editar-modelo">Modelo</label>
                <input id="editar-modelo" v-model.trim="formulario.modelo" class="input" />
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="tipo === 'chofer'">
          <div class="form-section">
            <h3 class="form-section-title">Datos del chofer</h3>
            <div class="grid form-grid sm:grid-cols-2">
              <div class="form-field">
                <label class="label" for="editar-nombre">Nombre</label>
                <input id="editar-nombre" v-model.trim="formulario.nombre" class="input" required />
              </div>
              <div class="form-field">
                <label class="label" for="editar-apellido">Apellido</label>
                <input id="editar-apellido" v-model.trim="formulario.apellido" class="input" required />
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="form-section form-section-wide">
            <h3 class="form-section-title">Datos del servicio</h3>
            <div class="grid form-grid sm:grid-cols-2">
              <div class="form-field">
                <label class="label" for="editar-vehiculo">Vehículo</label>
                <select id="editar-vehiculo" v-model.number="formulario.vehiculo_id" class="input select" required>
                  <option v-for="vehiculo in vehiculos" :key="vehiculo.id" :value="vehiculo.id">
                    {{ vehiculo.placa }} — {{ vehiculo.marca || 'Sin marca' }} {{ vehiculo.modelo || '' }}
                  </option>
                </select>
              </div>
              <div class="form-field">
                <label class="label" for="editar-chofer">Chofer</label>
                <select id="editar-chofer" v-model="formulario.chofer_id" class="input select">
                  <option :value="null">Sin chofer</option>
                  <option v-for="chofer in choferes" :key="chofer.id" :value="chofer.id">
                    {{ chofer.nombre }} {{ chofer.apellido }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid form-grid sm:grid-cols-2">
              <div class="form-field">
                <label class="label" for="editar-fecha-servicio">Fecha del servicio</label>
                <input id="editar-fecha-servicio" v-model="formulario.fecha_servicio" class="input" type="date" required />
              </div>
              <div v-if="formulario.seguimiento === 'kilometraje'" class="form-field">
                <label class="label" for="editar-kilometraje">Kilometraje actual</label>
                <input id="editar-kilometraje" v-model.number="formulario.kilometraje" class="input" type="number" min="0" required />
              </div>
            </div>

            <div class="form-field">
              <label class="label" for="editar-seguimiento">Tipo de próximo servicio</label>
              <select id="editar-seguimiento" v-model="formulario.seguimiento" class="input select">
                <option value="fecha">Por fecha</option>
                <option value="kilometraje">Por kilometraje</option>
              </select>
            </div>

            <div class="form-subsection">
              <div class="form-subsection-heading">
                <div class="form-subsection-icon"><i class="ri-filter-3-line"></i></div>
                <div>
                  <h4>Aceite y filtros</h4>
                  <p>Registra los insumos y servicios realizados.</p>
                </div>
              </div>
              <div class="maintenance-grid">
                <div class="form-field">
                  <label class="label" for="editar-tipo-aceite">Tipo de aceite</label>
                  <div class="input-with-icon">
                    <i class="ri-drop-line" aria-hidden="true"></i>
                    <input id="editar-tipo-aceite" v-model.trim="formulario.tipo_aceite" class="input" placeholder="Ej: 15W-40" />
                  </div>
                </div>
                <div class="form-field">
                  <label class="label" for="editar-filtro">N.º de filtro de aceite</label>
                  <div class="input-with-icon">
                    <i class="ri-settings-3-line" aria-hidden="true"></i>
                    <input id="editar-filtro" v-model.trim="formulario.numero_filtro" class="input" placeholder="Ej: PH2808" />
                  </div>
                </div>
                <label class="form-check-card maintenance-check-card">
                  <span class="form-check-icon"><i class="ri-gas-station-line"></i></span>
                  <span class="form-check-copy">
                    <span>Filtro de combustible</span>
                    <small>Marca si fue cambiado</small>
                  </span>
                  <input v-model="formulario.filtro_combustible" type="checkbox" class="checkbox checkbox-primary" aria-label="Se reemplazó el filtro de combustible" />
                </label>
                <div class="form-field air-filter-field">
                  <label class="label" for="editar-filtro-aire-accion">Filtro de aire</label>
                  <div class="select-with-icon">
                    <i class="ri-windy-line" aria-hidden="true"></i>
                    <select id="editar-filtro-aire-accion" v-model="formulario.filtro_aire_accion" class="select filter-action-select">
                      <option :value="null">No realizado</option>
                      <option value="cambiado">Cambiado</option>
                      <option value="soplado">Soplado</option>
                    </select>
                  </div>
                  <small class="filter-action-hint">Selecciona la acción realizada en el filtro.</small>
                </div>
              </div>
            </div>

            <div class="grid form-grid sm:grid-cols-2">
              <div class="form-field">
                <label class="label" for="editar-transmision">Transmisión / caja</label>
                <input id="editar-transmision" v-model.trim="formulario.transmision_caja" class="input" />
              </div>
              <label class="form-check-card maintenance-check-card">
                <span class="form-check-icon"><i class="ri-oil-line"></i></span>
                <span class="form-check-copy">
                  <span>Engrase</span>
                  <small>Servicio realizado</small>
                </span>
                <input v-model="formulario.engrase" type="checkbox" class="checkbox checkbox-primary" aria-label="Se realizó el engrase" />
              </label>
            </div>

            <div v-if="formulario.seguimiento === 'fecha'" class="form-field">
              <label class="label" for="editar-proxima-revision">Próxima revisión</label>
              <input id="editar-proxima-revision" v-model="formulario.proxima_revision" class="input" type="date" required />
            </div>
            <div v-else class="form-field">
              <label class="label" for="editar-proximo-kilometraje">Próximo kilometraje</label>
              <input
                id="editar-proximo-kilometraje"
                v-model.number="formulario.proximo_kilometraje"
                class="input"
                type="number"
                :min="(formulario.kilometraje || 0) + 1"
                step="1"
                required
              />
            </div>

          </div>
        </template>

        <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

        <footer class="modal-form-footer">
          <button type="button" class="btn btn-ghost" :disabled="guardando" @click="cerrar">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="guardando">
            <i v-if="guardando" class="loading loading-spinner"></i>
            {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </footer>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { Chofer, DatosEdicion, MantenimientoConRelaciones, Vehiculo } from '~/types/database'
import { useVehiculos } from '~/composables/useVehiculos'
import { useChoferes } from '~/composables/useChoferes'
import { useMantenimientos } from '~/composables/useMantenimientos'

const props = defineProps<{
  tipo: DatosEdicion['tipo']
  registro: Vehiculo | Chofer | MantenimientoConRelaciones
  vehiculos: Vehiculo[]
  choferes: Chofer[]
}>()

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const { actualizar: actualizarVehiculo } = useVehiculos()
const { actualizar: actualizarChofer } = useChoferes()
const { actualizar: actualizarMantenimiento } = useMantenimientos()
const guardando = ref(false)
const error = ref('')

const formulario = reactive({
  placa: '',
  marca: '',
  modelo: '',
  nombre: '',
  apellido: '',
  vehiculo_id: 0,
  chofer_id: null as number | null,
  fecha_servicio: '',
  seguimiento: 'fecha' as 'fecha' | 'kilometraje',
  kilometraje: null as number | null,
  tipo_aceite: '',
  numero_filtro: '',
  filtro_combustible: false,
  filtro_aire_accion: null as 'cambiado' | 'soplado' | null,
  transmision_caja: '',
  engrase: false,
  proxima_revision: null as string | null,
  proximo_kilometraje: null as number | null,
  observaciones: ''
})

const etiquetaTipo = computed(() => ({
  vehiculo: 'vehículo',
  chofer: 'chofer',
  mantenimiento: 'mantenimiento'
}[props.tipo]))

if (props.tipo === 'vehiculo' && 'placa' in props.registro) {
  formulario.placa = props.registro.placa
  formulario.marca = props.registro.marca || ''
  formulario.modelo = props.registro.modelo || ''
} else if (props.tipo === 'chofer' && 'apellido' in props.registro) {
  formulario.nombre = props.registro.nombre
  formulario.apellido = props.registro.apellido
} else if (props.tipo === 'mantenimiento' && 'fecha_servicio' in props.registro) {
  formulario.vehiculo_id = props.registro.vehiculo_id
  formulario.chofer_id = props.registro.chofer_id
  formulario.fecha_servicio = props.registro.fecha_servicio
  formulario.kilometraje = props.registro.kilometraje
  formulario.tipo_aceite = props.registro.tipo_aceite || ''
  formulario.numero_filtro = props.registro.numero_filtro || ''
  formulario.filtro_combustible = props.registro.filtro_combustible
  formulario.filtro_aire_accion = props.registro.filtro_aire_accion
    ?? (props.registro.filtro_aire ? 'cambiado' : null)
  formulario.transmision_caja = props.registro.transmision_caja || ''
  formulario.engrase = props.registro.engrase
  formulario.proxima_revision = props.registro.proxima_revision
  formulario.proximo_kilometraje = props.registro.proximo_kilometraje
  formulario.seguimiento = props.registro.proximo_kilometraje !== null ? 'kilometraje' : 'fecha'
  formulario.observaciones = props.registro.observaciones || ''
}

function cerrar() {
  if (!guardando.value) emit('cerrar')
}

async function guardar() {
  error.value = ''
  let datos: DatosEdicion
  const id = props.registro.id

  if (props.tipo === 'vehiculo') {
    datos = {
      tipo: 'vehiculo',
      datos: {
        placa: formulario.placa.toUpperCase(),
        marca: formulario.marca || null,
        modelo: formulario.modelo || null
      }
    }
  } else if (props.tipo === 'chofer') {
    datos = {
      tipo: 'chofer',
      datos: {
        nombre: formulario.nombre,
        apellido: formulario.apellido
      }
    }
  } else {
    datos = {
      tipo: 'mantenimiento',
      datos: {
        vehiculo_id: formulario.vehiculo_id,
        chofer_id: formulario.chofer_id,
        fecha_servicio: formulario.fecha_servicio,
        kilometraje: formulario.kilometraje,
        tipo_aceite: formulario.tipo_aceite || null,
        numero_filtro: formulario.numero_filtro || null,
        filtro_combustible: formulario.filtro_combustible,
        filtro_aire: formulario.filtro_aire_accion !== null,
        filtro_aire_accion: formulario.filtro_aire_accion,
        transmision_caja: formulario.transmision_caja || null,
        engrase: formulario.engrase,
        proxima_revision: formulario.seguimiento === 'fecha' ? formulario.proxima_revision : null,
        proximo_kilometraje: formulario.seguimiento === 'kilometraje' ? formulario.proximo_kilometraje : null,
        observaciones: formulario.observaciones || null
      }
    }
  }

  guardando.value = true
  try {
    if (datos.tipo === 'vehiculo') {
      await actualizarVehiculo(id, datos.datos)
    } else if (datos.tipo === 'chofer') {
      await actualizarChofer(id, datos.datos)
    } else {
      await actualizarMantenimiento(id, datos.datos)
    }
    emit('guardado')
  } catch (cause) {
    error.value = cause instanceof Error
      ? cause.message
      : cause && typeof cause === 'object' && 'message' in cause && typeof cause.message === 'string'
        ? cause.message
        : 'No se pudieron guardar los cambios.'
  } finally {
    guardando.value = false
  }
}
</script>
