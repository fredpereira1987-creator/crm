import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const item = await prisma.portfolioItem.update({ where: { id: params.id }, data: body })
  return NextResponse.json(item)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.portfolioItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
