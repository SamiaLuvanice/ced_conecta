import { createContext, useContext, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('educonnect_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email, senha) => {
    const { data } = await api.post('/auth/login', { email, senha })
    localStorage.setItem('educonnect_access', data.access)
    localStorage.setItem('educonnect_refresh', data.refresh)
    localStorage.setItem('educonnect_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('educonnect_access')
    localStorage.removeItem('educonnect_refresh')
    localStorage.removeItem('educonnect_user')
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, logout, isAuthenticated: !!user }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
