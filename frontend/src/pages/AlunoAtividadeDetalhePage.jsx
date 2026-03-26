import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LayoutShell from '../components/LayoutShell'
import api from '../services/api'

export default function AlunoAtividadeDetalhePage() {
  const { id } = useParams()
  const atividadeId = Number(id)

  const [atividade, setAtividade] = useState(null)
  const [minhaResposta, setMinhaResposta] = useState(null)
  const [respostaId, setRespostaId] = useState(null)
  const [textoResposta, setTextoResposta] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const bloqueadaPorFeedback = Boolean(minhaResposta?.feedback?.trim())

  useEffect(() => {
    const carregar = async () => {
      setLoading(true)
      setErro('')
      setMensagem('')

      try {
        const [resAtividades, resMinhasRespostas] = await Promise.all([
          api.get('/me/atividades'),
          api.get('/me/respostas'),
        ])

        const atividadeAtual = resAtividades.data.find((item) => item.id === atividadeId)
        if (!atividadeAtual) {
          setErro('Atividade não encontrada.')
          setAtividade(null)
          return
        }

        const minhaResposta = resMinhasRespostas.data.find((resposta) => resposta.atividade === atividadeId)

        setAtividade(atividadeAtual)
        setMinhaResposta(minhaResposta || null)
        setRespostaId(minhaResposta?.id || atividadeAtual.minha_resposta_id || null)
        setTextoResposta(minhaResposta?.texto_resposta || '')
      } catch {
        setErro('Nao foi possivel carregar os detalhes da atividade.')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [atividadeId])

  const salvarResposta = async () => {
    setMensagem('')
    setErro('')
    setSaving(true)

    try {
      if (respostaId) {
        const res = await api.patch(`/respostas/${respostaId}/`, {
          texto_resposta: textoResposta,
        })
        setMinhaResposta(res.data)
      } else {
        const res = await api.post('/respostas', {
          atividade: atividadeId,
          texto_resposta: textoResposta,
        })
        setRespostaId(res.data.id)
        setMinhaResposta((prev) => ({
          ...prev,
          id: res.data.id,
          atividade: atividadeId,
          texto_resposta: textoResposta,
          nota: null,
          feedback: '',
        }))
      }

      setMensagem('Resposta salva com sucesso.')
    } catch (err) {
      setErro(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Nao foi possivel salvar a resposta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <LayoutShell title="Atividade">
      <div className="atividade-topbar">
        <Link className="ghost-button" to="/aluno/atividades">Voltar para atividades</Link>
      </div>

      {erro ? <p className="error-box">{erro}</p> : null}
      {mensagem ? <p className="info-box">{mensagem}</p> : null}
      {loading ? <div className="card form-card skeleton-block" aria-hidden="true" /> : null}

      {!loading && atividade ? (
        <div className="atividade-detalhe-layout">
          <section className="atividade-info-card">
            <div className="atividade-card-header">
              <h3>Informações da atividade</h3>
            </div>

            <div className="table-wrap atividade-table-wrap">
              <table className="atividade-detalhe-table">
                <tbody>
                  <tr>
                    <td className="atividade-table-label">Título</td>
                    <td className="atividade-table-value">{atividade.titulo}</td>
                  </tr>
                  <tr>
                    <td className="atividade-table-label">Professor</td>
                    <td className="atividade-table-value">{atividade.professor_nome || 'Professor(a)'}</td>
                  </tr>
                  <tr>
                    <td className="atividade-table-label">Turma</td>
                    <td className="atividade-table-value">{atividade.turma?.nome || '-'}</td>
                  </tr>
                  <tr>
                    <td className="atividade-table-label">Data de entrega</td>
                    <td className="atividade-table-value">{new Date(atividade.data_entrega).toLocaleString('pt-BR')}</td>
                  </tr>
                  <tr>
                    <td className="atividade-table-label">Descrição</td>
                    <td className="atividade-table-value">{atividade.descricao || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="card form-card">
            <h3 style={{ marginTop: 0 }}>Sua resposta</h3>
            {bloqueadaPorFeedback ? (
              <p className="info-box" style={{ marginTop: 0 }}>
                Sua resposta está bloqueada para edição porque o professor já enviou feedback.
              </p>
            ) : null}
            <div className="response-editor">
              <textarea
                rows="7"
                placeholder="Digite sua resposta"
                value={textoResposta}
                onChange={(e) => setTextoResposta(e.target.value)}
                disabled={bloqueadaPorFeedback}
              />
              <button type="button" onClick={salvarResposta} disabled={saving || !textoResposta.trim() || bloqueadaPorFeedback}>
                {saving ? 'Salvando...' : respostaId ? 'Salvar edição' : 'Enviar resposta'}
              </button>
            </div>
          </section>

          <section className="card form-card">
            <h3 style={{ marginTop: 0 }}>Retorno do professor</h3>

            {minhaResposta?.nota != null ? (
              <div className="inline-form">
                <p className="muted" style={{ margin: 0 }}>
                  Nota atribuída: <strong>{minhaResposta.nota}</strong>
                </p>
                <div className="atividade-table-wrap" style={{ border: '1px solid rgba(20, 67, 76, 0.12)', borderRadius: '12px', padding: '12px', background: '#f8fcfc' }}>
                  <p style={{ margin: 0, color: '#1f324f', lineHeight: '1.5' }}>
                    {minhaResposta.feedback?.trim() ? minhaResposta.feedback : 'Sem feedback escrito pelo professor.'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="info-box" style={{ margin: 0 }}>
                Sua resposta ainda não foi corrigida pelo professor.
              </p>
            )}
          </section>
        </div>
      ) : null}
    </LayoutShell>
  )
}
