'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CalendarCheck, TrendingUp, CheckSquare, BarChart3 } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/attendances', label: 'Atendimentos', icon: CalendarCheck },
  { href: '/portfolio', label: 'Carteiras', icon: TrendingUp },
  { href: '/tasks', label: 'Tarefas', icon: CheckSquare },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-blue-400" />
          <div>
            <h1 className="font-bold text-lg leading-tight">CRM Assessoria</h1>
            <p className="text-xs text-slate-400">Gestão de Clientes</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        Assessoria de Investimentos
      </div>
    </aside>
  )
}
