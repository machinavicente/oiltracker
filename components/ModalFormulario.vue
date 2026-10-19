<template>
  <div class="modal" @click.self="$emit('cerrar')">
    <div class="modal-box max-w-4xl modal-form-dialog">
      <div class="modal-form-header">
        <div>
          <h3 class="card-title text-2xl flex items-center gap-2">
            <i class="ri-add-circle-line ri-xl text-primary"></i>
            Nuevo Registro Completo
          </h3>
          <p class="text-sm text-base-content/60 mt-1">Ingresa los datos paso a paso para registrar el servicio.</p>
        </div>
        <button class="btn btn-ghost btn-circle" type="button" aria-label="Cerrar formulario" @click="$emit('cerrar')">
          <i class="ri-close-line ri-xl"></i>
        </button>
      </div>

      <form @submit.prevent="guardar" class="modal-form">
        <div class="tabs tabs-bordered" role="tablist">
          <button type="button" class="tab tab-bordered tab-bordered-active" @click="pasoActual = 1" :class="{ 'tab-bordered-active': pasoActual === 1 }">
            <i class="ri-truck-line"></i> Vehículo
          </button>
          <button type="button" class="tab tab-bordered" @click="pasoActual = 2" :class="{ 'tab-bordered-active': pasoActual === 2 }">
            <i class="ri-user-line"></i> Chofer
          </button>
          <button type="button" class="tab tab-bordered" @click="pasoActual = 3" :class="{ 'tab-bordered-active': pasoActual === 3 }">
            <i class="ri-tools-line"></i> Mantenimiento
          </button>
        </div>

        <section v-show="pasoActual === 1" class="form-section animate-fade-in" aria-labelledby="vehiculo-section-title">
          <h4 id="vehiculo-section-title" class="form-section-title">
            <i class="ri-truck-line text-primary"></i> Datos del Vehículo
          </h4>
          <div class="grid form-grid sm:grid-cols-2">
            <div class="form-field">
              <label class="label">Placa <span class="text-error">*</span></label>
              <input v-model="placaDisplay" type="text" class="input input-primary" placeholder="ABC-123" required maxlength="10" />
            </div>
            <div class="form-field">
              <label class="label">Marca</label>
              <input v-model="marcaDisplay" type="text" class="input" placeholder="Ej: Chevrolet, Ford, Volvo" />
            </div>
            <div class="form-field">
              <label class="label">Modelo</label>
              <input v-model="modeloDisplay" type="text" class="input" placeholder="Ej: NPR, F-150, FH16" />
            </div>
          </div>
        </section>

        <section v-show="pasoActual === 2" class="form-section animate-fade-in" aria-labelledby="chofer-section-title">
          <h4 id="chofer-section-title" class="form-section-title">
            <i class="ri-user-line text-secondary"></i> Datos del Chofer
          </h4>
          <div class="grid form-grid sm:grid-cols-2">
            <div class="form-field">
              <label class="label">Nombre <span class="text-error">*</span></label>
              <input v-model="nombreDisplay" type="text" class="input input-primary" placeholder="Juan" required />
            </div>
            <div class="form-field">
              <label class="label">Apellido <span class="text-error">*</span></label>
              <input v-model="apellidoDisplay" type="text" class="input input-primary" placeholder="Pérez" required />
            </div>
          </div>
        </section>

        <section v-show="pasoActual === 3" class="form-section form-section-wide animate-fade-in" aria-labelledby="mantenimiento-section-title">
          <h4 id="mantenimiento-section-title" class="form-section-title">
            <i class="ri-tools-line text-accent"></i> Datos del Mantenimiento
          </h4>

          <div class="grid form-grid sm:grid-cols-2">
            <div class="form-field">
              <label class="label">Fecha de Servicio <span class="text-error">*</span></label>
              <input v-model="form.mantenimiento.fecha_servicio" type="date" class="input input-primary" required />
            </div>
            <div class="form-field">
              <label class="label">Tipo de Seguimiento <span class="text-error">*</span></label>
              <select v-model="form.mantenimiento.usa_kilometraje" class="select select-primary" required>
                <option :value="false">Por Fecha</option>
                <option :value="true">Por Kilometraje</option>
              </select>
            </div>
          </div>

          <div v-if="form.mantenimiento.usa_kilometraje" class="grid form-grid sm:grid-cols-2">
            <div class="form-field">
              <label class="label">Kilometraje Actual <span class="text-error">*</span></label>
              <input v-model.number="form.mantenimiento.kilometraje" type="number" class="input input-primary" placeholder="50,000" required min="0" />
            </div>
            <div class="form-field">
              <label class="label">Próximo Kilometraje <span class="text-error">*</span></label>
              <input v-model.number="form.mantenimiento.proximo_kilometraje" type="number" class="input input-primary" placeholder="55,000" required min="1" />
            </div>
          </div>

          <div v-else class="grid form-grid sm:grid-cols-2">
            <div class="form-field">
              <label class="label">Próxima Revisión <span class="text-error">*</span></label>
              <input v-model="form.mantenimiento.proxima_revision" type="date" class="input input-primary" required />
            </div>
          </div>

          <div class="form-subsection">
            <div class="form-subsection-heading">
              <div class="form-subsection-icon"><i class="ri-filter-3-line"></i></div>
              <div>
                <h5>Aceite y filtros</h5>
                <p>Registra los insumos y servicios realizados.</p>
              </div>
            </div>
            <div class="maintenance-grid">
              <div class="form-field">
                <label class="label" for="tipo-aceite">Tipo de aceite</label>
                <div class="input-with-icon">
                  <i class="ri-drop-line" aria-hidden="true"></i>
                  <input id="tipo-aceite" v-model="tipoAceiteDisplay" type="text" class="input" placeholder="Ej: 15W-40" />
                </div>
              </div>
              <div class="form-field">
                <label class="label" for="numero-filtro">N.º de filtro de aceite</label>
                <div class="input-with-icon">
                  <i class="ri-settings-3-line" aria-hidden="true"></i>
                  <input id="numero-filtro" v-model="numeroFiltroDisplay" type="text" class="input" placeholder="Ej: PH2808" />
                </div>
              </div>
              <label class="form-check-card maintenance-check-card">
                <span class="form-check-icon"><i class="ri-gas-station-line"></i></span>
                <span class="form-check-copy">
                  <span>Filtro de combustible</span>
                  <small>Marca si fue cambiado</small>
                </span>
                <input v-model="form.mantenimiento.filtro_combustible" type="checkbox" class="checkbox checkbox-primary" aria-label="Se reemplazó el filtro de combustible" />
              </label>
              <div class="form-field air-filter-field">
                <label class="label" for="filtro-aire-accion">Filtro de aire</label>
                <div class="select-with-icon">
                  <i class="ri-windy-line" aria-hidden="true"></i>
                  <select id="filtro-aire-accion" v-model="form.mantenimiento.filtro_aire_accion" class="select filter-action-select">
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
              <label class="label" for="transmision-caja">Transmisión / caja</label>
              <input id="transmision-caja" v-model="transmisionDisplay" type="text" class="input" placeholder="Ej: Sintético 75W-90" />
            </div>
            <label class="form-check-card maintenance-check-card">
              <span class="form-check-icon"><i class="ri-oil-line"></i></span>
              <span class="form-check-copy">
                <span>Engrase</span>
                <small>Servicio realizado</small>
              </span>
              <input v-model="form.mantenimiento.engrase" type="checkbox" class="checkbox checkbox-primary" aria-label="Se realizó el engrase" />
            </label>
          </div>
        </section>

        <div class="modal-form-footer">
          <button type="button" class="btn btn-ghost" @click="$emit('cerrar')">
            Cancelar
          </button>
          <button type="button" class="btn btn-secondary" @click="pasoAnterior" v-if="pasoActual > 1">
            <i class="ri-arrow-left-line"></i> Anterior
          </button>
          <button type="button" class="btn btn-primary" @click="pasoSiguiente" v-if="pasoActual < 3">
            Siguiente <i class="ri-arrow-right-line"></i>
          </button>
          <button type="submit" class="btn btn-success" v-if="pasoActual === 3" :disabled="guardando">
            <i class="ri-save-line"></i> {{ guardando ? 'Guardando...' : 'Guardar Todo' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useMantenimientos } from '~/composables/useMantenimientos'
import { useTextNormalize } from '~/composables/useTextNormalize'
import type { FormDataCompleto } from '~/types/database'

const { crearCompleto } = useMantenimientos()
const { toUpperCase, normalizeForStorage, normalizePlaca } = useTextNormalize()

const emit = defineEmits<{
  cerrar: []
  guardado: []
}>()

const guardando = ref(false)
const pasoActual = ref(1)

// Formulario interno (se guarda en minúsculas en BD)
const form = reactive<FormDataCompleto>({
  vehiculo: { placa: '', marca: '', modelo: '' },
  chofer: { nombre: '', apellido: '' },
  mantenimiento: {
    fecha_servicio: new Date().toISOString().split('T')[0],
    kilometraje: null,
    tipo_aceite: '',
    numero_filtro: '',
    filtro_combustible: false,
    filtro_aire: false,
    filtro_aire_accion: null,
    transmision_caja: '',
    engrase: false,
    proxima_revision: null,
    proximo_kilometraje: null,
    observaciones: '',
    usa_kilometraje: false
  }
})

// Computed para mostrar en mayúsculas en los inputs, guardar en minúsculas
const placaDisplay = computed({
  get: () => toUpperCase(form.vehiculo.placa),
  set: (val: string) => { form.vehiculo.placa = normalizePlaca(val) }
})

const marcaDisplay = computed({
  get: () => toUpperCase(form.vehiculo.marca),
  set: (val: string) => { form.vehiculo.marca = normalizeForStorage(val) }
})

const modeloDisplay = computed({
  get: () => toUpperCase(form.vehiculo.modelo),
  set: (val: string) => { form.vehiculo.modelo = normalizeForStorage(val) }
})

const nombreDisplay = computed({
  get: () => toUpperCase(form.chofer.nombre),
  set: (val: string) => { form.chofer.nombre = normalizeForStorage(val) }
})

const apellidoDisplay = computed({
  get: () => toUpperCase(form.chofer.apellido),
  set: (val: string) => { form.chofer.apellido = normalizeForStorage(val) }
})

const tipoAceiteDisplay = computed({
  get: () => toUpperCase(form.mantenimiento.tipo_aceite),
  set: (val: string) => { form.mantenimiento.tipo_aceite = normalizeForStorage(val) }
})

const numeroFiltroDisplay = computed({
  get: () => toUpperCase(form.mantenimiento.numero_filtro),
  set: (val: string) => { form.mantenimiento.numero_filtro = normalizeForStorage(val) }
})

const transmisionDisplay = computed({
  get: () => toUpperCase(form.mantenimiento.transmision_caja),
  set: (val: string) => { form.mantenimiento.transmision_caja = normalizeForStorage(val) }
})

function pasoSiguiente() {
  if (pasoActual.value < 3) pasoActual.value++
}

function pasoAnterior() {
  if (pasoActual.value > 1) pasoActual.value--
}

async function guardar() {
  if (!form.vehiculo.placa || !form.chofer.nombre || !form.chofer.apellido || !form.mantenimiento.fecha_servicio) {
    alert('Complete los campos obligatorios')
    return
  }

  if (form.mantenimiento.usa_kilometraje) {
    if (!form.mantenimiento.kilometraje || !form.mantenimiento.proximo_kilometraje) {
      alert('Complete kilometraje actual y próximo kilometraje')
      return
    }
  } else {
    if (!form.mantenimiento.proxima_revision) {
      alert('Seleccione la próxima revisión')
      return
    }
  }

  guardando.value = true
  try {
    await crearCompleto(form)
    emit('guardado')
    resetForm()
  } catch (error) {
    console.error('Error guardando:', error)
    alert('Error al guardar. Verifique la consola.')
  } finally {
    guardando.value = false
  }
}

function resetForm() {
  form.vehiculo = { placa: '', marca: '', modelo: '' }
  form.chofer = { nombre: '', apellido: '' }
  form.mantenimiento = {
    fecha_servicio: new Date().toISOString().split('T')[0],
    kilometraje: null,
    tipo_aceite: '',
    numero_filtro: '',
    filtro_combustible: false,
    filtro_aire: false,
    filtro_aire_accion: null,
    transmision_caja: '',
    engrase: false,
    proxima_revision: null,
    proximo_kilometraje: null,
    observaciones: '',
    usa_kilometraje: false
  }
  pasoActual.value = 1
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.2s ease-out; }
</style>