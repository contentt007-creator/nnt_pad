import { useEditorStore } from '../store/editorStore'
import Page from './Page'

export default function DocumentPreview() {
  const zoom    = useEditorStore(s => s.zoom)
  const setZoom = useEditorStore(s => s.setZoom)

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      overflowX: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '28px 24px 40px',
      background: 'radial-gradient(ellipse at 50% 0%, #d8d3c8 0%, #c8c2b5 100%)',
      position: 'relative',
    }}>
      {/* Dot grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(34,78,95,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Zoom controls — sticky top-right */}
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

      {/* Document page */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Page zoom={zoom} />
      </div>
    </div>
  )
}
