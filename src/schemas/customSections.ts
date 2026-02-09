import { z } from 'zod'

export const customSectionEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  date: z.string(),
  description: z.string(),
  highlights: z.array(z.string()),
})

export const customSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Section title is required'),
  entries: z.array(customSectionEntrySchema),
})

export const customSectionsSchema = z.array(customSectionSchema)
