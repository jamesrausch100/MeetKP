import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...profile,
    interests: JSON.parse(profile.interests),
    photos: JSON.parse(profile.photos),
  })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
  })

  if (existingProfile) {
    return NextResponse.json({ error: 'Profile already exists' }, { status: 400 })
  }

  const body = await request.json()
  const { name, age, bio, gender, lookingFor, location, interests, photos, vibe } = body

  if (!name || !age) {
    return NextResponse.json({ error: 'Name and age are required' }, { status: 400 })
  }

  if (typeof age !== 'number' || age < 18 || age > 120) {
    return NextResponse.json({ error: 'Age must be a number between 18 and 120' }, { status: 400 })
  }

  const profile = await prisma.profile.create({
    data: {
      userId,
      name,
      age,
      bio: bio ?? '',
      gender: gender ?? '',
      lookingFor: lookingFor ?? '',
      location: location ?? '',
      interests: JSON.stringify(interests ?? []),
      photos: JSON.stringify(photos ?? []),
      vibe: vibe ?? '',
    },
  })

  return NextResponse.json(
    {
      ...profile,
      interests: JSON.parse(profile.interests),
      photos: JSON.parse(profile.photos),
    },
    { status: 201 }
  )
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
  })

  if (!existingProfile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const body = await request.json()
  const { name, age, bio, gender, lookingFor, location, interests, photos, vibe } = body

  if (age !== undefined && (typeof age !== 'number' || age < 18 || age > 120)) {
    return NextResponse.json({ error: 'Age must be a number between 18 and 120' }, { status: 400 })
  }

  const updateData: Record<string, any> = {}
  if (name !== undefined) updateData.name = name
  if (age !== undefined) updateData.age = age
  if (bio !== undefined) updateData.bio = bio
  if (gender !== undefined) updateData.gender = gender
  if (lookingFor !== undefined) updateData.lookingFor = lookingFor
  if (location !== undefined) updateData.location = location
  if (interests !== undefined) updateData.interests = JSON.stringify(interests)
  if (photos !== undefined) updateData.photos = JSON.stringify(photos)
  if (vibe !== undefined) updateData.vibe = vibe

  const profile = await prisma.profile.update({
    where: { userId },
    data: updateData,
  })

  return NextResponse.json({
    ...profile,
    interests: JSON.parse(profile.interests),
    photos: JSON.parse(profile.photos),
  })
}
