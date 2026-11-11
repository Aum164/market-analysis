import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface AppStore {
  theme: Theme
  selectedSymbol: string
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  setSymbol: (s: string) => void
}

const THEME_KEY = 'market_analysis_theme'

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useAppStore = create<AppStore>((set) => ({
  theme: getInitialTheme(),
  selectedSymbol: 'NIFTY50',
  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme)
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    set({ theme })
  },
  toggleTheme: () => {
    const store = useAppStore.getState()
    store.setTheme(store.theme === 'dark' ? 'light' : 'dark')
  },
  setSymbol: (selectedSymbol) => set({ selectedSymbol }),
}))
