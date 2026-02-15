'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  MapPin,
  Camera,
  Sparkles,
  Heart,
  Loader2,
  MessageSquare,
  Flame,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react'

const PERSONALITY_TAGS = [
  'Adventurous', 'Homebody', 'Night Owl', 'Early Bird', 'Foodie', 'Fitness Junkie',
  'Creative', 'Analytical', 'Spontaneous', 'Planner', 'Introvert', 'Extrovert',
  'Dog Person', 'Cat Person', 'Plant Parent', 'Bookworm', 'Gamer', 'Traveler',
  'Ambitious', 'Chill', 'Romantic', 'Sarcastic', 'Nerdy', 'Outdoorsy',
]

const PROFILE_PROMPTS = [
  'A perfect first date with me looks like...',
  'My most controversial opinion is...',
  'The way to my heart is...',
  'I get way too excited about...',
  'The most spontaneous thing I\'ve done is...',
  'I\'m looking for someone who...',
  'Two truths and a lie about me:',
  'My friends would describe me as...',
  'On a Sunday morning you\'ll find me...',
  'My hidden talent is...',
]

const steps = ['basics', 'vibe', 'prompts', 'photos'] as const
type Step = typeof steps[number]

export default function ProfileCreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState<Step>('basics')

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [vibe, setVibe] = useState('')
  const [interests, setInterests] = useState('')
  const [personalityTags, setPersonalityTags] = useState<string[]>([])
  const [promptAnswers, setPromptAnswers] = useState<{ prompt: string; answer: string }[]>([])
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])
  const [photos, setPhotos] = useState<string[]>(['', '', '', '', '', ''])

  const stepIndex = steps.indexOf(currentStep)
  const isLast = stepIndex === steps.length - 1

  const toggleTag = (tag: string) => {
    setPersonalityTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 6 ? [...prev, tag] : prev
    )
  }

  const togglePrompt = (prompt: string) => {
    if (selectedPrompts.includes(prompt)) {
      setSelectedPrompts((p) => p.filter((pr) => pr !== prompt))
      setPromptAnswers((p) => p.filter((pa) => pa.prompt !== prompt))
    } else if (selectedPrompts.length < 3) {
      setSelectedPrompts((p) => [...p, prompt])
    }
  }

  const updatePromptAnswer = (prompt: string, answer: string) => {
    setPromptAnswers((prev) => {
      const existing = prev.find((pa) => pa.prompt === prompt)
      if (existing) {
        return prev.map((pa) => (pa.prompt === prompt ? { ...pa, answer } : pa))
      }
      return [...prev, { prompt, answer }]
    })
  }

  const updatePhoto = (index: number, value: string) => {
    const updated = [...photos]
    updated[index] = value
    setPhotos(updated)
  }

  const nextStep = () => {
    if (currentStep === 'basics') {
      if (!name.trim()) { setError('What should people call you?'); return }
      const ageNum = parseInt(age)
      if (!age || isNaN(ageNum) || ageNum < 18) { setError('You gotta be 18+'); return }
    }
    setError('')
    const idx = steps.indexOf(currentStep)
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1])
  }

  const prevStep = () => {
    setError('')
    const idx = steps.indexOf(currentStep)
    if (idx > 0) setCurrentStep(steps[idx - 1])
  }

  const handleSubmit = async () => {
    setError('')
    if (!name.trim()) { setError('Name is required.'); return }
    const ageNum = parseInt(age)
    if (!age || isNaN(ageNum) || ageNum < 18) { setError('Valid age required (18+).'); return }

    setLoading(true)

    const interestsArray = interests.split(',').map((s) => s.trim()).filter(Boolean)
    const photoUrls = photos.filter((p) => p.trim() !== '')
    const validPrompts = promptAnswers.filter((pa) => pa.answer.trim())

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
          personalityTags,
          promptAnswers: validPrompts,
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
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-kp-dark py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="glow-text font-display text-3xl font-bold mb-2">Build Your Profile</h1>
          <p className="text-kp-muted text-sm">Takes 2 minutes. Be honest, be bold, be you.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {steps.map((step, i) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= stepIndex ? 'bg-kp-primary' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

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

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'basics' && (
            <motion.div
              key="basics"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-kp-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-kp-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold">The Basics</h2>
                    <p className="text-kp-muted text-xs">The essentials, nothing more</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-kp-muted mb-2">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="What should people call you?"
                      className="input-field"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-kp-muted mb-2">Age</label>
                      <input
                        type="number"
                        min={18}
                        max={120}
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="18+"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-kp-muted mb-2">Location</label>
                      <input
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
                      <label className="block text-sm font-medium text-kp-muted mb-2">I am a</label>
                      <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field appearance-none cursor-pointer">
                        <option value="">Select...</option>
                        <option value="Man">Man</option>
                        <option value="Woman">Woman</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-kp-muted mb-2">Looking for</label>
                      <select value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} className="input-field appearance-none cursor-pointer">
                        <option value="">Select...</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Everyone">Everyone</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'vibe' && (
            <motion.div
              key="vibe"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-kp-secondary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-kp-secondary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold">Your Vibe</h2>
                    <p className="text-kp-muted text-xs">Show your personality</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-kp-muted mb-2">
                      Vibe Tagline <span className="text-kp-muted/60">({vibe.length}/50)</span>
                    </label>
                    <input
                      type="text"
                      value={vibe}
                      onChange={(e) => setVibe(e.target.value.slice(0, 50))}
                      maxLength={50}
                      placeholder="e.g. Chaos coordinator with good taste"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kp-muted mb-2">
                      Bio <span className="text-kp-muted/60">({bio.length}/500)</span>
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 500))}
                      maxLength={500}
                      rows={3}
                      placeholder="The real you in a few sentences..."
                      className="input-field resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kp-muted mb-2">Interests</label>
                    <input
                      type="text"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="hiking, coffee, music (comma separated)"
                      className="input-field"
                    />
                    {interests && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {interests.split(',').map((s) => s.trim()).filter(Boolean).map((tag, i) => (
                          <span key={i} className="px-3 py-1 text-xs rounded-full bg-kp-primary/10 text-kp-accent border border-kp-primary/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Personality Tags */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="w-5 h-5 text-kp-accent" />
                  <div>
                    <h3 className="font-semibold">Personality Tags</h3>
                    <p className="text-kp-muted text-xs">Pick up to 6 that describe you ({personalityTags.length}/6)</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PERSONALITY_TAGS.map((tag) => {
                    const selected = personalityTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                          selected
                            ? 'bg-kp-primary/20 border-kp-primary/40 text-kp-primary'
                            : 'bg-white/5 border-white/10 text-kp-muted hover:border-white/20'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 inline mr-1" />}
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'prompts' && (
            <motion.div
              key="prompts"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-kp-accent/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-kp-accent" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold">Profile Prompts</h2>
                    <p className="text-kp-muted text-xs">Pick up to 3 and answer them. Way better than a blank bio.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {PROFILE_PROMPTS.map((prompt) => {
                    const selected = selectedPrompts.includes(prompt)
                    const answer = promptAnswers.find((pa) => pa.prompt === prompt)?.answer || ''
                    return (
                      <div key={prompt}>
                        <button
                          onClick={() => togglePrompt(prompt)}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                            selected
                              ? 'bg-kp-primary/10 border-kp-primary/30 text-white'
                              : 'bg-white/5 border-white/10 text-kp-muted hover:border-white/20'
                          }`}
                        >
                          {prompt}
                        </button>
                        {selected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                          >
                            <textarea
                              value={answer}
                              onChange={(e) => updatePromptAnswer(prompt, e.target.value.slice(0, 200))}
                              maxLength={200}
                              rows={2}
                              placeholder="Your answer..."
                              className="input-field mt-2 resize-none text-sm"
                            />
                            <p className="text-xs text-kp-muted mt-1 text-right">{answer.length}/200</p>
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-kp-accent/10 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-kp-accent" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold">Photos</h2>
                    <p className="text-kp-muted text-xs">Paste up to 6 photo URLs. Real upload coming soon.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((url, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="aspect-[3/4] rounded-xl bg-kp-surface border border-white/5 overflow-hidden flex items-center justify-center">
                        {url.trim() ? (
                          <img
                            src={url}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        ) : (
                          <div className="text-center">
                            <Camera className="w-6 h-6 text-white/10 mx-auto" />
                            {i === 0 && <p className="text-[9px] text-white/20 mt-1">Main</p>}
                          </div>
                        )}
                      </div>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updatePhoto(i, e.target.value)}
                        placeholder={i === 0 ? 'Main photo URL' : `Photo ${i + 1}`}
                        className="input-field text-xs !py-1.5 !px-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {stepIndex > 0 && (
            <button onClick={prevStep} className="btn-ghost flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          <div className="flex-1" />
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 min-w-[160px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Heart className="w-5 h-5" /> Start Discovering
                </>
              )}
            </button>
          ) : (
            <button onClick={nextStep} className="btn-primary flex items-center gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
