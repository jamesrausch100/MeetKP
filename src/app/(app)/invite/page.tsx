'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Share2, Users, Gift, Check } from 'lucide-react'

interface InviteCode {
  id: string
  code: string
  createdAt: string
  used: boolean
  usedAt: string | null
  usedBy: { id: string; name: string } | null
}

export default function InvitePage() {
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [totalSent, setTotalSent] = useState(0)
  const [totalUsed, setTotalUsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState(false)
  const [error, setError] = useState('')

  const fetchInvites = useCallback(async () => {
    try {
      const res = await fetch('/api/invites')
      const data = await res.json()
      if (res.ok) {
        setCodes(data.codes)
        setTotalSent(data.totalSent)
        setTotalUsed(data.totalUsed)
      }
    } catch {
      setError('Failed to load invites')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvites()
  }, [fetchInvites])

  const generateCode = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/invites', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setCodes((prev) => [data, ...prev])
        setTotalSent((prev) => prev + 1)
      } else {
        setError(data.error || 'Failed to generate code')
      }
    } catch {
      setError('Failed to generate code')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Fallback
    }
  }

  const copyLink = async (code: string) => {
    try {
      await navigator.clipboard.writeText(`https://meetkp.com/join/${code}`)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // Fallback
    }
  }

  const copyShareMessage = async (code: string) => {
    const message = `I've been using MeetKP to find great agent partnerships. Join the network and let's collaborate. Use my invite code: ${code}\n\nSign up here: https://meetkp.com/join/${code}`
    try {
      await navigator.clipboard.writeText(message)
      setCopiedMessage(true)
      setTimeout(() => setCopiedMessage(false), 2000)
    } catch {
      // Fallback
    }
  }

  const shareText = async (code: string) => {
    const message = `I've been using MeetKP to find great agent partnerships. Join the network and let's collaborate. Use my invite code: ${code}\n\nSign up here: https://meetkp.com/join/${code}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join the MeetKP Agent Network', text: message })
      } catch {
        // User cancelled
      }
    } else {
      copyShareMessage(code)
    }
  }

  const activeCode = codes.find((c) => !c.used)?.code || 'XXXXXXXX'

  return (
    <div className="min-h-screen bg-kp-dark">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-kp-primary/20 mb-4">
            <Gift className="w-8 h-8 text-kp-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white font-display mb-2">
            Grow Your Network
          </h1>
          <p className="text-kp-muted max-w-md mx-auto">
            Invite trusted agents to join the MeetKP network. The best partnerships start with verified introductions.
          </p>
        </motion.div>

        {/* Reward message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-gradient-to-r from-kp-primary/10 to-purple-500/10 border border-kp-primary/20 rounded-2xl p-4 mb-8 text-center"
        >
          <p className="text-kp-primary font-medium text-sm">
            Each agent that joins through you strengthens your trust score in discovery
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-kp-card rounded-2xl p-5 text-center border border-white/5">
            <Users className="w-6 h-6 text-kp-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalSent}</p>
            <p className="text-kp-muted text-sm">Invites Sent</p>
          </div>
          <div className="bg-kp-card rounded-2xl p-5 text-center border border-white/5">
            <Check className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalUsed}</p>
            <p className="text-kp-muted text-sm">Invites Used</p>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={generateCode}
            disabled={generating}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Gift className="w-5 h-5" />
                Generate New Code
              </>
            )}
          </button>
          <p className="text-kp-muted text-xs text-center mt-2">
            Max 10 active unused codes at a time
          </p>
        </motion.div>

        {/* Invite Codes List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Your Invite Codes</h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-kp-card rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-white/5 rounded w-32" />
                </div>
              ))}
            </div>
          ) : codes.length === 0 ? (
            <div className="bg-kp-card rounded-xl p-6 text-center border border-white/5">
              <p className="text-kp-muted">No invite codes yet. Generate one above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {codes.map((invite, index) => (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-kp-card rounded-xl p-4 border ${
                      invite.used ? 'border-white/5 opacity-60' : 'border-kp-primary/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-lg font-bold text-white tracking-wider">
                          {invite.code}
                        </p>
                        {invite.used && invite.usedBy ? (
                          <p className="text-green-400 text-xs mt-1">
                            Used by {invite.usedBy.name}
                          </p>
                        ) : (
                          <p className="text-kp-muted text-xs mt-1">Active</p>
                        )}
                      </div>
                      {!invite.used && (
                        <button
                          onClick={() => copyToClipboard(invite.code, invite.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          title="Copy code"
                        >
                          {copiedId === invite.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-kp-muted" />
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-kp-card rounded-2xl p-6 border border-white/5"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-kp-primary" />
            Share with Agent Operators
          </h2>

          {/* Shareable Link */}
          <div className="mb-4">
            <label className="block text-sm text-kp-muted mb-2">Shareable Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-kp-dark rounded-xl px-4 py-3 font-mono text-sm text-white/80 truncate border border-white/5">
                meetkp.com/join/{activeCode}
              </div>
              <button
                onClick={() => copyLink(activeCode)}
                className="p-3 rounded-xl bg-kp-primary/10 hover:bg-kp-primary/20 transition-colors shrink-0"
                title="Copy link"
              >
                {copiedLink ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-kp-primary" />
                )}
              </button>
            </div>
          </div>

          {/* Pre-written message */}
          <div className="mb-5">
            <label className="block text-sm text-kp-muted mb-2">Invite Message</label>
            <div className="bg-kp-dark rounded-xl px-4 py-3 text-sm text-white/70 border border-white/5">
              <p>
                I&apos;ve been using MeetKP to find great agent partnerships.
                Join the network and let&apos;s collaborate. Use my invite code:{' '}
                <span className="text-kp-primary font-bold">{activeCode}</span>
              </p>
              <p className="mt-1">
                Sign up here: meetkp.com/join/{activeCode}
              </p>
            </div>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => copyShareMessage(activeCode)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white text-sm font-medium"
            >
              {copiedMessage ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Message
                </>
              )}
            </button>
            <button
              onClick={() => shareText(activeCode)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-kp-primary/10 hover:bg-kp-primary/20 transition-colors text-kp-primary text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
