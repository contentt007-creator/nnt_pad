import { useEditorStore } from '../store/editorStore'
import { useDocumentStore, DOC_CONFIG } from '../store/documentStore'
import { saveToDrive, loadFromDrive, listDriveFiles } from '../lib/driveApi'

export function useDrive() {
  const accessToken    = useEditorStore(s => s.accessToken)
  const driveFileId    = useEditorStore(s => s.driveFileId)
  const setDriveFileId = useEditorStore(s => s.setDriveFileId)
  const setDriveSaving = useEditorStore(s => s.setDriveSaving)
  const showToast      = useEditorStore(s => s.showToast)

  const getDocumentData = useDocumentStore(s => s.getDocumentData)
  const loadDocument    = useDocumentStore(s => s.loadDocument)

  async function save() {
    if (!accessToken) { showToast('Sign in with Google first'); return }
    try {
      setDriveSaving(true)
      const data    = getDocumentData()
      const cfg     = DOC_CONFIG[data.docType] || DOC_CONFIG.invoice
      const docNum  = data.metadata?.invoiceNumber ? `_${data.metadata.invoiceNumber}` : ''
      const name    = `NNT_${cfg.title.replace(/\s*\/\s*/g, '-')}${docNum}`
      const id      = await saveToDrive(accessToken, driveFileId, name, data)
      setDriveFileId(id)
      showToast('Saved to Google Drive ✓')
    } catch (err) {
      showToast('Drive save failed: ' + err.message)
    } finally {
      setDriveSaving(false)
    }
  }

  async function load(fileId) {
    if (!accessToken) { showToast('Sign in with Google first'); return }
    try {
      setDriveSaving(true)
      const data = await loadFromDrive(accessToken, fileId)
      loadDocument(data)
      setDriveFileId(fileId)
      showToast('Loaded from Google Drive ✓')
    } catch (err) {
      showToast('Drive load failed: ' + err.message)
    } finally {
      setDriveSaving(false)
    }
  }

  async function list() {
    if (!accessToken) return []
    try {
      return await listDriveFiles(accessToken)
    } catch {
      return []
    }
  }

  return { save, load, list }
}
