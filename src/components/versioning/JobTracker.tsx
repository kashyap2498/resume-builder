import { useState, useEffect } from 'react'
import { Briefcase, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { useJobStore } from '@/store/jobStore'
import { useResumeStore } from '@/store/resumeStore'
import type { JobApplicationStatus } from '@/types/versioning'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

const STATUS_VARIANT: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  draft: 'gray',
  applied: 'blue',
  interview: 'yellow',
  offer: 'green',
  rejected: 'red',
}

export function JobTracker() {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const currentResume = useResumeStore((s) => s.currentResume)
  const { jobs, loadJobs, addJob, updateJob, removeJob } = useJobStore()

  useEffect(() => {
    if (currentResume?.id) {
      loadJobs(currentResume.id)
    }
  }, [currentResume?.id, loadJobs])

  const handleAdd = async () => {
    if (!currentResume || !company.trim()) return
    await addJob({
      resumeId: currentResume.id,
      company: company.trim(),
      role: role.trim(),
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'draft',
      notes: '',
    })
    setCompany('')
    setRole('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Job Applications</h2>
      </div>

      <div className="space-y-2">
        <Input placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} />
        <Input placeholder="Role / Position" value={role} onChange={(e) => setRole(e.target.value)} />
        <Button size="sm" fullWidth onClick={handleAdd} icon={<Plus className="h-4 w-4" />}>
          Add Application
        </Button>
      </div>

      <div className="space-y-2">
        {jobs.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No job applications tracked yet.</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="rounded-lg border border-gray-200 bg-white p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{job.company}</p>
                  <p className="text-xs text-gray-500">{job.role}</p>
                </div>
                <button
                  onClick={() => removeJob(job.id)}
                  className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  options={STATUS_OPTIONS}
                  value={job.status}
                  onChange={(e) => updateJob(job.id, { status: e.target.value as JobApplicationStatus })}
                  className="!py-1 !text-xs"
                />
                <Badge variant={STATUS_VARIANT[job.status] || 'gray'} size="sm">
                  {job.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">{job.dateApplied}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
