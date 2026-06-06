'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Plus, CalendarCheck, TrendingUp, CheckSquare, User } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Client {
  id: string; name: string; email: string | null; phone: string | null; cpf: string | null
  investorProfile: string; relationship: string; patrimony: number | null; monthlyIncome: number | null
  city: string | null; state: string | null; notes: string | null
  attendances: Attendance[]; portfolioItems: PortfolioItem[]; tasks: Task[]
}
interface Attendance { id: string; date: string; type: string; subject: string; description: string | null; outcome: string | null }
interface PortfolioItem { id: string; product: string; category: string; value: number; targetAlloc: number | null; institution: string | null }
interface Task { id: string; title: string; dueDate: string | null; priority: string; status: string; category: string }

const TABS = ['Resumo', 'Atendimentos', 'Carteira', 'Tarefas']
const ATT_TYPES = ['Reunião', 'Ligação', 'Email', 'WhatsApp', 'Presencial']
const CATEGORIES = ['Renda Fixa', 'Renda Variável', 'FII', 'Fundos', 'Tesouro Direto', 'Cripto', 'Previdência', 'Outro']
const PRIORITY_COLOR: Record<string, string> = { Alta: 'bg-red-100 text-red-700', Média: 'bg-yellow-100 text-yellow-700', Baixa: 'bg-green-100 text-green-700' }
const STATUS_COLOR: Record<string, string> = { Pendente: 'bg-orange-100 text-orange-700', 'Em andamento': 'bg-blue-100 text-blue-700', Concluída: 'bg-green-100 text-green-700', Cancelada: 'bg-gray-100 text-gray-500' }

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [tab, setTab] = useState('Resumo')
  const [showAttForm, setShowAttForm] = useState(false)
  const [showPortForm, setShowPortForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [attForm, setAttForm] = useState({ type: 'Reunião', subject: '', description: '', outcome: '', date: new Date().toISOString().split('T')[0] })
  const [portForm, setPortForm] = useState({ product: '', category: 'Renda Fixa', value: '', institution: '', targetAlloc: '' })
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'Média', category: 'Follow-up' })

  const load = useCallback(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(setClient)
  }, [id])

  useEffect(() => { load() }, [load])

  if (!client) return <div className="flex items-center justify-center h-full text-gray-400">Carregando...</div>

  const totalPortfolio = client.portfolioItems.reduce((s, i) => s + i.value, 0)

  const addAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/attendances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...attForm, clientId: id, date: new Date(attForm.date).toISOString() }) })
    setShowAttForm(false)
    setAttForm({ type: 'Reunião', subject: '', description: '', outcome: '', date: new Date().toISOString().split('T')[0] })
    load()
  }

  const addPortfolio = async (e: React.FormEvent) => {
    e.preventDefault()
    const body: Record<string, unknown> = { ...portForm, clientId: id, value: parseFloat(portForm.value) }
    if (portForm.targetAlloc) body.targetAlloc = parseFloat(portForm.targetAlloc)
    else delete body.targetAlloc
    await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setShowPortForm(false)
    setPortForm({ product: '', category: 'Renda Fixa', value: '', institution: '', targetAlloc: '' })
    load()
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    const body: Record<string, unknown> = { ...taskForm, clientId: id, status: 'Pendente' }
    if (!taskForm.dueDate) delete body.dueDate
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setShowTaskForm(false)
    setTaskForm({ title: '', description: '', dueDate: '', priority: 'Média', category: 'Follow-up' })
    load()
  }

  const deleteClient = async () => {
    if (!confirm(`Excluir ${client.name}? Esta ação não pode ser desfeita.`)) return
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    router.push('/clients')
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  const deletePortfolioItem = async (itemId: string) => {
    await fetch(`/api/portfolio/${itemId}`, { method: 'DELETE' })
    load()
  }

  const deleteAttendance = async (attId: string) => {
    await fetch(`/api/attendances/${attId}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/clients" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{client.city && client.state ? `${client.city}, ${client.state}` : client.email ?? ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${id}/edit`} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Edit className="w-4 h-4" /> Editar
          </Link>
          <button onClick={deleteClient} className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-medium">
            <Trash2 className="w-4 h-4" /> Excluir
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
        ))}
      </div>

      {tab === 'Resumo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Dados Pessoais</h3>
            <dl className="space-y-3">
              {[
                ['Email', client.email], ['Telefone', client.phone], ['CPF', client.cpf],
                ['Cidade', client.city && client.state ? `${client.city} - ${client.state}` : client.city],
              ].map(([label, value]) => value && (
                <div key={label as string} className="flex justify-between text-sm">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="text-gray-900 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Perfil Financeiro</h3>
            <dl className="space-y-3">
              {[
                ['Perfil Investidor', client.investorProfile],
                ['Status', client.relationship],
                ['Patrimônio', client.patrimony != null ? formatCurrency(client.patrimony) : null],
                ['Renda Mensal', client.monthlyIncome != null ? formatCurrency(client.monthlyIncome) : null],
                ['Em Carteira', formatCurrency(totalPortfolio)],
              ].map(([label, value]) => value && (
                <div key={label as string} className="flex justify-between text-sm">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="text-gray-900 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {client.notes && (
            <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Observações</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'Atendimentos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{client.attendances.length} atendimentos registrados</p>
            <button onClick={() => setShowAttForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4" /> Registrar Atendimento
            </button>
          </div>
          {showAttForm && (
            <form onSubmit={addAttendance} className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-900">Novo Atendimento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={attForm.type} onChange={e => setAttForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {ATT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input type="date" value={attForm.date} onChange={e => setAttForm(f => ({ ...f, date: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assunto *</label>
                  <input required value={attForm.subject} onChange={e => setAttForm(f => ({ ...f, subject: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Revisão de carteira Q1" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea rows={3} value={attForm.description} onChange={e => setAttForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Próximos Passos / Resultado</label>
                  <textarea rows={2} value={attForm.outcome} onChange={e => setAttForm(f => ({ ...f, outcome: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Salvar</button>
                <button type="button" onClick={() => setShowAttForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              </div>
            </form>
          )}
          {client.attendances.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a.type}</span>
                    <span className="text-xs text-gray-400">{formatDate(a.date)}</span>
                  </div>
                  <p className="font-medium text-gray-900">{a.subject}</p>
                  {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
                  {a.outcome && <p className="text-sm text-blue-600 mt-2 italic">→ {a.outcome}</p>}
                </div>
                <button onClick={() => deleteAttendance(a.id)} className="text-gray-300 hover:text-red-500 ml-4"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {client.attendances.length === 0 && !showAttForm && (
            <div className="text-center py-12 text-gray-400"><CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Nenhum atendimento registrado</p></div>
          )}
        </div>
      )}

      {tab === 'Carteira' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Total em carteira: <span className="font-semibold text-gray-900">{formatCurrency(totalPortfolio)}</span></p>
            <button onClick={() => setShowPortForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4" /> Adicionar Produto
            </button>
          </div>
          {showPortForm && (
            <form onSubmit={addPortfolio} className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-900">Novo Produto</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
                  <input required value={portForm.product} onChange={e => setPortForm(f => ({ ...f, product: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: CDB XP 110% CDI" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select value={portForm.category} onChange={e => setPortForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                  <input value={portForm.institution} onChange={e => setPortForm(f => ({ ...f, institution: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="XP, BTG, Rico..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Aplicado (R$) *</label>
                  <input required type="number" value={portForm.value} onChange={e => setPortForm(f => ({ ...f, value: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alocação Alvo (%)</label>
                  <input type="number" value={portForm.targetAlloc} onChange={e => setPortForm(f => ({ ...f, targetAlloc: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 20" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Salvar</button>
                <button type="button" onClick={() => setShowPortForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              </div>
            </form>
          )}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {client.portfolioItems.length === 0 && !showPortForm ? (
              <div className="text-center py-12 text-gray-400"><TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Nenhum produto cadastrado</p></div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Produto</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Categoria</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Instituição</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Valor</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">% Carteira</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {client.portfolioItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{item.product}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{item.category}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{item.institution ?? '—'}</td>
                      <td className="px-5 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.value)}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 text-right">
                        {totalPortfolio > 0 ? `${((item.value / totalPortfolio) * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => deletePortfolioItem(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'Tarefas' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{client.tasks.filter(t => t.status === 'Pendente').length} tarefas pendentes</p>
            <button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4" /> Nova Tarefa
            </button>
          </div>
          {showTaskForm && (
            <form onSubmit={addTask} className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-900">Nova Tarefa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input required value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select value={taskForm.category} onChange={e => setTaskForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {['Follow-up', 'Reunião', 'Proposta', 'Revisão', 'Geral'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {['Alta', 'Média', 'Baixa'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Salvar</button>
                <button type="button" onClick={() => setShowTaskForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              </div>
            </form>
          )}
          <div className="space-y-2">
            {client.tasks.map(task => (
              <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                <input type="checkbox" checked={task.status === 'Concluída'} onChange={() => updateTaskStatus(task.id, task.status === 'Concluída' ? 'Pendente' : 'Concluída')} className="w-4 h-4 rounded cursor-pointer" />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.status === 'Concluída' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{task.category}</span>
                    {task.dueDate && <span className="text-xs text-gray-400">· {formatDate(task.dueDate)}</span>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[task.status]}`}>{task.status}</span>
              </div>
            ))}
            {client.tasks.length === 0 && !showTaskForm && (
              <div className="text-center py-12 text-gray-400"><CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Nenhuma tarefa</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
