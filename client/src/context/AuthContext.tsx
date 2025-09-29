import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiFetch } from '../lib/api'

type User = {
  id: number
  email: string
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  signup: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        const currentUser = await apiFetch<User>('/auth/me')
        if (!cancelled) {
          setUser(currentUser)
        }
      } catch (error) {
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const data = await apiFetch<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(data)
  }, [])

  const signup = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const data = await apiFetch<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(data)
  }, [])

  const logout = useCallback(async () => {\n    try {\n      await apiFetch<void>('/auth/logout', { method: 'POST' })\n    } catch (error) {\n      // ignore logout errors\n    } finally {\n      setUser(null)\n    }\n  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
    }),
    [user, loading, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


