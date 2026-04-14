import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { msLoginRequest } from './msalConfig'

/**
 * Compact sign-in / user badge for Microsoft / OneDrive.
 * Renders nothing if Azure Client ID is not configured.
 */
export default function MicrosoftAuth() {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const clientId = import.meta.env.VITE_MS_CLIENT_ID
  const isConfigured = clientId && clientId !== 'YOUR_AZURE_CLIENT_ID_HERE'

  // Not configured — show a subtle prompt
  if (!isConfigured) {
    return (
      <div
        className="flex items-center px-3 h-full flex-shrink-0"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}
        title="Set VITE_MS_CLIENT_ID in .env to enable OneDrive"
      >
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.5 }}>
          OneDrive not configured
        </span>
      </div>
    )
  }

  const user = accounts[0]

  const login = () =>
    instance.loginPopup(msLoginRequest).catch(err => console.error('MS login error', err))

  const logout = () =>
    instance.logoutPopup({ account: user }).catch(console.error)

  if (isAuthenticated && user) {
    return (
      <div
        className="flex items-center gap-2 px-3 h-full flex-shrink-0"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* OneDrive icon */}
        <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, flexShrink: 0 }} fill="none">
          <path d="M10.2 6.4a5.6 5.6 0 0 1 9.7 3.1A4 4 0 0 1 22 13.2a4 4 0 0 1-4 3.8H6a4 4 0 0 1-.5-8 5.6 5.6 0 0 1 4.7-2.6z"
            fill="rgba(255,255,255,0.7)" />
        </svg>
        <span className="text-[11px] hidden sm:block max-w-[90px] truncate"
              style={{ color: 'rgba(255,255,255,0.65)' }}>
          {user.name || user.username}
        </span>
        <button
          onClick={logout}
          className="text-[10px] uppercase tracking-wider transition-colors ml-1 px-2 py-1 rounded"
          style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={login}
      className="flex items-center gap-1.5 px-3 h-7 rounded-md text-[11px] font-semibold
                 text-white transition-all flex-shrink-0 border-none cursor-pointer shadow-sm mx-1"
      style={{ background: 'linear-gradient(135deg, #0078d4, #005a9e)' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      title="Sign in to save documents to OneDrive automatically"
    >
      {/* Microsoft icon */}
      <svg viewBox="0 0 21 21" style={{ width: 13, height: 13 }} fill="currentColor">
        <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
        <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
        <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
      </svg>
      OneDrive
    </button>
  )
}
