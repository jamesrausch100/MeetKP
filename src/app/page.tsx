'use client'

import { motion } from 'framer-motion'
import { Heart, Shield, Sparkles, CalendarHeart } from 'lucide-react'
import Link from 'next/link'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
}

const features = [
  {
    icon: Shield,
    title: 'Real People',
    description:
      'Every profile is verified. No catfish. No bots. Just real humans looking for real connection.',
  },
  {
    icon: Sparkles,
    title: 'Smart Matching',
    description:
      'AI-powered discovery that learns what you actually want — not just what you swipe on at 2 AM.',
  },
  {
    icon: CalendarHeart,
    title: 'Actually Meet',
    description:
      'Built-in date planning tools so you stop texting forever and start making plans.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-kp-dark">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-kp-dark via-kp-dark to-kp-primary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(225,29,72,0.15)_0%,_transparent_70%)]" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-kp-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-kp-secondary/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="glow-text font-display text-2xl font-bold tracking-tight">
              MeetKP
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display text-5xl sm:text-7xl font-bold leading-tight mb-6"
          >
            Stop Swiping.
            <br />
            <span className="glow-text">Start Meeting.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg sm:text-xl text-kp-muted max-w-xl mx-auto mb-10"
          >
            Where real people make real connections. No bots. No games. Just you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register" className="btn-primary text-center text-lg">
              Get Started
            </Link>
            <Link href="/login" className="btn-ghost text-center text-lg">
              I Have an Account
            </Link>
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

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            custom={0}
            className="font-display text-3xl sm:text-4xl font-bold text-center mb-4"
          >
            Dating, but make it{' '}
            <span className="glow-text">not terrible</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            custom={1}
            className="text-kp-muted text-center mb-16 max-w-lg mx-auto"
          >
            We built MeetKP because every other app forgot the point: actually
            meeting someone.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                custom={i + 2}
                className="card p-8 hover:border-kp-primary/20 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-kp-primary/10 flex items-center justify-center mb-5 group-hover:bg-kp-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-kp-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-kp-muted leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-t from-kp-primary/10 to-transparent" />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <Heart className="w-10 h-10 text-kp-primary mx-auto mb-6" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Your next story starts here
          </h2>
          <p className="text-kp-muted mb-8">
            Join thousands of people who are done with the swipe circus.
          </p>
          <Link href="/register" className="btn-primary text-lg inline-block">
            Create Your Profile
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="glow-text font-display text-lg font-bold">
            MeetKP
          </span>
          <p className="text-kp-muted text-sm">
            &copy; {new Date().getFullYear()} MeetKP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
