import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.senha)
      navigate(user.perfil === 'PROFESSOR' ? '/professor/dashboard' : '/aluno/dashboard')
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="wifi-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.8 8.8a13.8 13.8 0 0 1 18.4 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M6.2 12.3a9 9 0 0 1 11.6 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M9.7 15.9a4.4 4.4 0 0 1 4.6 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="12" cy="19" r="1.5" fill="white" />
            </svg>
          </span>
          <h1>Ced Conecta</h1>
        </div>
        <p className="muted">Entre com seu e-mail e senha.</p>
        <label>
          E-mail
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Senha
          <input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required />
        </label>
        {error ? <div className="error-box">{error}</div> : null}
        <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        <div className="demo-box">
          <strong>Contas de teste</strong>
          <span>Professora: ana@cedconecta.com / 123456</span>
          <span>Aluno: joao@cedconecta.com / 123456</span>
        </div>
      </form>
    </div>
  )
}
