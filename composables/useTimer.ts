interface TimerState {
  isRunning: boolean
  elapsedTime: number
  lastSaved: number | null
}

export default function () {
  // TODO: store elapsedTime as exact time from timestamps, but return approximate time to user by calculating in interval
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
        console.log('up')
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
      // TODO: use intermediate variable instead of isRunning so that UI doesn't flash
      toggleTimer()
      timer.value.lastSaved = Date.now()
    }
  }

  // TODO: add Focus management, when unfocused for a long time it breaks

  onMounted(() => {
    if (timer.value.lastSaved) {
      const elapsed = Date.now() - timer.value.lastSaved
      timer.value.elapsedTime += elapsed
      timer.value.lastSaved = null
    }

    if (timer.value.isRunning) {
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
