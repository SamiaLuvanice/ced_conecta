import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function PrivateRoute({ children, perfil }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (perfil && user?.perfil !== perfil) {
    return <Navigate to={user?.perfil === 'PROFESSOR' ? '/professor/dashboard' : '/aluno/dashboard'} replace />
  }

  return children
}

export function PublicRoute({ children }) {
  const { user, isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to={user?.perfil === 'PROFESSOR' ? '/professor/dashboard' : '/aluno/dashboard'} replace />
  }
  return children
}
