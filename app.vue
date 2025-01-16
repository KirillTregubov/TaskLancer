<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <Toaster :rich-colors="true" :duration="5000" />
    <NuxtPage />
  </div>
</template>

<style>
:root {
  font-family: Inter, sans-serif;
  font-feature-settings:
    'liga' 1,
    'calt' 1; /* fix for Chrome */
}
.font-mono {
  font-family: Inter;
  font-feature-settings: 'tnum', 'ss01';
}
@supports (font-variation-settings: normal) {
  :root {
    font-family: InterVariable, sans-serif;
  }
  .font-mono {
    font-family: InterVariable;
  }
}
</style>
