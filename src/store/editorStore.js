import { create } from 'zustand'

const DOC_TITLES = { bill: 'Invoice / Bill', quotation: 'Quotation', workorder: 'Work Order' }

function takeSnapshot(state) {
  return JSON.stringify({
    doc: state.doc,
    paper: state.paper,
    bg: state.bg,
    pages: state.pages,
    nid: state.nid,
  })
}

function applySnapshot(snap) {
  return JSON.parse(snap)
}

export { DOC_TITLES }

export const useEditorStore = create((set, get) => ({
  // ── Document state (serializable) ──
  doc: 'bill',
  paper: 'nnt',
  bg: null,
  pages: [{ id: 1, els: [] }],
  nid: 2,

  // ── UI state ──
  sel: null,       // { eid, pi }
  zoom: 1,
  hist: [],
  hi: -1,
  ctxMenu: null,   // { x, y, eid, pi }
  tablePicker: false,
  tableSel: { r: 3, c: 3 },
  toast: null,
  toastTimer: null,

  // ── Auth / Drive ──
  user: null,
  accessToken: null,
  driveFileId: null,
  driveSaving: false,

  // ── Auth actions ──
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  logout: () => set({ user: null, accessToken: null, driveFileId: null }),
  setDriveFileId: (id) => set({ driveFileId: id }),
  setDriveSaving: (v) => set({ driveSaving: v }),

  // ── Doc / Paper ──
  setDoc: (doc) => set({ doc }),
  setPaper: (paper) => { set({ paper, bg: null }); get().saveHistory(); },
  setBg: (bg) => { set({ bg, paper: 'custom' }); get().saveHistory(); },
  setZoom: (delta) => {
    const z = Math.max(0.25, Math.min(2, get().zoom + delta))
    set({ zoom: z })
  },

  // ── Pages ──
  addPage: () => {
    set(s => ({ pages: [...s.pages, { id: Date.now(), els: [] }] }))
    get().saveHistory()
    get().showToast('Page added')
  },
  removePage: () => {
    const { pages } = get()
    if (pages.length <= 1) { get().showToast('Cannot remove last page'); return }
    set(s => ({ pages: s.pages.slice(0, -1), sel: null }))
    get().saveHistory()
    get().showToast('Page removed')
  },

  // ── Element selection ──
  selectElement: (eid, pi) => set({ sel: { eid, pi } }),
  deselectElement: () => set({ sel: null }),

  // ── Element mutation (no history — caller decides) ──
  updateElement: (eid, pi, updates) => {
    set(s => ({
      pages: s.pages.map((pg, i) =>
        i !== pi ? pg
          : { ...pg, els: pg.els.map(el => el.id === eid ? { ...el, ...updates } : el) }
      ),
    }))
  },

  // ── Element actions (with history) ──
  deleteElement: (eid, pi) => {
    set(s => ({
      pages: s.pages.map((pg, i) =>
        i !== pi ? pg : { ...pg, els: pg.els.filter(el => el.id !== eid) }
      ),
      sel: s.sel?.eid === eid ? null : s.sel,
    }))
    get().saveHistory()
    get().showToast('Deleted')
  },

  addText: (pi = 0, x = 40, y = null) => {
    const s = get()
    const actualPi = Math.min(pi, s.pages.length - 1)
    const pg = s.pages[actualPi]
    const yv = y !== null ? y : 40 + pg.els.length * 24
    const el = {
      id: s.nid, type: 'text',
      x, y: Math.min(680, yv), w: 280, h: null,
      content: 'Double-click to edit',
      ff: "'DM Sans',sans-serif", fs: 12, fc: '#1a2744',
      z: pg.els.length + 1, op: 100,
    }
    set(st => ({
      nid: st.nid + 1,
      pages: st.pages.map((p, i) => i !== actualPi ? p : { ...p, els: [...p.els, el] }),
      sel: { eid: el.id, pi: actualPi },
    }))
    get().saveHistory()
    get().showToast('Text block added · Double-click to edit')
    return el.id
  },

  addImage: (pi = 0, src, w = 200, h = 160) => {
    const s = get()
    const el = {
      id: s.nid, type: 'image',
      x: 40, y: 40, w, h, src,
      z: s.pages[pi].els.length + 1, op: 100,
    }
    set(st => ({
      nid: st.nid + 1,
      pages: st.pages.map((p, i) => i !== pi ? p : { ...p, els: [...p.els, el] }),
      sel: { eid: el.id, pi },
    }))
    get().saveHistory()
    get().showToast('Image added')
  },

  addTable: (pi = 0, rows = 3, cols = 3) => {
    const s = get()
    const cells = Array.from({ length: rows }, () => Array(cols).fill(''))
    const el = {
      id: s.nid, type: 'table',
      x: 40, y: 40 + s.pages[pi].els.length * 18,
      w: Math.max(260, cols * 90), h: null,
      rows, cols, cells, hdr: true, zebra: false,
      z: s.pages[pi].els.length + 1, op: 100,
    }
    set(st => ({
      nid: st.nid + 1,
      pages: st.pages.map((p, i) => i !== pi ? p : { ...p, els: [...p.els, el] }),
      sel: { eid: el.id, pi },
    }))
    get().saveHistory()
    get().showToast(`${rows}×${cols} table inserted`)
  },

  duplicateElement: (eid, pi) => {
    const { pages, nid } = get()
    const el = pages[pi]?.els.find(e => e.id === eid)
    if (!el) return
    const cl = { ...JSON.parse(JSON.stringify(el)), id: nid, x: el.x + 20, y: el.y + 20 }
    set(s => ({
      nid: s.nid + 1,
      pages: s.pages.map((p, i) => i !== pi ? p : { ...p, els: [...p.els, cl] }),
      sel: { eid: cl.id, pi },
    }))
    get().saveHistory()
    get().showToast('Duplicated')
  },

  bringToFront: (eid, pi) => {
    const { pages } = get()
    const maxZ = Math.max(...(pages[pi]?.els.map(e => e.z || 1) || [1]))
    get().updateElement(eid, pi, { z: maxZ + 1 })
    get().saveHistory()
  },

  sendToBack: (eid, pi) => {
    get().updateElement(eid, pi, { z: 0 })
    get().saveHistory()
  },

  tableOperation: (op) => {
    const { sel, pages } = get()
    if (!sel) return
    const { eid, pi } = sel
    const el = pages[pi]?.els.find(e => e.id === eid)
    if (!el || el.type !== 'table') return
    let updates = {}
    if (op === 'addR')  updates = { rows: el.rows + 1, cells: [...el.cells, Array(el.cols).fill('')] }
    else if (op === 'delR' && el.rows > 1) updates = { rows: el.rows - 1, cells: el.cells.slice(0, -1) }
    else if (op === 'addC') updates = { cols: el.cols + 1, w: el.w + 80, cells: el.cells.map(r => [...r, '']) }
    else if (op === 'delC' && el.cols > 1) updates = { cols: el.cols - 1, cells: el.cells.map(r => r.slice(0, -1)) }
    else if (op === 'hdr')   updates = { hdr: !el.hdr }
    else if (op === 'zebra') updates = { zebra: !el.zebra }
    get().updateElement(eid, pi, updates)
    get().saveHistory()
  },

  // ── History ──
  saveHistory: () => {
    const s = get()
    const snap = takeSnapshot(s)
    let hist = s.hist.slice(0, s.hi + 1)
    hist = [...hist, snap]
    if (hist.length > 60) hist = hist.slice(hist.length - 60)
    set({ hist, hi: hist.length - 1 })
  },

  undo: () => {
    const { hi, hist } = get()
    if (hi <= 0) { get().showToast('Nothing to undo'); return }
    const snap = applySnapshot(hist[hi - 1])
    set({ ...snap, hi: hi - 1, hist })
    get().showToast('Undo')
  },

  redo: () => {
    const { hi, hist } = get()
    if (hi >= hist.length - 1) { get().showToast('Nothing to redo'); return }
    const snap = applySnapshot(hist[hi + 1])
    set({ ...snap, hi: hi + 1, hist })
    get().showToast('Redo')
  },

  // ── Context menu ──
  showContextMenu: (x, y, eid, pi) => set({ ctxMenu: { x, y, eid, pi } }),
  hideContextMenu: () => set({ ctxMenu: null }),

  // ── Table picker ──
  setTablePicker: (v) => set({ tablePicker: v }),
  setTableSel: (r, c) => set({ tableSel: { r, c } }),

  // ── Toast ──
  showToast: (msg, dur = 2200) => {
    const { toastTimer } = get()
    if (toastTimer) clearTimeout(toastTimer)
    const timer = setTimeout(() => set({ toast: null, toastTimer: null }), dur)
    set({ toast: msg, toastTimer: timer })
  },

  // ── Drive load ──
  loadState: (data) => {
    set({
      doc: data.doc || 'bill',
      paper: data.paper || 'nnt',
      bg: data.bg || null,
      pages: data.pages || [{ id: 1, els: [] }],
      nid: data.nid || 2,
      sel: null,
    })
    get().saveHistory()
  },

  getSerializableState: () => {
    const { doc, paper, bg, pages, nid } = get()
    return { doc, paper, bg, pages, nid }
  },
}))
