import { useState, useEffect } from 'react'
import { Clock, RotateCcw, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useVersionStore } from '@/store/versionStore'
import { useResumeStore } from '@/store/resumeStore'

export function VersionPanel() {
  const [label, setLabel] = useState('')
  const currentResume = useResumeStore((s) => s.currentResume)
  const setResume = useResumeStore((s) => s.setResume)
  const { versions, saveNewVersion, loadVersions, restoreVersion } = useVersionStore()

  useEffect(() => {
    if (currentResume?.id) {
      loadVersions(currentResume.id)
    }
  }, [currentResume?.id, loadVersions])

  const handleSave = async () => {
    if (!currentResume) return
    await saveNewVersion(currentResume.id, currentResume, label || `Version ${versions.length + 1}`)
    setLabel('')
  }

  const handleRestore = (version: typeof versions[0]) => {
    const restored = restoreVersion(version)
    setResume({ ...restored, updatedAt: new Date().toISOString() })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Versions</h2>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Version label..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="flex-1"
        />
        <Button size="sm" onClick={handleSave} icon={<Save className="h-4 w-4" />}>
          Save
        </Button>
      </div>

      <div className="space-y-2">
        {versions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No versions saved yet.</p>
        ) : (
          versions.map((version) => (
            <div key={version.id || version.createdAt} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{version.label}</p>
                <p className="text-xs text-gray-500">{new Date(version.createdAt).toLocaleString()}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRestore(version)}
                icon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Restore
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
