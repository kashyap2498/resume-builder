import { useState, useCallback } from 'react'
import type { ZodType } from 'zod'

export function useFieldValidation<T extends Record<string, unknown>>(
  schema: ZodType<T>,
  data: T,
) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())

  const validateField = useCallback((field: string) => {
    const result = schema.safeParse(data)
    if (!result.success) {
      const fieldError = result.error.issues.find(
        (issue) => issue.path[0] === field
      )
      setErrors((prev) => {
        const next = { ...prev }
        if (fieldError) next[field] = fieldError.message
        else delete next[field]
        return next
      })
    } else {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }, [schema, data])

  const onBlur = useCallback((field: string) => {
    setTouched((prev) => new Set(prev).add(field))
    validateField(field)
  }, [validateField])

  const getError = useCallback((field: string) => {
    return touched.has(field) ? errors[field] : undefined
  }, [errors, touched])

  return { onBlur, getError }
}
