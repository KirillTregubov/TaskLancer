<script lang="ts" setup>
import { LoaderPinwheelIcon } from 'lucide-vue-next'
const { timer, toggleTimer, resetTimer } = useTimer()

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(timer.value.elapsedTime / 1000)
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})

const formattedMilliseconds = computed(() => {
  return String(Math.floor((timer.value.elapsedTime % 1000) / 10)).padStart(
    2,
    '0'
  )
})

const buttonClass = computed(() =>
  timer.value.isRunning
    ? 'bg-red-500 hover:bg-red-600'
    : 'bg-green-500 hover:bg-green-600'
)
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center bg-gray-100"
  >
    <ClientOnly>
      <div
        class="mb-4 flex items-baseline font-mono text-5xl font-bold text-gray-800"
      >
        {{ formattedTime }}
        <span class="ml-1 text-lg text-gray-500">{{
          formattedMilliseconds
        }}</span>
      </div>
      <template #fallback>
        <div
          class="mb-4 flex items-baseline font-mono text-5xl font-bold text-gray-800"
        >
          --:--
          <span class="ml-1 text-lg text-gray-500">--</span>
        </div>
      </template>
    </ClientOnly>
    <div class="flex space-x-4">
      <ClientOnly fallback-tag="div">
        <button
          :class="buttonClass"
          class="grid items-center justify-center rounded-lg px-6 py-3 text-lg font-semibold text-white transition-colors"
          @click="toggleTimer"
        >
          <span
            class="col-start-1 row-start-1"
            :class="{ invisible: timer.isRunning, visible: !timer.isRunning }"
          >
            Start
          </span>
          <span
            class="col-start-1 row-start-1"
            :class="{ visible: timer.isRunning, invisible: !timer.isRunning }"
          >
            Stop
          </span>
        </button>
        <template #fallback>
          <button
            class="grid items-center justify-center rounded-lg bg-gray-500 px-6 py-3 text-lg font-semibold text-white opacity-50 transition-colors"
            @click="toggleTimer"
          >
            <span
              class="col-start-1 row-start-1 flex animate-spin items-center justify-center"
            >
              <LoaderPinwheelIcon />
            </span>
            <span class="invisible col-start-1 row-start-1">Start</span>
          </button>
        </template>
      </ClientOnly>
      <button
        class="transform rounded-lg bg-gray-500 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 hover:bg-gray-600"
        @click="resetTimer"
      >
        Reset
      </button>
    </div>
  </div>
</template>
