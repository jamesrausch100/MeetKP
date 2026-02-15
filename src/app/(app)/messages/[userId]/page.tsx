'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  createdAt: string
  isMine: boolean
}

interface ChatUser {
  userId: string
  name: string
  photos: string[]
}

export default function MessagesPage() {
  const params = useParams()
  const userId = params.userId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages ?? [])
        if (data.otherUser) {
          setOtherUser(data.otherUser)
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = newMessage.trim()
    if (!content || sending) return

    setSending(true)
    setNewMessage('')

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: userId, content }),
      })

      if (res.ok) {
        const msg = await res.json()
        setMessages((prev) => [...prev, { ...msg, isMine: true }])
      }
    } catch {
      // restore message on failure
      setNewMessage(content)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-kp-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-lg mx-auto">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-kp-surface/50 backdrop-blur-sm">
        <Link
          href="/matches"
          className="w-9 h-9 rounded-full bg-kp-card flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {otherUser?.photos?.[0] && (
          <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10">
            <img
              src={otherUser.photos[0]}
              alt={otherUser.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">
            {otherUser?.name ?? 'Chat'}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages.length === 0 && (
          <div className="text-center text-kp-muted py-12">
            <p>No messages yet. Say something!</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={msg.id ?? i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.isMine
                  ? 'bg-kp-primary text-white rounded-br-md'
                  : 'bg-kp-card text-white border border-white/5 rounded-bl-md'
              }`}
            >
              <p>{msg.content}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.isMine ? 'text-white/50' : 'text-kp-muted'
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="px-4 py-3 border-t border-white/5 bg-kp-surface/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1 !rounded-full !py-2.5"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-full bg-kp-primary flex items-center justify-center
                       hover:bg-kp-primary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed
                       active:scale-90 flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  )
}
