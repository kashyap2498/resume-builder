import { z } from 'zod'

export const languageEntrySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Language name is required'),
  proficiency: z.enum(['native', 'fluent', 'advanced', 'intermediate', 'beginner']),
})

export const languagesSchema = z.array(languageEntrySchema)
