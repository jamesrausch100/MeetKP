'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Compass, Heart, MessageCircle, User, Loader2 } from 'lucide-react'

const navItems = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/matches', label: 'Matches', icon: Heart },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-kp-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-kp-primary animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-kp-dark flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-kp-dark/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-center">
          <Link href="/discover" className="glow-text font-display text-xl font-bold">
            MeetKP
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-kp-dark/90 backdrop-blur-md border-t border-white/5">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'text-kp-primary'
                      : 'text-kp-muted hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]' : ''}`}
                  />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
