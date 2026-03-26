import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import LayoutShell from '../components/LayoutShell'
import api from '../services/api'

export default function ProfessorAtividadeDetalhePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [atividade, setAtividade] = useState(null)
  const [totalAlunosTurma, setTotalAlunosTurma] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const carregar = async () => {
      setLoading(true)
      setErro('')
      try {
        const [resAtividade, resTurmas] = await Promise.all([
          api.get(`/atividades/${id}`),
          api.get('/me/turmas'),
        ])

        setAtividade(resAtividade.data)
        const turmaAtividadeId = resAtividade.data.turma?.id
        const turmaDaAtividade = resTurmas.data.find((turma) => turma.id === turmaAtividadeId)
        setTotalAlunosTurma(turmaDaAtividade?.alunos_count || 0)
      } catch {
        setErro('Nao foi possivel carregar os detalhes da atividade.')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [id])

  const excluirAtividade = async () => {
    const confirmar = window.confirm('Deseja realmente excluir esta atividade?')
    if (!confirmar) return

    try {
      await api.delete(`/atividades/${id}`)
      navigate('/professor/atividades')
    } catch {
      setErro('Nao foi possivel excluir a atividade.')
    }
  }

  const totalRespostas = atividade?.total_respostas || 0
  const totalCorrigidas = atividade?.total_corrigidas || 0
  const totalPendentes = atividade?.total_pendentes_correcao || 0
  const respostasFaltantes = Math.max(totalAlunosTurma - totalRespostas, 0)

  const percentualTurma = (valor) => {
    if (totalAlunosTurma <= 0) return 0
    return Math.round((valor / totalAlunosTurma) * 100)
  }

  const percentualRespostas = (valor) => {
    if (totalRespostas <= 0) return 0
    return Math.round((valor / totalRespostas) * 100)
  }

  const acompanhamentoRespostas = [
    {
      label: 'Respostas recebidas',
      valor: totalRespostas,
      percentual: percentualTurma(totalRespostas),
      cor: 'recebidas',
    },
    {
      label: 'Respostas faltantes',
      valor: respostasFaltantes,
      percentual: percentualTurma(respostasFaltantes),
      cor: 'faltantes',
    },
    {
      label: 'Pendentes de correção',
      valor: totalPendentes,
      percentual: percentualRespostas(totalPendentes),
      cor: 'pendentes',
    },
    {
      label: 'Respostas corrigidas',
      valor: totalCorrigidas,
      percentual: percentualRespostas(totalCorrigidas),
      cor: 'corrigidas',
    },
  ]

  return (
    <LayoutShell title="Atividades">
      {erro ? <p className="error-box">{erro}</p> : null}

      {loading ? <div className="card form-card skeleton-block" aria-hidden="true" /> : null}

      {!loading && atividade ? (
        <div className="atividade-detalhe-layout">
          <div className="atividade-topbar">
            <Link className="ghost-button" to="/professor/atividades">Voltar para atividades</Link>
            <div className="atividade-acoes-top">
              <Link className="secondary-link" to={`/professor/atividades/${atividade.id}/respostas`}>
                Ver respostas
              </Link>
              <Link className="secondary-link" to={`/professor/atividades/${atividade.id}/editar`}>
                Editar
              </Link>
              <button type="button" className="secondary-button danger-button" onClick={excluirAtividade}>
                Excluir
              </button>
            </div>
          </div>

          <div className="atividade-detalhe-grid">
            <section className="atividade-info-card">
              <div className="atividade-card-header">
                <h3>Informações da atividade</h3>
              </div>

              <div className="table-wrap atividade-table-wrap">
                <table className="atividade-detalhe-table">
                  <tbody>
                    <tr>
                      <td className="atividade-table-label">Atividade</td>
                      <td className="atividade-table-value">
                        <h3 style={{ margin: 0, marginBottom: '4px' }}>{atividade.titulo}</h3>
                        <span className={`badge ${atividade.status || ''}`} style={{ display: 'inline-block' }}>
                          {atividade.status || 'ativa'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="atividade-table-label">Turma</td>
                      <td className="atividade-table-value">{atividade.turma?.nome || '-'}</td>
                    </tr>
                    <tr>
                      <td className="atividade-table-label">Descrição</td>
                      <td className="atividade-table-value">
                        <p style={{ margin: 0, color: '#1f324f', lineHeight: '1.55' }}>
                          {atividade.descricao}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td className="atividade-table-label">Data de entrega</td>
                      <td className="atividade-table-value">
                        {new Date(atividade.data_entrega).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                    <tr>
                      <td className="atividade-table-label">Total de alunos</td>
                      <td className="atividade-table-value">{totalAlunosTurma}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="atividade-resumo-card-layout">
              <div className="atividade-card-header">
                <h3>Acompanhamento das respostas</h3>
              </div>

              <div className="table-wrap atividade-table-wrap">
                <table className="atividade-detalhe-table">
                  <thead>
                    <tr>
                      <th className="atividade-table-label" scope="col">Indicador</th>
                      <th className="atividade-table-value atividade-table-head-value" scope="col">Valor e progresso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acompanhamentoRespostas.map((item) => (
                      <tr key={item.label}>
                        <td className="atividade-table-label">{item.label}</td>
                        <td className="atividade-table-value">
                          <div className="resposta-progress-row">
                            <strong className={`resposta-progress-value ${item.cor}`}>{item.valor}</strong>
                            <span className="resposta-progress-percentual">{item.percentual}%</span>
                          </div>
                          <div className="resposta-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.percentual} aria-label={`${item.label}: ${item.percentual}%`}>
                            <div className={`resposta-progress-fill ${item.cor}`} style={{ width: `${item.percentual}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </LayoutShell>
  )
}
