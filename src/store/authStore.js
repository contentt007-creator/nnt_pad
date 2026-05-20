import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,   // { email, name, picture }
      history: [],  // [{ id, email, userName, picture, docType, invoiceNumber, clientName, date, timestamp }]

      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      addHistory: (entry) =>
        set(s => ({
          history: [
            { ...entry, id: Date.now(), timestamp: new Date().toISOString() },
            ...s.history,
          ],
        })),
    }),
    { name: 'nnt-history' }
  )
)
