import { useEditorStore } from '../store/editorStore'

export default function Toast() {
  const toast = useEditorStore(s => s.toast)
  return (
    <div id="toast" className={toast ? 'show' : ''}>
      {toast}
    </div>
  )
}
