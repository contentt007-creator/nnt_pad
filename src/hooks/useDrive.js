import { useEditorStore } from '../store/editorStore'
import { saveToDrive, loadFromDrive, listDriveFiles } from '../lib/driveApi'
import { DOC_TITLES } from '../store/editorStore'

export function useDrive() {
  const accessToken    = useEditorStore(s => s.accessToken)
  const driveFileId    = useEditorStore(s => s.driveFileId)
  const doc            = useEditorStore(s => s.doc)
  const setDriveFileId = useEditorStore(s => s.setDriveFileId)
  const setDriveSaving = useEditorStore(s => s.setDriveSaving)
  const getState       = useEditorStore(s => s.getSerializableState)
  const loadState      = useEditorStore(s => s.loadState)
  const showToast      = useEditorStore(s => s.showToast)

  async function save() {
    if (!accessToken) { showToast('Sign in with Google first'); return }
    try {
      setDriveSaving(true)
      const data = getState()
      const name = DOC_TITLES[doc] || 'Document'
      const id = await saveToDrive(accessToken, driveFileId, name, data)
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
      loadState(data)
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
