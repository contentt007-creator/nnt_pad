import { useGoogleLogin } from '@react-oauth/google'
import { useEditorStore } from '../store/editorStore'

export default function GoogleAuth() {
  const user      = useEditorStore(s => s.user)
  const setUser   = useEditorStore(s => s.setUser)
  const setToken  = useEditorStore(s => s.setAccessToken)
  const logout    = useEditorStore(s => s.logout)
  const showToast = useEditorStore(s => s.showToast)

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.file',
    onSuccess: async (tokenResponse) => {
      setToken(tokenResponse.access_token)
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const profile = await res.json()
        setUser(profile)
        showToast(`Signed in as ${profile.name} ✓`)
      } catch {
        setUser({ name: 'Google User' })
      }
    },
    onError: () => showToast('Google sign-in failed'),
  })

  if (user) {
    return (
      <div className="flex items-center gap-2 px-3 h-12 border-l flex-shrink-0"
           style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        {user.picture && (
          <img src={user.picture} alt={user.name}
               className="w-6 h-6 rounded-full ring-2"
               style={{ ringColor: '#D77B49' }} />
        )}
        <span className="text-white/70 text-[11px] hidden sm:block max-w-[90px] truncate">
          {user.name}
        </span>
        <button
          onClick={logout}
          className="text-[10px] uppercase tracking-wider transition-colors ml-1 px-2 py-1 rounded"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => login()}
      className="flex items-center gap-1.5 mr-2 px-3 h-7 rounded-md text-[11px] font-semibold
                 text-white transition-all flex-shrink-0 border-none cursor-pointer shadow-sm"
      style={{ background: 'linear-gradient(135deg, #D77B49, #e08a5c)' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
      </svg>
      Sign in with Google
    </button>
  )
}
