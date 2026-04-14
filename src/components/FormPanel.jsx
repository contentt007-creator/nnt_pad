import { useDocumentStore, DOC_CONFIG, CURRENCY } from '../store/documentStore'

/* ── Shared input style ── */
const inp = {
  width: '100%',
  border: '1px solid #e0dcd5',
  borderRadius: 5,
  padding: '6px 8px',
  fontSize: 12,
  background: '#fff',
  color: '#222',
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.12s',
}

function focus(e)  { e.target.style.borderColor = '#224E5F' }
function blur(e)   { e.target.style.borderColor = '#e0dcd5' }

function SectionHeader({ title }) {
  return (
    <div style={{
      fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: 1.8, color: '#224E5F',
      padding: '10px 0 5px',
      borderBottom: '1.5px solid rgba(34,78,95,0.15)',
      marginBottom: 10,
    }}>
      {title}
    </div>
  )
}

function Field({ label, children, half }) {
  return (
    <div style={{ marginBottom: 9, flex: half ? '0 0 calc(50% - 4px)' : '1 1 100%' }}>
      {label && (
        <label style={{
          fontSize: 10, fontWeight: 600, color: '#777', display: 'block',
          marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.8,
        }}>
          {label}
        </label>
      )}
      {children}
    </div>
  )
}

