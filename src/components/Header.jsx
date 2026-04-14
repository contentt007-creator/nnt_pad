import { useState, useRef, useEffect } from 'react'
import { useDocumentStore, DOC_CONFIG } from '../store/documentStore'
import { useEditorStore } from '../store/editorStore'
import { useOneDrive } from '../hooks/useOneDrive'
import { exportToPDF } from '../lib/exportPDF'
import MicrosoftAuth from '../auth/MicrosoftAuth'

export default function Header() {
  const showToast     = useEditorStore(s => s.showToast)
  const resetDocument = useDocumentStore(s => s.resetDocument)
  const docType       = useDocumentStore(s => s.docType)

  const [showODMenu, setShowODMenu] = useState(false)
  const [odFiles, setOdFiles]       = useState([])
  const menuRef = useRef(null)

  const { save: odSave, list: odList, load: odLoad, isAuthenticated: odAuth } = useOneDrive()

  // Close menu on outside click
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
    } catch (err) {
      showToast('PDF failed: ' + err.message)
    }
  }

  const btnBase = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '0 12px', height: 32, borderRadius: 7,
    fontSize: 11, fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.12s',
    fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <header
      className="flex items-center flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, #224E5F 0%, #1a3d4d 100%)',
        borderBottom: '2px solid #D77B49',
        boxShadow: '0 2px 12px rgba(34,78,95,0.25)',
        height: 52,
        overflow: 'visible',
      }}
    >
      {/* NNT Logo */}
      <div
        className="flex items-center gap-2.5 px-4 h-full flex-shrink-0"
        style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}
      >
        <img
          src="/nnt-logo.png"
          alt="NNT"
          style={{ height: 28, filter: 'brightness(0) invert(1)', objectFit: 'contain' }}
        />
        <div>
          <div
            className="font-display font-bold text-white leading-none"
            style={{ fontSize: 16, letterSpacing: 2 }}
          >
            NNT
          </div>
          <div
            className="uppercase leading-none mt-0.5"
            style={{ fontSize: 8, letterSpacing: 1.5, color: '#D77B49' }}
          >
            Editor
          </div>
        </div>
      </div>

      {/* Doc type badge */}
      <div
        className="flex items-center px-4 h-full flex-shrink-0"
        style={{ borderRight: '1px solid rgba(255,255,255,0.08)' }}
      >
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 1.5, color: 'rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.07)',
          padding: '3px 10px', borderRadius: 20,
        }}>
          {DOC_CONFIG[docType]?.title || 'Document'}
        </span>
      </div>

      {/* New button */}
      <button
        onClick={handleNew}
        className="flex items-center h-full px-4 flex-shrink-0"
        style={{
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
        + New
      </button>

      <div className="flex-1" />

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-3 flex-shrink-0">

        {/* OneDrive Save */}
        {odAuth && (
          <button
            onClick={odSave}
            style={{
              ...btnBase,
              background: 'rgba(0,120,212,0.18)',
              border: '1px solid rgba(0,120,212,0.45)',
              color: 'rgba(255,255,255,0.85)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,120,212,0.35)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,120,212,0.18)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
            title="Save to OneDrive"
          >
            <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }} fill="currentColor">
              <path d="M10.2 6.4a5.6 5.6 0 0 1 9.7 3.1A4 4 0 0 1 22 13.2a4 4 0 0 1-4 3.8H6a4 4 0 0 1-.5-8 5.6 5.6 0 0 1 4.7-2.6z"/>
            </svg>
            Save
          </button>
        )}

        {/* OneDrive Open */}
        {odAuth && (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={handleOpenOD}
              style={{
                ...btnBase,
                background: 'rgba(0,120,212,0.18)',
                border: '1px solid rgba(0,120,212,0.45)',
                color: 'rgba(255,255,255,0.85)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,120,212,0.35)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,120,212,0.18)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
              title="Open from OneDrive"
            >
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }} fill="currentColor">
                <path d="M10.2 6.4a5.6 5.6 0 0 1 9.7 3.1A4 4 0 0 1 22 13.2a4 4 0 0 1-4 3.8H6a4 4 0 0 1-.5-8 5.6 5.6 0 0 1 4.7-2.6z"/>
              </svg>
              Open
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
                  <div style={{ padding: '14px 16px', fontSize: 12, color: '#999', textAlign: 'center' }}>
                    No saved files found
                  </div>
                ) : (
                  odFiles.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { odLoad(f.id); setShowODMenu(false) }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 14px', background: 'transparent',
                        border: 'none', borderBottom: '1px solid #f0ede8',
                        cursor: 'pointer', transition: 'background 0.1s',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
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
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* PDF Export */}
        <button
          onClick={handlePDF}
          style={{
            ...btnBase,
            padding: '0 14px',
            background: 'linear-gradient(135deg, #c0392b, #a93226)',
            border: 'none', color: '#fff', fontWeight: 600,
            boxShadow: '0 2px 8px rgba(192,57,43,0.35)',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          📄 PDF
        </button>
      </div>

      {/* Microsoft / OneDrive Auth */}
      <MicrosoftAuth />
    </header>
  )
}
