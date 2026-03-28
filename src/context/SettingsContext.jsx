import { createContext, useContext, useEffect, useState } from 'react'
import { settingsApi } from '../api'

const SettingsContext = createContext({ curSym: '₱', curText: '' })

export function SettingsProvider({ children }) {
  const [curSym, setCurSym] = useState('₱')
  const [curText, setCurText] = useState('')

  useEffect(() => {
    settingsApi.get().then((res) => {
      const d = res.data?.data || res.data
      if (d?.cur_sym) setCurSym(d.cur_sym)
      if (d?.cur_text) setCurText(d.cur_text)
    }).catch(() => {})
  }, [])

  return (
    <SettingsContext.Provider value={{ curSym, curText }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
