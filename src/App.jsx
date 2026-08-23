import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Copy, Menu, Moon, Search, Send, Sun, X } from 'lucide-react'
import './App.css'
import { useAuth } from './context/AuthContext'
import AuthModal from './components/AuthModal'

const knownModels = ['llava:latest', 'qwen2.5:14b', 'gpt-oss:20b', 'llama3.2:latest', 'qwen2.5-coder:14b', 'qwen3:8b', 'llama3.1:8b', 'qwen2.5-coder:7b']
const curlCommand = 'curl -fsSL https://ollama.com/install.sh | sh'
const starterPrompts = [
  'What can my local models help with today?',
  'Draft a short, clear commit message.',
  'Explain why local inference keeps data private.',
]

function LlamaMark({ small = false }) {
  return (
    <span className={`llama-mark ${small ? 'small' : ''}`} aria-hidden="true">
      <span>◡</span>
      <i></i>
      <b></b>
    </span>
  )
}

function readTheme() {
  const saved = localStorage.getItem('nexus-theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function demoReply(content, model) {
  return `This is the public Nexus workspace. Your note stayed in the browser:\n\n“${content}”\n\nTo talk to ${model} for real, run Ollama on your machine and start Nexus locally:\n\nollama serve\nnpm run dev\n\nThe website is the UI. The model never has to leave your computer.`
}

function App() {
  const { user } = useAuth();
  const [models, setModels] = useState(knownModels.map((name) => ({ name })))
  const [online, setOnline] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [copied, setCopied] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [theme, setTheme] = useState(readTheme)
  const [chatMessages, setChatMessages] = useState([])
  const [chatModel, setChatModel] = useState('qwen3:8b')
  const threadRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetch('/api/models')
      .then((response) => response.json())
      .then((data) => {
        if (data.models?.length) {
          setModels(data.models)
          setChatModel((current) => (data.models.some((model) => model.name === current) ? current : data.models[0].name))
        }
        setOnline(Boolean(data.online))
      })
      .catch(() => setOnline(false))
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('nexus-theme', theme)
  }, [theme])

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [chatMessages, sending, chatOpen])

  useEffect(() => {
    if (chatOpen) inputRef.current?.focus()
  }, [chatOpen])

  const copyCommand = async () => {
    await navigator.clipboard?.writeText(curlCommand)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const askNexus = async (nextPrompt = prompt) => {
    if (!nextPrompt.trim() || sending) return
    const content = nextPrompt.trim()
    const history = [...chatMessages, { role: 'user', content }]
    setSending(true)
    setChatMessages(history)
    setPrompt('')
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: chatModel, messages: history }),
      })
      const data = await response.json()
      const text = data.message?.content || data.error || demoReply(content, chatModel)
      setChatMessages((current) => [...current, { role: 'assistant', content: text }])
    } catch {
      setChatMessages((current) => [...current, { role: 'assistant', content: demoReply(content, chatModel) }])
    } finally {
      setSending(false)
    }
  }

  const openChat = (seed = '') => {
    setChatOpen(true)
    setMobileNav(false)
    if (seed) setPrompt(seed)
  }

  return (
    {!user && <AuthModal />}
    <div className="site-shell">
      <header className="primary-nav">
        <a className="brand" href="#top" aria-label="Nexus home">
          <LlamaMark small />
          <span>nexus</span>
        </a>
        <nav className={mobileNav ? 'nav-links open' : 'nav-links'}>
          <a href="#models" onClick={() => setMobileNav(false)}>Models</a>
          <a href="#automate" onClick={() => setMobileNav(false)}>Docs</a>
          <a href="#pricing" onClick={() => setMobileNav(false)}>Pricing</a>
          <a href="#faq" onClick={() => setMobileNav(false)}>FAQ</a>
          <button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={19} /></button>
        </nav>
        <div className="nav-tools">
          <label className="search-pill">
            <Search size={15} />
            <input aria-label="Search models" placeholder="Search models" />
          </label>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle dark mode">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a className="sign-in" href="#chat" onClick={(event) => { event.preventDefault(); openChat() }}>Sign in</a>
          <button className="pill primary" onClick={() => openChat()}>Open Nexus</button>
        </div>
        <button className="menu-toggle" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21} /></button>
      </header>

      <main id="top">
        <section className="hero reading-column">
          <LlamaMark />
          <h1>The easiest way to build with open models</h1>
          <p className="hero-copy">Run powerful AI models locally on your Mac. Private by default, simple by design.</p>
          <div className="install-snippet">
            <code>{curlCommand}</code>
            <button onClick={copyCommand} aria-label="Copy install command">
              <Copy size={16} />
              {copied && <span className="copied">Copied</span>}
            </button>
          </div>
          <div className="hero-actions">
            <button className="pill primary" onClick={() => openChat()}>Start building <ArrowRight size={15} /></button>
            <a className="text-link" href="#models">Explore your models <ArrowRight size={15} /></a>
          </div>
          <p className="availability">
            <span className={online ? 'online-dot' : ''}></span>
            {online ? 'Ollama is running on this Mac' : 'Waiting for Ollama on this Mac'}
          </p>
        </section>

        <section id="automate" className="section split-section reading-column">
          <div>
            <h2>Automate your work</h2>
            <p>Give Nexus a local model and let it help with the work that matters. Your prompts stay close to home, and your tools stay yours.</p>
            <button className="command-tag" onClick={() => openChat()}>nexus chat <ArrowRight size={14} /></button>
          </div>
          <div className="terminal-card">
            <div className="traffic-lights"><i></i><i></i><i></i></div>
            <pre>
              <span className="muted">$ ollama list</span>
              <span className="muted">NAME                  SIZE</span>
              {models.slice(0, 4).map((model) => <span key={model.name}>{model.name.padEnd(21, ' ')} local</span>)}
              <span className="muted">$ ollama run <strong>{models[0]?.name || 'qwen3:8b'}</strong></span>
            </pre>
          </div>
        </section>

        <section id="models" className="section models-section reading-column">
          <div className="section-heading">
            <div>
              <h2>Your local models</h2>
              <p>Everything installed on this machine, ready when you are.</p>
            </div>
            <span className="count">{models.length} available</span>
          </div>
          <div className="model-grid">
            {models.map((model, index) => (
              <div className="model-row" key={model.name}>
                <span className="model-number">{String(index + 1).padStart(2, '0')}</span>
                <strong>{model.name}</strong>
                <code>{model.size ? `${(model.size / 1024 ** 3).toFixed(1)} GB` : 'local'}</code>
                <button onClick={() => openChat(`Tell me what ${model.name} is good at.`)}>Use model <ArrowRight size={14} /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="section privacy reading-column">
          <div className="lock-mark">⌑</div>
          <div>
            <h2>Your data stays yours</h2>
            <p>Every conversation runs through Ollama on your computer. No cloud account, no tracking, no hidden upload.</p>
            <a className="text-link" href="#faq">Read about local-first AI <ArrowRight size={15} /></a>
          </div>
        </section>

        <section id="pricing" className="section pricing-section reading-column">
          <div className="section-title">
            <h2>Start local. Scale when you need to.</h2>
            <p>Nexus is free to use with the models you already have.</p>
          </div>
          <div className="pricing-grid">
            <article className="pricing-card">
              <LlamaMark small />
              <h3>Local</h3>
              <p>For thinking privately on your own machine.</p>
              <div className="price">$0</div>
              <button className="pill primary" onClick={() => openChat()}>Start with local</button>
              <hr />
              <strong>Everything you need:</strong>
              <ul>
                <li><Check size={15} /> All your Ollama models</li>
                <li><Check size={15} /> Private by default</li>
                <li><Check size={15} /> No usage limits</li>
              </ul>
            </article>
            <article className="pricing-card dark-card">
              <LlamaMark small />
              <h3>Nexus Max</h3>
              <p>For harder tasks across your whole workspace.</p>
              <div className="price">Soon</div>
              <button className="pill light">Join the waitlist</button>
              <hr />
              <strong>Coming next:</strong>
              <ul>
                <li><Check size={15} /> Multi-model workflows</li>
                <li><Check size={15} /> Projects and files</li>
                <li><Check size={15} /> Local agent tools</li>
              </ul>
            </article>
          </div>
        </section>

        <section id="faq" className="section faq-section reading-column">
          <h2>Frequently asked questions</h2>
          <div className="faq-row">
            <h3>Does Nexus send my prompts anywhere?</h3>
            <p>No. Nexus talks to the Ollama service running on your machine. Prompts and responses stay local.</p>
          </div>
          <div className="faq-row">
            <h3>Which models can I use?</h3>
            <p>Any model available in your Ollama installation. This page currently sees {models.length} local models.</p>
          </div>
          <div className="faq-row">
            <h3>How do I start Ollama?</h3>
            <p>Run <code>ollama serve</code> in Terminal, then refresh this page. Nexus will connect automatically.</p>
          </div>
        </section>

        <section className="dark-cta reading-column">
          <div>
            <h2>Make something useful.</h2>
            <p>Your local models are ready when you are.</p>
          </div>
          <button className="pill light" onClick={() => openChat()}>Open Nexus <ArrowRight size={15} /></button>
        </section>
      </main>

      <footer className="footer">
        <div>© 2026 Nexus</div>
        <nav>
          <a href="#automate">Docs</a>
          <a href="#models">Models</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <a href="https://github.com/madiyarmoldakhmet-ai/nexus-your-local-ai">GitHub</a>
          <a href="#top">Privacy</a>
        </nav>
      </footer>

      {chatOpen && (
        <div className="chat-workspace" role="dialog" aria-modal="true" aria-label="Nexus local chat">
          <header className="chat-nav">
            <div className="brand">
              <LlamaMark small />
              <span>nexus</span>
              <span className={`chat-status ${online ? 'is-online' : ''}`}><i></i>{online ? 'local' : 'preview'}</span>
            </div>
            <div className="chat-nav-tools">
              <label className="model-pill">
                <select value={chatModel} onChange={(event) => setChatModel(event.target.value)} aria-label="Select model">
                  {models.map((model) => <option key={model.name}>{model.name}</option>)}
                </select>
              </label>
              <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle dark mode">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button className="ghost-pill" onClick={() => setChatMessages([])}>New chat</button>
              <button className="icon-button" onClick={() => setChatOpen(false)} aria-label="Close chat"><X size={18} /></button>
            </div>
          </header>

          <div className="chat-thread" ref={threadRef}>
            {!chatMessages.length && (
              <div className="chat-empty">
                <LlamaMark />
                <h2>What are you working on?</h2>
                <p>Your conversation stays on this machine when Ollama is running. This website is the workspace.</p>
                <div className="starter-row">
                  {starterPrompts.map((item) => (
                    <button key={item} className="starter-chip" onClick={() => askNexus(item)}>{item}</button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((message, index) => (
              <article className={`chat-turn ${message.role}`} key={`${message.role}-${index}`}>
                <span className="chat-avatar">{message.role === 'user' ? 'You' : 'N'}</span>
                <div className="chat-bubble">
                  <small>{message.role === 'user' ? 'You' : chatModel}</small>
                  <p>{message.content}</p>
                </div>
              </article>
            ))}
            {sending && (
              <div className="thinking" aria-live="polite">
                <i></i><i></i><i></i>
              </div>
            )}
          </div>

          <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); askNexus() }}>
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  askNexus()
                }
              }}
              placeholder="Message your local model..."
              rows={1}
            />
            <button className="send-chat" disabled={!prompt.trim() || sending} aria-label="Send message"><Send size={16} /></button>
          </form>
          <p className="chat-hint">{online ? 'Ollama connected · private by default' : 'Website preview · run locally for live models'} · Enter to send</p>
        </div>
      )}
    </div>
  )
}

export default App
