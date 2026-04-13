import { useState, useEffect } from 'react'
import { useEditorStore } from './store/editorStore'
import { useHistory } from './hooks/useHistory'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import Canvas from './components/Canvas'
import RightPanel from './components/RightPanel'
import ContextMenu from './components/ContextMenu'
import Toast from './components/Toast'

export default function App() {
  const [panelOpen, setPanelOpen] = useState(false)
  const saveHistory = useEditorStore(s => s.saveHistory)

  // Attach keyboard shortcuts
  useHistory()

  // Seed history on first mount
  useEffect(() => {
    saveHistory()
  }, []) // eslint-disable-line

  return (
    <div className="flex flex-col h-screen min-h-screen font-sans text-[13px] text-gray-900 bg-bg select-none">
      <Header onTogglePanel={() => setPanelOpen(o => !o)} />
      <Toolbar />

      <div className="flex flex-1 overflow-hidden relative">
        <Canvas />

        {/* Mobile overlay */}
        {panelOpen && (
          <div
            className="fixed inset-0 bg-black/35 z-[199] sm:hidden touch-none"
            onClick={() => setPanelOpen(false)}
          />
        )}

        <RightPanel isOpen={panelOpen} />
      </div>

      <ContextMenu />
      <Toast />
    </div>
  )
}
