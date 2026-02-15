'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Loader2, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Match {
  userId: string
  name: string
  age: number
  photos: string[]
  vibe: string
  hasUnread: boolean
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/matches')
        if (res.ok) {
          const data = await res.json()
          setMatches(data)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-kp-primary animate-spin" />
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-full bg-kp-card flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-kp-muted" />
          </div>
          <h2 className="font-display text-xl font-semibold mb-2">
            No matches yet
          </h2>
          <p className="text-kp-muted max-w-xs">
            Keep discovering! Your next connection is just a swipe away.
          </p>
          <Link href="/discover" className="btn-primary inline-block mt-6">
            Start Discovering
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-bold mb-6">
        Your Matches
        <span className="text-kp-muted text-base font-normal ml-2">
          ({matches.length})
        </span>
      </h1>

      <div className="grid grid-cols-2 gap-3">
        {matches.map((match, i) => (
          <motion.div
            key={match.userId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/messages/${match.userId}`}
              className="card block group relative overflow-hidden"
            >
              {/* Photo or gradient */}
              <div className="aspect-[3/4] relative">
                {match.photos?.[0] ? (
                  <img
                    src={match.photos[0]}
                    alt={match.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-kp-primary/20 via-kp-card to-kp-secondary/20 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-white/10" />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Unread indicator */}
                {match.hasUnread && (
                  <div className="absolute top-3 right-3">
                    <div className="w-3 h-3 rounded-full bg-kp-primary animate-pulse" />
                  </div>
                )}

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-semibold text-sm">
                    {match.name}, {match.age}
                  </h3>
                  {match.vibe && (
                    <p className="text-kp-accent text-xs truncate mt-0.5">
                      {match.vibe}
                    </p>
                  )}
                </div>
              </div>

              {/* Hover action hint */}
              <div className="absolute inset-0 bg-kp-primary/0 group-hover:bg-kp-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
