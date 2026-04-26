import { useDocumentStore, DOC_CONFIG, CURRENCY } from '../store/documentStore'
import QuotationPage from './QuotationPage'

function fmtDate(str) {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const EMPTY_ROWS = 5   // minimum rows always shown

export default function Page({ zoom = 1, pageRef }) {
  const docType    = useDocumentStore(s => s.docType)
  const clientInfo = useDocumentStore(s => s.clientInfo)
  const metadata   = useDocumentStore(s => s.metadata)
  const lineItems  = useDocumentStore(s => s.lineItems)
  const taxRate    = useDocumentStore(s => s.taxRate)
  const totals     = useDocumentStore(s => s.totals)
  const notes          = useDocumentStore(s => s.notes)
  const dueBalance     = useDocumentStore(s => s.dueBalance)
  const advanceAmount  = useDocumentStore(s => s.advanceAmount)
  const vatEnabled     = useDocumentStore(s => s.vatEnabled)

  const cfg     = DOC_CONFIG[docType] || DOC_CONFIG.invoice
  const padRows = Math.max(0, EMPTY_ROWS - lineItems.length)

  // Quotation has its own dedicated layout
  if (docType === 'quotation') return <QuotationPage zoom={zoom} pageRef={pageRef} />

  return (
    <div
      className="pwrap flex-shrink-0"
      style={{
        width: Math.round(660 * zoom),
        minHeight: Math.round(930 * zoom),
        height: 'auto',
      }}
    >
      <div
        ref={pageRef}
        className="paper"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width: 660,
          minHeight: 930,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ══ HEADER BAND ══ */}
        <div style={{
          background: '#ffffff',
          borderRadius: '0 0 0 56px',
          padding: '18px 28px 16px 28px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          {/* LEFT: logo + tagline only */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <img src="/nnt-logo.png" alt="NNT" style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
            <div style={{ fontSize: 9, color: '#D77B49', fontStyle: 'italic', marginTop: 5, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
              A Legacy of Loyalty
            </div>
          </div>

          {/* RIGHT: design image — bottom-aligned via parent flex-end */}
          <img src="/design.png" alt="" style={{ height: 40, width: 'auto', display: 'block' }} />
          
        </div>

       

        {/* ══ PAGE BODY ══ */}
        <div style={{ flex: 1, padding: '22px 28px 20px' }}>

          {/* Doc title on white */}
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#1a2744',
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 18,
          }}>
            {cfg.title}
          </div>

          {/* Client info + summary card */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 22 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#D77B49', marginBottom: 7 }}>
                {{ invoice: 'Invoice To', bill: 'Bill To', chalan: 'Delivered To', quotation: 'To' }[docType] || 'Bill To'}
              </div>
              {clientInfo.name
                ? <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2744', lineHeight: 1.3, marginBottom: 4 }}>{clientInfo.name}</div>
                : <div style={{ fontSize: 12, color: '#d0cdc8', fontStyle: 'italic' }}>Client name</div>
              }
              {clientInfo.address && (
                <div style={{ fontSize: 11, color: '#555', lineHeight: 1.55, whiteSpace: 'pre-line', marginBottom: 3 }}>
                  {clientInfo.address}
                </div>
              )}
              {clientInfo.contact && (
                <div style={{ fontSize: 11, color: '#777' }}>{clientInfo.contact}</div>
              )}
              {clientInfo.email && (
                <div style={{ fontSize: 11, color: '#777' }}>{clientInfo.email}</div>
              )}
            </div>

            {/* Summary card */}
            <div style={{
              background: '#f7f4ef', borderRadius: 10,
              padding: '14px 18px', minWidth: 190,
              border: '1px solid #e8e4dc', flexShrink: 0,
            }}>
              {[
                [cfg.docLabel,     metadata.invoiceNumber || '—'],
                ['Date',           fmtDate(metadata.date)],
                [cfg.dueDateLabel, fmtDate(metadata.dueDate)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4, fontSize: 10 }}>
                  <span style={{ color: '#999', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</span>
                  <span style={{ fontWeight: 600, color: '#224E5F' }}>{val}</span>
                </div>
              ))}
              <div style={{ marginTop: 11, paddingTop: 10, borderTop: '2px solid #D77B49' }}>
                <div style={{ fontSize: 8, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Grand Total</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#224E5F', letterSpacing: -0.5 }}>
                  {CURRENCY} {fmtNum(totals.grandTotal)}
                </div>
              </div>
            </div>
          </div>

          {/* ── Line Items Table ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
            <thead>
              <tr>
                {[['#', 'center', 28], ['Description', 'left', 'auto'], ['Qty', 'right', 50], ['Price', 'right', 80], ['Amount', 'right', 90]].map(([h, align, w]) => (
                  <th key={h} style={{
                    background: '#224E5F', color: '#fff',
                    padding: '8px ' + (h === 'Description' || h === 'Amount' ? '12px' : '10px'),
                    textAlign: align, fontSize: 9, letterSpacing: 1,
                    textTransform: 'uppercase', fontWeight: 500, width: w,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={item.id} style={{ background: idx % 2 === 0 ? '#fff' : '#faf8f5' }}>
                  <td style={{ padding: '8px 10px', fontSize: 10, color: '#bbb', textAlign: 'center', borderBottom: '1px solid #f0ede8' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: item.description ? '#1a2744' : '#d0cdc8', fontStyle: item.description ? 'normal' : 'italic', borderBottom: '1px solid #f0ede8' }}>
                    {item.description || 'Item description'}
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: '#555', textAlign: 'right', borderBottom: '1px solid #f0ede8' }}>{item.quantity}</td>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: '#555', textAlign: 'right', borderBottom: '1px solid #f0ede8' }}>{CURRENCY} {fmtNum(item.rate)}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: '#224E5F', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #f0ede8' }}>{CURRENCY} {fmtNum(item.amount)}</td>
                </tr>
              ))}
              {Array.from({ length: padRows }).map((_, i) => (
                <tr key={'p' + i} style={{ background: (lineItems.length + i) % 2 === 0 ? '#fff' : '#faf8f5' }}>
                  {[28, 'auto', 50, 80, 90].map((w, ci) => (
                    <td key={ci} style={{ padding: '8px ' + (ci === 1 || ci === 4 ? '12px' : '10px'), borderBottom: '1px solid #f0ede8', height: 32 }}></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Totals ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <div style={{ minWidth: 230 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #ede9e0', fontSize: 12 }}>
                <span style={{ color: '#777' }}>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#1a2744' }}>{CURRENCY} {fmtNum(totals.subtotal)}</span>
              </div>
              {parseFloat(taxRate) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #ede9e0', fontSize: 12 }}>
                  <span style={{ color: '#777' }}>Tax ({taxRate}%)</span>
                  <span style={{ fontWeight: 600, color: '#1a2744' }}>{CURRENCY} {fmtNum(totals.tax)}</span>
                </div>
              )}
              {vatEnabled && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #ede9e0', fontSize: 12 }}>
                  <span style={{ color: '#D77B49', fontWeight: 600 }}>VAT (10%)</span>
                  <span style={{ fontWeight: 600, color: '#D77B49' }}>{CURRENCY} {fmtNum(totals.vat)}</span>
                </div>
              )}
              {(() => {
                const hasAdvance = parseFloat(advanceAmount) > 0
                const hasDue     = !!dueBalance
                const hasBelow   = hasAdvance || hasDue
                const restAmount = parseFloat(totals.grandTotal) - (parseFloat(advanceAmount) || 0)
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', marginTop: 4, background: '#224E5F', borderRadius: hasBelow ? '7px 7px 0 0' : 7, fontSize: 13, fontWeight: 700 }}>
                      <span style={{ color: 'rgba(255,255,255,0.75)' }}>Grand Total</span>
                      <span style={{ color: '#fff' }}>{CURRENCY} {fmtNum(totals.grandTotal)}</span>
                    </div>
                    {hasDue && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#D77B49', borderRadius: hasAdvance ? 0 : '0 0 7px 7px', fontSize: 13, fontWeight: 700 }}>
                        <span style={{ color: 'rgba(255,255,255,0.85)' }}>Due Balance</span>
                        <span style={{ color: '#fff' }}>{CURRENCY} {fmtNum(dueBalance)}</span>
                      </div>
                    )}
                    {hasAdvance && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', background: '#f0f7f4', borderTop: '1px solid #d4ede6', fontSize: 12, fontWeight: 600 }}>
                          <span style={{ color: '#2e7d62' }}>Advance Amount</span>
                          <span style={{ color: '#2e7d62' }}>{CURRENCY} {fmtNum(advanceAmount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#1a7a50', borderRadius: '0 0 7px 7px', fontSize: 13, fontWeight: 700 }}>
                          <span style={{ color: 'rgba(255,255,255,0.85)' }}>Rest Amount</span>
                          <span style={{ color: '#fff' }}>{CURRENCY} {fmtNum(restAmount)}</span>
                        </div>
                      </>
                    )}
                  </>
                )
              })()}
            </div>
          </div>

          {/* ── Notes ── */}
          {notes && (
            <div style={{ background: '#f7f4ef', borderRadius: 8, padding: '12px 16px', border: '1px solid #e8e4dc', fontSize: 11, color: '#666', lineHeight: 1.6 }}>
              <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#224E5F', marginBottom: 5 }}>
                Notes / Terms
              </div>
              <div style={{ whiteSpace: 'pre-line' }}>{notes}</div>
            </div>
          )}
        </div>

        {/* ══ FOOTER BAND ══ */}
        <div style={{
          background: '#224E5F',
          borderRadius: '0 48px 48px 0',
          padding: '12px 32px 12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexShrink: 0,
          marginTop: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: '0 0 auto' }}>
            <img src="/pad_img2.png" alt="" style={{ width: 13, height: 16, objectFit: 'contain', opacity: 0.9 }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
              United Tower, 263 Bangshal<br />Road, Dhaka, Bangladesh.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: '0 0 auto' }}>
            <img src="/pad_img1.png" alt="" style={{ width: 11, height: 13, objectFit: 'contain', opacity: 0.9 }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
              +880 1760-760730<br />+880 1631-512671
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: '0 0 auto' }}>
            <img src="/pad_img3.png" alt="" style={{ width: 14, height: 9, objectFit: 'contain', opacity: 0.9 }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)' }}>support@nnt.com.bd</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: '0 0 auto' }}>
            <img src="/pad_img4.png" alt="" style={{ width: 13, height: 13, objectFit: 'contain', opacity: 0.9 }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)' }}>www.nnt.com.bd</span>
          </div>
          <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>Page 1 / 1</span>
          </div>
        </div>
      </div>
    </div>
  )
}
