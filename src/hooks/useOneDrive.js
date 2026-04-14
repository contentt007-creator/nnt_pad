import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { msLoginRequest, OD_FOLDER } from '../auth/msalConfig'
import { saveToOneDrive, listOneDriveFiles, loadFromOneDrive } from '../lib/onedriveApi'
import { useEditorStore } from '../store/editorStore'
import { useDocumentStore, DOC_CONFIG } from '../store/documentStore'

export function useOneDrive() {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const showToast     = useEditorStore(s => s.showToast)
  const getDocData    = useDocumentStore(s => s.getDocumentData)
  const loadDocument  = useDocumentStore(s => s.loadDocument)
  const docType       = useDocumentStore(s => s.docType)
  const metadata      = useDocumentStore(s => s.metadata)

  /** Get a fresh access token silently */
  async function getToken() {
    if (!isAuthenticated || !accounts[0]) return null
    try {
      const result = await instance.acquireTokenSilent({
        ...msLoginRequest,
        account: accounts[0],
      })
      return result.accessToken
    } catch {
      // Silent failed — try popup
      const result = await instance.acquireTokenPopup(msLoginRequest)
      return result.accessToken
    }
  }

  async function save() {
    if (!isAuthenticated) { showToast('Sign in with Microsoft first'); return }
    try {
      showToast('Saving to OneDrive…', 6000)
      const token    = await getToken()
      const data     = getDocData()
      const cfg      = DOC_CONFIG[docType] || DOC_CONFIG.invoice
      const docNum   = metadata.invoiceNumber ? `_${metadata.invoiceNumber}` : ''
      const date     = (metadata.date || '').replace(/-/g, '')
      const filename = `${cfg.title.replace(/\s*\/\s*/g, '-').replace(/\s/g, '_')}${docNum}_${date}.json`
      const folder   = OD_FOLDER[docType] || 'NNT Documents'

      await saveToOneDrive(token, folder, filename, data)
      showToast(`Saved to OneDrive → ${folder} ✓`)
    } catch (err) {
      showToast('OneDrive save failed: ' + err.message)
    }
  }

  async function list(docTypeOverride) {
    if (!isAuthenticated) return []
    try {
      const token  = await getToken()
      const folder = OD_FOLDER[docTypeOverride || docType] || 'NNT Documents'
      return await listOneDriveFiles(token, folder)
    } catch {
      return []
    }
  }

  async function load(itemId) {
    if (!isAuthenticated) { showToast('Sign in with Microsoft first'); return }
    try {
      showToast('Loading from OneDrive…', 4000)
      const token = await getToken()
      const data  = await loadFromOneDrive(token, itemId)
      loadDocument(data)
      showToast('Loaded from OneDrive ✓')
    } catch (err) {
      showToast('OneDrive load failed: ' + err.message)
    }
  }

  return { save, list, load, isAuthenticated }
}
