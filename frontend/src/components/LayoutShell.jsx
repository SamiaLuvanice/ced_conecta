import {
  DashboardIcon,
  ExitIcon,
  FileTextIcon,
  ReaderIcon,
} from '@radix-ui/react-icons'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function GroupPeopleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="5.5" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18.5" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 18.5C7.5 16 9.5 14 12 14C14.5 14 16.5 16 16.5 18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2.5 18.5C2.5 16.8 3.9 15.5 5.5 15.5C7.1 15.5 8.5 16.8 8.5 18.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 18.5C15.5 16.8 16.9 15.5 18.5 15.5C20.1 15.5 21.5 16.8 21.5 18.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const navMap = {
  PROFESSOR: [
    { to: '/professor/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: '/professor/turmas', label: 'Turmas', icon: GroupPeopleIcon },
    { to: '/professor/atividades', label: 'Atividades', icon: ReaderIcon },
  ],
  ALUNO: [
    { to: '/aluno/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: '/aluno/atividades', label: 'Atividades', icon: FileTextIcon },
  ],
}

export default function LayoutShell({ title, children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const links = navMap[user?.perfil] || []

  const isRouteActive = (to) => location.pathname === to || location.pathname.startsWith(`${to}/`)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
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
          <p className="muted">{user?.nome}</p>
          <span className="badge profile">{user?.perfil}</span>
        </div>
        <nav>
          {links.map((item) => (
            <Link key={item.to} to={item.to} className={isRouteActive(item.to) ? 'nav-link active' : 'nav-link'}>
              <item.icon />
              {item.label}
            </Link>
          ))}
        </nav>
        <button className="secondary-button" onClick={logout}>
          <ExitIcon />
          Sair
        </button>
      </aside>
      <main className="content">
        <header className="page-header">
          <div>
            <h2>{title}</h2>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
