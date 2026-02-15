'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Star,
  Heart,
  MapPin,
  Loader2,
  Sparkles,
  MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

interface Profile {
  id: string
  userId: string
  name: string
  age: number
  bio: string
  location: string
  vibe: string
  interests: string[]
  photos: string[]
  gender: string
}

interface SwipeResponse {
  matched: boolean
  matchedProfile?: Profile
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swiping, setSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)
  const [matchOverlay, setMatchOverlay] = useState<Profile | null>(null)

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch('/api/discover')
      if (res.ok) {
        const data = await res.json()
        setProfiles(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const currentProfile = profiles[currentIndex]
  const hasMore = currentIndex < profiles.length

  const handleSwipe = async (direction: 'like' | 'pass' | 'superlike') => {
    if (swiping || !currentProfile) return
    setSwiping(true)
    setSwipeDirection(direction)

    try {
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: currentProfile.userId,
          direction,
        }),
      })

      if (res.ok) {
        const data: SwipeResponse = await res.json()
        if (data.matched) {
          // Wait for exit animation, then show match overlay
          setTimeout(() => {
            setMatchOverlay(data.matchedProfile ?? currentProfile)
          }, 400)
        }
      }
    } catch {
      // silently fail
    }

    // Move to next profile after animation
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
      setSwipeDirection(null)
      setSwiping(false)
    }, 350)
  }

  const getExitAnimation = () => {
    if (swipeDirection === 'like' || swipeDirection === 'superlike') {
      return { x: 400, rotate: 20, opacity: 0 }
    }
    if (swipeDirection === 'pass') {
      return { x: -400, rotate: -20, opacity: 0 }
    }
    return { opacity: 0 }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-kp-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 max-w-lg mx-auto">
      {/* Match Overlay */}
      <AnimatePresence>
        {matchOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="card p-8 text-center max-w-sm w-full"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: 2 }}
              >
                <Heart className="w-16 h-16 text-kp-primary mx-auto mb-4 fill-kp-primary" />
              </motion.div>
              <h2 className="font-display text-3xl font-bold glow-text mb-2">
                It&apos;s a Match!
              </h2>
              <p className="text-kp-muted mb-6">
                You and {matchOverlay.name} liked each other
              </p>

              {matchOverlay.photos?.[0] && (
                <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden border-2 border-kp-primary">
                  <img
                    src={matchOverlay.photos[0]}
                    alt={matchOverlay.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Link
                  href={`/messages/${matchOverlay.userId}`}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </Link>
                <button
                  onClick={() => setMatchOverlay(null)}
                  className="btn-ghost flex-1"
                >
                  Keep Swiping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Stack */}
      <div className="relative w-full aspect-[3/4] max-h-[65vh]">
        {!hasMore ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
          >
            <div className="w-20 h-20 rounded-full bg-kp-card flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-kp-muted" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              You&apos;ve seen everyone nearby
            </h3>
            <p className="text-kp-muted">
              Check back later. New people join every day.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {/* Show next card behind (static) */}
            {currentIndex + 1 < profiles.length && (
              <div
                key={profiles[currentIndex + 1].id + '-bg'}
                className="absolute inset-0 scale-[0.95] opacity-50"
              >
                <ProfileCard profile={profiles[currentIndex + 1]} />
              </div>
            )}

            {/* Current card (animated) */}
            {currentProfile && (
              <motion.div
                key={currentProfile.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={getExitAnimation()}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <ProfileCard profile={currentProfile} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Action Buttons */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-5 mt-6"
        >
          <button
            onClick={() => handleSwipe('pass')}
            disabled={swiping}
            className="w-16 h-16 rounded-full bg-kp-card border border-white/10 flex items-center justify-center
                       hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-90 disabled:opacity-50"
          >
            <X className="w-7 h-7 text-red-400" />
          </button>

          <button
            onClick={() => handleSwipe('superlike')}
            disabled={swiping}
            className="w-14 h-14 rounded-full bg-kp-card border border-white/10 flex items-center justify-center
                       hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all active:scale-90 disabled:opacity-50"
          >
            <Star className="w-6 h-6 text-yellow-400" />
          </button>

          <button
            onClick={() => handleSwipe('like')}
            disabled={swiping}
            className="w-16 h-16 rounded-full bg-kp-card border border-white/10 flex items-center justify-center
                       hover:bg-green-500/10 hover:border-green-500/30 transition-all active:scale-90 disabled:opacity-50"
          >
            <Heart className="w-7 h-7 text-green-400" />
          </button>
        </motion.div>
      )}
    </div>
  )
}

function ProfileCard({ profile }: { profile: Profile }) {
  const mainPhoto = profile.photos?.[0]

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden card">
      {/* Photo or gradient placeholder */}
      {mainPhoto ? (
        <img
          src={mainPhoto}
          alt={profile.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-kp-primary/30 via-kp-card to-kp-secondary/30" />
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {/* Vibe tagline */}
        {profile.vibe && (
          <p className="text-kp-accent text-sm font-medium mb-1 truncate">
            {profile.vibe}
          </p>
        )}

        {/* Name & Age */}
        <h2 className="font-display text-2xl font-bold">
          {profile.name}, {profile.age}
        </h2>

        {/* Location */}
        {profile.location && (
          <div className="flex items-center gap-1 text-kp-muted text-sm mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{profile.location}</span>
          </div>
        )}

        {/* Bio preview */}
        {profile.bio && (
          <p className="text-white/70 text-sm mt-3 line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Interest tags */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.interests.slice(0, 5).map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 text-xs rounded-full bg-white/10 text-white/80 border border-white/10"
              >
                {tag}
              </span>
            ))}
            {profile.interests.length > 5 && (
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-white/10 text-white/50">
                +{profile.interests.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
