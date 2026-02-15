import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function parseProfile(profile: any) {
  return {
    ...profile,
    interests: JSON.parse(profile.interests || '[]'),
    photos: JSON.parse(profile.photos || '[]'),
    personalityTags: JSON.parse(profile.personalityTags || '[]'),
    promptAnswers: JSON.parse(profile.promptAnswers || '[]'),
    dealbreakers: JSON.parse(profile.dealbreakers || '[]'),
  }
}

function calculateCompleteness(profile: any): number {
  let score = 0
  if (profile.name) score += 15
  if (profile.age) score += 10
  if (profile.bio && profile.bio.length > 20) score += 15
  if (profile.vibe) score += 10
  if (profile.gender) score += 5
  if (profile.lookingFor) score += 5
  if (profile.location) score += 10
  const interests = JSON.parse(profile.interests || '[]')
  if (interests.length > 0) score += 10
  const photos = JSON.parse(profile.photos || '[]')
  if (photos.length > 0) score += 10
  const tags = JSON.parse(profile.personalityTags || '[]')
  if (tags.length > 0) score += 5
  const prompts = JSON.parse(profile.promptAnswers || '[]')
  if (prompts.length > 0) score += 5
  return Math.min(score, 100)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Update last active
  await prisma.user.update({
    where: { id: userId },
    data: { lastActive: new Date(), isOnline: true },
  }).catch(() => {})

  const profile = await prisma.profile.findUnique({
    where: { userId },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json(parseProfile(profile))
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
  const {
    name, age, bio, gender, lookingFor, location, interests, photos, vibe,
    personalityTags, promptAnswers, dealbreakers, ageRangeMin, ageRangeMax, maxDistance,
  } = body

  if (!name || !age) {
    return NextResponse.json({ error: 'Name and age are required' }, { status: 400 })
  }

  if (typeof age !== 'number' || age < 18 || age > 120) {
    return NextResponse.json({ error: 'Age must be between 18 and 120' }, { status: 400 })
  }

  const profileData: any = {
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
    personalityTags: JSON.stringify(personalityTags ?? []),
    promptAnswers: JSON.stringify(promptAnswers ?? []),
    dealbreakers: JSON.stringify(dealbreakers ?? []),
  }

  if (ageRangeMin !== undefined) profileData.ageRangeMin = ageRangeMin
  if (ageRangeMax !== undefined) profileData.ageRangeMax = ageRangeMax
  if (maxDistance !== undefined) profileData.maxDistance = maxDistance

  const profile = await prisma.profile.create({ data: profileData })

  // Update completeness
  const completeness = calculateCompleteness(profile)
  await prisma.profile.update({
    where: { id: profile.id },
    data: { profileCompleteness: completeness },
  })

  return NextResponse.json(parseProfile({ ...profile, profileCompleteness: completeness }), { status: 201 })
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
  const {
    name, age, bio, gender, lookingFor, location, interests, photos, vibe,
    personalityTags, promptAnswers, dealbreakers, ageRangeMin, ageRangeMax, maxDistance,
  } = body

  if (age !== undefined && (typeof age !== 'number' || age < 18 || age > 120)) {
    return NextResponse.json({ error: 'Age must be between 18 and 120' }, { status: 400 })
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
  if (personalityTags !== undefined) updateData.personalityTags = JSON.stringify(personalityTags)
  if (promptAnswers !== undefined) updateData.promptAnswers = JSON.stringify(promptAnswers)
  if (dealbreakers !== undefined) updateData.dealbreakers = JSON.stringify(dealbreakers)
  if (ageRangeMin !== undefined) updateData.ageRangeMin = ageRangeMin
  if (ageRangeMax !== undefined) updateData.ageRangeMax = ageRangeMax
  if (maxDistance !== undefined) updateData.maxDistance = maxDistance

  const profile = await prisma.profile.update({
    where: { userId },
    data: updateData,
  })

  // Recalculate completeness
  const completeness = calculateCompleteness(profile)
  if (completeness !== profile.profileCompleteness) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: { profileCompleteness: completeness },
    })
  }

  return NextResponse.json(parseProfile({ ...profile, profileCompleteness: completeness }))
}
