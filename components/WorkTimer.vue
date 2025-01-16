<script lang="ts" setup>
import { LoaderPinwheelIcon, MinusIcon, PlusIcon } from 'lucide-vue-next'
const { timer, toggleTimer, resetTimer, modifyTimer } = useTimer()

const formattedHours = computed(() => {
  const totalSeconds = Math.floor(timer.elapsedTime / 1000)
  return String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
})

const formattedMinutes = computed(() => {
  const totalSeconds = Math.floor(timer.elapsedTime / 1000)
  return String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
})

const formattedSeconds = computed(() => {
  const totalSeconds = Math.floor(timer.elapsedTime / 1000)
  return `${String(totalSeconds % 60).padStart(2, '0')}`
})
// const formattedMilliseconds = computed(() => {
//   const milliseconds = Math.floor((timer.value.elapsedTime % 1000) / 10)
//   return `.${String(milliseconds).padStart(2, '0')}`
// })

const buttonClass = computed(() =>
  timer.isRunning
    ? 'bg-red-600 text-red-50 ring-red-800 hover:bg-red-500 active:bg-red-500'
    : 'bg-green-600 text-green-50 ring-green-800 hover:bg-green-500 active:bg-green-500'
)

const customTimeInput = ref('')

// TODO: broken until time storage is refactored
function parseTime() {
  const input = customTimeInput.value.trim().toLowerCase()
  let time = 0
  const descriptionParts: string[] = []

  // Hours
  const pattern = /(\d+)\s*h/i
  const match = input.match(pattern)
  if (match) {
    const hours = parseInt(match[1], 10)
    console.log(hours, 'hours')
    time += hours * 3600
    descriptionParts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
  }

  // Minutes
  const minutePattern = /(\d+)\s*m(?!s)/i
  const minuteMatch = input.match(minutePattern)
  if (minuteMatch) {
    const minutes = parseInt(minuteMatch[1], 10)
    console.log(minutes, 'minutes')
    time += minutes * 60
    descriptionParts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
  }

  // Seconds
  const secondPattern = /(\d+)\s*s/i
  const secondMatch = input.match(secondPattern)
  if (secondMatch) {
    const seconds = parseInt(secondMatch[1], 10)
    console.log(seconds, 'seconds')
    time += seconds
    descriptionParts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`)
  }

  const description =
    descriptionParts.length < 3
      ? descriptionParts.join(' and ')
      : descriptionParts.slice(0, -1).join(', ') +
        ' and ' +
        descriptionParts.slice(-1)

  return [time * 1000, description] as const
}

function addToTimer() {
  const [timeToAdd, description] = parseTime()
  if (timeToAdd > 0) {
    modifyTimer(timeToAdd)
    customTimeInput.value = ''
    toast.success(`Added ${description} to the timer.`)
  } else {
    toast.error('Unable to parse timer modification.')
  }
}

function removeFromTimer() {
  const [timeToRemove, description] = parseTime()
  if (timeToRemove > 0) {
    modifyTimer(-timeToRemove)
    customTimeInput.value = ''
    toast.success(`Removed ${description} from the timer.`)
  } else {
    toast.error('Unable to parse timer modification.')
  }
}
</script>

<template>
  <div
    class="inline-grid grid-cols-[max-content_max-content] items-center gap-2"
  >
    <ClientOnly>
      <div
        class="flex items-baseline font-mono text-5xl font-bold text-stone-800"
      >
        <Transition name="pulse" mode="out-in">
          <span :key="formattedHours" class="will-change-transform">{{
            formattedHours
          }}</span>
        </Transition>
        <span>:</span>
        <Transition name="pulse" mode="out-in">
          <span :key="formattedMinutes" class="will-change-transform">{{
            formattedMinutes
          }}</span>
        </Transition>
        <Transition name="pulse-light" mode="out-in">
          <span
            :key="formattedSeconds"
            class="ml-1 text-xl text-stone-500 opacity-80 will-change-transform"
          >
            {{ formattedSeconds }}
          </span>
        </Transition>
      </div>
      <template #fallback>
        <div
          class="flex items-baseline font-mono text-5xl font-bold text-stone-800"
        >
          <span class="will-change-transform">--</span>
          <span>:</span>
          <span class="will-change-transform">--</span>
          <span
            class="ml-1 text-xl text-stone-500 opacity-80 will-change-transform"
            >--</span
          >
        </div>
      </template>
    </ClientOnly>
    <div class="flex gap-2">
      <ClientOnly>
        <button
          :class="buttonClass"
          class="grid items-center justify-center rounded px-6 py-2 text-lg font-semibold outline-none transition focus-visible:ring-2"
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
            class="grid items-center justify-center rounded bg-stone-300 px-6 py-2 text-lg font-semibold text-stone-600 outline-none transition focus-visible:ring-2"
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
        class="transform rounded bg-stone-300 px-6 py-2 text-lg font-semibold text-stone-600 outline-none ring-stone-500 transition hover:bg-stone-200 hover:text-stone-500 focus-visible:ring-2 active:bg-stone-200 active:text-stone-500"
        @click="resetTimer"
      >
        Reset
      </button>
    </div>
    <input
      v-model="customTimeInput"
      type="text"
      placeholder="Modify Timer"
      class="w-full min-w-16 max-w-44 self-stretch rounded bg-stone-300 px-3 py-2 text-lg font-medium text-stone-700 placeholder-stone-400 outline-none ring-stone-500 transition selection:bg-stone-500 selection:text-stone-100 placeholder:select-none focus-visible:ring-2"
    />
    <div class="flex w-fit rounded">
      <button
        class="peer z-10 rounded-l border-stone-400/80 bg-stone-300 p-2.5 text-stone-600 outline-none ring-stone-500 transition hover:bg-stone-200 hover:text-stone-500 focus-visible:ring-2 active:bg-stone-200 active:text-stone-500 disabled:pointer-events-none disabled:opacity-50"
        :disabled="customTimeInput.length === 0"
        @click="addToTimer"
      >
        <PlusIcon />
      </button>
      <span class="w-0.5 bg-stone-400/80 transition peer-disabled:opacity-50" />
      <button
        class="peer z-10 rounded-r bg-stone-300 p-2.5 text-stone-600 outline-none ring-stone-500 transition hover:bg-stone-200 hover:text-stone-500 focus-visible:ring-2 active:bg-stone-200 active:text-stone-500 disabled:pointer-events-none disabled:opacity-50"
        :disabled="customTimeInput.length === 0"
        @click="removeFromTimer"
      >
        <MinusIcon />
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulse-light {
  0% {
    transform: scale(1.15);
    opacity: 1;
  }
  15% {
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.pulse-enter-active {
  animation: pulse 0.5s ease-out;
}
.pulse-light-enter-active {
  animation: pulse-light 0.5s ease-out;
}

.pulse-leave-active,
.pulse-light-leave-active {
  transition: none;
}
</style>
