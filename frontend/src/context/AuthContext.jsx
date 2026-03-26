import { createContext, useContext, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cedconecta_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email, senha) => {
    const { data } = await api.post('/auth/login', { email, senha })
    localStorage.setItem('cedconecta_access', data.access)
    localStorage.setItem('cedconecta_refresh', data.refresh)
    localStorage.setItem('cedconecta_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('cedconecta_access')
    localStorage.removeItem('cedconecta_refresh')
    localStorage.removeItem('cedconecta_user')
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, logout, isAuthenticated: !!user }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
