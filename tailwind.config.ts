import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        ink: '#172221',
        teal: '#14756d',
        mint: '#d8f3e9',
        paper: '#f6f8f7',
        mist: '#e2e9e7',
        gold: '#b7791f',
        coral: '#df6b4f'
      },
      boxShadow: { soft: '0 12px 35px rgba(23, 34, 33, .08)' }
    }
  }
}
