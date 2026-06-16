'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 ¡Hola! Soy Bood, tu asistente de ventas de **Bood Supply**. ¿En qué te puedo ayudar hoy? Puedo darte información sobre productos, precios y cómo hacer tu pedido.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 100) }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch('/api/chat-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.slice(-10) })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Lo siento, hubo un error. Llámanos al (312) 409-0106.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Hubo un error. Por favor llámanos al (312) 409-0106 o escríbenos a boodsupplies@gmail.com' }])
    }
    setLoading(false)
  }

  function formatMsg(text: string) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
  }

  const suggestions = ['¿Qué productos tienen?', 'Precios de foam containers', '¿Cómo hago un pedido?', 'Información de contacto']

  return (
    <>
      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:brightness-110"
        style={{ background: 'linear-gradient(135deg, #F47B20 0%, #e55a00 100%)', boxShadow: '0 8px 32px rgba(244,123,32,0.45)' }}>
        {open ? (
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 4-3 6-3 6H8s-3-2-3-6a7 7 0 0 1 7-7z"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/><circle cx="9" cy="9" r="1" fill="white" stroke="none"/><circle cx="12" cy="8" r="1" fill="white" stroke="none"/><circle cx="15" cy="9" r="1" fill="white" stroke="none"/></svg>
        )}
        {!open && unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{unread}</span>}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-24px)] rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '520px', background: '#fff' }}>
          <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #0A1F3D 0%, #1a3a6b 100%)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F47B20' }}>
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-sm">Bood — Asistente Virtual</div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-blue-200 text-xs">En línea ahora</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F8FAFC' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5" style={{ background: '#F47B20' }}>
                    <span className="text-white font-bold text-xs">B</span>
                  </div>
                )}
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'text-white rounded-tr-sm' : 'text-gray-800 rounded-tl-sm border border-gray-100'}`}
                  style={msg.role === 'user' ? { background: '#0A1F3D' } : { background: '#fff' }}
                  dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }}/>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5" style={{ background: '#F47B20' }}>
                  <span className="text-white font-bold text-xs">B</span>
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#0A1F3D', animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#0A1F3D', animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#0A1F3D', animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {messages.length <= 1 && (
            <div className="px-3 py-2 flex gap-2 overflow-x-auto" style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50) }}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors hover:border-orange-400 hover:text-orange-600"
                  style={{ borderColor: '#CBD5E0', color: '#4A5568', background: 'white' }}>{s}</button>
              ))}
            </div>
          )}

          <div className="p-3 flex gap-2 items-center" style={{ background: 'white', borderTop: '1px solid #E2E8F0' }}>
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 text-sm px-3 py-2 rounded-xl border outline-none transition-colors"
              style={{ borderColor: '#E2E8F0' }}
              onFocus={e => (e.target.style.borderColor = '#F47B20')}
              onBlur={e => (e.target.style.borderColor = '#E2E8F0')}/>
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: '#F47B20' }}>
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <div className="px-3 pb-2 text-center" style={{ background: 'white' }}>
            <span className="text-xs text-gray-400">Bood Supply · </span>
            <span className="text-xs text-gray-400">(312) 409-0106</span>
          </div>
        </div>
      )}
    </>
  )
}