'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus, Gift, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-kp-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-kp-primary animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [inviteCode, setInviteCode] = useState('')
  const [inviterName, setInviterName] = useState('')
  const [inviteValid, setInviteValid] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Pre-fill invite code from URL params
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setInviteCode(code.toUpperCase())
    }
  }, [searchParams])

  const verifyInviteCode = useCallback(async (code: string) => {
    if (!code || code.length < 8) {
      setInviteValid(null)
      setInviterName('')
      return
    }

    try {
      const res = await fetch('/api/invites/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      setInviteValid(data.valid)
      setInviterName(data.valid ? data.inviterName : '')
    } catch {
      setInviteValid(null)
      setInviterName('')
    }
  }, [])

  // Verify invite code from URL on mount
  useEffect(() => {
    const code = searchParams.get('code')
    if (code && code.length >= 8) {
      verifyInviteCode(code.toUpperCase())
    }
  }, [searchParams, verifyInviteCode])

  const validate = (): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters.'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(inviteCode.trim() ? { inviteCode: inviteCode.trim().toUpperCase() } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed.')
        setLoading(false)
        return
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but sign-in failed. Please log in manually.')
        setLoading(false)
        return
      }

      router.push('/profile/create')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-kp-dark flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(225,29,72,0.12)_0%,_transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="card p-8">
          {/* Brand */}
          <div className="text-center mb-8">
            <h1 className="glow-text font-display text-3xl font-bold mb-2">
              MeetKP
            </h1>
            <p className="text-kp-muted">Create your account. Your story starts now.</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Invite Code (optional, at the top) */}
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-kp-muted mb-2">
                Invite Code <span className="text-kp-muted/50">(optional)</span>
              </label>
              <div className="relative">
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  onBlur={() => verifyInviteCode(inviteCode)}
                  placeholder="Enter invite code"
                  maxLength={8}
                  className="input-field font-mono tracking-wider uppercase"
                />
                {inviteCode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Gift className={`w-4 h-4 ${inviteValid ? 'text-green-400' : inviteValid === false ? 'text-red-400' : 'text-kp-muted'}`} />
                  </div>
                )}
              </div>
              {inviteValid && inviterName && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5"
                >
                  <Gift className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 text-xs font-medium">
                    Invited by {inviterName}
                  </span>
                </motion.div>
              )}
              {inviteValid === false && inviteCode.length >= 8 && (
                <p className="text-red-400 text-xs mt-1">Invalid or already used invite code</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-kp-muted mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-kp-muted mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-kp-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-kp-muted mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-kp-muted mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-kp-primary hover:text-kp-accent transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
