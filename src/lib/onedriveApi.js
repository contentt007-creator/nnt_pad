/**
 * OneDrive (Microsoft Graph API) helpers
 * Docs: https://learn.microsoft.com/en-us/graph/api/driveitem-put-content
 */

const GRAPH = 'https://graph.microsoft.com/v1.0'

/** Ensure a folder path exists, creating any missing segments */
async function ensureFolder(token, folderPath) {
  const segments = folderPath.split('/')
  let parentPath = '/me/drive/root'

  for (const seg of segments) {
    const url = `${GRAPH}${parentPath}:/children`
    const checkUrl = `${GRAPH}${parentPath}:/${encodeURIComponent(seg)}`

    // Try to get the folder
    const checkRes = await fetch(checkUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (checkRes.ok) {
      parentPath = `${parentPath}:/${encodeURIComponent(seg)}`
      continue
    }

    // Doesn't exist — create it
    const createRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: seg,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      }),
    })
    if (!createRes.ok) {
      const err = await createRes.json()
      throw new Error(err.error?.message || 'Failed to create folder')
    }
    parentPath = `${parentPath}:/${encodeURIComponent(seg)}`
  }
}

/**
 * Upload a JSON document to OneDrive.
 * @param {string}  token       - MSAL access token
 * @param {string}  folderPath  - e.g. "NNT Documents/Invoices"
 * @param {string}  filename    - e.g. "Invoice_INV-001.json"
 * @param {object}  data        - document data object
 * @returns {string} driveItemId
 */
export async function saveToOneDrive(token, folderPath, filename, data) {
  await ensureFolder(token, folderPath)

  const content = JSON.stringify(data, null, 2)
  const uploadUrl = `${GRAPH}/me/drive/root:/${folderPath}/${filename}:/content`

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: content,
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'OneDrive upload failed')
  }

  const item = await res.json()
  return item.id
}

/**
 * List NNT JSON files in a given folder.
 */
export async function listOneDriveFiles(token, folderPath) {
  const url = `${GRAPH}/me/drive/root:/${folderPath}:/children?$select=id,name,lastModifiedDateTime&$orderby=lastModifiedDateTime desc`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  const json = await res.json()
  return (json.value || []).filter(f => f.name.endsWith('.json'))
}

/**
 * Download a file's content by its drive item id.
 */
export async function loadFromOneDrive(token, itemId) {
  const res = await fetch(`${GRAPH}/me/drive/items/${itemId}/content`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to load file from OneDrive')
  return res.json()
}
