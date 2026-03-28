import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LayoutShell from '../components/LayoutShell'
import api from '../services/api'

export default function ProfessorAtividadesPage() {
  const ITENS_POR_PAGINA = 9
  const [atividades, setAtividades] = useState([])
  const [turmaSelecionada, setTurmaSelecionada] = useState('todas')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api.get('/me/atividades')
      .then((res) => setAtividades(res.data))
      .catch(() => setErro('Nao foi possivel carregar as atividades.'))
  }, [])

  const turmasDisponiveis = [...new Map(
    atividades
      .filter((atividade) => atividade.turma?.id)
      .map((atividade) => [atividade.turma.id, atividade.turma]),
  ).values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  const atividadesFiltradas = turmaSelecionada === 'todas'
    ? atividades
    : atividades.filter((atividade) => String(atividade.turma?.id) === turmaSelecionada)

  const atividadesOrdenadas = [...atividadesFiltradas].sort(
    (a, b) => new Date(a.data_entrega) - new Date(b.data_entrega),
  )

  const totalPaginas = Math.max(1, Math.ceil(atividadesOrdenadas.length / ITENS_POR_PAGINA))
  const isPrimeiraPagina = paginaAtual <= 1
  const isUltimaPagina = paginaAtual >= totalPaginas
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
  const fim = inicio + ITENS_POR_PAGINA
  const atividadesPaginadas = atividadesOrdenadas.slice(inicio, fim)

  useEffect(() => {
    setPaginaAtual(1)
  }, [turmaSelecionada])

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas)
    }
  }, [paginaAtual, totalPaginas])

  const obterBadgeStatus = (status) => {
    if (status === 'prazo_encerrado') {
      return { className: 'prazo_encerrado', label: 'encerrada' }
    }

    if (!status || status === 'ativa' || status === 'aberta') {
      return { className: 'aberta', label: 'aberta' }
    }

    return { className: status, label: status.replaceAll('_', ' ') }
  }

  return (
    <LayoutShell title="Atividades">
      <section className="section-header activities-toolbar">
        <div className="section-tools toolbar-left">
          <div className="filter-group">
            <label htmlFor="filtro-turma" className="filter-label">Turma</label>
            <select
              id="filtro-turma"
              className="filter-select"
              value={turmaSelecionada}
              onChange={(e) => setTurmaSelecionada(e.target.value)}
            >
              <option value="todas">Todas as turmas</option>
              {turmasDisponiveis.map((turma) => (
                <option key={turma.id} value={String(turma.id)}>
                  {turma.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Link className="primary-link toolbar-create" to="/professor/atividades/nova"> Nova atividade</Link>
      </section>

      {!atividadesOrdenadas.length ? (
        <p className="info-box">Nenhuma atividade encontrada para a turma selecionada.</p>
      ) : null}
      {erro ? <p className="error-box">{erro}</p> : null}

      <div className="table-wrap">
        <table className="activities-table mobile-card-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Turma</th>
              <th>Entrega</th>
              <th className="status-column">Status</th>
            </tr>
          </thead>
          <tbody>
            {atividadesPaginadas.map((atividade) => {
              const statusBadge = obterBadgeStatus(atividade.status)

              return (
                <tr key={atividade.id}>
                  <td data-label="Título">
                    <Link className="table-title-link" to={`/professor/atividades/${atividade.id}`}>
                      {atividade.titulo}
                    </Link>
                  </td>
                  <td data-label="Turma">{atividade.turma?.nome || '-'}</td>
                  <td data-label="Entrega">{new Date(atividade.data_entrega).toLocaleDateString('pt-BR')}</td>
                  <td className="status-column" data-label="Status">
                    <span className={`badge ${statusBadge.className}`}>{statusBadge.label}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {atividadesOrdenadas.length ? (
        <div className="pagination">
          <button
            type="button"
            className="secondary-button"
            disabled={isPrimeiraPagina}
            onClick={() => setPaginaAtual((prev) => Math.max(1, prev - 1))}
          >
            Anterior
          </button>

          <div className="pagination-pages">
            {Array.from({ length: totalPaginas }).map((_, index) => {
              const pagina = index + 1
              return (
                <button
                  key={pagina}
                  type="button"
                  className={pagina === paginaAtual ? 'page-button active' : 'page-button'}
                  onClick={() => setPaginaAtual(pagina)}
                >
                  {pagina}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="secondary-button"
            disabled={isUltimaPagina}
            onClick={() => setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1))}
          >
            Próxima
          </button>
        </div>
      ) : null}
    </LayoutShell>
  )
}
