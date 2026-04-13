import { useRef, useState, useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'
import { useDrive } from '../hooks/useDrive'
import { exportToPDF, exportToHTML } from '../lib/exportPDF'
import { DOC_TITLES } from '../store/editorStore'

function Section({ title, icon, children }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-1.5 mb-2 pb-1.5"
           style={{ borderBottom: '1px solid rgba(34,78,95,0.12)' }}>
        <span className="text-[13px]">{icon}</span>
        <h5 className="text-[10px] font-semibold uppercase tracking-[1.5px]"
            style={{ color: '#224E5F' }}>
          {title}
        </h5>
      </div>
      {children}
    </div>
  )
}

function PanelBtn({ onClick, active, children, danger, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px]
                  cursor-pointer w-full mb-1.5 transition-all duration-150 text-left
                  touch-manipulation font-sans font-medium ${className}
                  ${danger
                    ? 'border-red-200 text-red-500 hover:bg-red-50 bg-white'
                    : active
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary/40 hover:bg-white/80 shadow-sm'
                  }`}
      style={active ? { background: 'linear-gradient(135deg, #224E5F, #1a3d4d)', borderColor: 'transparent' } : {}}
    >
      {children}
    </button>
  )
}

export default function RightPanel({ isOpen }) {
  const sel             = useEditorStore(s => s.sel)
  const pages           = useEditorStore(s => s.pages)
  const paper           = useEditorStore(s => s.paper)
  const doc             = useEditorStore(s => s.doc)
  const bg              = useEditorStore(s => s.bg)
  const setPaper        = useEditorStore(s => s.setPaper)
  const setBg           = useEditorStore(s => s.setBg)
  const addPage         = useEditorStore(s => s.addPage)
  const removePage      = useEditorStore(s => s.removePage)
  const updateElement   = useEditorStore(s => s.updateElement)
  const saveHistory     = useEditorStore(s => s.saveHistory)
  const deleteElement   = useEditorStore(s => s.deleteElement)
  const tableOperation  = useEditorStore(s => s.tableOperation)
  const deselectElement = useEditorStore(s => s.deselectElement)
  const showToast       = useEditorStore(s => s.showToast)
  const driveSaving     = useEditorStore(s => s.driveSaving)
  const accessToken     = useEditorStore(s => s.accessToken)
  const getState        = useEditorStore(s => s.getSerializableState)

  const { save: driveSave, load: driveLoad, list: driveList } = useDrive()
  const [driveFiles, setDriveFiles]     = useState([])
  const [showDriveFiles, setShowDriveFiles] = useState(false)
  const padInputRef = useRef(null)

  const selEl = sel ? pages[sel.pi]?.els.find(e => e.id === sel.eid) : null

  useEffect(() => {
    if (!accessToken || !showDriveFiles) return
    driveList().then(setDriveFiles)
  }, [accessToken, showDriveFiles])

  const loadPad = (e) => {
    const f = e.target.files[0]; if (!f) return
    const rd = new FileReader()
    rd.onload = (re) => setBg(re.target.result)
    rd.readAsDataURL(f)
  }

  const sp = (prop, val) => {
    if (!sel) return
    updateElement(sel.eid, sel.pi, { [prop]: parseFloat(val) || 0 })
    saveHistory()
  }

  const handlePDF = async () => {
    deselectElement()
    showToast('Preparing PDF…', 8000)
    await new Promise(r => setTimeout(r, 120))
    try { await exportToPDF(); showToast('PDF downloaded ✓') }
    catch (err) { showToast('PDF failed: ' + err.message) }
  }

  const handleHTML = () => {
    exportToHTML(getState(), DOC_TITLES)
    showToast('HTML downloaded ✓')
  }

  return (
    <div
      id="rp-panel"
      className={`flex-shrink-0 overflow-y-auto transition-transform duration-300 ${isOpen ? 'open' : ''}`}
      style={{
        width: 210,
        background: 'linear-gradient(180deg, #f5f2ed 0%, #f0ede7 100%)',
        borderLeft: '1px solid rgba(34,78,95,0.12)',
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* ── Google Drive ── */}
      {accessToken && (
        <Section title="Google Drive" icon="☁">
          <PanelBtn onClick={driveSave}>
            {driveSaving ? '⏳ Saving…' : '💾 Save to Drive'}
          </PanelBtn>
          <PanelBtn onClick={() => setShowDriveFiles(!showDriveFiles)}>
            📂 Open from Drive
          </PanelBtn>
          {showDriveFiles && (
            <div className="mt-1 max-h-[140px] overflow-y-auto rounded-lg border bg-white"
                 style={{ borderColor: 'rgba(34,78,95,0.15)' }}>
              {driveFiles.length === 0
                ? <div className="text-[11px] text-gray-400 p-3 text-center">No saved files</div>
                : driveFiles.map(f => (
                  <button key={f.id}
                    onClick={() => { driveLoad(f.id); setShowDriveFiles(false) }}
                    className="w-full text-left px-3 py-2 text-[11px] hover:bg-primary/5
                               border-b last:border-0 transition-colors"
                    style={{ borderColor: 'rgba(34,78,95,0.08)' }}>
                    <div className="font-medium text-gray-700 truncate">{f.name}</div>
                    <div className="text-gray-400 text-[10px]">
                      {new Date(f.modifiedTime).toLocaleDateString()}
                    </div>
                  </button>
                ))
              }
            </div>
          )}
        </Section>
      )}

      {/* ── Paper ── */}
      <Section title="Paper" icon="📄">
        <PanelBtn active={paper === 'nnt'} onClick={() => setPaper('nnt')}>
          <span>📋</span> NNT Letterhead
        </PanelBtn>
        <PanelBtn active={paper === 'blank'} onClick={() => setPaper('blank')}>
          <span>⬜</span> Blank Page
        </PanelBtn>
        <div
          onClick={() => padInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer
                     text-[11px] transition-all"
          style={{
            borderColor: bg ? '#D77B49' : 'rgba(34,78,95,0.2)',
            color: bg ? '#D77B49' : '#888',
            background: bg ? 'rgba(215,123,73,0.05)' : 'transparent',
          }}
        >
          {bg ? '✅ Custom pad active' : '📁 Upload Pad Image'}
        </div>
        <input ref={padInputRef} type="file" accept="image/*" className="hidden" onChange={loadPad} />
      </Section>

      {/* ── Pages ── */}
      <Section title="Pages" icon="📑">
        <div className="grid grid-cols-2 gap-1.5">
          <button onClick={addPage}
            className="flex items-center justify-center gap-1 py-2 rounded-lg text-[11px]
                       font-semibold text-white transition-all shadow-sm border-none cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #224E5F, #1a3d4d)' }}>
            ＋ Add
          </button>
          <button onClick={removePage}
            className="flex items-center justify-center gap-1 py-2 rounded-lg text-[11px]
                       font-medium bg-white text-gray-600 border transition-all shadow-sm cursor-pointer
                       hover:border-primary/40"
            style={{ borderColor: 'rgba(34,78,95,0.2)' }}>
            − Remove
          </button>
        </div>
        <div className="mt-1 text-[10px] text-center font-medium" style={{ color: '#224E5F' }}>
          {pages.length} page{pages.length !== 1 ? 's' : ''}
        </div>
      </Section>

      {/* ── Selected Element ── */}
      {selEl && (
        <Section title="Element" icon="✏️">
          {/* Position/size */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <PropInput label="X" type="number" value={Math.round(selEl.x)} onChange={e => sp('x', e.target.value)} />
            <PropInput label="Y" type="number" value={Math.round(selEl.y)} onChange={e => sp('y', e.target.value)} />
            <PropInput label="W" type="number" value={Math.round(selEl.w)} onChange={e => sp('w', e.target.value)} />
          </div>

          {/* Opacity */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] mb-1"
                 style={{ color: '#224E5F', opacity: 0.6 }}>
              <span>Opacity</span>
              <span>{selEl.op ?? 100}%</span>
            </div>
            <input type="range" min="10" max="100"
              value={selEl.op ?? 100}
              onChange={e => sp('op', e.target.value)}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#D77B49' }}
            />
          </div>

          {/* Table ops */}
          {selEl.type === 'table' && (
            <div className="mb-3">
              <div className="text-[9px] uppercase tracking-wider mb-1.5 font-semibold"
                   style={{ color: '#224E5F', opacity: 0.5 }}>Table</div>
              <div className="grid grid-cols-3 gap-1">
                {[['addR','+Row'],['delR','−Row'],['addC','+Col'],['delC','−Col'],['hdr','Header'],['zebra','Zebra']].map(([op, label]) => (
                  <button key={op} onClick={() => tableOperation(op)}
                    className="py-1 text-[10px] font-medium rounded-md border bg-white
                               transition-all cursor-pointer text-gray-600 hover:text-white hover:border-transparent"
                    style={{ borderColor: 'rgba(34,78,95,0.18)' }}
                    onMouseEnter={e => { e.currentTarget.style.background='#224E5F'; e.currentTarget.style.color='#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color=''; }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => deleteElement(selEl.id, sel.pi)}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg
                       text-[11px] font-medium border border-red-200 text-red-500
                       bg-white hover:bg-red-50 transition-all cursor-pointer"
          >
            🗑 Delete Element
          </button>
        </Section>
      )}

      {/* ── Export ── */}
      <Section title="Export" icon="⬇">
        <button onClick={handlePDF}
          className="w-full py-2.5 mb-2 rounded-lg text-[12px] font-semibold text-white
                     border-none cursor-pointer transition-all shadow-sm"
          style={{ background: 'linear-gradient(135deg, #c0392b, #a93226)' }}>
          📄 Download PDF
        </button>
        <button onClick={handleHTML}
          className="w-full py-2.5 rounded-lg text-[12px] font-semibold text-white
                     border-none cursor-pointer transition-all shadow-sm"
          style={{ background: 'linear-gradient(135deg, #224E5F, #1a3d4d)' }}>
          📝 Download HTML
        </button>
      </Section>
    </div>
  )
}

function PropInput({ label, ...props }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider mb-0.5 font-semibold"
           style={{ color: '#224E5F', opacity: 0.5 }}>{label}</div>
      <input {...props} className="pi w-full" />
    </div>
  )
}
