'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Calendar,
  Clock,
  Send,
  X,
  Check,
  XCircle,
  Share2,
  Loader2,
} from 'lucide-react'

interface DatePlanProps {
  plan: {
    id: string
    venue: string
    address: string
    dateTime: string
    status: string
    notes: string
    sharedWith: string[]
    otherUser: {
      id: string
      name: string
    }
  }
  isCreator: boolean
  onStatusChange: (id: string, status: string) => void
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  proposed: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Proposed' },
  accepted: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Accepted' },
  declined: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Declined' },
  cancelled: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Cancelled' },
}

export default function DatePlanCard({ plan, isCreator, onStatusChange }: DatePlanProps) {
  const [showShareForm, setShowShareForm] = useState(false)
  const [shareContact, setShareContact] = useState('')
  const [sharing, setSharing] = useState(false)
  const [shared, setShared] = useState(plan.sharedWith.length > 0)

  const statusStyle = STATUS_STYLES[plan.status] || STATUS_STYLES.proposed

  const dateObj = new Date(plan.dateTime)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const handleShare = async () => {
    if (!shareContact.trim()) return

    setSharing(true)
    try {
      const contacts = shareContact
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)

      const res = await fetch('/api/dateplan/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datePlanId: plan.id,
          contacts,
        }),
      })

      if (res.ok) {
        setShared(true)
        setShowShareForm(false)
        setShareContact('')
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4"
    >
      {/* Header: Venue + Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold font-display">{plan.venue}</h3>
          <p className="text-sm text-kp-muted">
            with <span className="text-kp-accent">{plan.otherUser.name}</span>
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Calendar className="w-4 h-4 text-kp-muted" />
          <span>{formattedDate}</span>
          <Clock className="w-4 h-4 text-kp-muted ml-2" />
          <span>{formattedTime}</span>
        </div>
        {plan.address && (
          <div className="flex items-center gap-2 text-sm text-white/80">
            <MapPin className="w-4 h-4 text-kp-muted" />
            <span>{plan.address}</span>
          </div>
        )}
        {plan.notes && (
          <p className="text-sm text-kp-muted italic mt-1">&quot;{plan.notes}&quot;</p>
        )}
      </div>

      {/* Action Buttons */}
      {plan.status === 'proposed' && (
        <div className="flex gap-2 mb-3">
          {isCreator ? (
            <button
              onClick={() => onStatusChange(plan.id, 'cancelled')}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-white/10 text-kp-muted hover:text-red-400 hover:border-red-400/30 transition text-sm"
            >
              <XCircle className="w-4 h-4" />
              Cancel Plan
            </button>
          ) : (
            <>
              <button
                onClick={() => onStatusChange(plan.id, 'accepted')}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={() => onStatusChange(plan.id, 'declined')}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Decline
              </button>
            </>
          )}
        </div>
      )}

      {/* Share for Safety */}
      <div className="border-t border-white/5 pt-3">
        {shared && !showShareForm ? (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <Check className="w-3 h-3" />
            <span>Plans shared with a friend for safety</span>
          </div>
        ) : (
          <button
            onClick={() => setShowShareForm(!showShareForm)}
            className="flex items-center gap-2 text-sm text-kp-accent hover:text-kp-primary transition"
          >
            <Share2 className="w-4 h-4" />
            Share my plans
          </button>
        )}

        <AnimatePresence>
          {showShareForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                <p className="text-xs text-kp-muted">
                  Share your date details with a friend for safety. Enter their phone or email.
                </p>
                <input
                  type="text"
                  value={shareContact}
                  onChange={(e) => setShareContact(e.target.value)}
                  className="input-field text-sm"
                  placeholder="friend@email.com or +1234567890"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    disabled={sharing || !shareContact.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-kp-primary/20 text-kp-primary hover:bg-kp-primary/30 transition text-sm font-medium disabled:opacity-50"
                  >
                    {sharing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send
                  </button>
                  <button
                    onClick={() => setShowShareForm(false)}
                    className="py-2 px-3 rounded-xl border border-white/10 text-kp-muted hover:text-white transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
