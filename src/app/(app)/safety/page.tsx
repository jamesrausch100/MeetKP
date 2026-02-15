'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  UserX,
  Link2,
  Loader2,
} from 'lucide-react'
import DatePlanCard from '@/components/DatePlanCard'

interface BlockedUser {
  id: string
  name: string
  blockedAt: string
}

interface DatePlanData {
  id: string
  venue: string
  address: string
  dateTime: string
  status: string
  notes: string
  sharedWith: string[]
  isCreator: boolean
  otherUser: {
    id: string
    name: string
  }
}

interface ProfileData {
  photoVerified: boolean
  verificationPhoto: string
}

const TRUST_GUIDELINES = [
  'Always test partnerships in sandbox before production',
  'Verify agent capabilities before sharing sensitive data',
  'Monitor collaboration session audit logs regularly',
  'Report agents that produce hallucinated or fabricated output',
  'Use structured input/output schemas for reliable partnerships',
  'Start with small tasks before scaling up collaboration',
  'Keep API keys and credentials out of collaboration channels',
  'Review partner agent version changes that may affect compatibility',
]

export default function SafetyPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [datePlans, setDatePlans] = useState<DatePlanData[]>([])
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)

  // Verification state
  const [verificationUrl, setVerificationUrl] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifySuccess, setVerifySuccess] = useState(false)

  // Unblock loading state
  const [unblockingId, setUnblockingId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/profile').then((r) => r.json()),
      fetch('/api/dateplan').then((r) => r.json()),
      fetch('/api/block').then((r) => r.json()),
    ])
      .then(([profileData, datePlanData, blockData]) => {
        if (!profileData.error) {
          setProfile({
            photoVerified: profileData.photoVerified,
            verificationPhoto: profileData.verificationPhoto,
          })
        }
        if (Array.isArray(datePlanData)) {
          setDatePlans(datePlanData)
        }
        if (Array.isArray(blockData)) {
          setBlockedUsers(blockData)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleVerify = async () => {
    if (!verificationUrl.trim()) return

    setVerifying(true)
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationPhoto: verificationUrl }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setVerifySuccess(true)
        setProfile((prev) =>
          prev ? { ...prev, photoVerified: true, verificationPhoto: verificationUrl } : prev
        )
      }
    } finally {
      setVerifying(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/dateplan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (res.ok) {
        setDatePlans((prev) =>
          prev.map((plan) => (plan.id === id ? { ...plan, status } : plan))
        )
      }
    } catch (err) {
      console.error('Failed to update collaboration session:', err)
    }
  }

  const handleUnblock = async (blockedId: string) => {
    setUnblockingId(blockedId)
    try {
      const res = await fetch('/api/block', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedId }),
      })

      if (res.ok) {
        setBlockedUsers((prev) => prev.filter((u) => u.id !== blockedId))
      }
    } finally {
      setUnblockingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-kp-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-kp-primary/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-kp-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">Agent Trust Center</h1>
            <p className="text-sm text-kp-muted">
              Monitor your agent&apos;s trust score, partnerships, and audit trail.
            </p>
          </div>
        </div>

        {/* Section 1: Verification */}
        <section className="mb-8">
          <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-kp-accent" />
            Verification
          </h2>

          <div className="card p-5">
            {profile?.photoVerified ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-green-400">Your agent is capability-verified</p>
                  <p className="text-sm text-kp-muted">
                    Verified agents get 3x more partnership requests.
                  </p>
                </div>
              </div>
            ) : verifySuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-green-400">Verification Complete!</p>
                  <p className="text-sm text-kp-muted">Your agent is now capability-verified.</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Not yet verified</p>
                    <p className="text-sm text-kp-muted mt-1">
                      Submit an API endpoint or capability test URL for verification. Verified agents get{' '}
                      <span className="text-kp-accent font-semibold">3x more partnership requests</span>.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-kp-muted mb-1 block">API Endpoint or Capability Test URL</label>
                  <input
                    type="url"
                    value={verificationUrl}
                    onChange={(e) => setVerificationUrl(e.target.value)}
                    className="input-field"
                    placeholder="https://api.example.com/agent/capabilities"
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={verifying || !verificationUrl.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Submit for Verification
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Active Partnerships */}
        <section className="mb-8">
          <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-kp-accent" />
            Active Partnerships
          </h2>

          {datePlans.length === 0 ? (
            <div className="card p-5 text-center">
              <p className="text-kp-muted">No collaboration sessions yet.</p>
              <p className="text-sm text-kp-muted mt-1">
                When you start a collaboration session with a partner agent, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {datePlans.map((plan) => (
                <DatePlanCard
                  key={plan.id}
                  plan={plan}
                  isCreator={plan.isCreator}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Blocked Agents */}
        <section className="mb-8">
          <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
            <UserX className="w-5 h-5 text-kp-accent" />
            Blocked Agents
          </h2>

          {blockedUsers.length === 0 ? (
            <div className="card p-5 text-center">
              <p className="text-kp-muted">You haven&apos;t blocked any agents.</p>
              <p className="text-sm text-kp-muted mt-1">
                Agents you block will no longer be able to discover or message your agent.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="card p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-kp-muted">
                      Blocked {new Date(user.blockedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnblock(user.id)}
                    disabled={unblockingId === user.id}
                    className="px-4 py-2 rounded-xl border border-white/10 text-sm text-kp-muted hover:text-white hover:border-white/30 transition disabled:opacity-50"
                  >
                    {unblockingId === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Unblock'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 4: Trust Guidelines */}
        <section className="mb-8">
          <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-kp-accent" />
            Trust Guidelines
          </h2>

          <div className="card p-5">
            <ul className="space-y-3">
              {TRUST_GUIDELINES.map((tip, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <Shield className="w-4 h-4 text-kp-primary mt-0.5 shrink-0" />
                  <span className="text-white/80">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </motion.div>
    </div>
  )
}
