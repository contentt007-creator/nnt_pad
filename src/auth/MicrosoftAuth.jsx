import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { msLoginRequest } from './msalConfig'

export default function MicrosoftAuth({ isMobile = false }) {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const clientId = import.meta.env.VITE_MS_CLIENT_ID
  const isConfigured = clientId && clientId !== 'YOUR_AZURE_CLIENT_ID_HERE'

  if (!isConfigured) {
    if (isMobile) return null
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '100%', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.08)' }}
        title="Set VITE_MS_CLIENT_ID in .env to enable OneDrive"
      >
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.5 }}>
          OneDrive not configured
        </span>
      </div>
    )
  }

  const user = accounts[0]
  const login  = () => instance.loginPopup(msLoginRequest).catch(console.error)
  const logout = () => instance.logoutPopup({ account: user }).catch(console.error)

  if (isAuthenticated && user) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: isMobile ? '0 8px' : '0 12px',
        height: '100%', flexShrink: 0,
        borderLeft: '1px solid rgba(255,255,255,0.1)',
      }}>
        <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, flexShrink: 0 }} fill="none">
          <path d="M10.2 6.4a5.6 5.6 0 0 1 9.7 3.1A4 4 0 0 1 22 13.2a4 4 0 0 1-4 3.8H6a4 4 0 0 1-.5-8 5.6 5.6 0 0 1 4.7-2.6z"
            fill="rgba(255,255,255,0.7)" />
        </svg>
        {!isMobile && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name || user.username}
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
      onClick={login}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: isMobile ? '0 10px' : '0 12px',
        height: 30, borderRadius: 6, margin: '0 6px',
        background: 'linear-gradient(135deg, #0078d4, #005a9e)',
        border: 'none', color: '#fff',
        fontSize: 11, fontWeight: 600,
        cursor: 'pointer', flexShrink: 0,
        fontFamily: "'DM Sans', sans-serif",
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      title="Sign in to save documents to OneDrive"
    >
      <svg viewBox="0 0 21 21" style={{ width: 13, height: 13 }} fill="currentColor">
        <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
        <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
        <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
      </svg>
      {!isMobile && 'OneDrive'}
    </button>
  )
}
