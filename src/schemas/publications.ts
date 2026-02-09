import { z } from 'zod'

export const publicationEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Publication title is required'),
  publisher: z.string(),
  date: z.string(),
  url: z.string().url('Invalid URL').or(z.literal('')),
  description: z.string(),
})

export const publicationsSchema = z.array(publicationEntrySchema)
