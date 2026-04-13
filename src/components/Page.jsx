import { useCallback } from 'react'
import { useEditorStore, DOC_TITLES } from '../store/editorStore'
import Element from './Element'

function getDateStr() {
  const dt = new Date()
  return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`
}
function getRef() {
  return 'NNT-' + String(Math.floor(Date.now() / 1000)).slice(-6)
}

export default function Page({ page, pi, zoom }) {
  const doc             = useEditorStore(s => s.doc)
  const paper           = useEditorStore(s => s.paper)
  const bg              = useEditorStore(s => s.bg)
  const pagesLen        = useEditorStore(s => s.pages.length)
  const addText         = useEditorStore(s => s.addText)
  const deselectElement = useEditorStore(s => s.deselectElement)

  const blank = paper === 'blank'
  const bgStyle = bg
    ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'top center' }
    : {}

  const onBodyDblClick = useCallback((e) => {
    if (e.target.closest('.cv')) return
    const body = e.currentTarget
    const rect = body.getBoundingClientRect()
    const x = Math.max(0, (e.clientX - rect.left) / zoom - 140)
    const y = Math.max(0, (e.clientY - rect.top)  / zoom - 10)
    const eid = addText(pi, x, y)
    setTimeout(() => {
      const d = document.querySelector(`.cv[data-eid="${eid}"][data-pi="${pi}"]`)
      const t = d?.querySelector('.txe')
      if (t) { t.contentEditable = 'true'; t.focus(); document.execCommand('selectAll') }
    }, 30)
  }, [pi, zoom, addText])

  const onBodyMouseDown = useCallback((e) => {
    if (e.target === e.currentTarget || e.target.classList.contains('pbody'))
      deselectElement()
  }, [deselectElement])

  return (
    <div
      className="pwrap flex-shrink-0"
      style={{ width: Math.round(660 * zoom), height: Math.round(930 * zoom) }}
    >
      <div
        className="paper"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: 660, minHeight: 930 }}
      >
        {!blank && (
          <>
            {/* ══ HEADER BAND — teal, rounded bottom-left ══ */}
            <div style={{
              background: '#ffffff',
              borderRadius: '0 0 0 56px',
              padding: '18px 28px 16px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Subtle decorative circle */}
             

              {/* Left: NNT logo + company name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
                <img
                  src="/nnt-logo.png"
                  alt="NNT"
                  style={{ height: 70, width: 'auto', objectFit: 'contain', imageRendering: 'auto' }}
                />
                <img
                  src="/design.png"
                  alt="NNT"
                  style={{ height: 70, width: 'auto', objectFit: 'contain', imageRendering: 'auto' }}
                />
              </div>

             
            </div>
             {/* Right: doc title placeholder */}
              <div style={{ position: 'relative', zIndex: 1, }}>
                <div style={{
                   textAlign: 'center',
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18, fontWeight: 600,
                  color: 'rgba(0, 0, 0, 0.9)', letterSpacing: 2,
                  textTransform: 'uppercase',
                }}>{DOC_TITLES[doc] || 'Document'}</div>
                <div style={{ textAlign: 'right', fontSize: 9, color: 'rgba(0, 0, 0, 0.45)', marginTop: 4, marginRight: 8, lineHeight: 1.8 }}>
                  Date: {getDateStr()}<br />
                  Ref: {getRef()}
                </div>
              </div>

            

            {/* ══ THIN SEPARATOR ══ */}
            <div style={{ height: 1, background: '#ede9e0' }} />
          </>
        )}

        {/* ══ PAGE BODY ══ */}
        <div
          className="pbody"
          data-pi={pi}
          style={{ ...bgStyle, minHeight: blank ? 900 : 710 }}
          onDoubleClick={onBodyDblClick}
          onMouseDown={onBodyMouseDown}
        >
          {page.els.map(el => (
            <Element key={el.id} element={el} pi={pi} />
          ))}
        </div>

        {/* ══ FOOTER BAND — teal, rounded right side, contact info ══ */}
        {!blank && (
          <div style={{
            background: '#224E5F',
            borderRadius: '0 48px 48px 0',
            padding: '12px 32px 12px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}>
            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: '0 0 auto' }}>
              <img src="/pad_img2.png" alt="" style={{ width: 13, height: 16, objectFit: 'contain', opacity: 0.9 }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                United Tower, 263 Bangshal<br />Road, Dhaka, Bangladesh.
              </span>
            </div>

            {/* Phones */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: '0 0 auto' }}>
              <img src="/pad_img1.png" alt="" style={{ width: 11, height: 13, objectFit: 'contain', opacity: 0.9 }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                +880 1760-760730<br />+880 1631-512671
              </span>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: '0 0 auto' }}>
              <img src="/pad_img3.png" alt="" style={{ width: 14, height: 9, objectFit: 'contain', opacity: 0.9 }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)' }}>
                support@nnt.com.bd
              </span>
            </div>

            {/* Website */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: '0 0 auto' }}>
              <img src="/pad_img4.png" alt="" style={{ width: 13, height: 13, objectFit: 'contain', opacity: 0.9 }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)' }}>
                www.nnt.com.bd
              </span>
            </div>

            {/* Page number */}
            <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>
                Page {pi + 1} / {pagesLen}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
