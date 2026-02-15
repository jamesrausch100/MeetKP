'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Edit3, MapPin, Sparkles, Camera, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface Profile {
  name: string
  age: number
  bio: string
  gender: string
  lookingFor: string
  location: string
  interests: string[]
  photos: string[]
  vibe: string
  verified: boolean
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    bio: '',
    vibe: '',
    location: '',
    interests: '',
    lookingFor: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push('/profile/create')
          return
        }
        setProfile(data)
        setForm({
          bio: data.bio || '',
          vibe: data.vibe || '',
          location: data.location || '',
          interests: (data.interests || []).join(', '),
          lookingFor: data.lookingFor || '',
        })
      })
      .catch(() => router.push('/profile/create'))
      .finally(() => setLoading(false))
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: form.bio,
          vibe: form.vibe,
          location: form.location,
          interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
          lookingFor: form.lookingFor,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-kp-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Header */}
        <div className="relative mb-6">
          <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-kp-primary/30 to-kp-secondary/30">
            {profile.photos[0] ? (
              <img
                src={profile.photos[0]}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-16 h-16 text-white/30" />
              </div>
            )}
          </div>
          {profile.verified && (
            <div className="absolute top-4 right-4 bg-kp-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Verified
            </div>
          )}
        </div>

        {/* Name & Basics */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-display">
            {profile.name}, {profile.age}
          </h1>
          {profile.location && (
            <p className="text-kp-muted flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" /> {profile.location}
            </p>
          )}
          {profile.vibe && (
            <p className="text-kp-accent text-lg mt-2 italic">"{profile.vibe}"</p>
          )}
        </div>

        {/* Edit Toggle */}
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-2 text-kp-muted hover:text-white transition mb-4"
        >
          <Edit3 className="w-4 h-4" />
          {editing ? 'Cancel Editing' : 'Edit Profile'}
        </button>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-kp-muted mb-1 block">Vibe</label>
              <input
                type="text"
                value={form.vibe}
                onChange={(e) => setForm({ ...form, vibe: e.target.value })}
                className="input-field"
                maxLength={50}
                placeholder="Your tagline..."
              />
            </div>
            <div>
              <label className="text-sm text-kp-muted mb-1 block">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="input-field min-h-[120px] resize-none"
                maxLength={500}
                placeholder="Tell people about yourself..."
              />
              <p className="text-xs text-kp-muted mt-1">{form.bio.length}/500</p>
            </div>
            <div>
              <label className="text-sm text-kp-muted mb-1 block">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="input-field"
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="text-sm text-kp-muted mb-1 block">Looking For</label>
              <select
                value={form.lookingFor}
                onChange={(e) => setForm({ ...form, lookingFor: e.target.value })}
                className="input-field"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Everyone">Everyone</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-kp-muted mb-1 block">Interests</label>
              <input
                type="text"
                value={form.interests}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                className="input-field"
                placeholder="hiking, cooking, music..."
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <>
            {/* Bio */}
            {profile.bio && (
              <div className="card p-4 mb-4">
                <h3 className="text-sm font-semibold text-kp-muted mb-2">About</h3>
                <p className="text-white/90 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Details */}
            <div className="card p-4 mb-4">
              <h3 className="text-sm font-semibold text-kp-muted mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-kp-muted">Gender</span>
                  <p>{profile.gender || '—'}</p>
                </div>
                <div>
                  <span className="text-kp-muted">Looking for</span>
                  <p>{profile.lookingFor || '—'}</p>
                </div>
              </div>
            </div>

            {/* Interests */}
            {profile.interests.length > 0 && (
              <div className="card p-4 mb-4">
                <h3 className="text-sm font-semibold text-kp-muted mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-kp-primary/10 border border-kp-primary/20 text-sm text-kp-accent"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photos Grid */}
            {profile.photos.length > 1 && (
              <div className="card p-4 mb-4">
                <h3 className="text-sm font-semibold text-kp-muted mb-2">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {profile.photos.slice(1).map((photo, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-kp-surface">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full mt-6 flex items-center justify-center gap-2 py-3 text-kp-muted hover:text-red-400 transition"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </motion.div>
    </div>
  )
}
