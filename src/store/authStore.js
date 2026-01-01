import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      
      login: (token, userData) => {
        set({ token, user: userData })
      },
      
      logout: () => {
        set({ token: null, user: null })
        // Clear localStorage
        localStorage.removeItem('auth-storage')
      },
      
      isAdmin: () => {
        const user = get().user
        return user?.role === 'admin' || user?.role === 'Admin'
      },
      
      isAuthenticated: () => {
        return !!get().token
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useAuthStore

