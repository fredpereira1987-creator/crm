import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const task = await prisma.task.update({
    where: { id: params.id },
    data: body,
    include: { client: { select: { id: true, name: true } } }
  })
  return NextResponse.json(task)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.task.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
