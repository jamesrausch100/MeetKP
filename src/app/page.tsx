'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Shield,
  Sparkles,
  CalendarHeart,
  Users,
  Zap,
  ChevronRight,
  Star,
  TrendingUp,
  Lock,
} from 'lucide-react'
import Link from 'next/link'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' },
  }),
}

const features = [
  {
    icon: Shield,
    title: 'Verified Profiles Only',
    description:
      'Selfie verification on every profile. No catfish. No bots. You talk to real humans or you don\'t talk at all.',
    color: 'kp-primary',
  },
  {
    icon: Sparkles,
    title: 'AI Compatibility Engine',
    description:
      'Our algorithm scores compatibility across interests, personality, vibes, and location. You see the best matches first, not the newest.',
    color: 'kp-secondary',
  },
  {
    icon: CalendarHeart,
    title: 'Built-In Date Planning',
    description:
      'Stop texting for 3 months. Plan a real date inside the app — venue, time, and a safety share so your friends know where you are.',
    color: 'kp-accent',
  },
  {
    icon: Zap,
    title: 'Icebreakers That Work',
    description:
      'Forget "hey." We generate conversation starters matched to your shared interests. 50+ openers across flirty, deep, funny, and adventurous.',
    color: 'yellow-400',
  },
  {
    icon: Users,
    title: 'Invite-Only Growth',
    description:
      'Grow your circle by inviting real friends. Every invite is tracked. Referred users get priority matching. Quality over quantity.',
    color: 'green-400',
  },
  {
    icon: Lock,
    title: 'Safety-First Design',
    description:
      'Block, report, and share date plans with a trusted friend. We built the safety center before we built the swipe button.',
    color: 'blue-400',
  },
]

const testimonials = [
  { name: 'Maya, 27', location: 'Denver', text: 'First app where I actually met someone in person within the first week. The date planning feature is genius.', vibe: 'Adrenaline junkie' },
  { name: 'Marcus, 31', location: 'Chicago', text: 'The compatibility scores are scary accurate. Matched with someone at 94% and we\'ve been together 3 months.', vibe: 'Building things' },
  { name: 'Nina, 30', location: 'Miami', text: 'Finally a platform where I don\'t get 50 "hey" messages. The icebreakers actually start real conversations.', vibe: 'Dropping beats' },
]

const stats = [
  { number: '89%', label: 'Verified profiles' },
  { number: '3.2x', label: 'More real dates than Tinder' },
  { number: '94', label: 'Average match score' },
  { number: '<48h', label: 'To first real date' },
]

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-kp-dark overflow-hidden">
      {/* Nav Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-kp-dark/70 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="glow-text font-display text-xl font-bold">MeetKP</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-kp-muted hover:text-white transition px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/register" className="text-sm bg-kp-primary/20 hover:bg-kp-primary/30 text-kp-primary border border-kp-primary/30 px-4 py-1.5 rounded-full transition">
              Join Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-kp-dark via-kp-dark to-kp-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(225,29,72,0.12)_0%,_transparent_60%)]" />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/3 left-1/5 w-80 h-80 bg-kp-primary/8 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-kp-secondary/8 rounded-full blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Social proof badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8"
          >
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-kp-primary/40 border border-kp-dark" />
              <div className="w-6 h-6 rounded-full bg-kp-secondary/40 border border-kp-dark" />
              <div className="w-6 h-6 rounded-full bg-kp-accent/40 border border-kp-dark" />
            </div>
            <span className="text-sm text-kp-muted">Real people making real connections</span>
            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6"
          >
            Stop Swiping
            <br />
            Into the <span className="glow-text">Void</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-lg sm:text-xl text-kp-muted max-w-2xl mx-auto mb-4"
          >
            Tinder is a slot machine. Match is a tax form. MeetKP is where real people actually meet.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-sm text-kp-muted/70 mb-10"
          >
            AI-matched. Verified. Built for dates, not dopamine.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/register" className="btn-primary text-center text-lg flex items-center justify-center gap-2">
              Get Started Free <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-ghost text-center text-lg">
              I Have an Account
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl sm:text-3xl font-bold glow-text">{stat.number}</p>
                <p className="text-xs text-kp-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-5xl font-bold mb-4">
              How MeetKP <span className="glow-text">Actually Works</span>
            </h2>
            <p className="text-kp-muted max-w-lg mx-auto">
              Three steps. No games. No paywalls hiding the people who liked you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Build Your Profile', desc: 'Answer fun prompts. Add your vibe tagline. Get verified with a quick selfie. Takes 2 minutes, not 20.', icon: Sparkles },
              { step: '02', title: 'Discover Real Matches', desc: 'Our AI scores every profile on compatibility — interests, personality, location. Best matches appear first, always.', icon: Heart },
              { step: '03', title: 'Meet in Person', desc: 'Use icebreakers to start real convos. Plan a date inside the app. Share your plans with friends for safety.', icon: CalendarHeart },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i + 1}
                className="relative"
              >
                <span className="font-display text-7xl font-bold text-white/3 absolute -top-4 -left-2">{item.step}</span>
                <div className="relative z-10 pt-8">
                  <item.icon className="w-8 h-8 text-kp-primary mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-kp-muted leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 px-4 bg-kp-surface/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-5xl font-bold mb-4">
              Everything Other Apps <span className="glow-text">Forgot</span>
            </h2>
            <p className="text-kp-muted max-w-lg mx-auto">
              We didn&apos;t just rebuild the swipe. We rebuilt the entire experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                custom={i}
                className="card p-6 hover:border-kp-primary/20 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className={`w-10 h-10 rounded-lg bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-5 h-5 text-${feature.color}`} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-kp-muted text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Real People. <span className="glow-text">Real Stories.</span>
            </h2>
          </motion.div>

          <div className="relative">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: activeTestimonial === i ? 1 : 0, y: activeTestimonial === i ? 0 : 20 }}
                transition={{ duration: 0.5 }}
                className={`card p-8 text-center ${activeTestimonial === i ? '' : 'absolute inset-0 pointer-events-none'}`}
              >
                <div className="flex justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-white/90 mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                <p className="font-semibold">{t.name}</p>
                <p className="text-kp-muted text-sm">{t.location} &middot; {t.vibe}</p>
              </motion.div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeTestimonial === i ? 'bg-kp-primary w-6' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-t from-kp-primary/15 via-kp-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(225,29,72,0.15)_0%,_transparent_50%)]" />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-12 h-12 text-kp-primary mx-auto mb-6 fill-kp-primary/30" />
          </motion.div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Your Person Is Already Here
          </h2>
          <p className="text-kp-muted text-lg mb-10">
            Join MeetKP. Get verified. Start meeting real people today.
          </p>
          <Link href="/register" className="btn-primary text-lg inline-flex items-center gap-2">
            Create Your Profile <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="text-kp-muted/60 text-sm mt-4">Free to join. No credit card required.</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <span className="glow-text font-display text-xl font-bold">MeetKP</span>
              <p className="text-kp-muted text-sm mt-2">Where real connections happen.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Platform</h4>
              <div className="space-y-2 text-sm text-kp-muted">
                <Link href="/register" className="block hover:text-white transition">Join MeetKP</Link>
                <Link href="/login" className="block hover:text-white transition">Sign In</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Safety</h4>
              <div className="space-y-2 text-sm text-kp-muted">
                <p>Verified profiles</p>
                <p>Report &amp; block tools</p>
                <p>Date plan sharing</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-kp-muted text-xs">&copy; {new Date().getFullYear()} MeetKP. All rights reserved.</p>
            <p className="text-kp-muted/50 text-xs">Built for real people, not engagement metrics.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
