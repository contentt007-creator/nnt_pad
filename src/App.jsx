import { useState, useEffect } from 'react'
import { useHistory } from './hooks/useHistory'
import { useAuthStore } from './store/authStore'
import Header from './components/Header'
import FormPanel from './components/FormPanel'
import DocumentPreview from './components/DocumentPreview'
import DocTypeModal from './components/DocTypeModal'
import Toast from './components/Toast'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function LoginGate() {
  const setUser  = useAuthStore(s => s.setUser)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // After Google redirects back, the access_token is in the URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    const params = new URLSearchParams(hash)
    const token  = params.get('access_token')
    if (!token) return

    setLoading(true)
    // Clean up the URL immediately so it looks tidy
    window.history.replaceState({}, '', window.location.pathname)

    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setUser({ email: data.email, name: data.name, picture: data.picture }))
      .catch(() => { setError('Sign-in failed. Please try again.'); setLoading(false) })
  }, [setUser])

  const signIn = () => {
    const params = new URLSearchParams({
      client_id:    GOOGLE_CLIENT_ID,
      redirect_uri: window.location.origin,
      response_type: 'token',
      scope: 'openid email profile',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a3d4d 0%, #224E5F 60%, #2d6478 100%)',
      fontFamily: "'DM Sans', sans-serif",
      padding: '24px 16px',
      boxSizing: 'border-box',
    }}>
      {/* Card */}
      <div style={{
        background: '#fff', borderRadius: 20,
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        padding: '40px 32px 36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: 360,
        boxSizing: 'border-box',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <img src="/nnt-logo.png" alt="NNT"
            style={{ height: 36, objectFit: 'contain' }} />
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#224E5F', letterSpacing: 2, lineHeight: 1 }}>NNT</div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#D77B49', textTransform: 'uppercase', marginTop: 2 }}>Editor</div>
          </div>
        </div>

        <div style={{ width: 40, height: 2, background: '#D77B49', borderRadius: 2, margin: '14px 0 22px' }} />

        <div style={{ fontSize: 17, fontWeight: 700, color: '#1a2744', marginBottom: 6, textAlign: 'center' }}>
          Welcome back
        </div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 28, textAlign: 'center', lineHeight: 1.6 }}>
          Sign in with your Google account<br />to access NNT Editor
        </div>

        <button
          onClick={signIn}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '13px 20px',
            background: loading ? '#f5f5f5' : '#fff',
            border: '1.5px solid #ddd',
            borderRadius: 10,
            cursor: loading ? 'default' : 'pointer',
            fontSize: 13, fontWeight: 600, color: loading ? '#aaa' : '#333',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'box-shadow 0.15s',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {loading ? (
            <span>Signing in…</span>
          ) : (
            <>
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, flexShrink: 0 }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        {error && (
          <div style={{ marginTop: 14, fontSize: 11, color: '#e74c3c', textAlign: 'center' }}>{error}</div>
        )}

        <div style={{ marginTop: 24, fontSize: 10, color: '#ccc', textAlign: 'center' }}>
          NNT Business Solutions · Authorised access only
        </div>
      </div>
    </div>
  )
}

const ACCESS_CODE = '33113'

function CodeGate({ onVerified }) {
  const [input,    setInput]    = useState('')
  const [error,    setError]    = useState('')
  const [shaking,  setShaking]  = useState(false)
  const user = useAuthStore(s => s.user)

  const verify = () => {
    if (input.trim() === ACCESS_CODE) {
      onVerified()
    } else {
      setError('Incorrect code. Try again.')
      setShaking(true)
      setInput('')
      setTimeout(() => setShaking(false), 500)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a3d4d 0%, #224E5F 60%, #2d6478 100%)',
      fontFamily: "'DM Sans', sans-serif",
      padding: '24px 16px', boxSizing: 'border-box',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20,
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        padding: '40px 32px 36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: 360, boxSizing: 'border-box',
        animation: shaking ? 'shake 0.4s ease' : 'none',
      }}>
        {/* Avatar */}
        <div style={{ marginBottom: 16 }}>
          {user?.picture
            ? <img src={user.picture} alt="" style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid #224E5F' }} />
            : <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#224E5F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff' }}>
                {user?.name?.[0]?.toUpperCase() || '?'}
              </div>
          }
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a2744', marginBottom: 4, textAlign: 'center' }}>
          Hi, {user?.name?.split(' ')[0] || 'there'} 👋
        </div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 28, textAlign: 'center', lineHeight: 1.6 }}>
          Enter your access code to continue
        </div>

        <input
          type="password"
          inputMode="numeric"
          maxLength={10}
          placeholder="_ _ _ _ _"
          value={input}
          onChange={e => { setInput(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && verify()}
          autoFocus
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '14px 18px',
            fontSize: 22, fontWeight: 700, letterSpacing: 10,
            textAlign: 'center',
            border: error ? '2px solid #e74c3c' : '2px solid #e0e0e0',
            borderRadius: 10, outline: 'none',
            fontFamily: "'DM Sans', sans-serif",
            color: '#1a2744',
            transition: 'border-color 0.15s',
          }}
        />

        {error && (
          <div style={{ marginTop: 10, fontSize: 11, color: '#e74c3c', textAlign: 'center' }}>{error}</div>
        )}

        <button
          onClick={verify}
          style={{
            marginTop: 18, width: '100%',
            padding: '13px 20px',
            background: 'linear-gradient(135deg, #224E5F, #1a3d4d)',
            border: 'none', borderRadius: 10,
            color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', letterSpacing: 0.5,
            fontFamily: "'DM Sans', sans-serif",
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Enter →
        </button>

        <div style={{ marginTop: 20, fontSize: 10, color: '#ccc', textAlign: 'center' }}>
          NNT Business Solutions · Authorised access only
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0) }
          20%      { transform: translateX(-8px) }
          40%      { transform: translateX(8px) }
          60%      { transform: translateX(-6px) }
          80%      { transform: translateX(6px) }
        }
      `}</style>
    </div>
  )
}

export default function App() {
  useHistory()
  const isMobile = useIsMobile()
  const [mobileTab,    setMobileTab]    = useState('form')
  const [codeVerified, setCodeVerified] = useState(false)   // resets every session
  const user = useAuthStore(s => s.user)

  if (!user) return <LoginGate />
  if (!codeVerified) return <CodeGate onVerified={() => setCodeVerified(true)} />

  return (
    <div className="flex flex-col font-sans text-[13px] text-gray-900 bg-bg select-none"
         style={{ height: '100dvh', minHeight: '100dvh' }}>
      <Header />

      {/* ── Mobile tab bar ── */}
      {isMobile && (
        <div style={{
          display: 'flex',
          flexShrink: 0,
          background: '#fff',
          borderBottom: '1px solid #e8e4dc',
        }}>
          {[['form', '✏️', 'Form'], ['preview', '👁', 'Preview']].map(([tab, icon, label]) => {
            const active = mobileTab === tab
            return (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                style={{
                  flex: 1,
                  padding: '11px 0 9px',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  border: 'none',
                  borderBottom: active ? '2.5px solid #224E5F' : '2.5px solid transparent',
                  background: active ? 'rgba(34,78,95,0.05)' : 'transparent',
                  color: active ? '#224E5F' : '#999',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{ fontSize: 15 }}>{icon}</span>
                {label}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">
        {isMobile ? (
          mobileTab === 'form'
            ? <FormPanel isMobile />
            : <DocumentPreview isMobile />
        ) : (
          <>
            <FormPanel />
            <DocumentPreview />
          </>
        )}
      </div>

      <DocTypeModal />
      <Toast />
    </div>
  )
}
