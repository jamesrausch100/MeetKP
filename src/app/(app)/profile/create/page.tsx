'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  MapPin,
  Camera,
  Sparkles,
  Heart,
  Loader2,
} from 'lucide-react'

export default function ProfileCreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [vibe, setVibe] = useState('')
  const [interests, setInterests] = useState('')
  const [photos, setPhotos] = useState<string[]>(['', '', '', '', '', ''])

  const updatePhoto = (index: number, value: string) => {
    const updated = [...photos]
    updated[index] = value
    setPhotos(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required.')
      return
    }

    const ageNum = parseInt(age)
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      setError('Please enter a valid age (18+).')
      return
    }

    setLoading(true)

    const interestsArray = interests
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const photoUrls = photos.filter((p) => p.trim() !== '')

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          age: ageNum,
          gender,
          lookingFor,
          location: location.trim(),
          bio: bio.trim(),
          vibe: vibe.trim(),
          interests: interestsArray,
          photos: photoUrls,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create profile.')
        setLoading(false)
        return
      }

      router.push('/discover')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-kp-dark py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="glow-text font-display text-3xl font-bold mb-2">
              Build Your Profile
            </h1>
            <p className="text-kp-muted">
              Show the world who you are. Be honest, be bold, be you.
            </p>
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basics */}
            <section className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-kp-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-kp-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold">The Basics</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-kp-muted mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should people call you?"
                    required
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-kp-muted mb-2">
                      Age
                    </label>
                    <input
                      id="age"
                      type="number"
                      min={18}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="18+"
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-kp-muted mb-2">
                      Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-kp-muted mb-2">
                      I am a
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="input-field appearance-none cursor-pointer"
                    >
                      <option value="">Select...</option>
                      <option value="Man">Man</option>
                      <option value="Woman">Woman</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="lookingFor" className="block text-sm font-medium text-kp-muted mb-2">
                      Looking for
                    </label>
                    <select
                      id="lookingFor"
                      value={lookingFor}
                      onChange={(e) => setLookingFor(e.target.value)}
                      className="input-field appearance-none cursor-pointer"
                    >
                      <option value="">Select...</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Everyone">Everyone</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Personality */}
            <section className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-kp-secondary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-kp-secondary" />
                </div>
                <h2 className="font-display text-xl font-semibold">Your Vibe</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="vibe" className="block text-sm font-medium text-kp-muted mb-2">
                    Vibe Tagline
                    <span className="text-kp-muted/60 ml-2">({vibe.length}/50)</span>
                  </label>
                  <input
                    id="vibe"
                    type="text"
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value.slice(0, 50))}
                    maxLength={50}
                    placeholder="e.g. Coffee addict who hikes on weekends"
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-kp-muted mb-2">
                    Bio
                    <span className="text-kp-muted/60 ml-2">({bio.length}/500)</span>
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 500))}
                    maxLength={500}
                    rows={4}
                    placeholder="Tell people what makes you, you. What are you passionate about? What's your perfect Saturday?"
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-kp-muted mb-2">
                    Interests
                  </label>
                  <input
                    id="interests"
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="hiking, coffee, music, travel (comma separated)"
                    className="input-field"
                  />
                  {interests && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {interests
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-sm rounded-full bg-kp-primary/10 text-kp-accent border border-kp-primary/20"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Photos */}
            <section className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-kp-accent/10 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-kp-accent" />
                </div>
                <h2 className="font-display text-xl font-semibold">Photos</h2>
              </div>
              <p className="text-kp-muted text-sm mb-5">
                Paste up to 6 photo URLs. Real upload coming soon.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map((url, i) => (
                  <div key={i} className="space-y-2">
                    <div className="aspect-[3/4] rounded-xl bg-kp-surface border border-white/5 overflow-hidden flex items-center justify-center">
                      {url.trim() ? (
                        <img
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-white/10" />
                      )}
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updatePhoto(i, e.target.value)}
                      placeholder={i === 0 ? 'Main photo URL' : `Photo ${i + 1} URL`}
                      className="input-field text-xs !py-2 !px-3"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    Start Discovering
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
