import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')
  const items = await prisma.portfolioItem.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { category: 'asc' },
    include: { client: { select: { id: true, name: true } } }
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await prisma.portfolioItem.create({ data: body })
  return NextResponse.json(item, { status: 201 })
}
