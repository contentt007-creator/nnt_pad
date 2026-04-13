import { useEditorStore, DOC_TITLES } from '../store/editorStore'
import GoogleAuth from '../auth/GoogleAuth'

const TABS = Object.keys(DOC_TITLES)

const DOC_ICONS = { bill: '🧾', quotation: '📋', workorder: '🔧' }

export default function Header({ onTogglePanel }) {
  const doc    = useEditorStore(s => s.doc)
  const setDoc = useEditorStore(s => s.setDoc)

  return (
    <header
      className="flex items-center flex-shrink-0 overflow-x-auto"
      style={{
        background: 'linear-gradient(135deg, #224E5F 0%, #1a3d4d 100%)',
        borderBottom: '2px solid #D77B49',
        scrollbarWidth: 'none',
        boxShadow: '0 2px 12px rgba(34,78,95,0.25)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-4 h-12 border-r flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <img src="/nnt-logo.png" alt="NNT" style={{ height: 28, filter: 'brightness(0) invert(1)', objectFit: 'contain' }} />
        <div>
          <div className="font-display font-bold text-white text-[16px] tracking-[2px] leading-none">NNT</div>
          <div className="text-[8px] tracking-[1.5px] uppercase leading-none mt-0.5" style={{ color: '#D77B49' }}>Editor</div>
        </div>
      </div>

      {/* Doc type tabs */}
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => setDoc(tab)}
          className={`h-12 px-4 border-none bg-transparent text-[11px] font-medium
                      uppercase tracking-[0.6px] cursor-pointer whitespace-nowrap flex-shrink-0
                      border-b-2 -mb-0.5 transition-all duration-150 flex items-center gap-1.5
                      ${doc === tab
                        ? 'border-b-[#D77B49] text-white'
                        : 'border-transparent text-white/50 hover:text-white/80'
                      }`}
          style={{ borderBottomColor: doc === tab ? '#D77B49' : 'transparent' }}
        >
          <span style={{ opacity: 0.8 }}>{DOC_ICONS[tab]}</span>
          {DOC_TITLES[tab]}
        </button>
      ))}

      {/* Right side */}
      <div className="ml-auto flex items-center">
        <GoogleAuth />
        {/* Mobile toggle */}
        <button
          onClick={onTogglePanel}
          className="sm:hidden flex items-center justify-center text-white/70 text-xl px-3.5 h-12 flex-shrink-0 hover:text-white transition-colors"
          title="Settings"
        >
          ⚙
        </button>
      </div>
    </header>
  )
}
