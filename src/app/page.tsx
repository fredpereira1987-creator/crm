'use client'

import { useEffect, useState } from 'react'
import { Users, CalendarCheck, TrendingUp, CheckSquare, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DashboardData {
  totalClients: number
  activeClients: number
  totalAttendances: number
  pendingTasks: number
  overdueTasks: number
  portfolioTotal: number
  recentAttendances: Array<{ id: string; subject: string; date: string; type: string; client: { id: string; name: string } }>
  upcomingTasks: Array<{ id: string; title: string; dueDate: string | null; priority: string; status: string; client: { id: string; name: string } | null }>
}

const PRIORITY_COLOR: Record<string, string> = {
  Alta: 'bg-red-100 text-red-700',
  Média: 'bg-yellow-100 text-yellow-700',
  Baixa: 'bg-green-100 text-green-700',
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setData)
  }, [])

  if (!data) return <div className="flex items-center justify-center h-full text-gray-400">Carregando...</div>

  const stats = [
    { label: 'Total de Clientes', value: data.totalClients, sub: `${data.activeClients} ativos`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Atendimentos', value: data.totalAttendances, sub: 'todos os registros', icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Patrimônio Total', value: formatCurrency(data.portfolioTotal), sub: 'sob assessoria', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Tarefas Pendentes', value: data.pendingTasks, sub: data.overdueTasks > 0 ? `${data.overdueTasks} atrasadas` : 'sem atraso', icon: data.overdueTasks > 0 ? AlertTriangle : CheckSquare, color: data.overdueTasks > 0 ? 'text-red-600' : 'text-orange-600', bg: data.overdueTasks > 0 ? 'bg-red-50' : 'bg-orange-50' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Visão geral da sua carteira</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
              <div className={`${bg} ${color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Últimos Atendimentos</h3>
            <Link href="/attendances" className="text-sm text-blue-600 hover:underline flex items-center gap-1">Ver todos <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentAttendances.length === 0 && (
              <p className="text-sm text-gray-400 p-6">Nenhum atendimento registrado.</p>
            )}
            {data.recentAttendances.map(a => (
              <div key={a.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.subject}</p>
                    <Link href={`/clients/${a.client.id}`} className="text-xs text-blue-600 hover:underline">{a.client.name}</Link>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a.type}</span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(a.date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Próximas Tarefas</h3>
            <Link href="/tasks" className="text-sm text-blue-600 hover:underline flex items-center gap-1">Ver todas <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.upcomingTasks.length === 0 && (
              <p className="text-sm text-gray-400 p-6">Nenhuma tarefa pendente.</p>
            )}
            {data.upcomingTasks.map(t => (
              <div key={t.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.title}</p>
                    {t.client && <Link href={`/clients/${t.client.id}`} className="text-xs text-blue-600 hover:underline">{t.client.name}</Link>}
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[t.priority] ?? 'bg-gray-100 text-gray-600'}`}>{t.priority}</span>
                    {t.dueDate && <p className="text-xs text-gray-400 mt-1">{formatDate(t.dueDate)}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
