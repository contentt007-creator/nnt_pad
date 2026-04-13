import { useEffect, useRef } from 'react'
import { useEditorStore } from '../store/editorStore'

export default function ContextMenu() {
  const ctxMenu          = useEditorStore(s => s.ctxMenu)
  const hideContextMenu  = useEditorStore(s => s.hideContextMenu)
  const duplicateElement = useEditorStore(s => s.duplicateElement)
  const bringToFront     = useEditorStore(s => s.bringToFront)
  const sendToBack       = useEditorStore(s => s.sendToBack)
  const deleteElement    = useEditorStore(s => s.deleteElement)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!ctxMenu) return
    const onDown = (e) => {
      if (!menuRef.current?.contains(e.target)) hideContextMenu()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [ctxMenu, hideContextMenu])

  if (!ctxMenu) return null
  const { x, y, eid, pi } = ctxMenu

  const action = (fn) => { hideContextMenu(); fn(eid, pi) }

  const items = [
    { label: '⧉ Duplicate',      fn: () => action(duplicateElement) },
    { label: '⬆ Bring to Front', fn: () => action(bringToFront) },
    { label: '⬇ Send to Back',   fn: () => action(sendToBack) },
    null,
    { label: '🗑 Delete',        fn: () => action(deleteElement), danger: true },
  ]

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', left: x, top: y, zIndex: 1000 }}
      className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[148px] overflow-hidden"
    >
      {items.map((item, i) =>
        item === null
          ? <div key={i} className="h-px bg-gray-100" />
          : (
            <button
              key={i}
              onClick={item.fn}
              className={`w-full text-left px-3 py-2 text-[12px] flex items-center gap-2 hover:bg-gray-50 transition-colors
                ${item.danger ? 'text-red-600' : 'text-gray-800'}`}
            >
              {item.label}
            </button>
          )
      )}
    </div>
  )
}
