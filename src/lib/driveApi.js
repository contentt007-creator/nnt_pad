const DRIVE_API  = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'
const NNT_MIME   = 'application/json'
const NNT_TAG    = 'NNT_Editor_'

/** List all NNT Editor files saved in Drive */
export async function listDriveFiles(accessToken) {
  const q = encodeURIComponent(`name contains '${NNT_TAG}' and mimeType='${NNT_MIME}' and trashed=false`)
  const res = await fetch(
    `${DRIVE_API}/files?q=${q}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) throw new Error('Failed to list Drive files')
  const data = await res.json()
  return data.files || []
}

/** Save (create or update) a document to Drive */
export async function saveToDrive(accessToken, fileId, docName, content) {
  const body = JSON.stringify(content)
  const name = `${NNT_TAG}${docName}_${new Date().toISOString().slice(0, 10)}.json`

  if (fileId) {
    // Update existing file content
    const res = await fetch(
      `${UPLOAD_API}/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': NNT_MIME,
        },
        body,
      }
    )
    if (!res.ok) throw new Error('Failed to update Drive file')
    return fileId
  }

  // Create new file: metadata first, then upload content
  const metaRes = await fetch(`${DRIVE_API}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, mimeType: NNT_MIME }),
  })
  if (!metaRes.ok) throw new Error('Failed to create Drive file')
  const { id } = await metaRes.json()

  const uploadRes = await fetch(
    `${UPLOAD_API}/files/${id}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': NNT_MIME,
      },
      body,
    }
  )
  if (!uploadRes.ok) throw new Error('Failed to upload Drive file content')
  return id
}

/** Load a document from Drive */
export async function loadFromDrive(accessToken, fileId) {
  const res = await fetch(
    `${DRIVE_API}/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) throw new Error('Failed to load Drive file')
  return res.json()
}

/** Delete a file from Drive */
export async function deleteDriveFile(accessToken, fileId) {
  const res = await fetch(`${DRIVE_API}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to delete Drive file')
}