export default function FormPanel() {
  const docType          = useDocumentStore(s => s.docType)
  const clientInfo       = useDocumentStore(s => s.clientInfo)
  const metadata         = useDocumentStore(s => s.metadata)
  const lineItems        = useDocumentStore(s => s.lineItems)
  const taxRate          = useDocumentStore(s => s.taxRate)
  const totals           = useDocumentStore(s => s.totals)
  const notes            = useDocumentStore(s => s.notes)
  const setDocType       = useDocumentStore(s => s.setDocType)
  const setClientInfo    = useDocumentStore(s => s.setClientInfo)
  const setMetadata      = useDocumentStore(s => s.setMetadata)
  const setTaxRate       = useDocumentStore(s => s.setTaxRate)
  const addLineItem      = useDocumentStore(s => s.addLineItem)
  const removeLineItem   = useDocumentStore(s => s.removeLineItem)
  const updateLineItem   = useDocumentStore(s => s.updateLineItem)
  const setNotes            = useDocumentStore(s => s.setNotes)
  const termsConditions     = useDocumentStore(s => s.termsConditions)
  const setTermsConditions  = useDocumentStore(s => s.setTermsConditions)
  const dueBalance          = useDocumentStore(s => s.dueBalance)
  const setDueBalance       = useDocumentStore(s => s.setDueBalance)

  const cfg = DOC_CONFIG[docType] || DOC_CONFIG.invoice

  return (
    <div
      id="form-panel"
      style={{
        width: 340,
        flexShrink: 0,
        overflowY: 'auto',
        background: 'linear-gradient(180deg, #f5f2ed 0%, #f0ede7 100%)',
        borderRight: '1px solid rgba(34,78,95,0.12)',
        padding: '12px 16px 24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Doc Type Selector ── */}
      <SectionHeader title="Document Type" />
      <div style={{ display: 'flex', gap: 5, marginBottom: 4 }}>
        {Object.keys(DOC_CONFIG).map(type => {
          const active = docType === type
          return (
            <button
              key={type}
              onClick={() => setDocType(type)}
              style={{
                flex: 1,
                padding: '7px 4px',
                borderRadius: 7,
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                border: active ? 'none' : '1px solid #ddd',
                background: active
                  ? 'linear-gradient(135deg, #224E5F, #1a3d4d)'
                  : '#fff',
                color: active ? '#fff' : '#666',
                cursor: 'pointer',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                transition: 'all 0.12s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {type === 'bill' ? 'Bill' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          )
        })}
      </div>

      {/* ── Client Info ── */}
      <SectionHeader title="Bill To" />
      <Field label="Client / Company Name">
        <input
          style={inp}
          value={clientInfo.name}
          onChange={e => setClientInfo('name', e.target.value)}
          placeholder="e.g. Acme Corporation"
          onFocus={focus} onBlur={blur}
        />
      </Field>
      <Field label="Address">
        <textarea
          style={{ ...inp, resize: 'vertical', minHeight: 56, lineHeight: 1.5 }}
          value={clientInfo.address}
          onChange={e => setClientInfo('address', e.target.value)}
          placeholder="Street, City, Country"
          onFocus={focus} onBlur={blur}
        />
      </Field>
      <div style={{ display: 'flex', gap: 8 }}>
        <Field label="Phone / Number" half>
          <input
            style={inp}
            value={clientInfo.contact}
            onChange={e => setClientInfo('contact', e.target.value)}
            placeholder="+880 ..."
            onFocus={focus} onBlur={blur}
          />
        </Field>
        <Field label="Email" half>
          <input
            style={inp}
            value={clientInfo.email || ''}
            onChange={e => setClientInfo('email', e.target.value)}
            placeholder="email@..."
            onFocus={focus} onBlur={blur}
          />
        </Field>
      </div>

      {/* ── Document Details ── */}
      <SectionHeader title="Document Details" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Field label={cfg.docLabel} half>
          <input
            style={inp}
            value={metadata.invoiceNumber}
            onChange={e => setMetadata('invoiceNumber', e.target.value)}
            placeholder="INV-001"
            onFocus={focus} onBlur={blur}
          />
        </Field>
        <Field label="Issue Date" half>
          <input
            style={inp}
            type="date"
            value={metadata.date}
            onChange={e => setMetadata('date', e.target.value)}
            onFocus={focus} onBlur={blur}
          />
        </Field>
        <Field label={cfg.dueDateLabel} half>
          <input
            style={inp}
            type="date"
            value={metadata.dueDate}
            onChange={e => setMetadata('dueDate', e.target.value)}
            onFocus={focus} onBlur={blur}
          />
        </Field>
      </div>

      {/* ── Line Items ── */}
      <SectionHeader title="Line Items" />

      {lineItems.map((item, idx) => (
        <div
          key={item.id}
          style={{
            background: '#fff',
            border: '1px solid #e8e4dc',
            borderRadius: 9,
            padding: '10px 12px',
            marginBottom: 8,
            position: 'relative',
          }}
        >
          {/* Row number + delete */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#fff',
              background: '#224E5F', borderRadius: 20,
              padding: '2px 8px', letterSpacing: 0.5,
            }}>
              Item {idx + 1}
            </span>
            {lineItems.length > 1 && (
              <button
                onClick={() => removeLineItem(item.id)}
                style={{
                  background: 'none', border: 'none',
                  color: '#ccc', cursor: 'pointer',
                  fontSize: 17, lineHeight: 1, padding: '0 2px',
                  fontFamily: 'monospace',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#e74c3c'}
                onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
                title="Remove item"
              >
                ×
              </button>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 10, fontWeight: 600, color: '#777', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Description
            </label>
            <input
              style={inp}
              value={item.description}
              onChange={e => updateLineItem(item.id, 'description', e.target.value)}
              placeholder="e.g. Web Design Service"
              onFocus={focus} onBlur={blur}
            />
          </div>

          {/* QTY + Price side by side */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#777', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Qty
              </label>
              <input
                style={inp}
                type="number" min="0"
                value={item.quantity}
                onChange={e => updateLineItem(item.id, 'quantity', e.target.value)}
                placeholder="1"
                onFocus={focus} onBlur={blur}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#777', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Price (৳)
              </label>
              <input
                style={inp}
                type="number" min="0" step="0.01"
                value={item.rate}
                onChange={e => updateLineItem(item.id, 'rate', e.target.value)}
                placeholder="0.00"
                onFocus={focus} onBlur={blur}
              />
            </div>
          </div>

          {/* Amount display */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            paddingTop: 6, borderTop: '1px solid #f0ede8',
            fontSize: 12, fontWeight: 700, color: '#224E5F',
          }}>
            <span style={{ fontSize: 10, color: '#aaa', fontWeight: 400, marginRight: 6, alignSelf: 'center' }}>Amount:</span>
            ৳ {item.amount.toFixed(2)}
          </div>
        </div>
      ))}

      {/* Add Row */}
      <button
        onClick={addLineItem}
        style={{
          width: '100%', padding: '9px 0', marginBottom: 4,
          border: '1.5px dashed rgba(34,78,95,0.28)',
          borderRadius: 9, background: 'transparent',
          color: '#224E5F', fontSize: 11, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.12s',
          fontFamily: "'DM Sans', sans-serif",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(34,78,95,0.06)'
          e.currentTarget.style.borderColor = '#224E5F'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'rgba(34,78,95,0.28)'
        }}
      >
        + Add Item
      </button>

      {/* ── Tax & Totals ── */}
      <SectionHeader title="Tax & Totals" />
      <Field label="Tax Rate (%)">
        <input
          style={{ ...inp, width: 110 }}
          type="number" min="0" max="100" step="0.5"
          value={taxRate}
          onChange={e => setTaxRate(e.target.value)}
          placeholder="0"
          onFocus={focus} onBlur={blur}
        />
      </Field>

      {/* Totals summary box */}
      <div style={{
        background: '#fff', borderRadius: 9,
        border: '1px solid rgba(34,78,95,0.13)',
        padding: '11px 13px', marginBottom: 4,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 5 }}>
          <span>Subtotal</span>
          <span style={{ fontWeight: 500 }}>{CURRENCY} {totals.subtotal.toFixed(2)}</span>
        </div>
        {parseFloat(taxRate) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 5 }}>
            <span>Tax ({taxRate}%)</span>
            <span style={{ fontWeight: 500 }}>{CURRENCY} {totals.tax.toFixed(2)}</span>
          </div>
        )}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          borderTop: '1px solid #e8e4dc', paddingTop: 7, marginTop: 2,
          fontSize: 13, fontWeight: 700, color: '#224E5F',
        }}>
          <span>Grand Total</span>
          <span>{CURRENCY} {totals.grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Due Balance */}
      <Field label="Due Balance (৳)">
        <input
          style={inp}
          type="number" min="0" step="0.01"
          value={dueBalance}
          onChange={e => setDueBalance(e.target.value)}
          placeholder="0.00 — leave blank to hide"
          onFocus={focus} onBlur={blur}
        />
      </Field>

      {/* ── Notes ── */}
      <SectionHeader title={docType === 'quotation' ? 'Note' : 'Notes / Terms'} />
      <Field label="">
        <textarea
          style={{ ...inp, resize: 'vertical', minHeight: 60, lineHeight: 1.55, fontSize: 11 }}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any additional note…"
          onFocus={focus} onBlur={blur}
        />
      </Field>

      {/* ── Terms and Conditions (all types) ── */}
      <SectionHeader title="Terms and Conditions" />
      <Field label="">
        <textarea
          style={{ ...inp, resize: 'vertical', minHeight: 68, lineHeight: 1.55, fontSize: 11 }}
          value={termsConditions}
          onChange={e => setTermsConditions(e.target.value)}
          placeholder="e.g. Payment due within 30 days. Prices valid for 7 days…"
          onFocus={focus} onBlur={blur}
        />
      </Field>
    </div>
  )
}
