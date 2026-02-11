import { useCallback, useMemo } from 'react'
import { Select } from './Select'
import { cn } from '../../utils/cn'

export interface MonthYearPickerProps {
  label?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  hint?: string
  error?: string
  wrapperClassName?: string
}

const MONTHS = [
  { value: '', label: '\u2014' },
  { value: 'Jan', label: 'Jan' }, { value: 'Feb', label: 'Feb' },
  { value: 'Mar', label: 'Mar' }, { value: 'Apr', label: 'Apr' },
  { value: 'May', label: 'May' }, { value: 'Jun', label: 'Jun' },
  { value: 'Jul', label: 'Jul' }, { value: 'Aug', label: 'Aug' },
  { value: 'Sep', label: 'Sep' }, { value: 'Oct', label: 'Oct' },
  { value: 'Nov', label: 'Nov' }, { value: 'Dec', label: 'Dec' },
]

const YEARS = (() => {
  const opts = [{ value: '', label: '\u2014' }]
  for (let y = 2030; y >= 1970; y--)
    opts.push({ value: String(y), label: String(y) })
  return opts
})()

function parseMonthYear(value: string): { month: string; year: string } {
  if (!value) return { month: '', year: '' }
  const parts = value.trim().split(/\s+/)
  if (parts.length === 2 && MONTHS.some(m => m.value === parts[0]))
    return { month: parts[0], year: parts[1] }
  return { month: '', year: '' }
}

export function MonthYearPicker({ label, value, onChange, disabled, hint, error, wrapperClassName }: MonthYearPickerProps) {
  const { month, year } = useMemo(() => parseMonthYear(value), [value])

  const handleMonth = useCallback((m: string) => {
    onChange(m && year ? `${m} ${year}` : m || year || '')
  }, [year, onChange])

  const handleYear = useCallback((y: string) => {
    onChange(month && y ? `${month} ${y}` : month || y || '')
  }, [month, onChange])

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && <label className="text-sm font-medium text-gray-700 select-none">{label}</label>}
      <div className="flex gap-2">
        <Select value={month} onChange={e => handleMonth(e.target.value)}
          options={MONTHS} disabled={disabled} wrapperClassName="flex-1"
          aria-label={label ? `${label} month` : 'Month'} />
        <Select value={year} onChange={e => handleYear(e.target.value)}
          options={YEARS} disabled={disabled} wrapperClassName="flex-1"
          aria-label={label ? `${label} year` : 'Year'} />
      </div>
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
      {!error && hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
