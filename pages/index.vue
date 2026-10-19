<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
      <div class="loading loading-spinner loading-lg text-primary mx-auto mb-4"></div>
      <p class="text-base-content/60">Redirigiendo al dashboard...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from 'nuxt/app'

navigateTo('/dashboard')
</script>