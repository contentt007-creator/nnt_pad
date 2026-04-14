import { useState, useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'
import Page from './Page'

export default function DocumentPreview({ isMobile = false }) {
  const zoom    = useEditorStore(s => s.zoom)
  const setZoom = useEditorStore(s => s.setZoom)

  // Auto-fit zoom on mobile based on screen width
  const [winWidth, setWinWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handler = () => setWinWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const effectiveZoom = isMobile
    ? Math.round(((winWidth - 24) / 660) * 100) / 100
    : zoom

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      overflowX: isMobile ? 'hidden' : 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: isMobile ? '16px 12px 32px' : '28px 24px 40px',
      background: 'radial-gradient(ellipse at 50% 0%, #d8d3c8 0%, #c8c2b5 100%)',
      position: 'relative',
    }}>
      {/* Dot grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(34,78,95,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Zoom controls — only on desktop */}
      {!isMobile && (
        <div style={{
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-end',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(34,78,95,0.82)',
          borderRadius: 8,
          padding: '4px 10px',
          marginBottom: 16,
          zIndex: 10,
          backdropFilter: 'blur(6px)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}>
          <button
            onClick={() => setZoom(-0.15)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 17, padding: '0 4px', lineHeight: 1 }}
            title="Zoom out"
          >−</button>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', minWidth: 36, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(0.15)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 17, padding: '0 4px', lineHeight: 1 }}
            title="Zoom in"
          >+</button>
        </div>
      )}

      {/* Document page */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Page zoom={effectiveZoom} />
      </div>
    </div>
  )
}
