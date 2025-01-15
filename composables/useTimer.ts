interface TimerState {
  isRunning: boolean
  elapsedTime: number
  lastSaved: number | null
}

export default function () {
  const timer = useLocalStorage<TimerState>('timer', {
    isRunning: false,
    elapsedTime: 0,
    lastSaved: null
  })
  let interval: ReturnType<typeof setInterval> | undefined = undefined

  const toggleTimer = () => {
    if (!timer.value.isRunning) {
      timer.value.isRunning = true
      const startTime = Date.now() - timer.value.elapsedTime
      interval = setInterval(() => {
        timer.value.elapsedTime = Date.now() - startTime
      }, 10)
    } else {
      timer.value.isRunning = false
      if (interval) clearInterval(interval)
    }
  }

  const resetTimer = () => {
    if (timer.value.isRunning) {
      toggleTimer()
    }

    timer.value.elapsedTime = 0
    timer.value.lastSaved = null
  }

  function saveTimerState() {
    if (timer.value.isRunning) {
      toggleTimer()
      timer.value.lastSaved = Date.now()
    }
  }

  onMounted(() => {
    if (timer.value.lastSaved) {
      const elapsed = Date.now() - timer.value.lastSaved
      timer.value.elapsedTime += elapsed
      timer.value.lastSaved = null
      timer.value.isRunning = false
      toggleTimer()
    }

    window.addEventListener('beforeunload', saveTimerState)
  })

  onBeforeRouteLeave(saveTimerState)
  onUnmounted(() => {
    saveTimerState()

    window.removeEventListener('beforeunload', saveTimerState)
  })

  return {
    timer,
    toggleTimer,
    resetTimer
  }
}
