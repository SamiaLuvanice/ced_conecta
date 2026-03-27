import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LayoutShell from '../components/LayoutShell'
import api from '../services/api'

export default function CriarAtividadePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editando = Boolean(id)
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    turma_id: '',
    data_entrega: '',
  })
  const [turmas, setTurmas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const carregar = async () => {
      setLoading(true)
      setError('')
      try {
        const [turmasRes, atividadeRes] = await Promise.all([
          api.get('/turmas'),
          editando ? api.get(`/atividades/${id}`) : Promise.resolve(null),
        ])

        const turmasData = turmasRes.data || []
        setTurmas(turmasData)

        if (editando && atividadeRes) {
          const atividade = atividadeRes.data
          setForm({
            titulo: atividade.titulo || '',
            descricao: atividade.descricao || '',
            turma_id: atividade.turma?.id || '',
            data_entrega: atividade.data_entrega ? atividade.data_entrega.slice(0, 10) : '',
          })
        } else if (turmasData.length) {
          setForm((prev) => ({ ...prev, turma_id: prev.turma_id || turmasData[0].id }))
        }
      } catch {
        setError('Nao foi possivel carregar os dados da atividade.')
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [editando, id])

  const tituloPagina = useMemo(() => (editando ? 'Editar atividade' : 'Criar atividade'), [editando])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editando) {
        await api.patch(`/atividades/${id}`, form)
      } else {
        await api.post('/atividades', form)
      }
      navigate('/professor/atividades')
    } catch {
      setError('Nao foi possivel salvar a atividade. Verifique os campos.')
    }
  }

  return (
    <LayoutShell title={tituloPagina}>
      <form className="card form-card" onSubmit={handleSubmit}>
        <label>
          Título
          <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required disabled={loading} />
        </label>
        <label>
          Descrição
          <textarea rows="5" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required disabled={loading} />
        </label>
        <label>
          Turma
          <select value={form.turma_id} onChange={(e) => setForm({ ...form, turma_id: Number(e.target.value) })} disabled={loading || !turmas.length}>
            {!turmas.length ? <option value="">Sem turmas cadastradas</option> : null}
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>{turma.nome}</option>
            ))}
          </select>
        </label>
        <label>
          Data de entrega
          <input type="date" value={form.data_entrega} onChange={(e) => setForm({ ...form, data_entrega: e.target.value })} required disabled={loading} />
          <small className="muted">Prazo final será 23:59 do dia selecionado.</small>
        </label>
        {error ? <div className="error-box">{error}</div> : null}
        <div className="actions-row">
          <button type="button" className="secondary-button" onClick={() => navigate('/professor/atividades')}>
            Cancelar
          </button>
          <button type="submit" disabled={loading || !form.turma_id}>{editando ? 'Salvar alteracoes' : 'Salvar atividade'}</button>
        </div>
      </form>
    </LayoutShell>
  )
}
