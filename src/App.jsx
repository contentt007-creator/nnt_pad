import { useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useHistory } from './hooks/useHistory'
import { useAuthStore } from './store/authStore'
import Header from './components/Header'
import FormPanel from './components/FormPanel'
import DocumentPreview from './components/DocumentPreview'
import DocTypeModal from './components/DocTypeModal'
import Toast from './components/Toast'

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
  const setUser = useAuthStore(s => s.setUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // On page load, check for OAuth redirect token in URL hash/params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('access_token')
    if (accessToken) {
      setLoading(true)
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then(r => r.json())
        .then(data => {
          setUser({ email: data.email, name: data.name, picture: data.picture })
          window.history.replaceState({}, '', window.location.pathname)
        })
        .catch(() => setLoading(false))
    }
  }, [setUser])

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const data = await res.json()
        setUser({ email: data.email, name: data.name, picture: data.picture })
      } catch (e) {
        setError('Failed to fetch profile. Please try again.')
        setLoading(false)
      }
    },
    onError: () => { setError('Google sign-in failed. Please try again.'); setLoading(false) },
    // redirect flow works on all mobile browsers (no popup blocker issues)
    ux_mode: 'redirect',
    redirect_uri: window.location.origin,
  })

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a3d4d 0%, #224E5F 60%, #2d6478 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Card */}
      <div style={{
        background: '#fff', borderRadius: 20,
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        padding: '48px 44px 40px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 'min(380px, 90vw)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <img src="/nnt-logo.png" alt="NNT"
            style={{ height: 38, objectFit: 'contain' }} />
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#224E5F', letterSpacing: 2, lineHeight: 1 }}>NNT</div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#D77B49', textTransform: 'uppercase', marginTop: 2 }}>Editor</div>
          </div>
        </div>

        <div style={{ width: 40, height: 2, background: '#D77B49', borderRadius: 2, margin: '14px 0 22px' }} />

        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a2744', marginBottom: 6, textAlign: 'center' }}>
          Welcome back
        </div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 32, textAlign: 'center', lineHeight: 1.5 }}>
          Sign in with your Google account<br />to access NNT Editor
        </div>

        <button
          onClick={() => { setError(''); login() }}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '13px 20px',
            background: loading ? '#f5f5f5' : '#fff',
            border: '1.5px solid #e0e0e0',
            borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 600, color: '#333',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.15s',
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.14)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          {loading ? (
            <span style={{ fontSize: 13, color: '#999' }}>Signing in…</span>
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

        <div style={{ marginTop: 28, fontSize: 10, color: '#ccc', textAlign: 'center' }}>
          NNT Business Solutions · Authorised access only
        </div>
      </div>
    </div>
  )
}

export default function App() {
  useHistory()
  const isMobile = useIsMobile()
  const [mobileTab, setMobileTab] = useState('form')
  const user = useAuthStore(s => s.user)

  if (!user) return <LoginGate />

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
