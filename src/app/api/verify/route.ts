import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { verificationPhoto } = body

  if (!verificationPhoto) {
    return NextResponse.json(
      { error: 'verificationPhoto URL is required' },
      { status: 400 }
    )
  }

  // Check that the user has a profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
  })

  if (!profile) {
    return NextResponse.json(
      { error: 'Profile not found. Please create a profile first.' },
      { status: 404 }
    )
  }

  // For MVP: auto-approve immediately
  // In production, this would submit for AI face matching / manual review
  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: {
      verificationPhoto,
      photoVerified: true,
    },
  })

  return NextResponse.json({
    success: true,
    photoVerified: updatedProfile.photoVerified,
    message: 'Photo verification complete! Your profile is now verified.',
  })
}
