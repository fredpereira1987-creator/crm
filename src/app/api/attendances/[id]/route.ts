import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const attendance = await prisma.attendance.update({ where: { id: params.id }, data: body })
  return NextResponse.json(attendance)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.attendance.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
