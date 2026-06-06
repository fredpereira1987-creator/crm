'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, CheckSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Task {
  id: string; title: string; description: string | null; dueDate: string | null
  priority: string; status: string; category: string
  client: { id: string; name: string } | null
}

const PRIORITY_COLOR: Record<string, string> = { Alta: 'bg-red-100 text-red-700', Média: 'bg-yellow-100 text-yellow-700', Baixa: 'bg-green-100 text-green-700' }
const STATUS_COLOR: Record<string, string> = { Pendente: 'bg-orange-100 text-orange-700', 'Em andamento': 'bg-blue-100 text-blue-700', Concluída: 'bg-green-100 text-green-700', Cancelada: 'bg-gray-100 text-gray-500' }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [statusFilter, setStatusFilter] = useState('Ativas')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'Média', category: 'Geral', status: 'Pendente' })

  const load = () => fetch('/api/tasks').then(r => r.json()).then(setTasks)
  useEffect(() => { load() }, [])

  const filtered = tasks.filter(t => {
    if (statusFilter === 'Ativas') return t.status === 'Pendente' || t.status === 'Em andamento'
    if (statusFilter === 'Concluídas') return t.status === 'Concluída'
    return true
  })

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    const body: Record<string, unknown> = { ...form }
    if (!form.dueDate) delete body.dueDate
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setShowForm(false)
    setForm({ title: '', description: '', dueDate: '', priority: 'Média', category: 'Geral', status: 'Pendente' })
    load()
  }

  const now = new Date()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tarefas</h2>
          <p className="text-gray-500 mt-1">{tasks.filter(t => t.status === 'Pendente' || t.status === 'Em andamento').length} tarefas ativas</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['Ativas', 'Concluídas', 'Todas'].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={createTask} className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm mb-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Nova Tarefa</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['Follow-up', 'Reunião', 'Proposta', 'Revisão', 'Geral'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['Alta', 'Média', 'Baixa'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Salvar</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhuma tarefa encontrada</p>
          </div>
        )}
        {filtered.map(task => {
          const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'Concluída'
          return (
            <div key={task.id} className={`bg-white rounded-xl border p-4 shadow-sm flex items-center gap-4 ${isOverdue ? 'border-red-200' : 'border-gray-200'}`}>
              <input type="checkbox" checked={task.status === 'Concluída'} onChange={() => updateStatus(task.id, task.status === 'Concluída' ? 'Pendente' : 'Concluída')} className="w-4 h-4 rounded cursor-pointer" />
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.status === 'Concluída' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{task.category}</span>
                  {task.client && <><span className="text-xs text-gray-300">·</span><Link href={`/clients/${task.client.id}`} className="text-xs text-blue-600 hover:underline">{task.client.name}</Link></>}
                  {task.dueDate && <><span className="text-xs text-gray-300">·</span><span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>{isOverdue ? 'Atrasada: ' : ''}{formatDate(task.dueDate)}</span></>}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[task.status]}`}>{task.status}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
