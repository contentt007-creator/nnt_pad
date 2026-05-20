import { create } from 'zustand'

export const DOC_CONFIG = {
  invoice: {
    title: 'INVOICE',
    docLabel: 'Invoice No.',
    dueDateLabel: 'Due Date',
  },
  bill: {
    title: 'INVOICE / BILL',
    docLabel: 'Bill No.',
    dueDateLabel: 'Payment Due',
  },
  quotation: {
    title: 'QUOTATION',
    docLabel: 'Quote No.',
    dueDateLabel: 'Valid Until',
  },
  chalan: {
    title: 'DELIVERY CHALAN',
    docLabel: 'Chalan No.',
    dueDateLabel: 'Delivery Date',
  },
}

export const CURRENCY = '৳'

function calcTotals(lineItems, taxRate, vatEnabled = false) {
  const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  const tax = subtotal * (parseFloat(taxRate) || 0) / 100
  const vat = vatEnabled ? parseFloat((subtotal * 0.10).toFixed(2)) : 0
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax:      parseFloat(tax.toFixed(2)),
    vat:      parseFloat(vat.toFixed(2)),
    grandTotal: parseFloat((subtotal + tax + vat).toFixed(2)),
  }
}

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

let _nid = 2
function newId() { return _nid++ }

export const useDocumentStore = create((set, get) => ({
  // ── Document type ──
  docType: 'invoice',
  showDocTypeModal: true,

  // ── Form data ──
  clientInfo: { name: '', address: '', contact: '', email: '' },

  metadata: {
    invoiceNumber: '',
    date: todayStr(),
    dueDate: '',
  },

  lineItems: [
    { id: 1, description: '', quantity: 1, rate: 0, amount: 0 },
  ],

  taxRate: 0,
  vatEnabled: false,
  totals: { subtotal: 0, tax: 0, vat: 0, grandTotal: 0 },
  notes: '',
  termsConditions: '',
  dueBalance: '',
  advanceAmount: '',

  // ── Actions ──
  setDocType: (docType) => set({ docType, showDocTypeModal: false }),
  setShowDocTypeModal: (v) => set({ showDocTypeModal: v }),

  setClientInfo: (field, value) =>
    set(s => ({ clientInfo: { ...s.clientInfo, [field]: value } })),

  setMetadata: (field, value) =>
    set(s => ({ metadata: { ...s.metadata, [field]: value } })),

  setNotes: (notes) => set({ notes }),
  setTermsConditions: (termsConditions) => set({ termsConditions }),
  setDueBalance: (dueBalance) => set({ dueBalance }),
  setAdvanceAmount: (advanceAmount) => set({ advanceAmount }),

  setTaxRate: (taxRate) =>
    set(s => ({ taxRate, totals: calcTotals(s.lineItems, taxRate, s.vatEnabled) })),

  setVatEnabled: (vatEnabled) =>
    set(s => ({ vatEnabled, totals: calcTotals(s.lineItems, s.taxRate, vatEnabled) })),

  addLineItem: () =>
    set(s => {
      const lineItems = [...s.lineItems, { id: newId(), description: '', quantity: 1, rate: 0, amount: 0 }]
      return { lineItems, totals: calcTotals(lineItems, s.taxRate, s.vatEnabled) }
    }),

  removeLineItem: (id) =>
    set(s => {
      const lineItems = s.lineItems.filter(i => i.id !== id)
      return { lineItems, totals: calcTotals(lineItems, s.taxRate, s.vatEnabled) }
    }),

  updateLineItem: (id, field, value) =>
    set(s => {
      const lineItems = s.lineItems.map(item => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        const q = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(item.quantity) || 0
        const r = field === 'rate'     ? parseFloat(value) || 0 : parseFloat(item.rate)     || 0
        updated.amount = parseFloat((q * r).toFixed(2))
        return updated
      })
      return { lineItems, totals: calcTotals(lineItems, s.taxRate, s.vatEnabled) }
    }),

  loadDocument: (data) => {
    const lineItems = data.lineItems || [{ id: 1, description: '', quantity: 1, rate: 0, amount: 0 }]
    const taxRate   = data.taxRate ?? 0
    _nid = Math.max(_nid, ...lineItems.map(i => (i.id || 0) + 1), 2)
    set({
      docType:        data.docType      || 'invoice',
      showDocTypeModal: false,
      clientInfo:     data.clientInfo   || { name: '', address: '', contact: '' },
      metadata:       data.metadata     || { invoiceNumber: '', date: todayStr(), dueDate: '' },
      lineItems,
      taxRate,
      vatEnabled:     data.vatEnabled ?? false,
      totals:         calcTotals(lineItems, taxRate, data.vatEnabled ?? false),
      notes:           data.notes           || '',
      termsConditions: data.termsConditions || '',
      dueBalance:      data.dueBalance      || '',
      advanceAmount:   data.advanceAmount   || '',
    })
  },

  getDocumentData: () => {
    const s = get()
    return {
      docType:    s.docType,
      clientInfo: s.clientInfo,
      metadata:   s.metadata,
      lineItems:  s.lineItems,
      taxRate:    s.taxRate,
      vatEnabled: s.vatEnabled,
      totals:     s.totals,
      notes:           s.notes,
      termsConditions: s.termsConditions,
      dueBalance:      s.dueBalance,
      advanceAmount:   s.advanceAmount,
    }
  },

  resetDocument: () => {
    _nid = 2
    set({
      docType:          'invoice',
      showDocTypeModal: true,
      clientInfo:       { name: '', address: '', contact: '' },
      metadata:         { invoiceNumber: '', date: todayStr(), dueDate: '' },
      lineItems:        [{ id: 1, description: '', quantity: 1, rate: 0, amount: 0 }],
      taxRate:          0,
      vatEnabled:       false,
      totals:           { subtotal: 0, tax: 0, vat: 0, grandTotal: 0 },
      notes:            '',
      termsConditions:  '',
      dueBalance:       '',
      advanceAmount:    '',
    })
  },
}))
