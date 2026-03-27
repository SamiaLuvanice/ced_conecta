import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DeadlineIcon
} from '../components/DashboardIcons'
import LayoutShell from '../components/LayoutShell'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function ProfessorDashboard() {
  const { user } = useAuth()
  const [atividades, setAtividades] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const carregar = async () => {
      setLoading(true)
      setErro('')
      try {
        const res = await api.get('/me/atividades')
        setAtividades(res.data)
      } catch {
        setErro('Nao foi possivel carregar o dashboard agora. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [])

  const agora = new Date()

  const horaAtual = agora.getHours()
  const saudacao = horaAtual < 12 ? 'Bom dia' : horaAtual < 18 ? 'Boa tarde' : 'Boa noite'

  const totalPendentesCorrecao = atividades.reduce(
    (acc, atividade) => acc + (atividade.total_pendentes_correcao || 0),
    0,
  )

  const atividadesVencendo48h = atividades.filter((atividade) => {
    const prazo = new Date(atividade.data_entrega)
    const limite48h = new Date(agora.getTime() + (48 * 60 * 60 * 1000))
    return prazo >= agora && prazo <= limite48h
  }).length

  const textoPendencias = totalPendentesCorrecao === 1
    ? 'pendência de correção'
    : 'pendências de correção'

  const textoAtividades = atividadesVencendo48h === 1
    ? 'atividade vencendo nas próximas 48h'
    : 'atividades vencendo nas próximas 48h'

  const atividadeFoco = [...atividades]
    .filter((atividade) => (atividade.total_pendentes_correcao || 0) > 0)
    .sort((a, b) => {
      const prazoA = new Date(a.data_entrega)
      const prazoB = new Date(b.data_entrega)
      if (+prazoA !== +prazoB) return prazoA - prazoB
      const pendA = a.total_pendentes_correcao || 0
      const pendB = b.total_pendentes_correcao || 0
      return pendB - pendA
    })[0]

  const classeUrgencia = (pendentes) => {
    if (pendentes >= 4) return 'high'
    if (pendentes >= 2) return 'medium'
    return 'low'
  }

  const calcularPercentualCorrigido = (atividadeFoco) => {
    if (!atividadeFoco) return 0
    const total = atividadeFoco.total_respostas || 0
    const pendentes = atividadeFoco.total_pendentes_correcao || 0
    if (total === 0) return 0
    return Math.round(((total - pendentes) / total) * 100)
  }

  return (
    <LayoutShell title="Dashboard do professor">
      <section className="dashboard-hero">
        <div>
          <h3>{saudacao}, {user?.nome || 'professor(a)'}</h3>
          <p className="dashboard-hero-sub">
            Você tem <strong>{loading ? '...' : totalPendentesCorrecao}</strong> {textoPendencias} e{' '}
            <strong>{loading ? '...' : atividadesVencendo48h}</strong> {textoAtividades}.
          </p>
        </div>
      </section>

      {erro ? <p className="error-box">{erro}</p> : null}

      <section className="dashboard-duo">
        <div className="dashboard-pane">
          <section className="section-header">
            <h3>Ações rápidas</h3>
          </section>
          <div className="actions-grid">
            <Link className="primary-link" to="/professor/atividades/nova">
              Nova atividade
            </Link>
            <Link
              className="secondary-link"
              to="/professor/atividades"
            >
              Corrigir pendentes
            </Link>
            <Link className="secondary-link" to="/professor/turmas">
              Ver minhas turmas
            </Link>
          </div>
        </div>

        <div className="dashboard-pane">
          <section className="section-header">
            <h3>Foco do dia</h3>
          </section>

          {loading ? <p className="info-text">Carregando prioridades...</p> : null}

          {!loading && !atividadeFoco ? (
            <p className="info-box">Tudo corrigido por enquanto. Nenhuma pendência de correção.</p>
          ) : null}

          {!loading && atividadeFoco ? (
            <div className="foco-layout">
              <article
                className={`card atividade-prioridade foco-principal ${classeUrgencia(atividadeFoco.total_pendentes_correcao || 0)}`}
              >
                <div className="prioridade-corpo">
                  <div className="prioridade-topo">
                    <h4>{atividadeFoco.titulo}</h4>
                    <div className="prioridade-meta">
                      <span className="response-badge pending prioridade-badge">
                        {atividadeFoco.total_pendentes_correcao || 0} pendentes
                      </span>
                      <span className="prioridade-chip">
                        <strong>Turma:</strong> {atividadeFoco.turma?.nome || '-'}
                      </span>
                      <span className="prioridade-chip">
                        <DeadlineIcon size={14} />
                        {new Date(atividadeFoco.data_entrega).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="prioridade-progress">
                    <div className="prioridade-progress-label">
                      <span>Progresso de correção</span>
                      <strong>{calcularPercentualCorrigido(atividadeFoco)}%</strong>
                    </div>
                    <div className="prioridade-progress-track">
                      <div
                        className={`prioridade-progress-fill ${classeUrgencia(atividadeFoco.total_pendentes_correcao || 0)}`}
                        style={{
                          width: `${calcularPercentualCorrigido(atividadeFoco)}%`,
                        }}
                      />
                    </div>
                  </div>

                </div>
              </article>
            </div>
          ) : null}
        </div>
      </section>
    </LayoutShell>
  )
}
