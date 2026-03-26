import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LayoutShell from '../components/LayoutShell'
import api from '../services/api'

export default function AlunoAtividadesPage() {
  const [atividades, setAtividades] = useState([])
  const [erro, setErro] = useState('')

  const obterStatusResposta = (atividade) => {
    if (atividade.status === 'corrigida') {
      return { className: 'corrigida', label: 'corrigida' }
    }

    if (atividade.minha_resposta_id || atividade.status === 'respondida') {
      return { className: 'respondida', label: 'respondida' }
    }

    return { className: 'nao_respondida', label: 'não respondida' }
  }

  const load = () => api.get('/me/atividades')
    .then((res) => setAtividades(res.data))
    .catch(() => setErro('Nao foi possivel carregar as atividades.'))

  useEffect(() => {
    load()
  }, [])

  return (
    <LayoutShell title="Atividades disponíveis">
      {erro ? <p className="error-box">{erro}</p> : null}

      {!atividades.length ? (
        <p className="info-box">Nenhuma atividade disponível no momento.</p>
      ) : null}

      <div className="table-wrap">
        <table className="activities-table">
          <thead>
            <tr>
              <th>Título da atividade</th>
              <th>Professor</th>
              <th>Data de entrega</th>
              <th className="status-column">Status</th>
            </tr>
          </thead>
          <tbody>
            {atividades.map((atividade) => {
              const statusResposta = obterStatusResposta(atividade)

              return (
                <tr key={atividade.id}>
                  <td>
                    <Link className="table-title-link" to={`/aluno/atividades/${atividade.id}`}>
                      {atividade.titulo}
                    </Link>
                  </td>
                  <td>{atividade.professor_nome || 'Professor(a)'}</td>
                  <td>{new Date(atividade.data_entrega).toLocaleDateString('pt-BR')}</td>
                  <td className="status-column">
                    <span className={`badge ${statusResposta.className}`}>{statusResposta.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </LayoutShell>
  )
}
