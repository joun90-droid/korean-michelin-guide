import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'kmg-library-v1'
const LibraryContext = createContext(null)

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}')
    return {
      saved: Array.isArray(raw.saved) ? raw.saved : [],
      recent: Array.isArray(raw.recent) ? raw.recent : [],
    }
  } catch {
    return { saved: [], recent: [] }
  }
}

export function LibraryProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const toggleSave = useCallback((id) => {
    setState((prev) => {
      const has = prev.saved.includes(id)
      return {
        ...prev,
        saved: has ? prev.saved.filter((x) => x !== id) : [id, ...prev.saved],
      }
    })
  }, [])

  const remember = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      recent: [id, ...prev.recent.filter((x) => x !== id)].slice(0, 12),
    }))
  }, [])

  const value = useMemo(
    () => ({
      saved: state.saved,
      recent: state.recent,
      isSaved: (id) => state.saved.includes(id),
      toggleSave,
      remember,
    }),
    [state, toggleSave, remember],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary')
  return ctx
}
