import { useCallback } from 'react'
import { useEditorStore } from '../store/editorStore'
import Page from './Page'

export default function Canvas() {
  const pages           = useEditorStore(s => s.pages)
  const zoom            = useEditorStore(s => s.zoom)
  const deselectElement = useEditorStore(s => s.deselectElement)
  const hideContextMenu = useEditorStore(s => s.hideContextMenu)
  const setTablePicker  = useEditorStore(s => s.setTablePicker)

  const onClick = useCallback((e) => {
    if (
      !e.target.closest('.cv') &&
      !e.target.closest('#rp-panel') &&
      !e.target.closest('[data-ctx]') &&
      !e.target.closest('[data-tpicker]')
    ) {
      deselectElement()
      hideContextMenu()
      setTablePicker(false)
    }
  }, [deselectElement, hideContextMenu, setTablePicker])

  return (
    <div
      id="canvas"
      className="flex-1 overflow-auto flex flex-col items-center gap-8 py-8 px-6"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #d8d3c8 0%, #c8c2b5 100%)',
      }}
      onClick={onClick}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'radial-gradient(circle, rgba(34,78,95,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {pages.map((page, pi) => (
          <Page key={page.id} page={page} pi={pi} zoom={zoom} />
        ))}
      </div>
    </div>
  )
}
