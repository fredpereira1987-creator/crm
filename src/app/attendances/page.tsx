'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Attendance {
  id: string; date: string; type: string; subject: string; description: string | null; outcome: string | null
  client: { id: string; name: string }
}

const TYPE_COLOR: Record<string, string> = {
  Reunião: 'bg-blue-100 text-blue-700', Ligação: 'bg-green-100 text-green-700',
  Email: 'bg-purple-100 text-purple-700', WhatsApp: 'bg-emerald-100 text-emerald-700',
  Presencial: 'bg-orange-100 text-orange-700'
}

export default function AttendancesPage() {
  const [items, setItems] = useState<Attendance[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/attendances').then(r => r.json()).then(setItems)
  }, [])

  const filtered = items.filter(a =>
    a.subject.toLowerCase().includes(search.toLowerCase()) ||
    a.client.name.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Atendimentos</h2>
        <p className="text-gray-500 mt-1">{items.length} registros no total</p>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por assunto, cliente ou tipo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum atendimento encontrado</p>
            <p className="text-sm mt-1">Registre atendimentos na página do cliente</p>
          </div>
        )}
        {filtered.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLOR[a.type] ?? 'bg-gray-100 text-gray-600'}`}>{a.type}</span>
                  <span className="text-xs text-gray-400">{formatDate(a.date)}</span>
                </div>
                <p className="font-medium text-gray-900">{a.subject}</p>
                <Link href={`/clients/${a.client.id}`} className="text-sm text-blue-600 hover:underline">{a.client.name}</Link>
                {a.description && <p className="text-sm text-gray-500 mt-1">{a.description}</p>}
                {a.outcome && <p className="text-sm text-blue-600 mt-1 italic">→ {a.outcome}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
