export default function ResponseCard({ resposta, children }) {
  return (
    <div className="card response-card">
      <div className="activity-header">
        <div>
          <h3>{resposta.aluno_nome || resposta.atividade_titulo}</h3>
          <p className="muted">Atualizada em {new Date(resposta.atualizada_em).toLocaleString('pt-BR')}</p>
        </div>
        {resposta.nota !== null && resposta.nota !== undefined ? (
          <span className="badge corrigida">Nota {String(resposta.nota).replace('.', ',')}</span>
        ) : (
          <span className="badge respondida">Pendente</span>
        )}
      </div>
      <p>{resposta.texto_resposta}</p>
      {resposta.feedback ? <p><strong>Feedback:</strong> {resposta.feedback}</p> : null}
      <div className="actions-row">{children}</div>
    </div>
  )
}
