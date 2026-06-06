import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      attendances: { orderBy: { date: 'desc' } },
      portfolioItems: { orderBy: { category: 'asc' } },
      tasks: { orderBy: { dueDate: 'asc' } }
    }
  })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(client)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const client = await prisma.client.update({ where: { id: params.id }, data: body })
  return NextResponse.json(client)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.client.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
