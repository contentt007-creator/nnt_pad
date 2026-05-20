import { useRef, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

const DOC_COLORS = {
  invoice:   '#224E5F',
  bill:      '#1a3d4d',
  quotation: '#5a7a3a',
  chalan:    '#7a4a2a',
}

function fmtTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function HistoryPanel({ onClose }) {
  const history      = useAuthStore(s => s.history)
  const clearHistory = useAuthStore(s => s.clearHistory)
  const panelRef     = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!panelRef.current?.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: 56, right: 8,
        width: 340,
        maxHeight: '80vh',
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
        border: '1px solid rgba(34,78,95,0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 999,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 12px',
        borderBottom: '1px solid #f0ede8',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2744' }}>Document History</div>
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>
            {history.length} {history.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {history.length > 0 && (
            <button
              onClick={() => { if (window.confirm('Clear all history?')) clearHistory() }}
              style={{
                fontSize: 10, color: '#e74c3c', background: 'rgba(231,76,60,0.08)',
                border: 'none', borderRadius: 5, padding: '4px 9px',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 18, color: '#ccc', lineHeight: 1, padding: '0 2px',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#666'}
            onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
          >
            ×
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {history.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 12, color: '#bbb' }}>No history yet.</div>
            <div style={{ fontSize: 11, color: '#ccc', marginTop: 4 }}>
              Generate a PDF while signed in to start tracking.
            </div>
          </div>
        ) : (
          history.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: '11px 16px',
                borderBottom: '1px solid #f7f4ef',
                display: 'flex',
                gap: 11,
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <div style={{ flexShrink: 0, marginTop: 1 }}>
                {entry.picture
                  ? <img src={entry.picture} alt="" style={{ width: 30, height: 30, borderRadius: '50%' }} />
                  : <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: DOC_COLORS[entry.docType] || '#224E5F',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>
                      {entry.userName?.[0]?.toUpperCase() || '?'}
                    </div>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1a2744', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.userName || entry.email}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8,
                    color: '#fff', background: DOC_COLORS[entry.docType] || '#224E5F',
                    padding: '2px 7px', borderRadius: 20, flexShrink: 0,
                  }}>
                    {entry.docType}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.email}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                  {entry.invoiceNumber && (
                    <span style={{ fontSize: 10, color: '#D77B49', fontWeight: 600 }}>
                      #{entry.invoiceNumber}
                    </span>
                  )}
                  {entry.clientName && (
                    <span style={{ fontSize: 10, color: '#888' }}>
                      → {entry.clientName}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 9.5, color: '#bbb', marginTop: 3 }}>
                  {fmtTime(entry.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
