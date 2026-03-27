import { Navigate, Route, Routes } from 'react-router-dom'
import { PrivateRoute, PublicRoute } from './components/RouteGuards'
import AlunoAtividadeDetalhePage from './pages/AlunoAtividadeDetalhePage'
import AlunoAtividadesPage from './pages/AlunoAtividadesPage'
import AlunoDashboard from './pages/AlunoDashboard'
import AtividadeRespostasPage from './pages/AtividadeRespostasPage'
import CriarAtividadePage from './pages/CriarAtividadePage'
import LoginPage from './pages/LoginPage'
import ProfessorAtividadeDetalhePage from './pages/ProfessorAtividadeDetalhePage'
import ProfessorAtividadesPage from './pages/ProfessorAtividadesPage'
import ProfessorDashboard from './pages/ProfessorDashboard'
import ProfessorRespostaDetalhePage from './pages/ProfessorRespostaDetalhePage'
import ProfessorTurmaDetalhePage from './pages/ProfessorTurmaDetalhePage'
import ProfessorTurmasPage from './pages/ProfessorTurmasPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      <Route path="/professor/dashboard" element={<PrivateRoute perfil="PROFESSOR"><ProfessorDashboard /></PrivateRoute>} />
      <Route path="/professor/atividades" element={<PrivateRoute perfil="PROFESSOR"><ProfessorAtividadesPage /></PrivateRoute>} />
      <Route path="/professor/turmas" element={<PrivateRoute perfil="PROFESSOR"><ProfessorTurmasPage /></PrivateRoute>} />
      <Route path="/professor/turmas/:id" element={<PrivateRoute perfil="PROFESSOR"><ProfessorTurmaDetalhePage /></PrivateRoute>} />
      <Route path="/professor/atividades/nova" element={<PrivateRoute perfil="PROFESSOR"><CriarAtividadePage /></PrivateRoute>} />
      <Route path="/professor/atividades/:id" element={<PrivateRoute perfil="PROFESSOR"><ProfessorAtividadeDetalhePage /></PrivateRoute>} />
      <Route path="/professor/atividades/:id/editar" element={<PrivateRoute perfil="PROFESSOR"><CriarAtividadePage /></PrivateRoute>} />
      <Route path="/professor/atividades/:id/respostas" element={<PrivateRoute perfil="PROFESSOR"><AtividadeRespostasPage /></PrivateRoute>} />
      <Route path="/professor/atividades/:id/respostas/:respostaId" element={<PrivateRoute perfil="PROFESSOR"><ProfessorRespostaDetalhePage /></PrivateRoute>} />

      <Route path="/aluno/dashboard" element={<PrivateRoute perfil="ALUNO"><AlunoDashboard /></PrivateRoute>} />
      <Route path="/aluno/atividades" element={<PrivateRoute perfil="ALUNO"><AlunoAtividadesPage /></PrivateRoute>} />
      <Route path="/aluno/atividades/:id" element={<PrivateRoute perfil="ALUNO"><AlunoAtividadeDetalhePage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
