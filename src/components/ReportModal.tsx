'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

const REPORT_REASONS = [
  { value: 'fake_profile', label: 'Fake Profile' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'underage', label: 'Underage User' },
  { value: 'other', label: 'Other' },
] as const

interface ReportModalProps {
  userId: string
  userName: string
  isOpen: boolean
  onClose: () => void
}

export default function ReportModal({ userId, userName, isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedId: userId,
          reason,
          details: details || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit report')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setDetails('')
    setError('')
    setSuccess(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative card p-6 w-full max-w-md z-10"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-kp-muted hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold font-display mb-2">Report Submitted</h3>
                <p className="text-kp-muted">
                  Thank you for helping keep MeetKP safe. We&apos;ll review your report shortly.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display">Report {userName}</h3>
                    <p className="text-sm text-kp-muted">Help us keep the community safe</p>
                  </div>
                </div>

                {/* Reason Selector */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium text-kp-muted">Reason for reporting</label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((r) => (
                      <label
                        key={r.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          reason === r.value
                            ? 'border-kp-primary/50 bg-kp-primary/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={(e) => setReason(e.target.value)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            reason === r.value
                              ? 'border-kp-primary'
                              : 'border-white/30'
                          }`}
                        >
                          {reason === r.value && (
                            <div className="w-2 h-2 rounded-full bg-kp-primary" />
                          )}
                        </div>
                        <span className="text-sm">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-kp-muted mb-1 block">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="input-field min-h-[80px] resize-none"
                    placeholder="Provide any additional context..."
                    maxLength={500}
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="text-red-400 text-sm mb-4">{error}</p>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !reason}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
