import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ReactNode } from 'react'

export interface ThemeProviderProps {
  children: ReactNode
  attribute?: 'class' | 'data-theme' | 'data-mode'
  defaultTheme?: string
  enableSystem?: boolean
  enableColorScheme?: boolean
  storageKey?: string
  themes?: string[]
  forcedTheme?: string
  value?: { [themeName: string]: string }
  nonce?: string
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
