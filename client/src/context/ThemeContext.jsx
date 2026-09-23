import { createContext, useContext, useEffect, useState } from 'react'
export const ThemeContext = createContext({ dark: false, toggleTheme: () => {} })
export function ThemeProvider({ children }) { const [dark, setDark] = useState(localStorage.getItem('rms_theme') === 'dark'); useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('rms_theme', dark ? 'dark' : 'light') }, [dark]); return <ThemeContext.Provider value={{ dark, toggleTheme: () => setDark(value => !value) }}>{children}</ThemeContext.Provider> }
export const useTheme = () => useContext(ThemeContext)
