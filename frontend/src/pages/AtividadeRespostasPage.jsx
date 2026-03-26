import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LayoutShell from '../components/LayoutShell'
import ResponseCard from '../components/ResponseCard'
import api from '../services/api'

export default function AtividadeRespostasPage() {
  const { id } = useParams()
  const [respostas, setRespostas] = useState([])
  const [nota, setNota] = useState({})
  const [feedback, setFeedback] = useState({})

  const load = () => api.get(`/atividades/${id}/respostas/`).then((res) => setRespostas(res.data))

  useEffect(() => {
    load()
  }, [id])

  const salvarCorrecao = async (respostaId) => {
    await api.patch(`/respostas/${respostaId}/`, {
      nota: nota[respostaId],
      feedback: feedback[respostaId] || '',
    })
    load()
  }

  return (
    <LayoutShell title="Respostas da atividade">
      <div className="section-header">
        <Link className="ghost-button" to={`/professor/atividades/${id}`}>
          Voltar
        </Link>
      </div>

      <div className="list-grid">
        {respostas.map((resposta) => (
          <ResponseCard key={resposta.id} resposta={resposta}>
            <div className="inline-form">
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="Nota"
                value={nota[resposta.id] ?? resposta.nota ?? ''}
                onChange={(e) => setNota({ ...nota, [resposta.id]: e.target.value })}
              />
              <input
                type="text"
                placeholder="Feedback"
                value={feedback[resposta.id] ?? resposta.feedback ?? ''}
                onChange={(e) => setFeedback({ ...feedback, [resposta.id]: e.target.value })}
              />
              <button type="button" onClick={() => salvarCorrecao(resposta.id)}>Salvar correção</button>
            </div>
          </ResponseCard>
        ))}
      </div>
    </LayoutShell>
  )
}
