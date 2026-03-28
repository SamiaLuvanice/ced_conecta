import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LayoutShell from '../components/LayoutShell'
import api from '../services/api'

export default function ProfessorTurmaDetalhePage() {
  const { id } = useParams()
  const turmaId = Number(id)

  const [turma, setTurma] = useState(null)
  const [atividades, setAtividades] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const carregar = async () => {
      setLoading(true)
      setErro('')
      try {
        const [resTurmas, resAtividades] = await Promise.all([api.get('/me/turmas'), api.get('/me/atividades')])
        const turmaSelecionada = resTurmas.data.find((item) => item.id === turmaId)
        if (!turmaSelecionada) {
          setErro('Turma nao encontrada para este professor.')
          setTurma(null)
          setAtividades([])
          return
        }

        const atividadesDaTurma = resAtividades.data.filter((atividade) => atividade.turma?.id === turmaId)
        setTurma(turmaSelecionada)
        setAtividades(atividadesDaTurma)
      } catch {
        setErro('Nao foi possivel carregar os detalhes da turma agora. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [turmaId])

  const alunosCount = turma?.alunos_count || 0

  const alunosOrdenados = useMemo(
    () => [...(turma?.alunos || [])].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [turma],
  )

  const atividadesComPendentes = useMemo(
    () => [...atividades]
      .sort((a, b) => new Date(a.data_entrega) - new Date(b.data_entrega))
      .map((atividade) => ({
        ...atividade,
        faltamReceber: Math.max(alunosCount - (atividade.total_respostas || 0), 0),
      })),
    [atividades, alunosCount],
  )

  return (
    <LayoutShell title={turma ? `Turma: ${turma.nome}` : 'Detalhes da turma'}>
      <div className="section-header turma-detail-topbar">
        <Link className="ghost-button" to="/professor/turmas">Voltar para turmas</Link>
      </div>

      {erro ? <p className="error-box">{erro}</p> : null}

      {loading ? (
        <div className="card form-card skeleton-block" style={{ minHeight: 180 }} aria-hidden="true" />
      ) : null}

      {!loading && turma ? (
        <>
          <section className="card form-card turma-alunos-card">
            <h3>Alunos da turma</h3>
            {!alunosOrdenados.length ? (
              <p className="muted">Nenhum aluno vinculado a esta turma.</p>
            ) : (
              <div className="table-wrap">
                <table className="activities-table mobile-card-table">
                  <thead>
                    <tr>
                      <th className="count-column">#</th>
                      <th>Aluno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunosOrdenados.map((aluno, index) => (
                      <tr key={aluno.id}>
                        <td className="count-column" data-label="#">{index + 1}</td>
                        <td data-label="Aluno">{aluno.nome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card form-card turma-atividades-card">
            <h3>Atividades da turma</h3>
            {!atividadesComPendentes.length ? (
              <p className="muted">Nenhuma atividade inserida nesta turma.</p>
            ) : (
              <div className="table-wrap">
                <table className="activities-table mobile-card-table">
                  <thead>
                    <tr>
                      <th>Atividade</th>
                      <th>Entrega</th>
                      <th className="count-column">Recebidas</th>
                      <th className="count-column">Faltam receber</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atividadesComPendentes.map((atividade) => (
                      <tr key={atividade.id}>
                        <td data-label="Atividade">
                          <Link className="table-title-link" to={`/professor/atividades/${atividade.id}`}>
                            {atividade.titulo}
                          </Link>
                        </td>
                        <td data-label="Entrega">{new Date(atividade.data_entrega).toLocaleDateString('pt-BR')}</td>
                        <td className="count-column" data-label="Recebidas">{atividade.total_respostas || 0}</td>
                        <td className="count-column" data-label="Faltam receber">{atividade.faltamReceber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </LayoutShell>
  )
}
