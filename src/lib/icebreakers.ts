// =============================================================================
// Icebreaker Engine
// Curated conversation starters to help matches break the ice
// =============================================================================

export interface IcebreakerCategory {
  id: string
  label: string
  emoji: string
  description: string
}

export interface Icebreaker {
  category: string
  text: string
}

export interface IcebreakerProfile {
  interests: string[]
  personalityTags: string[]
}

// =============================================================================
// Categories
// =============================================================================

export const ICEBREAKER_CATEGORIES: IcebreakerCategory[] = [
  {
    id: 'flirty',
    label: 'Flirty',
    emoji: '😏',
    description: 'Playful and romantic conversation starters',
  },
  {
    id: 'deep',
    label: 'Deep',
    emoji: '🌊',
    description: 'Meaningful questions that spark real connection',
  },
  {
    id: 'funny',
    label: 'Funny',
    emoji: '😂',
    description: 'Humor-based openers to get them laughing',
  },
  {
    id: 'casual',
    label: 'Casual',
    emoji: '☕',
    description: 'Easy, low-pressure conversation starters',
  },
  {
    id: 'adventurous',
    label: 'Adventurous',
    emoji: '🌍',
    description: 'Experience-based questions for the thrill seekers',
  },
]

// =============================================================================
// Icebreakers — 10+ per category, 50+ total
// =============================================================================

export const ICEBREAKERS: Icebreaker[] = [
  // ─── Flirty (10) ──────────────────────────────────────────────────────
  {
    category: 'flirty',
    text: "If we matched on the last day on earth, where would our first date be?",
  },
  {
    category: 'flirty',
    text: "Be honest — did you swipe right for my photos or my bio?",
  },
  {
    category: 'flirty',
    text: "On a scale of 1 to 'already planning the wedding,' how excited are you that we matched?",
  },
  {
    category: 'flirty',
    text: "What's something you'd only tell someone after the third date? Let's skip ahead.",
  },
  {
    category: 'flirty',
    text: "I have a theory that the best couples meet on [today's day of the week]. Thoughts?",
  },
  {
    category: 'flirty',
    text: "What's the most romantic thing that's happened to you that wasn't in a movie?",
  },
  {
    category: 'flirty',
    text: "If I asked you on a spontaneous date right now, what would you want to do?",
  },
  {
    category: 'flirty',
    text: "Tell me your ideal lazy Sunday with someone you like.",
  },
  {
    category: 'flirty',
    text: "What's the one compliment that always makes you blush?",
  },
  {
    category: 'flirty',
    text: "Would you rather have an amazing first date or an amazing first kiss?",
  },

  // ─── Deep (10) ────────────────────────────────────────────────────────
  {
    category: 'deep',
    text: "What's something you've changed your mind about in the last year?",
  },
  {
    category: 'deep',
    text: "What's a belief you hold that most people around you don't share?",
  },
  {
    category: 'deep',
    text: "If you could have dinner with any person, living or dead, who would it be and what would you ask them?",
  },
  {
    category: 'deep',
    text: "What's the hardest lesson you've learned that you're actually grateful for now?",
  },
  {
    category: 'deep',
    text: "What does your ideal life look like five years from now?",
  },
  {
    category: 'deep',
    text: "What's something that's important to you that most people don't take seriously enough?",
  },
  {
    category: 'deep',
    text: "When was the last time you felt genuinely proud of yourself?",
  },
  {
    category: 'deep',
    text: "What's a small moment in your life that had a surprisingly big impact?",
  },
  {
    category: 'deep',
    text: "If you could instantly master one skill, what would it be and why?",
  },
  {
    category: 'deep',
    text: "What's the best piece of advice you've ever received from someone unexpected?",
  },

  // ─── Funny (10) ───────────────────────────────────────────────────────
  {
    category: 'funny',
    text: "What's your most unhinged take that you'll defend to the death?",
  },
  {
    category: 'funny',
    text: "What's the worst first date you've ever been on? I need to know what NOT to do.",
  },
  {
    category: 'funny',
    text: "If your pet could talk, what would they say about your dating life?",
  },
  {
    category: 'funny',
    text: "What's the most embarrassing song on your most-played list?",
  },
  {
    category: 'funny',
    text: "Be honest — what's your screen time average? No judgment. Okay maybe a little.",
  },
  {
    category: 'funny',
    text: "What's the hill you'd die on that would make everyone question your sanity?",
  },
  {
    category: 'funny',
    text: "If you had to eat one meal for the rest of your life, what's the pick?",
  },
  {
    category: 'funny',
    text: "What's the most random Wikipedia rabbit hole you've fallen into?",
  },
  {
    category: 'funny',
    text: "If your life had a theme song, what would it be and is it embarrassing?",
  },
  {
    category: 'funny',
    text: "What's a conspiracy theory that you're like... 10% convinced might be real?",
  },

  // ─── Casual (10) ──────────────────────────────────────────────────────
  {
    category: 'casual',
    text: "What did you have for dinner last night? I'm judging.",
  },
  {
    category: 'casual',
    text: "What are you watching right now that you'd actually recommend?",
  },
  {
    category: 'casual',
    text: "Coffee or tea? And don't say 'depends on the mood,' pick a side.",
  },
  {
    category: 'casual',
    text: "What's the last thing you added to your cart but didn't buy?",
  },
  {
    category: 'casual',
    text: "Are you more of a morning person or does your alarm hate you?",
  },
  {
    category: 'casual',
    text: "What's your go-to comfort show when you just need to zone out?",
  },
  {
    category: 'casual',
    text: "What's the best thing that happened to you this week?",
  },
  {
    category: 'casual',
    text: "Do you cook or are you keeping DoorDash in business?",
  },
  {
    category: 'casual',
    text: "What's your current obsession? It can be anything — a snack, a show, a hobby.",
  },
  {
    category: 'casual',
    text: "If you had a totally free Saturday, what does it actually look like?",
  },

  // ─── Adventurous (10) ─────────────────────────────────────────────────
  {
    category: 'adventurous',
    text: "What's the most spontaneous thing you've ever done?",
  },
  {
    category: 'adventurous',
    text: "What's on your bucket list that you haven't checked off yet?",
  },
  {
    category: 'adventurous',
    text: "If money wasn't an issue, where would you be right now?",
  },
  {
    category: 'adventurous',
    text: "What's the craziest thing you've done that you'd totally do again?",
  },
  {
    category: 'adventurous',
    text: "Road trip with no destination — are you driving, DJing, or sleeping?",
  },
  {
    category: 'adventurous',
    text: "What's a place you've traveled to that completely changed your perspective?",
  },
  {
    category: 'adventurous',
    text: "Would you rather go skydiving or deep sea diving? And why?",
  },
  {
    category: 'adventurous',
    text: "What's the most out-of-character thing you've ever done?",
  },
  {
    category: 'adventurous',
    text: "If we could go anywhere in the world tomorrow, where are we going?",
  },
  {
    category: 'adventurous',
    text: "What's a skill or activity you've always wanted to try but haven't yet?",
  },
]

