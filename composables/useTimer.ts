type TimerState = {
  elapsedTime: number
  startDate: number | null
}

export default function () {
  // Private state stored in localStorage
  const timerStorage = useLocalStorage<TimerState>('timer', {
    elapsedTime: 0,
    startDate: null
  })

  // Exposed state
  const timer = reactive({
    isRunning: computed(() => Boolean(timerStorage.value.startDate)),
    elapsedTime: timerStorage.value.startDate
      ? Date.now() - timerStorage.value.startDate
      : timerStorage.value.elapsedTime
  })

  let interval: ReturnType<typeof setInterval> | undefined = undefined

  function startTimer() {
    if (interval) clearInterval(interval)

    if (timerStorage.value.startDate != null) {
      timer.elapsedTime =
        timerStorage.value.elapsedTime +
        (Date.now() - timerStorage.value.startDate)
    } else {
      timer.elapsedTime = timerStorage.value.elapsedTime
      timerStorage.value.startDate = Date.now()
    }

    interval = setInterval(() => {
      timer.elapsedTime += 1000
    }, 1000)
  }

  function stopTimer() {
    if (!timer.isRunning) throw new Error('Timer is already stopped')

    timerStorage.value.elapsedTime +=
      Date.now() - (timerStorage.value.startDate as number)
    timer.elapsedTime = timerStorage.value.elapsedTime // TODO: this can cause the timer to adjust unexpectedly
    timerStorage.value.startDate = null
    if (interval) clearInterval(interval)
  }

  function toggleTimer() {
    if (!timer.isRunning) {
      startTimer()
    } else {
      stopTimer()
    }
  }

  function resetTimer() {
    if (timer.isRunning) {
      stopTimer()
    }

    timerStorage.value.elapsedTime = 0
    timerStorage.value.startDate = null
    timer.elapsedTime = 0
  }

  function modifyTimer(timeDelta: number) {
    console.log(timeDelta)

    const currentDate = Date.now()
    let newTime = timerStorage.value.elapsedTime + timeDelta
    if (timerStorage.value.startDate != null) {
      newTime += currentDate - timerStorage.value.startDate
      timerStorage.value.startDate = currentDate
    }

    if (newTime <= 0) {
      timerStorage.value.elapsedTime = 0
    } else {
      timerStorage.value.elapsedTime = newTime
    }
    timer.elapsedTime = timerStorage.value.elapsedTime

    if (newTime <= 0) {
      timerStorage.value.startDate = null
      startTimer()
    }
  }

  onMounted(() => {
    if (timer.isRunning) {
      startTimer()
    }
  })

  const focused = useWindowFocus()
  watch(focused, () => {
    if (focused.value && timerStorage.value.startDate) {
      startTimer()
    }
  })

  return {
    timer,
    toggleTimer,
    resetTimer,
    modifyTimer
  }
}
