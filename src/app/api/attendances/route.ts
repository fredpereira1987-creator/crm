import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')
  const attendances = await prisma.attendance.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { date: 'desc' },
    include: { client: { select: { id: true, name: true } } }
  })
  return NextResponse.json(attendances)
}

export async function POST(request: Request) {
  const body = await request.json()
  const attendance = await prisma.attendance.create({
    data: body,
    include: { client: { select: { id: true, name: true } } }
  })
  return NextResponse.json(attendance, { status: 201 })
}
