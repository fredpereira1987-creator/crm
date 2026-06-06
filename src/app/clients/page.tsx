'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, User } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  investorProfile: string
  relationship: string
  patrimony: number | null
  _count: { attendances: number; tasks: number; portfolioItems: number }
}

const PROFILE_COLOR: Record<string, string> = {
  Conservador: 'bg-blue-100 text-blue-700',
  Moderado: 'bg-yellow-100 text-yellow-700',
  Arrojado: 'bg-orange-100 text-orange-700',
  Agressivo: 'bg-red-100 text-red-700',
}

const REL_COLOR: Record<string, string> = {
  Ativo: 'bg-green-100 text-green-700',
  Inativo: 'bg-gray-100 text-gray-600',
  Prospecto: 'bg-purple-100 text-purple-700',
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients)
  }, [])

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    const matchFilter = filter === 'Todos' || c.relationship === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-500 mt-1">{clients.length} clientes cadastrados</p>
        </div>
        <Link href="/clients/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {['Todos', 'Ativo', 'Inativo', 'Prospecto'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <User className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">Nenhum cliente encontrado</p>
            <p className="text-sm mt-1">
              {clients.length === 0 ? 'Cadastre seu primeiro cliente' : 'Tente ajustar os filtros'}
            </p>
            {clients.length === 0 && (
              <Link href="/clients/new" className="mt-4 text-blue-600 text-sm hover:underline">Cadastrar cliente</Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Perfil</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Patrimônio</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Atendimentos</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Tarefas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(client => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/clients/${client.id}`} className="hover:text-blue-600">
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{client.email ?? client.phone ?? '—'}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${PROFILE_COLOR[client.investorProfile] ?? 'bg-gray-100 text-gray-600'}`}>
                      {client.investorProfile}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${REL_COLOR[client.relationship] ?? 'bg-gray-100 text-gray-600'}`}>
                      {client.relationship}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {client.patrimony != null ? formatCurrency(client.patrimony) : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{client._count.attendances}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{client._count.tasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
