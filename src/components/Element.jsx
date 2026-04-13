import { useRef, useCallback } from 'react'
import { useEditorStore } from '../store/editorStore'
import { useDrag } from '../hooks/useDrag'

const RESIZE_HANDLES = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']

export default function Element({ element, pi }) {
  const sel             = useEditorStore(s => s.sel)
  const updateElement   = useEditorStore(s => s.updateElement)
  const saveHistory     = useEditorStore(s => s.saveHistory)
  const showContextMenu = useEditorStore(s => s.showContextMenu)
  const isSelected = sel?.eid === element.id && sel?.pi === pi

  const { wrapperRef, onMouseDown, onTouchStart, onResizeMouseDown, onResizeTouchStart } =
    useDrag(element.id, pi, element)

  /* ── Text editing ── */
  const textRef = useRef(null)

  const startEdit = useCallback((e) => {
    e.stopPropagation()
    const t = textRef.current
    if (!t) return
    t.contentEditable = 'true'
    t.style.cursor = 'text'
    t.focus()
    const rng = document.createRange()
    rng.selectNodeContents(t)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(rng)
  }, [])

  const endEdit = useCallback((e) => {
    const t = e.target
    t.contentEditable = 'false'
    t.style.cursor = ''
    updateElement(element.id, pi, { content: t.innerHTML })
    saveHistory()
  }, [element.id, pi, updateElement, saveHistory])

  /* ── Table cell save ── */
  const onCellBlur = useCallback((e, r, c) => {
    const cells = element.cells ? element.cells.map(row => [...row]) : []
    while (cells.length <= r) cells.push(Array(element.cols || 3).fill(''))
    while (cells[r].length <= c) cells[r].push('')
    cells[r][c] = e.target.innerHTML
    updateElement(element.id, pi, { cells })
  }, [element, pi, updateElement])

  /* ── Context menu ── */
  const onContextMenu = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    showContextMenu(e.clientX, e.clientY, element.id, pi)
  }, [element.id, pi, showContextMenu])

  /* ── Table HTML ── */
  function buildTableHTML() {
    const { rows, cols, cells = [], hdr = true, zebra } = element
    return (
      <table className="nnt-table" style={{ width: '100%' }}>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r} style={zebra && r > 0 && r % 2 === 0 ? { background: '#f8f6f0' } : {}}>
              {Array.from({ length: cols }, (_, c) => {
                const Tag = hdr && r === 0 ? 'th' : 'td'
                return (
                  <Tag
                    key={c}
                    contentEditable
                    suppressContentEditableWarning
                    onMouseDown={e => e.stopPropagation()}
                    onBlur={e => onCellBlur(e, r, c)}
                    dangerouslySetInnerHTML={{ __html: cells[r]?.[c] ?? '' }}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  const style = {
    left:    element.x,
    top:     element.y,
    width:   element.w,
    height:  element.h || undefined,
    zIndex:  element.z || 1,
    opacity: (element.op ?? 100) / 100,
  }

  return (
    <div
      ref={wrapperRef}
      className={`cv${isSelected ? ' selected' : ''}`}
      data-eid={element.id}
      data-pi={pi}
      style={style}
      onMouseDown={onMouseDown}
      onTouchStart={e => onTouchStart(e, element.type === 'text' ? () => {
        const t = textRef.current
        if (t) { t.contentEditable = 'true'; t.focus() }
      } : undefined)}
      onContextMenu={onContextMenu}
    >
      {/* ── Text ── */}
      {element.type === 'text' && (
        <div
          ref={textRef}
          className="txe"
          contentEditable={false}
          suppressContentEditableWarning
          onDoubleClick={startEdit}
          onBlur={endEdit}
          style={{
            fontFamily: element.ff || "'DM Sans',sans-serif",
            fontSize:   (element.fs || 12) + 'px',
            color:      element.fc || '#1a2744',
          }}
          dangerouslySetInnerHTML={{ __html: element.content || 'Double-click to edit' }}
        />
      )}

      {/* ── Table ── */}
      {element.type === 'table' && buildTableHTML()}

      {/* ── Image ── */}
      {element.type === 'image' && (
        <img className="ime" src={element.src} alt="" draggable={false} />
      )}

      {/* ── Resize handles ── */}
      {isSelected && RESIZE_HANDLES.map(pos => (
        <div
          key={pos}
          className={`rh ${pos}`}
          onMouseDown={e => { e.stopPropagation(); onResizeMouseDown(e, pos) }}
          onTouchStart={e => { e.stopPropagation(); onResizeTouchStart(e, pos) }}
        />
      ))}
    </div>
  )
}
