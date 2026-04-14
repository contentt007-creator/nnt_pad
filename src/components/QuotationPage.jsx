import { useDocumentStore, CURRENCY } from '../store/documentStore'

function fmtDate(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const cell = (extra = {}) => ({
  border: '1.5px solid #444',
  padding: '7px 10px',
  fontSize: 11,
  color: '#1a2744',
  ...extra,
})

const MIN_ROWS = 5

export default function QuotationPage({ zoom = 1, pageRef }) {
  const clientInfo      = useDocumentStore(s => s.clientInfo)
  const metadata        = useDocumentStore(s => s.metadata)
  const lineItems       = useDocumentStore(s => s.lineItems)
  const totals          = useDocumentStore(s => s.totals)
  const notes           = useDocumentStore(s => s.notes)
  const termsConditions = useDocumentStore(s => s.termsConditions)

  const padRows = Math.max(0, MIN_ROWS - lineItems.length)

  return (
    <div
      className="pwrap flex-shrink-0"
      style={{ width: Math.round(660 * zoom), minHeight: Math.round(930 * zoom) }}
    >
      <div
        ref={pageRef}
        className="paper"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width: 660,
          minHeight: 930,
          background: '#fff',
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
          {/* LEFT: logo + tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <img src="/nnt-logo.png" alt="NNT" style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
            <div style={{ fontSize: 9, color: '#D77B49', fontStyle: 'italic', marginTop: 5, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>
              A Legacy of Loyalty
            </div>
          </div>

          {/* RIGHT: design image */}
          <img src="/design.png" alt="" style={{ height: 40, width: 'auto', display: 'block' }} />
        </div>

        {/* ══ BODY ══ */}
        <div style={{ flex: 1, padding: '22px 32px 20px', position: 'relative' }}>

          {/* NNT watermark — faded centre */}
          <div style={{
            position: 'absolute',
            left: '50%', top: '50%',
            transform: 'translate(-20%, -40%)',
            opacity: 0.04,
            pointerEvents: 'none',
            zIndex: 0,
          }}>
            <img src="/nnt-logo.png" style={{ width: 320, height: 320, objectFit: 'contain' }} />
          </div>

          {/* "Quotation" title */}
          <h1 style={{
            textAlign: 'center',
            fontFamily: "'Playfair Display', serif",
            fontSize: 30, fontWeight: 700,
            color: '#1a2744',
            margin: '0 0 14px',
            position: 'relative', zIndex: 1,
          }}>
            Quotation
          </h1>

          {/* Date row */}
          <div style={{ fontSize: 12, color: '#444', marginBottom: 18, position: 'relative', zIndex: 1 }}>
            Date: <span style={{ fontWeight: 500 }}>{fmtDate(metadata.date)}</span>
            {metadata.invoiceNumber && (
              <span style={{ marginLeft: 28 }}>
                Quote No.: <span style={{ fontWeight: 500 }}>{metadata.invoiceNumber}</span>
              </span>
            )}
          </div>

          {/* ── FROM / TO ── */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 22, position: 'relative', zIndex: 1 }}>
            {/* FROM — NNT fixed */}
            <div style={{ flex: 1, border: '1px solid #bbb', borderRadius: 4, padding: '12px 14px' }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 9, color: '#1a2744' }}>From</div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.85 }}>
                <div>Name: <span style={{ color: '#1a2744', fontWeight: 500 }}>NNT</span></div>
                <div>Number: <span style={{ color: '#1a2744' }}>+880 1760-760730</span></div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span style={{ flexShrink: 0 }}>Address:</span>
                  <span style={{ color: '#1a2744' }}>262/263 Bangshal Road,<br />Nawabpur, Dhaka-1100</span>
                </div>
              </div>
            </div>

            {/* TO — client */}
            <div style={{ flex: 1, border: '1px solid #bbb', borderRadius: 4, padding: '12px 14px' }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 9, color: '#1a2744' }}>TO</div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.85 }}>
                <div>Name: <span style={{ color: '#1a2744', fontWeight: clientInfo.name ? 500 : 400 }}>{clientInfo.name}</span></div>
                <div>Number: <span style={{ color: '#1a2744' }}>{clientInfo.contact}</span></div>
                {clientInfo.email && (
                  <div>Email: <span style={{ color: '#1a2744' }}>{clientInfo.email}</span></div>
                )}
                <div style={{ display: 'flex', gap: 4 }}>
                  <span style={{ flexShrink: 0 }}>Address:</span>
                  <span style={{ color: '#1a2744', whiteSpace: 'pre-line' }}>{clientInfo.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── LINE ITEMS TABLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, position: 'relative', zIndex: 1 }}>
            <thead>
              <tr>
                <th style={{ ...cell({ background: '#f5f5f5', fontWeight: 700, textAlign: 'center', width: 52 }) }}>SL NO.</th>
                <th style={{ ...cell({ background: '#f5f5f5', fontWeight: 700, textAlign: 'left' }) }}>Description</th>
                <th style={{ ...cell({ background: '#f5f5f5', fontWeight: 700, textAlign: 'right', width: 72 }) }}>quantity</th>
                <th style={{ ...cell({ background: '#f5f5f5', fontWeight: 700, textAlign: 'right', width: 88 }) }}>Unit price</th>
                <th style={{ ...cell({ background: '#f5f5f5', fontWeight: 700, textAlign: 'right', width: 90 }) }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ ...cell({ textAlign: 'center', color: '#666' }) }}>{idx + 1}</td>
                  <td style={{ ...cell({ color: item.description ? '#1a2744' : '#ccc', fontStyle: item.description ? 'normal' : 'italic' }) }}>
                    {item.description || 'Item description'}
                  </td>
                  <td style={{ ...cell({ textAlign: 'right', color: '#444' }) }}>{item.quantity}</td>
                  <td style={{ ...cell({ textAlign: 'right', color: '#444' }) }}>{CURRENCY} {fmtNum(item.rate)}</td>
                  <td style={{ ...cell({ textAlign: 'right', fontWeight: 600 }) }}>{CURRENCY} {fmtNum(item.amount)}</td>
                </tr>
              ))}

              {/* Padding rows */}
              {Array.from({ length: padRows }).map((_, i) => (
                <tr key={'p' + i}>
                  <td style={cell({ height: 30 })}></td>
                  <td style={cell()}></td>
                  <td style={cell()}></td>
                  <td style={cell()}></td>
                  <td style={cell()}></td>
                </tr>
              ))}

              {/* Total amount row */}
              <tr>
                <td colSpan={4} style={{ ...cell({ textAlign: 'right', fontWeight: 600, fontSize: 12, background: '#fafafa' }) }}>
                  Total amount
                </td>
                <td style={{ ...cell({ textAlign: 'right', fontWeight: 700, fontSize: 12, background: '#fafafa' }) }}>
                  {CURRENCY} {fmtNum(totals.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── Note + Terms ── */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#1a2744', marginBottom: 3 }}>Note:</div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.65, whiteSpace: 'pre-line', minHeight: 18 }}>
                {notes}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#1a2744', marginBottom: 3 }}>Terms and Conditions:</div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.65, whiteSpace: 'pre-line', minHeight: 18 }}>
                {termsConditions || '50% has to be paid in advance.'}
              </div>
            </div>
          </div>
        </div>

        {/* ══ FOOTER BAND ══ */}
        <div style={{
          background: '#224E5F',
          borderRadius: '0 48px 48px 0',
          padding: '12px 32px 12px 28px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 8,
          flexShrink: 0, marginTop: 'auto',
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
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', flex: '0 0 auto' }}>Page 1 / 1</span>
        </div>
      </div>
    </div>
  )
}
