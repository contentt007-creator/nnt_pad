import { useHistory } from './hooks/useHistory'
import Header from './components/Header'
import FormPanel from './components/FormPanel'
import DocumentPreview from './components/DocumentPreview'
import DocTypeModal from './components/DocTypeModal'
import Toast from './components/Toast'

export default function App() {
  // Attach keyboard shortcuts (zoom in/out)
  useHistory()

  return (
    <div className="flex flex-col h-screen min-h-screen font-sans text-[13px] text-gray-900 bg-bg select-none">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <FormPanel />
        <DocumentPreview />
      </div>

      <DocTypeModal />
      <Toast />
    </div>
  )
}
