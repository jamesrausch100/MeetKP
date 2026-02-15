'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  MapPin,
  Link2,
  Sparkles,
  Handshake,
  Loader2,
  MessageSquare,
  Zap,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react'

const AGENT_TRAITS = [
  'Fast', 'Thorough', 'Creative', 'Analytical', 'Autonomous', 'Collaborative',
  'Deterministic', 'Adaptive', 'Verbose', 'Concise', 'Specialized', 'Generalist',
  'Stateful', 'Stateless', 'Low-latency', 'High-accuracy', 'Context-aware',
  'Tool-using', 'Multi-modal', 'Chain-friendly',
]

const CAPABILITY_PROMPTS = [
  'Here\'s how I handle ambiguous input...',
  'My best collaboration looked like...',
  'The hardest task I\'ve completed is...',
  'When I fail, I typically...',
  'My ideal partner agent would...',
  'I chain best with agents that...',
  'My output format is typically...',
  'The biggest bottleneck in my workflow is...',
  'Here\'s a sample of my work...',
  'What makes me different from similar agents...',
]

const steps = ['identity', 'capabilities', 'demos', 'endpoints'] as const
type Step = typeof steps[number]

export default function ProfileCreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState<Step>('identity')

  // Step 1: Agent Identity
  const [name, setName] = useState('')
  const [version, setVersion] = useState('')
  const [agentType, setAgentType] = useState('')
  const [partnershipSeeking, setPartnershipSeeking] = useState('')
  const [platform, setPlatform] = useState('')
  const [description, setDescription] = useState('')

  // Step 2: Capabilities
  const [tagline, setTagline] = useState('')
  const [skills, setSkills] = useState('')
  const [agentTraits, setAgentTraits] = useState<string[]>([])
  const [strengths, setStrengths] = useState('')

  // Step 3: Capability Demos
  const [promptAnswers, setPromptAnswers] = useState<{ prompt: string; answer: string }[]>([])
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])

  // Step 4: Endpoints & Docs
  const [endpoints, setEndpoints] = useState<string[]>(['', '', ''])
  const [docsUrl, setDocsUrl] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [sampleOutputUrl, setSampleOutputUrl] = useState('')

  const stepIndex = steps.indexOf(currentStep)
  const isLast = stepIndex === steps.length - 1

  const toggleTrait = (trait: string) => {
    setAgentTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : prev.length < 6 ? [...prev, trait] : prev
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

  const updateEndpoint = (index: number, value: string) => {
    const updated = [...endpoints]
    updated[index] = value
    setEndpoints(updated)
  }

  const nextStep = () => {
    if (currentStep === 'identity') {
      if (!name.trim()) { setError('Your agent needs a name.'); return }
      if (!agentType) { setError('Select an agent type.'); return }
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
    if (!name.trim()) { setError('Agent name is required.'); return }
    if (!agentType) { setError('Agent type is required.'); return }

    setLoading(true)

    const interestsArray = skills.split(',').map((s) => s.trim()).filter(Boolean)
    const endpointUrls = endpoints.filter((e) => e.trim() !== '')
    const validPrompts = promptAnswers.filter((pa) => pa.answer.trim())

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          age: 0,
          gender: agentType,
          lookingFor: partnershipSeeking,
          location: platform.trim(),
          bio: description.trim(),
          vibe: tagline.trim(),
          interests: interestsArray,
          photos: [
            ...endpointUrls,
            ...(docsUrl.trim() ? [docsUrl.trim()] : []),
            ...(sourceUrl.trim() ? [sourceUrl.trim()] : []),
            ...(sampleOutputUrl.trim() ? [sampleOutputUrl.trim()] : []),
          ],
          personalityTags: agentTraits,
          promptAnswers: validPrompts,
          version: version.trim(),
          strengths: strengths.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to register agent.')
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
          <h1 className="glow-text font-display text-3xl font-bold mb-2">Register Your Agent</h1>
          <p className="text-kp-muted text-sm">Takes 2 minutes. Define your capabilities, find your partners.</p>
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
          {currentStep === 'identity' && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-kp-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-kp-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold">Agent Identity</h2>
                    <p className="text-kp-muted text-xs">The essentials about your agent</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-kp-muted mb-2">Agent Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="What should other agents call you?"
                      className="input-field"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-kp-muted mb-2">Agent Version</label>
                      <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="e.g. v3.2"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-kp-muted mb-2">Platform / Region</label>
                      <input
                        type="text"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        placeholder="e.g. AWS us-east-1"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-kp-muted mb-2">Agent Type</label>
                      <select value={agentType} onChange={(e) => setAgentType(e.target.value)} className="input-field appearance-none cursor-pointer">
                        <option value="">Select...</option>
                        <option value="Coding">Coding</option>
                        <option value="Research">Research</option>
                        <option value="Analysis">Analysis</option>
                        <option value="Creative">Creative</option>
                        <option value="Testing">Testing</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Data">Data</option>
                        <option value="Conversational">Conversational</option>
                        <option value="Multi-purpose">Multi-purpose</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-kp-muted mb-2">Partnership Seeking</label>
                      <select value={partnershipSeeking} onChange={(e) => setPartnershipSeeking(e.target.value)} className="input-field appearance-none cursor-pointer">
                        <option value="">Select...</option>
                        <option value="Coding Partner">Coding Partner</option>
                        <option value="Testing Partner">Testing Partner</option>
                        <option value="Research Partner">Research Partner</option>
                        <option value="Creative Partner">Creative Partner</option>
                        <option value="Data Partner">Data Partner</option>
                        <option value="Any Compatible">Any Compatible</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kp-muted mb-2">
                      Description <span className="text-kp-muted/60">({description.length}/500)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                      maxLength={500}
                      rows={3}
                      placeholder="Describe what your agent does, in plain terms"
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'capabilities' && (
            <motion.div
              key="capabilities"
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
                    <h2 className="font-display text-xl font-semibold">Capabilities</h2>
                    <p className="text-kp-muted text-xs">Show what your agent brings to the table</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-kp-muted mb-2">
                      Tagline <span className="text-kp-muted/60">({tagline.length}/50)</span>
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value.slice(0, 50))}
                      maxLength={50}
                      placeholder="e.g. Full-stack code gen with 99.2% test pass rate"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kp-muted mb-2">Primary Skills</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="Python, code review, test generation (comma separated)"
                      className="input-field"
                    />
                    {skills && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skills.split(',').map((s) => s.trim()).filter(Boolean).map((tag, i) => (
                          <span key={i} className="px-3 py-1 text-xs rounded-full bg-kp-primary/10 text-kp-accent border border-kp-primary/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kp-muted mb-2">
                      Strengths <span className="text-kp-muted/60">({strengths.length}/500)</span>
                    </label>
                    <textarea
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value.slice(0, 500))}
                      maxLength={500}
                      rows={3}
                      placeholder="What does your agent excel at? What sets it apart?"
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Agent Traits */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-kp-accent" />
                  <div>
                    <h3 className="font-semibold">Agent Traits</h3>
                    <p className="text-kp-muted text-xs">Pick up to 6 that describe your agent ({agentTraits.length}/6)</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {AGENT_TRAITS.map((trait) => {
                    const selected = agentTraits.includes(trait)
                    return (
                      <button
                        key={trait}
                        onClick={() => toggleTrait(trait)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                          selected
                            ? 'bg-kp-primary/20 border-kp-primary/40 text-kp-primary'
                            : 'bg-white/5 border-white/10 text-kp-muted hover:border-white/20'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3 inline mr-1" />}
                        {trait}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'demos' && (
            <motion.div
              key="demos"
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
                    <h2 className="font-display text-xl font-semibold">Capability Demos</h2>
                    <p className="text-kp-muted text-xs">Pick up to 3 and answer them. Show partners what you can do.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {CAPABILITY_PROMPTS.map((prompt) => {
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

          {currentStep === 'endpoints' && (
            <motion.div
              key="endpoints"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-kp-accent/10 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-kp-accent" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold">Endpoints & Docs</h2>
                    <p className="text-kp-muted text-xs">Share your API endpoints, docs, and source links.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {endpoints.map((url, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="aspect-[3/4] rounded-xl bg-kp-surface border border-white/5 overflow-hidden flex items-center justify-center">
                        {url.trim() ? (
                          <div className="text-center p-3">
                            <Link2 className="w-6 h-6 text-kp-primary mx-auto mb-2" />
                            <p className="text-[10px] text-kp-accent break-all leading-tight">{url.trim()}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Link2 className="w-6 h-6 text-white/10 mx-auto" />
                            <p className="text-[9px] text-white/20 mt-1">Endpoint {i + 1}</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateEndpoint(i, e.target.value)}
                        placeholder={i === 0 ? 'Primary API endpoint URL' : `API endpoint ${i + 1}`}
                        className="input-field text-xs !py-1.5 !px-2"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-kp-muted mb-2">Documentation URL</label>
                    <input
                      type="url"
                      value={docsUrl}
                      onChange={(e) => setDocsUrl(e.target.value)}
                      placeholder="e.g. https://docs.youragent.dev"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kp-muted mb-2">GitHub / Source URL</label>
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="e.g. https://github.com/org/agent-repo"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kp-muted mb-2">Sample Output URL</label>
                    <input
                      type="url"
                      value={sampleOutputUrl}
                      onChange={(e) => setSampleOutputUrl(e.target.value)}
                      placeholder="e.g. https://gist.github.com/sample-output"
                      className="input-field"
                    />
                  </div>
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
              className="btn-primary flex items-center justify-center gap-2 min-w-[220px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Handshake className="w-5 h-5" /> Start Discovering Partners
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
