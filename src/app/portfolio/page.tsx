'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PortfolioItem {
  id: string; product: string; category: string; value: number
  institution: string | null; targetAlloc: number | null
  client: { id: string; name: string }
}

const CAT_COLOR: Record<string, string> = {
  'Renda Fixa': 'bg-blue-100 text-blue-700',
  'Renda Variável': 'bg-red-100 text-red-700',
  'FII': 'bg-orange-100 text-orange-700',
  'Fundos': 'bg-purple-100 text-purple-700',
  'Tesouro Direto': 'bg-green-100 text-green-700',
  'Cripto': 'bg-yellow-100 text-yellow-700',
  'Previdência': 'bg-teal-100 text-teal-700',
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('Todos')

  useEffect(() => {
    fetch('/api/portfolio').then(r => r.json()).then(setItems)
  }, [])

  const categories = ['Todos', ...Array.from(new Set(items.map(i => i.category)))]
  const filtered = items.filter(i =>
    (catFilter === 'Todos' || i.category === catFilter) &&
    (i.product.toLowerCase().includes(search.toLowerCase()) ||
     i.client.name.toLowerCase().includes(search.toLowerCase()))
  )
  const total = filtered.reduce((s, i) => s + i.value, 0)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Carteiras</h2>
        <p className="text-gray-500 mt-1">Total consolidado: <span className="font-semibold text-gray-900">{formatCurrency(total)}</span></p>
      </div>
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por produto ou cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-64"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${catFilter === c ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum produto encontrado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Produto</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Categoria</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Instituição</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLOR[item.category] ?? 'bg-gray-100 text-gray-600'}`}>{item.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/clients/${item.client.id}`} className="text-sm text-blue-600 hover:underline">{item.client.name}</Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.institution ?? '—'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.value)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-700">Total ({filtered.length} produtos)</td>
                <td className="px-6 py-3 text-sm font-bold text-gray-900 text-right">{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
