import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export const PIECE_SETS = [
  { id: 'cburnett',    name: 'Classic' },
  { id: 'alpha',       name: 'Alpha' },
  { id: 'california',  name: 'California' },
  { id: 'maestro',     name: 'Maestro' },
  { id: 'staunty',     name: 'Staunty' },
  { id: 'tatiana',     name: 'Tatiana' },
  { id: 'reillycraig', name: 'Reilly Craig' },
  { id: 'pixel',       name: 'Pixel' },
  { id: 'mono',        name: 'Mono' },
  { id: 'shapes',      name: 'Shapes' },
  { id: 'fantasy',     name: 'Fantasy' },
  { id: 'letter',      name: 'Letter' },
]

interface SettingsContextValue {
  pieceSet: string
  setPieceSet: (set: string) => void
}

const SettingsContext = createContext<SettingsContextValue>({
  pieceSet: 'cburnett',
  setPieceSet: () => {},
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [pieceSet, setPieceSetState] = useState<string>(
    () => localStorage.getItem('chess_piece_set') ?? 'cburnett'
  )

  function setPieceSet(set: string) {
    localStorage.setItem('chess_piece_set', set)
    setPieceSetState(set)
  }

  return (
    <SettingsContext.Provider value={{ pieceSet, setPieceSet }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
