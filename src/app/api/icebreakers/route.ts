import { NextRequest, NextResponse } from 'next/server'
import {
  getRandomIcebreakers,
  ICEBREAKER_CATEGORIES,
} from '@/lib/icebreakers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || undefined
  const count = parseInt(searchParams.get('count') || '5', 10)

  // Validate category if provided
  if (category) {
    const validCategories = ICEBREAKER_CATEGORIES.map((c) => c.id)
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          error: 'Invalid category',
          validCategories,
        },
        { status: 400 }
      )
    }
  }

  // Clamp count to a reasonable range
  const clampedCount = Math.min(Math.max(1, count || 5), 50)

  const icebreakers = getRandomIcebreakers(category, clampedCount)

  return NextResponse.json({
    categories: ICEBREAKER_CATEGORIES,
    icebreakers,
  })
}
