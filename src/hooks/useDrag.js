import { useRef } from 'react'
import { useEditorStore } from '../store/editorStore'

const HANDLES = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']

/**
 * Returns mouse/touch handlers for dragging and resizing an element.
 * DOM style is mutated directly during drag for performance;
 * the store is updated only on pointer-up.
 */
export function useDrag(eid, pi, element) {
  const zoom            = useEditorStore(s => s.zoom)
  const selectElement   = useEditorStore(s => s.selectElement)
  const updateElement   = useEditorStore(s => s.updateElement)
  const saveHistory     = useEditorStore(s => s.saveHistory)
  const wrapperRef      = useRef(null)
  const dblTapRef       = useRef({ last: 0, eid: null })

  /* ── Mouse drag ── */
  function onMouseDown(e) {
    if (e.button !== 0) return
    e.stopPropagation()
    selectElement(eid, pi)
    const div = wrapperRef.current
    if (!div) return
    const sx = e.clientX, sy = e.clientY
    const sl = element.x, st = element.y
    let moved = false

    const onMove = (ev) => {
      const dx = (ev.clientX - sx) / zoom
      const dy = (ev.clientY - sy) / zoom
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true
      if (!moved) return
      const nx = Math.max(0, sl + dx)
      const ny = Math.max(0, st + dy)
      div.style.left = nx + 'px'
      div.style.top  = ny + 'px'
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (moved) {
        const nx = Math.round(parseFloat(div.style.left))
        const ny = Math.round(parseFloat(div.style.top))
        updateElement(eid, pi, { x: nx, y: ny })
        saveHistory()
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  /* ── Touch drag (with double-tap detection) ── */
  function onTouchStart(e, onDoubleTap) {
    if (e.touches.length !== 1) return
    e.stopPropagation()

    const now = Date.now()
    const dt = dblTapRef.current
    if (dt.eid === eid && now - dt.last < 400) {
      dt.last = 0
      onDoubleTap?.()
      return
    }
    dt.last = now
    dt.eid  = eid
    selectElement(eid, pi)

    const div = wrapperRef.current
    if (!div) return
    const t0 = e.touches[0]
    const sx = t0.clientX, sy = t0.clientY
    const sl = element.x, st = element.y
    let moved = false

    const onMove = (ev) => {
      if (ev.touches.length !== 1) return
      const t = ev.touches[0]
      const dx = (t.clientX - sx) / zoom
      const dy = (t.clientY - sy) / zoom
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true
      if (!moved) return
      ev.preventDefault()
      const nx = Math.max(0, sl + dx)
      const ny = Math.max(0, st + dy)
      div.style.left = nx + 'px'
      div.style.top  = ny + 'px'
    }

    const onEnd = () => {
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      if (moved) {
        const nx = Math.round(parseFloat(div.style.left))
        const ny = Math.round(parseFloat(div.style.top))
        updateElement(eid, pi, { x: nx, y: ny })
        saveHistory()
      }
    }

    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onEnd)
  }

  /* ── Mouse resize ── */
  function onResizeMouseDown(e, pos) {
    e.stopPropagation()
    e.preventDefault()
    const div = wrapperRef.current
    if (!div) return
    const sx = e.clientX, sy = e.clientY
    const sw = div.offsetWidth, sh = div.offsetHeight
    const sl = element.x, st = element.y

    const onMove = (ev) => {
      const dx = (ev.clientX - sx) / zoom
      const dy = (ev.clientY - sy) / zoom
      applyResize(div, pos, dx, dy, sw, sh, sl, st)
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      commitResize(div)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  /* ── Touch resize ── */
  function onResizeTouchStart(e, pos) {
    e.stopPropagation()
    e.preventDefault()
    const div = wrapperRef.current
    if (!div) return
    const t0 = e.touches[0]
    const sx = t0.clientX, sy = t0.clientY
    const sw = div.offsetWidth, sh = div.offsetHeight
    const sl = element.x, st = element.y

    const onMove = (ev) => {
      if (ev.touches.length !== 1) return
      ev.preventDefault()
      const t = ev.touches[0]
      const dx = (t.clientX - sx) / zoom
      const dy = (t.clientY - sy) / zoom
      applyResize(div, pos, dx, dy, sw, sh, sl, st)
    }

    const onEnd = () => {
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      commitResize(div)
    }

    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onEnd)
  }

  function applyResize(div, pos, dx, dy, sw, sh, sl, st) {
    let nw = sw, nh = sh, nx = sl, ny = st
    if (pos.includes('e')) nw = Math.max(40, sw + dx)
    if (pos.includes('s')) nh = Math.max(20, sh + dy)
    if (pos.includes('w')) { nw = Math.max(40, sw - dx); nx = sl + dx }
    if (pos.includes('n')) { nh = Math.max(20, sh - dy); ny = st + dy }
    div.style.width  = nw + 'px'
    div.style.height = nh + 'px'
    div.style.left   = nx + 'px'
    div.style.top    = ny + 'px'
  }

  function commitResize(div) {
    updateElement(eid, pi, {
      w: Math.round(div.offsetWidth),
      h: Math.round(div.offsetHeight),
      x: Math.round(parseFloat(div.style.left)),
      y: Math.round(parseFloat(div.style.top)),
    })
    saveHistory()
  }

  return { wrapperRef, onMouseDown, onTouchStart, onResizeMouseDown, onResizeTouchStart, HANDLES }
}
