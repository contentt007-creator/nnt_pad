import { useGoogleLogin, googleLogout } from '@react-oauth/google'
import { useAuthStore } from '../store/authStore'

export default function GoogleAuth({ isMobile = false }) {
  const user      = useAuthStore(s => s.user)
  const setUser   = useAuthStore(s => s.setUser)
  const clearUser = useAuthStore(s => s.clearUser)

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const data = await res.json()
        setUser({ email: data.email, name: data.name, picture: data.picture })
      } catch (e) {
        console.error('Failed to fetch Google user info', e)
      }
    },
    onError: () => console.error('Google login failed'),
  })

  const logout = () => { googleLogout(); clearUser() }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId || clientId.includes('your_client_id')) return null

  if (user) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: isMobile ? '0 8px' : '0 12px',
        height: '100%', flexShrink: 0,
        borderLeft: '1px solid rgba(255,255,255,0.1)',
      }}>
        {user.picture
          ? <img src={user.picture} alt="" style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0 }} />
          : <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#D77B49', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
        }
        {!isMobile && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name}
          </span>
        )}
        <button
          onClick={logout}
          style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8,
            color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.06)',
            border: 'none', cursor: 'pointer', padding: '3px 7px', borderRadius: 4,
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
        >
          {isMobile ? '✕' : 'Sign out'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => login()}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: isMobile ? '0 10px' : '0 12px',
        height: 30, borderRadius: 6, margin: '0 4px',
        background: '#fff',
        border: 'none', cursor: 'pointer', flexShrink: 0,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11, fontWeight: 600, color: '#444',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      title="Sign in with Google to track document history"
    >
      <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, flexShrink: 0 }}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {!isMobile && 'Sign in'}
    </button>
  )
}
