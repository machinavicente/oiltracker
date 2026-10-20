<template>
  <div class="min-h-screen bg-base-200">
    <header class="navbar app-navbar sticky top-0 z-40 mb-6">
      <div class="navbar-start">
        <NuxtLink to="/" class="btn btn-ghost btn-lg text-xl font-bold text-primary">
          <i class="ri-truck-line ri-lg"></i>
          <span>OilTracker</span>
        </NuxtLink>
      </div>
      <div class="navbar-center hidden md:flex">
        <div class="tabs tabs-bordered w-full max-w-2xl" role="tablist">
          <NuxtLink to="/dashboard" class="tab tab-bordered" role="tab" active-class="tab-bordered-active">
            <i class="ri-dashboard-line ri-lg"></i>
            <span class="hidden sm:inline">Dashboard</span>
          </NuxtLink>
          <NuxtLink to="/mantenimientos" class="tab tab-bordered" role="tab" active-class="tab-bordered-active">
            <i class="ri-tools-line ri-lg"></i>
            <span class="hidden sm:inline">Mantenimientos</span>
          </NuxtLink>
          <NuxtLink to="/vehiculos" class="tab tab-bordered" role="tab" active-class="tab-bordered-active">
            <i class="ri-truck-line ri-lg"></i>
            <span class="hidden sm:inline">Vehículos</span>
          </NuxtLink>
          <NuxtLink to="/choferes" class="tab tab-bordered" role="tab" active-class="tab-bordered-active">
            <i class="ri-user-line ri-lg"></i>
            <span class="hidden sm:inline">Choferes</span>
          </NuxtLink>
        </div>
      </div>
      <div class="navbar-end">
        <button class="btn btn-primary app-new-record" @click="mostrarModal = true">
          <i class="ri-add-line ri-lg"></i>
          <span>Nuevo Registro</span>
        </button>
      </div>
    </header>

    <main class="container mx-auto px-4 pb-8 app-main">
      <slot />
    </main>

    <nav class="mobile-nav md:hidden" aria-label="Navegación principal">
      <NuxtLink to="/dashboard" class="mobile-nav-link" active-class="mobile-nav-link-active">
        <i class="ri-dashboard-line"></i><span>Inicio</span>
      </NuxtLink>
      <NuxtLink to="/mantenimientos" class="mobile-nav-link" active-class="mobile-nav-link-active">
        <i class="ri-tools-line"></i><span>Servicios</span>
      </NuxtLink>
      <NuxtLink to="/vehiculos" class="mobile-nav-link" active-class="mobile-nav-link-active">
        <i class="ri-truck-line"></i><span>Vehículos</span>
      </NuxtLink>
      <NuxtLink to="/choferes" class="mobile-nav-link" active-class="mobile-nav-link-active">
        <i class="ri-user-line"></i><span>Choferes</span>
      </NuxtLink>
    </nav>

    <ModalFormulario v-if="mostrarModal" @cerrar="mostrarModal = false" @guardado="manejarGuardado" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModalFormulario from '~/components/ModalFormulario.vue'

const mostrarModal = ref(false)
const cambiosMantenimiento = useState('cambios-mantenimiento', () => 0)

function manejarGuardado() {
  cambiosMantenimiento.value++
  mostrarModal.value = false
}
</script>
