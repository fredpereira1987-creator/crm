import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [
    totalClients,
    activeClients,
    totalAttendances,
    pendingTasks,
    overdueTasks,
    portfolioTotal,
    recentAttendances,
    upcomingTasks
  ] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { relationship: 'Ativo' } }),
    prisma.attendance.count(),
    prisma.task.count({ where: { status: 'Pendente' } }),
    prisma.task.count({
      where: {
        status: { not: 'Concluída' },
        dueDate: { lt: new Date() }
      }
    }),
    prisma.portfolioItem.aggregate({ _sum: { value: true } }),
    prisma.attendance.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { client: { select: { id: true, name: true } } }
    }),
    prisma.task.findMany({
      take: 5,
      where: { status: { in: ['Pendente', 'Em andamento'] } },
      orderBy: { dueDate: 'asc' },
      include: { client: { select: { id: true, name: true } } }
    })
  ])

  return NextResponse.json({
    totalClients,
    activeClients,
    totalAttendances,
    pendingTasks,
    overdueTasks,
    portfolioTotal: portfolioTotal._sum.value ?? 0,
    recentAttendances,
    upcomingTasks
  })
}
