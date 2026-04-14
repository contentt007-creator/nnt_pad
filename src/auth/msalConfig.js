/**
 * Microsoft Azure App Registration config.
 * Replace VITE_MS_CLIENT_ID in your .env with the Application (client) ID
 * from portal.azure.com → App registrations → your app → Overview.
 *
 * Redirect URI to register in Azure:
 *   Development : http://localhost:5173
 *   Production  : https://your-deployed-url.vercel.app
 *
 * Required API permissions (Microsoft Graph, Delegated):
 *   Files.ReadWrite  — to upload files to OneDrive
 *   User.Read        — to read the signed-in user's profile
 */

const CLIENT_ID = import.meta.env.VITE_MS_CLIENT_ID || 'YOUR_AZURE_CLIENT_ID_HERE'

export const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

export const msLoginRequest = {
  scopes: ['User.Read', 'Files.ReadWrite'],
}

// Target OneDrive folder path (relative to the user's drive root)
// Invoices go here; Bills and Quotations will use the same root for now
// (subfolders are created automatically on first upload)
export const OD_FOLDER = {
  invoice:   'NNT Documents/Invoices',
  bill:      'NNT Documents/Bills',
  quotation: 'NNT Documents/Quotations',
}
