<script lang="ts" setup>
import { LoaderPinwheelIcon } from 'lucide-vue-next'
const { timer, toggleTimer, resetTimer } = useTimer()

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(timer.value.elapsedTime / 1000)
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    '0'
  )
  return `${hours}:${minutes}`
})

const formattedSeconds = computed(() => {
  const totalSeconds = Math.floor(timer.value.elapsedTime / 1000)
  return `${String(totalSeconds % 60).padStart(2, '0')}`
})
// const formattedMilliseconds = computed(() => {
//   const milliseconds = Math.floor((timer.value.elapsedTime % 1000) / 10)
//   return `.${String(milliseconds).padStart(2, '0')}`
// })

const buttonClass = computed(() =>
  timer.value.isRunning
    ? 'bg-red-500 hover:bg-red-600'
    : 'bg-green-500 hover:bg-green-600'
)

const customTimeInput = ref('')

// TODO: broken until time storage is refactored
const addCustomTime = () => {
  const input = customTimeInput.value.trim().toLowerCase()

  let timeToAdd = 0

  // Hours
  const pattern = /(\d+)\s*h/i
  const match = input.match(pattern)
  if (match) {
    const hours = parseInt(match[1], 10)
    console.log(hours, 'hours')
    timeToAdd += hours * 3600
  }

  // Minutes
  const minutePattern = /(\d+)\s*m/i
  const minuteMatch = input.match(minutePattern)
  if (minuteMatch) {
    const minutes = parseInt(minuteMatch[1], 10)
    console.log(minutes, 'minutes')
    timeToAdd += minutes * 60
  }

  // Seconds
  const secondPattern = /(\d+)\s*s/i
  const secondMatch = input.match(secondPattern)
  if (secondMatch) {
    const seconds = parseInt(secondMatch[1], 10)
    console.log(seconds, 'seconds')
    timeToAdd += seconds
  }

  console.log('timeToAdd', timeToAdd)
  if (timeToAdd > 0) {
    timer.value.elapsedTime += timeToAdd * 1000
  }
  customTimeInput.value = ''
}
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center bg-gray-100"
  >
    <ClientOnly>
      <div
        class="mb-4 flex items-baseline font-mono text-5xl font-bold text-gray-800"
      >
        <span>{{ formattedTime }}</span>
        <transition name="pulse" mode="out-in">
          <span
            :key="formattedSeconds"
            class="ml-1 text-lg text-gray-500 opacity-80"
          >
            {{ formattedSeconds }}
          </span>
        </transition>
      </div>
      <template #fallback>
        <div
          class="mb-4 flex items-baseline font-mono text-5xl font-bold text-gray-800"
        >
          <span>--:--</span>
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
    <div class="mt-4 flex items-center space-x-2">
      <input
        v-model="customTimeInput"
        type="text"
        placeholder="Add Time"
        class="w-48 rounded-lg border border-gray-300 px-3 py-2 text-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        class="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        @click="addCustomTime"
      >
        Add Time
      </button>
      <!-- TODO: remove time button -->
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.pulse-enter-active {
  animation: pulse 0.5s ease-in-out;
}
.pulse-leave-active {
  transition: none;
}
</style>
