import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../store/editorStore'

export default function TablePicker({ anchorRef }) {
  const tablePicker  = useEditorStore(s => s.tablePicker)
  const tableSel     = useEditorStore(s => s.tableSel)
  const setTableSel  = useEditorStore(s => s.setTableSel)
  const setTablePicker = useEditorStore(s => s.setTablePicker)
  const addTable     = useEditorStore(s => s.addTable)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const menuRef = useRef(null)

  useEffect(() => {
    if (tablePicker && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      const left = Math.min(rect.left, window.innerWidth - 210)
      setPos({ top: rect.bottom + 6, left: Math.max(8, left) })
    }
  }, [tablePicker])

  useEffect(() => {
    if (!tablePicker) return
    const onDown = (e) => {
      if (!menuRef.current?.contains(e.target) && e.target !== anchorRef?.current)
        setTablePicker(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [tablePicker])

  if (!tablePicker) return null

  const insert = () => {
    setTablePicker(false)
    addTable(0, tableSel.r, tableSel.c)
  }

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 1000 }}
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-3"
    >
      <div className="text-[12px] font-semibold text-gray-800 mb-1">Insert Table</div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(8, 22px)' }}>
        {Array.from({ length: 64 }, (_, idx) => {
          const r = Math.floor(idx / 8) + 1
          const c = (idx % 8) + 1
          const active = r <= tableSel.r && c <= tableSel.c
          return (
            <div
              key={idx}
              className={`gc ${active ? 'hov' : ''}`}
              onMouseEnter={() => setTableSel(r, c)}
              onTouchStart={() => setTableSel(r, c)}
              onClick={insert}
            />
          )
        })}
      </div>
      <div className="text-[10px] text-gray-400 mt-1 text-center">
        {tableSel.r} × {tableSel.c}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => setTablePicker(false)}
          className="px-2 py-1 text-[11px] border border-gray-200 rounded hover:border-navy text-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={insert}
          className="px-2 py-1 text-[11px] bg-navy text-white rounded hover:bg-navy2 transition-colors"
        >
          Insert
        </button>
      </div>
    </div>
  )
}
