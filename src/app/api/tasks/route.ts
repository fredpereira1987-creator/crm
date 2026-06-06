import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')
  const status = searchParams.get('status')
  const tasks = await prisma.task.findMany({
    where: {
      ...(clientId ? { clientId } : {}),
      ...(status ? { status } : {})
    },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    include: { client: { select: { id: true, name: true } } }
  })
  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  const body = await request.json()
  const task = await prisma.task.create({
    data: body,
    include: { client: { select: { id: true, name: true } } }
  })
  return NextResponse.json(task, { status: 201 })
}
