import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LayoutShell from '../components/LayoutShell'
import api from '../services/api'

export default function ProfessorRespostaDetalhePage() {
  const { id, respostaId } = useParams()
  const [resposta, setResposta] = useState(null)
  const [nota, setNota] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    const carregar = async () => {
      setLoading(true)
      setErro('')
      setSucesso('')
      try {
        const res = await api.get(`/atividades/${id}/respostas/`)
        const respostaEncontrada = (res.data || []).find((item) => String(item.id) === String(respostaId))

        if (!respostaEncontrada) {
          setErro('Resposta nao encontrada para esta atividade.')
          setResposta(null)
          return
        }

        setResposta(respostaEncontrada)
        setNota(respostaEncontrada.nota ?? '')
        setFeedback(respostaEncontrada.feedback ?? '')
      } catch {
        setErro('Nao foi possivel carregar os dados da resposta.')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [id, respostaId])

  const salvarCorrecao = async () => {
    if (!resposta) return

    setSaving(true)
    setErro('')
    setSucesso('')
    try {
      const payload = {
        feedback: feedback || '',
      }

      if (nota !== '') {
        payload.nota = nota
      }

      const res = await api.patch(`/respostas/${resposta.id}/`, payload)
      setResposta(res.data)
      setNota(res.data.nota ?? '')
      setFeedback(res.data.feedback ?? '')
      setSucesso('Correção salva com sucesso.')
    } catch {
      setErro('Não foi possivel salvar a correção.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <LayoutShell title="Detalhe da resposta">
      <div className="section-header">
        <Link className="ghost-button" to={`/professor/atividades/${id}/respostas`}>
          Voltar para respostas
        </Link>
      </div>

      {erro ? <p className="error-box">{erro}</p> : null}
      {sucesso ? <p className="info-box">{sucesso}</p> : null}

      {loading ? <div className="card form-card skeleton-block" aria-hidden="true" /> : null}

      {!loading && resposta ? (
        <article className="card response-card">
          <div className="activity-header">
            <div>
              <h3>{resposta.aluno_nome || '-'}</h3>
            </div>
            {resposta.nota !== null && resposta.nota !== undefined ? (
              <span className="badge corrigida">Nota {String(resposta.nota).replace('.', ',')}</span>
            ) : (
              <span className="badge respondida">Pendente</span>
            )}
          </div>

          <div className="correction-summary">
            <div className="correction-summary-item">
              <span className="muted">Status</span>
              <strong>{resposta.nota !== null && resposta.nota !== undefined ? 'Corrigida' : 'Pendente'}</strong>
            </div>
            <div className="correction-summary-item">
              <span className="muted">Data de envio</span>
              <strong>{new Date(resposta.enviada_em).toLocaleDateString('pt-BR')}</strong>
            </div>
            <div className="correction-summary-item">
              <span className="muted">Última atualização</span>
              <strong>{new Date(resposta.atualizada_em).toLocaleDateString('pt-BR')}</strong>
            </div>
          </div>

          <div>
            <h4 style={{ marginTop: 0, marginBottom: '8px' }}>Resposta do aluno</h4>
            <p style={{ margin: 0, lineHeight: '1.55' }}>{resposta.texto_resposta}</p>
          </div>

          <div className="inline-form response-correction-form">
            <label className="response-form-field">
              Nota
              <input
                className="nota-input"
                type="number"
                min="0"
                max="10"
                step="0.1"
                placeholder="0,0 a 10,0"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                disabled={saving}
              />
            </label>
            <label className="response-form-field">
              Feedback
              <textarea
                className="feedback-input"
                rows="1"
                placeholder="Escreva um feedback para o aluno"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={saving}
              />
            </label>
            <button className="save-correction-button" type="button" onClick={salvarCorrecao} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar correção'}
            </button>
          </div>
        </article>
      ) : null}
    </LayoutShell>
  )
}
