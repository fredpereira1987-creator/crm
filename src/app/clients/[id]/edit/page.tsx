'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '',
    investorProfile: 'Moderado', relationship: 'Ativo',
    patrimony: '', monthlyIncome: '',
    address: '', city: '', state: '', notes: ''
  })

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(c => {
      setForm({
        name: c.name ?? '', email: c.email ?? '', phone: c.phone ?? '', cpf: c.cpf ?? '',
        investorProfile: c.investorProfile ?? 'Moderado', relationship: c.relationship ?? 'Ativo',
        patrimony: c.patrimony != null ? String(c.patrimony) : '',
        monthlyIncome: c.monthlyIncome != null ? String(c.monthlyIncome) : '',
        address: c.address ?? '', city: c.city ?? '', state: c.state ?? '', notes: c.notes ?? ''
      })
    })
  }, [id])

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const body: Record<string, unknown> = { ...form }
    if (form.patrimony) body.patrimony = parseFloat(form.patrimony)
    else body.patrimony = null
    if (form.monthlyIncome) body.monthlyIncome = parseFloat(form.monthlyIncome)
    else body.monthlyIncome = null
    if (!form.cpf) body.cpf = null
    await fetch(`/api/clients/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    router.push(`/clients/${id}`)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/clients/${id}`} className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <h2 className="text-2xl font-bold text-gray-900">Editar Cliente</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">CPF</label><input value={form.cpf} onChange={e => set('cpf', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label><input value={form.city} onChange={e => set('city', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Estado</label><input value={form.state} onChange={e => set('state', e.target.value)} maxLength={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="SP" /></div>
          </div>
        </section>
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Perfil de Investidor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
              <select value={form.investorProfile} onChange={e => set('investorProfile', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['Conservador', 'Moderado', 'Arrojado', 'Agressivo'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.relationship} onChange={e => set('relationship', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['Ativo', 'Inativo', 'Prospecto'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Patrimônio Total (R$)</label><input type="number" value={form.patrimony} onChange={e => set('patrimony', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Renda Mensal (R$)</label><input type="number" value={form.monthlyIncome} onChange={e => set('monthlyIncome', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
        </section>
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Observações</h3>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </section>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <Link href={`/clients/${id}`} className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
