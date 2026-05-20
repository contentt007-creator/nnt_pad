import { useState, useRef, useEffect } from 'react'
import { useDocumentStore, DOC_CONFIG } from '../store/documentStore'
import { useEditorStore } from '../store/editorStore'
import { useOneDrive } from '../hooks/useOneDrive'
import { useAuthStore } from '../store/authStore'
import { exportToPDF } from '../lib/exportPDF'
import MicrosoftAuth from '../auth/MicrosoftAuth'
import GoogleAuth from '../auth/GoogleAuth'
import HistoryPanel from './HistoryPanel'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function Header() {
  const showToast     = useEditorStore(s => s.showToast)
  const resetDocument = useDocumentStore(s => s.resetDocument)
  const docType       = useDocumentStore(s => s.docType)
  const metadata      = useDocumentStore(s => s.metadata)
  const clientInfo    = useDocumentStore(s => s.clientInfo)
  const isMobile      = useIsMobile()

  const user       = useAuthStore(s => s.user)
  const addHistory = useAuthStore(s => s.addHistory)
  const history    = useAuthStore(s => s.history)

  const [showODMenu, setShowODMenu]     = useState(false)
  const [odFiles, setOdFiles]           = useState([])
  const [showHistory, setShowHistory]   = useState(false)
  const menuRef    = useRef(null)
  const headerRef  = useRef(null)

  const { save: odSave, list: odList, load: odLoad, isAuthenticated: odAuth } = useOneDrive()

  useEffect(() => {
    if (!showODMenu) return
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) setShowODMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showODMenu])

  const handleOpenOD = async () => {
    if (!showODMenu) {
      const files = await odList()
      setOdFiles(files || [])
    }
    setShowODMenu(v => !v)
  }

  const handleNew = () => {
    if (window.confirm('Start a new document? Unsaved changes will be lost.')) {
      resetDocument()
    }
  }

  const handlePDF = async () => {
    showToast('Preparing PDF…', 8000)
    await new Promise(r => setTimeout(r, 80))
    try {
      await exportToPDF()
      showToast('PDF downloaded ✓')
      // Log to history if signed in
      if (user) {
        addHistory({
          email:         user.email,
          userName:      user.name,
          picture:       user.picture,
          docType,
          invoiceNumber: metadata.invoiceNumber || '',
          clientName:    clientInfo.name || '',
          date:          metadata.date,
        })
      }
    } catch (err) {
      showToast('PDF failed: ' + err.message)
    }
  }

  const odBtnStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    padding: isMobile ? '0 10px' : '0 12px',
    height: 32, borderRadius: 7,
    background: 'rgba(0,120,212,0.18)',
    border: '1px solid rgba(0,120,212,0.45)',
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.12s',
    fontFamily: "'DM Sans', sans-serif",
  }

  const odHover = (e, enter) => {
    e.currentTarget.style.background = enter ? 'rgba(0,120,212,0.35)' : 'rgba(0,120,212,0.18)'
    e.currentTarget.style.color = enter ? '#fff' : 'rgba(255,255,255,0.85)'
  }

  const cloudIcon = (
    <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }} fill="currentColor">
      <path d="M10.2 6.4a5.6 5.6 0 0 1 9.7 3.1A4 4 0 0 1 22 13.2a4 4 0 0 1-4 3.8H6a4 4 0 0 1-.5-8 5.6 5.6 0 0 1 4.7-2.6z"/>
    </svg>
  )

  return (
    <header
      ref={headerRef}
      style={{
        background: 'linear-gradient(135deg, #224E5F 0%, #1a3d4d 100%)',
        borderBottom: '2px solid #D77B49',
        boxShadow: '0 2px 12px rgba(34,78,95,0.25)',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        overflow: 'visible',
        position: 'relative',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10,
        padding: isMobile ? '0 12px' : '0 16px',
        height: '100%', flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.1)',
      }}>
        <img src="/nnt-logo.png" alt="NNT"
          style={{ height: 26, filter: 'brightness(0) invert(1)', objectFit: 'contain' }} />
        {!isMobile && (
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: 2, lineHeight: 1 }}>NNT</div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: '#D77B49', textTransform: 'uppercase', marginTop: 2 }}>Editor</div>
          </div>
        )}
      </div>

      {/* Doc type badge */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '100%', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 1.2, color: isMobile ? '#D77B49' : 'rgba(255,255,255,0.5)',
          background: isMobile ? 'transparent' : 'rgba(255,255,255,0.07)',
          padding: isMobile ? 0 : '3px 10px', borderRadius: 20,
        }}>
          {DOC_CONFIG[docType]?.title || 'Document'}
        </span>
      </div>

      {/* New */}
      <button onClick={handleNew}
        style={{
          display: 'flex', alignItems: 'center', height: '100%',
          padding: isMobile ? '0 10px' : '0 16px',
          background: 'transparent', border: 'none',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: 0.8,
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
      >
        {isMobile ? '＋' : '+ New'}
      </button>

      <div style={{ flex: 1 }} />

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 5 : 8, padding: isMobile ? '0 6px' : '0 10px', flexShrink: 0 }}>

        {/* OneDrive Save */}
        {odAuth && (
          <button onClick={odSave} style={odBtnStyle}
            onMouseEnter={e => odHover(e, true)} onMouseLeave={e => odHover(e, false)}
            title="Save to OneDrive">
            {cloudIcon}{!isMobile && 'Save'}
          </button>
        )}

        {/* OneDrive Open */}
        {odAuth && (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button onClick={handleOpenOD} style={odBtnStyle}
              onMouseEnter={e => odHover(e, true)} onMouseLeave={e => odHover(e, false)}
              title="Open from OneDrive">
              {cloudIcon}{!isMobile && 'Open'}
            </button>
            {showODMenu && (
              <div style={{
                position: 'absolute', top: 38, right: 0,
                background: '#fff', borderRadius: 10,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                minWidth: 240, zIndex: 500,
                border: '1px solid rgba(34,78,95,0.12)',
                overflow: 'hidden',
              }}>
                {odFiles.length === 0 ? (
                  <div style={{ padding: '14px 16px', fontSize: 12, color: '#999', textAlign: 'center' }}>No saved files</div>
                ) : odFiles.map(f => (
                  <button key={f.id}
                    onClick={() => { odLoad(f.id); setShowODMenu(false) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid #f0ede8', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f7f4ef'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#1a2744' }}>{f.name}</div>
                    {f.lastModifiedDateTime && (
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
                        {new Date(f.lastModifiedDateTime).toLocaleDateString()}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History button */}
        <button
          onClick={() => setShowHistory(v => !v)}
          title="Document history"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: isMobile ? '0 9px' : '0 11px',
            height: 32, borderRadius: 7,
            background: showHistory ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: 'rgba(255,255,255,0.75)',
            fontSize: 11, fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.12s',
            fontFamily: "'DM Sans', sans-serif",
            position: 'relative',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.background = showHistory ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)' }}
        >
          🕓{!isMobile && ' History'}
          {history.length > 0 && (
            <span style={{
              position: 'absolute', top: -5, right: -5,
              background: '#D77B49', color: '#fff',
              fontSize: 9, fontWeight: 700,
              borderRadius: '50%', width: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid #1a3d4d',
            }}>
              {history.length > 99 ? '99+' : history.length}
            </span>
          )}
        </button>

        {/* PDF */}
        <button onClick={handlePDF}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: isMobile ? '0 12px' : '0 14px',
            height: 32, borderRadius: 7,
            background: 'linear-gradient(135deg, #c0392b, #a93226)',
            border: 'none', color: '#fff',
            fontSize: 11, fontWeight: 600,
            cursor: 'pointer', transition: 'opacity 0.12s',
            boxShadow: '0 2px 8px rgba(192,57,43,0.35)',
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          📄{!isMobile && ' PDF'}
        </button>
      </div>

      {/* Auth */}
      <GoogleAuth isMobile={isMobile} />
      <MicrosoftAuth isMobile={isMobile} />

      {/* History panel */}
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </header>
  )
}
