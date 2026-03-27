import { useEffect, useState } from 'react'
import LayoutShell from '../components/LayoutShell'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function AlunoDashboard() {
  const { user } = useAuth()
  const [atividades, setAtividades] = useState([])
  const [respostas, setRespostas] = useState([])

  useEffect(() => {
    api.get('/me/atividades').then((res) => setAtividades(res.data))
    api.get('/me/respostas').then((res) => setRespostas(res.data))
  }, [])

  const horaAtual = new Date().getHours()
  const saudacao = horaAtual < 12 ? 'Bom dia' : horaAtual < 18 ? 'Boa tarde' : 'Boa noite'

  const totalCorrigidas = respostas.filter((item) => item.nota !== null).length
  const totalRespondidas = respostas.length
  const totalAtividades = atividades.length
  const totalPendentesResposta = Math.max(totalAtividades - totalRespondidas, 0)
  const textoPendencias = totalPendentesResposta === 1
    ? 'atividade para responder'
    : 'atividades para responder'

  const percentualRespondidas = totalAtividades > 0
    ? Math.round((totalRespondidas / totalAtividades) * 100)
    : 0

  const percentualCorrigidas = totalAtividades > 0
    ? Math.round((totalCorrigidas / totalAtividades) * 100)
    : 0

  const acompanhamentoAluno = [
    {
      label: 'Atividades respondidas',
      valor: `${totalRespondidas} de ${totalAtividades}`,
      percentual: percentualRespondidas,
      cor: 'recebidas',
    },
    {
      label: 'Atividades corrigidas pelo professor',
      valor: `${totalCorrigidas} de ${totalAtividades}`,
      percentual: percentualCorrigidas,
      cor: 'corrigidas',
    },
  ]

  return (
    <LayoutShell title="Dashboard do aluno">
      <section className="dashboard-hero">
        <div>
          <h3>{saudacao}, {user?.nome || 'aluno(a)'}</h3>
          <p className="dashboard-hero-sub">
            Você tem <strong>{totalPendentesResposta}</strong> {textoPendencias}.
          </p>
        </div>
      </section>

      <section className="atividade-resumo-card-layout">
        <div className="atividade-card-header">
          <h3>Acompanhamento</h3>
        </div>

        <div className="table-wrap atividade-table-wrap">
          <table className="atividade-detalhe-table">
            <thead>
              <tr>
                <th className="atividade-table-label" scope="col">Indicador</th>
                <th className="atividade-table-value atividade-table-head-value" scope="col">Progresso</th>
              </tr>
            </thead>
            <tbody>
              {acompanhamentoAluno.map((item) => (
                <tr key={item.label}>
                  <td className="atividade-table-label">{item.label}</td>
                  <td className="atividade-table-value">
                    <div className="resposta-progress-row">
                      <strong className={`resposta-progress-value ${item.cor}`}>{item.valor}</strong>
                      <span className="resposta-progress-percentual">{item.percentual}%</span>
                    </div>
                    <div
                      className="resposta-progress-track"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={item.percentual}
                      aria-label={`${item.label}: ${item.percentual}%`}
                    >
                      <div className={`resposta-progress-fill ${item.cor}`} style={{ width: `${item.percentual}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </LayoutShell>
  )
}
