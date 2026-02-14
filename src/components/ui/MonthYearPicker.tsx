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

const MONTH_ABBRS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_FULL: Record<string, string> = {
  january:'Jan',february:'Feb',march:'Mar',april:'Apr',may:'May',june:'Jun',
  july:'Jul',august:'Aug',september:'Sep',october:'Oct',november:'Nov',december:'Dec',
}

function parseMonthYear(value: string): { month: string; year: string } {
  if (!value) return { month: '', year: '' }
  const v = value.trim()

  // "Jan 2023" or "January 2023"
  const parts = v.split(/\s+/)
  if (parts.length === 2) {
    const mAbbr = MONTH_ABBRS.find(m => m === parts[0])
      ?? MONTH_FULL[parts[0].toLowerCase()]
    const yMatch = parts[1].match(/^(\d{4})$/)
    if (mAbbr && yMatch) return { month: mAbbr, year: yMatch[1] }
    // "2023 Jan" reversed
    const yFirst = parts[0].match(/^(\d{4})$/)
    const mSecond = MONTH_ABBRS.find(m => m === parts[1]) ?? MONTH_FULL[parts[1].toLowerCase()]
    if (yFirst && mSecond) return { month: mSecond, year: yFirst[1] }
  }

  // "2023-03" or "2023-3"
  const isoMatch = v.match(/^(\d{4})-(\d{1,2})$/)
  if (isoMatch) {
    const mi = parseInt(isoMatch[2], 10)
    return { month: mi >= 1 && mi <= 12 ? MONTH_ABBRS[mi - 1] : '', year: isoMatch[1] }
  }

  // "03/2023" or "3/2023"
  const slashMatch = v.match(/^(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const mi = parseInt(slashMatch[1], 10)
    return { month: mi >= 1 && mi <= 12 ? MONTH_ABBRS[mi - 1] : '', year: slashMatch[2] }
  }

  // Year only: "2023"
  const yearOnly = v.match(/^(\d{4})$/)
  if (yearOnly) return { month: '', year: yearOnly[1] }

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
