import { useRef } from 'react'
import { useEditorStore } from '../store/editorStore'
import TablePicker from './TablePicker'

const FONTS = [
  { label: 'DM Sans',         value: "'DM Sans',sans-serif" },
  { label: 'Playfair Display',value: "'Playfair Display',serif" },
  { label: 'Georgia',         value: 'Georgia,serif' },
  { label: 'Arial',           value: 'Arial,sans-serif' },
  { label: 'Courier New',     value: "'Courier New',monospace" },
  { label: 'Times New Roman', value: "'Times New Roman',serif" },
]
const SIZES = [10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48]

const Btn = ({ onClick, title, children, active }) => (
  <button
    onClick={onClick}
    title={title}
    className={`min-w-[28px] h-7 px-1.5 rounded-md border cursor-pointer
                inline-flex items-center justify-center text-[12px]
                transition-all duration-100 whitespace-nowrap flex-shrink-0
                font-sans touch-manipulation
                ${active
                  ? 'bg-accent text-white border-accent shadow-sm'
                  : 'bg-transparent border-transparent text-white/70 hover:bg-white/12 hover:text-white'
                }`}
  >
    {children}
  </button>
)

const Sep = () => (
  <div className="w-px h-[20px] mx-1 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />
)

const AddBtn = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="border-none rounded-md text-white px-3 text-[11px] font-semibold
               cursor-pointer h-7 inline-flex items-center gap-1
               transition-all duration-100 flex-shrink-0 touch-manipulation shadow-sm"
    style={{ background: 'linear-gradient(135deg, #D77B49 0%, #e08a5c 100%)' }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
  >
    {children}
  </button>
)

export default function Toolbar() {
  const { sel, pages, zoom } = useEditorStore(s => ({
    sel: s.sel, pages: s.pages, zoom: s.zoom,
  }))
  const addText        = useEditorStore(s => s.addText)
  const addImage       = useEditorStore(s => s.addImage)
  const undo           = useEditorStore(s => s.undo)
  const redo           = useEditorStore(s => s.redo)
  const setZoom        = useEditorStore(s => s.setZoom)
  const updateElement  = useEditorStore(s => s.updateElement)
  const saveHistory    = useEditorStore(s => s.saveHistory)
  const setTablePicker = useEditorStore(s => s.setTablePicker)
  const tablePicker    = useEditorStore(s => s.tablePicker)
  const tableBtnRef    = useRef(null)

  const selEl = sel ? pages[sel.pi]?.els.find(e => e.id === sel.eid) : null

  const execCmd = (cmd, val = null) => document.execCommand(cmd, false, val)

  const applyFF = (ff) => {
    if (selEl?.type === 'text') {
      updateElement(sel.eid, sel.pi, { ff })
      const d = document.querySelector(`.cv[data-eid="${sel.eid}"][data-pi="${sel.pi}"]`)
      const t = d?.querySelector('.txe')
      if (t) t.style.fontFamily = ff
      saveHistory()
    }
  }

  const applyFS = (fs) => {
    if (selEl?.type === 'text') {
      updateElement(sel.eid, sel.pi, { fs: parseInt(fs) || 12 })
      const d = document.querySelector(`.cv[data-eid="${sel.eid}"][data-pi="${sel.pi}"]`)
      const t = d?.querySelector('.txe')
      if (t) t.style.fontSize = fs + 'px'
      saveHistory()
    }
  }

  const handleAddImage = () => {
    const inp = document.createElement('input')
    inp.type = 'file'; inp.accept = 'image/*'
    inp.onchange = (ev) => {
      const f = ev.target.files[0]; if (!f) return
      const rd = new FileReader()
      rd.onload = (re) => addImage(0, re.target.result)
      rd.readAsDataURL(f)
    }
    inp.click()
  }

  return (
    <div
      className="flex items-center gap-0.5 px-3 py-1.5 flex-shrink-0 overflow-x-auto min-h-[42px]"
      style={{
        background: 'linear-gradient(180deg, #2d6478 0%, #224E5F 100%)',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
        scrollbarWidth: 'none',
        boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Font family */}
      <select
        className="tsel w-[110px]"
        value={selEl?.ff || "'DM Sans',sans-serif"}
        onChange={e => applyFF(e.target.value)}
      >
        {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>

      {/* Font size */}
      <select
        className="tsel w-[48px] ml-1"
        value={selEl?.fs || 12}
        onChange={e => applyFS(e.target.value)}
      >
        {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <Sep />

      <Btn onClick={() => execCmd('bold')}          title="Bold"><b>B</b></Btn>
      <Btn onClick={() => execCmd('italic')}        title="Italic"><i>I</i></Btn>
      <Btn onClick={() => execCmd('underline')}     title="Underline"><u>U</u></Btn>
      <Btn onClick={() => execCmd('strikeThrough')} title="Strikethrough">
        <span style={{ textDecoration: 'line-through' }}>S</span>
      </Btn>

      <Sep />

      <Btn onClick={() => execCmd('justifyLeft')}   title="Align left">⬅</Btn>
      <Btn onClick={() => execCmd('justifyCenter')} title="Center">⬌</Btn>
      <Btn onClick={() => execCmd('justifyRight')}  title="Align right">➡</Btn>
      <Btn onClick={() => execCmd('justifyFull')}   title="Justify">☰</Btn>

      <Sep />

      <input
        type="color" className="tcol" defaultValue="#224E5F"
        onChange={e => execCmd('foreColor', e.target.value)} title="Text color"
      />
      <input
        type="color" className="tcol ml-1" defaultValue="#ffffff"
        onChange={e => execCmd('hiliteColor', e.target.value)} title="Highlight"
      />

      <Sep />

      <Btn onClick={() => execCmd('insertUnorderedList')} title="Bullet list">• ≡</Btn>
      <Btn onClick={() => execCmd('insertOrderedList')}   title="Numbered list">1≡</Btn>

      <Sep />

      <AddBtn onClick={() => addText()}>＋ Text</AddBtn>

      <button
        ref={tableBtnRef}
        onClick={() => setTablePicker(!tablePicker)}
        className="border-none rounded-md text-white px-3 text-[11px] font-semibold
                   cursor-pointer h-7 inline-flex items-center gap-1 ml-1
                   transition-all flex-shrink-0 touch-manipulation shadow-sm"
        style={{ background: 'linear-gradient(135deg, #D77B49 0%, #e08a5c 100%)' }}
      >
        ＋ Table
      </button>

      <button
        onClick={handleAddImage}
        className="border-none rounded-md text-white px-3 text-[11px] font-semibold
                   cursor-pointer h-7 inline-flex items-center gap-1 ml-1
                   transition-all flex-shrink-0 touch-manipulation shadow-sm"
        style={{ background: 'linear-gradient(135deg, #D77B49 0%, #e08a5c 100%)' }}
      >
        ＋ Image
      </button>

      <Sep />

      <Btn onClick={undo} title="Undo (Ctrl+Z)">↩</Btn>
      <Btn onClick={redo} title="Redo (Ctrl+Y)">↪</Btn>

      <Sep />

      <Btn onClick={() => setZoom(-0.15)} title="Zoom out">−</Btn>
      <span className="text-[11px] min-w-[38px] text-center flex-shrink-0 font-medium tabular-nums"
            style={{ color: 'rgba(255,255,255,0.7)' }}>
        {Math.round(zoom * 100)}%
      </span>
      <Btn onClick={() => setZoom(0.15)} title="Zoom in">+</Btn>

      <TablePicker anchorRef={tableBtnRef} />
    </div>
  )
}
