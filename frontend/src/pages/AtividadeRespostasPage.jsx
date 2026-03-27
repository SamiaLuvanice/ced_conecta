import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LayoutShell from '../components/LayoutShell'
import api from '../services/api'

export default function AtividadeRespostasPage() {
  const { id } = useParams()
  const [respostas, setRespostas] = useState([])
  const [erro, setErro] = useState('')

  const load = () => {
    setErro('')
    api.get(`/atividades/${id}/respostas/`)
      .then((res) => setRespostas(res.data))
      .catch(() => setErro('Não foi possivel carregar as respostas da atividade.'))
  }

  useEffect(() => {
    load()
  }, [id])

  const obterStatusResposta = (resposta) => {
    if (resposta.nota !== null && resposta.nota !== undefined) {
      return { className: 'corrigida', label: 'corrigida' }
    }
    return { className: 'respondida', label: 'pendente' }
  }

  return (
    <LayoutShell title="Respostas da atividade">
      <div className="section-header">
        <Link className="ghost-button" to={`/professor/atividades/${id}`}>
          Voltar
        </Link>
      </div>

      {erro ? <p className="error-box">{erro}</p> : null}
      {!erro && !respostas.length ? <p className="info-box">Nenhuma resposta enviada ainda.</p> : null}

      {respostas.length ? (
        <div className="table-wrap">
          <table className="activities-table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Enviada em</th>
                <th className="status-column">Nota</th>
                <th className="status-column">Status</th>
                <th className="status-column">Ação</th>
              </tr>
            </thead>
            <tbody>
              {respostas.map((resposta) => {
                const status = obterStatusResposta(resposta)
                return (
                  <tr key={resposta.id}>
                    <td>
                      <Link className="table-title-link" to={`/professor/atividades/${id}/respostas/${resposta.id}`}>
                        {resposta.aluno_nome || '-'}
                      </Link>
                    </td>
                    <td>{new Date(resposta.enviada_em).toLocaleString('pt-BR')}</td>
                    <td className="status-column">
                      {resposta.nota !== null && resposta.nota !== undefined
                        ? String(resposta.nota).replace('.', ',')
                        : '-'}
                    </td>
                    <td className="status-column">
                      <span className={`badge ${status.className}`}>{status.label}</span>
                    </td>
                    <td className="status-column">
                      <Link className="secondary-link" to={`/professor/atividades/${id}/respostas/${resposta.id}`}>
                        Ver resposta
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </LayoutShell>
  )
}
