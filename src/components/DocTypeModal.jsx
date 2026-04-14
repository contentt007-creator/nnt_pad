import { useDocumentStore } from '../store/documentStore'

const OPTIONS = [
  {
    type: 'invoice',
    icon: '🧾',
    title: 'Invoice',
    desc: 'Bill your client for goods or services rendered',
  },
  {
    type: 'bill',
    icon: '📋',
    title: 'Invoice / Bill',
    desc: 'Combined invoice and bill for transactions',
  },
  {
    type: 'quotation',
    icon: '📝',
    title: 'Quotation',
    desc: 'Provide a price estimate valid for a specific period',
  },
  {
    type: 'chalan',
    icon: '🚚',
    title: 'Delivery Chalan',
    desc: 'Record the delivery of goods to a client',
  },
]

export default function DocTypeModal() {
  const showModal  = useDocumentStore(s => s.showDocTypeModal)
  const setDocType = useDocumentStore(s => s.setDocType)

  if (!showModal) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(20,40,50,0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '40px 36px',
        maxWidth: 520,
        width: '100%',
        boxShadow: '0 32px 64px rgba(0,0,0,0.28)',
      }}>
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/nnt-logo.png"
            alt="NNT"
            style={{ height: 48, objectFit: 'contain', marginBottom: 16 }}
          />
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24, fontWeight: 700,
            color: '#224E5F', margin: '0 0 8px',
            letterSpacing: 0.5,
          }}>
            What are you creating?
          </h2>
          <p style={{ color: '#999', fontSize: 13, margin: 0 }}>
            Choose a document type to get started
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {OPTIONS.map(opt => (
            <button
              key={opt.type}
              onClick={() => setDocType(opt.type)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '15px 20px',
                border: '2px solid #e8e4dc',
                borderRadius: 12,
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                width: '100%',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#224E5F'
                e.currentTarget.style.background  = '#f7f4ef'
                e.currentTarget.style.transform   = 'translateX(6px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e8e4dc'
                e.currentTarget.style.background  = '#fff'
                e.currentTarget.style.transform   = 'none'
              }}
            >
              <span style={{ fontSize: 26, flexShrink: 0 }}>{opt.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a2744', marginBottom: 2 }}>
                  {opt.title}
                </div>
                <div style={{ fontSize: 11, color: '#999' }}>{opt.desc}</div>
              </div>
              <span style={{ color: '#ccc', fontSize: 20, flexShrink: 0 }}>›</span>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#bbb' }}>
          You can change this at any time from the form panel
        </p>
      </div>
    </div>
  )
}
