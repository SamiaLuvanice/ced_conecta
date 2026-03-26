import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LayoutShell from '../components/LayoutShell'
import api from '../services/api'

export default function ProfessorTurmasPage() {
  const [turmas, setTurmas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const carregar = async () => {
      setLoading(true)
      setErro('')
      try {
        const [resAtividades, resTurmas] = await Promise.all([api.get('/me/atividades'), api.get('/me/turmas')])
        const atividadesPorTurma = resAtividades.data.reduce((acc, atividade) => {
          const turmaId = atividade.turma?.id
          if (!turmaId) {
            return acc
          }
          if (!acc[turmaId]) {
            acc[turmaId] = { totalAtividades: 0, totalRespostas: 0 }
          }
          acc[turmaId].totalAtividades += 1
          acc[turmaId].totalRespostas += atividade.total_respostas || 0
          return acc
        }, {})

        const turmasComResumo = resTurmas.data.map((turma) => {
          const resumo = atividadesPorTurma[turma.id] || { totalAtividades: 0, totalRespostas: 0 }
          return {
            ...turma,
            totalAtividades: resumo.totalAtividades,
            totalRespostas: resumo.totalRespostas,
          }
        })

        setTurmas(turmasComResumo)
      } catch {
        setErro('Nao foi possivel carregar as turmas agora. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [])

  return (
    <LayoutShell title="Turmas">
      {erro ? <p className="error-box">{erro}</p> : null}

      {loading ? <p className="info-box">Carregando turmas...</p> : null}
      {!loading && !turmas.length ? (
        <p className="info-box">Nenhuma turma encontrada para este professor.</p>
      ) : null}

      {!loading && turmas.length ? (
        <div className="table-wrap">
          <table className="activities-table">
            <thead>
              <tr>
                <th>Turma</th>
                <th>Código</th>
                <th style={{ textAlign: 'center' }}>Alunos</th>
                <th style={{ textAlign: 'center' }}>Atividades</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((turma) => (
                <tr key={turma.id}>
                  <td>
                    <Link className="table-title-link" to={`/professor/turmas/${turma.id}`}>
                      {turma.nome}
                    </Link>
                  </td>
                  <td>{turma.codigo}</td>
                  <td style={{ textAlign: 'center' }}>{turma.alunos_count || 0}</td>
                  <td style={{ textAlign: 'center' }}>{turma.totalAtividades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </LayoutShell>
  )
}
