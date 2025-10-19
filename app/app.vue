<script setup lang="ts">
import { Toaster } from 'vue-sonner'

const runtimeConfig = useRuntimeConfig()
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-stone-100 p-4 text-stone-900">
    <NuxtRouteAnnouncer />
    <Toaster :rich-colors="true" :duration="5000" position="top-right" />
    <nav class="mb-2">
      <h1 class="text-xl font-medium text-stone-950">TaskLancer</h1>
    </nav>
    <NuxtPage />
    <footer class="mt-auto text-center">
      Made with ❤️ by <span className="font-bold">Kirill Tregubov</span>.
      <span class="whitespace-nowrap"
        >This site is
        <a
          rel="noopener"
          :href="runtimeConfig.public.repo"
          target="_blank"
          class="rounded-sm underline ring-stone-500 transition outline-none hover:text-stone-600 focus-visible:text-stone-600 focus-visible:ring-2"
          >open source</a
        >.
      </span>
    </footer>
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
