import { useState, useCallback } from 'react'
import type { ZodType } from 'zod'

export function useValidation<T>(schema: ZodType<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = useCallback(
    (value: unknown): boolean => {
      const result = schema.safeParse(value)
      if (result.success) {
        setErrors({})
        return true
      }
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path.join('.')
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      }
      setErrors(fieldErrors)
      return false
    },
    [schema],
  )

  const validateField = useCallback(
    (fieldName: string, value: unknown, fieldSchema: ZodType): string | undefined => {
      const result = fieldSchema.safeParse(value)
      if (result.success) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[fieldName]
          return next
        })
        return undefined
      }
      const message = result.error.issues[0]?.message ?? 'Invalid'
      setErrors((prev) => ({ ...prev, [fieldName]: message }))
      return message
    },
    [],
  )

  const getFieldError = useCallback(
    (field: string): string | undefined => errors[field],
    [errors],
  )

  const clearErrors = useCallback(() => setErrors({}), [])

  return { errors, validate, validateField, getFieldError, clearErrors }
}
