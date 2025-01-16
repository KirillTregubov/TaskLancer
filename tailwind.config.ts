import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      minHeight: {
        // NOTE: this works for setting a fallback
        dvh: ['100vh', '100dvh'] as unknown as string
      }
    }
  }
}
