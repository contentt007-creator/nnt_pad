import { useAuthStore } from '../store/authStore'

export default function GoogleAuth({ isMobile = false }) {
  const user      = useAuthStore(s => s.user)
  const clearUser = useAuthStore(s => s.clearUser)

  if (!user) return null

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
        onClick={clearUser}
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
