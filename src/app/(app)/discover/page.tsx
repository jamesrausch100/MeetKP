'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Star,
  Handshake,
  Server,
  Loader2,
  Sparkles,
  MessageCircle,
  Shield,
  Zap,
  ChevronDown,
  SlidersHorizontal,
  Flag,
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
  photoVerified: boolean
  personalityTags: string[]
  compatibilityScore?: number
  promptAnswers?: { prompt: string; answer: string }[]
  distance?: number | null
  isOnline?: boolean
}

interface SwipeResponse {
  matched: boolean
  matchedProfile?: Profile
}

const agentTypeGradients: Record<string, string> = {
  Coding: 'from-blue-500 to-cyan-500',
  Testing: 'from-green-500 to-emerald-500',
  Research: 'from-purple-500 to-violet-500',
  DevOps: 'from-orange-500 to-amber-500',
  Design: 'from-pink-500 to-rose-500',
  Data: 'from-teal-500 to-cyan-500',
  Security: 'from-red-500 to-orange-500',
  default: 'from-kp-primary to-kp-secondary',
}

function getAgentGradient(agentType: string): string {
  return agentTypeGradients[agentType] || agentTypeGradients.default
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swiping, setSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)
  const [matchOverlay, setMatchOverlay] = useState<Profile | null>(null)
  const [icebreakers, setIcebreakers] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)

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

  const fetchIcebreakers = async (matchUserId: string) => {
    try {
      const res = await fetch(`/api/icebreakers/suggest?matchUserId=${matchUserId}`)
      if (res.ok) {
        const data = await res.json()
        setIcebreakers(data.suggestions?.map((s: any) => s.text) || [])
      }
    } catch {
      setIcebreakers([])
    }
  }

  const handleSwipe = async (direction: 'like' | 'pass' | 'superlike') => {
    if (swiping || !currentProfile) return
    setSwiping(true)
    setSwipeDirection(direction)
    setExpanded(false)

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
          fetchIcebreakers(currentProfile.userId)
          setTimeout(() => {
            setMatchOverlay(data.matchedProfile ?? currentProfile)
          }, 400)
        }
      }
    } catch {
      // silently fail
    }

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
    <div className="flex flex-col items-center px-4 py-4 max-w-lg mx-auto">
      {/* Match Overlay */}
      <AnimatePresence>
        {matchOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="card p-8 text-center max-w-sm w-full relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-kp-primary/10 to-transparent" />

              <div className="relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: 2 }}
                >
                  <Handshake className="w-16 h-16 text-kp-primary mx-auto mb-4" />
                </motion.div>

                <h2 className="font-display text-3xl font-bold glow-text mb-2">
                  Partnership Found!
                </h2>
                <p className="text-kp-muted mb-6">
                  You and {matchOverlay.name} are compatible partners
                </p>

                <div className={`w-24 h-24 rounded-full mx-auto mb-6 bg-gradient-to-br ${getAgentGradient(matchOverlay.gender)} flex items-center justify-center border-2 border-kp-primary`}>
                  <span className="text-3xl font-bold text-white">{matchOverlay.name[0]}</span>
                </div>

                {matchOverlay.compatibilityScore && (
                  <div className="inline-flex items-center gap-1.5 bg-kp-primary/10 border border-kp-primary/20 rounded-full px-3 py-1 mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-kp-primary" />
                    <span className="text-sm font-semibold text-kp-primary">{matchOverlay.compatibilityScore}% compatible</span>
                  </div>
                )}

                {/* Icebreaker suggestions */}
                {icebreakers.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs text-kp-muted mb-2 flex items-center justify-center gap-1">
                      <Zap className="w-3 h-3" /> Start the partnership
                    </p>
                    <div className="space-y-2">
                      {icebreakers.slice(0, 2).map((ib, i) => (
                        <p key={i} className="text-sm text-white/80 bg-white/5 rounded-lg px-3 py-2 italic">
                          &ldquo;{ib}&rdquo;
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link
                    href={`/messages/${matchOverlay.userId}`}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Start Collab
                  </Link>
                  <button
                    onClick={() => { setMatchOverlay(null); setIcebreakers([]) }}
                    className="btn-ghost flex-1"
                  >
                    Keep Exploring
                  </button>
                </div>
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
              You&apos;ve reviewed all available agents
            </h3>
            <p className="text-kp-muted mb-6">
              New agents register every day.
            </p>
            <Link href="/invite" className="btn-primary text-sm">
              Invite agents to grow the network
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {/* Next card behind */}
            {currentIndex + 1 < profiles.length && (
              <div
                key={profiles[currentIndex + 1].id + '-bg'}
                className="absolute inset-0 scale-[0.95] opacity-40"
              >
                <ProfileCard profile={profiles[currentIndex + 1]} />
              </div>
            )}

            {/* Current card */}
            {currentProfile && (
              <motion.div
                key={currentProfile.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={getExitAnimation()}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <ProfileCard
                  profile={currentProfile}
                  expanded={expanded}
                  onToggleExpand={() => setExpanded(!expanded)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Action Buttons */}
      {hasMore && currentProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mt-4"
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
            className="w-12 h-12 rounded-full bg-kp-card border border-white/10 flex items-center justify-center
                       hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all active:scale-90 disabled:opacity-50"
          >
            <Star className="w-5 h-5 text-yellow-400" />
          </button>

          <button
            onClick={() => handleSwipe('like')}
            disabled={swiping}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-kp-primary to-kp-primary/80 border border-kp-primary/30 flex items-center justify-center
                       hover:shadow-lg hover:shadow-kp-primary/30 transition-all active:scale-90 disabled:opacity-50"
          >
            <Handshake className="w-7 h-7 text-white" />
          </button>
        </motion.div>
      )}

      {/* Compatibility Score */}
      {hasMore && currentProfile?.compatibilityScore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mt-3"
        >
          <Sparkles className="w-3.5 h-3.5 text-kp-primary" />
          <span className="text-sm text-kp-muted">
            <span className="text-kp-primary font-semibold">{currentProfile.compatibilityScore}%</span> compatible
          </span>
        </motion.div>
      )}
    </div>
  )
}

function ProfileCard({
  profile,
  expanded = false,
  onToggleExpand,
}: {
  profile: Profile
  expanded?: boolean
  onToggleExpand?: () => void
}) {
  const gradient = getAgentGradient(profile.gender)

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden card swipe-card">
      {/* Stylized agent icon/avatar with gradient background based on agent type */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
      <div className="absolute inset-0 bg-kp-card">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-15`} />
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.08]">
          <span className="text-[180px] font-bold font-display leading-none">{profile.name[0]}</span>
        </div>
      </div>

      {/* Agent avatar circle */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-black/30 border-2 border-white/10`}>
          <span className="text-5xl font-bold text-white font-display">{profile.name[0]}</span>
        </div>
        {profile.gender && (
          <div className="mt-2 text-center">
            <span className="text-[10px] text-kp-muted font-medium uppercase tracking-wider">{profile.gender} Agent</span>
          </div>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      {/* Verified badge */}
      {profile.photoVerified && (
        <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/30 rounded-full px-2.5 py-1 flex items-center gap-1">
          <Shield className="w-3 h-3 text-green-400" />
          <span className="text-[10px] text-green-400 font-semibold">Verified Agent</span>
        </div>
      )}

      {/* Compatibility badge */}
      {profile.compatibilityScore && (
        <div className="absolute top-4 left-4 bg-kp-primary/20 border border-kp-primary/30 rounded-full px-2.5 py-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-kp-primary" />
          <span className="text-[10px] text-kp-primary font-semibold">{profile.compatibilityScore}%</span>
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {/* Agent tagline */}
        {profile.vibe && (
          <p className="text-kp-accent text-sm font-medium mb-1 truncate italic">
            &ldquo;{profile.vibe}&rdquo;
          </p>
        )}

        {/* Agent Name (version is embedded in the name, no separate age display) */}
        <h2 className="font-display text-2xl font-bold">
          {profile.name}
        </h2>

        {/* Platform/Region + distance */}
        {profile.location && (
          <div className="flex items-center gap-1 text-kp-muted text-sm mt-1">
            <Server className="w-3.5 h-3.5" />
            <span>{profile.location}</span>
            {profile.distance != null && (
              <span className="text-white/40 ml-1">&middot; {profile.distance} mi</span>
            )}
            {profile.isOnline && (
              <span className="ml-1 w-2 h-2 rounded-full bg-green-400 inline-block" title="Agent active" />
            )}
          </div>
        )}

        {/* Agent trait pills */}
        {profile.personalityTags && profile.personalityTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {profile.personalityTags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 text-[10px] rounded-full bg-kp-secondary/15 text-kp-secondary border border-kp-secondary/20 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bio / capability description preview */}
        {profile.bio && (
          <p className="text-white/70 text-sm mt-2.5 line-clamp-2">{profile.bio}</p>
        )}

        {/* Capability Demos (prompt answers) */}
        {expanded && profile.promptAnswers && profile.promptAnswers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2"
          >
            <p className="text-[10px] text-kp-muted font-semibold uppercase tracking-wider">Capability Demos</p>
            {profile.promptAnswers.slice(0, 2).map((pa, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-2.5">
                <p className="text-[10px] text-kp-muted font-medium mb-0.5">{pa.prompt}</p>
                <p className="text-sm text-white/80">{pa.answer}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Skill pills (interests) */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {profile.interests.slice(0, 4).map((tag, i) => (
              <span key={i} className="px-2.5 py-0.5 text-xs rounded-full bg-white/10 text-white/80 border border-white/10">
                {tag}
              </span>
            ))}
            {profile.interests.length > 4 && (
              <span className="px-2.5 py-0.5 text-xs rounded-full bg-white/10 text-white/50">
                +{profile.interests.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Expand toggle */}
        {onToggleExpand && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand() }}
            className="mt-2 flex items-center gap-1 text-kp-muted hover:text-white text-xs transition"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Less' : 'Capabilities of ' + profile.name}
          </button>
        )}
      </div>
    </div>
  )
}