// =============================================================================
// Helper functions
// =============================================================================

/**
 * Get random icebreakers, optionally filtered by category
 */
export function getRandomIcebreakers(
  category?: string,
  count: number = 5
): Icebreaker[] {
  let pool = ICEBREAKERS

  if (category) {
    pool = pool.filter((ib) => ib.category === category)
  }

  // Fisher-Yates shuffle on a copy
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, count)
}

/**
 * Pick the best icebreaker category based on shared interests/vibes
 * and return 3 personalized suggestions
 */
export function getIcebreakerForMatch(
  profileA: IcebreakerProfile,
  profileB: IcebreakerProfile
): Icebreaker[] {
  const category = pickBestCategory(profileA, profileB)
  return getRandomIcebreakers(category, 3)
}

/**
 * Determine the best icebreaker category based on shared traits between two profiles
 */
function pickBestCategory(
  profileA: IcebreakerProfile,
  profileB: IcebreakerProfile
): string {
  const allTagsA = [
    ...profileA.personalityTags.map((t) => t.toLowerCase()),
    ...profileA.interests.map((i) => i.toLowerCase()),
  ]
  const allTagsB = [
    ...profileB.personalityTags.map((t) => t.toLowerCase()),
    ...profileB.interests.map((i) => i.toLowerCase()),
  ]

  const combined = [...allTagsA, ...allTagsB]

  // Keyword mapping to categories
  const categoryKeywords: Record<string, string[]> = {
    adventurous: [
      'adventure', 'travel', 'hiking', 'camping', 'exploring', 'backpacking',
      'skydiving', 'surfing', 'climbing', 'outdoor', 'outdoors', 'thrill',
      'spontaneous', 'wanderlust', 'extreme sports', 'road trips',
    ],
    deep: [
      'philosophy', 'reading', 'writing', 'meditation', 'mindfulness',
      'psychology', 'intellectual', 'deep thinker', 'introspective',
      'spiritual', 'books', 'poetry', 'art', 'culture', 'history',
    ],
    funny: [
      'comedy', 'memes', 'humor', 'sarcasm', 'stand-up', 'funny',
      'witty', 'jokes', 'improv', 'satire', 'pranks', 'gaming',
    ],
    flirty: [
      'romantic', 'romance', 'love', 'dating', 'relationship',
      'hopeless romantic', 'affectionate', 'flirty', 'charming',
      'passionate', 'wine', 'dancing',
    ],
    casual: [
      'chill', 'laid-back', 'relaxed', 'netflix', 'cooking', 'foodie',
      'coffee', 'music', 'movies', 'tv', 'casual', 'easygoing',
      'homebody', 'cozy',
    ],
  }

  // Score each category based on keyword matches
  const scores: Record<string, number> = {
    adventurous: 0,
    deep: 0,
    funny: 0,
    flirty: 0,
    casual: 0,
  }

  for (const tag of combined) {
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((kw) => tag.includes(kw) || kw.includes(tag))) {
        scores[category]++
      }
    }
  }

  // Find the highest scoring category
  let bestCategory = 'casual' // default fallback
  let bestScore = -1

  for (const [category, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }

  // If there's a tie at 0 (no keyword matches), pick randomly
  if (bestScore === 0) {
    const categories = ICEBREAKER_CATEGORIES.map((c) => c.id)
    bestCategory = categories[Math.floor(Math.random() * categories.length)]
  }

  return bestCategory
}
