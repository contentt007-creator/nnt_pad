import { useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'

/**
 * Attaches global keyboard shortcuts for undo/redo and zoom.
 * Mount once at the App level.
 */
export function useHistory() {
  const undo    = useEditorStore(s => s.undo)
  const redo    = useEditorStore(s => s.redo)
  const setZoom = useEditorStore(s => s.setZoom)
  const sel     = useEditorStore(s => s.sel)
  const deleteElement  = useEditorStore(s => s.deleteElement)
  const deselectElement = useEditorStore(s => s.deselectElement)
  const hideContextMenu = useEditorStore(s => s.hideContextMenu)
  const setTablePicker  = useEditorStore(s => s.setTablePicker)

  useEffect(() => {
    const onKeyDown = (e) => {
      const active = document.activeElement
      const editing = active?.matches('[contenteditable="true"],input,select,textarea')

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
        else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
        else if (e.key === '=') { e.preventDefault(); setZoom(0.15) }
        else if (e.key === '-') { e.preventDefault(); setZoom(-0.15) }
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && sel && !editing) {
        e.preventDefault()
        deleteElement(sel.eid, sel.pi)
      }

      if (e.key === 'Escape') {
        deselectElement()
        hideContextMenu()
        setTablePicker(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [sel, undo, redo, setZoom, deleteElement, deselectElement, hideContextMenu, setTablePicker])
}
