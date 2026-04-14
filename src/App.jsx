import { useState, useEffect } from 'react'
import { useHistory } from './hooks/useHistory'
import Header from './components/Header'
import FormPanel from './components/FormPanel'
import DocumentPreview from './components/DocumentPreview'
import DocTypeModal from './components/DocTypeModal'
import Toast from './components/Toast'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function App() {
  useHistory()
  const isMobile = useIsMobile()
  const [mobileTab, setMobileTab] = useState('form')

  return (
    <div className="flex flex-col font-sans text-[13px] text-gray-900 bg-bg select-none"
         style={{ height: '100dvh', minHeight: '100dvh' }}>
      <Header />

      {/* ── Mobile tab bar ── */}
      {isMobile && (
        <div style={{
          display: 'flex',
          flexShrink: 0,
          background: '#fff',
          borderBottom: '1px solid #e8e4dc',
        }}>
          {[['form', '✏️', 'Form'], ['preview', '👁', 'Preview']].map(([tab, icon, label]) => {
            const active = mobileTab === tab
            return (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                style={{
                  flex: 1,
                  padding: '11px 0 9px',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  border: 'none',
                  borderBottom: active ? '2.5px solid #224E5F' : '2.5px solid transparent',
                  background: active ? 'rgba(34,78,95,0.05)' : 'transparent',
                  color: active ? '#224E5F' : '#999',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 15 }}>{icon}</span>
                {label}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">
        {isMobile ? (
          mobileTab === 'form'
            ? <FormPanel isMobile />
            : <DocumentPreview isMobile />
        ) : (
          <>
            <FormPanel />
            <DocumentPreview />
          </>
        )}
      </div>

      <DocTypeModal />
      <Toast />
    </div>
  )
}
